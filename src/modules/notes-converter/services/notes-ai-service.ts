/**
 * Notes Converter v1 API client
 */

import type {
    ConversionType,
    GenerateResponse,
    IngestResponse,
    UpdateSourceResponse,
} from '../types/notes-types';

async function parseResponse<T>(response: Response): Promise<T> {
    const payload = await response.json();
    if (!response.ok) {
        throw new Error(payload?.error || 'Request failed');
    }
    return payload as T;
}

export async function ingestNotes(input: { text?: string; file?: File | null; sourceName?: string }) {
    const formData = new FormData();

    if (input.text) {
        formData.append('text', input.text);
    }
    if (input.file) {
        formData.append('file', input.file);
    }
    if (input.sourceName) {
        formData.append('sourceName', input.sourceName);
    }

    console.log('[notes-converter] ingest called', {
        hasText: Boolean(input.text?.trim()),
        hasFile: Boolean(input.file),
        sourceName: input.sourceName,
    });

    const response = await fetch('/api/notes-converter/ingest', {
        method: 'POST',
        body: formData,
    });

    const payload = await parseResponse<IngestResponse>(response);
    console.log('[notes-converter] ingest response', payload);
    return payload;
}

export async function saveReviewedText(generationId: string, editedText: string) {
    console.log('[notes-converter] save review called', { generationId, length: editedText.length });

    const response = await fetch(`/api/notes-converter/${generationId}/source`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ editedText }),
    });

    const payload = await parseResponse<UpdateSourceResponse>(response);
    console.log('[notes-converter] save review response', payload);
    return payload;
}

export async function generateNotesOutput<T extends ConversionType>(generationId: string, outputType: T) {
    console.log('[notes-converter] generate called', { generationId, outputType });

    const response = await fetch('/api/notes-converter/generate', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            generationId,
            outputType,
        }),
    });

    const payload = await parseResponse<GenerateResponse<T>>(response);
    console.log('[notes-converter] generate response', payload);
    return payload;
}
