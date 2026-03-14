/**
 * Smart Test Generator
 * 
 * Generates balanced tests with proper difficulty distribution and chapter coverage.
 * Uses the existing `questions` table — never generates fake questions.
 * 
 * Default distribution: 40% Easy, 40% Medium, 20% Hard
 */

import { supabase } from '@/lib/supabaseClient';

export interface SmartTestConfig {
    exam_id: string;
    subject_id?: string;
    chapter_ids?: string[];
    total_questions: number;
    difficulty_distribution?: {
        Easy: number;   // percentage 0–1
        Medium: number;
        Hard: number;
    };
    include_pyq?: boolean;
    pyq_years?: number[];
    exclude_question_ids?: string[];
}

interface SelectedQuestion {
    id: string;
    topic_id: string;
    difficulty: string;
    question_type: string;
    is_pyq: boolean;
}

const DEFAULT_DISTRIBUTION = { Easy: 0.4, Medium: 0.4, Hard: 0.2 };

/**
 * Generate a balanced test with proper difficulty distribution and chapter coverage.
 */
export async function generateSmartTest(config: SmartTestConfig): Promise<{
    questions: SelectedQuestion[];
    distribution: { Easy: number; Medium: number; Hard: number };
    chapter_coverage: Record<string, number>;
}> {
    const dist = config.difficulty_distribution || DEFAULT_DISTRIBUTION;
    const total = config.total_questions;

    // Calculate target counts per difficulty
    const targets = {
        Easy: Math.round(total * dist.Easy),
        Medium: Math.round(total * dist.Medium),
        Hard: total - Math.round(total * dist.Easy) - Math.round(total * dist.Medium),
    };

    const allSelected: SelectedQuestion[] = [];

    // Fetch questions per difficulty level
    for (const [difficulty, count] of Object.entries(targets)) {
        if (count <= 0) continue;

        let query = supabase
            .from('questions')
            .select('id, topic_id, difficulty, question_type, is_pyq')
            .eq('exam_id', config.exam_id)
            .eq('difficulty', difficulty);

        // Apply filters
        if (config.subject_id) {
            // Get chapters for subject, then topics for chapters
            const { data: chapters } = await supabase
                .from('chapters')
                .select('id')
                .eq('subject_id', config.subject_id);

            if (chapters && chapters.length > 0) {
                const chapterIds = config.chapter_ids?.length
                    ? config.chapter_ids
                    : chapters.map(c => c.id);

                const { data: topics } = await supabase
                    .from('topics')
                    .select('id')
                    .in('chapter_id', chapterIds);

                if (topics && topics.length > 0) {
                    query = query.in('topic_id', topics.map(t => t.id));
                }
            }
        }

        if (config.include_pyq) {
            query = query.eq('is_pyq', true);
        }

        if (config.pyq_years?.length) {
            query = query.in('year', config.pyq_years);
        }

        if (config.exclude_question_ids?.length) {
            query = query.not('id', 'in', `(${config.exclude_question_ids.join(',')})`);
        }

        // Fetch more than needed to allow randomization
        const { data: candidates } = await query.limit(count * 3);

        if (candidates && candidates.length > 0) {
            // Shuffle and pick required count
            const shuffled = candidates.sort(() => Math.random() - 0.5);
            allSelected.push(...shuffled.slice(0, count));
        }
    }

    // Compute chapter coverage
    const chapterCoverage: Record<string, number> = {};
    for (const q of allSelected) {
        const topicId = q.topic_id;
        chapterCoverage[topicId] = (chapterCoverage[topicId] || 0) + 1;
    }

    // Final distribution count
    const finalDist = { Easy: 0, Medium: 0, Hard: 0 };
    for (const q of allSelected) {
        const d = q.difficulty as keyof typeof finalDist;
        if (d in finalDist) finalDist[d]++;
    }

    // Shuffle final order
    allSelected.sort(() => Math.random() - 0.5);

    return {
        questions: allSelected,
        distribution: finalDist,
        chapter_coverage: chapterCoverage,
    };
}

/**
 * Generate a test that avoids questions the student has already seen.
 */
export async function generateFreshTest(
    userId: string,
    config: SmartTestConfig
): Promise<ReturnType<typeof generateSmartTest>> {
    // Get questions the user has already attempted
    const { data: pastAttempts } = await supabase
        .from('test_attempt_questions')
        .select('question_id, test:tests!inner(user_id)')
        .eq('test.user_id', userId);

    const seenIds = [...new Set(pastAttempts?.map(a => a.question_id) || [])];

    return generateSmartTest({
        ...config,
        exclude_question_ids: [
            ...(config.exclude_question_ids || []),
            ...seenIds,
        ],
    });
}
