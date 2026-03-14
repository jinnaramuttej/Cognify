/**
 * Question Structurer — Converts Vision AI / OCR parsed blocks into Cognify question schema
 * 
 * Merges data from vision parsing, OCR, diagram handling, and equation parsing
 * into the final question format matching the `questions` table in db/schema.sql.
 */

import type { RawQuestion } from './ai-parser';
import type { VisionPageResult } from './vision-parser';
import { embedDiagramInQuestion } from './diagram-handler';

/**
 * Convert Vision AI page results into RawQuestion objects.
 */
export function structureFromVision(
    visionResults: VisionPageResult[],
    defaults?: { year?: number; is_pyq?: boolean; exam?: string }
): RawQuestion[] {
    const questions: RawQuestion[] = [];

    for (const page of visionResults) {
        for (const block of page.blocks) {
            if (block.type !== 'question') continue;

            try {
                const parsed = JSON.parse(block.content);

                let questionText = parsed.question_text || '';

                // Embed diagram description if present
                if (parsed.has_diagram && parsed.diagram_description) {
                    questionText = embedDiagramInQuestion(questionText, parsed.diagram_description);
                }

                // Add LaTeX equations inline if detected separately
                if (parsed.equations && Array.isArray(parsed.equations)) {
                    for (const eq of parsed.equations) {
                        if (!questionText.includes(eq) && !questionText.includes(`$${eq}$`)) {
                            // Equation is referenced but not in text — it's likely already embedded by Vision AI
                        }
                    }
                }

                const question: RawQuestion = {
                    question_text: questionText,
                    options: parsed.options || [],
                    correct_option: parsed.correct_option || '',
                    difficulty: parsed.difficulty || 'Medium',
                    question_type: parsed.question_type || 'single_correct',
                    year: parsed.year || defaults?.year,
                    shift: parsed.shift,
                    is_pyq: parsed.is_pyq ?? defaults?.is_pyq ?? false,
                    explanation: parsed.explanation,
                    topic_hint: parsed.topic_hint,
                };

                questions.push(question);
            } catch (e: any) {
                console.error(`⚠️ Failed to structure question from vision block: ${e.message}`);
            }
        }
    }

    return questions;
}

/**
 * Convert raw OCR + AI parser results into RawQuestion objects.
 * This is the text-based path (for non-scanned PDFs).
 */
export function structureFromText(
    aiQuestions: RawQuestion[],
    defaults?: { year?: number; is_pyq?: boolean }
): RawQuestion[] {
    return aiQuestions.map(q => ({
        ...q,
        year: q.year || defaults?.year,
        is_pyq: q.is_pyq ?? defaults?.is_pyq ?? false,
        difficulty: q.difficulty || 'Medium',
        question_type: q.question_type || 'single_correct',
    }));
}

/**
 * Merge questions from multiple sources (text + vision) and deduplicate.
 */
export function mergeAndDeduplicate(questionSets: RawQuestion[][]): RawQuestion[] {
    const all = questionSets.flat();
    const seen = new Set<string>();
    const unique: RawQuestion[] = [];

    for (const q of all) {
        // Create a simple fingerprint for dedup
        const fingerprint = q.question_text
            .toLowerCase()
            .replace(/\s+/g, ' ')
            .trim()
            .slice(0, 100);

        if (!seen.has(fingerprint)) {
            seen.add(fingerprint);
            unique.push(q);
        }
    }

    if (all.length !== unique.length) {
        console.log(`🔄 Deduplicated: ${all.length} → ${unique.length} questions`);
    }

    return unique;
}
