/**
 * POST /api/tests/attempts/save
 *
 * Auto-save answers during a test session. The test runner calls this every
 * 30 seconds. `attemptId` is the same as `testId` — the UI sends the test's
 * UUID returned by GET /api/tests/[testId] as `existingAttempt.id`.
 */

import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

interface SavePayload {
  attemptId: string;
  answers: {
    questionId: string;
    selectedAnswer: string | null;
    isMarkedForReview: boolean;
  }[];
}

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

    const body: SavePayload = await request.json();
    const { attemptId, answers } = body;

    if (!attemptId || !Array.isArray(answers)) {
      return NextResponse.json({ error: 'attemptId and answers are required' }, { status: 400 });
    }

    // Verify this test belongs to the current user and is still in-progress
    const { data: test, error: testError } = await supabase
      .from('tests')
      .select('id, status')
      .eq('id', attemptId)
      .eq('user_id', session.user.id)
      .single();

    if (testError || !test) {
      return NextResponse.json({ error: 'Test not found' }, { status: 404 });
    }

    if (test.status !== 'in_progress') {
      return NextResponse.json({ error: 'Test already submitted' }, { status: 400 });
    }

    // Bulk-update answers (fire in parallel for speed)
    await Promise.all(
      answers.map((a) =>
        supabase
          .from('test_attempt_questions')
          .update({
            user_answer: a.selectedAnswer,
            is_marked_for_review: a.isMarkedForReview ?? false,
          })
          .eq('test_id', attemptId)
          .eq('question_id', a.questionId),
      ),
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Save answers error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
