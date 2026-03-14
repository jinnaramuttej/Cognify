import { NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export async function GET() {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    const { data: { session }, error: authError } = await supabase.auth.getSession()
    if (authError || !session) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const { data: tests, error } = await supabase
      .from('tests')
      .select('id, title, type, score, total_questions, duration_minutes, time_spent_seconds, config, created_at, updated_at')
      .eq('user_id', session.user.id)
      .eq('status', 'completed')
      .order('updated_at', { ascending: false })
      .limit(30)

    if (error) throw error

    const history = (tests ?? []).map((t: any) => {
      const maxMarks = (t.total_questions ?? 0) * 4
      const accuracy = maxMarks > 0 ? Math.round(((t.score ?? 0) / maxMarks) * 100) : 0
      const clampedAccuracy = Math.max(0, Math.min(100, accuracy))
      const completedAt = t.updated_at ?? t.created_at
      return {
        id: t.id,
        testId: t.id,           // alias expected by history page navigation
        testName: t.title ?? 'Practice Test',
        type: t.type ?? 'custom',
        subject: (t.config?.subject_ids ?? []).join(', ') || 'Full Syllabus',
        score: t.score ?? 0,
        totalMarks: maxMarks,
        accuracy: clampedAccuracy,
        percentage: clampedAccuracy,  // alias used by history page progress bar
        timeSpent: t.time_spent_seconds ?? 0,
        completedAt,
        submittedAt: completedAt,   // alias expected by history page date display
        startedAt: t.created_at,
        status: 'completed',
        weakTopics: [],
      }
    })

    const totalTests = history.length
    const avgAccuracy = totalTests > 0
      ? Math.round(history.reduce((s: number, h: any) => s + h.accuracy, 0) / totalTests)
      : 0
    const totalTime = history.reduce((s: number, h: any) => s + h.timeSpent, 0)

    let improvement = 0
    if (history.length >= 2) {
      const recent = history.slice(0, Math.ceil(history.length / 2))
      const older = history.slice(Math.ceil(history.length / 2))
      const recentAvg = recent.reduce((s: number, h: any) => s + h.accuracy, 0) / recent.length
      const olderAvg = older.reduce((s: number, h: any) => s + h.accuracy, 0) / older.length
      improvement = Math.round(recentAvg - olderAvg)
    }

    return NextResponse.json({
      success: true,
      history,
      stats: {
        totalTests,
        avgAccuracy,
        averageScore: avgAccuracy,  // alias expected by history page StatCard
        totalTime,
        improvement,
        improving: improvement > 0,
      },
    })
  } catch (error) {
    console.error('Error fetching test history:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch history' },
      { status: 500 }
    )
  }
}
