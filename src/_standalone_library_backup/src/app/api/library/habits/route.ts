import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET /api/library/habits - Get user habits
export async function GET(request: NextRequest) {
  try {
    const userId = request.nextUrl.searchParams.get('userId') || 'demo-user'
    const days = parseInt(request.nextUrl.searchParams.get('days') || '30')
    
    const now = new Date()
    const startDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000)
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())

    // Get or create default habits
    let habits = await db.habit.findMany({
      where: { userId, isActive: true },
      include: {
        logs: {
          where: { date: { gte: startDate } },
          orderBy: { date: 'desc' }
        }
      }
    })

    if (habits.length === 0) {
      // Create default habits
      const defaultHabits = [
        { name: 'Read 30 minutes', icon: 'book', target: 30, unit: 'minutes', color: 'bg-blue-500' },
        { name: 'Complete 1 quiz', icon: 'quiz', target: 1, unit: 'quizzes', color: 'bg-purple-500' },
        { name: 'Watch 2 videos', icon: 'video', target: 2, unit: 'resources', color: 'bg-rose-500' },
        { name: 'Review flashcards', icon: 'flashcard', target: 20, unit: 'pages', color: 'bg-amber-500' },
      ]

      for (const habit of defaultHabits) {
        await db.habit.create({
          data: { ...habit, userId }
        })
      }

      habits = await db.habit.findMany({
        where: { userId, isActive: true },
        include: { logs: true }
      })
    }

    // Get streak data
    const streak = await db.studyStreak.findUnique({
      where: { userId },
      include: {
        dailyLogs: {
          where: { date: { gte: startDate } },
          orderBy: { date: 'desc' }
        }
      }
    })

    // Generate habit days for calendar
    const habitDays = []
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000)
      const dateStr = date.toISOString().split('T')[0]
      
      const dayLogs = habits.map(h => h.logs.find(l => 
        l.date.toISOString().split('T')[0] === dateStr
      ))
      
      const completedCount = dayLogs.filter(l => l?.completed).length
      const totalMinutes = streak?.dailyLogs.find(l => 
        l.date.toISOString().split('T')[0] === dateStr
      )?.studyMinutes || 0

      habitDays.push({
        date: dateStr,
        completed: completedCount >= 2,
        streak: completedCount >= 2 ? Math.min(30, days - i) : 0,
        habitsCompleted: completedCount,
        totalHabits: habits.length,
        minutesStudied: totalMinutes,
        xpEarned: completedCount * 25
      })
    }

    // Calculate streak stats
    let currentStreak = 0
    let longestStreak = 0
    let tempStreak = 0
    
    for (let i = habitDays.length - 1; i >= 0; i--) {
      if (habitDays[i].completed) {
        tempStreak++
        if (i === habitDays.length - 1) currentStreak = tempStreak
      } else {
        longestStreak = Math.max(longestStreak, tempStreak)
        tempStreak = 0
      }
    }
    longestStreak = Math.max(longestStreak, tempStreak)

    // Format habits with today's progress
    const todayStr = today.toISOString().split('T')[0]
    const formattedHabits = habits.map(h => {
      const todayLog = h.logs.find(l => l.date.toISOString().split('T')[0] === todayStr)
      const habitStreak = h.logs.filter(l => l.completed).length
      const bestStreak = habitStreak // Simplified
      
      return {
        id: h.id,
        name: h.name,
        icon: h.icon,
        target: h.target,
        unit: h.unit,
        current: todayLog?.current || 0,
        streak: habitStreak,
        bestStreak,
        completedToday: todayLog?.completed || false,
        color: h.color
      }
    })

    return NextResponse.json({
      habits: formattedHabits,
      habitDays,
      streakStats: {
        currentStreak: streak?.currentStreak || currentStreak,
        longestStreak: streak?.longestStreak || longestStreak,
        totalDaysStudied: habitDays.filter(d => d.completed).length,
        thisMonthStreak: currentStreak,
        lastMonthStreak: Math.max(0, longestStreak - 5)
      }
    })
  } catch (error) {
    console.error('Error fetching habits:', error)
    return NextResponse.json({ error: 'Failed to fetch habits' }, { status: 500 })
  }
}

// POST /api/library/habits - Update habit progress
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId = 'demo-user', habitId, progress, completed } = body

    const today = new Date()
    today.setHours(0, 0, 0, 0)

    // Find or create habit log
    const existingLog = await db.habitLog.findFirst({
      where: { habitId, userId, date: today }
    })

    if (existingLog) {
      await db.habitLog.update({
        where: { id: existingLog.id },
        data: { current: progress, completed: completed ?? progress >= 1 }
      })
    } else {
      await db.habitLog.create({
        data: {
          habitId,
          userId,
          date: today,
          current: progress,
          completed: completed ?? false
        }
      })
    }

    // Award XP if completed
    if (completed) {
      const streak = await db.studyStreak.findUnique({ where: { userId } })
      if (streak) {
        await db.studyStreak.update({
          where: { userId },
          data: { totalXP: { increment: 10 } }
        })
      }
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error updating habit:', error)
    return NextResponse.json({ error: 'Failed to update habit' }, { status: 500 })
  }
}
