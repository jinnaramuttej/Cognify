import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET /api/library/test-analytics - Get test analytics and resource recommendations
export async function GET(request: NextRequest) {
  try {
    const userId = request.nextUrl.searchParams.get('userId') || 'demo-user'
    
    const now = new Date()
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)

    // Get test results
    const testResults = await db.testResult.findMany({
      where: { userId },
      include: { topicResults: true },
      orderBy: { takenAt: 'desc' },
      take: 10
    })

    // Get weak topics from database
    const weakTopicsFromDb = await db.weakTopic.findMany({
      where: { userId },
      orderBy: { accuracy: 'asc' },
      take: 5
    })

    // Calculate weak topics from test results
    const topicPerformance = new Map<string, { 
      total: number; 
      correct: number; 
      attempts: number;
      timeSpent: number;
      lastAttempt: Date;
    }>()

    testResults.forEach(test => {
      test.topicResults.forEach(tr => {
        const existing = topicPerformance.get(tr.topic) || { 
          total: 0, correct: 0, attempts: 0, timeSpent: 0, lastAttempt: test.takenAt 
        }
        topicPerformance.set(tr.topic, {
          total: existing.total + tr.questions,
          correct: existing.correct + tr.correct,
          attempts: existing.attempts + 1,
          timeSpent: existing.timeSpent + tr.timeSpent,
          lastAttempt: test.takenAt > existing.lastAttempt ? test.takenAt : existing.lastAttempt
        })
      })
    })

    // Get resources for recommendations
    const resources = await db.libraryResource.findMany({
      include: {
        chapter: {
          include: { subject: true }
        }
      },
      take: 50
    })

    // Build weak topics array
    const weakTopics = Array.from(topicPerformance.entries())
      .map(([topic, data]) => {
        const accuracy = Math.round((data.correct / data.total) * 100)
        const urgency = accuracy < 50 ? 'high' : accuracy < 70 ? 'medium' : 'low'
        const trend = accuracy < 50 ? 'declining' : accuracy < 70 ? 'stable' : 'improving'
        
        // Find related resources
        const relatedResources = resources
          .filter(r => 
            r.title.toLowerCase().includes(topic.toLowerCase()) ||
            r.chapter.name.toLowerCase().includes(topic.toLowerCase())
          )
          .slice(0, 3)
          .map(r => ({
            id: r.id,
            title: r.title,
            type: r.resourceType as 'Notes' | 'Video' | 'Audio' | 'Quiz' | 'Interactive',
            relevance: Math.round(80 + Math.random() * 20),
            duration: r.readingTime,
            reason: 'Addresses weak area'
          }))

        // Generate concept gaps
        const conceptGaps = []
        if (topic.includes('Electrostatics')) {
          conceptGaps.push("Coulomb's Law", 'Electric Field Lines', "Gauss's Theorem")
        } else if (topic.includes('Organic')) {
          conceptGaps.push('SN1 vs SN2', 'Electrophilic Addition')
        } else if (topic.includes('Calculus') || topic.includes('Integration')) {
          conceptGaps.push('Substitution Method', 'Integration by Parts')
        } else {
          conceptGaps.push('Fundamental Concepts', 'Application Problems')
        }

        return {
          id: topic.replace(/\s+/g, '-').toLowerCase(),
          topic,
          chapter: 'Related Chapter',
          subject: 'Subject',
          accuracy,
          attempts: data.attempts,
          lastAttemptDate: new Date(data.lastAttempt).toLocaleDateString(),
          trend,
          urgency,
          conceptGaps,
          practiceNeeded: Math.max(1, Math.round((100 - accuracy) / 10)),
          recommendedResources: relatedResources.length > 0 ? relatedResources : [
            { id: 'r1', title: `${topic} - Complete Guide`, type: 'Video' as const, relevance: 95, duration: 25, reason: 'Core concepts' },
            { id: 'r2', title: `${topic} Practice Problems`, type: 'Quiz' as const, relevance: 88, duration: 15, reason: 'Build skills' },
          ]
        }
      })
      .filter(t => t.accuracy < 80)
      .sort((a, b) => a.accuracy - b.accuracy)
      .slice(0, 5)

    // Generate mastery timeline
    const masteryTimeline = []
    for (let i = 6; i >= 0; i--) {
      const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000)
      const test = testResults.find(t => 
        Math.abs(new Date(t.takenAt).getTime() - date.getTime()) < 24 * 60 * 60 * 1000
      )
      
      masteryTimeline.push({
        date: date.toLocaleDateString('en-US', { weekday: 'short' }),
        mastery: Math.min(100, 40 + (6 - i) * 8 + (test ? (test.score / test.totalQuestions) * 20 : Math.random() * 10)),
        testsTaken: test ? 1 : 0,
        avgAccuracy: test ? Math.round((test.correctAnswers / test.totalQuestions) * 100) : 0
      })
    }

    // Generate concept mastery
    const conceptMastery = Array.from(topicPerformance.entries())
      .slice(0, 5)
      .map(([concept, data]) => ({
        concept,
        mastery: Math.round((data.correct / data.total) * 100),
        lastWeek: Math.round((data.correct / data.total) * 100) - Math.round(Math.random() * 10),
        change: Math.round(Math.random() * 10) - 3
      }))

    // Calculate stats
    const avgAccuracy = testResults.length > 0 
      ? Math.round(testResults.reduce((s, t) => s + (t.correctAnswers / t.totalQuestions) * 100, 0) / testResults.length)
      : 75
    const highUrgencyCount = weakTopics.filter(t => t.urgency === 'high').length
    const currentMastery = masteryTimeline[masteryTimeline.length - 1]?.mastery || 0
    const weeklyImprovement = currentMastery - (masteryTimeline[0]?.mastery || 0)

    // If no test results, generate demo data
    if (testResults.length === 0) {
      return NextResponse.json({
        weakTopics: [
          {
            id: '1',
            topic: 'Electrostatics',
            chapter: 'Electric Charges',
            subject: 'Physics',
            accuracy: 35,
            attempts: 12,
            lastAttemptDate: '2 days ago',
            trend: 'declining',
            urgency: 'high',
            conceptGaps: ["Coulomb's Law", 'Electric Field Lines', "Gauss's Theorem"],
            practiceNeeded: 8,
            recommendedResources: [
              { id: 'r1', title: "Coulomb's Law - Complete Guide", type: 'Video', relevance: 95, duration: 25, reason: 'Addresses #1 gap' },
              { id: 'r2', title: 'Electric Field Practice Problems', type: 'Quiz', relevance: 88, duration: 15, reason: 'Builds problem skills' },
              { id: 'r3', title: "Gauss's Theorem Explained", type: 'Notes', relevance: 82, duration: 20, reason: 'Concept clarity' },
            ],
          },
          {
            id: '2',
            topic: 'Organic Reaction Mechanisms',
            chapter: 'Organic Chemistry',
            subject: 'Chemistry',
            accuracy: 52,
            attempts: 8,
            lastAttemptDate: '1 day ago',
            trend: 'stable',
            urgency: 'medium',
            conceptGaps: ['SN1 vs SN2', 'Electrophilic Addition'],
            practiceNeeded: 5,
            recommendedResources: [
              { id: 'r4', title: 'Reaction Mechanisms Deep Dive', type: 'Video', relevance: 90, duration: 35, reason: 'Core concepts' },
            ],
          },
          {
            id: '3',
            topic: 'Integration Techniques',
            chapter: 'Calculus',
            subject: 'Mathematics',
            accuracy: 68,
            attempts: 15,
            lastAttemptDate: '3 days ago',
            trend: 'improving',
            urgency: 'low',
            conceptGaps: ['Substitution Method'],
            practiceNeeded: 3,
            recommendedResources: [
              { id: 'r5', title: 'Integration Practice Set', type: 'Quiz', relevance: 85, duration: 20, reason: 'Speed improvement' },
            ],
          },
        ],
        masteryTimeline,
        conceptMastery: [
          { concept: 'Mechanics', mastery: 78, lastWeek: 72, change: 6 },
          { concept: 'Thermodynamics', mastery: 65, lastWeek: 70, change: -5 },
          { concept: 'Electrostatics', mastery: 42, lastWeek: 38, change: 4 },
          { concept: 'Organic Chemistry', mastery: 55, lastWeek: 52, change: 3 },
          { concept: 'Calculus', mastery: 72, lastWeek: 68, change: 4 },
        ],
        avgAccuracy,
        totalTests: 0,
        highUrgencyCount,
        weeklyImprovement: Math.round(weeklyImprovement)
      })
    }

    return NextResponse.json({
      weakTopics,
      masteryTimeline,
      conceptMastery,
      avgAccuracy,
      totalTests: testResults.length,
      highUrgencyCount,
      weeklyImprovement: Math.round(weeklyImprovement)
    })
  } catch (error) {
    console.error('Error fetching test analytics:', error)
    return NextResponse.json({ error: 'Failed to fetch test analytics' }, { status: 500 })
  }
}

// POST /api/library/test-analytics - Record test result
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { 
      userId = 'demo-user', 
      testId,
      subjectId,
      chapterId,
      score,
      totalQuestions,
      correctAnswers,
      timeSpent,
      topicResults
    } = body

    // Create test result
    const testResult = await db.testResult.create({
      data: {
        userId,
        testId,
        subjectId,
        chapterId,
        score,
        totalQuestions,
        correctAnswers,
        timeSpent
      }
    })

    // Create topic results
    if (topicResults && Array.isArray(topicResults)) {
      for (const tr of topicResults) {
        await db.testTopicResult.create({
          data: {
            testResultId: testResult.id,
            topic: tr.topic,
            accuracy: tr.accuracy,
            questions: tr.questions,
            correct: tr.correct,
            timeSpent: tr.timeSpent || 0,
            weakness: 100 - tr.accuracy
          }
        })

        // Update or create weak topic
        if (tr.accuracy < 70) {
          const existingWeak = await db.weakTopic.findFirst({
            where: { userId, topic: tr.topic }
          })

          if (existingWeak) {
            await db.weakTopic.update({
              where: { id: existingWeak.id },
              data: {
                accuracy: tr.accuracy,
                lastAttemptAt: new Date(),
                suggestedAction: tr.accuracy < 50 ? 'Review fundamentals' : 'Practice more problems'
              }
            })
          } else {
            await db.weakTopic.create({
              data: {
                userId,
                subjectId,
                chapterId,
                topic: tr.topic,
                accuracy: tr.accuracy,
                suggestedAction: tr.accuracy < 50 ? 'Review fundamentals' : 'Practice more problems'
              }
            })
          }
        }
      }
    }

    // Award XP for completing test
    const xpEarned = correctAnswers * 5 + (score / totalQuestions > 0.8 ? 25 : 0)
    
    const streak = await db.studyStreak.findUnique({ where: { userId } })
    if (streak) {
      await db.studyStreak.update({
        where: { userId },
        data: { totalXP: { increment: xpEarned } }
      })
    }

    return NextResponse.json({ 
      success: true, 
      testResultId: testResult.id,
      xpEarned 
    })
  } catch (error) {
    console.error('Error recording test result:', error)
    return NextResponse.json({ error: 'Failed to record test result' }, { status: 500 })
  }
}
