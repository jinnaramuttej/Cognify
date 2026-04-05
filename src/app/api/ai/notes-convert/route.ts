import { NextResponse } from 'next/server';
import { callFeatherlessChat, getFeatherlessApiKey, getFeatherlessModel } from '@/lib/featherless';
import { checkRateLimit, validateInput } from '@/lib/rate-limit';

/**
 * AI Notes Conversion API Route
 * 
 * Accepts notes text + conversion type, returns structured output.
 * Uses Featherless chat completions matching existing Cognify AI pattern.
 * Rate limited: 20 requests/user/hour
 */

const PROMPTS: Record<string, string> = {
    flashcards: `Convert the following notes into flashcards. Return a JSON array where each item has "front" (question/concept) and "back" (answer/explanation) fields. Generate 8-15 flashcards. Return ONLY valid JSON, no other text.`,

    questions: `Generate 10 exam-level practice questions from the following notes. Return a JSON array where each item has: "question" (string), "options" (array of 4 strings), "correctIndex" (0-3), "explanation" (string). Return ONLY valid JSON, no other text.`,

    quiz: `Generate a 10-question quiz from the following notes. Return a JSON array where each item has: "question" (string), "options" (array of 4 strings), "correctIndex" (0-3), "explanation" (string). Return ONLY valid JSON, no other text.`,

    summary: `Create a structured summary of the following notes. Return a JSON array of sections where each has: "heading" (string) and "content" (string). Include Overview, Key Ideas, and Detailed Explanation sections. Return ONLY valid JSON, no other text.`,

    mindmap: `Create a concept hierarchy from the following notes. Return a JSON object with: "id" (string), "label" (main topic string), "children" (array of objects with same structure). Max 3 levels deep. Return ONLY valid JSON, no other text.`,

    formulas: `Extract all formulas, equations, and key definitions from the following notes. Return a JSON array where each item has: "name" (string), "formula" (string), "explanation" (string), "example" (optional string). Return ONLY valid JSON, no other text.`,

    keypoints: `Extract the most important key points from the following notes. Return a JSON array where each item has: "point" (string) and "importance" ("high", "medium", or "low"). Return ONLY valid JSON, no other text.`,
};

function extractJSON(text: string): any {
    // Try to find JSON array or object in the response
    const arrayMatch = text.match(/\[[\s\S]*\]/);
    if (arrayMatch) return JSON.parse(arrayMatch[0]);

    const objMatch = text.match(/\{[\s\S]*\}/);
    if (objMatch) return JSON.parse(objMatch[0]);

    return JSON.parse(text);
}

export async function POST(request: Request) {
    try {
        const { input_text, conversion_type, user_id } = await request.json();

        // Rate limit check
        const rateLimitId = user_id || 'anonymous';
        const { allowed, remaining, resetIn } = checkRateLimit(rateLimitId);
        if (!allowed) {
            return NextResponse.json(
                { error: `Rate limit exceeded. Try again in ${Math.ceil(resetIn / 60000)} minutes.`, remaining: 0 },
                { status: 429 }
            );
        }

        // Input validation
        const inputError = validateInput(input_text);
        if (inputError) {
            return NextResponse.json({ error: inputError }, { status: 400 });
        }

        if (!conversion_type) {
            return NextResponse.json({ error: 'Missing conversion_type' }, { status: 400 });
        }

        const prompt = PROMPTS[conversion_type];
        if (!prompt) {
            return NextResponse.json({ error: `Invalid conversion_type: ${conversion_type}` }, { status: 400 });
        }

        // Truncate input to ~6000 chars to stay within token limits
        const truncatedInput = input_text.length > 6000
            ? input_text.slice(0, 6000) + '\n[...truncated]'
            : input_text;

        const key = getFeatherlessApiKey();

        if (!key) {
            // Demo fallback
            return NextResponse.json({
                result: getDemoResult(conversion_type),
                demo: true,
            });
        }

        const content = await callFeatherlessChat([
            { role: 'system', content: prompt },
            { role: 'user', content: truncatedInput },
        ], {
            model: getFeatherlessModel('meta-llama/Meta-Llama-3.1-8B-Instruct'),
            temperature: 0.3,
            max_tokens: 4000,
        });

        try {
            const parsed = extractJSON(content);
            return NextResponse.json({ result: parsed, demo: false });
        } catch (parseErr) {
            console.error('JSON parse failed, raw:', content);
            return NextResponse.json({
                result: getDemoResult(conversion_type),
                demo: true,
                error: 'Failed to parse AI response',
            });
        }
    } catch (err) {
        console.error('/api/ai/convert-notes error:', err);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

function getDemoResult(type: string): any {
    switch (type) {
        case 'flashcards':
            return [
                { front: 'What is Newton\'s First Law?', back: 'An object at rest stays at rest, and an object in motion stays in motion, unless acted upon by an external force.' },
                { front: 'What is momentum?', back: 'Momentum (p) = mass × velocity. It is a vector quantity conserved in isolated systems.' },
                { front: 'Define acceleration', back: 'Rate of change of velocity. a = Δv/Δt. SI unit: m/s².' },
            ];
        case 'questions':
        case 'quiz':
            return [
                { question: 'Which law explains why passengers lurch forward when a bus stops?', options: ['First Law', 'Second Law', 'Third Law', 'Law of Gravitation'], correctIndex: 0, explanation: 'Newton\'s First Law (inertia) explains this.' },
                { question: 'What is the SI unit of force?', options: ['Joule', 'Newton', 'Watt', 'Pascal'], correctIndex: 1, explanation: 'Force is measured in Newtons (N = kg·m/s²).' },
            ];
        case 'summary':
            return [
                { heading: 'Overview', content: 'This section covers the fundamental concepts of classical mechanics.' },
                { heading: 'Key Ideas', content: 'Newton\'s three laws form the foundation. Force, mass, and acceleration are related by F=ma.' },
            ];
        case 'mindmap':
            return {
                id: '1', label: 'Classical Mechanics', children: [
                    {
                        id: '2', label: 'Newton\'s Laws', children: [
                            { id: '3', label: 'First Law (Inertia)', children: [] },
                            { id: '4', label: 'Second Law (F=ma)', children: [] },
                            { id: '5', label: 'Third Law (Action-Reaction)', children: [] },
                        ]
                    },
                    {
                        id: '6', label: 'Energy', children: [
                            { id: '7', label: 'Kinetic Energy', children: [] },
                            { id: '8', label: 'Potential Energy', children: [] },
                        ]
                    },
                ]
            };
        case 'formulas':
            return [
                { name: 'Newton\'s Second Law', formula: 'F = ma', explanation: 'Force equals mass times acceleration', example: 'F = 5kg × 2m/s² = 10N' },
                { name: 'Kinetic Energy', formula: 'KE = ½mv²', explanation: 'Energy of a moving object', example: 'KE = 0.5 × 2 × 3² = 9J' },
            ];
        case 'keypoints':
            return [
                { point: 'Newton\'s laws govern all classical mechanics problems', importance: 'high' },
                { point: 'Force, mass, and acceleration are related by F=ma', importance: 'high' },
                { point: 'Energy is always conserved in an isolated system', importance: 'medium' },
            ];
        default:
            return [];
    }
}
