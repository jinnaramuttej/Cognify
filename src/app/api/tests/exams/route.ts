/**
 * GET /api/tests/exams
 *
 * Returns all exams from the question bank. Used by the test creation
 * wizard to populate the exam picker. No auth required — exams are
 * public-read (RLS allows anon select).
 */

import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const EXAM_ICONS: Record<string, string> = {
  'JEE Main': '🎯',
  'JEE Advanced': '🚀',
  'NEET': '🏥',
  'NEET UG': '🏥',
  'BITSAT': '⚡',
  'WBJEE': '📐',
  'MHT CET': '🏛️',
};

export async function GET() {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    );

    const { data: exams, error } = await supabase
      .from('exams')
      .select('id, name, description')
      .order('name');

    if (error) throw error;

    const enriched = (exams ?? []).map((e: { id: string; name: string; description?: string }) => ({
      ...e,
      icon: EXAM_ICONS[e.name] ?? '📚',
    }));

    return NextResponse.json({ success: true, exams: enriched });
  } catch (error) {
    console.error('Exams fetch error:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch exams' }, { status: 500 });
  }
}
