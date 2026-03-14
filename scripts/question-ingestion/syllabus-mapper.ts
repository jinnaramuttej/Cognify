/**
 * Syllabus Mapper — Maps questions to the correct topic_id and exam_id
 * 
 * Queries the Cognify database hierarchy:
 *   exams → subjects → chapters → topics
 * to find the best-matching topic for each question.
 */

import { createClient } from '@supabase/supabase-js';
import type { RawQuestion } from './ai-parser';

function getSupabase() {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !key) throw new Error('Supabase env vars not set (NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)');
    return createClient(url, key);
}

interface TopicRecord {
    id: string;
    name: string;
    chapter_name: string;
    subject_name: string;
    exam_name: string;
    exam_id: string;
}

let topicCache: TopicRecord[] | null = null;

/**
 * Load the full topic hierarchy from the database.
 * Cached after first call.
 */
async function loadTopicHierarchy(): Promise<TopicRecord[]> {
    if (topicCache) return topicCache;

    const supabase = getSupabase();

    // Query topics with their parent chain
    const { data: topics, error: topicError } = await supabase
        .from('topics')
        .select(`
      id,
      name,
      chapter:chapters(
        name,
        subject:subjects(
          name,
          exam:exams(id, name)
        )
      )
    `);

    if (topicError) {
        throw new Error(`Failed to load topics: ${topicError.message}`);
    }

    topicCache = (topics || []).map((t: any) => ({
        id: t.id,
        name: t.name,
        chapter_name: t.chapter?.name || '',
        subject_name: t.chapter?.subject?.name || '',
        exam_name: t.chapter?.subject?.exam?.name || '',
        exam_id: t.chapter?.subject?.exam?.id || '',
    }));

    console.log(`📚 Loaded ${topicCache.length} topics from database`);
    return topicCache;
}

/**
 * Load exam records for direct exam_id lookup.
 */
let examCache: { id: string; name: string }[] | null = null;

async function loadExams(): Promise<{ id: string; name: string }[]> {
    if (examCache) return examCache;

    const supabase = getSupabase();
    const { data, error } = await supabase
        .from('exams')
        .select('id, name');

    if (error) throw new Error(`Failed to load exams: ${error.message}`);
    examCache = data || [];
    return examCache;
}

/**
 * Find the best matching topic for a question using keyword matching.
 */
function findTopicMatch(
    topicHint: string,
    topics: TopicRecord[],
    constraints?: { exam?: string; subject?: string }
): TopicRecord | null {
    const hint = topicHint.toLowerCase().trim();
    if (!hint) return null;

    // Filter by exam/subject if provided
    let candidates = topics;
    if (constraints?.exam) {
        const examLower = constraints.exam.toLowerCase();
        candidates = candidates.filter(t => t.exam_name.toLowerCase().includes(examLower));
    }
    if (constraints?.subject) {
        const subjLower = constraints.subject.toLowerCase();
        candidates = candidates.filter(t => t.subject_name.toLowerCase().includes(subjLower));
    }

    // Exact topic name match
    const exact = candidates.find(t => t.name.toLowerCase() === hint);
    if (exact) return exact;

    // Topic name contains hint
    const contains = candidates.find(t => t.name.toLowerCase().includes(hint));
    if (contains) return contains;

    // Hint contains topic name
    const reverse = candidates.find(t => hint.includes(t.name.toLowerCase()));
    if (reverse) return reverse;

    // Chapter name match
    const chapterMatch = candidates.find(t => t.chapter_name.toLowerCase().includes(hint));
    if (chapterMatch) return chapterMatch;

    // Fuzzy: check if any word in hint matches topic/chapter
    const hintWords = hint.split(/\s+/).filter(w => w.length > 3);
    for (const word of hintWords) {
        const fuzzy = candidates.find(t =>
            t.name.toLowerCase().includes(word) ||
            t.chapter_name.toLowerCase().includes(word)
        );
        if (fuzzy) return fuzzy;
    }

    return null;
}

/**
 * Find exam_id by name.
 */
async function findExamId(examName: string): Promise<string | null> {
    const exams = await loadExams();
    const match = exams.find(e =>
        e.name.toLowerCase() === examName.toLowerCase() ||
        e.name.toLowerCase().includes(examName.toLowerCase())
    );
    return match?.id || null;
}

export interface MappedQuestion extends RawQuestion {
    topic_id: string | null;
    exam_id: string | null;
}

/**
 * Map a batch of questions to topic_ids and exam_ids.
 */
export async function mapQuestions(
    questions: RawQuestion[],
    context?: { exam?: string; subject?: string }
): Promise<{ mapped: MappedQuestion[]; unmapped: RawQuestion[] }> {
    const topics = await loadTopicHierarchy();
    const examId = context?.exam ? await findExamId(context.exam) : null;

    const mapped: MappedQuestion[] = [];
    const unmapped: RawQuestion[] = [];

    for (const q of questions) {
        const topicHint = q.topic_hint || '';
        const match = findTopicMatch(topicHint, topics, context);

        if (match) {
            mapped.push({
                ...q,
                topic_id: match.id,
                exam_id: match.exam_id || examId,
            });
        } else {
            // Still include with null topic_id — can be mapped later
            mapped.push({
                ...q,
                topic_id: null,
                exam_id: examId,
            });
            unmapped.push(q);
        }
    }

    const mappedCount = mapped.filter(m => m.topic_id !== null).length;
    console.log(`🗺️  Mapped ${mappedCount}/${questions.length} questions to topics (${unmapped.length} unmapped)`);

    return { mapped, unmapped };
}
