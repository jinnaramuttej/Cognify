import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

/**
 * GET /api/tests/[testId]
 * Loads a test with its questions for the test runner.
 * Strips correct_option so the client cannot cheat.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ testId: string }> }
) {
  try {
    const { testId } = await params;
    const supabase = createRouteHandlerClient({ cookies });

    const {
      data: { session },
      error: authError,
    } = await supabase.auth.getSession();

    if (authError || !session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Load test
    const { data: test, error: testError } = await supabase
      .from('tests')
      .select('*')
      .eq('id', testId)
      .eq('user_id', session.user.id)
      .single();

    if (testError || !test) {
      return NextResponse.json({ error: 'Test not found' }, { status: 404 });
    }

    // Load questions (without correct_option)
    const { data: attemptQuestions, error: qError } = await supabase
      .from('test_attempt_questions')
      .select(
        `
        id,
        order_index,
        user_answer,
        is_marked_for_review,
        time_spent_seconds,
        questions (
          id,
          question_text,
          options,
          question_type,
          difficulty,
          marks,
          negative_marks,
          is_pyq,
          year,
          shift,
          topic_id,
          topics ( name, chapter_id, chapters ( name, subject_id, subjects ( name ) ) )
        )
      `
      )
      .eq('test_id', testId)
      .order('order_index');

    if (qError) {
      console.error('Question load error:', qError);
      return NextResponse.json({ error: 'Failed to load questions' }, { status: 500 });
    }

    // Transform for client
    const questions = (attemptQuestions || []).map((aq: Record<string, any>) => ({
      attemptId: aq.id,
      orderIndex: aq.order_index,
      userAnswer: aq.user_answer,
      isMarkedForReview: aq.is_marked_for_review,
      timeSpentSeconds: aq.time_spent_seconds,
      ...(aq.questions as Record<string, any>),
    }));

    return NextResponse.json({
      success: true,
      test: {
        id: test.id,
        title: test.title,
        status: test.status,
        totalQuestions: test.total_questions,
        durationMinutes: test.duration_minutes,
        timeLimit: test.duration_minutes,        // UI uses data.test.timeLimit
        config: test.config,
        timeSpentSeconds: test.time_spent_seconds,
      },
      questions,
      existingAttempt: { id: testId },           // UI uses attemptId for save/submit calls
    });
  } catch (error) {
    console.error('Load test error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

