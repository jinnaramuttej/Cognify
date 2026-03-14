/**
 * Difficulty Calibration Engine
 * 
 * Automatically re-estimates question difficulty based on real student performance data.
 * Uses: tests, test_attempt_questions tables (existing in db/schema.sql)
 * 
 * Difficulty Score Formula:
 *   score = (1 - accuracy_rate) * 0.6 + (avg_time / expected_time) * 0.3 + skip_rate * 0.1
 *   0–0.3 → Easy | 0.3–0.6 → Medium | 0.6–1.0 → Hard
 */

import { supabase } from '@/lib/supabaseClient';

// Expected time per question type (seconds)
const EXPECTED_TIME: Record<string, number> = {
    single_correct: 120,
    multi_correct: 180,
    integer: 150,
    numerical: 150,
};

export interface QuestionStats {
    question_id: string;
    total_attempts: number;
    correct_count: number;
    accuracy_rate: number;
    avg_time_seconds: number;
    skip_count: number;
    skip_rate: number;
    difficulty_score: number;
    calibrated_difficulty: 'Easy' | 'Medium' | 'Hard';
}

/**
 * Compute difficulty stats for a single question from attempt data.
 */
function computeStats(
    questionId: string,
    attempts: { is_correct: boolean | null; user_answer: string | null; time_spent_seconds: number }[],
    questionType: string
): QuestionStats {
    const total = attempts.length;
    if (total === 0) {
        return {
            question_id: questionId,
            total_attempts: 0,
            correct_count: 0,
            accuracy_rate: 0,
            avg_time_seconds: 0,
            skip_count: 0,
            skip_rate: 0,
            difficulty_score: 0.5,
            calibrated_difficulty: 'Medium',
        };
    }

    const correct = attempts.filter(a => a.is_correct === true).length;
    const skipped = attempts.filter(a => a.user_answer === null || a.user_answer === '').length;
    const totalTime = attempts.reduce((sum, a) => sum + (a.time_spent_seconds || 0), 0);

    const accuracyRate = correct / total;
    const skipRate = skipped / total;
    const avgTime = totalTime / total;
    const expectedTime = EXPECTED_TIME[questionType] || 120;

    // Difficulty score formula
    const difficultyScore = Math.min(1, Math.max(0,
        (1 - accuracyRate) * 0.6 +
        Math.min(1, avgTime / expectedTime) * 0.3 +
        skipRate * 0.1
    ));

    let calibratedDifficulty: 'Easy' | 'Medium' | 'Hard';
    if (difficultyScore <= 0.3) calibratedDifficulty = 'Easy';
    else if (difficultyScore <= 0.6) calibratedDifficulty = 'Medium';
    else calibratedDifficulty = 'Hard';

    return {
        question_id: questionId,
        total_attempts: total,
        correct_count: correct,
        accuracy_rate: accuracyRate,
        avg_time_seconds: avgTime,
        skip_count: skipped,
        skip_rate: skipRate,
        difficulty_score: difficultyScore,
        calibrated_difficulty: calibratedDifficulty,
    };
}

/**
 * Calibrate difficulty for a specific question.
 * Requires at least 5 attempts for meaningful calibration.
 */
export async function calibrateQuestion(questionId: string): Promise<QuestionStats | null> {
    const { data: attempts, error } = await supabase
        .from('test_attempt_questions')
        .select('is_correct, user_answer, time_spent_seconds')
        .eq('question_id', questionId);

    if (error || !attempts || attempts.length < 5) return null;

    // Get question type
    const { data: question } = await supabase
        .from('questions')
        .select('question_type')
        .eq('id', questionId)
        .single();

    return computeStats(questionId, attempts, question?.question_type || 'single_correct');
}

/**
 * Batch calibrate all questions that have sufficient attempt data.
 * Returns stats for all calibrated questions.
 */
export async function calibrateBatch(minAttempts = 5): Promise<{
    calibrated: QuestionStats[];
    updated: number;
}> {
    // Get all questions with their attempt counts
    const { data: questions, error } = await supabase
        .from('questions')
        .select('id, question_type, difficulty');

    if (error || !questions) return { calibrated: [], updated: 0 };

    const calibrated: QuestionStats[] = [];
    let updated = 0;

    for (const q of questions) {
        const stats = await calibrateQuestion(q.id);
        if (!stats || stats.total_attempts < minAttempts) continue;

        calibrated.push(stats);

        // Update difficulty if it changed
        if (stats.calibrated_difficulty !== q.difficulty) {
            const { error: updateError } = await supabase
                .from('questions')
                .update({ difficulty: stats.calibrated_difficulty })
                .eq('id', q.id);

            if (!updateError) updated++;
        }
    }

    return { calibrated, updated };
}

/**
 * Get difficulty distribution for a set of questions.
 */
export async function getDifficultyDistribution(
    filters?: { exam_id?: string; topic_id?: string }
): Promise<{ Easy: number; Medium: number; Hard: number }> {
    let query = supabase.from('questions').select('difficulty');

    if (filters?.exam_id) query = query.eq('exam_id', filters.exam_id);
    if (filters?.topic_id) query = query.eq('topic_id', filters.topic_id);

    const { data } = await query;

    const dist = { Easy: 0, Medium: 0, Hard: 0 };
    for (const q of data || []) {
        const d = q.difficulty as keyof typeof dist;
        if (d in dist) dist[d]++;
    }

    return dist;
}
