import { NextResponse } from 'next/server';

/**
 * Study Pack API Route
 * 
 * Generates all 7 conversion types in parallel from a single input.
 * Returns a complete study pack.
 */

const CONVERSION_TYPES = ['summary', 'flashcards', 'questions', 'mindmap', 'formulas', 'keypoints'] as const;

export async function POST(request: Request) {
    try {
        const { input_text, user_id } = await request.json();

        if (!input_text || input_text.trim().length < 30) {
            return NextResponse.json({ error: 'Input too short' }, { status: 400 });
        }

        const baseUrl = request.headers.get('origin') || 'http://localhost:3000';

        // Call all conversion types in parallel via internal API
        const results = await Promise.allSettled(
            CONVERSION_TYPES.map(async (type) => {
                const res = await fetch(`${baseUrl}/api/ai/notes-convert`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ input_text, conversion_type: type, user_id }),
                });
                const data = await res.json();
                return { type, ...data };
            })
        );

        const studyPack: Record<string, any> = {};
        let isDemo = false;

        for (const result of results) {
            if (result.status === 'fulfilled') {
                const { type, result: data, demo } = result.value;
                studyPack[type] = data;
                if (demo) isDemo = true;
            }
        }

        return NextResponse.json({
            studyPack,
            demo: isDemo,
            generatedAt: new Date().toISOString(),
        });
    } catch (err) {
        console.error('/api/ai/study-pack error:', err);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
