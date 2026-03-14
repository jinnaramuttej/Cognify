import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// Type definitions
interface WeeklyStat {
  date: string
  day: string
  readingMinutes: number
  resourcesViewed: number
  quizzesCompleted: number
  xpEarned: number
}

interface SubjectMastery {
  subject: string
  mastery: number
  timeSpent: number
  resourcesCompleted: number
  trend: 'improving' | 'stable' | 'declining'
  color: string
}

interface TimeOfDayData {
  hour: number
  label: string
  activity: number
  isPeak: boolean
}

interface EngagementRating {
  label: string
  rating: number
}

// GET /api/library/analytics - Get detailed engagement analytics
export async function GET(request: NextRequest) {
  try {
    const userId = request.nextUrl.searchParams.get('userId') || 'demo-user'
    const range = request.nextUrl.searchParams.get('range') || 'week' // 'week', 'month'
    
    const now = new Date()
    const days = range === 'month' ? 30 : 7
    const startDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000)
    const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)

    // Get streak and daily logs
    const streak = await db.studyStreak.findUnique({
      where: { userId },
      include: {
        dailyLogs: {
          where: { date: { gte: startDate } },
          orderBy: { date: 'asc' }
        }
      }
    })

    // Generate weekly/monthly stats
    const weeklyStats: WeeklyStat[] = []
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000)
      const dateStr = date.toISOString().split('T')[0]
      
      const log = streak?.dailyLogs.find(l => 
        l.date.toISOString().split('T')[0] === dateStr
      )
      
      weeklyStats.push({
        date: dateStr,
        day: date.toLocaleDateString('en-US', { weekday: 'short' }),
        readingMinutes: log?.studyMinutes || 0,
        resourcesViewed: log?.resourcesViewed || 0,
        quizzesCompleted: log?.quizzesCompleted || 0,
        xpEarned: log?.xpEarned || 0
      })
    }

    // Get views for subject mastery
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

    // Calculate subject mastery
    const subjectMap = new Map<string, { time: number; count: number; resources: Set<string> }>()
    views.forEach(v => {
      const subjectName = v.resource.chapter.subject.name
      const existing = subjectMap.get(subjectName) || { time: 0, count: 0, resources: new Set() }
      existing.time += v.duration
      existing.count += 1
      existing.resources.add(v.resourceId)
      subjectMap.set(subjectName, existing)
    })

    const subjectMastery = Array.from(subjectMap.entries()).map(([subject, data]) => ({
      subject,
      mastery: Math.min(100, Math.round(data.time / 60) + data.resources.size * 2),
      timeSpent: Math.round(data.time / 60),
      resourcesCompleted: data.resources.size,
      trend: 'improving' as const,
      color: subject === 'Physics' ? 'bg-blue-500' : 
             subject === 'Chemistry' ? 'bg-purple-500' : 
             subject === 'Mathematics' ? 'bg-rose-500' : 'bg-green-500'
    }))

    // Calculate time of day distribution
    const timeOfDayMap = new Map<number, number>()
    views.forEach(v => {
      const hour = new Date(v.viewedAt).getHours()
      timeOfDayMap.set(hour, (timeOfDayMap.get(hour) || 0) + v.duration)
    })

    const maxTime = Math.max(...Array.from(timeOfDayMap.values()), 1)
    const timeOfDayData = [
      { hour: 6, label: '6 AM' },
      { hour: 8, label: '8 AM' },
      { hour: 10, label: '10 AM' },
      { hour: 12, label: '12 PM' },
      { hour: 14, label: '2 PM' },
      { hour: 16, label: '4 PM' },
      { hour: 18, label: '6 PM' },
      { hour: 20, label: '8 PM' },
      { hour: 22, label: '10 PM' },
    ].map(h => {
      const timeSlots = [timeOfDayMap.get(h.hour) || 0, timeOfDayMap.get(h.hour + 1) || 0]
      const avgTime = timeSlots.reduce((a, b) => a + b, 0) / 2
      return {
        ...h,
        activity: Math.round((avgTime / maxTime) * 100),
        isPeak: avgTime === maxTime
      }
    })

    // Calculate engagement ratings
    const totalMinutes = weeklyStats.reduce((s, d) => s + d.readingMinutes, 0)
    const totalResources = weeklyStats.reduce((s, d) => s + d.resourcesViewed, 0)
    const daysWithActivity = weeklyStats.filter(d => d.readingMinutes > 0).length
    
    const engagementRatings = [
      { 
        label: 'Reading Consistency', 
        rating: Math.round((daysWithActivity / days) * 100) 
      },
      { 
        label: 'Quiz Performance', 
        rating: Math.min(100, Math.round(weeklyStats.reduce((s, d) => s + d.quizzesCompleted, 0) * 10)) 
      },
      { 
        label: 'Resource Completion', 
        rating: Math.min(100, totalResources * 5) 
      },
      { 
        label: 'Time Management', 
        rating: Math.min(100, Math.round(totalMinutes / (days * 30) * 100)) 
      },
    ]

    // Get resource mastery data
    const resourceMastery = await db.resourceMastery.findMany({
      where: { userId },
      include: {
        resource: {
          include: {
            chapter: {
              include: { subject: true }
            }
          }
        }
      },
      orderBy: { masteryLevel: 'desc' },
      take: 10
    })

    const masteryData = resourceMastery.map(rm => ({
      resourceId: rm.resourceId,
      title: rm.resource.title,
      subject: rm.resource.chapter.subject.name,
      chapter: rm.resource.chapter.name,
      masteryLevel: rm.masteryLevel,
      timeSpent: Math.round(rm.timeSpent / 60),
      revisionCount: rm.revisionCount
    }))

    return NextResponse.json({
      weeklyStats,
      subjectMastery: subjectMastery.length > 0 ? subjectMastery : [
        { subject: 'Physics', mastery: 78, timeSpent: 450, resourcesCompleted: 24, trend: 'improving', color: 'bg-blue-500' },
        { subject: 'Chemistry', mastery: 65, timeSpent: 320, resourcesCompleted: 18, trend: 'stable', color: 'bg-purple-500' },
        { subject: 'Mathematics', mastery: 82, timeSpent: 520, resourcesCompleted: 32, trend: 'improving', color: 'bg-rose-500' },
        { subject: 'Biology', mastery: 70, timeSpent: 280, resourcesCompleted: 15, trend: 'declining', color: 'bg-green-500' },
      ],
      timeOfDayData,
      engagementRatings,
      masteryData,
      totalReadingTime: totalMinutes,
      currentStreak: streak?.currentStreak || 0,
      totalXP: streak?.totalXP || 0,
      level: streak?.level || 1
    })
  } catch (error) {
    console.error('Error fetching analytics:', error)
    return NextResponse.json({ error: 'Failed to fetch analytics' }, { status: 500 })
  }
}
