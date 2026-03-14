import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET /api/library/challenges - Get challenges and leaderboard
export async function GET(request: NextRequest) {
  try {
    const userId = request.nextUrl.searchParams.get('userId') || 'demo-user'
    const type = request.nextUrl.searchParams.get('type') || 'all' // 'challenges', 'leaderboard', 'all'
    
    const now = new Date()
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)

    const response: Record<string, unknown> = {}

    // Fetch challenges
    if (type === 'challenges' || type === 'all') {
      // Get or create default challenges
      let challenges = await db.challenge.findMany({
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

      // Create default challenges if none exist
      if (challenges.length === 0) {
        const defaultChallenges = [
          {
            title: 'Reading Marathon',
            description: 'Read for 10 hours this week to earn bonus XP!',
            type: 'reading',
            target: 10,
            unit: 'hours',
            startDate: now,
            endDate: new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000),
            rewardXP: 500
          },
          {
            title: 'Quiz Champion',
            description: 'Complete 20 quizzes with 80%+ accuracy',
            type: 'quizzes',
            target: 20,
            unit: 'quizzes',
            startDate: now,
            endDate: new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000),
            rewardXP: 750
          },
          {
            title: '30-Day Streak Challenge',
            description: 'Maintain a learning streak for 30 consecutive days',
            type: 'streak',
            target: 30,
            unit: 'days',
            startDate: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000),
            endDate: new Date(now.getTime() + 10 * 24 * 60 * 60 * 1000),
            rewardXP: 2000
          }
        ]

        for (const challenge of defaultChallenges) {
          await db.challenge.create({ data: challenge })
        }

        challenges = await db.challenge.findMany({
          where: { isActive: true },
          include: {
            participants: { where: { userId } },
            _count: { select: { participants: true } }
          },
          orderBy: { endDate: 'asc' }
        })
      }

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

    // Fetch leaderboard
    if (type === 'leaderboard' || type === 'all') {
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

      // Get current user rank
      const userEntry = leaderboardData.find(e => e.isCurrentUser)
      response.currentUserRank = userEntry?.rank || leaderboardData.length + 1
    }

    // Fetch user badges
    if (type === 'all') {
      const userAchievements = await db.userAchievement.findMany({
        where: { userId },
        include: { achievement: true },
        orderBy: { unlockedAt: 'desc' }
      })

      response.userBadges = userAchievements.map(ua => ({
        id: ua.achievement.id,
        name: ua.achievement.name,
        icon: ua.achievement.icon,
        rarity: ua.achievement.category === 'streak' ? 'epic' : 
                ua.achievement.category === 'content' ? 'rare' : 'common',
        unlockedAt: ua.unlockedAt.toISOString().split('T')[0]
      }))
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('Error fetching challenges:', error)
    return NextResponse.json({ error: 'Failed to fetch challenges' }, { status: 500 })
  }
}

// POST /api/library/challenges - Join a challenge or update progress
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId = 'demo-user', challengeId, action, progress } = body

    if (action === 'join') {
      // Check if already joined
      const existing = await db.challengeParticipant.findUnique({
        where: {
          challengeId_userId: { challengeId, userId }
        }
      })

      if (existing) {
        return NextResponse.json({ error: 'Already joined' }, { status: 400 })
      }

      await db.challengeParticipant.create({
        data: { challengeId, userId }
      })

      return NextResponse.json({ success: true, message: 'Challenge joined!' })
    }

    if (action === 'update') {
      const participant = await db.challengeParticipant.findUnique({
        where: {
          challengeId_userId: { challengeId, userId }
        },
        include: { challenge: true }
      })

      if (!participant) {
        return NextResponse.json({ error: 'Not joined' }, { status: 400 })
      }

      const newProgress = (progress / participant.challenge.target) * 100
      const completed = progress >= participant.challenge.target

      await db.challengeParticipant.update({
        where: { id: participant.id },
        data: {
          currentValue: progress,
          progress: Math.min(100, newProgress),
          completed,
          completedAt: completed ? new Date() : null
        }
      })

      // Award XP on completion
      if (completed && !participant.completed) {
        await db.studyStreak.update({
          where: { userId },
          data: { totalXP: { increment: participant.challenge.rewardXP } }
        })

        return NextResponse.json({ 
          success: true, 
          completed: true,
          xpEarned: participant.challenge.rewardXP
        })
      }

      return NextResponse.json({ success: true })
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  } catch (error) {
    console.error('Error updating challenge:', error)
    return NextResponse.json({ error: 'Failed to update challenge' }, { status: 500 })
  }
}
