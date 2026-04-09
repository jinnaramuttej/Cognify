import { NextResponse } from 'next/server';
import { callFeatherlessChat, getFeatherlessModel } from '@/lib/featherless';
import type { FeatherlessMessage } from '@/lib/featherless';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { questionText, userAnswer, correctAnswer, topic } = body;

    if (!questionText) {
      return NextResponse.json({ error: 'questionText is required' }, { status: 400 });
    }

    const systemPrompt = `You are Cognify, an expert AI tutor.
Your task is to explain why an answer is correct or incorrect in a clear, step-by-step manner.
- Be concise but thorough
- Use numbered steps
- End with the key insight to remember`;

    const userMessage = correctAnswer
      ? `Question: ${questionText}\n\nStudent answered: ${userAnswer || 'Did not attempt'}\nCorrect answer: ${correctAnswer}\n${topic ? `Topic: ${topic}` : ''}\n\nPlease explain why the correct answer is right and where the student went wrong (if applicable).`
      : `Question: ${questionText}\n\nPlease provide a complete step-by-step explanation.`;

    const messages: FeatherlessMessage[] = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userMessage },
    ];

    const aiResponse = await callFeatherlessChat(messages, {
      model: getFeatherlessModel('phi3'),
      temperature: 0.4,
      max_tokens: 800,
    });

    const responseText = String(aiResponse);
    const lines = responseText.split('\n').filter((l) => l.trim());
    const steps = lines.filter((l) => /^\d+\./.test(l.trim()));

    return NextResponse.json({
      success: true,
      explanation: responseText,
      structured: {
        concept: lines[0] || 'Key Concept',
        steps: steps.length > 0 ? steps : lines.slice(1, 5),
        keyInsight: lines[lines.length - 1] || responseText,
      },
    });
  } catch (error) {
    console.error('/api/ai/explain error:', error);
    const message = error instanceof Error ? error.message : 'Failed to generate explanation';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
