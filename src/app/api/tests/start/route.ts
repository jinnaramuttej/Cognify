import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

/**
 * POST /api/tests/start
 * Creates a new test attempt from a config object.
 * Centralizes test creation for both self-initiated and teacher-assigned flows.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, config } = body;

    if (!title || !config) {
      return NextResponse.json({ error: 'title and config are required' }, { status: 400 });
    }

    const supabase = createRouteHandlerClient({ cookies });
    const { data: { session }, error: authError } = await supabase.auth.getSession();

    if (authError || !session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Validate config
    const {
      exam_id,
      subject_id,
      mode = 'Full Syllabus',
      question_count = 30,
      time_limit_minutes = 60,
      difficulty = 'Mixed',
      negative_marking = true,
      chapter_ids = [],
      years = [],
    } = config;

    // 1. Create the test record
    const { data: test, error: testError } = await supabase
      .from('tests')
      .insert({
        user_id: session.user.id,
        title,
        config: { exam_id, subject_id, mode, question_count, time_limit_minutes, difficulty, negative_marking, chapter_ids, years },
        status: 'in_progress',
        total_questions: question_count,
        duration_minutes: time_limit_minutes,
      })
      .select()
      .single();

    if (testError) {
      console.error('Test creation error:', testError);
      return NextResponse.json({ error: 'Failed to create test' }, { status: 500 });
    }

    // 2. Fetch questions based on config
    let query = supabase.from('questions').select('id');

    if (exam_id) query = query.eq('exam_id', exam_id);
    if (mode === 'PYQs Only') {
      query = query.eq('is_pyq', true);
      if (years.length > 0) query = query.in('year', years);
    }
    if (difficulty && difficulty !== 'Mixed') query = query.eq('difficulty', difficulty);

    // Chapter-wise or subject-wise scoping
    if (mode === 'Chapter-wise' && chapter_ids.length > 0) {
      const { data: topics } = await supabase.from('topics').select('id').in('chapter_id', chapter_ids);
      const topicIds = (topics || []).map((t) => t.id);
      if (topicIds.length > 0) query = query.in('topic_id', topicIds);
    } else if (subject_id) {
      const { data: chapters } = await supabase.from('chapters').select('id').eq('subject_id', subject_id);
      const chapterIds = (chapters || []).map((c) => c.id);
      const { data: topics } = await supabase.from('topics').select('id').in('chapter_id', chapterIds);
      const topicIds = (topics || []).map((t) => t.id);
      if (topicIds.length > 0) query = query.in('topic_id', topicIds);
    }

    const { data: questionPool, error: qErr } = await query;

    if (qErr || !questionPool || questionPool.length === 0) {
      // Clean up the test record we created
      await supabase.from('tests').delete().eq('id', test.id);
      return NextResponse.json({ error: 'No questions available for the selected configuration' }, { status: 422 });
    }

    // 3. Shuffle and select
    const shuffled = [...questionPool].sort(() => Math.random() - 0.5);
    const selected = shuffled.slice(0, Math.min(question_count, shuffled.length));

    // 4. Link questions to the test
    const testQuestions = selected.map((q, index) => ({
      test_id: test.id,
      question_id: q.id,
      order_index: index,
    }));

    const { error: linkError } = await supabase.from('test_attempt_questions').insert(testQuestions);

    if (linkError) {
      console.error('Question link error:', linkError);
      return NextResponse.json({ error: 'Failed to prepare test questions' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      testId: test.id,
      totalQuestions: selected.length,
    });

  } catch (error) {
    console.error('/api/tests/start error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
