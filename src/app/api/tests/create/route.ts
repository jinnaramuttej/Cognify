/**
 * POST /api/tests/create
 *
 * Creates a new test session for a student.
 * Inserts a row into the `tests` table and returns the test ID.
 */

import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });

    // Auth check
    const {
      data: { session },
      error: authError,
    } = await supabase.auth.getSession();

    if (authError || !session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      title,
      examId,
      subjectIds,
      chapterIds,
      topicIds,
      difficulty,
      questionCount = 30,
      durationMinutes,
      mode = 'practice',
      negativeMarking = true,
      isPyq = false,
      years,
    } = body;

    if (!examId) {
      return NextResponse.json({ error: 'examId is required' }, { status: 400 });
    }

    // Look up exam info for negative_marking default
    const { data: exam } = await supabase
      .from('exams')
      .select('id, name, duration_minutes, negative_marking')
      .eq('id', examId)
      .single();

    if (!exam) {
      return NextResponse.json({ error: 'Exam not found' }, { status: 404 });
    }

    const resolvedDuration = durationMinutes || exam.duration_minutes;
    const testTitle =
      title ||
      `${exam.name} Practice — ${new Date().toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      })}`;

    // Create the test session
    const { data: test, error: insertError } = await supabase
      .from('tests')
      .insert({
        user_id: session.user.id,
        created_by: session.user.id,
        title: testTitle,
        type: 'practice',
        status: 'in_progress',
        total_questions: questionCount,
        duration_minutes: resolvedDuration,
        score: 0,
        time_spent_seconds: 0,
        config: {
          exam_id: examId,
          subject_ids: subjectIds || [],
          chapter_ids: chapterIds || [],
          topic_ids: topicIds || [],
          difficulty: difficulty || 'all',
          question_count: questionCount,
          mode,
          negative_marking: negativeMarking,
          is_pyq: isPyq,
          years: years || [],
        },
      })
      .select()
      .single();

    if (insertError || !test) {
      console.error('Test insert error:', insertError);
      return NextResponse.json({ error: 'Failed to create test' }, { status: 500 });
    }

    return NextResponse.json({ success: true, testId: test.id, test });
  } catch (error) {
    console.error('Create test error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
