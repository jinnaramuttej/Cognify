/**
 * Study Pack API Route
 * 
 * POST /api/notes-converter/generate
 * GET /api/notes-converter/history
 */

import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { checkRateLimit, RATE_LIMITS, validateTextLength } from '@/middleware/rate-limit';

interface GenerateRequest {
  inputText: string;
  conversions: string[]; // ['summary', 'flashcards', 'quiz', etc.]
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    
    // 1. Auth check
    const { data: { session }, error: authError } = await supabase.auth.getSession();
    if (authError || !session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 2. Rate limiting
    const rateLimitResult = checkRateLimit(session.user.id, RATE_LIMITS.AI_GENERATION);
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { 
          error: 'Rate limit exceeded. Maximum 20 requests per hour.',
          resetAt: rateLimitResult.resetAt,
          remaining: rateLimitResult.remaining,
        },
        { status: 429 }
      );
    }

    // 3. Parse request
    const body: GenerateRequest = await request.json();
    const { inputText, conversions } = body;

    if (!inputText) {
      return NextResponse.json({ error: 'Input text required' }, { status: 400 });
    }

    // 4. Validate text length
    const validation = validateTextLength(inputText);
    if (!validation.valid) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    // 5. Start processing
    const startTime = Date.now();
    
    // Create initial record
    const { data: studyPack, error: insertError } = await supabase
      .from('study_pack_generations')
      .insert({
        user_id: session.user.id,
        input_text: inputText.substring(0, 5000),
        character_count: inputText.length,
        status: 'processing',
      })
      .select()
      .single();

    if (insertError || !studyPack) {
      console.error('Insert error:', insertError);
      return NextResponse.json({ error: 'Failed to create study pack' }, { status: 500 });
    }

    // 6. Call AI for each requested conversion type in parallel
    const validConversions = ['summary', 'flashcards', 'questions', 'quiz', 'mindmap', 'formulas', 'keypoints'];
    const requestedConversions = (conversions && conversions.length > 0)
      ? conversions.filter((c: string) => validConversions.includes(c))
      : ['summary', 'flashcards', 'questions'];

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

    const results = await Promise.allSettled(
      requestedConversions.map((conversionType: string) =>
        fetch(`${baseUrl}/api/ai/notes-convert`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            input_text: inputText,
            conversion_type: conversionType,
            user_id: session.user.id,
          }),
        }).then(async (res) => {
          const json = await res.json();
          return { type: conversionType, data: json.result ?? null, demo: json.demo ?? false };
        })
      )
    );

    // Build update payload from results
    const updatePayload: Record<string, unknown> = {
      status: 'completed',
      processing_time_ms: Date.now() - startTime,
      updated_at: new Date().toISOString(),
    };
    const fieldMap: Record<string, string> = {
      summary: 'generated_summary',
      flashcards: 'generated_flashcards',
      questions: 'generated_questions',
      quiz: 'generated_quiz',
      mindmap: 'generated_mindmap',
      formulas: 'generated_formulas',
      keypoints: 'generated_keypoints',
    };

    let anyFailed = false;
    const conversionResults: Record<string, unknown> = {};

    results.forEach((result, i) => {
      const convType = requestedConversions[i];
      if (result.status === 'fulfilled' && result.value.data) {
        updatePayload[fieldMap[convType]] = result.value.data;
        conversionResults[convType] = result.value.data;
      } else {
        anyFailed = true;
      }
    });

    if (anyFailed && Object.keys(conversionResults).length === 0) {
      updatePayload.status = 'failed';
      updatePayload.error_message = 'All AI conversions failed';
    }

    // Update DB record with results
    await supabase
      .from('study_pack_generations')
      .update(updatePayload)
      .eq('id', studyPack.id);

    return NextResponse.json({
      success: true,
      studyPackId: studyPack.id,
      status: updatePayload.status,
      processingTimeMs: Date.now() - startTime,
      results: conversionResults,
    });

  } catch (error) {
    console.error('Generate study pack error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * GET /api/notes-converter/history
 * 
 * Get user's past study packs
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    
    const { data: { session }, error: authError } = await supabase.auth.getSession();
    if (authError || !session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: studyPacks, error } = await supabase
      .from('study_pack_generations')
      .select('id, created_at, character_count, status, generated_summary, generated_flashcards, generated_questions')
      .eq('user_id', session.user.id)
      .order('created_at', { ascending: false })
      .limit(20);

    if (error) {
      console.error('Fetch error:', error);
      return NextResponse.json({ error: 'Failed to fetch history' }, { status: 500 });
    }

    return NextResponse.json({ studyPacks });

  } catch (error) {
    console.error('Get history error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
