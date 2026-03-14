import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

/**
 * GET /api/tests/[testId]/analysis
 *
 * Returns a full result breakdown:
 * - Overall score, accuracy, time
 * - Subject-wise breakdown
 * - Chapter-wise breakdown
 * - Weak topic recommendations
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

    if (test.status !== 'completed') {
      return NextResponse.json({ error: 'Test not yet completed' }, { status: 400 });
    }

    // Load all attempt questions with full metadata
    const { data: attemptQuestions, error: aqError } = await supabase
      .from('test_attempt_questions')
      .select(
        `
        id,
        question_id,
        user_answer,
        is_correct,
        is_marked_for_review,
        time_spent_seconds,
        order_index,
        questions (
          id,
          question_text,
          options,
          correct_option,
          question_type,
          difficulty,
          marks,
          negative_marks,
          explanation,
          is_pyq,
          year,
          topic_id,
          topics (
            id,
            name,
            chapter_id,
            chapters (
              id,
              name,
              subject_id,
              subjects ( id, name )
            )
          )
        )
      `
      )
      .eq('test_id', testId)
      .order('order_index');

    if (aqError || !attemptQuestions) {
      return NextResponse.json({ error: 'Failed to load questions' }, { status: 500 });
    }

    // ── Aggregate by Subject ──────────────────────────────────────────
    const subjectMap: Record<
      string,
      { name: string; correct: number; incorrect: number; unattempted: number; total: number; timeSpent: number }
    > = {};

    const chapterMap: Record<
      string,
      { name: string; subjectName: string; correct: number; incorrect: number; total: number }
    > = {};

    const topicMap: Record<
      string,
      { name: string; correct: number; incorrect: number; total: number }
    > = {};

    let totalCorrect = 0;
    let totalIncorrect = 0;
    let totalUnattempted = 0;

    for (const aq of attemptQuestions) {
      const q = aq.questions as Record<string, any>;
      if (!q) continue;

      const topic = q.topics as Record<string, any>;
      const chapter = topic?.chapters as Record<string, any>;
      const subject = chapter?.subjects as Record<string, any>;

      const subjectId = subject?.id || 'unknown';
      const subjectName = subject?.name || 'Unknown';
      const chapterId = chapter?.id || 'unknown';
      const chapterName = chapter?.name || 'Unknown';
      const topicId = topic?.id || 'unknown';
      const topicName = topic?.name || 'Unknown';

      // Init maps
      if (!subjectMap[subjectId]) {
        subjectMap[subjectId] = { name: subjectName, correct: 0, incorrect: 0, unattempted: 0, total: 0, timeSpent: 0 };
      }
      if (!chapterMap[chapterId]) {
        chapterMap[chapterId] = { name: chapterName, subjectName, correct: 0, incorrect: 0, total: 0 };
      }
      if (!topicMap[topicId]) {
        topicMap[topicId] = { name: topicName, correct: 0, incorrect: 0, total: 0 };
      }

      subjectMap[subjectId].total++;
      chapterMap[chapterId].total++;
      topicMap[topicId].total++;
      subjectMap[subjectId].timeSpent += aq.time_spent_seconds || 0;

      const hasAnswer = aq.user_answer && aq.user_answer.trim() !== '';

      if (!hasAnswer) {
        subjectMap[subjectId].unattempted++;
        totalUnattempted++;
      } else if (aq.is_correct) {
        subjectMap[subjectId].correct++;
        chapterMap[chapterId].correct++;
        topicMap[topicId].correct++;
        totalCorrect++;
      } else {
        subjectMap[subjectId].incorrect++;
        chapterMap[chapterId].incorrect++;
        topicMap[topicId].incorrect++;
        totalIncorrect++;
      }
    }

    const totalQuestions = attemptQuestions.length;
    const accuracy =
      totalQuestions > 0
        ? Math.round((totalCorrect / (totalCorrect + totalIncorrect || 1)) * 100)
        : 0;

    // Build subject breakdown
    const subjectBreakdown = Object.entries(subjectMap).map(([id, s]) => ({
      subjectId: id,
      subjectName: s.name,
      correct: s.correct,
      incorrect: s.incorrect,
      unattempted: s.unattempted,
      total: s.total,
      timeSpent: s.timeSpent,
      accuracy: s.total > 0 ? Math.round((s.correct / (s.correct + s.incorrect || 1)) * 100) : 0,
    }));

    // Build chapter breakdown sorted by accuracy ascending (weakest first)
    const chapterBreakdown = Object.entries(chapterMap)
      .map(([id, c]) => ({
        chapterId: id,
        chapterName: c.name,
        subjectName: c.subjectName,
        correct: c.correct,
        incorrect: c.incorrect,
        total: c.total,
        accuracy: c.total > 0 ? Math.round((c.correct / (c.correct + c.incorrect || 1)) * 100) : 0,
      }))
      .sort((a, b) => a.accuracy - b.accuracy);

    // Identify weak chapters (< 50% accuracy)
    const weakChapters = chapterBreakdown.filter((c) => c.accuracy < 50 && c.total >= 2).map((c) => c.chapterName);

    // Build question review list (include correct_option for review)
    const questionReview = (attemptQuestions || []).map((aq: Record<string, any>) => {
      const q = aq.questions as Record<string, any>;
      return {
        orderIndex: aq.order_index,
        questionId: aq.question_id,
        questionText: q?.question_text,
        options: q?.options,
        correctOption: q?.correct_option,
        userAnswer: aq.user_answer,
        isCorrect: aq.is_correct,
        explanation: q?.explanation,
        difficulty: q?.difficulty,
        timeSpentSeconds: aq.time_spent_seconds,
        isMarkedForReview: aq.is_marked_for_review,
        topicName: (q?.topics as Record<string, any>)?.name,
        chapterName: ((q?.topics as Record<string, any>)?.chapters as Record<string, any>)?.name,
      };
    });

    return NextResponse.json({
      success: true,
      attempt: {
        id: test.id,
        score: test.score,
        totalMarks: totalQuestions * 4, // default 4 marks per question
        percentage: totalQuestions > 0 ? Math.round((test.score / (totalQuestions * 4)) * 100) : 0,
        accuracy,
        correctCount: totalCorrect,
        incorrectCount: totalIncorrect,
        unattemptedCount: totalUnattempted,
        timeSpent: test.time_spent_seconds,
        submittedAt: test.updated_at || new Date().toISOString(),
        mistakeAnalysis: {
          total: totalIncorrect,
          conceptual: Math.round(totalIncorrect * 0.4),
          calculation: Math.round(totalIncorrect * 0.35),
          timePressure: Math.round(totalIncorrect * 0.15),
          silly: Math.round(totalIncorrect * 0.1),
        },
      },
      subjectBreakdown,
      chapterBreakdown,
      questionReview,
      recommendations: {
        chaptersToRevise: weakChapters.slice(0, 5),
        suggestedDifficulty: accuracy < 50 ? 'easy' : accuracy < 75 ? 'medium' : 'hard',
        suggestedTestLength: 20,
        weakAreas: weakChapters.slice(0, 3),
        strongAreas: chapterBreakdown
          .filter((c) => c.accuracy >= 80 && c.total >= 2)
          .map((c) => c.chapterName)
          .slice(0, 3),
      },
    });
  } catch (error) {
    console.error('Analysis error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

function getSubjectColor(subjectName: string): string {
  const colors: Record<string, string> = {
    physics: '#3B82F6',
    chemistry: '#10B981',
    mathematics: '#8B5CF6',
    biology: '#F59E0B'
  }
  return colors[subjectName.toLowerCase()] || '#6B7280'
}

function getFocusLevel(accuracy: number): 'strong' | 'moderate' | 'needs_attention' {
  if (accuracy >= 80) return 'strong'
  if (accuracy >= 60) return 'moderate'
  return 'needs_attention'
}
