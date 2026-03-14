'use client'

import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import {
  Flame,
  Calendar,
  Target,
  Zap,
  TrendingUp,
  Trophy,
  Star,
  Clock,
  CheckCircle2,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Award,
  Brain,
  Heart,
} from 'lucide-react'
import { cn } from '@/lib/utils'

// Types
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

export interface Habit {
  id: string
  name: string
  icon: string
  target: number
  unit: 'minutes' | 'pages' | 'resources' | 'quizzes'
  current: number
  streak: number
  bestStreak: number
  completedToday: boolean
  color: string
}

export interface MotivationalInsight {
  id: string
  type: 'achievement' | 'tip' | 'motivation' | 'milestone'
  title: string
  message: string
  icon: React.ElementType
}

export interface StreakHabitTrackerProps {
  habitDays?: HabitDay[]
  streakStats?: StreakStats
  habits?: Habit[]
  insights?: MotivationalInsight[]
  onDayClick?: (day: HabitDay) => void
  onHabitToggle?: (habitId: string) => void
  className?: string
}

// Animated Flame Component
function AnimatedFlame({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-10 h-10',
    lg: 'w-14 h-14',
  }
  
  return (
    <motion.div
      animate={{
        scale: [1, 1.05, 1],
      }}
      transition={{
        duration: 0.5,
        repeat: Infinity,
        ease: 'easeInOut',
      }}
      className={`relative ${sizeClasses[size]}`}
    >
      <Flame
        className={`${sizeClasses[size]} text-orange-500`}
        style={{
          filter: 'drop-shadow(0 0 8px rgba(249, 115, 22, 0.6))',
        }}
      />
      <motion.div
        className="absolute inset-0"
        animate={{
          opacity: [0.3, 0.6, 0.3],
        }}
        transition={{
          duration: 0.8,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      >
        <Flame className={`${sizeClasses[size]} text-yellow-400 opacity-50`} />
      </motion.div>
    </motion.div>
  )
}

// Habit Calendar Component
function HabitCalendar({ 
  days, 
  onDayClick,
  currentMonth,
  onPrevMonth,
  onNextMonth,
}: { 
  days: HabitDay[]
  onDayClick?: (day: HabitDay) => void
  currentMonth: Date
  onPrevMonth: () => void
  onNextMonth: () => void
}) {
  const today = new Date().toISOString().split('T')[0]
  const monthName = currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
  
  // Generate calendar grid
  const firstDayOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1)
  const lastDayOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0)
  const startingDay = firstDayOfMonth.getDay()
  const totalDays = lastDayOfMonth.getDate()
  
  // Create day map
  const dayMap = new Map(days.map(d => [d.date, d]))
  
  // Get intensity color
  const getIntensityColor = (day: HabitDay | undefined) => {
    if (!day || !day.completed) return 'bg-gray-50'
    const intensity = day.minutesStudied / 60 // hours
    if (intensity >= 2) return 'bg-gradient-to-br from-orange-500 to-red-500 text-white'
    if (intensity >= 1) return 'bg-gradient-to-br from-orange-400 to-amber-500 text-white'
    if (intensity >= 0.5) return 'bg-gradient-to-br from-orange-300 to-amber-400 text-orange-800'
    return 'bg-gradient-to-br from-orange-200 to-amber-300 text-orange-700'
  }
  
  // Week day names
  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  
  return (
    <Card className="p-4 border-gray-100 rounded-2xl">
      {/* Month Navigation */}
      <div className="flex items-center justify-between mb-4">
        <Button variant="ghost" size="sm" onClick={onPrevMonth} className="h-8 w-8 p-0">
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <h4 className="font-semibold text-gray-900">{monthName}</h4>
        <Button variant="ghost" size="sm" onClick={onNextMonth} className="h-8 w-8 p-0">
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
      
      {/* Week Day Headers */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {weekDays.map(day => (
          <div key={day} className="text-xs text-gray-500 text-center font-medium py-1">
            {day}
          </div>
        ))}
      </div>
      
      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-1">
        {/* Empty cells for days before start of month */}
        {[...Array(startingDay)].map((_, i) => (
          <div key={`empty-${i}`} className="aspect-square" />
        ))}
        
        {/* Actual days */}
        {[...Array(totalDays)].map((_, i) => {
          const dayNum = i + 1
          const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), dayNum)
          const dateStr = date.toISOString().split('T')[0]
          const dayData = dayMap.get(dateStr)
          const isToday = dateStr === today
          const isFuture = date > new Date()
          
          return (
            <motion.button
              key={dateStr}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => dayData && onDayClick?.(dayData)}
              disabled={isFuture}
              className={cn(
                'aspect-square rounded-lg flex flex-col items-center justify-center text-sm font-medium transition-all',
                getIntensityColor(dayData),
                isToday && 'ring-2 ring-violet-500 ring-offset-1',
                isFuture && 'opacity-30 cursor-not-allowed',
                !dayData && 'bg-gray-50 text-gray-400',
                dayData?.completed && 'shadow-sm'
              )}
            >
              <span>{dayNum}</span>
              {dayData?.streak && dayData.streak > 0 && (
                <span className="text-[10px] opacity-75">🔥{dayData.streak}</span>
              )}
            </motion.button>
          )
        })}
      </div>
      
      {/* Legend */}
      <div className="flex items-center justify-center gap-4 mt-4 text-xs text-gray-500">
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded bg-gray-50 border border-gray-200" />
          <span>None</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded bg-gradient-to-br from-orange-200 to-amber-300" />
          <span>&lt;30min</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded bg-gradient-to-br from-orange-400 to-amber-500" />
          <span>&lt;1h</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded bg-gradient-to-br from-orange-500 to-red-500" />
          <span>2h+</span>
        </div>
      </div>
    </Card>
  )
}

// Daily Habit Card
function DailyHabitCard({ 
  habit, 
  onToggle 
}: { 
  habit: Habit
  onToggle?: () => void
}) {
  const progress = (habit.current / habit.target) * 100
  
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      whileHover={{ scale: 1.01 }}
      onClick={onToggle}
      className={cn(
        'p-3 rounded-xl border transition-all cursor-pointer',
        habit.completedToday 
          ? 'bg-green-50 border-green-200' 
          : 'bg-white border-gray-100 hover:border-violet-200'
      )}
    >
      <div className="flex items-center gap-3">
        <div className={cn(
          'w-10 h-10 rounded-lg flex items-center justify-center',
          habit.completedToday ? 'bg-green-500' : habit.color
        )}>
          {habit.completedToday ? (
            <CheckCircle2 className="h-5 w-5 text-white" />
          ) : (
            <Target className="h-5 w-5 text-white" />
          )}
        </div>
        
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <span className="font-medium text-sm text-gray-900">{habit.name}</span>
            <span className="text-xs text-gray-500">
              {habit.current}/{habit.target} {habit.unit}
            </span>
          </div>
          
          <Progress value={Math.min(progress, 100)} className="h-1.5 mt-1.5" />
          
          <div className="flex items-center gap-2 mt-1.5 text-xs text-gray-500">
            <span className="flex items-center gap-0.5">
              <Flame className="h-3 w-3 text-orange-500" />
              {habit.streak} day streak
            </span>
            <span>•</span>
            <span>Best: {habit.bestStreak}</span>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

// Motivational Insight Card
function InsightCard({ insight }: { insight: MotivationalInsight }) {
  const Icon = insight.icon
  
  const bgColors = {
    achievement: 'bg-gradient-to-r from-amber-50 to-orange-50 border-amber-200',
    tip: 'bg-gradient-to-r from-blue-50 to-cyan-50 border-blue-200',
    motivation: 'bg-gradient-to-r from-violet-50 to-purple-50 border-violet-200',
    milestone: 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-200',
  }
  
  const iconColors = {
    achievement: 'text-amber-500 bg-amber-100',
    tip: 'text-blue-500 bg-blue-100',
    motivation: 'text-violet-500 bg-violet-100',
    milestone: 'text-green-500 bg-green-100',
  }
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        'p-4 rounded-xl border',
        bgColors[insight.type]
      )}
    >
      <div className="flex items-start gap-3">
        <div className={cn('w-10 h-10 rounded-lg flex items-center justify-center', iconColors[insight.type])}>
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <div className="font-medium text-gray-900">{insight.title}</div>
          <p className="text-sm text-gray-600 mt-0.5">{insight.message}</p>
        </div>
      </div>
    </motion.div>
  )
}

// Generate demo data
function generateDemoHabitDays(): HabitDay[] {
  const days: HabitDay[] = []
  const today = new Date()
  
  for (let i = 30; i >= 0; i--) {
    const date = new Date(today)
    date.setDate(date.getDate() - i)
    const completed = Math.random() > 0.3
    
    days.push({
      date: date.toISOString().split('T')[0],
      completed,
      streak: completed ? Math.floor(Math.random() * 12) + 1 : 0,
      habitsCompleted: completed ? Math.floor(Math.random() * 3) + 1 : 0,
      totalHabits: 4,
      minutesStudied: completed ? Math.floor(Math.random() * 120) + 30 : 0,
      xpEarned: completed ? Math.floor(Math.random() * 100) + 50 : 0,
    })
  }
  
  return days
}

function generateDemoHabits(): Habit[] {
  return [
    { id: '1', name: 'Read 30 minutes', icon: 'book', target: 30, unit: 'minutes', current: 25, streak: 8, bestStreak: 15, completedToday: false, color: 'bg-blue-500' },
    { id: '2', name: 'Complete 1 quiz', icon: 'quiz', target: 1, unit: 'quizzes', current: 1, streak: 5, bestStreak: 12, completedToday: true, color: 'bg-purple-500' },
    { id: '3', name: 'Watch 2 videos', icon: 'video', target: 2, unit: 'resources', current: 1, streak: 3, bestStreak: 8, completedToday: false, color: 'bg-rose-500' },
    { id: '4', name: 'Review flashcards', icon: 'flashcard', target: 20, unit: 'pages', current: 0, streak: 0, bestStreak: 7, completedToday: false, color: 'bg-amber-500' },
  ]
}

function generateDemoInsights(): MotivationalInsight[] {
  return [
    {
      id: '1',
      type: 'achievement',
      title: '🔥 12-Day Streak!',
      message: "You're on fire! Keep going to beat your record of 18 days.",
      icon: Flame,
    },
    {
      id: '2',
      type: 'tip',
      title: '💡 Pro Tip',
      message: 'Study in the morning for 25% better retention based on your patterns.',
      icon: Brain,
    },
    {
      id: '3',
      type: 'milestone',
      title: '🏆 Milestone Reached',
      message: "You've studied for 50 hours this month. Amazing progress!",
      icon: Trophy,
    },
  ]
}

export function StreakHabitTracker({
  habitDays: providedDays,
  streakStats: providedStats,
  habits: providedHabits,
  insights: providedInsights,
  onDayClick,
  onHabitToggle,
  className,
}: StreakHabitTrackerProps) {
  const habitDays = providedDays || generateDemoHabitDays()
  const habits = providedHabits || generateDemoHabits()
  const insights = providedInsights || generateDemoInsights()
  
  const [currentMonth, setCurrentMonth] = useState(new Date())
  
  // Always call useMemo to follow React hooks rules
  const computedStreakStats = useMemo(() => {
    const currentStreak = habitDays.filter(d => d.completed).length
    return {
      currentStreak: 12,
      longestStreak: 18,
      totalDaysStudied: habitDays.filter(d => d.completed).length,
      thisMonthStreak: currentStreak,
      lastMonthStreak: 15,
    }
  }, [habitDays])
  
  // Use provided stats or computed stats
  const streakStats = providedStats || computedStreakStats
  
  const habitsCompletedToday = habits.filter(h => h.completedToday).length
  const todayXP = Math.floor(Math.random() * 150) + 50
  
  return (
    <div className={cn('space-y-6', className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center">
            <Flame className="h-5 w-5 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Streak & Habits</h2>
            <p className="text-sm text-gray-500">Build consistent learning habits</p>
          </div>
        </div>
      </div>
      
      {/* Streak Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="p-4 bg-gradient-to-br from-orange-500 to-red-500 text-white border-0 rounded-2xl">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-3xl font-bold">{streakStats.currentStreak}</div>
                <div className="text-orange-100 text-sm">Day Streak</div>
              </div>
              <AnimatedFlame size="lg" />
            </div>
          </Card>
        </motion.div>
        
        {[
          { icon: Trophy, label: 'Best Streak', value: streakStats.longestStreak, color: 'from-amber-500 to-yellow-500' },
          { icon: Calendar, label: 'Days Studied', value: streakStats.totalDaysStudied, color: 'from-violet-500 to-purple-500' },
          { icon: Zap, label: 'Today\'s XP', value: todayXP, color: 'from-green-500 to-emerald-500' },
        ].map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="p-4 border-gray-100 rounded-2xl">
              <div className="flex items-center gap-3">
                <div className={cn(
                  'w-10 h-10 rounded-lg flex items-center justify-center bg-gradient-to-br',
                  stat.color
                )}>
                  <stat.icon className="h-5 w-5 text-white" />
                </div>
                <div>
                  <div className="text-xl font-bold text-gray-900">{stat.value}</div>
                  <div className="text-xs text-gray-500">{stat.label}</div>
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Habit Calendar */}
        <div>
          <HabitCalendar
            days={habitDays}
            onDayClick={onDayClick}
            currentMonth={currentMonth}
            onPrevMonth={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))}
            onNextMonth={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))}
          />
        </div>
        
        {/* Daily Habits */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-gray-900">Today's Habits</h3>
            <Badge className="bg-violet-100 text-violet-700 border-0">
              {habitsCompletedToday}/{habits.length} done
            </Badge>
          </div>
          
          <div className="space-y-3">
            {habits.map((habit, index) => (
              <motion.div
                key={habit.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <DailyHabitCard
                  habit={habit}
                  onToggle={() => onHabitToggle?.(habit.id)}
                />
              </motion.div>
            ))}
          </div>
          
          {/* Motivational Insights */}
          <div className="pt-4">
            <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-amber-500" />
              Insights
            </h4>
            <div className="space-y-3">
              {insights.map((insight) => (
                <InsightCard key={insight.id} insight={insight} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default StreakHabitTracker
