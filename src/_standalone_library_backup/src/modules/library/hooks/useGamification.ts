'use client'

import { useState, useEffect, useCallback } from 'react'

// Types
export interface WeeklyStats {
  date: string
  day: string
  readingMinutes: number
  resourcesViewed: number
  quizzesCompleted: number
  xpEarned: number
}

export interface SubjectMastery {
  subject: string
  mastery: number
  timeSpent: number
  resourcesCompleted: number
  trend: 'improving' | 'stable' | 'declining'
  color: string
}

export interface TimeOfDayData {
  hour: number
  label: string
  activity: number
  isPeak: boolean
}

export interface BadgeData {
  id: string
  key: string
  name: string
  description: string
  icon: string
  category: string
  requirement: Record<string, unknown>
  xpReward: number
  progress: number
  isUnlocked: boolean
  unlockedAt?: string
  isNew?: boolean
}

export interface HabitData {
  id: string
  name: string
  icon: string
  target: number
  unit: string
  current: number
  streak: number
  bestStreak: number
  completedToday: boolean
  color: string
}

export interface HabitDay {
  date: string
  completed: boolean
  streak: number
  habitsCompleted: number
  totalHabits: number
  minutesStudied: number
  xpEarned: number
}

export interface StreakStats {
  currentStreak: number
  longestStreak: number
  totalDaysStudied: number
  thisMonthStreak: number
  lastMonthStreak: number
}

export interface ChallengeData {
  id: string
  title: string
  description: string
  type: string
  target: number
  unit: string
  startDate: string
  endDate: string
  participants: number
  reward: string
  progress: number
  current: number
  status: 'active' | 'completed' | 'upcoming' | 'ended'
  daysLeft: number
  isJoined: boolean
}

export interface LeaderboardEntry {
  rank: number
  userId: string
  name: string
  hours: number
  xp: number
  streak: number
  badges: number
  isCurrentUser: boolean
  trend: 'up' | 'down' | 'same'
  trendValue: number
}

export interface WeakTopic {
  id: string
  topic: string
  chapter: string
  subject: string
  accuracy: number
  attempts: number
  lastAttemptDate: string
  trend: 'declining' | 'stable' | 'improving'
  urgency: 'high' | 'medium' | 'low'
  recommendedResources: RecommendedResource[]
  conceptGaps: string[]
  practiceNeeded: number
}

export interface RecommendedResource {
  id: string
  title: string
  type: 'Notes' | 'Video' | 'Audio' | 'Quiz' | 'Interactive'
  relevance: number
  duration: number
  reason: string
}

export interface MasteryTimeline {
  date: string
  mastery: number
  testsTaken: number
  avgAccuracy: number
}

export interface ConceptMastery {
  concept: string
  mastery: number
  lastWeek: number
  change: number
}

export interface GamificationData {
  streak: {
    currentStreak: number
    longestStreak: number
    totalXP: number
    level: number
    todayProgress: number
    todayGoal: number
  } | null
  achievements: BadgeData[]
  challenges: ChallengeData[]
  habits: HabitData[]
  habitDays: HabitDay[]
  streakStats: StreakStats
  leaderboard: LeaderboardEntry[]
  currentUserRank: number
  userBadges: Array<{ id: string; name: string; icon: string; rarity: string; unlockedAt: string }>
  analytics: {
    weeklyStats: WeeklyStats[]
    subjectMastery: SubjectMastery[]
    timeOfDayData: TimeOfDayData[]
    totalReadingTime: number
    currentStreak: number
  } | null
  testAnalytics: {
    weakTopics: WeakTopic[]
    masteryTimeline: MasteryTimeline[]
    avgAccuracy: number
    totalTests: number
  } | null
}

export function useGamification(userId: string = 'demo-user') {
  const [data, setData] = useState<GamificationData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    
    try {
      // Fetch all gamification data in parallel
      const [gamificationRes, habitsRes, challengesRes, analyticsRes, testAnalyticsRes] = await Promise.all([
        fetch(`/api/library/gamification?userId=${userId}&type=all`),
        fetch(`/api/library/habits?userId=${userId}&days=30`),
        fetch(`/api/library/challenges?userId=${userId}&type=all`),
        fetch(`/api/library/analytics?userId=${userId}&range=week`),
        fetch(`/api/library/test-analytics?userId=${userId}`)
      ])

      const gamificationData = await gamificationRes.json()
      const habitsData = await habitsRes.json()
      const challengesData = await challengesRes.json()
      const analyticsData = await analyticsRes.json()
      const testAnalyticsData = await testAnalyticsRes.json()

      // Combine all data
      setData({
        streak: gamificationData.streak ? {
          currentStreak: gamificationData.streak.currentStreak,
          longestStreak: gamificationData.streak.longestStreak,
          totalXP: gamificationData.streak.totalXP,
          level: gamificationData.streak.level,
          todayProgress: gamificationData.streak.todayProgress,
          todayGoal: gamificationData.streak.todayGoal
        } : null,
        achievements: gamificationData.achievements || [],
        challenges: challengesData.challenges || gamificationData.challenges || [],
        habits: habitsData.habits || gamificationData.habits || [],
        habitDays: habitsData.habitDays || [],
        streakStats: habitsData.streakStats || {
          currentStreak: gamificationData.streak?.currentStreak || 0,
          longestStreak: gamificationData.streak?.longestStreak || 0,
          totalDaysStudied: 0,
          thisMonthStreak: 0,
          lastMonthStreak: 0
        },
        leaderboard: challengesData.leaderboard || gamificationData.leaderboard || [],
        currentUserRank: challengesData.currentUserRank || 1,
        userBadges: challengesData.userBadges || [],
        analytics: {
          weeklyStats: analyticsData.weeklyStats || gamificationData.analytics?.weeklyStats || [],
          subjectMastery: analyticsData.subjectMastery || gamificationData.analytics?.subjectMastery || [],
          timeOfDayData: analyticsData.timeOfDayData || gamificationData.analytics?.timeOfDayData || [],
          totalReadingTime: analyticsData.totalReadingTime || 0,
          currentStreak: analyticsData.currentStreak || 0
        },
        testAnalytics: {
          weakTopics: testAnalyticsData.weakTopics || [],
          masteryTimeline: testAnalyticsData.masteryTimeline || [],
          avgAccuracy: testAnalyticsData.avgAccuracy || 0,
          totalTests: testAnalyticsData.totalTests || 0
        }
      })
    } catch (err) {
      console.error('Error fetching gamification data:', err)
      setError('Failed to load data')
    } finally {
      setIsLoading(false)
    }
  }, [userId])

  const recordActivity = useCallback(async (
    activity: string, 
    options?: { xpAmount?: number; resourceId?: string; duration?: number }
  ) => {
    try {
      const response = await fetch('/api/library/gamification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          activity,
          ...options
        })
      })
      
      const result = await response.json()
      
      if (result.success) {
        // Refresh data after recording
        await fetchData()
        
        return result
      }
      
      return null
    } catch (err) {
      console.error('Error recording activity:', err)
      return null
    }
  }, [userId, fetchData])

  const joinChallenge = useCallback(async (challengeId: string) => {
    try {
      const response = await fetch('/api/library/challenges', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          challengeId,
          action: 'join'
        })
      })
      
      const result = await response.json()
      
      if (result.success) {
        await fetchData()
        return true
      }
      
      return false
    } catch (err) {
      console.error('Error joining challenge:', err)
      return false
    }
  }, [userId, fetchData])

  const updateHabit = useCallback(async (habitId: string, progress: number, completed?: boolean) => {
    try {
      const response = await fetch('/api/library/habits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          habitId,
          progress,
          completed
        })
      })
      
      const result = await response.json()
      
      if (result.success) {
        await fetchData()
        return true
      }
      
      return false
    } catch (err) {
      console.error('Error updating habit:', err)
      return false
    }
  }, [userId, fetchData])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  return {
    data,
    isLoading,
    error,
    refetch: fetchData,
    recordActivity,
    joinChallenge,
    updateHabit
  }
}

export default useGamification
