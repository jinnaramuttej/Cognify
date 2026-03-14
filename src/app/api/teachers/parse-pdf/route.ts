import { NextRequest, NextResponse } from 'next/server';

// POST /api/teachers/parse-pdf
// Accepts a PDF file upload and returns parsed questions.
// Connects to the question ingestion pipeline in scripts/question-ingestion/
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file || file.type !== 'application/pdf') {
      return NextResponse.json({ error: 'A valid PDF file is required' }, { status: 400 });
    }

    // Read the file into a buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // TODO: Connect to the actual ingestion pipeline when available.
    // For now, return a structured response indicating the pipeline is pending.
    // The ingestion scripts in scripts/question-ingestion/ can be imported
    // and called here once they are compiled to a compatible module format.

    return NextResponse.json({
      filename: file.name,
      size: buffer.length,
      questions: [],
      message: 'PDF received. Connect ingestion pipeline (scripts/question-ingestion/) for real parsing.',
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to process PDF' }, { status: 500 });
  }
}
