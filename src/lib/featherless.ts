const OLLAMA_BASE_URL = process.env.OLLAMA_BASE_URL?.trim() || 'http://127.0.0.1:11434';

export interface FeatherlessMessage {
  role: 'system' | 'user' | 'assistant';
  content: string | Array<Record<string, unknown>>;
}

interface OllamaMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

function extractDataUrlBase64(value: unknown): string | null {
  if (typeof value !== 'string') {
    return null;
  }
  const marker = 'base64,';
  const idx = value.indexOf(marker);
  if (idx === -1) {
    return null;
  }
  return value.slice(idx + marker.length).trim() || null;
}

function normalizeMessageContent(content: FeatherlessMessage['content']): string {
  if (typeof content === 'string') {
    return content;
  }

  const textParts: string[] = [];

  for (const part of content) {
    if (!part || typeof part !== 'object') {
      continue;
    }

    const candidateType = (part as { type?: unknown }).type;
    if (candidateType === 'text') {
      const text = (part as { text?: unknown }).text;
      if (typeof text === 'string' && text.trim()) {
        textParts.push(text.trim());
      }
      continue;
    }

    if (candidateType === 'image_url') {
      const imageUrl = (part as { image_url?: { url?: unknown } }).image_url?.url;
      const base64 = extractDataUrlBase64(imageUrl);
      if (base64) {
        textParts.push('[Image content omitted for phi3 text model]');
      }
    }
  }

  return textParts.join('\n').trim() || 'Analyze the provided content.';
}

function toOllamaMessages(messages: FeatherlessMessage[]): OllamaMessage[] {
  return messages.map((message) => {
    const normalizedText = normalizeMessageContent(message.content);
    return {
      role: message.role,
      content: normalizedText,
    };
  });
}

export function getFeatherlessApiKey() {
  return (
    process.env.FEATHERLESS_API_KEY ??
    process.env.STITCH_API_KEY ??
    process.env.AI_API_KEY ??
    'OLLAMA_LOCAL'
  );
}

export function getFeatherlessChatCompletionsUrl() {
  return `${OLLAMA_BASE_URL.replace(/\/$/, '')}/api/chat`;
}

export function getFeatherlessModel(_defaultModel: string) {
  return process.env.OLLAMA_MODEL?.trim() || 'phi3';
}

export async function callFeatherlessChat(
  messages: FeatherlessMessage[],
  options?: {
    model?: string;
    temperature?: number;
    max_tokens?: number;
  }
) {
  const response = await fetch(getFeatherlessChatCompletionsUrl(), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: getFeatherlessModel(options?.model || 'phi3'),
      messages: toOllamaMessages(messages),
      stream: false,
      options: {
        temperature: options?.temperature ?? 0.3,
        num_predict: options?.max_tokens ?? 3000,
      },
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Ollama error ${response.status}: ${errorText}`);
  }

  const payload = await response.json();
  return String(payload?.message?.content ?? payload?.response ?? '');
}
