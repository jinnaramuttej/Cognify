const FEATHERLESS_CHAT_COMPLETIONS_URL =
  process.env.FEATHERLESS_CHAT_COMPLETIONS_URL?.trim() ||
  'https://api.featherless.ai/v1/chat/completions';

export interface FeatherlessMessage {
  role: 'system' | 'user' | 'assistant';
  content: string | Array<Record<string, unknown>>;
}

export function getFeatherlessApiKey() {
  return process.env.FEATHERLESS_API_KEY || process.env.STITCH_API_KEY || process.env.AI_API_KEY || null;
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
  options?: { model?: string; temperature?: number; max_tokens?: number; response_format?: unknown }
): Promise<string> {
  const apiKey = getFeatherlessApiKey();
  if (!apiKey) {
    throw new Error('FEATHERLESS_API_KEY (or STITCH_API_KEY / AI_API_KEY) is not configured.');
  }

  const response = await fetch(FEATHERLESS_CHAT_COMPLETIONS_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: getFeatherlessModel(options?.model || 'meta-llama/Meta-Llama-3.1-8B-Instruct'),
      messages,
      temperature: options?.temperature ?? 0.1,
      max_tokens: options?.max_tokens ?? 3000,
      ...(options?.response_format ? { response_format: options.response_format } : {}),
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Featherless API error (${response.status}): ${errorText}`);
  }

  const data = await response.json();
  return data?.choices?.[0]?.message?.content ?? '';
}
