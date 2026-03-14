/**
 * POST /api/tests/answer
 *
 * Saves a student's answer for a single question during an active test.
 * Also updates the time spent on the question.
 */

import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

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

    const { testId, questionId, userAnswer, timeSpentSeconds, isMarkedForReview } = await request.json();

    if (!testId || !questionId) {
      return NextResponse.json({ error: 'testId and questionId are required' }, { status: 400 });
    }

    // Verify test ownership
    const { data: test } = await supabase
      .from('tests')
      .select('id, status, user_id')
      .eq('id', testId)
      .eq('user_id', session.user.id)
      .single();

    if (!test) {
      return NextResponse.json({ error: 'Test not found' }, { status: 404 });
    }

    if (test.status !== 'in_progress') {
      return NextResponse.json({ error: 'Test already submitted' }, { status: 400 });
    }

    // Update the answer
    const updateData: Record<string, unknown> = {};
    if (userAnswer !== undefined) updateData.user_answer = userAnswer;
    if (timeSpentSeconds !== undefined) updateData.time_spent_seconds = timeSpentSeconds;
    if (isMarkedForReview !== undefined) updateData.is_marked_for_review = isMarkedForReview;

    const { error: updateError } = await supabase
      .from('test_attempt_questions')
      .update(updateData)
      .eq('test_id', testId)
      .eq('question_id', questionId);

    if (updateError) {
      console.error('Answer save error:', updateError);
      return NextResponse.json({ error: 'Failed to save answer' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Save answer error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
