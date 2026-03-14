/**
 * Notes AI Service — Client-side service for calling the notes conversion API
 */

import type { ConversionType, ConversionResult } from '../types/notes-types';

export async function convertNotes(
    inputText: string,
    conversionType: ConversionType
): Promise<{ result: any; demo: boolean; error?: string }> {
    const response = await fetch('/api/ai/notes-convert', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            input_text: inputText,
            conversion_type: conversionType,
        }),
    });

    if (!response.ok) {
        throw new Error('Conversion failed');
    }

    return response.json();
}
