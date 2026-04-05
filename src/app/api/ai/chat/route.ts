import { NextResponse } from 'next/server';
import { callFeatherlessChat, getFeatherlessModel } from '@/lib/featherless';
import type { FeatherlessMessage } from '@/lib/featherless';

type ChatRole = 'system' | 'user' | 'assistant';

function isChatRole(value: unknown): value is ChatRole {
  return value === 'system' || value === 'user' || value === 'assistant';
}

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
      (item): item is { role: ChatRole; content: string } =>
        Boolean(item) &&
        typeof item === 'object' &&
        isChatRole((item as { role?: unknown }).role) &&
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

function toErrorResponse(message = 'Something went wrong. Please try again.'): ChatResponse {
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
    const modelMessages: FeatherlessMessage[] = [
      { role: 'system', content: systemPrompt },
      ...safeHistory,
      { role: 'user', content: message },
    ];

    const aiMessage = await callFeatherlessChat(modelMessages, {
      model: getFeatherlessModel('phi3'),
      temperature: 0.6,
      max_tokens: 1200,
    });

    return NextResponse.json(toSuccessResponse(message, String(aiMessage)));
  } catch (error) {
    console.error('/api/ai/chat error:', error);
    const message = error instanceof Error ? error.message : 'Something went wrong. Please try again.';
    return NextResponse.json(toErrorResponse(message), { status: 500 });
  }
}
