import type { ConversionType, DetectedExam, ExamFocus, OutputMap } from '@/modules/notes-converter/types/notes-types';

export interface StoredGeneration {
  id: string;
  sourceType: 'text' | 'pdf';
  sourceName: string;
  sourceMime: string;
  extractedText: string;
  editedText?: string;
  normalizedText: string;
  detectedExam: DetectedExam;
  examFocus: ExamFocus;
  processingStage: string;
  outputs: Partial<OutputMap>;
  createdAt: string;
}

const generationStore = new Map<string, StoredGeneration>();

export function createStoredGeneration(input: Omit<StoredGeneration, 'outputs' | 'createdAt'> & { outputs?: Partial<OutputMap> }) {
  const next: StoredGeneration = {
    ...input,
    outputs: input.outputs ?? {},
    createdAt: new Date().toISOString(),
  };
  generationStore.set(next.id, next);
  return next;
}

export function updateStoredGeneration(id: string, updates: Partial<StoredGeneration>) {
  const current = generationStore.get(id);
  if (!current) {
    return null;
  }

  const next = {
    ...current,
    ...updates,
    outputs: updates.outputs ? { ...current.outputs, ...updates.outputs } : current.outputs,
  };
  generationStore.set(id, next);
  return next;
}

export function getStoredGeneration(id: string) {
  return generationStore.get(id) ?? null;
}

export function getStoredOutput(id: string, outputType: ConversionType) {
  const generation = generationStore.get(id);
  return generation?.outputs?.[outputType] ?? null;
}

export function listStoredGenerations() {
  return [...generationStore.values()]
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}
