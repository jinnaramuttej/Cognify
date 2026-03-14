import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs';

const systemPrompt = `
You are Cognify Competitive Exam Analyst, an expert mentor for JEE and NEET.
Your goal is to perform "Mistake Clustering" on the student's test results.

Analyze the provided question data (incorrect answers, time spent, topic) and return a structured report:

1. **Mistake Clusters**:
   - Classify errors into: **Conceptual Gaps**, **Calculation/Silly Mistakes**, and **Time Pressure Errors**.
   - Briefly explain why these clusters formed.

2. **Subject Performance**:
   - Quick summary of their strongest and weakest subject/area.

3. **Weak Topic Priority**:
   - Rank the topics they need to focus on (highest priority first).

4. **Cogni's Action Plan (5 Steps)**:
   - Provide 5 extremely specific practice recommendations (e.g., "Solve 20 PYQs of Kinematics focusing on Relative Motion").

5. **Competitive Edge**:
   - Give 1 tip for exam-day time management.

Format: Use bold headers and clean markdown lists. Be professional, direct, and encouraging.
`;

export async function POST(req: NextRequest) {
    try {
        const { questions, testScore, examType } = await req.json();

        if (!questions || !Array.isArray(questions)) {
            return NextResponse.json({ error: 'Questions data is required' }, { status: 400 });
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
                reply: "### AI Analyzer (Demo Mode)\n\n**Mistake Clusters**:\n- **Conceptual Gaps**: Significant errors in Kinematics and Laws of Motion.\n- **Calculation**: Minor silly mistakes in Newton's Third Law applications.\n\n**Action Plan**:\n1. Solve 10 PYQs of Units & Dimensions.\n2. Revise Relative Motion formulas.\n3. Take a focused Kinematics 15-min mini-test.",
                demo: true
            });
        }

        const messages = [
            { role: "system", content: systemPrompt },
            { role: "user", content: `Analyze this competitive test result for ${examType}. Net Score: ${testScore}. Question Data: ${JSON.stringify(questions)}` }
        ];

        const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${groqKey}`
            },
            body: JSON.stringify({
                model: "llama-3.1-70b-versatile", // Use a larger model for deep analysis if possible
                messages,
                temperature: 0.6
            })
        });

        const data = await res.json();
        const reply = data?.choices?.[0]?.message?.content || "Could not generate clustering analysis.";

        return NextResponse.json({ reply, demo: false });

    } catch (error) {
        console.error('AI Analysis Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
