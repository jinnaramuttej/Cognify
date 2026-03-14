/**
 * POST /api/tests/[testId]/save-progress
 *
 * Contract-specified RESTful form for saving in-progress answers.
 * Delegates to the same logic as POST /api/tests/attempts/save.
 *
 * Body: { answers: [{questionId, selectedAnswer, isMarkedForReview}] }
 */

import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export async function POST(
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

    const body = await request.json();
    const answers = body.answers ?? [];

    if (!Array.isArray(answers)) {
      return NextResponse.json({ error: 'answers array is required' }, { status: 400 });
    }

    // Verify ownership and in-progress status
    const { data: test, error: testError } = await supabase
      .from('tests')
      .select('id, status')
      .eq('id', testId)
      .eq('user_id', session.user.id)
      .single();

    if (testError || !test) {
      return NextResponse.json({ error: 'Test not found' }, { status: 404 });
    }

    if (test.status !== 'in_progress') {
      return NextResponse.json({ error: 'Test already submitted' }, { status: 400 });
    }

    // Bulk update answers
    await Promise.all(
      answers.map((a: { questionId: string; selectedAnswer: string | null; isMarkedForReview?: boolean }) =>
        supabase
          .from('test_attempt_questions')
          .update({
            user_answer: a.selectedAnswer,
            is_marked_for_review: a.isMarkedForReview ?? false,
          })
          .eq('test_id', testId)
          .eq('question_id', a.questionId),
      ),
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[testId]/save-progress error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
