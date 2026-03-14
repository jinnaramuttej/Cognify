/**
 * Question Quality Scoring System
 * 
 * Evaluates question quality based on student interaction signals.
 * Flags low-quality questions for review.
 * 
 * Uses: test_attempt_questions table (existing in db/schema.sql)
 */

import { supabase } from '@/lib/supabaseClient';

export interface QualityReport {
    question_id: string;
    quality_score: number;       // 0–100
    flagged: boolean;
    flag_reasons: string[];
    metrics: {
        accuracy_spread: number;   // How evenly distributed answers are
        avg_time_ratio: number;    // Time vs expected
        skip_rate: number;
        attempts: number;
    };
}

/**
 * Compute quality score for a question.
 * 
 * Signals:
 * - Accuracy distribution: A good question has a clear correct answer,
 *   not 25% random distribution (suggests ambiguity) or 95%+ (too easy/obvious).
 * - Time spent: Extremely fast (<5s) suggests guessing, extremely slow suggests confusing wording.
 * - Skip rate: High skip rate suggests unclear question or intimidating difficulty.
 */
export async function scoreQuestion(questionId: string): Promise<QualityReport | null> {
    const { data: attempts, error } = await supabase
        .from('test_attempt_questions')
        .select('is_correct, user_answer, time_spent_seconds')
        .eq('question_id', questionId);

    if (error || !attempts || attempts.length < 3) return null;

    const total = attempts.length;
    const correct = attempts.filter(a => a.is_correct === true).length;
    const skipped = attempts.filter(a => !a.user_answer).length;
    const avgTime = attempts.reduce((s, a) => s + (a.time_spent_seconds || 0), 0) / total;

    const accuracyRate = correct / total;
    const skipRate = skipped / total;

    // Quality scoring
    let score = 100;
    const reasons: string[] = [];

    // Accuracy distribution check
    // Near-random distribution (20–30%) suggests ambiguous question
    if (accuracyRate >= 0.2 && accuracyRate <= 0.3 && total >= 10) {
        score -= 25;
        reasons.push('Near-random accuracy distribution — question may be ambiguous');
    }

    // Extremely high accuracy suggests trivially easy or answer is obvious
    if (accuracyRate > 0.95 && total >= 10) {
        score -= 15;
        reasons.push('Accuracy >95% — question may be too easy or answer is obvious');
    }

    // High skip rate
    if (skipRate > 0.4) {
        score -= 20;
        reasons.push(`High skip rate (${Math.round(skipRate * 100)}%) — question may be unclear`);
    }

    // Very fast average time (< 5s) suggests guessing
    if (avgTime < 5 && total >= 5) {
        score -= 15;
        reasons.push('Very fast avg response time — students may be guessing');
    }

    // Very slow average time (> 5 min) suggests confusing wording
    if (avgTime > 300) {
        score -= 15;
        reasons.push('Very slow avg response time — question wording may be confusing');
    }

    // Low attempt count reduces confidence
    if (total < 10) {
        score = Math.max(score, 50); // Don't flag with insufficient data
    }

    const qualityScore = Math.max(0, Math.min(100, score));
    const flagged = qualityScore < 50 && total >= 10;

    return {
        question_id: questionId,
        quality_score: qualityScore,
        flagged,
        flag_reasons: reasons,
        metrics: {
            accuracy_spread: accuracyRate,
            avg_time_ratio: avgTime / 120, // ratio to expected 2 min
            skip_rate: skipRate,
            attempts: total,
        },
    };
}

/**
 * Batch score all questions and return flagged ones.
 */
export async function flagLowQualityQuestions(
    filters?: { exam_id?: string; topic_id?: string },
    threshold = 50
): Promise<QualityReport[]> {
    let query = supabase.from('questions').select('id');

    if (filters?.exam_id) query = query.eq('exam_id', filters.exam_id);
    if (filters?.topic_id) query = query.eq('topic_id', filters.topic_id);

    const { data: questions } = await query;
    if (!questions) return [];

    const flagged: QualityReport[] = [];

    for (const q of questions) {
        const report = await scoreQuestion(q.id);
        if (report && report.quality_score < threshold && report.metrics.attempts >= 10) {
            flagged.push(report);
        }
    }

    return flagged.sort((a, b) => a.quality_score - b.quality_score);
}
