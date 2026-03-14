import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET /api/library/gamification - Get gamification data
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const userIdParam = searchParams.get('userId') || 'demo-user'
    const dataType = searchParams.get('type') || 'all'

    // Get or create user
    let user = await db.user.findFirst({
      where: { 
        OR: [
          { id: userIdParam },
          { email: 'demo@cognify.com' }
        ]
      }
    })

    if (!user) {
      user = await db.user.create({
        data: {
          email: 'demo@cognify.com',
          name: 'Demo Student',
          grade: '12',
          targetExam: 'JEE'
        }
      })
    }

    const userId = user.id

    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)

    // Initialize response object
    const response: Record<string, unknown> = {}

    // Fetch streak data
    if (dataType === 'streak' || dataType === 'all') {
      let streak = await db.studyStreak.findUnique({
        where: { userId },
        include: {
          dailyLogs: {
            where: { date: { gte: monthAgo } },
            orderBy: { date: 'desc' }
          }
        }
      })

      if (!streak) {
        streak = await db.studyStreak.create({
          data: { userId },
          include: { dailyLogs: true }
        })
      }

      const todayLog = streak.dailyLogs.find(log => 
        new Date(log.date).getTime() === today.getTime()
      )

      response.streak = {
        id: streak.id,
        userId: streak.userId,
        currentStreak: streak.currentStreak,
        longestStreak: streak.longestStreak,
        lastStudyAt: streak.lastStudyAt?.toISOString() || null,
        totalXP: streak.totalXP,
        level: streak.level,
        todayProgress: todayLog?.resourcesViewed || 0,
        todayGoal: 3,
        dailyLogs: streak.dailyLogs.map(log => ({
          id: log.id,
          date: log.date.toISOString(),
          resourcesViewed: log.resourcesViewed,
          quizzesCompleted: log.quizzesCompleted,
          flashcardsReviewed: log.flashcardsReviewed,
          xpEarned: log.xpEarned,
          studyMinutes: log.studyMinutes,
          goalMet: log.goalMet
        }))
      }
    }

    // Fetch achievements
    if (dataType === 'achievements' || dataType === 'all') {
      const achievements = await db.achievement.findMany({
        where: { isActive: true },
        include: {
          unlocks: {
            where: { userId }
          }
        },
        orderBy: [{ category: 'asc' }, { xpReward: 'desc' }]
      })

      response.achievements = achievements.map(a => {
        const unlock = a.unlocks[0]
        const requirement = JSON.parse(a.requirement)
        
        return {
          id: a.id,
          key: a.key,
          name: a.name,
          description: a.description,
          icon: a.icon,
          category: a.category,
          requirement,
          xpReward: a.xpReward,
          progress: unlock ? 100 : 0,
          isUnlocked: !!unlock,
          unlockedAt: unlock?.unlockedAt.toISOString()
        }
      })
    }

    // Fetch challenges
    if (dataType === 'challenges' || dataType === 'all') {
      const challenges = await db.challenge.findMany({
        where: {
          isActive: true,
          endDate: { gte: now }
        },
        include: {
          participants: {
            where: { userId }
          },
          _count: {
            select: { participants: true }
          }
        },
        orderBy: { endDate: 'asc' }
      })

      response.challenges = challenges.map(c => {
        const participation = c.participants[0]
        const daysLeft = Math.ceil((c.endDate.getTime() - now.getTime()) / (24 * 60 * 60 * 1000))
        
        return {
          id: c.id,
          title: c.title,
          description: c.description,
          type: c.type,
          target: c.target,
          unit: c.unit,
          startDate: c.startDate.toISOString(),
          endDate: c.endDate.toISOString(),
          participants: c._count.participants,
          reward: `${c.rewardXP} XP`,
          progress: participation?.progress || 0,
          current: participation?.currentValue || 0,
          status: participation?.completed ? 'completed' : daysLeft > 0 ? 'active' : 'ended',
          daysLeft: Math.max(0, daysLeft),
          isJoined: !!participation
        }
      })
    }

    // Fetch habits
    if (dataType === 'habits' || dataType === 'all') {
      const habits = await db.habit.findMany({
        where: { userId, isActive: true },
        include: {
          logs: {
            where: { date: { gte: weekAgo } },
            orderBy: { date: 'desc' }
          }
        }
      })

      const todayStr = today.toISOString().split('T')[0]
      
      response.habits = habits.map(h => {
        const todayLog = h.logs.find(l => l.date.toISOString().split('T')[0] === todayStr)
        const streak = h.logs.filter(l => l.completed).length
        
        return {
          id: h.id,
          name: h.name,
          icon: h.icon,
          target: h.target,
          unit: h.unit,
          current: todayLog?.current || 0,
          streak,
          bestStreak: streak,
          completedToday: todayLog?.completed || false,
          color: h.color
        }
      })
    }

    // Fetch leaderboard
    if (dataType === 'leaderboard' || dataType === 'all') {
      // Get all users with their stats
      const allStreaks = await db.studyStreak.findMany({
        include: {
          dailyLogs: {
            where: { date: { gte: weekAgo } }
          }
        },
        orderBy: { totalXP: 'desc' },
        take: 50
      })

      const leaderboardData = allStreaks
        .map((s, index) => {
          const weeklyMinutes = s.dailyLogs.reduce((sum, log) => sum + log.studyMinutes, 0)
          const weeklyHours = weeklyMinutes / 60
          
          return {
            rank: index + 1,
            userId: s.userId,
            name: s.userId === userId ? 'You' : `User ${s.userId.slice(0, 4)}`,
            hours: weeklyHours,
            xp: s.totalXP,
            streak: s.currentStreak,
            badges: 0,
            isCurrentUser: s.userId === userId,
            trend: 'same' as const,
            trendValue: 0
          }
        })
        .sort((a, b) => b.hours - a.hours)
        .map((entry, i) => ({ ...entry, rank: i + 1 }))

      response.leaderboard = leaderboardData
    }

    // Fetch analytics data
    if (dataType === 'analytics' || dataType === 'all') {
      const streak = response.streak as { dailyLogs: Array<{ date: string; studyMinutes: number; resourcesViewed: number; quizzesCompleted: number; xpEarned: number }> } | undefined
      
      if (streak?.dailyLogs) {
        // Weekly stats
        const weeklyStats = streak.dailyLogs.slice(0, 7).map(log => ({
          date: log.date.split('T')[0],
          day: new Date(log.date).toLocaleDateString('en-US', { weekday: 'short' }),
          readingMinutes: log.studyMinutes,
          resourcesViewed: log.resourcesViewed,
          quizzesCompleted: log.quizzesCompleted,
          xpEarned: log.xpEarned
        }))

        // Subject mastery (from views)
        const views = await db.libraryView.findMany({
          where: {
            userId,
            viewedAt: { gte: monthAgo }
          },
          include: {
            resource: {
              include: {
                chapter: {
                  include: { subject: true }
                }
              }
            }
          }
        })

        const subjectMap = new Map<string, { time: number; count: number }>()
        views.forEach(v => {
          const subjectName = v.resource.chapter.subject.name
          const existing = subjectMap.get(subjectName) || { time: 0, count: 0 }
          subjectMap.set(subjectName, {
            time: existing.time + v.duration,
            count: existing.count + 1
          })
        })

        const subjectMastery = Array.from(subjectMap.entries()).map(([subject, data]) => ({
          subject,
          mastery: Math.min(100, Math.round(data.time / 60)),
          timeSpent: Math.round(data.time / 60),
          resourcesCompleted: data.count,
          trend: 'improving' as const,
          color: subject === 'Physics' ? 'bg-blue-500' : 
                 subject === 'Chemistry' ? 'bg-purple-500' : 
                 subject === 'Mathematics' ? 'bg-rose-500' : 'bg-green-500'
        }))

        // Time of day analysis
        const timeOfDayData = [
          { hour: 6, label: '6 AM', activity: 20, isPeak: false },
          { hour: 8, label: '8 AM', activity: 35, isPeak: false },
          { hour: 10, label: '10 AM', activity: 55, isPeak: false },
          { hour: 12, label: '12 PM', activity: 45, isPeak: false },
          { hour: 14, label: '2 PM', activity: 30, isPeak: false },
          { hour: 16, label: '4 PM', activity: 50, isPeak: false },
          { hour: 18, label: '6 PM', activity: 90, isPeak: true },
          { hour: 20, label: '8 PM', activity: 75, isPeak: false },
          { hour: 22, label: '10 PM', activity: 40, isPeak: false },
        ]

        response.analytics = {
          weeklyStats,
          subjectMastery,
          timeOfDayData,
          totalReadingTime: streak.dailyLogs.reduce((s, l) => s + l.studyMinutes, 0),
          currentStreak: (response.streak as { currentStreak: number })?.currentStreak || 0
        }
      }
    }

    // Fetch test analytics
    if (dataType === 'tests' || dataType === 'all') {
      const testResults = await db.testResult.findMany({
        where: { userId },
        include: { topicResults: true },
        orderBy: { takenAt: 'desc' },
        take: 10
      })

      // Calculate weak topics
      const topicPerformance = new Map<string, { total: number; correct: number; attempts: number }>()
      testResults.forEach(test => {
        test.topicResults.forEach(tr => {
          const existing = topicPerformance.get(tr.topic) || { total: 0, correct: 0, attempts: 0 }
          topicPerformance.set(tr.topic, {
            total: existing.total + tr.questions,
            correct: existing.correct + tr.correct,
            attempts: existing.attempts + 1
          })
        })
      })

      const weakTopics = Array.from(topicPerformance.entries())
        .map(([topic, data]) => ({
          topic,
          accuracy: Math.round((data.correct / data.total) * 100),
          attempts: data.attempts
        }))
        .filter(t => t.accuracy < 70)
        .sort((a, b) => a.accuracy - b.accuracy)
        .slice(0, 5)

      // Mastery timeline
      const masteryTimeline = testResults.slice(0, 7).reverse().map((test, index) => ({
        date: new Date(test.takenAt).toLocaleDateString('en-US', { weekday: 'short' }),
        mastery: Math.min(100, 40 + index * 10 + Math.random() * 10),
        testsTaken: 1,
        avgAccuracy: Math.round((test.score / test.totalQuestions) * 100)
      }))

      response.testAnalytics = {
        weakTopics,
        masteryTimeline,
        avgAccuracy: testResults.length > 0 
          ? Math.round(testResults.reduce((s, t) => s + (t.correctAnswers / t.totalQuestions) * 100, 0) / testResults.length)
          : 0,
        totalTests: testResults.length
      }
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('Error fetching gamification data:', error)
    return NextResponse.json(
      { error: 'Failed to fetch gamification data' },
      { status: 500 }
    )
  }
}

// POST /api/library/gamification - Record activity and award XP
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      userId: userIdParam = 'demo-user',
      activity,
      xpAmount = 0,
      resourceId,
      duration,
      metadata
    } = body

    // Get or create user
    let user = await db.user.findFirst({
      where: { 
        OR: [
          { id: userIdParam },
          { email: 'demo@cognify.com' }
        ]
      }
    })

    if (!user) {
      user = await db.user.create({
        data: {
          email: 'demo@cognify.com',
          name: 'Demo Student',
          grade: '12',
          targetExam: 'JEE'
        }
      })
    }

    const userId = user.id

    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())

    // Get or create streak
    let streak = await db.studyStreak.findUnique({
      where: { userId }
    })

    if (!streak) {
      streak = await db.studyStreak.create({
        data: { userId }
      })
    }

    // Calculate XP based on activity type
    let earnedXP = xpAmount
    if (activity === 'resource_viewed') earnedXP = Math.max(10, Math.floor((duration || 60) / 6))
    if (activity === 'quiz_completed') earnedXP = 25
    if (activity === 'flashcard_reviewed') earnedXP = 5
    if (activity === 'video_watched') earnedXP = Math.max(15, Math.floor((duration || 300) / 20))
    if (activity === 'notes_created') earnedXP = 10
    if (activity === 'bookmark_created') earnedXP = 5

    // Check if studied today
    const lastStudyDate = streak.lastStudyAt ? 
      new Date(streak.lastStudyAt.getFullYear(), streak.lastStudyAt.getMonth(), streak.lastStudyAt.getDate()) : 
      null

    const isToday = lastStudyDate?.getTime() === today.getTime()
    const isYesterday = lastStudyDate?.getTime() === 
      new Date(today.getTime() - 24 * 60 * 60 * 1000).getTime()

    let newStreak = streak.currentStreak
    if (!isToday) {
      if (isYesterday) {
        newStreak = streak.currentStreak + 1
      } else if (!lastStudyDate) {
        newStreak = 1
      } else {
        newStreak = 1 // Streak broken
      }
    }

    // Calculate new level
    const newXP = streak.totalXP + earnedXP
    const newLevel = Math.floor(newXP / 500) + 1

    // Update streak
    await db.studyStreak.update({
      where: { userId },
      data: {
        currentStreak: newStreak,
        longestStreak: Math.max(streak.longestStreak, newStreak),
        lastStudyAt: now,
        totalXP: newXP,
        level: newLevel
      }
    })

    // Update or create daily log
    const existingLog = await db.studyDayLog.findUnique({
      where: {
        streakId_date: { streakId: streak.id, date: today }
      }
    })

    const updateData: { xpEarned: number; resourcesViewed?: number; quizzesCompleted?: number; flashcardsReviewed?: number; studyMinutes?: number } = { xpEarned: earnedXP }
    if (activity === 'resource_viewed') updateData.resourcesViewed = 1
    if (activity === 'quiz_completed') updateData.quizzesCompleted = 1
    if (activity === 'flashcard_reviewed') updateData.flashcardsReviewed = 1
    if (duration) updateData.studyMinutes = Math.floor(duration / 60)

    if (existingLog) {
      await db.studyDayLog.update({
        where: { id: existingLog.id },
        data: {
          resourcesViewed: { increment: updateData.resourcesViewed || 0 },
          quizzesCompleted: { increment: updateData.quizzesCompleted || 0 },
          flashcardsReviewed: { increment: updateData.flashcardsReviewed || 0 },
          xpEarned: { increment: updateData.xpEarned },
          studyMinutes: { increment: updateData.studyMinutes || 0 },
          goalMet: (existingLog.resourcesViewed + (updateData.resourcesViewed || 0)) >= 3
        }
      })
    } else {
      await db.studyDayLog.create({
        data: {
          streakId: streak.id,
          date: today,
          ...updateData,
          goalMet: (updateData.resourcesViewed || 0) >= 3
        }
      })
    }

    // Update resource mastery if resourceId provided
    if (resourceId) {
      const existingMastery = await db.resourceMastery.findUnique({
        where: { userId_resourceId: { userId, resourceId } }
      })

      if (existingMastery) {
        await db.resourceMastery.update({
          where: { id: existingMastery.id },
          data: {
            timeSpent: { increment: duration || 60 },
            lastAccessedAt: now,
            revisionCount: { increment: 1 },
            masteryLevel: Math.min(100, existingMastery.masteryLevel + (activity === 'quiz_completed' ? 10 : 5))
          }
        })
      } else {
        await db.resourceMastery.create({
          data: {
            userId,
            resourceId,
            timeSpent: duration || 60,
            masteryLevel: 10
          }
        })
      }
    }

    // Check for achievement unlocks
    const unlockedAchievements: Array<{ id: string; name: string; xpReward: number }> = []
    
    // Streak achievements
    if (newStreak >= 7) {
      const streakAchievement = await checkAndUnlockAchievement(userId, 'streak_7')
      if (streakAchievement) unlockedAchievements.push(streakAchievement)
    }
    if (newStreak >= 30) {
      const streakAchievement = await checkAndUnlockAchievement(userId, 'streak_30')
      if (streakAchievement) unlockedAchievements.push(streakAchievement)
    }

    // XP achievements
    if (newXP >= 1000) {
      const xpAchievement = await checkAndUnlockAchievement(userId, 'xp_1000')
      if (xpAchievement) unlockedAchievements.push(xpAchievement)
    }
    if (newXP >= 5000) {
      const xpAchievement = await checkAndUnlockAchievement(userId, 'xp_5000')
      if (xpAchievement) unlockedAchievements.push(xpAchievement)
    }

    return NextResponse.json({
      success: true,
      xpEarned: earnedXP,
      newStreak,
      newLevel,
      leveledUp: newLevel > streak.level,
      unlockedAchievements
    })
  } catch (error) {
    console.error('Error recording activity:', error)
    return NextResponse.json(
      { error: 'Failed to record activity' },
      { status: 500 }
    )
  }
}

// Helper function to check and unlock achievements
async function checkAndUnlockAchievement(userId: string, achievementKey: string) {
  const achievement = await db.achievement.findUnique({
    where: { key: achievementKey }
  })

  if (!achievement) return null

  const existingUnlock = await db.userAchievement.findUnique({
    where: {
      userId_achievementId: { userId, achievementId: achievement.id }
    }
  })

  if (existingUnlock) return null

  await db.userAchievement.create({
    data: { userId, achievementId: achievement.id }
  })

  // Award XP
  await db.studyStreak.update({
    where: { userId },
    data: { totalXP: { increment: achievement.xpReward } }
  })

  return {
    id: achievement.id,
    name: achievement.name,
    xpReward: achievement.xpReward
  }
}
