import { NextResponse } from 'next/server';
import { getStoredGeneration } from '@/lib/services/notes-converter-store';

export const runtime = 'nodejs';

export async function GET(
  _request: Request,
  context: { params: Promise<{ generationId: string }> }
) {
  const { generationId } = await context.params;
  const generation = getStoredGeneration(generationId);

  if (!generation) {
    return NextResponse.json({ error: 'Generation not found.' }, { status: 404 });
  }

  return NextResponse.json(generation);
}
