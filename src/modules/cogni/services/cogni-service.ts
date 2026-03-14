/**
 * Cogni Module — Service
 * 
 * Handles AI tutor API calls.
 */

import type { ChatMessage, TutorContext, CogniResponse } from '../types';

const API_BASE = '/api/cogni';

/**
 * Send a chat message to the Cogni AI tutor.
 * Returns a streamed response via SSE.
 */
export async function sendChatMessage(
    message: string,
    context: TutorContext,
    onChunk: (text: string) => void
): Promise<string> {
    const response = await fetch(`${API_BASE}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message, context }),
    });

    if (!response.ok) {
        throw new Error('Failed to get AI response');
    }

    // Handle streaming response
    const reader = response.body?.getReader();
    if (!reader) {
        const data = await response.json();
        return data.content || '';
    }

    const decoder = new TextDecoder();
    let fullText = '';

    while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n').filter(l => l.startsWith('data: '));

        for (const line of lines) {
            const data = line.slice(6);
            if (data === '[DONE]') break;

            try {
                const parsed = JSON.parse(data);
                if (parsed.content) {
                    fullText += parsed.content;
                    onChunk(fullText);
                }
            } catch {
                // Non-JSON data, append as-is
                fullText += data;
                onChunk(fullText);
            }
        }
    }

    return fullText;
}

/**
 * Get topic explanation from Cogni.
 */
export async function explainTopic(topicName: string, context: TutorContext): Promise<CogniResponse> {
    const response = await fetch(`${API_BASE}/explain`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic: topicName, context }),
    });

    if (!response.ok) throw new Error('Failed to get explanation');
    return response.json();
}

/**
 * Get mistake analysis for a specific test.
 */
export async function analyzeMistakes(testId: string, userId: string): Promise<CogniResponse> {
    const response = await fetch(`${API_BASE}/analyze-mistakes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ test_id: testId, user_id: userId }),
    });

    if (!response.ok) throw new Error('Failed to analyze mistakes');
    return response.json();
}
