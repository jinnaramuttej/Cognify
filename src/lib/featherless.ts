const FEATHERLESS_CHAT_COMPLETIONS_URL = 'https://api.featherless.ai/v1/chat/completions';

export interface FeatherlessMessage {
  role: 'system' | 'user' | 'assistant';
  content: string | Array<Record<string, unknown>>;
}

export function getFeatherlessApiKey() {
  return (
    process.env.FEATHERLESS_API_KEY ??
    process.env.STITCH_API_KEY ??
    process.env.AI_API_KEY ??
    null
  );
}

export function getFeatherlessChatCompletionsUrl() {
  return process.env.FEATHERLESS_CHAT_COMPLETIONS_URL?.trim() || FEATHERLESS_CHAT_COMPLETIONS_URL;
}

export function getFeatherlessModel(defaultModel: string) {
  return (
    process.env.FEATHERLESS_MODEL?.trim() ||
    process.env.STITCH_MODEL?.trim() ||
    process.env.AI_MODEL?.trim() ||
    defaultModel
  );
}

export async function callFeatherlessChat(
  messages: FeatherlessMessage[],
  options?: {
    model?: string;
    temperature?: number;
    max_tokens?: number;
  }
) {
  const apiKey = getFeatherlessApiKey();
  if (!apiKey) {
    throw new Error('FEATHERLESS_API_KEY (or STITCH_API_KEY / AI_API_KEY) is not configured.');
  }

  const response = await fetch(getFeatherlessChatCompletionsUrl(), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: getFeatherlessModel(options?.model || 'meta-llama/Meta-Llama-3.1-8B-Instruct'),
      messages,
      temperature: options?.temperature ?? 0.3,
      max_tokens: options?.max_tokens ?? 3000,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Featherless API error ${response.status}: ${errorText}`);
  }

  const payload = await response.json();
  return payload?.choices?.[0]?.message?.content ?? '';
}
