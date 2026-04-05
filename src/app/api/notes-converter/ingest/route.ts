import { NextResponse } from 'next/server';
import {
  computeExamFocus,
  detectExam,
  normalizeNotesText,
} from '@/lib/services/notes-converter-engine';
import { createStoredGeneration } from '@/lib/services/notes-converter-store';

export const runtime = 'nodejs';

const MIN_MEANINGFUL_CHARACTERS = 200;
const USER_INPUT_ERRORS = new Set([
  'Not enough content to generate meaningful study material.',
  'Content is too large to process. Keep it under 40,000 characters.',
]);

function countMeaningfulCharacters(text: string) {
  return text.replace(/\s+/g, '').length;
}

function validateNormalizedText(text: string) {
  const meaningfulCharacters = countMeaningfulCharacters(text);
  if (meaningfulCharacters < MIN_MEANINGFUL_CHARACTERS) {
    throw new Error('Not enough content to generate meaningful study material.');
  }

  if (text.length > 40000) {
    throw new Error('Content is too large to process. Keep it under 40,000 characters.');
  }
}

async function extractPdfText(file: File) {
  const buffer = Buffer.from(await file.arrayBuffer());
  const pdfParseModule = await import('pdf-parse');
  const pdfParse = ('default' in pdfParseModule ? pdfParseModule.default : pdfParseModule) as (
    dataBuffer: Buffer
  ) => Promise<{ text?: string }>;
  const result = await pdfParse(buffer);
  return result.text ?? '';
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const sourceFile = formData.get('file');
    const sourceText = formData.get('text');
    const sourceName = formData.get('sourceName');

    const file = sourceFile instanceof File ? sourceFile : null;
    const text = typeof sourceText === 'string' ? sourceText : '';
    const explicitSourceName = typeof sourceName === 'string' ? sourceName.trim() : '';

    if (!file && !text.trim()) {
      return NextResponse.json({ error: 'Paste notes or upload a PDF first.' }, { status: 400 });
    }

    let extractedText = '';
    let resolvedSourceType: 'text' | 'pdf' = 'text';
    let resolvedSourceName = explicitSourceName || 'pasted-notes';
    let resolvedMime = 'text/plain';

    if (file) {
      if (file.type !== 'application/pdf') {
        return NextResponse.json({ error: 'Only PDF uploads are supported in v1.' }, { status: 400 });
      }

      resolvedSourceType = 'pdf';
      resolvedSourceName = file.name || resolvedSourceName;
      resolvedMime = file.type;
      extractedText = await extractPdfText(file);
    } else {
      extractedText = text;
    }

    if (!extractedText.trim()) {
      return NextResponse.json({ error: 'Could not extract text from the provided source.' }, { status: 400 });
    }

    const normalizedText = normalizeNotesText(extractedText);
    validateNormalizedText(normalizedText);

    const detectedExam = detectExam(normalizedText);
    const examFocus = computeExamFocus(normalizedText);
    const generationId = crypto.randomUUID();

    createStoredGeneration({
      id: generationId,
      sourceType: resolvedSourceType,
      sourceName: resolvedSourceName,
      sourceMime: resolvedMime,
      extractedText,
      editedText: extractedText,
      normalizedText,
      detectedExam,
      examFocus,
      processingStage: 'review',
    });

    return NextResponse.json({
      generationId,
      sourceType: resolvedSourceType,
      sourceName: resolvedSourceName,
      detectedExam,
      examFocus,
      extractedText,
      normalizedText,
      characterCount: normalizedText.length,
      processingStage: 'review',
    });
  } catch (error) {
    console.error('/api/notes-converter/ingest error:', error);
    const message = error instanceof Error ? error.message : 'Failed to ingest notes.';
    const status = USER_INPUT_ERRORS.has(message) ? 400 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
