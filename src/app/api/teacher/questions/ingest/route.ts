/**
 * Question Ingestion API Route
 *
 * POST /api/teacher/questions/ingest
 *
 * Accepts PDF or image upload, extracts text, calls Groq to parse questions,
 * and returns a structured preview. Questions are NOT auto-inserted — the teacher
 * confirms via POST /api/teacher/questions/bank.
 *
 * GET /api/teacher/questions/ingest — returns upload history
 */

import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { checkRateLimit, RATE_LIMITS, validateFileSize } from '@/middleware/rate-limit';
import { callFeatherlessChat, getFeatherlessApiKey, getFeatherlessModel } from '@/lib/featherless';

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB
const SUPPORTED_FORMATS = ['application/pdf', 'image/png', 'image/jpeg', 'image/jpg'];

// ──────────────────────────────────────────────
// PDF text extraction (server-side)
// ──────────────────────────────────────────────

async function extractTextFromPdf(buffer: Buffer): Promise<string> {
  try {
    // Support both default and module-function export shapes across pdf-parse builds.
    const pdfParseModule = await import('pdf-parse');
    const moduleWithDefault = pdfParseModule as unknown as {
      default?: (input: Buffer) => Promise<{ text?: string }>;
    };
    const pdfParse =
      typeof moduleWithDefault.default === 'function'
        ? moduleWithDefault.default
        : (pdfParseModule as unknown as (input: Buffer) => Promise<{ text?: string }>);
    const result = await pdfParse(buffer);
    return result.text ?? '';
  } catch {
    return '';
  }
}

// ──────────────────────────────────────────────
// Featherless AI question extraction
// ──────────────────────────────────────────────

const EXTRACT_SYSTEM_PROMPT = `You are an expert at parsing competitive exam questions (JEE, NEET, BITSAT) from text.
Extract all questions and return them as a JSON array. Each question must have:
{
  "question_text": "Full question text",
  "options": [
    {"label": "A", "text": "Option A text"},
    {"label": "B", "text": "Option B text"},
    {"label": "C", "text": "Option C text"},
    {"label": "D", "text": "Option D text"}
  ],
  "correct_option": "A",
  "question_type": "single_correct",
  "difficulty": "Medium",
  "explanation": "Optional explanation if present",
  "is_pyq": false,
  "year": null
}

Rules:
- question_type must be one of: single_correct, multi_correct, integer, numerical
- difficulty must be one of: Easy, Medium, Hard
- correct_option must be A, B, C, or D
- If the correct answer is not given, set correct_option to null
- Return ONLY the JSON array, no other text.`;

async function extractQuestionsWithAI(text: string): Promise<any[]> {
  const apiKey = getFeatherlessApiKey();
  if (!apiKey) return [];

  const truncated = text.length > 8000 ? text.slice(0, 8000) + '\n[text truncated]' : text;

  try {
    const content = await callFeatherlessChat([
      { role: 'system', content: EXTRACT_SYSTEM_PROMPT },
      { role: 'user', content: `Extract questions from this text:\n\n${truncated}` },
    ], {
      model: getFeatherlessModel('meta-llama/Meta-Llama-3.1-8B-Instruct'),
      temperature: 0.1,
      max_tokens: 6000,
    });

    // Extract JSON array from response
    const match = content.match(/\[[\s\S]*\]/);
    if (!match) return [];

    const parsed = JSON.parse(match[0]);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

// ──────────────────────────────────────────────
// POST handler
// ──────────────────────────────────────────────

export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });

    const {
      data: { session },
      error: authError,
    } = await supabase.auth.getSession();
    if (authError || !session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify teacher/admin role
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', session.user.id)
      .single();

    if (!profile || (profile.role !== 'teacher' && profile.role !== 'admin')) {
      return NextResponse.json({ error: 'Access denied. Teachers only.' }, { status: 403 });
    }

    // Rate limiting
    const rateLimitResult = checkRateLimit(session.user.id, RATE_LIMITS.QUESTION_UPLOAD);
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: 'Rate limit exceeded. Please try again later.', resetAt: rateLimitResult.resetAt },
        { status: 429 }
      );
    }

    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const rawText = formData.get('text') as string | null; // Alternative: paste raw text
    const exam = formData.get('exam') as string;
    const subject = formData.get('subject') as string;
    const year = formData.get('year') as string;
    const shift = formData.get('shift') as string;

    let extractedText = '';
    let uploadId: string | null = null;

    if (file) {
      // Validate file
      if (!SUPPORTED_FORMATS.includes(file.type)) {
        return NextResponse.json(
          { error: 'Unsupported format. Upload PDF or image (PNG/JPEG).' },
          { status: 400 }
        );
      }

      const sizeValidation = validateFileSize(file);
      if (!sizeValidation.valid) {
        return NextResponse.json({ error: sizeValidation.error }, { status: 400 });
      }

      // Store file metadata in uploads table
      const { data: upload } = await supabase
        .from('uploads')
        .insert({
          owner: session.user.id,
          bucket: 'question-uploads',
          path: `${session.user.id}/${crypto.randomUUID()}_${file.name}`,
          metadata: {
            exam,
            subject,
            year: year ? parseInt(year) : null,
            shift,
            size: file.size,
            type: file.type,
            originalName: file.name,
          },
        })
        .select('id')
        .single();

      uploadId = upload?.id ?? null;

      // Extract text from file
      const buffer = Buffer.from(await file.arrayBuffer());

      if (file.type === 'application/pdf') {
        extractedText = await extractTextFromPdf(buffer);
      } else {
        // For images: use Featherless vision-compatible chat
        const base64 = buffer.toString('base64');
        const apiKey = getFeatherlessApiKey();
        if (apiKey) {
          try {
            extractedText = await callFeatherlessChat([
              {
                role: 'user',
                content: [
                  {
                    type: 'image_url',
                    image_url: { url: `data:${file.type};base64,${base64}` },
                  },
                  {
                    type: 'text',
                    text: 'Transcribe all text from this image exactly as it appears.',
                  },
                ],
              },
            ], {
              model: getFeatherlessModel('meta-llama/Llama-3.2-11B-Vision-Instruct'),
              temperature: 0,
              max_tokens: 4000,
            });
          } catch {
            extractedText = '';
          }
        }
      }
    } else if (rawText) {
      // Direct text input (teacher pastes question text)
      extractedText = rawText;
    } else {
      return NextResponse.json({ error: 'No file or text provided' }, { status: 400 });
    }

    if (!extractedText.trim()) {
      return NextResponse.json({
        success: false,
        uploadId,
        error: 'Could not extract text from the file. Try pasting the text directly.',
        extractedQuestions: [],
      });
    }

    // Use AI to parse questions from extracted text
    const extractedQuestions = await extractQuestionsWithAI(extractedText);

    return NextResponse.json({
      success: true,
      uploadId,
      fileName: file?.name ?? 'pasted-text',
      extractedText: extractedText.slice(0, 500) + (extractedText.length > 500 ? '...' : ''),
      extractedQuestions,
      questionCount: extractedQuestions.length,
      status: 'preview',
      message:
        extractedQuestions.length > 0
          ? `Extracted ${extractedQuestions.length} question(s). Review and confirm to add to question bank.`
          : 'No questions could be extracted automatically. Please add questions manually.',
    });
  } catch (error) {
    console.error('Question ingestion error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// ──────────────────────────────────────────────
// GET — upload history
// ──────────────────────────────────────────────

export async function GET(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });

    const {
      data: { session },
      error: authError,
    } = await supabase.auth.getSession();
    if (authError || !session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', session.user.id)
      .single();

    if (!profile || (profile.role !== 'teacher' && profile.role !== 'admin')) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    const { data: uploads, error } = await supabase
      .from('uploads')
      .select('id, path, metadata, created_at')
      .eq('owner', session.user.id)
      .eq('bucket', 'question-uploads')
      .order('created_at', { ascending: false })
      .limit(20);

    if (error) {
      return NextResponse.json({ error: 'Failed to fetch uploads' }, { status: 500 });
    }

    return NextResponse.json({ success: true, uploads: uploads ?? [] });
  } catch (error) {
    console.error('Get uploads error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
