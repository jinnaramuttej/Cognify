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

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB
const SUPPORTED_FORMATS = ['application/pdf', 'image/png', 'image/jpeg', 'image/jpg'];

// ──────────────────────────────────────────────
// PDF text extraction (server-side)
// ──────────────────────────────────────────────

async function extractTextFromPdf(buffer: Buffer): Promise<string> {
  try {
    // pdf-parse is available in package.json
    const pdfParse = (await import('pdf-parse')).default;
    const result = await pdfParse(buffer);
    return result.text ?? '';
  } catch {
    return '';
  }
}

// ──────────────────────────────────────────────
// Groq AI question extraction
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
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) return [];

  const truncated = text.length > 8000 ? text.slice(0, 8000) + '\n[text truncated]' : text;

  try {
    const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [
          { role: 'system', content: EXTRACT_SYSTEM_PROMPT },
          { role: 'user', content: `Extract questions from this text:\n\n${truncated}` },
        ],
        temperature: 0.1,
        max_tokens: 6000,
      }),
    });

    if (!res.ok) return [];

    const data = await res.json();
    const content: string = data?.choices?.[0]?.message?.content ?? '';

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
        // For images: use Groq vision
        const base64 = buffer.toString('base64');
        const apiKey = process.env.GROQ_API_KEY;
        if (apiKey) {
          try {
            const visionRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${apiKey}`,
              },
              body: JSON.stringify({
                model: 'meta-llama/llama-4-scout-17b-16e-instruct',
                messages: [
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
                ],
              }),
            });
            if (visionRes.ok) {
              const visionData = await visionRes.json();
              extractedText = visionData?.choices?.[0]?.message?.content ?? '';
            }
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


const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const SUPPORTED_FORMATS = ['application/pdf', 'image/png', 'image/jpeg', 'image/jpg'];

export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    
    // 1. Verify authentication
    const { data: { session }, error: authError } = await supabase.auth.getSession();
    if (authError || !session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 2. Verify teacher or admin role
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', session.user.id)
      .single();
    
    if (!profile || (profile.role !== 'teacher' && profile.role !== 'admin')) {
      return NextResponse.json({ error: 'Access denied. Teachers only.' }, { status: 403 });
    }

    // 3. Rate limiting
    const rateLimitResult = checkRateLimit(session.user.id, RATE_LIMITS.QUESTION_UPLOAD);
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { 
          error: 'Rate limit exceeded. Please try again later.',
          resetAt: rateLimitResult.resetAt,
        },
        { status: 429 }
      );
    }

    // 4. Parse form data
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const exam = formData.get('exam') as string;
    const subject = formData.get('subject') as string;
    const year = formData.get('year') as string;
    const shift = formData.get('shift') as string;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // 5. Validate file
    if (!SUPPORTED_FORMATS.includes(file.type)) {
      return NextResponse.json(
        { error: 'Unsupported file format. Please upload PDF or images.' },
        { status: 400 }
      );
    }

    const sizeValidation = validateFileSize(file);
    if (!sizeValidation.valid) {
      return NextResponse.json({ error: sizeValidation.error }, { status: 400 });
    }

    // 6. Check if AI keys are configured
    const hasGroqKey = !!process.env.GROQ_API_KEY;
    const hasGeminiKey = !!process.env.GEMINI_API_KEY;
    
    if (!hasGroqKey && !hasGeminiKey) {
      return NextResponse.json({
        error: 'AI service not configured. Please configure GROQ_API_KEY or GEMINI_API_KEY in environment variables.',
        needsConfiguration: true,
      }, { status: 503 });
    }

    // 7. For now, return a preview/upload confirmation
    // In production, this would process the PDF using the ingestion pipeline
    const uploadId = crypto.randomUUID();
    
    // Store file metadata (you would upload to Supabase Storage here)
    const { data: upload, error: uploadError } = await supabase
      .from('uploads')
      .insert({
        owner: session.user.id,
        bucket: 'question-uploads',
        path: `${session.user.id}/${uploadId}_${file.name}`,
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
      .select()
      .single();

    if (uploadError) {
      console.error('Upload error:', uploadError);
      return NextResponse.json({ error: 'Failed to process upload' }, { status: 500 });
    }

    // 8. Return preview mode response
    // In production, you would trigger the ingestion pipeline here
    return NextResponse.json({
      success: true,
      uploadId: upload.id,
      fileName: file.name,
      fileSize: file.size,
      status: 'uploaded',
      message: 'File uploaded successfully. Question extraction pipeline coming soon.',
      preview: {
        exam,
        subject,
        year,
        shift,
        estimatedQuestions: Math.floor(Math.random() * 50) + 10, // Mock
      },
      note: 'This is a placeholder. The full ingestion pipeline will extract questions using OCR + AI parsing.',
    });

  } catch (error) {
    console.error('Question ingestion error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/teacher/questions/ingest
 * 
 * Get upload history
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    
    const { data: { session }, error: authError } = await supabase.auth.getSession();
    if (authError || !session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify teacher or admin role
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', session.user.id)
      .single();
    
    if (!profile || (profile.role !== 'teacher' && profile.role !== 'admin')) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // Get upload history
    const { data: uploads, error } = await supabase
      .from('uploads')
      .select('*')
      .eq('owner', session.user.id)
      .eq('bucket', 'question-uploads')
      .order('created_at', { ascending: false })
      .limit(20);

    if (error) {
      return NextResponse.json({ error: 'Failed to fetch uploads' }, { status: 500 });
    }

    return NextResponse.json({ uploads });

  } catch (error) {
    console.error('Get uploads error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
