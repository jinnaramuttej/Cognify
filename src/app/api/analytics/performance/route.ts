import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export async function GET(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    const { data: { session }, error: authError } = await supabase.auth.getSession()
    if (authError || !session) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const timeRange = searchParams.get('timeRange') || '30d'

    // Calculate start date
    const now = new Date()
    const startDate = new Date()
    switch (timeRange) {
      case '7d': startDate.setDate(now.getDate() - 7); break
      case '30d': startDate.setDate(now.getDate() - 30); break
      case '90d': startDate.setDate(now.getDate() - 90); break
      default: startDate.setFullYear(2000); break
    }

    // 1. Fetch completed tests in range
    const { data: tests, error: testsError } = await supabase
      .from('tests')
      .select('id, score, total_questions, time_spent_seconds, created_at, config')
      .eq('user_id', session.user.id)
      .eq('status', 'completed')
      .gte('created_at', startDate.toISOString())
      .order('created_at', { ascending: true })

    if (testsError) throw testsError

    // 2. Fetch all attempt questions for these tests with full metadata chain
    const testIds = (tests ?? []).map((t: { id: string }) => t.id)
    const { data: attempts, error: attemptsError } = testIds.length > 0
      ? await supabase
          .from('test_attempt_questions')
          .select(`
            id, test_id, is_correct, time_spent_seconds, user_answer,
            questions!inner(
              id, difficulty,
              topics!inner(
                id, name,
                chapters!inner(
                  id, name,
                  subjects!inner(id, name)
                )
              )
            )
          `)
          .in('test_id', testIds)
      : { data: [], error: null }

    if (attemptsError) throw attemptsError

    // 3. Build topic mastery map
    const topicMap = new Map<string, {
      topicId: string; topicName: string
      subjectId: string; subjectName: string
      attempted: number; correct: number; totalTime: number
      lastPracticed: string | null
    }>()

    for (const attempt of (attempts ?? [])) {
      const q = attempt.questions as any
      if (!q) continue
      const topic = q.topics as any
      const chapter = topic?.chapters as any
      const subject = chapter?.subjects as any
      if (!topic || !subject) continue

      if (!topicMap.has(topic.id)) {
        topicMap.set(topic.id, {
          topicId: topic.id, topicName: topic.name,
          subjectId: subject.id, subjectName: subject.name,
          attempted: 0, correct: 0, totalTime: 0, lastPracticed: null,
        })
      }
      const entry = topicMap.get(topic.id)!
      entry.attempted++
      if (attempt.is_correct) entry.correct++
      entry.totalTime += attempt.time_spent_seconds ?? 0
      const testCreatedAt = tests?.find((t: { id: string }) => t.id === attempt.test_id)?.created_at
      if (testCreatedAt && (!entry.lastPracticed || testCreatedAt > entry.lastPracticed)) {
        entry.lastPracticed = testCreatedAt
      }
    }

    const topicMastery = Array.from(topicMap.values()).map((t) => ({
      topicId: t.topicId,
      topicName: t.topicName,
      subjectId: t.subjectId,
      subjectName: t.subjectName,
      mastery: t.attempted > 0 ? Math.round((t.correct / t.attempted) * 100) : 0,
      questionsAttempted: t.attempted,
      questionsCorrect: t.correct,
      avgTime: t.attempted > 0 ? Math.round(t.totalTime / t.attempted) : 0,
      lastPracticed: t.lastPracticed,
    }))

    // 4. Build ability progression (score % per test over time)
    const abilityProgression = (tests ?? []).map((test: any) => ({
      timestamp: test.created_at,
      score: test.score ?? 0,
      totalQuestions: test.total_questions ?? 0,
      accuracy: test.total_questions > 0
        ? Math.round(((test.score ?? 0) / (test.total_questions * 4)) * 100)
        : 0,
      timeSpentSeconds: test.time_spent_seconds ?? 0,
    }))

    // 5. Time efficiency by difficulty
    const timeEfficiency = (attempts ?? [])
      .filter((a: any) => a.time_spent_seconds != null)
      .map((a: any) => ({
        questionId: a.id,
        timeSpent: a.time_spent_seconds,
        isCorrect: a.is_correct ?? false,
        difficulty: (a.questions as any)?.difficulty ?? 'medium',
        topic: ((a.questions as any)?.topics as any)?.name ?? 'Unknown',
      }))

    // 6. Summary stats
    const allAttempted = (attempts ?? []).length
    const allCorrect = (attempts ?? []).filter((a: any) => a.is_correct).length
    const weakTopics = topicMastery.filter(t => t.mastery < 40 && t.questionsAttempted >= 2).map(t => t.topicName)
    const strongTopics = topicMastery.filter(t => t.mastery >= 70).map(t => t.topicName)
    const avgTime = allAttempted > 0
      ? (attempts ?? []).reduce((s: number, a: any) => s + (a.time_spent_seconds ?? 0), 0) / allAttempted
      : 0
    const overallMastery = topicMastery.length > 0
      ? Math.round(topicMastery.reduce((s, t) => s + t.mastery, 0) / topicMastery.length)
      : 0

    return NextResponse.json({
      success: true,
      data: {
        abilityProgression,
        topicMastery,
        timeEfficiency,
        summary: {
          totalTests: (tests ?? []).length,
          totalQuestionsAttempted: allAttempted,
          totalCorrect: allCorrect,
          overallAccuracy: allAttempted > 0 ? Math.round((allCorrect / allAttempted) * 100) : 0,
          overallMastery,
          avgTimePerQuestion: Math.round(avgTime),
          weakestAreas: weakTopics.slice(0, 3),
          strongestAreas: strongTopics.slice(0, 3),
        },
      },
    })
  } catch (error) {
    console.error('Error fetching analytics:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch analytics data' },
      { status: 500 }
    )
  }
}

