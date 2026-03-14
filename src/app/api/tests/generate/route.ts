/**
 * POST /api/tests/generate
 *
 * Generates questions for a test by querying the questions table
 * with the filters from the test's config. Inserts rows into
 * test_attempt_questions and returns the ordered question list.
 */

import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { QuestionSelector } from '@/lib/services/question-selector';

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

    const { testId } = await request.json();

    if (!testId) {
      return NextResponse.json({ error: 'testId is required' }, { status: 400 });
    }

    // Load the test to get config
    const { data: test, error: testError } = await supabase
      .from('tests')
      .select('*')
      .eq('id', testId)
      .eq('user_id', session.user.id)
      .single();

    if (testError || !test) {
      return NextResponse.json({ error: 'Test not found or access denied' }, { status: 404 });
    }

    if (test.status !== 'in_progress') {
      return NextResponse.json({ error: 'Test already completed' }, { status: 400 });
    }

    // Check if questions already generated
    const { count: existing } = await supabase
      .from('test_attempt_questions')
      .select('id', { count: 'exact', head: true })
      .eq('test_id', testId);

    if (existing && existing > 0) {
      // Questions already exist — just return them
      const { data: existingQuestions } = await supabase
        .from('test_attempt_questions')
        .select(
          `
          order_index,
          user_answer,
          is_correct,
          is_marked_for_review,
          time_spent_seconds,
          questions (
            id, question_text, options, correct_option, question_type,
            difficulty, marks, negative_marks, explanation, is_pyq, year, shift,
            topic_id,
            topics ( name, chapter_id, chapters ( name, subject_id, subjects ( name ) ) )
          )
        `
        )
        .eq('test_id', testId)
        .order('order_index');

      return NextResponse.json({ success: true, questions: existingQuestions, alreadyGenerated: true });
    }

    const config = test.config as Record<string, any>;
    const questionCount: number = config.question_count || 30;

    // Use QuestionSelector service for all question selection logic
    const selected = await QuestionSelector.select(supabase, {
      examId: config.exam_id as string | undefined,
      subjectIds: (config.subject_ids || []) as string[],
      chapterIds: (config.chapter_ids || []) as string[],
      topicIds: (config.topic_ids || []) as string[],
      difficulty: (config.difficulty || 'all') as 'Easy' | 'Medium' | 'Hard' | 'mixed' | 'all',
      questionCount,
      isPyq: config.is_pyq || false,
      years: (config.years || []) as number[],
    });

    if (!selected || selected.length === 0) {
      return NextResponse.json(
        { error: 'No questions found matching criteria. Please add questions to the question bank first.' },
        { status: 404 }
      );
    }

    // Insert test_attempt_questions rows
    const rows = selected.map((q: Record<string, any>, idx: number) => ({
      test_id: testId,
      question_id: q.id,
      order_index: idx,
      user_answer: null,
      is_correct: null,
      is_marked_for_review: false,
      time_spent_seconds: 0,
    }));

    const { error: insertError } = await supabase.from('test_attempt_questions').insert(rows);

    if (insertError) {
      console.error('test_attempt_questions insert error:', insertError);
      return NextResponse.json({ error: 'Failed to save questions' }, { status: 500 });
    }

    // Update test with actual question count
    await supabase
      .from('tests')
      .update({ total_questions: selected.length })
      .eq('id', testId);

    // Strip correct_option from questions sent to client
    const clientQuestions = selected.map((q: Record<string, any>, idx: number) => ({
      order_index: idx,
      question_id: q.id,
      question_text: q.question_text,
      options: q.options,
      question_type: q.question_type,
      difficulty: q.difficulty,
      marks: q.marks,
      negative_marks: q.negative_marks,
      is_pyq: q.is_pyq,
      year: q.year,
      shift: q.shift,
      topic_id: q.topic_id,
      user_answer: null,
      is_marked_for_review: false,
      time_spent_seconds: 0,
    }));

    return NextResponse.json({ success: true, questions: clientQuestions, total: selected.length });
  } catch (error) {
    console.error('Generate test error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
