import { NextResponse } from 'next/server';
import { getChatCompletionsURL, getPreferredModel, getUnifiedAIKey } from '@/lib/ai-provider';

interface StructuredPayload {
  concept: string;
  steps: string[];
  finalAnswer: string;
}

interface ChatResponse {
  message: string;
  structured: StructuredPayload;
  topicsDiscussed: string[];
  status: 'success' | 'error';
}

function sanitizeHistory(history: unknown[] = []) {
  return history
    .filter(
      (item): item is { role: string; content: string } =>
        Boolean(item) &&
        typeof item === 'object' &&
        typeof (item as { role?: unknown }).role === 'string' &&
        typeof (item as { content?: unknown }).content === 'string'
    )
    .map((item) => ({ role: item.role, content: item.content }));
}

function splitSentences(text: string) {
  return text
    .split(/\n+|(?<=[.!?])\s+/)
    .map((line) => line.trim())
    .filter(Boolean);
}

function buildStructured(messageText: string): StructuredPayload {
  const parts = splitSentences(messageText);
  const concept = parts[0] ?? 'Key Concept';
  const stepCandidates = parts.slice(1, 5);
  const steps = stepCandidates.length > 0
    ? stepCandidates
    : ['Understand the core idea.', 'Apply it step by step.', 'Verify the final result.'];
  const finalAnswer = parts[parts.length - 1] ?? messageText;

  return {
    concept,
    steps,
    finalAnswer,
  };
}

function extractTopics(inputMessage: string, aiMessage: string) {
  const content = `${inputMessage} ${aiMessage}`.toLowerCase();
  const tokens = content
    .split(/[^a-z0-9]+/)
    .filter((token) => token.length >= 4);

  const counts = new Map<string, number>();
  for (const token of tokens) {
    counts.set(token, (counts.get(token) ?? 0) + 1);
  }

  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([token]) => token);
}

function toSuccessResponse(userMessage: string, aiMessage: string): ChatResponse {
  return {
    message: aiMessage,
    structured: buildStructured(aiMessage),
    topicsDiscussed: extractTopics(userMessage, aiMessage),
    status: 'success',
  };
}

function toErrorResponse(): ChatResponse {
  const message = 'Something went wrong. Please try again.';
  return {
    message,
    structured: {
      concept: message,
      steps: [message],
      finalAnswer: message,
    },
    topicsDiscussed: [],
    status: 'error',
  };
}

const systemPrompt = `You are Cognify, an AI tutor.
Rules:
- Teach one concept at a time.
- Explain clearly in short steps.
- Be calm and encouraging.`;

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const message = typeof body?.message === 'string' ? body.message.trim() : '';
    const history = Array.isArray(body?.history) ? body.history : [];

    if (!message) {
      return NextResponse.json(toErrorResponse(), { status: 400 });
    }

    const safeHistory = sanitizeHistory(history);
    const modelMessages = [
      { role: 'system', content: systemPrompt },
      ...safeHistory,
      { role: 'user', content: message },
    ];

    const key = getUnifiedAIKey();
    if (!key) {
      const demoMessage = `Demo Cognify: I heard "${message}". Try asking for a concept breakdown.`;
      return NextResponse.json(toSuccessResponse(message, demoMessage));
    }

    const res = await fetch(getChatCompletionsURL(), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${key}`,
      },
      body: JSON.stringify({
        model: getPreferredModel('llama-3.1-8b-instant'),
        messages: modelMessages,
        temperature: 0.6,
      }),
    });

    if (!res.ok) {
      throw new Error(`AI provider returned ${res.status}`);
    }

    const payload = await res.json();
    const aiMessage = payload?.choices?.[0]?.message?.content ?? 'I could not generate a response.';
    return NextResponse.json(toSuccessResponse(message, String(aiMessage)));
  } catch (error) {
    console.error('/api/ai/chat error:', error);
    return NextResponse.json(toErrorResponse(), { status: 500 });
  }
}
