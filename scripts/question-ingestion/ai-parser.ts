/**
 * AI Parser — Uses Featherless API to extract structured questions from raw text
 * 
 * Sends page text to an LLM and receives structured question objects.
 */

import {
    callFeatherlessChat,
    getFeatherlessApiKey,
    getFeatherlessModel,
} from './featherless-client';

export interface RawQuestion {
    question_text: string;
    options: { label: string; text: string }[];
    correct_option: string;
    difficulty: string;
    question_type: string;
    year?: number;
    shift?: string;
    is_pyq: boolean;
    explanation?: string;
    topic_hint?: string; // AI-detected topic name for syllabus mapping
}

interface AIMessage {
    role: 'system' | 'user' | 'assistant';
    content: string;
}

const SYSTEM_PROMPT = `You are a competitive exam question parser for Indian exams (JEE Main, JEE Advanced, NEET, BITSAT).

Your task: Given raw text from a question paper PDF, extract EACH question into a structured JSON format.

For EACH question, output:
{
  "question_text": "The full question text",
  "options": [
    {"label": "A", "text": "Option A text"},
    {"label": "B", "text": "Option B text"},
    {"label": "C", "text": "Option C text"},
    {"label": "D", "text": "Option D text"}
  ],
  "correct_option": "A",
  "difficulty": "Easy" | "Medium" | "Hard",
  "question_type": "single_correct" | "multi_correct" | "integer" | "numerical",
  "year": 2024,
  "shift": "Shift 1",
  "is_pyq": true,
  "explanation": "Brief solution explanation if available",
  "topic_hint": "The physics/chemistry/math topic this belongs to (e.g., Kinematics, Thermodynamics)"
}

Rules:
- question_type: Use "single_correct" for MCQs with one answer, "multi_correct" for multiple correct, "integer" for integer-type answers, "numerical" for numerical value answers.
- difficulty: Estimate based on the question complexity.
- For integer/numerical types, options array can be empty and correct_option should be the numerical answer as a string.
- Always try to detect the topic_hint from question content.
- If year/shift info is in the text header, apply it to all questions from that section.
- Return ONLY a JSON array of question objects. No other text.`;

/**
 * Call Featherless API with retry logic
 */
async function callAI(messages: AIMessage[], retries = 3): Promise<string> {
    const apiKey = getFeatherlessApiKey();
    if (!apiKey) {
        throw new Error('FEATHERLESS_API_KEY (or STITCH_API_KEY / AI_API_KEY) not set in environment');
    }

    for (let attempt = 1; attempt <= retries; attempt++) {
        try {
            return await callFeatherlessChat(messages, {
                model: getFeatherlessModel('meta-llama/Meta-Llama-3.1-8B-Instruct'),
                temperature: 0.1,
                max_tokens: 8000,
                response_format: { type: 'json_object' },
            });
        } catch (error: any) {
            const message = String(error?.message || error || 'unknown error');
            const isRateLimited = /429|rate limit/i.test(message);
            if (isRateLimited && attempt < retries) {
                const waitMs = Math.pow(2, attempt) * 1000;
                console.log(`⏳ Rate limited, waiting ${waitMs / 1000}s before retry...`);
                await new Promise(r => setTimeout(r, waitMs));
                continue;
            }
            if (attempt === retries) throw error;
            console.log(`⚠️ Attempt ${attempt} failed: ${error.message}. Retrying...`);
            await new Promise(r => setTimeout(r, 1000 * attempt));
        }
    }

    throw new Error('All retry attempts failed');
}

/**
 * Parse raw text from a single page into structured questions using AI.
 */
export async function parseQuestionsFromText(
    rawText: string,
    context?: { exam?: string; subject?: string; year?: number }
): Promise<RawQuestion[]> {
    if (!rawText || rawText.trim().length < 50) {
        return [];
    }

    const contextInfo = context
        ? `\nContext: Exam=${context.exam || 'unknown'}, Subject=${context.subject || 'unknown'}, Year=${context.year || 'unknown'}`
        : '';

    const messages: AIMessage[] = [
        { role: 'system', content: SYSTEM_PROMPT },
        {
            role: 'user',
            content: `Extract all questions from the following text. Return a JSON object with a "questions" array.${contextInfo}\n\n---\n${rawText.slice(0, 6000)}`,
        },
    ];

    const responseText = await callAI(messages);

    try {
        const parsed = JSON.parse(responseText);
        const questions: RawQuestion[] = parsed.questions || parsed || [];

        if (!Array.isArray(questions)) {
            console.log('⚠️ AI response was not an array, wrapping...');
            return [questions as RawQuestion];
        }

        return questions;
    } catch (e: any) {
        console.error(`❌ Failed to parse AI response: ${e.message}`);
        return [];
    }
}

/**
 * Process multiple pages of text through the AI parser.
 * Includes rate limiting between pages to avoid API throttling.
 */
export async function parseAllPages(
    pages: { pageNumber: number; text: string }[],
    context?: { exam?: string; subject?: string; year?: number }
): Promise<RawQuestion[]> {
    const allQuestions: RawQuestion[] = [];

    for (const page of pages) {
        if (page.text.trim().length < 50) {
            console.log(`⏭️  Page ${page.pageNumber}: skipped (too short)`);
            continue;
        }

        console.log(`🤖 Page ${page.pageNumber}: sending to AI parser...`);

        try {
            const questions = await parseQuestionsFromText(page.text, context);
            console.log(`✅ Page ${page.pageNumber}: extracted ${questions.length} questions`);
            allQuestions.push(...questions);
        } catch (error: any) {
            console.error(`❌ Page ${page.pageNumber}: failed — ${error.message}`);
        }

        // Rate limiting: wait 500ms between pages
        await new Promise(r => setTimeout(r, 500));
    }

    return allQuestions;
}
