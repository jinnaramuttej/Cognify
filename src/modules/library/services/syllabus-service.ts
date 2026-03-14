/**
 * Library Module — Syllabus Service
 * 
 * Handles all syllabus hierarchy queries.
 * Uses tables: syllabus_exams, syllabus_subjects, syllabus_units, syllabus_chapters, syllabus_concepts
 */

import { supabase } from '@/lib/supabaseClient';
import type { SyllabusExam, SyllabusSubject, SyllabusUnit, SyllabusChapter, SyllabusConcept } from '../types';

export async function getExams(): Promise<SyllabusExam[]> {
    const { data, error } = await supabase
        .from('syllabus_exams')
        .select('*')
        .order('name');

    if (error) throw error;
    return data || [];
}

export async function getSubjects(examId: string): Promise<SyllabusSubject[]> {
    const { data, error } = await supabase
        .from('syllabus_subjects')
        .select('*')
        .eq('exam_id', examId)
        .order('display_order');

    if (error) throw error;
    return data || [];
}

export async function getUnits(subjectId: string): Promise<SyllabusUnit[]> {
    const { data, error } = await supabase
        .from('syllabus_units')
        .select('*')
        .eq('subject_id', subjectId)
        .order('display_order');

    if (error) throw error;
    return data || [];
}

export async function getChapters(unitId: string): Promise<SyllabusChapter[]> {
    const { data, error } = await supabase
        .from('syllabus_chapters')
        .select('*')
        .eq('unit_id', unitId)
        .order('display_order');

    if (error) throw error;
    return data || [];
}

export async function getConcepts(chapterId: string): Promise<SyllabusConcept[]> {
    const { data, error } = await supabase
        .from('syllabus_concepts')
        .select('*')
        .eq('chapter_id', chapterId)
        .order('name');

    if (error) throw error;
    return data || [];
}

/** Get full hierarchy for an exam in one query */
export async function getExamHierarchy(examId: string) {
    const { data, error } = await supabase
        .from('syllabus_subjects')
        .select(`
      id, name, display_order,
      units:syllabus_units(
        id, name, display_order,
        chapters:syllabus_chapters(
          id, name, display_order
        )
      )
    `)
        .eq('exam_id', examId)
        .order('display_order');

    if (error) throw error;
    return data || [];
}
