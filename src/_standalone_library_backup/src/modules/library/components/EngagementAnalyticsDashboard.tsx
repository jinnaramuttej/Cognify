'use client'

import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  BarChart3,
  Clock,
  BookOpen,
  TrendingUp,
  TrendingDown,
  Target,
  Zap,
  Calendar,
  Eye,
  Brain,
  Layers,
  Sparkles,
  ChevronRight,
  Activity,
  Timer,
  FileText,
  Video,
  Headphones,
  PieChart,
} from 'lucide-react'
import { cn } from '@/lib/utils'

// Types
export interface WeeklyStats {
  date: string
  day: string
  readingMinutes: number
  resourcesViewed: number
  quizzesCompleted: number
  xpEarned: number
}

export interface MonthlyStats {
  week: number
  totalMinutes: number
  resourcesViewed: number
  avgEngagement: number
  streakDays: number
}

export interface SubjectMastery {
  subject: string
  mastery: number // 0-100
  timeSpent: number // minutes
  resourcesCompleted: number
  trend: 'improving' | 'stable' | 'declining'
  color: string
}

export interface TimeOfDayData {
  hour: number
  label: string
  activity: number // 0-100 scale
  isPeak: boolean
}

export interface EngagementAnalyticsDashboardProps {
  weeklyStats?: WeeklyStats[]
  monthlyStats?: MonthlyStats[]
  subjectMastery?: SubjectMastery[]
  timeOfDayData?: TimeOfDayData[]
  totalReadingTime?: number
  currentStreak?: number
  className?: string
}

// Mini Chart Component
function MiniBarChart({ data, color, height = 40 }: { data: number[]; color: string; height?: number }) {
  const max = Math.max(...data, 1)
  
  return (
    <div className="flex items-end gap-0.5" style={{ height }}>
      {data.map((value, index) => (
        <motion.div
          key={index}
          initial={{ height: 0 }}
          animate={{ height: `${(value / max) * 100}%` }}
          transition={{ duration: 0.5, delay: index * 0.05 }}
          className={cn('w-2 rounded-t-sm', color)}
        />
      ))}
    </div>
  )
}

// Animated Line Chart
function AnimatedLineChart({ data, color }: { data: { x: number; y: number }[]; color: string }) {
  const width = 300
  const height = 100
  const padding = 20
  
  const xMax = Math.max(...data.map(d => d.x))
  const yMax = Math.max(...data.map(d => d.y))
  
  const points = data.map(d => ({
    x: padding + (d.x / xMax) * (width - 2 * padding),
    y: height - padding - (d.y / yMax) * (height - 2 * padding),
  }))
  
  const pathD = points.reduce((acc, p, i) => {
    if (i === 0) return `M ${p.x} ${p.y}`
    const prev = points[i - 1]
    const cpX = (prev.x + p.x) / 2
    return `${acc} C ${cpX} ${prev.y}, ${cpX} ${p.y}, ${p.x} ${p.y}`
  }, '')
  
  return (
    <svg width={width} height={height} className="overflow-visible">
      <defs>
        <linearGradient id="lineGradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" className={cn('stop-color-opacity-30', color)} />
          <stop offset="100%" className="stop-color-transparent" />
        </linearGradient>
      </defs>
      
      {/* Grid lines */}
      {[0, 25, 50, 75, 100].map(percent => (
        <line
          key={percent}
          x1={padding}
          y1={height - padding - (percent / 100) * (height - 2 * padding)}
          x2={width - padding}
          y2={height - padding - (percent / 100) * (height - 2 * padding)}
          stroke="#E5E7EB"
          strokeWidth="1"
          strokeDasharray="4 4"
        />
      ))}
      
      {/* Filled area */}
      <motion.path
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        d={`${pathD} L ${points[points.length - 1].x} ${height - padding} L ${points[0].x} ${height - padding} Z`}
        fill="url(#lineGradient)"
      />
      
      {/* Line */}
      <motion.path
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 1.5, ease: 'easeOut' }}
        d={pathD}
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        className={color}
      />
      
      {/* Points */}
      {points.map((p, i) => (
        <motion.circle
          key={i}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: i * 0.1 + 0.5 }}
          cx={p.x}
          cy={p.y}
          r="4"
          className={cn('fill-current', color)}
        />
      ))}
    </svg>
  )
}

// Activity Heatmap
function ActivityHeatmap({ data }: { data: TimeOfDayData[] }) {
  return (
    <div className="space-y-2">
      <div className="text-sm font-medium text-gray-700">Peak Learning Hours</div>
      <div className="flex gap-1">
        {data.map((slot, index) => (
          <motion.div
            key={slot.hour}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.02 }}
            className="flex-1 flex flex-col items-center"
          >
            <div
              className={cn(
                'w-full h-8 rounded-md transition-all',
                slot.isPeak 
                  ? 'bg-gradient-to-t from-violet-500 to-purple-400 shadow-md shadow-violet-500/30'
                  : slot.activity > 60 
                    ? 'bg-violet-300'
                    : slot.activity > 30
                      ? 'bg-violet-200'
                      : 'bg-gray-100'
              )}
              title={`${slot.label}: ${slot.activity}% activity`}
            />
            <span className="text-xs text-gray-500 mt-1 truncate w-full text-center">
              {slot.label.split(' ')[0]}
            </span>
          </motion.div>
        ))}
      </div>
    </div>
  )
}

// Subject Mastery Card
function SubjectMasteryCard({ subject }: { subject: SubjectMastery }) {
  const trendIcon = subject.trend === 'improving' ? TrendingUp : subject.trend === 'declining' ? TrendingDown : Activity
  const TrendIcon = trendIcon
  
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      whileHover={{ scale: 1.02 }}
      className="p-4 bg-white rounded-xl border border-gray-100 hover:border-violet-200 transition-all"
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className={cn(
            'w-10 h-10 rounded-lg flex items-center justify-center',
            subject.color
          )}>
            <BookOpen className="h-5 w-5 text-white" />
          </div>
          <div>
            <div className="font-medium text-gray-900">{subject.subject}</div>
            <div className="text-xs text-gray-500">{subject.resourcesCompleted} resources completed</div>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <TrendIcon className={cn(
            'h-4 w-4',
            subject.trend === 'improving' ? 'text-green-500' :
            subject.trend === 'declining' ? 'text-red-500' : 'text-gray-400'
          )} />
          <span className="text-lg font-bold text-gray-900">{subject.mastery}%</span>
        </div>
      </div>
      
      <Progress value={subject.mastery} className="h-2" />
      
      <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
        <span className="flex items-center gap-1">
          <Clock className="h-3 w-3" />
          {Math.floor(subject.timeSpent / 60)}h {subject.timeSpent % 60}m
        </span>
        <span>Mastery Level</span>
      </div>
    </motion.div>
  )
}

// Weekly Stats Card
function WeeklyStatsCard({ stats }: { stats: WeeklyStats[] }) {
  const totalMinutes = stats.reduce((sum, s) => sum + s.readingMinutes, 0)
  const totalResources = stats.reduce((sum, s) => sum + s.resourcesViewed, 0)
  const totalQuizzes = stats.reduce((sum, s) => sum + s.quizzesCompleted, 0)
  const avgMinutes = Math.round(totalMinutes / stats.length)
  
  return (
    <Card className="p-4 border-gray-100 rounded-2xl">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-gray-900">This Week</h3>
        <Badge variant="secondary" className="bg-violet-50 text-violet-700 border-0">
          {stats.length} days
        </Badge>
      </div>
      
      {/* Mini Bar Chart */}
      <div className="mb-4">
        <MiniBarChart
          data={stats.map(s => s.readingMinutes)}
          color="bg-gradient-to-t from-violet-500 to-purple-400"
          height={60}
        />
        <div className="flex justify-between text-xs text-gray-400 mt-2">
          {stats.slice(0, 7).map(s => (
            <span key={s.date}>{s.day}</span>
          ))}
        </div>
      </div>
      
      {/* Stats Grid */}
      <div className="grid grid-cols-3 gap-3">
        <div className="text-center p-2 bg-gray-50 rounded-lg">
          <div className="text-xl font-bold text-violet-600">{totalMinutes}</div>
          <div className="text-xs text-gray-500">Minutes</div>
        </div>
        <div className="text-center p-2 bg-gray-50 rounded-lg">
          <div className="text-xl font-bold text-green-600">{totalResources}</div>
          <div className="text-xs text-gray-500">Resources</div>
        </div>
        <div className="text-center p-2 bg-gray-50 rounded-lg">
          <div className="text-xl font-bold text-amber-600">{totalQuizzes}</div>
          <div className="text-xs text-gray-500">Quizzes</div>
        </div>
      </div>
    </Card>
  )
}

// Engagement Rating Component
function EngagementRating({ rating, label }: { rating: number; label: string }) {
  const getRatingColor = (r: number) => {
    if (r >= 80) return { bg: 'bg-green-100', text: 'text-green-700', fill: 'text-green-500' }
    if (r >= 60) return { bg: 'bg-amber-100', text: 'text-amber-700', fill: 'text-amber-500' }
    return { bg: 'bg-red-100', text: 'text-red-700', fill: 'text-red-500' }
  }
  
  const colors = getRatingColor(rating)
  
  return (
    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
      <span className="text-sm text-gray-600">{label}</span>
      <div className="flex items-center gap-2">
        <div className="flex gap-0.5">
          {[1, 2, 3, 4, 5].map((star) => (
            <Sparkles
              key={star}
              className={cn(
                'h-4 w-4',
                star <= Math.round(rating / 20) ? colors.fill : 'text-gray-200'
              )}
            />
          ))}
        </div>
        <span className={cn('font-medium', colors.text)}>{rating}%</span>
      </div>
    </div>
  )
}

// Demo data generators
function generateWeeklyStats(): WeeklyStats[] {
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
  return days.map((day, index) => ({
    date: new Date(Date.now() - (6 - index) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    day,
    readingMinutes: Math.floor(Math.random() * 60) + 20,
    resourcesViewed: Math.floor(Math.random() * 5) + 1,
    quizzesCompleted: Math.floor(Math.random() * 3),
    xpEarned: Math.floor(Math.random() * 100) + 20,
  }))
}

function generateSubjectMastery(): SubjectMastery[] {
  return [
    { subject: 'Physics', mastery: 78, timeSpent: 450, resourcesCompleted: 24, trend: 'improving', color: 'bg-blue-500' },
    { subject: 'Chemistry', mastery: 65, timeSpent: 320, resourcesCompleted: 18, trend: 'stable', color: 'bg-purple-500' },
    { subject: 'Mathematics', mastery: 82, timeSpent: 520, resourcesCompleted: 32, trend: 'improving', color: 'bg-rose-500' },
    { subject: 'Biology', mastery: 70, timeSpent: 280, resourcesCompleted: 15, trend: 'declining', color: 'bg-green-500' },
  ]
}

function generateTimeOfDayData(): TimeOfDayData[] {
  const hours = [
    { hour: 6, label: '6 AM' },
    { hour: 8, label: '8 AM' },
    { hour: 10, label: '10 AM' },
    { hour: 12, label: '12 PM' },
    { hour: 14, label: '2 PM' },
    { hour: 16, label: '4 PM' },
    { hour: 18, label: '6 PM' },
    { hour: 20, label: '8 PM' },
    { hour: 22, label: '10 PM' },
  ]
  
  const activities = [20, 35, 80, 45, 30, 55, 90, 75, 40]
  const maxActivity = Math.max(...activities)
  
  return hours.map((h, i) => ({
    ...h,
    activity: activities[i],
    isPeak: activities[i] === maxActivity,
  }))
}

export function EngagementAnalyticsDashboard({
  weeklyStats: providedWeeklyStats,
  subjectMastery: providedSubjectMastery,
  timeOfDayData: providedTimeOfDayData,
  totalReadingTime = 1570,
  currentStreak = 12,
  className,
}: EngagementAnalyticsDashboardProps) {
  const [timeRange, setTimeRange] = useState<'week' | 'month'>('week')
  
  const weeklyStats = providedWeeklyStats || generateWeeklyStats()
  const subjectMastery = providedSubjectMastery || generateSubjectMastery()
  const timeOfDayData = providedTimeOfDayData || generateTimeOfDayData()
  
  // Calculate totals
  const totalMinutes = weeklyStats.reduce((sum, s) => sum + s.readingMinutes, 0)
  const totalHours = Math.floor(totalMinutes / 60)
  const remainingMinutes = totalMinutes % 60
  
  // Engagement ratings
  const engagementRatings = [
    { label: 'Reading Consistency', rating: 85 },
    { label: 'Quiz Performance', rating: 72 },
    { label: 'Resource Completion', rating: 91 },
    { label: 'Time Management', rating: 68 },
  ]
  
  return (
    <div className={cn('space-y-6', className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-500 flex items-center justify-center">
            <BarChart3 className="h-5 w-5 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Engagement Analytics</h2>
            <p className="text-sm text-gray-500">Track your learning journey</p>
          </div>
        </div>
        
        <Select value={timeRange} onValueChange={(v) => setTimeRange(v as 'week' | 'month')}>
          <SelectTrigger className="w-32 border-gray-200">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="week">This Week</SelectItem>
            <SelectItem value="month">This Month</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { icon: Clock, label: 'Reading Time', value: `${totalHours}h ${remainingMinutes}m`, color: 'from-violet-500 to-purple-500' },
          { icon: Eye, label: 'Resources Viewed', value: weeklyStats.reduce((s, d) => s + d.resourcesViewed, 0), color: 'from-blue-500 to-cyan-500' },
          { icon: Target, label: 'Avg. Daily Goal', value: '87%', color: 'from-green-500 to-emerald-500' },
          { icon: Zap, label: 'XP Earned', value: weeklyStats.reduce((s, d) => s + d.xpEarned, 0), color: 'from-amber-500 to-orange-500' },
        ].map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="p-4 border-gray-100 rounded-2xl hover:shadow-lg transition-shadow">
              <div className="flex items-center gap-3">
                <div className={cn(
                  'w-11 h-11 rounded-xl flex items-center justify-center bg-gradient-to-br shadow-lg',
                  stat.color
                )}>
                  <stat.icon className="h-5 w-5 text-white" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
                  <div className="text-xs text-gray-500">{stat.label}</div>
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Weekly Stats Card */}
        <div className="lg:col-span-1">
          <WeeklyStatsCard stats={weeklyStats} />
        </div>
        
        {/* Activity Heatmap */}
        <div className="lg:col-span-2">
          <Card className="p-4 border-gray-100 rounded-2xl">
            <h3 className="font-semibold text-gray-900 mb-4">Learning Activity by Hour</h3>
            <ActivityHeatmap data={timeOfDayData} />
            
            {/* Peak Hours Insight */}
            <div className="mt-4 p-3 bg-gradient-to-r from-violet-50 to-purple-50 rounded-lg">
              <div className="flex items-center gap-2 text-sm">
                <Sparkles className="h-4 w-4 text-violet-500" />
                <span className="text-gray-600">
                  Your peak learning hours are <strong className="text-violet-700">6 PM - 8 PM</strong>
                </span>
              </div>
            </div>
          </Card>
        </div>
      </div>
      
      {/* Engagement Ratings */}
      <Card className="p-4 border-gray-100 rounded-2xl">
        <h3 className="font-semibold text-gray-900 mb-4">Engagement Ratings</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {engagementRatings.map((rating, index) => (
            <motion.div
              key={rating.label}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <EngagementRating {...rating} />
            </motion.div>
          ))}
        </div>
      </Card>
      
      {/* Subject Mastery */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-900">Mastery by Subject</h3>
          <Button variant="ghost" size="sm" className="text-violet-600 hover:text-violet-700 hover:bg-violet-50">
            View Details
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {subjectMastery.map((subject, index) => (
            <motion.div
              key={subject.subject}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <SubjectMasteryCard subject={subject} />
            </motion.div>
          ))}
        </div>
      </div>
      
      {/* Reading Trend Chart */}
      <Card className="p-4 border-gray-100 rounded-2xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-900">Reading Time Trend</h3>
          <div className="flex items-center gap-2 text-sm text-green-600">
            <TrendingUp className="h-4 w-4" />
            +23% vs last week
          </div>
        </div>
        
        <div className="flex justify-center">
          <AnimatedLineChart
            data={weeklyStats.map((s, i) => ({ x: i, y: s.readingMinutes }))}
            color="text-violet-500"
          />
        </div>
        
        <div className="flex justify-between text-xs text-gray-500 mt-2 px-4">
          <span>Start of week</span>
          <span>Today</span>
        </div>
      </Card>
    </div>
  )
}

export default EngagementAnalyticsDashboard
