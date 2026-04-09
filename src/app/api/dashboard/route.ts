import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

function getMockDashboard() {
  return {
    streak: { current_streak: 14, longest_streak: 21 },
    todayStudyTime: 47 * 60, // seconds
    totalStudyTime: 124 * 60 * 60, // seconds
    accuracy: 78,
    questionsAttempted: 2295,
    recentSessions: [
      {
        id: 'session_1',
        start_time: new Date(Date.now() - 2 * 3600000).toISOString(),
        duration_seconds: 47 * 60,
      },
      {
        id: 'session_2',
        start_time: new Date(Date.now() - 26 * 3600000).toISOString(),
        duration_seconds: 92 * 60,
      },
      {
        id: 'session_3',
        start_time: new Date(Date.now() - 50 * 3600000).toISOString(),
        duration_seconds: 35 * 60,
      },
    ],
    assignedTests: [],
    upcomingEvents: [
      { title: 'Live Arena Sprint', date: 'Apr 23 • 7:00 PM', type: 'arena' },
      { title: 'Algebra Assignment: Set 5', date: 'Due Apr 25', type: 'assignment' },
    ],
    recommendations: [
      { title: 'Algebra • Quadratics', reason: 'Weak on factorization • 6 practice items', action: 'Start', href: '/tests/create' },
      { title: 'Reading • Inference', reason: 'Suggested micro-lesson • 15 min', action: 'Review', href: '/library' },
    ],
  };
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'userId is required' }, { status: 400 });
    }

    try {
      const supabase = createRouteHandlerClient({ cookies });
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        return NextResponse.json({ success: true, data: getMockDashboard(), source: 'mock' });
      }

      // Fetch real data in parallel
      const [streakRes, sessionsRes, assignedRes] = await Promise.all([
        supabase
          .from('user_streaks')
          .select('current_streak, longest_streak')
          .eq('user_id', session.user.id)
          .single(),
        supabase
          .from('study_sessions')
          .select('id, start_time, duration_seconds')
          .eq('user_id', session.user.id)
          .order('start_time', { ascending: false })
          .limit(10),
        supabase
          .from('test_assignments')
          .select('*, tests(title, total_questions, duration_minutes)')
          .eq('student_id', session.user.id)
          .eq('status', 'pending'),
      ]);

      const mock = getMockDashboard();
      return NextResponse.json({
        success: true,
        data: {
          ...mock,
          streak: streakRes.data || mock.streak,
          recentSessions: sessionsRes.data || mock.recentSessions,
          assignedTests: assignedRes.data || [],
        },
        source: 'live',
      });

    } catch {
      return NextResponse.json({ success: true, data: getMockDashboard(), source: 'mock' });
    }

  } catch (error) {
    console.error('/api/dashboard error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
