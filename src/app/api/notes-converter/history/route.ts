import { NextResponse } from 'next/server';
import { listStoredGenerations } from '@/lib/services/notes-converter-store';

export const runtime = 'nodejs';

export async function GET() {
  const studyPacks = listStoredGenerations().map((generation) => ({
    id: generation.id,
    createdAt: generation.createdAt,
    sourceType: generation.sourceType,
    sourceName: generation.sourceName,
    detectedExam: generation.detectedExam,
    examFocus: generation.examFocus,
    processingStage: generation.processingStage,
    availableOutputs: Object.keys(generation.outputs),
    characterCount: generation.normalizedText.length,
  }));

  return NextResponse.json({ studyPacks });
}
