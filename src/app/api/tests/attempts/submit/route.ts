/**
 * POST /api/tests/attempts/submit
 *
 * Called by the test runner UI when the user clicks "Submit Test".
 * Saves any final answers, then runs the scoring engine inline,
 * marks the test as completed, and returns the score.
 *
 * `attemptId` = testId (the UI sends the test UUID as the attempt identifier).
 */

import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

interface SubmitPayload {
  attemptId: string;
  testId?: string;     // may also be sent explicitly
  answers?: {
    questionId: string;
    selectedAnswer: string | null;
    isMarkedForReview: boolean;
  }[];
  totalTimeSpentSeconds?: number;
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

    const body: SubmitPayload = await request.json();
    const testId = body.testId || body.attemptId;
    const { answers = [], totalTimeSpentSeconds } = body;

    if (!testId) {
      return NextResponse.json({ error: 'testId is required' }, { status: 400 });
    }

    // Load test — verify ownership
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

    // Save any final answers provided with the submit call
    if (answers.length > 0) {
      await Promise.all(
        answers.map((a) =>
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
    }

    // ── Scoring engine (same algorithm as /api/tests/submit) ──

    const { data: attemptQuestions, error: aqError } = await supabase
      .from('test_attempt_questions')
      .select(
        `
        id,
        question_id,
        user_answer,
        time_spent_seconds,
        questions ( correct_option, marks, negative_marks, question_type )
      `,
      )
      .eq('test_id', testId);

    if (aqError || !attemptQuestions) {
      return NextResponse.json({ error: 'Failed to load questions for scoring' }, { status: 500 });
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

      const userAnswer: string | null = aq.user_answer;
      const correctOption: string | null = q.correct_option;
      const marks: number = q.marks ?? 4;
      const negativeMarks: number = q.negative_marks ?? 1;

      if (!userAnswer || userAnswer.trim() === '') {
        unattemptedCount++;
        updates.push({ id: aq.id, is_correct: false });
        continue;
      }

      const isCorrect =
        userAnswer.trim().toUpperCase() === (correctOption ?? '').trim().toUpperCase();

      if (isCorrect) {
        totalScore += marks;
        correctCount++;
      } else {
        if (applyNegativeMarking) totalScore -= negativeMarks;
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
    const totalMarks = attemptQuestions.reduce((acc, aq) => {
      const q = aq.questions as Record<string, any>;
      return acc + (q?.marks ?? 4);
    }, 0);

    // Mark test as completed
    await supabase
      .from('tests')
      .update({
        status: 'completed',
        score: totalScore,
        time_spent_seconds: timeSpent,
        completed_at: new Date().toISOString(),
      })
      .eq('id', testId);

    // Update user streak (best-effort — don't fail submit if this errors)
    try {
      await supabase.rpc('update_user_streak', { p_user_id: session.user.id });
    } catch {
      // non-critical
    }

    return NextResponse.json({
      success: true,
      testId,
      score: totalScore,
      totalMarks,
      correctCount,
      incorrectCount,
      unattemptedCount,
      accuracy:
        correctCount + incorrectCount > 0
          ? Math.round((correctCount / (correctCount + incorrectCount)) * 100)
          : 0,
    });
  } catch (error) {
    console.error('Attempts submit error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
