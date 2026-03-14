'use client'

import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Clock, 
  TrendingUp, 
  TrendingDown,
  BarChart3,
  BookOpen,
  Target,
  Zap,
  Calendar,
  ChevronDown,
  ChevronUp,
  Eye,
  Timer,
  Award,
  Flame,
  Activity,
  Brain
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { cn } from '@/modules/tests/utils'
import { 
  FadeIn,
  AnimatedCounter,
  RingProgress
} from './motion'

// ============================================
// TYPES
// ============================================

interface TopicTime {
  topic: string
  subject: string
  timeSpent: number // minutes
  sessions: number
  avgSessionTime: number
  trend: 'up' | 'down' | 'stable'
  mastery: number
}

interface WeeklyActivity {
  day: string
  studyTime: number
  questionsAttempted: number
  accuracy: number
}

interface ReadingStats {
  avgReadingSpeed: number // words per minute
  avgComprehension: number // percentage
  preferredTime: string
  focusDuration: number // minutes
  breakFrequency: number // minutes between breaks
}

interface MasteryScore {
  subject: string
  score: number
  trend: number
  weeklyChange: number
}

// ============================================
// USER BEHAVIOR INSIGHTS DASHBOARD
// ============================================

export function UserBehaviorInsights() {
  const [expandedPanel, setExpandedPanel] = useState<string | null>('time')

  // Simulated time tracking data
  const topicTimes = useMemo<TopicTime[]>(() => [
    { topic: 'Calculus', subject: 'Mathematics', timeSpent: 245, sessions: 12, avgSessionTime: 20, trend: 'up', mastery: 72 },
    { topic: 'Thermodynamics', subject: 'Physics', timeSpent: 180, sessions: 8, avgSessionTime: 22, trend: 'up', mastery: 85 },
    { topic: 'Organic Chemistry', subject: 'Chemistry', timeSpent: 156, sessions: 7, avgSessionTime: 22, trend: 'stable', mastery: 58 },
    { topic: 'Mechanics', subject: 'Physics', timeSpent: 140, sessions: 6, avgSessionTime: 23, trend: 'down', mastery: 68 },
    { topic: 'Algebra', subject: 'Mathematics', timeSpent: 98, sessions: 5, avgSessionTime: 19, trend: 'up', mastery: 75 }
  ], [])

  // Weekly activity data
  const weeklyActivity = useMemo<WeeklyActivity[]>(() => [
    { day: 'Mon', studyTime: 45, questionsAttempted: 32, accuracy: 78 },
    { day: 'Tue', studyTime: 62, questionsAttempted: 45, accuracy: 82 },
    { day: 'Wed', studyTime: 38, questionsAttempted: 28, accuracy: 71 },
    { day: 'Thu', studyTime: 55, questionsAttempted: 40, accuracy: 85 },
    { day: 'Fri', studyTime: 48, questionsAttempted: 35, accuracy: 76 },
    { day: 'Sat', studyTime: 72, questionsAttempted: 52, accuracy: 88 },
    { day: 'Sun', studyTime: 30, questionsAttempted: 22, accuracy: 73 }
  ], [])

  // Reading stats
  const readingStats = useMemo<ReadingStats>(() => ({
    avgReadingSpeed: 245,
    avgComprehension: 82,
    preferredTime: 'Evening (6-9 PM)',
    focusDuration: 28,
    breakFrequency: 45
  }), [])

  // Mastery scores
  const masteryScores = useMemo<MasteryScore[]>(() => [
    { subject: 'Mathematics', score: 72, trend: 5, weeklyChange: 8 },
    { subject: 'Physics', score: 78, trend: 8, weeklyChange: 12 },
    { subject: 'Chemistry', score: 65, trend: -2, weeklyChange: -3 },
    { subject: 'Biology', score: 82, trend: 3, weeklyChange: 5 }
  ], [])

  // Total stats
  const totalStudyTime = weeklyActivity.reduce((sum, d) => sum + d.studyTime, 0)
  const totalQuestions = weeklyActivity.reduce((sum, d) => sum + d.questionsAttempted, 0)
  const avgAccuracy = Math.round(weeklyActivity.reduce((sum, d) => sum + d.accuracy, 0) / weeklyActivity.length)

  // Toggle panel
  const togglePanel = (panel: string) => {
    setExpandedPanel(expandedPanel === panel ? null : panel)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-xl bg-gradient-to-br from-cyan-500 to-cyan-600 shadow-lg shadow-cyan-500/20">
          <Activity className="h-5 w-5 text-white" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-900">Behavior Insights</h2>
          <p className="text-sm text-gray-500">Understand your learning patterns</p>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { icon: <Clock className="h-4 w-4" />, label: 'This Week', value: `${totalStudyTime}m`, color: 'cyan' },
          { icon: <Target className="h-4 w-4" />, label: 'Questions', value: totalQuestions, color: 'purple' },
          { icon: <Zap className="h-4 w-4" />, label: 'Avg Accuracy', value: `${avgAccuracy}%`, color: 'emerald' },
          { icon: <Flame className="h-4 w-4" />, label: 'Streak', value: '7 days', color: 'amber' }
        ].map((stat, idx) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
          >
            <Card className="border border-gray-200 shadow-sm">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className={cn(
                    'p-1.5 rounded-lg',
                    stat.color === 'cyan' && 'bg-cyan-100 text-cyan-600',
                    stat.color === 'purple' && 'bg-purple-100 text-purple-600',
                    stat.color === 'emerald' && 'bg-emerald-100 text-emerald-600',
                    stat.color === 'amber' && 'bg-amber-100 text-amber-600'
                  )}>
                    {stat.icon}
                  </div>
                  <span className="text-xs text-gray-500">{stat.label}</span>
                </div>
                <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Expandable Panels */}
      <div className="space-y-3">
        {/* Time Tracking Panel */}
        <InsightPanel
          title="Time per Topic"
          icon={<Timer className="h-4 w-4" />}
          isExpanded={expandedPanel === 'time'}
          onToggle={() => togglePanel('time')}
          summary={`${topicTimes.length} topics tracked`}
          color="cyan"
        >
          <div className="space-y-4">
            {/* Time Distribution Chart */}
            <div className="flex items-end justify-between gap-2 h-40 pt-4">
              {topicTimes.map((topic, idx) => {
                const height = (topic.timeSpent / Math.max(...topicTimes.map(t => t.timeSpent))) * 120
                return (
                  <motion.div
                    key={topic.topic}
                    className="flex-1 flex flex-col items-center"
                    initial={{ height: 0 }}
                    animate={{ height: 'auto' }}
                    transition={{ delay: idx * 0.05 }}
                  >
                    <motion.div
                      className="w-full bg-gradient-to-t from-cyan-600 to-cyan-400 rounded-t-lg relative"
                      initial={{ height: 0 }}
                      animate={{ height }}
                      transition={{ delay: idx * 0.05 + 0.1, duration: 0.4 }}
                    >
                      <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-xs font-semibold text-gray-700">
                        {topic.timeSpent}m
                      </span>
                    </motion.div>
                    <div className="mt-2 text-xs text-gray-500 text-center truncate w-full">
                      {topic.topic.split(' ')[0]}
                    </div>
                  </motion.div>
                )
              })}
            </div>

            {/* Topic Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {topicTimes.map((topic, idx) => (
                <motion.div
                  key={topic.topic}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="p-3 rounded-lg bg-gray-50 border border-gray-100"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-gray-900 text-sm">{topic.topic}</span>
                    <div className="flex items-center gap-1">
                      {topic.trend === 'up' ? (
                        <TrendingUp className="h-3 w-3 text-emerald-500" />
                      ) : topic.trend === 'down' ? (
                        <TrendingDown className="h-3 w-3 text-red-500" />
                      ) : (
                        <div className="h-3 w-0.5 bg-gray-400 rounded" />
                      )}
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>{topic.sessions} sessions</span>
                    <span>Avg: {topic.avgSessionTime}m</span>
                  </div>
                  <div className="mt-2 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-gradient-to-r from-cyan-500 to-cyan-600 rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${topic.mastery}%` }}
                      transition={{ delay: idx * 0.05 + 0.2 }}
                    />
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </InsightPanel>

        {/* Reading Stats Panel */}
        <InsightPanel
          title="Reading Analytics"
          icon={<Eye className="h-4 w-4" />}
          isExpanded={expandedPanel === 'reading'}
          onToggle={() => togglePanel('reading')}
          summary={`${readingStats.avgReadingSpeed} wpm avg speed`}
          color="purple"
        >
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4">
            {[
              { label: 'Reading Speed', value: `${readingStats.avgReadingSpeed} wpm`, icon: <Zap className="h-4 w-4" /> },
              { label: 'Comprehension', value: `${readingStats.avgComprehension}%`, icon: <Brain className="h-4 w-4" /> },
              { label: 'Focus Duration', value: `${readingStats.focusDuration}m`, icon: <Target className="h-4 w-4" /> },
              { label: 'Best Time', value: readingStats.preferredTime.split(' ')[0], icon: <Clock className="h-4 w-4" /> }
            ].map((item, idx) => (
              <motion.div
                key={item.label}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.05 }}
                className="text-center p-4 rounded-xl bg-purple-50 border border-purple-100"
              >
                <div className="inline-flex p-2 rounded-lg bg-purple-100 text-purple-600 mb-2">
                  {item.icon}
                </div>
                <div className="text-lg font-bold text-gray-900">{item.value}</div>
                <div className="text-xs text-gray-500">{item.label}</div>
              </motion.div>
            ))}
          </div>
        </InsightPanel>

        {/* Topic Mastery Panel */}
        <InsightPanel
          title="Topic Mastery Scores"
          icon={<Award className="h-4 w-4" />}
          isExpanded={expandedPanel === 'mastery'}
          onToggle={() => togglePanel('mastery')}
          summary={`${masteryScores.filter(m => m.score >= 70).length}/${masteryScores.length} strong`
          }
          color="emerald"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
            {masteryScores.map((mastery, idx) => (
              <motion.div
                key={mastery.subject}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="flex items-center gap-4 p-4 rounded-xl border border-gray-200 bg-white"
              >
                <RingProgress
                  progress={mastery.score}
                  size={70}
                  strokeWidth={6}
                  color={mastery.score >= 70 ? '#10B981' : mastery.score >= 50 ? '#F59E0B' : '#EF4444'}
                />
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold text-gray-900">{mastery.subject}</h4>
                    <div className={cn(
                      'flex items-center gap-1 text-sm font-medium',
                      mastery.weeklyChange >= 0 ? 'text-emerald-600' : 'text-red-600'
                    )}>
                      {mastery.weeklyChange >= 0 ? (
                        <TrendingUp className="h-3 w-3" />
                      ) : (
                        <TrendingDown className="h-3 w-3" />
                      )}
                      {mastery.weeklyChange >= 0 ? '+' : ''}{mastery.weeklyChange}%
                    </div>
                  </div>
                  <div className="text-sm text-gray-500 mt-1">
                    {mastery.score >= 70 ? 'Strong' : mastery.score >= 50 ? 'Moderate' : 'Needs Focus'}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </InsightPanel>

        {/* Weekly Activity Heatmap */}
        <InsightPanel
          title="Weekly Activity"
          icon={<Calendar className="h-4 w-4" />}
          isExpanded={expandedPanel === 'weekly'}
          onToggle={() => togglePanel('weekly')}
          summary={`${totalStudyTime} total minutes`}
          color="amber"
        >
          <div className="pt-4">
            {/* Activity Grid */}
            <div className="grid grid-cols-7 gap-2 mb-4">
              {weeklyActivity.map((day, idx) => {
                const intensity = day.studyTime / Math.max(...weeklyActivity.map(d => d.studyTime))
                return (
                  <motion.div
                    key={day.day}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: idx * 0.03 }}
                    className="text-center"
                  >
                    <div 
                      className={cn(
                        "aspect-square rounded-lg flex items-center justify-center text-sm font-medium",
                        intensity > 0.7 ? 'bg-amber-500 text-white' :
                        intensity > 0.4 ? 'bg-amber-300 text-amber-900' :
                        intensity > 0.2 ? 'bg-amber-100 text-amber-700' :
                        'bg-gray-100 text-gray-500'
                      )}
                      style={{ opacity: 0.5 + intensity * 0.5 }}
                    >
                      {day.questionsAttempted}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">{day.day}</div>
                  </motion.div>
                )
              })}
            </div>

            {/* Activity Chart */}
            <div className="space-y-2">
              {weeklyActivity.map((day, idx) => (
                <motion.div
                  key={day.day}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.03 }}
                  className="flex items-center gap-3"
                >
                  <span className="w-10 text-sm text-gray-600">{day.day}</span>
                  <div className="flex-1 h-4 bg-gray-100 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-gradient-to-r from-amber-400 to-amber-500 rounded-full flex items-center justify-end pr-2"
                      initial={{ width: 0 }}
                      animate={{ width: `${(day.studyTime / 80) * 100}%` }}
                      transition={{ delay: idx * 0.03 + 0.1 }}
                    >
                      <span className="text-xs text-white font-medium">{day.studyTime}m</span>
                    </motion.div>
                  </div>
                  <span className="text-sm text-gray-500 w-16 text-right">{day.accuracy}%</span>
                </motion.div>
              ))}
            </div>
          </div>
        </InsightPanel>
      </div>
    </div>
  )
}

// ============================================
// INSIGHT PANEL - Collapsible Panel
// ============================================

interface InsightPanelProps {
  title: string
  icon: React.ReactNode
  isExpanded: boolean
  onToggle: () => void
  summary: string
  color: 'cyan' | 'purple' | 'emerald' | 'amber'
  children: React.ReactNode
}

function InsightPanel({ title, icon, isExpanded, onToggle, summary, color, children }: InsightPanelProps) {
  const colorMap = {
    cyan: 'bg-cyan-100 text-cyan-600 border-cyan-200',
    purple: 'bg-purple-100 text-purple-600 border-purple-200',
    emerald: 'bg-emerald-100 text-emerald-600 border-emerald-200',
    amber: 'bg-amber-100 text-amber-600 border-amber-200'
  }

  return (
    <Card className="border border-gray-200 shadow-sm overflow-hidden">
      <motion.div
        className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50 transition-colors"
        onClick={onToggle}
        whileTap={{ scale: 0.99 }}
      >
        <div className="flex items-center gap-3">
          <div className={cn("p-2 rounded-lg border", colorMap[color])}>
            {icon}
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">{title}</h3>
            <p className="text-sm text-gray-500">{summary}</p>
          </div>
        </div>
        <motion.div
          animate={{ rotate: isExpanded ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronDown className="h-5 w-5 text-gray-400" />
        </motion.div>
      </motion.div>
      
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <CardContent className="pt-0 px-4 pb-4 border-t border-gray-100">
              {children}
            </CardContent>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  )
}
