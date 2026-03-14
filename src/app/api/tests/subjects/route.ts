/**
 * GET /api/tests/subjects
 *
 * Returns subjects, optionally filtered by examId.
 * Used by the test creation wizard to populate subject choices.
 *
 * Query params:
 *   ?examId=<uuid>  — filter to a specific exam
 */

import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // Public read — no auth needed (subjects table is public-read per RLS)
    // Import server client to avoid needing cookies
    const { createClient } = await import('@supabase/supabase-js');
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const { searchParams } = new URL(request.url);
    const examId = searchParams.get('examId');

    let query = supabase
      .from('subjects')
      .select('id, name, grade, exam_id')
      .order('name');

    if (examId) {
      query = query.eq('exam_id', examId);
    }

    const { data: subjects, error } = await query;

    if (error) throw error;

    return NextResponse.json({ success: true, subjects: subjects ?? [] });
  } catch (error) {
    console.error('Subjects fetch error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch subjects' },
      { status: 500 }
    );
  }
}
