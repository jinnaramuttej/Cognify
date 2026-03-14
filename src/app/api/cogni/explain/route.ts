/**
 * POST /api/cogni/explain
 *
 * Explains a specific question step-by-step using Groq.
 * Called when a student clicks "Explain" on a question.
 */

import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { checkRateLimit } from '@/lib/rate-limit';

const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions';
const MODEL = 'llama-3.3-70b-versatile';

function getGroqKey(): string | null {
  return process.env.GROQ_API_KEY || null;
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });

    const {
      data: { session },
    } = await supabase.auth.getSession();

    const userId = session?.user?.id || 'anonymous';

    // Rate limit: 20 requests/hour
    const { allowed, remaining, resetIn } = checkRateLimit(userId);
    if (!allowed) {
      return NextResponse.json(
        { error: `Rate limit exceeded. Try again in ${Math.ceil(resetIn / 60000)} minutes.` },
        { status: 429 }
      );
    }

    const { questionText, options, correctOption, userAnswer, topic, exam } = await request.json();

    if (!questionText) {
      return NextResponse.json({ error: 'questionText is required' }, { status: 400 });
    }

    const groqKey = getGroqKey();

    // Format options for display
    const optionsText = Array.isArray(options)
      ? options.map((o: { label: string; text: string }) => `(${o.label}) ${o.text}`).join('\n')
      : String(options || '');

    const systemPrompt = `You are Cognify, an expert AI tutor for JEE, NEET, and BITSAT exam preparation.
Your job is to explain questions clearly and concisely.
Always follow this structure:
1. **Understanding** — What concept does this question test?
2. **Strategy** — What approach/technique to use?
3. **Step-by-Step Solution** — Solve it clearly with each step numbered
4. **Key Formula/Concept** — State the core formula or concept
5. **Why other options are wrong** — Briefly explain why incorrect options fail
6. **Quick Tip** — One line to remember for similar questions

Use LaTeX for math: inline with $...$ and block with $$...$$
Be concise but complete. Max 500 words.`;

    const userMessage = `Question: ${questionText}

Options:
${optionsText}

Correct Answer: ${correctOption || 'Not provided'}
${userAnswer ? `Student's Answer: ${userAnswer}` : ''}
${topic ? `Topic: ${topic}` : ''}
${exam ? `Exam: ${exam}` : ''}

Please explain this question step-by-step.`;

    if (!groqKey) {
      // Demo mode
      return NextResponse.json({
        explanation: `**Demo Mode** (Configure GROQ_API_KEY to get real AI explanations)

**Understanding:** This question tests your knowledge of ${topic || 'the topic'}.

**Key Concept:** Review the fundamental concepts and formulas related to ${topic || 'this topic'}.

**Step-by-Step:** 
1. Read the question carefully
2. Identify the known and unknown quantities  
3. Apply the relevant formula
4. Verify your answer

Configure your GROQ_API_KEY in the .env.local file to unlock full AI explanations.`,
        demo: true,
        remaining,
      });
    }

    const response = await fetch(GROQ_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${groqKey}`,
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userMessage },
        ],
        temperature: 0.3,
        max_tokens: 1024,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Groq API error:', response.status, errorText);
      return NextResponse.json({ error: 'AI service error. Please try again.' }, { status: 502 });
    }

    const data = await response.json();
    const explanation = data?.choices?.[0]?.message?.content || 'Could not generate explanation.';

    return NextResponse.json({ explanation, demo: false, remaining });
  } catch (error) {
    console.error('Cogni explain error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
