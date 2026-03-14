import { supabase } from '@/lib/supabase'

// =====================================================
// TYPES
// =====================================================

export interface SyllabusExam {
  id: string
  name: string
  category: string | null
  pattern_type: string | null
  total_marks: number | null
  duration_minutes: number | null
}

export interface SyllabusSubject {
  id: string
  exam_id: string
  name: string
}

export interface SyllabusUnit {
  id: string
  subject_id: string
  name: string
}

export interface SyllabusChapter {
  id: string
  unit_id: string
  name: string
  class_level: string | null
  weightage: number
}

export interface SyllabusConcept {
  id: string
  chapter_id: string
  name: string
  difficulty_level: number | null
}

export interface SubjectWithUnits extends SyllabusSubject {
  units: (SyllabusUnit & { chapters: SyllabusChapter[] })[]
}

// =====================================================
// QUERIES
// =====================================================

export async function getExams() {
  const { data, error } = await supabase
    .from('syllabus_exams')
    .select('id, name, category, pattern_type, total_marks, duration_minutes')
    .order('name')
  if (error) throw error
  return (data || []) as SyllabusExam[]
}

export async function getSubjects(examId: string) {
  const { data, error } = await supabase
    .from('syllabus_subjects')
    .select('id, exam_id, name')
    .eq('exam_id', examId)
    .order('name')
  if (error) throw error
  return (data || []) as SyllabusSubject[]
}

export async function getUnits(subjectId: string) {
  const { data, error } = await supabase
    .from('syllabus_units')
    .select('id, subject_id, name')
    .eq('subject_id', subjectId)
    .order('name')
  if (error) throw error
  return (data || []) as SyllabusUnit[]
}

export async function getChapters(unitId: string) {
  const { data, error } = await supabase
    .from('syllabus_chapters')
    .select('id, unit_id, name, class_level, weightage')
    .eq('unit_id', unitId)
    .order('name')
  if (error) throw error
  return (data || []) as SyllabusChapter[]
}

export async function getConcepts(chapterId: string) {
  const { data, error } = await supabase
    .from('syllabus_concepts')
    .select('id, chapter_id, name, difficulty_level')
    .eq('chapter_id', chapterId)
    .order('name')
  if (error) throw error
  return (data || []) as SyllabusConcept[]
}

export async function getSubjectWithFullTree(examId: string, subjectId: string) {
  // Get subject
  const { data: subject, error: sErr } = await supabase
    .from('syllabus_subjects')
    .select('id, exam_id, name')
    .eq('id', subjectId)
    .eq('exam_id', examId)
    .single()
  if (sErr) throw sErr

  // Get units with chapters
  const { data: units, error: uErr } = await supabase
    .from('syllabus_units')
    .select('id, subject_id, name')
    .eq('subject_id', subjectId)
    .order('name')
  if (uErr) throw uErr

  const unitsWithChapters = await Promise.all(
    (units || []).map(async (unit) => {
      const { data: chapters } = await supabase
        .from('syllabus_chapters')
        .select('id, unit_id, name, class_level, weightage')
        .eq('unit_id', unit.id)
        .order('name')
      return { ...unit, chapters: chapters || [] }
    })
  )

  return { ...subject, units: unitsWithChapters } as SubjectWithUnits
}

export async function getChapterWithConcepts(chapterId: string) {
  const { data: chapter, error: cErr } = await supabase
    .from('syllabus_chapters')
    .select('id, unit_id, name, class_level, weightage')
    .eq('id', chapterId)
    .single()
  if (cErr) throw cErr

  const { data: concepts, error: conErr } = await supabase
    .from('syllabus_concepts')
    .select('id, chapter_id, name, difficulty_level')
    .eq('chapter_id', chapterId)
    .order('difficulty_level')
  if (conErr) throw conErr

  return { ...chapter, concepts: concepts || [] }
}

/** Search across all syllabus content by keyword */
export async function searchSyllabus(query: string, examId?: string) {
  const results: { type: string; id: string; name: string; path: string }[] = []
  const q = `%${query}%`

  // Search subjects
  let subjectQuery = supabase.from('syllabus_subjects').select('id, name, exam_id').ilike('name', q)
  if (examId) subjectQuery = subjectQuery.eq('exam_id', examId)
  const { data: subjects } = await subjectQuery
  subjects?.forEach((s) => results.push({ type: 'subject', id: s.id, name: s.name, path: s.name }))

  // Search chapters
  const { data: chapters } = await supabase.from('syllabus_chapters').select('id, name').ilike('name', q)
  chapters?.forEach((c) => results.push({ type: 'chapter', id: c.id, name: c.name, path: c.name }))

  // Search concepts
  const { data: concepts } = await supabase.from('syllabus_concepts').select('id, name').ilike('name', q)
  concepts?.forEach((c) => results.push({ type: 'concept', id: c.id, name: c.name, path: c.name }))

  return results
}
