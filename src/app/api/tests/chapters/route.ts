/**
 * GET /api/tests/chapters
 *
 * Returns chapters filtered by subject(s).
 * Used by the test creation wizard to populate chapter choices.
 *
 * Query params:
 *   ?subjectId=<uuid>          — filter to a single subject
 *   ?subjectIds=<id1>,<id2>    — filter to multiple subjects (comma-separated)
 */

import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { createClient } = await import('@supabase/supabase-js');
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const { searchParams } = new URL(request.url);
    const subjectId = searchParams.get('subjectId');
    const subjectIds = searchParams.get('subjectIds');

    let query = supabase
      .from('chapters')
      .select('id, name, subject_id')
      .order('name');

    if (subjectId) {
      query = query.eq('subject_id', subjectId);
    } else if (subjectIds) {
      const ids = subjectIds
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);
      if (ids.length > 0) {
        query = query.in('subject_id', ids);
      }
    }

    const { data: chapters, error } = await query;

    if (error) throw error;

    return NextResponse.json({ success: true, chapters: chapters ?? [] });
  } catch (error) {
    console.error('Chapters fetch error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch chapters' },
      { status: 500 }
    );
  }
}
