import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs';

const systemPrompt = `
You are Cognify Tutor, an expert academic mentor.
Analyze the student's mistakes in their test.

For each incorrect question provided, explain:
1. Why the mistake might have occurred (conceptual gap vs calculation).
2. The core concept explained simply.
3. A practice suggestion.
4. 3 similar problems (just the problem statements or small examples).

Format the output in structured markdown that is easy to read.
Be encouraging and clear.
`;

export async function POST(req: NextRequest) {
    try {
        const { questions } = await req.json();

        if (!questions || !Array.isArray(questions)) {
            return NextResponse.json({ error: 'Questions array is required' }, { status: 400 });
        }

        const groqKey = (function getGroqKey() {
            if (process.env.GROQ_API_KEY) return process.env.GROQ_API_KEY;
            try {
                const envPath = path.join(process.cwd(), "src", "app", "ai", "ai", "backend", ".env");
                if (fs.existsSync(envPath)) {
                    const raw = fs.readFileSync(envPath, "utf8");
                    const m = raw.match(/^GROQ_API_KEY=(.+)$/m);
                    if (m) return m[1].trim();
                }
            } catch (e) { }
            return null;
        })();

        if (!groqKey) {
            return NextResponse.json({
                reply: "AI Tutor is in demo mode (API Key missing). Explanation: Conceptually, for Physics Grade 11, focus on Dimensional Analysis and Equation of Motion consistency.",
                demo: true
            });
        }

        const messages = [
            { role: "system", content: systemPrompt },
            { role: "user", content: `Here are my incorrect questions: ${JSON.stringify(questions)}` }
        ];

        const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${groqKey}`
            },
            body: JSON.stringify({
                model: "llama-3.1-8b-instant",
                messages,
                temperature: 0.7
            })
        });

        const data = await res.json();
        const reply = data?.choices?.[0]?.message?.content || "Could not generate analysis.";

        return NextResponse.json({ reply, demo: false });

    } catch (error) {
        console.error('AI Analysis Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
