import { NextResponse } from 'next/server';
import { generateStudyOutput } from '@/lib/services/notes-converter-engine';
import {
  getStoredGeneration,
  getStoredOutput,
  updateStoredGeneration,
} from '@/lib/services/notes-converter-store';
import type { ConversionType } from '@/modules/notes-converter/types/notes-types';

export const runtime = 'nodejs';

interface GenerateRequest {
  generationId?: string;
  outputType?: ConversionType;
}

function isValidOutputType(value: unknown): value is ConversionType {
  return value === 'summary' || value === 'flashcards' || value === 'quiz';
}

export async function POST(request: Request) {
  try {
    const body = await request.json() as GenerateRequest;
    const generationId = typeof body.generationId === 'string' ? body.generationId.trim() : '';
    const outputType = body.outputType;

    if (!generationId) {
      return NextResponse.json({ error: 'generationId is required.' }, { status: 400 });
    }

    if (!isValidOutputType(outputType)) {
      return NextResponse.json({ error: 'outputType must be summary, flashcards, or quiz.' }, { status: 400 });
    }

    const generation = getStoredGeneration(generationId);
    if (!generation) {
      return NextResponse.json({ error: 'Generation not found. Re-ingest the source and try again.' }, { status: 404 });
    }

    const cached = getStoredOutput(generationId, outputType);
    if (cached) {
      return NextResponse.json({
        generationId,
        outputType,
        result: cached,
        processingStage: 'completed',
      });
    }

    updateStoredGeneration(generationId, {
      processingStage: `generating ${outputType}`,
    });

    const result = await generateStudyOutput(
      outputType,
      generation.normalizedText,
      generation.detectedExam,
      generation.examFocus
    );

    updateStoredGeneration(generationId, {
      processingStage: 'completed',
      outputs: {
        [outputType]: result,
      },
    });

    return NextResponse.json({
      generationId,
      outputType,
      result,
      processingStage: 'completed',
    });
  } catch (error) {
    console.error('/api/notes-converter/generate error:', error);
    return NextResponse.json({ error: 'Failed to generate study output.' }, { status: 500 });
  }
}
