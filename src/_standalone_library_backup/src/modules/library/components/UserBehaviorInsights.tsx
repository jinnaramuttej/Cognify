'use client'

import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Clock,
  BookOpen,
  Target,
  Zap,
  Brain,
  Calendar,
  ChevronDown,
  ChevronUp,
  Layers,
  Flame,
  Award,
  Timer,
  Eye,
  Activity,
} from 'lucide-react'
import { cn } from '@/lib/utils'

// Types
export interface TopicTimeSpent {
  topic: string
  chapter: string
  subject: string
  timeSpent: number // minutes
  sessionsCount: number
  averageSessionLength: number
  masteryScore: number // 0-100
  trend: 'improving' | 'declining' | 'stable'
}

export interface WeeklyProgress {
  date: string
  minutes: number
  resourcesViewed: number
  quizzesCompleted: number
  xpEarned: number
}

export interface ReadingAnalytics {
  averageReadingSpeed: number // words per minute
  totalWordsRead: number
  sessionsThisWeek: number
  mostProductiveHour: number // 0-23
  streakDays: number
  comprehensionScore: number // 0-100
}

export interface SubjectMastery {
  subject: string
  masteryScore: number
  chaptersCompleted: number
  totalChapters: number
  strongTopics: string[]
  weakTopics: string[]
  trend: 'improving' | 'declining' | 'stable'
}

interface UserBehaviorInsightsProps {
  topicTimeData?: TopicTimeSpent[]
  weeklyProgress?: WeeklyProgress[]
  readingAnalytics?: ReadingAnalytics
  subjectMastery?: SubjectMastery[]
  className?: string
}

// Mini chart component for sparklines
function SparklineChart({ data, color = 'blue' }: { data: number[]; color?: string }) {
  const max = Math.max(...data, 1)
  const points = data.map((value, index) => {
    const x = (index / (data.length - 1)) * 100
    const y = 100 - (value / max) * 100
    return `${x},${y}`
  }).join(' ')
  
  return (
    <svg viewBox="0 0 100 100" className="w-full h-full" preserveAspectRatio="none">
      <motion.polyline
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 1, ease: 'easeOut' }}
        fill="none"
        stroke={color === 'blue' ? '#3b82f6' : color === 'green' ? '#10b981' : '#f59e0b'}
        strokeWidth="2"
        points={points}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

// Topic mastery heatmap
function MasteryHeatmap({ data }: { data: TopicTimeSpent[] }) {
  const sortedData = [...data].sort((a, b) => b.timeSpent - a.timeSpent).slice(0, 15)
  
  return (
    <div className="grid grid-cols-5 gap-1">
      {sortedData.map((item, index) => {
        const intensity = item.masteryScore / 100
        return (
          <motion.div
            key={item.topic}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.02 }}
            className="aspect-square rounded-md flex items-center justify-center text-xs font-medium cursor-pointer hover:scale-110 transition-transform"
            style={{
              backgroundColor: `rgba(37, 99, 235, ${0.1 + intensity * 0.7})`,
              color: intensity > 0.5 ? 'white' : '#1e40af',
            }}
            title={`${item.topic}: ${item.masteryScore}% mastery`}
          >
            {item.masteryScore}
          </motion.div>
        )
      })}
    </div>
  )
}

// Progress bar chart
function WeeklyChart({ data }: { data: WeeklyProgress[] }) {
  const maxMinutes = Math.max(...data.map(d => d.minutes), 1)
  
  return (
    <div className="flex items-end gap-1 h-32">
      {data.map((day, index) => {
        const height = (day.minutes / maxMinutes) * 100
        const isToday = index === data.length - 1
        
        return (
          <motion.div
            key={day.date}
            initial={{ height: 0 }}
            animate={{ height: `${height}%` }}
            transition={{ delay: index * 0.05, duration: 0.5, ease: 'easeOut' }}
            className="flex-1 flex flex-col items-center justify-end group"
          >
            <div className={cn(
              'w-full rounded-t-md transition-colors relative',
              isToday ? 'bg-blue-500' : 'bg-blue-200 hover:bg-blue-300'
            )}>
              <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                {day.minutes}m
              </div>
            </div>
          </motion.div>
        )
      })}
    </div>
  )
}

export function UserBehaviorInsights({
  topicTimeData = [],
  weeklyProgress = [],
  readingAnalytics,
  subjectMastery = [],
  className,
}: UserBehaviorInsightsProps) {
  const [expandedSection, setExpandedSection] = useState<string | null>('overview')
  
  // Calculate totals
  const totals = useMemo(() => {
    const totalTime = topicTimeData.reduce((acc, t) => acc + t.timeSpent, 0)
    const avgMastery = topicTimeData.length > 0
      ? topicTimeData.reduce((acc, t) => acc + t.masteryScore, 0) / topicTimeData.length
      : 0
    const totalSessions = topicTimeData.reduce((acc, t) => acc + t.sessionsCount, 0)
    
    return { totalTime, avgMastery, totalSessions }
  }, [topicTimeData])
  
  // Generate sparkline data from weekly progress
  const sparklineData = weeklyProgress.map(d => d.minutes)
  
  return (
    <Card className={cn('overflow-hidden', className)}>
      {/* Header */}
      <div className="p-4 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-violet-500 flex items-center justify-center">
              <BarChart3 className="h-4 w-4 text-white" />
            </div>
            <h3 className="font-semibold text-gray-900">Your Learning Insights</h3>
          </div>
          <Badge variant="outline" className="text-xs">
            <Activity className="h-3 w-3 mr-1" />
            Real-time
          </Badge>
        </div>
      </div>
      
      {/* Quick Stats */}
      <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50">
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 200, delay: 0.1 }}
              className="text-2xl font-bold text-blue-600"
            >
              {Math.round(totals.totalTime / 60)}h
            </motion.div>
            <div className="text-xs text-gray-600 mt-1">Total Study Time</div>
          </div>
          <div className="text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
              className="text-2xl font-bold text-purple-600"
            >
              {Math.round(totals.avgMastery)}%
            </motion.div>
            <div className="text-xs text-gray-600 mt-1">Avg Mastery</div>
          </div>
          <div className="text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 200, delay: 0.3 }}
              className="text-2xl font-bold text-emerald-600"
            >
              {totals.totalSessions}
            </motion.div>
            <div className="text-xs text-gray-600 mt-1">Sessions</div>
          </div>
        </div>
      </div>
      
      {/* Collapsible Sections */}
      <div className="divide-y divide-gray-100">
        {/* Reading Analytics Section */}
        {readingAnalytics && (
          <div>
            <button
              onClick={() => setExpandedSection(expandedSection === 'reading' ? null : 'reading')}
              className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <Eye className="h-5 w-5 text-gray-400" />
                <span className="font-medium text-gray-900">Reading Analytics</span>
              </div>
              <motion.div
                animate={{ rotate: expandedSection === 'reading' ? 180 : 0 }}
                transition={{ duration: 0.2 }}
              >
                <ChevronDown className="h-5 w-5 text-gray-400" />
              </motion.div>
            </button>
            
            <AnimatePresence>
              {expandedSection === 'reading' && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <div className="p-4 pt-0 space-y-4">
                    {/* Reading Speed */}
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <div className="text-sm font-medium text-gray-700">Reading Speed</div>
                        <div className="text-xs text-gray-500">words per minute</div>
                      </div>
                      <div className="text-right">
                        <div className="text-xl font-bold text-gray-900">{readingAnalytics.averageReadingSpeed}</div>
                        <Badge className="text-xs bg-emerald-100 text-emerald-700">Above average</Badge>
                      </div>
                    </div>
                    
                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 gap-3">
                      <div className="p-3 bg-blue-50 rounded-lg">
                        <div className="flex items-center gap-2 text-blue-600 mb-1">
                          <BookOpen className="h-4 w-4" />
                          <span className="text-xs">Total Words</span>
                        </div>
                        <div className="text-lg font-bold text-blue-700">
                          {(readingAnalytics.totalWordsRead / 1000).toFixed(1)}K
                        </div>
                      </div>
                      <div className="p-3 bg-purple-50 rounded-lg">
                        <div className="flex items-center gap-2 text-purple-600 mb-1">
                          <Flame className="h-4 w-4" />
                          <span className="text-xs">Streak</span>
                        </div>
                        <div className="text-lg font-bold text-purple-700">
                          {readingAnalytics.streakDays} days
                        </div>
                      </div>
                      <div className="p-3 bg-amber-50 rounded-lg">
                        <div className="flex items-center gap-2 text-amber-600 mb-1">
                          <Timer className="h-4 w-4" />
                          <span className="text-xs">Best Hour</span>
                        </div>
                        <div className="text-lg font-bold text-amber-700">
                          {readingAnalytics.mostProductiveHour}:00
                        </div>
                      </div>
                      <div className="p-3 bg-emerald-50 rounded-lg">
                        <div className="flex items-center gap-2 text-emerald-600 mb-1">
                          <Brain className="h-4 w-4" />
                          <span className="text-xs">Comprehension</span>
                        </div>
                        <div className="text-lg font-bold text-emerald-700">
                          {readingAnalytics.comprehensionScore}%
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
        
        {/* Weekly Progress Section */}
        <div>
          <button
            onClick={() => setExpandedSection(expandedSection === 'progress' ? null : 'progress')}
            className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <Calendar className="h-5 w-5 text-gray-400" />
              <span className="font-medium text-gray-900">Weekly Progress</span>
            </div>
            <motion.div
              animate={{ rotate: expandedSection === 'progress' ? 180 : 0 }}
              transition={{ duration: 0.2 }}
            >
              <ChevronDown className="h-5 w-5 text-gray-400" />
            </motion.div>
          </button>
          
          <AnimatePresence>
            {expandedSection === 'progress' && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="p-4 pt-0">
                  <WeeklyChart data={weeklyProgress} />
                  <div className="flex justify-between mt-2 text-xs text-gray-500">
                    {weeklyProgress.slice(0, 7).map((day) => (
                      <span key={day.date} className="flex-1 text-center">
                        {new Date(day.date).toLocaleDateString('en', { weekday: 'short' })}
                      </span>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        
        {/* Topic Mastery Heatmap Section */}
        <div>
          <button
            onClick={() => setExpandedSection(expandedSection === 'heatmap' ? null : 'heatmap')}
            className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <Target className="h-5 w-5 text-gray-400" />
              <span className="font-medium text-gray-900">Topic Mastery Heatmap</span>
            </div>
            <motion.div
              animate={{ rotate: expandedSection === 'heatmap' ? 180 : 0 }}
              transition={{ duration: 0.2 }}
            >
              <ChevronDown className="h-5 w-5 text-gray-400" />
            </motion.div>
          </button>
          
          <AnimatePresence>
            {expandedSection === 'heatmap' && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="p-4 pt-0">
                  <MasteryHeatmap data={topicTimeData} />
                  <div className="flex items-center justify-center gap-2 mt-3 text-xs text-gray-500">
                    <span>Low</span>
                    <div className="flex gap-0.5">
                      {[0.2, 0.4, 0.6, 0.8, 1].map((opacity, i) => (
                        <div
                          key={i}
                          className="w-4 h-4 rounded"
                          style={{ backgroundColor: `rgba(37, 99, 235, ${opacity})` }}
                        />
                      ))}
                    </div>
                    <span>High</span>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        
        {/* Subject Mastery Section */}
        <div>
          <button
            onClick={() => setExpandedSection(expandedSection === 'subjects' ? null : 'subjects')}
            className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <Award className="h-5 w-5 text-gray-400" />
              <span className="font-medium text-gray-900">Subject Mastery</span>
            </div>
            <motion.div
              animate={{ rotate: expandedSection === 'subjects' ? 180 : 0 }}
              transition={{ duration: 0.2 }}
            >
              <ChevronDown className="h-5 w-5 text-gray-400" />
            </motion.div>
          </button>
          
          <AnimatePresence>
            {expandedSection === 'subjects' && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="p-4 pt-0 space-y-3">
                  {subjectMastery.map((subject, index) => (
                    <motion.div
                      key={subject.subject}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="p-3 bg-gray-50 rounded-lg"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-gray-900">{subject.subject}</span>
                        <div className="flex items-center gap-1">
                          {subject.trend === 'improving' && (
                            <TrendingUp className="h-4 w-4 text-emerald-500" />
                          )}
                          {subject.trend === 'declining' && (
                            <TrendingDown className="h-4 w-4 text-red-500" />
                          )}
                          <span className="text-sm font-semibold">{subject.masteryScore}%</span>
                        </div>
                      </div>
                      <Progress 
                        value={subject.masteryScore} 
                        className="h-2"
                      />
                      <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
                        <span>{subject.chaptersCompleted}/{subject.totalChapters} chapters</span>
                        <div className="flex gap-2">
                          {subject.strongTopics.slice(0, 1).map((topic, i) => (
                            <Badge key={i} className="bg-emerald-100 text-emerald-700 text-xs">
                              {topic}
                            </Badge>
                          ))}
                          {subject.weakTopics.slice(0, 1).map((topic, i) => (
                            <Badge key={i} className="bg-red-100 text-red-700 text-xs">
                              {topic}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </Card>
  )
}

export default UserBehaviorInsights
