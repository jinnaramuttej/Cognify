/**
 * QuestionSelector Service
 *
 * Encapsulates all question bank selection logic:
 *   - Random selection with Fisher-Yates shuffle
 *   - Difficulty balancing (mixed: 30% Easy, 40% Medium, 30% Hard)
 *   - Topic/chapter/subject filtering (resolves full hierarchy chains)
 *   - Exclude previously attempted questions
 *
 * Usage:
 *   const questions = await QuestionSelector.select(supabase, config)
 */

import type { SupabaseClient } from '@supabase/supabase-js';

// ──────────────────────────────────────────────
// Types
// ──────────────────────────────────────────────

export interface QuestionSelectorConfig {
  examId?: string;
  subjectIds?: string[];
  chapterIds?: string[];
  topicIds?: string[];
  /** 'Easy' | 'Medium' | 'Hard' | 'mixed' (balanced) | 'all' (no filter) */
  difficulty?: 'Easy' | 'Medium' | 'Hard' | 'mixed' | 'all';
  questionCount: number;
  isPyq?: boolean;
  years?: number[];
  /** If true and userId is provided, exclude questions the user already saw */
  excludeAttempted?: boolean;
  userId?: string;
}

export interface SelectedQuestion {
  id: string;
  question_text: string;
  options: { label: string; text: string }[];
  correct_option: string;
  question_type: 'single_correct' | 'multi_correct' | 'integer' | 'numerical';
  difficulty: 'Easy' | 'Medium' | 'Hard';
  marks: number;
  negative_marks: number;
  explanation?: string;
  is_pyq: boolean;
  year?: number;
  shift?: string;
  topic_id: string;
  exam_id: string;
}

// ──────────────────────────────────────────────
// Helpers
// ──────────────────────────────────────────────

/** In-place Fisher-Yates shuffle — O(n), returns copy */
function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/**
 * Resolve subject/chapter input into concrete topic IDs.
 * Priority: topicIds > (chapterIds → topics) > (subjectIds → chapters → topics)
 */
async function resolveTopicIds(
  supabase: SupabaseClient,
  config: Pick<QuestionSelectorConfig, 'subjectIds' | 'chapterIds' | 'topicIds'>
): Promise<string[]> {
  const { subjectIds = [], chapterIds = [], topicIds = [] } = config;

  if (topicIds.length > 0) return topicIds;

  let resolvedChapterIds = [...chapterIds];

  // If no chapters given, resolve from subjects
  if (resolvedChapterIds.length === 0 && subjectIds.length > 0) {
    const { data: chapters } = await supabase
      .from('chapters')
      .select('id')
      .in('subject_id', subjectIds);
    resolvedChapterIds = (chapters ?? []).map((c: { id: string }) => c.id);
  }

  if (resolvedChapterIds.length === 0) return [];

  const { data: topics } = await supabase
    .from('topics')
    .select('id')
    .in('chapter_id', resolvedChapterIds);

  return (topics ?? []).map((t: { id: string }) => t.id);
}

const Q_SELECT =
  'id, question_text, options, correct_option, question_type, difficulty, marks, negative_marks, explanation, is_pyq, year, shift, topic_id, exam_id';

/**
 * Query the questions table with all filters applied.
 */
async function fetchPool(
  supabase: SupabaseClient,
  opts: {
    examId?: string;
    topicIds: string[];
    difficulty?: 'Easy' | 'Medium' | 'Hard';
    isPyq: boolean;
    years: number[];
    excludeIds: string[];
    limit: number;
  }
): Promise<SelectedQuestion[]> {
  let query = supabase.from('questions').select(Q_SELECT).limit(opts.limit);

  if (opts.examId) query = query.eq('exam_id', opts.examId);
  if (opts.difficulty) query = query.eq('difficulty', opts.difficulty);
  if (opts.isPyq) query = query.eq('is_pyq', true);
  if (opts.years.length > 0) query = query.in('year', opts.years);
  if (opts.topicIds.length > 0) query = query.in('topic_id', opts.topicIds);
  if (opts.excludeIds.length > 0) {
    query = query.not('id', 'in', `(${opts.excludeIds.join(',')})`);
  }

  const { data } = await query;
  return (data ?? []) as SelectedQuestion[];
}

// ──────────────────────────────────────────────
// Main service
// ──────────────────────────────────────────────

export const QuestionSelector = {
  /**
   * Select questions from the question bank according to config.
   *
   * Returns at most `questionCount` questions, shuffled.
   * If fewer questions exist in the pool, returns all available.
   */
  async select(
    supabase: SupabaseClient,
    config: QuestionSelectorConfig
  ): Promise<SelectedQuestion[]> {
    const {
      examId,
      difficulty = 'all',
      questionCount,
      isPyq = false,
      years = [],
      excludeAttempted = false,
      userId,
    } = config;

    // 1. Resolve topic IDs from hierarchy
    const topicIds = await resolveTopicIds(supabase, config);

    // 2. Get previously attempted question IDs (if exclusion requested)
    let excludeIds: string[] = [];
    if (excludeAttempted && userId) {
      const { data: attempted } = await supabase
        .from('test_attempt_questions')
        .select('question_id, tests!inner(user_id, status)')
        .eq('tests.user_id', userId)
        .eq('tests.status', 'completed');
      excludeIds = (attempted ?? [])
        .map((a: { question_id: string }) => a.question_id)
        .filter(Boolean);
    }

    const POOL_MULTIPLIER = 8;

    // 3a. Mixed difficulty: proportional selection
    if (difficulty === 'mixed' || difficulty === 'all') {
      const buckets: { level: 'Easy' | 'Medium' | 'Hard'; share: number }[] = [
        { level: 'Easy', share: 0.3 },
        { level: 'Medium', share: 0.4 },
        { level: 'Hard', share: 0.3 },
      ];

      const pools = await Promise.all(
        buckets.map(async (b) => {
          const needed = Math.ceil(questionCount * b.share);
          const pool = await fetchPool(supabase, {
            examId,
            topicIds,
            difficulty: b.level,
            isPyq,
            years,
            excludeIds,
            limit: needed * POOL_MULTIPLIER,
          });
          return shuffle(pool).slice(0, needed);
        })
      );

      return shuffle(pools.flat()).slice(0, questionCount);
    }

    // 3b. Single difficulty level
    const capitalised =
      difficulty.charAt(0).toUpperCase() + difficulty.slice(1).toLowerCase();
    const pool = await fetchPool(supabase, {
      examId,
      topicIds,
      difficulty: capitalised as 'Easy' | 'Medium' | 'Hard',
      isPyq,
      years,
      excludeIds,
      limit: questionCount * POOL_MULTIPLIER,
    });

    return shuffle(pool).slice(0, questionCount);
  },
};
