import { NextResponse } from 'next/server';
import { normalizeNotesText } from '@/lib/services/notes-converter-engine';
import {
  getStoredGeneration,
  updateStoredGeneration,
} from '@/lib/services/notes-converter-store';

export const runtime = 'nodejs';

const MIN_MEANINGFUL_CHARACTERS = 200;
const MAX_NORMALIZED_CHARACTERS = 40000;

function countMeaningfulCharacters(text: string) {
  return text.replace(/\s+/g, '').length;
}

export async function PATCH(
  request: Request,
  context: { params: Promise<{ generationId: string }> }
) {
  try {
    const { generationId } = await context.params;
    const generation = getStoredGeneration(generationId);
    if (!generation) {
      return NextResponse.json({ error: 'Generation not found.' }, { status: 404 });
    }

    const body = await request.json() as { editedText?: string };
    const editedText = typeof body.editedText === 'string' ? body.editedText : '';
    if (!editedText.trim()) {
      return NextResponse.json({ error: 'editedText is required.' }, { status: 400 });
    }

    const normalizedText = normalizeNotesText(editedText);
    if (countMeaningfulCharacters(normalizedText) < MIN_MEANINGFUL_CHARACTERS) {
      return NextResponse.json({ error: 'Not enough content to generate meaningful study material.' }, { status: 400 });
    }
    if (normalizedText.length > MAX_NORMALIZED_CHARACTERS) {
      return NextResponse.json({ error: 'Content is too large to process. Keep it under 40,000 characters.' }, { status: 400 });
    }

    updateStoredGeneration(generationId, {
      extractedText: editedText,
      editedText,
      normalizedText,
      processingStage: 'ready',
    });

    return NextResponse.json({
      generationId,
      normalizedText,
      characterCount: normalizedText.length,
      processingStage: 'ready',
    });
  } catch (error) {
    console.error('/api/notes-converter/[generationId]/source error:', error);
    return NextResponse.json({ error: 'Failed to save reviewed text.' }, { status: 500 });
  }
}
