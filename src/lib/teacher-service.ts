import { supabase } from '@/lib/supabase';

// ── Types ──────────────────────────────────────────────────────────
export interface TeacherStats {
  totalQuestions: number;
  totalTests: number;
  activeBatches: number;
  totalStudents: number;
}

export interface SubjectDistribution {
  subject: string;
  count: number;
}

export interface BatchInfo {
  id: string;
  name: string;
  studentCount: number;
  lastActivity: string;
}

export interface RecentTest {
  id: string;
  title: string;
  totalQuestions: number;
  createdAt: string;
  attempts: number;
}

export interface IngestionLog {
  id: string;
  filename: string;
  questionsExtracted: number;
  questionsValidated: number;
  questionsInserted: number;
  status: 'processing' | 'completed' | 'failed';
  createdAt: string;
}

export interface QuestionRow {
  id: string;
  question_text: string;
  options: { label: string; text: string }[];
  correct_option: string;
  difficulty: string;
  explanation: string | null;
  is_pyq: boolean;
  year: number | null;
  topic_name?: string;
  chapter_name?: string;
  subject_name?: string;
  exam_name?: string;
}

// ── Dashboard Stats ────────────────────────────────────────────────
export async function getTeacherStats(teacherId: string): Promise<{ data: TeacherStats | null; error: string | null }> {
  try {
    const [questionsRes, testsRes, squadsRes, studentsRes] = await Promise.all([
      supabase.from('questions').select('id', { count: 'exact', head: true }),
      supabase.from('tests').select('id', { count: 'exact', head: true }).eq('created_by', teacherId),
      supabase.from('squads').select('id', { count: 'exact', head: true }).eq('created_by', teacherId),
      supabase
        .from('squad_members')
        .select('user_id, squads!inner(created_by)', { count: 'exact', head: true })
        .eq('squads.created_by', teacherId),
    ]);

    return {
      data: {
        totalQuestions: questionsRes.count ?? 0,
        totalTests: testsRes.count ?? 0,
        activeBatches: squadsRes.count ?? 0,
        totalStudents: studentsRes.count ?? 0,
      },
      error: null,
    };
  } catch (e) {
    return { data: null, error: 'Failed to load teacher stats' };
  }
}

// ── Question Distribution by Subject ───────────────────────────────
export async function getQuestionDistribution(): Promise<{ data: SubjectDistribution[]; error: string | null }> {
  try {
    const { data, error } = await supabase
      .from('questions')
      .select('topic_id, topics!inner(chapter_id, chapters!inner(subject_id, subjects!inner(name)))');

    if (error) return { data: [], error: error.message };

    const counts: Record<string, number> = {};
    (data ?? []).forEach((q: any) => {
      const subjectName = q.topics?.chapters?.subjects?.name ?? 'Unknown';
      counts[subjectName] = (counts[subjectName] || 0) + 1;
    });

    const distribution = Object.entries(counts).map(([subject, count]) => ({ subject, count }));
    return { data: distribution, error: null };
  } catch {
    return { data: [], error: 'Failed to load question distribution' };
  }
}

// ── Active Batches (Squads) ────────────────────────────────────────
export async function getActiveBatches(teacherId: string): Promise<{ data: BatchInfo[]; error: string | null }> {
  try {
    const { data: squads, error } = await supabase
      .from('squads')
      .select('id, name, created_at, squad_members(user_id)')
      .eq('created_by', teacherId)
      .order('created_at', { ascending: false })
      .limit(5);

    if (error) return { data: [], error: error.message };

    const batches: BatchInfo[] = (squads ?? []).map((s: any) => ({
      id: s.id,
      name: s.name,
      studentCount: s.squad_members?.length ?? 0,
      lastActivity: s.created_at,
    }));

    return { data: batches, error: null };
  } catch {
    return { data: [], error: 'Failed to load batches' };
  }
}

// ── Recent Tests Created by Teacher ────────────────────────────────
export async function getRecentTests(teacherId: string): Promise<{ data: RecentTest[]; error: string | null }> {
  try {
    const { data: tests, error } = await supabase
      .from('tests')
      .select('id, title, total_questions, created_at, test_attempt_questions(id)')
      .eq('created_by', teacherId)
      .order('created_at', { ascending: false })
      .limit(5);

    if (error) return { data: [], error: error.message };

    const recent: RecentTest[] = (tests ?? []).map((t: any) => ({
      id: t.id,
      title: t.title,
      totalQuestions: t.total_questions ?? 0,
      createdAt: t.created_at,
      attempts: t.test_attempt_questions?.length ?? 0,
    }));

    return { data: recent, error: null };
  } catch {
    return { data: [], error: 'Failed to load recent tests' };
  }
}

// ── Question Bank with Filters ─────────────────────────────────────
export interface QuestionFilters {
  search?: string;
  subject?: string;
  chapter?: string;
  difficulty?: string;
  exam?: string;
  year?: number;
  page?: number;
  pageSize?: number;
}

export async function getQuestions(filters: QuestionFilters): Promise<{ data: QuestionRow[]; total: number; error: string | null }> {
  try {
    const page = filters.page ?? 0;
    const pageSize = filters.pageSize ?? 20;
    const from = page * pageSize;
    const to = from + pageSize - 1;

    let query = supabase
      .from('questions')
      .select(
        `id, question_text, options, correct_option, difficulty, explanation, is_pyq, year,
         topics!inner(name, chapters!inner(name, subjects!inner(name, exams(name))))`,
        { count: 'exact' }
      )
      .range(from, to)
      .order('created_at', { ascending: false });

    if (filters.search) {
      query = query.ilike('question_text', `%${filters.search}%`);
    }
    if (filters.difficulty) {
      query = query.eq('difficulty', filters.difficulty);
    }
    if (filters.year) {
      query = query.eq('year', filters.year);
    }

    const { data, count, error } = await query;
    if (error) return { data: [], total: 0, error: error.message };

    const rows: QuestionRow[] = (data ?? []).map((q: any) => ({
      id: q.id,
      question_text: q.question_text,
      options: q.options,
      correct_option: q.correct_option,
      difficulty: q.difficulty,
      explanation: q.explanation,
      is_pyq: q.is_pyq,
      year: q.year,
      topic_name: q.topics?.name,
      chapter_name: q.topics?.chapters?.name,
      subject_name: q.topics?.chapters?.subjects?.name,
      exam_name: q.topics?.chapters?.subjects?.exams?.name,
    }));

    // Client-side filtering for nested fields (subject, chapter, exam)
    let filtered = rows;
    if (filters.subject) {
      filtered = filtered.filter((r) => r.subject_name === filters.subject);
    }
    if (filters.chapter) {
      filtered = filtered.filter((r) => r.chapter_name === filters.chapter);
    }
    if (filters.exam) {
      filtered = filtered.filter((r) => r.exam_name === filters.exam);
    }

    return { data: filtered, total: count ?? 0, error: null };
  } catch {
    return { data: [], total: 0, error: 'Failed to load questions' };
  }
}

// ── Update Question ────────────────────────────────────────────────
export async function updateQuestion(
  id: string,
  updates: Partial<Pick<QuestionRow, 'question_text' | 'options' | 'correct_option' | 'difficulty' | 'explanation'>>
): Promise<{ error: string | null }> {
  const { error } = await supabase.from('questions').update(updates).eq('id', id);
  return { error: error?.message ?? null };
}

// ── Insert Questions (from ingestion) ──────────────────────────────
export async function insertQuestions(
  questions: {
    topic_id: string;
    exam_id: string;
    question_text: string;
    options: { label: string; text: string }[];
    correct_option: string;
    difficulty: string;
    explanation?: string;
    is_pyq?: boolean;
    year?: number;
  }[]
): Promise<{ count: number; error: string | null }> {
  const { data, error } = await supabase.from('questions').insert(questions).select('id');
  return { count: data?.length ?? 0, error: error?.message ?? null };
}

// ── Get Filter Options (subjects, chapters, exams) ─────────────────
export async function getFilterOptions(): Promise<{
  subjects: string[];
  chapters: { name: string; subject: string }[];
  exams: string[];
}> {
  const [subjectsRes, chaptersRes, examsRes] = await Promise.all([
    supabase.from('subjects').select('name').order('name'),
    supabase.from('chapters').select('name, subjects!inner(name)').order('name'),
    supabase.from('exams').select('name').order('name'),
  ]);

  const subjects = [...new Set((subjectsRes.data ?? []).map((s: any) => s.name))];
  const chapters = (chaptersRes.data ?? []).map((c: any) => ({
    name: c.name,
    subject: c.subjects?.name ?? '',
  }));
  const exams = (examsRes.data ?? []).map((e: any) => e.name);

  return { subjects, chapters, exams };
}

// ── Get Filter Options with IDs (for test builder) ─────────────────
export interface ExamOption { id: string; name: string }
export interface SubjectOption { id: string; name: string; exam_id: string }
export interface ChapterOption { id: string; name: string; subject_id: string }

export async function getFilterOptionsWithIds(): Promise<{
  exams: ExamOption[];
  subjects: SubjectOption[];
  chapters: ChapterOption[];
}> {
  const [examsRes, subjectsRes, chaptersRes] = await Promise.all([
    supabase.from('exams').select('id, name').order('name'),
    supabase.from('subjects').select('id, name, exam_id').order('name'),
    supabase.from('chapters').select('id, name, subject_id').order('name'),
  ]);

  return {
    exams: (examsRes.data ?? []) as ExamOption[],
    subjects: (subjectsRes.data ?? []) as SubjectOption[],
    chapters: (chaptersRes.data ?? []) as ChapterOption[],
  };
}

// ── Delete Question ────────────────────────────────────────────────
export async function deleteQuestion(id: string): Promise<{ error: string | null }> {
  const { error } = await supabase.from('questions').delete().eq('id', id);
  return { error: error?.message ?? null };
}

// ── Create Test (teacher assigns) ──────────────────────────────────
export interface CreateTestPayload {
  title: string;
  created_by: string;
  question_ids: string[];
  duration_minutes: number;
  due_date?: string;
  batch_id?: string;
}

export async function createTest(payload: CreateTestPayload): Promise<{ testId: string | null; error: string | null }> {
  // Insert test
  const { data: test, error: testErr } = await supabase
    .from('tests')
    .insert({
      title: payload.title,
      created_by: payload.created_by,
      type: 'assigned',
      status: 'in_progress',
      total_questions: payload.question_ids.length,
      duration_minutes: payload.duration_minutes,
      due_date: payload.due_date || null,
      is_active: true,
      config: { question_ids: payload.question_ids, batch_id: payload.batch_id || null },
    })
    .select('id')
    .single();

  if (testErr || !test) return { testId: null, error: testErr?.message ?? 'Failed to create test' };

  // Insert test_attempt_questions as the template
  const rows = payload.question_ids.map((qid, i) => ({
    test_id: test.id,
    question_id: qid,
    order_index: i,
  }));

  const { error: qErr } = await supabase.from('test_attempt_questions').insert(rows);
  if (qErr) return { testId: test.id, error: qErr.message };

  return { testId: test.id, error: null };
}

// ── Get Questions by IDs (for test preview) ────────────────────────
export async function getQuestionsByIds(ids: string[]): Promise<{ data: QuestionRow[]; error: string | null }> {
  if (ids.length === 0) return { data: [], error: null };
  const { data, error } = await supabase
    .from('questions')
    .select(
      `id, question_text, options, correct_option, difficulty, explanation, is_pyq, year,
       topics!inner(name, chapters!inner(name, subjects!inner(name, exams(name))))`
    )
    .in('id', ids);

  if (error) return { data: [], error: error.message };

  const rows: QuestionRow[] = (data ?? []).map((q: any) => ({
    id: q.id,
    question_text: q.question_text,
    options: q.options,
    correct_option: q.correct_option,
    difficulty: q.difficulty,
    explanation: q.explanation,
    is_pyq: q.is_pyq,
    year: q.year,
    topic_name: q.topics?.name,
    chapter_name: q.topics?.chapters?.name,
    subject_name: q.topics?.chapters?.subjects?.name,
    exam_name: q.topics?.chapters?.subjects?.exams?.name,
  }));

  return { data: rows, error: null };
}

// ── Batch (Squad) Management ───────────────────────────────────────
export interface BatchDetail {
  id: string;
  name: string;
  description: string | null;
  invite_code: string;
  created_at: string;
  members: { user_id: string; full_name: string; email: string; role: string; joined_at: string }[];
}

export async function getBatchDetails(batchId: string): Promise<{ data: BatchDetail | null; error: string | null }> {
  const { data, error } = await supabase
    .from('squads')
    .select('id, name, description, invite_code, created_at, squad_members(user_id, role, joined_at)')
    .eq('id', batchId)
    .single();

  if (error || !data) return { data: null, error: error?.message ?? 'Batch not found' };

  // Fetch member profiles
  const memberIds = (data.squad_members as any[]).map((m: any) => m.user_id);
  const { data: profiles } = memberIds.length > 0
    ? await supabase.from('profiles').select('id, full_name, email').in('id', memberIds)
    : { data: [] };

  const profileMap: Record<string, any> = {};
  (profiles ?? []).forEach((p: any) => { profileMap[p.id] = p; });

  const members = (data.squad_members as any[]).map((m: any) => ({
    user_id: m.user_id,
    full_name: profileMap[m.user_id]?.full_name ?? 'Unknown',
    email: profileMap[m.user_id]?.email ?? '',
    role: m.role,
    joined_at: m.joined_at,
  }));

  return {
    data: {
      id: data.id,
      name: data.name,
      description: data.description,
      invite_code: data.invite_code,
      created_at: data.created_at,
      members,
    },
    error: null,
  };
}

export async function getAllBatches(teacherId: string): Promise<{ data: (BatchInfo & { invite_code: string; description: string | null })[]; error: string | null }> {
  const { data, error } = await supabase
    .from('squads')
    .select('id, name, description, invite_code, created_at, squad_members(user_id)')
    .eq('created_by', teacherId)
    .order('created_at', { ascending: false });

  if (error) return { data: [], error: error.message };

  const batches = (data ?? []).map((s: any) => ({
    id: s.id,
    name: s.name,
    description: s.description,
    invite_code: s.invite_code,
    studentCount: s.squad_members?.length ?? 0,
    lastActivity: s.created_at,
  }));

  return { data: batches, error: null };
}

export async function updateBatch(batchId: string, updates: { name?: string; description?: string }): Promise<{ error: string | null }> {
  const { error } = await supabase.from('squads').update(updates).eq('id', batchId);
  return { error: error?.message ?? null };
}

export async function deleteBatch(batchId: string): Promise<{ error: string | null }> {
  const { error } = await supabase.from('squads').delete().eq('id', batchId);
  return { error: error?.message ?? null };
}

// ── Student Analytics (for teacher) ────────────────────────────────
export interface StudentPerformance {
  user_id: string;
  full_name: string;
  email: string;
  tests_taken: number;
  avg_score: number;
  total_time_seconds: number;
}

export interface ChapterWeakness {
  chapter: string;
  subject: string;
  incorrect_count: number;
  total_attempts: number;
  accuracy: number;
}

export async function getStudentAnalytics(teacherId: string): Promise<{
  students: StudentPerformance[];
  weakChapters: ChapterWeakness[];
  error: string | null;
}> {
  try {
    // Get students in teacher's batches
    const { data: squads } = await supabase
      .from('squads')
      .select('id, squad_members(user_id)')
      .eq('created_by', teacherId);

    const studentIds = [...new Set((squads ?? []).flatMap((s: any) => (s.squad_members ?? []).map((m: any) => m.user_id)))];

    if (studentIds.length === 0) {
      return { students: [], weakChapters: [], error: null };
    }

    // Get student profiles
    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, full_name, email')
      .in('id', studentIds);

    // Get test data for these students
    const { data: tests } = await supabase
      .from('tests')
      .select('id, user_id, score, total_questions, time_spent_seconds, status')
      .in('user_id', studentIds)
      .eq('status', 'completed');

    // Aggregate per student
    const studentMap: Record<string, StudentPerformance> = {};
    (profiles ?? []).forEach((p: any) => {
      studentMap[p.id] = {
        user_id: p.id,
        full_name: p.full_name ?? 'Unknown',
        email: p.email ?? '',
        tests_taken: 0,
        avg_score: 0,
        total_time_seconds: 0,
      };
    });

    (tests ?? []).forEach((t: any) => {
      const s = studentMap[t.user_id];
      if (!s) return;
      s.tests_taken += 1;
      s.avg_score += (t.score ?? 0);
      s.total_time_seconds += (t.time_spent_seconds ?? 0);
    });

    const students = Object.values(studentMap).map((s) => ({
      ...s,
      avg_score: s.tests_taken > 0 ? Math.round(s.avg_score / s.tests_taken) : 0,
    }));

    // Get weak chapters from incorrect answers
    const testIds = (tests ?? []).map((t: any) => t.id);
    let weakChapters: ChapterWeakness[] = [];

    if (testIds.length > 0) {
      const { data: attempts } = await supabase
        .from('test_attempt_questions')
        .select('is_correct, questions!inner(topic_id, topics!inner(name, chapters!inner(name, subjects!inner(name))))')
        .in('test_id', testIds);

      const chapterStats: Record<string, { incorrect: number; total: number; subject: string }> = {};
      (attempts ?? []).forEach((a: any) => {
        const chapter = a.questions?.topics?.chapters?.name ?? 'Unknown';
        const subj = a.questions?.topics?.chapters?.subjects?.name ?? 'Unknown';
        if (!chapterStats[chapter]) chapterStats[chapter] = { incorrect: 0, total: 0, subject: subj };
        chapterStats[chapter].total += 1;
        if (!a.is_correct) chapterStats[chapter].incorrect += 1;
      });

      weakChapters = Object.entries(chapterStats)
        .map(([chapter, s]) => ({
          chapter,
          subject: s.subject,
          incorrect_count: s.incorrect,
          total_attempts: s.total,
          accuracy: s.total > 0 ? Math.round(((s.total - s.incorrect) / s.total) * 100) : 0,
        }))
        .sort((a, b) => a.accuracy - b.accuracy)
        .slice(0, 10);
    }

    return { students, weakChapters, error: null };
  } catch {
    return { students: [], weakChapters: [], error: 'Failed to load analytics' };
  }
}

// ── Assigned Tests for Students ────────────────────────────────────
export interface AssignedTest {
  id: string;
  title: string;
  total_questions: number;
  duration_minutes: number;
  due_date: string | null;
  created_at: string;
  teacher_name: string;
  batch_name: string;
}

export async function getAssignedTests(studentId: string): Promise<{ data: AssignedTest[]; error: string | null }> {
  try {
    // Get squads the student belongs to
    const { data: memberships } = await supabase
      .from('squad_members')
      .select('squad_id')
      .eq('user_id', studentId);

    const squadIds = (memberships ?? []).map((m: any) => m.squad_id);
    if (squadIds.length === 0) return { data: [], error: null };

    // Get assigned tests where config->batch_id matches any of the student's squads
    const { data: tests, error } = await supabase
      .from('tests')
      .select('id, title, total_questions, duration_minutes, due_date, created_at, created_by, config, is_active')
      .eq('type', 'assigned')
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (error) return { data: [], error: error.message };

    // Filter tests whose batch_id is in student's squads
    const relevantTests = (tests ?? []).filter((t: any) => {
      const batchId = t.config?.batch_id;
      return batchId && squadIds.includes(batchId);
    });

    if (relevantTests.length === 0) return { data: [], error: null };

    // Get teacher names and batch names
    const teacherIds = [...new Set(relevantTests.map((t: any) => t.created_by))];
    const batchIds = [...new Set(relevantTests.map((t: any) => t.config?.batch_id).filter(Boolean))];

    const [profilesRes, squadsRes] = await Promise.all([
      supabase.from('profiles').select('id, full_name').in('id', teacherIds),
      supabase.from('squads').select('id, name').in('id', batchIds),
    ]);

    const teacherMap: Record<string, string> = {};
    (profilesRes.data ?? []).forEach((p: any) => { teacherMap[p.id] = p.full_name ?? 'Teacher'; });

    const batchMap: Record<string, string> = {};
    (squadsRes.data ?? []).forEach((s: any) => { batchMap[s.id] = s.name; });

    const assigned: AssignedTest[] = relevantTests.map((t: any) => ({
      id: t.id,
      title: t.title,
      total_questions: t.total_questions ?? 0,
      duration_minutes: t.duration_minutes ?? 60,
      due_date: t.due_date,
      created_at: t.created_at,
      teacher_name: teacherMap[t.created_by] ?? 'Teacher',
      batch_name: batchMap[t.config?.batch_id] ?? 'Unknown Batch',
    }));

    return { data: assigned, error: null };
  } catch {
    return { data: [], error: 'Failed to load assigned tests' };
  }
}
