/**
 * Teacher Question Bank API
 *
 * GET  /api/teacher/questions/bank  — List questions with filtering & pagination
 * POST /api/teacher/questions/bank  — Insert one or more validated questions
 *
 * Access: teacher or admin role only.
 */

import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

// ──────────────────────────────────────────────
// Auth helper (teacher or admin only)
// ──────────────────────────────────────────────

async function verifyTeacher(supabase: ReturnType<typeof createRouteHandlerClient>) {
  const {
    data: { session },
    error: authError,
  } = await supabase.auth.getSession();

  if (authError || !session) return null;

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', session.user.id)
    .single();

  if (!profile || (profile.role !== 'teacher' && profile.role !== 'admin')) return null;

  return session;
}

// ──────────────────────────────────────────────
// GET — list questions from the bank
// ──────────────────────────────────────────────

export async function GET(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const session = await verifyTeacher(supabase);
    if (!session) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const examId = searchParams.get('examId');
    const subjectId = searchParams.get('subjectId');
    const chapterId = searchParams.get('chapterId');
    const difficulty = searchParams.get('difficulty');
    const isPyq = searchParams.get('isPyq');
    const search = searchParams.get('search');
    const page = Math.max(1, parseInt(searchParams.get('page') ?? '1'));
    const limit = Math.min(parseInt(searchParams.get('limit') ?? '50'), 100);
    const offset = (page - 1) * limit;

    // Resolve topic filter via chapters/subjects
    let topicFilter: string[] | null = null;

    if (subjectId) {
      const { data: chaps } = await supabase
        .from('chapters')
        .select('id')
        .eq('subject_id', subjectId);
      const cIds = (chaps ?? []).map((c: { id: string }) => c.id);
      if (cIds.length > 0) {
        const { data: tops } = await supabase
          .from('topics')
          .select('id')
          .in('chapter_id', cIds);
        topicFilter = (tops ?? []).map((t: { id: string }) => t.id);
      }
    } else if (chapterId) {
      const { data: tops } = await supabase
        .from('topics')
        .select('id')
        .eq('chapter_id', chapterId);
      topicFilter = (tops ?? []).map((t: { id: string }) => t.id);
    }

    let query = supabase
      .from('questions')
      .select(
        `id, question_text, options, correct_option, question_type, difficulty,
         marks, negative_marks, explanation, is_pyq, year, shift,
         topic_id, exam_id,
         topics ( id, name,
           chapters ( id, name,
             subjects ( id, name )
           )
         )`,
        { count: 'exact' }
      )
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (examId) query = query.eq('exam_id', examId);
    if (difficulty) query = query.eq('difficulty', difficulty);
    if (isPyq === 'true') query = query.eq('is_pyq', true);
    if (topicFilter && topicFilter.length > 0) query = query.in('topic_id', topicFilter);
    if (topicFilter && topicFilter.length === 0) {
      // Subject/chapter given but no topics found — return empty
      return NextResponse.json({ success: true, questions: [], total: 0, page, totalPages: 0 });
    }
    if (search) {
      query = query.ilike('question_text', `%${search}%`);
    }

    const { data: questions, error, count } = await query;
    if (error) throw error;

    return NextResponse.json({
      success: true,
      questions: questions ?? [],
      total: count ?? 0,
      page,
      totalPages: Math.ceil((count ?? 0) / limit),
    });
  } catch (error) {
    console.error('Question bank GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch questions' }, { status: 500 });
  }
}

// ──────────────────────────────────────────────
// POST — insert questions into the bank
// ──────────────────────────────────────────────

const VALID_TYPES = ['single_correct', 'multi_correct', 'integer', 'numerical'] as const;
const VALID_DIFFICULTIES = ['Easy', 'Medium', 'Hard'] as const;
const VALID_LABELS = ['A', 'B', 'C', 'D'];

interface QuestionInput {
  exam_id: string;
  topic_id: string;
  question_text: string;
  options: { label: string; text: string }[];
  correct_option: string;
  question_type: string;
  difficulty: string;
  marks?: number;
  negative_marks?: number;
  explanation?: string;
  is_pyq?: boolean;
  year?: number;
  shift?: string;
}

function validateQuestion(q: QuestionInput, index: number): string | null {
  if (!q.exam_id) return `Question ${index + 1}: exam_id required`;
  if (!q.topic_id) return `Question ${index + 1}: topic_id required`;
  if (!q.question_text?.trim()) return `Question ${index + 1}: question_text required`;
  if (!VALID_TYPES.includes(q.question_type as any))
    return `Question ${index + 1}: invalid question_type "${q.question_type}"`;
  if (!VALID_DIFFICULTIES.includes(q.difficulty as any))
    return `Question ${index + 1}: difficulty must be Easy | Medium | Hard`;
  if (!Array.isArray(q.options) || q.options.length < 2)
    return `Question ${index + 1}: at least 2 options required`;
  for (const opt of q.options) {
    if (!VALID_LABELS.includes(opt.label))
      return `Question ${index + 1}: option label must be A | B | C | D`;
    if (!opt.text?.trim())
      return `Question ${index + 1}: option text cannot be empty`;
  }
  if (!q.correct_option) return `Question ${index + 1}: correct_option required`;
  return null;
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const session = await verifyTeacher(supabase);
    if (!session) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    const body = await request.json();

    // Accept single question OR array of questions
    const questions: QuestionInput[] = Array.isArray(body) ? body : [body];

    if (questions.length === 0) {
      return NextResponse.json({ error: 'No questions provided' }, { status: 400 });
    }

    if (questions.length > 200) {
      return NextResponse.json(
        { error: 'Maximum 200 questions per request' },
        { status: 400 }
      );
    }

    // Validate all questions before any insert
    for (let i = 0; i < questions.length; i++) {
      const err = validateQuestion(questions[i], i);
      if (err) return NextResponse.json({ error: err }, { status: 400 });
    }

    // Verify all exam_ids + topic_ids exist
    const examIds = [...new Set(questions.map((q) => q.exam_id))];
    const topicIds = [...new Set(questions.map((q) => q.topic_id))];

    const [{ data: examCheck }, { data: topicCheck }] = await Promise.all([
      supabase.from('exams').select('id').in('id', examIds),
      supabase.from('topics').select('id').in('id', topicIds),
    ]);

    const validExamIds = new Set((examCheck ?? []).map((e: { id: string }) => e.id));
    const validTopicIds = new Set((topicCheck ?? []).map((t: { id: string }) => t.id));

    for (let i = 0; i < questions.length; i++) {
      if (!validExamIds.has(questions[i].exam_id))
        return NextResponse.json(
          { error: `Question ${i + 1}: exam_id "${questions[i].exam_id}" not found` },
          { status: 400 }
        );
      if (!validTopicIds.has(questions[i].topic_id))
        return NextResponse.json(
          { error: `Question ${i + 1}: topic_id "${questions[i].topic_id}" not found` },
          { status: 400 }
        );
    }

    // Build insert rows
    const rows = questions.map((q) => ({
      exam_id: q.exam_id,
      topic_id: q.topic_id,
      question_text: q.question_text.trim(),
      options: q.options,
      correct_option: q.correct_option.toUpperCase(),
      question_type: q.question_type,
      difficulty: q.difficulty,
      marks: q.marks ?? 4,
      negative_marks: q.negative_marks ?? 1,
      explanation: q.explanation?.trim() ?? null,
      is_pyq: q.is_pyq ?? false,
      year: q.year ?? null,
      shift: q.shift ?? null,
    }));

    const { data: inserted, error: insertError } = await supabase
      .from('questions')
      .insert(rows)
      .select('id, question_text, difficulty, question_type');

    if (insertError) {
      console.error('Question insert error:', insertError);
      return NextResponse.json({ error: 'Failed to insert questions' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      inserted: inserted?.length ?? 0,
      questions: inserted,
    });
  } catch (error) {
    console.error('Question bank POST error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
