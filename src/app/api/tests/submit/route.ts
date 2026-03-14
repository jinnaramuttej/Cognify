/**
 * POST /api/tests/submit
 *
 * Submits a test. Algorithm:
 * 1. Load all attempt questions and their correct answers
 * 2. Calculate score with negative marking
 * 3. Mark each question is_correct
 * 4. Update the tests row (status=completed, score, time_spent)
 * 5. Trigger streak update
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

    const { testId, totalTimeSpentSeconds } = await request.json();

    if (!testId) {
      return NextResponse.json({ error: 'testId is required' }, { status: 400 });
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

    if (test.status === 'completed') {
      return NextResponse.json({ error: 'Test already submitted' }, { status: 400 });
    }

    // Load all attempt questions WITH correct answers
    const { data: attemptQuestions, error: aqError } = await supabase
      .from('test_attempt_questions')
      .select(
        `
        id,
        question_id,
        user_answer,
        time_spent_seconds,
        questions ( correct_option, marks, negative_marks, question_type )
      `
      )
      .eq('test_id', testId);

    if (aqError || !attemptQuestions) {
      return NextResponse.json({ error: 'Failed to load questions' }, { status: 500 });
    }

    let totalScore = 0;
    let correctCount = 0;
    let incorrectCount = 0;
    let unattemptedCount = 0;
    const config = (test.config as Record<string, any>) || {};
    const applyNegativeMarking = config.negative_marking !== false;

    const updates: { id: string; is_correct: boolean }[] = [];

    for (const aq of attemptQuestions) {
      const q = aq.questions as Record<string, any>;
      if (!q) continue;

      const userAnswer = aq.user_answer;
      const correctOption = q.correct_option;
      const marks = q.marks ?? 4;
      const negativeMarks = q.negative_marks ?? 1;

      if (!userAnswer || userAnswer.trim() === '') {
        unattemptedCount++;
        updates.push({ id: aq.id, is_correct: false });
        continue;
      }

      const isCorrect = userAnswer.trim().toUpperCase() === correctOption?.trim().toUpperCase();

      if (isCorrect) {
        totalScore += marks;
        correctCount++;
      } else {
        if (applyNegativeMarking) {
          totalScore -= negativeMarks;
        }
        incorrectCount++;
      }

      updates.push({ id: aq.id, is_correct: isCorrect });
    }

    // Update correctness for each attempt question
    for (const u of updates) {
      await supabase
        .from('test_attempt_questions')
        .update({ is_correct: u.is_correct })
        .eq('id', u.id);
    }

    const timeSpent = totalTimeSpentSeconds ?? test.time_spent_seconds ?? 0;

    // Update test record
    const { error: updateError } = await supabase
      .from('tests')
      .update({
        status: 'completed',
        score: Math.max(0, totalScore),
        time_spent_seconds: timeSpent,
      })
      .eq('id', testId);

    if (updateError) {
      console.error('Test update error:', updateError);
      return NextResponse.json({ error: 'Failed to finalise test' }, { status: 500 });
    }

    // Trigger streak update (non-fatal)
    await supabase.rpc('update_streak').catch(() => null);

    return NextResponse.json({
      success: true,
      result: {
        testId,
        score: Math.max(0, totalScore),
        totalQuestions: attemptQuestions.length,
        correctCount,
        incorrectCount,
        unattemptedCount,
        timeSpentSeconds: timeSpent,
        accuracy:
          attemptQuestions.length > 0
            ? Math.round((correctCount / (correctCount + incorrectCount || 1)) * 100)
            : 0,
      },
    });
  } catch (error) {
    console.error('Submit test error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
