/**
 * Teacher Module — Service
 * 
 * Handles teacher-specific queries.
 * Uses tables: questions, tests, squads, test_attempt_questions
 */

import { supabase } from '@/lib/supabaseClient';
import type { TeacherStats } from '../types';

export async function getTeacherStats(): Promise<TeacherStats> {
    const [questionsRes, testsRes, squadsRes] = await Promise.all([
        supabase.from('questions').select('id', { count: 'exact', head: true }),
        supabase.from('tests').select('id', { count: 'exact', head: true }),
        supabase.from('squads').select('id', { count: 'exact', head: true }),
    ]);

    return {
        totalQuestions: questionsRes.count || 0,
        totalTests: testsRes.count || 0,
        totalStudents: 0, // Would come from profiles count
        activeBatches: squadsRes.count || 0,
    };
}

export async function getRecentTests(limit = 10) {
    const { data, error } = await supabase
        .from('tests')
        .select('id, title, status, score, total_questions, created_at')
        .order('created_at', { ascending: false })
        .limit(limit);

    if (error) throw error;
    return data || [];
}

export async function getQuestionsByTopic(topicId: string) {
    const { data, error } = await supabase
        .from('questions')
        .select('*')
        .eq('topic_id', topicId)
        .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
}
