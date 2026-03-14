'use client'

import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown, 
  Clock, 
  Target,
  Users,
  BookOpen,
  Calendar,
  Download,
  Filter,
  RefreshCw
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { cn } from '@/modules/tests/utils'
import { 
  FadeIn,
  AnimatedCounter,
  RingProgress
} from './motion'
import type { TestAnalytics, ItemAnalytics, UserAnalytics, CohortAnalytics } from '@/modules/tests/types'

// ============================================
// ANALYTICS CANVAS - Main Component
// ============================================

interface AnalyticsCanvasProps {
  testId?: string
  cohortId?: string
  userId?: string
}

export function AnalyticsCanvas({ testId, cohortId, userId }: AnalyticsCanvasProps) {
  const [timeRange, setTimeRange] = useState('7d')
  const [activeView, setActiveView] = useState('overview')

  // Mock analytics data
  const analyticsData = useMemo(() => ({
    overview: {
      totalAttempts: 245,
      avgScore: 72.5,
      avgAccuracy: 68.3,
      avgTimeSpent: 45, // minutes
      completionRate: 89.2,
      passRate: 76.5
    },
    subjectBreakdown: [
      { subject: 'Physics', avgScore: 74, attempts: 85, trend: 'up', color: '#2563EB' },
      { subject: 'Chemistry', avgScore: 68, attempts: 72, trend: 'down', color: '#10B981' },
      { subject: 'Mathematics', avgScore: 76, attempts: 88, trend: 'up', color: '#8B5CF6' }
    ],
    difficultyBreakdown: [
      { level: 'Easy', avgScore: 85, count: 120, color: '#10B981' },
      { level: 'Medium', avgScore: 72, count: 180, color: '#2563EB' },
      { level: 'Hard', avgScore: 58, count: 95, color: '#EF4444' }
    ],
    timeDistribution: [
      { range: '<30s', count: 45, percentage: 15 },
      { range: '30-60s', count: 120, percentage: 40 },
      { range: '60-90s', count: 80, percentage: 27 },
      { range: '>90s', count: 55, percentage: 18 }
    ],
    weeklyTrend: [
      { week: 'Week 1', avgScore: 68, attempts: 35 },
      { week: 'Week 2', avgScore: 70, attempts: 42 },
      { week: 'Week 3', avgScore: 69, attempts: 38 },
      { week: 'Week 4', avgScore: 74, attempts: 55 }
    ],
    topPerformers: [
      { rank: 1, name: 'Rahul S.', score: 96, time: 52 },
      { rank: 2, name: 'Priya M.', score: 94, time: 48 },
      { rank: 3, name: 'Amit K.', score: 92, time: 55 },
      { rank: 4, name: 'Sneha P.', score: 90, time: 50 },
      { rank: 5, name: 'Vikram R.', score: 89, time: 58 }
    ],
    itemAnalysis: [
      { id: 'Q1', text: 'Integration basics...', pValue: 0.82, discrimination: 0.45, avgTime: 45 },
      { id: 'Q2', text: 'Thermodynamics...', pValue: 0.45, discrimination: 0.62, avgTime: 72 },
      { id: 'Q3', text: 'Organic reactions...', pValue: 0.38, discrimination: 0.55, avgTime: 85 },
      { id: 'Q4', text: 'Kinematics...', pValue: 0.71, discrimination: 0.48, avgTime: 52 },
      { id: 'Q5', text: 'Electrochemistry...', pValue: 0.55, discrimination: 0.70, avgTime: 65 }
    ]
  }), [])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <motion.h2 
            className="text-xl font-bold text-gray-900"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            Analytics Dashboard
          </motion.h2>
          <motion.p 
            className="text-gray-500 text-sm mt-1"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
          >
            Performance insights and item analysis
          </motion.p>
        </div>
        <div className="flex items-center gap-3">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-32 border-gray-200">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
              <SelectItem value="all">All time</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" className="border-gray-200">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button className="bg-blue-600 hover:bg-blue-700">
            <Download className="h-4 w-4 mr-2" />
            Export PDF
          </Button>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {[
          { icon: <Users className="h-4 w-4" />, label: 'Attempts', value: analyticsData.overview.totalAttempts, color: 'blue' },
          { icon: <Target className="h-4 w-4" />, label: 'Avg Score', value: `${analyticsData.overview.avgScore}%`, color: 'emerald' },
          { icon: <BarChart3 className="h-4 w-4" />, label: 'Accuracy', value: `${analyticsData.overview.avgAccuracy}%`, color: 'purple' },
          { icon: <Clock className="h-4 w-4" />, label: 'Avg Time', value: `${analyticsData.overview.avgTimeSpent}m`, color: 'amber' },
          { icon: <BookOpen className="h-4 w-4" />, label: 'Completion', value: `${analyticsData.overview.completionRate}%`, color: 'cyan' },
          { icon: <TrendingUp className="h-4 w-4" />, label: 'Pass Rate', value: `${analyticsData.overview.passRate}%`, color: 'rose' }
        ].map((stat, idx) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
          >
            <Card className="border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-4 text-center">
                <div className={cn(
                  'inline-flex p-2 rounded-lg mb-2',
                  stat.color === 'blue' && 'bg-blue-100 text-blue-600',
                  stat.color === 'emerald' && 'bg-emerald-100 text-emerald-600',
                  stat.color === 'purple' && 'bg-purple-100 text-purple-600',
                  stat.color === 'amber' && 'bg-amber-100 text-amber-600',
                  stat.color === 'cyan' && 'bg-cyan-100 text-cyan-600',
                  stat.color === 'rose' && 'bg-rose-100 text-rose-600'
                )}>
                  {stat.icon}
                </div>
                <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
                <div className="text-xs text-gray-500 mt-1">{stat.label}</div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Main Charts */}
      <Tabs value={activeView} onValueChange={setActiveView}>
        <TabsList className="bg-white border border-gray-200 p-1 h-auto">
          <TabsTrigger value="overview" className="text-sm px-4 py-2 data-[state=active]:bg-blue-600 data-[state=active]:text-white">
            Overview
          </TabsTrigger>
          <TabsTrigger value="subjects" className="text-sm px-4 py-2 data-[state=active]:bg-blue-600 data-[state=active]:text-white">
            By Subject
          </TabsTrigger>
          <TabsTrigger value="difficulty" className="text-sm px-4 py-2 data-[state=active]:bg-blue-600 data-[state=active]:text-white">
            Difficulty
          </TabsTrigger>
          <TabsTrigger value="items" className="text-sm px-4 py-2 data-[state=active]:bg-blue-600 data-[state=active]:text-white">
            Item Analysis
          </TabsTrigger>
          <TabsTrigger value="leaderboard" className="text-sm px-4 py-2 data-[state=active]:bg-blue-600 data-[state=active]:text-white">
            Leaderboard
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-6 space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Weekly Trend Chart */}
            <Card className="border border-gray-200 shadow-sm">
              <CardHeader className="border-b border-gray-100 pb-4">
                <CardTitle className="text-base font-semibold text-gray-900 flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-blue-600" />
                  Weekly Score Trend
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="h-64 flex items-end justify-between gap-4">
                  {analyticsData.weeklyTrend.map((week, idx) => {
                    const height = (week.avgScore / 100) * 200
                    return (
                      <motion.div
                        key={week.week}
                        className="flex-1 flex flex-col items-center"
                        initial={{ height: 0 }}
                        animate={{ height: 'auto' }}
                        transition={{ delay: idx * 0.1, duration: 0.5 }}
                      >
                        <motion.div
                          className="w-full bg-gradient-to-t from-blue-600 to-blue-400 rounded-t-lg relative"
                          initial={{ height: 0 }}
                          animate={{ height }}
                          transition={{ delay: idx * 0.1, duration: 0.5, ease: 'easeOut' }}
                        >
                          <span className="absolute -top-6 left-1/2 transform -translate-x-1/2 text-sm font-semibold text-gray-900">
                            {week.avgScore}%
                          </span>
                        </motion.div>
                        <div className="mt-2 text-xs text-gray-500 text-center">{week.week}</div>
                        <div className="text-xs text-gray-400">{week.attempts} attempts</div>
                      </motion.div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Time Distribution */}
            <Card className="border border-gray-200 shadow-sm">
              <CardHeader className="border-b border-gray-100 pb-4">
                <CardTitle className="text-base font-semibold text-gray-900 flex items-center gap-2">
                  <Clock className="h-4 w-4 text-blue-600" />
                  Time per Question Distribution
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4">
                  {analyticsData.timeDistribution.map((item, idx) => (
                    <motion.div
                      key={item.range}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.1 }}
                      className="space-y-2"
                    >
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">{item.range}</span>
                        <span className="font-medium text-gray-900">{item.count} ({item.percentage}%)</span>
                      </div>
                      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                        <motion.div
                          className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full"
                          initial={{ width: 0 }}
                          animate={{ width: `${item.percentage}%` }}
                          transition={{ delay: idx * 0.1 + 0.2, duration: 0.5 }}
                        />
                      </div>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="subjects" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {analyticsData.subjectBreakdown.map((subject, idx) => (
              <motion.div
                key={subject.subject}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.1 }}
              >
                <Card className="border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                  <CardContent className="p-6 text-center">
                    <div className="flex justify-center mb-4">
                      <RingProgress
                        progress={subject.avgScore}
                        size={100}
                        strokeWidth={8}
                        color={subject.color}
                      />
                    </div>
                    <h3 className="font-semibold text-gray-900">{subject.subject}</h3>
                    <div className="flex items-center justify-center gap-2 mt-2">
                      <span className="text-sm text-gray-500">{subject.attempts} attempts</span>
                      {subject.trend === 'up' ? (
                        <Badge className="bg-emerald-100 text-emerald-700 border-0">
                          <TrendingUp className="h-3 w-3 mr-1" />
                          Up
                        </Badge>
                      ) : (
                        <Badge className="bg-red-100 text-red-700 border-0">
                          <TrendingDown className="h-3 w-3 mr-1" />
                          Down
                        </Badge>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="difficulty" className="mt-6">
          <Card className="border border-gray-200 shadow-sm">
            <CardHeader className="border-b border-gray-100 pb-4">
              <CardTitle className="text-base font-semibold text-gray-900 flex items-center gap-2">
                <Target className="h-4 w-4 text-blue-600" />
                Performance by Difficulty Level
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {analyticsData.difficultyBreakdown.map((level, idx) => (
                  <motion.div
                    key={level.level}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className="p-4 rounded-xl border border-gray-200"
                    style={{ borderColor: level.color + '40' }}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <span className="font-semibold" style={{ color: level.color }}>{level.level}</span>
                      <span className="text-sm text-gray-500">{level.count} questions</span>
                    </div>
                    <div className="text-3xl font-bold text-gray-900 mb-2">{level.avgScore}%</div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <motion.div
                        className="h-full rounded-full"
                        style={{ backgroundColor: level.color }}
                        initial={{ width: 0 }}
                        animate={{ width: `${level.avgScore}%` }}
                        transition={{ delay: idx * 0.1 + 0.3, duration: 0.5 }}
                      />
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="items" className="mt-6">
          <Card className="border border-gray-200 shadow-sm">
            <CardHeader className="border-b border-gray-100 pb-4">
              <CardTitle className="text-base font-semibold text-gray-900 flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-blue-600" />
                Item Analysis (Top Questions)
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="text-left p-4 text-sm font-semibold text-gray-600">Question</th>
                      <th className="text-center p-4 text-sm font-semibold text-gray-600">P-Value</th>
                      <th className="text-center p-4 text-sm font-semibold text-gray-600">Discrimination</th>
                      <th className="text-center p-4 text-sm font-semibold text-gray-600">Avg Time</th>
                      <th className="text-center p-4 text-sm font-semibold text-gray-600">Quality</th>
                    </tr>
                  </thead>
                  <tbody>
                    {analyticsData.itemAnalysis.map((item, idx) => {
                      const quality = item.discrimination > 0.4 && item.pValue > 0.3 && item.pValue < 0.9
                      return (
                        <motion.tr
                          key={item.id}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: idx * 0.05 }}
                          className="border-b border-gray-100 hover:bg-gray-50"
                        >
                          <td className="p-4">
                            <div className="font-medium text-gray-900">{item.id}</div>
                            <div className="text-sm text-gray-500 truncate max-w-xs">{item.text}</div>
                          </td>
                          <td className="p-4 text-center">
                            <Badge 
                              variant="outline"
                              className={cn(
                                item.pValue < 0.3 && 'border-red-500 text-red-600',
                                item.pValue > 0.3 && item.pValue < 0.7 && 'border-emerald-500 text-emerald-600',
                                item.pValue >= 0.7 && 'border-blue-500 text-blue-600'
                              )}
                            >
                              {item.pValue.toFixed(2)}
                            </Badge>
                          </td>
                          <td className="p-4 text-center">
                            <span className={cn(
                              'font-semibold',
                              item.discrimination >= 0.4 ? 'text-emerald-600' : 'text-amber-600'
                            )}>
                              {item.discrimination.toFixed(2)}
                            </span>
                          </td>
                          <td className="p-4 text-center text-gray-600">{item.avgTime}s</td>
                          <td className="p-4 text-center">
                            {quality ? (
                              <Badge className="bg-emerald-100 text-emerald-700 border-0">Good</Badge>
                            ) : (
                              <Badge className="bg-amber-100 text-amber-700 border-0">Review</Badge>
                            )}
                          </td>
                        </motion.tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="leaderboard" className="mt-6">
          <Card className="border border-gray-200 shadow-sm">
            <CardHeader className="border-b border-gray-100 pb-4">
              <CardTitle className="text-base font-semibold text-gray-900 flex items-center gap-2">
                <Users className="h-4 w-4 text-blue-600" />
                Top Performers
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-3">
                {analyticsData.topPerformers.map((performer, idx) => (
                  <motion.div
                    key={performer.rank}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className={cn(
                      'flex items-center gap-4 p-4 rounded-xl transition-colors',
                      idx === 0 && 'bg-gradient-to-r from-amber-50 to-amber-100/50 border border-amber-200',
                      idx === 1 && 'bg-gradient-to-r from-gray-50 to-gray-100/50 border border-gray-200',
                      idx === 2 && 'bg-gradient-to-r from-orange-50 to-orange-100/50 border border-orange-200',
                      idx > 2 && 'bg-gray-50 border border-gray-100'
                    )}
                  >
                    <div className={cn(
                      'w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg',
                      idx === 0 && 'bg-amber-400 text-white',
                      idx === 1 && 'bg-gray-400 text-white',
                      idx === 2 && 'bg-orange-400 text-white',
                      idx > 2 && 'bg-gray-200 text-gray-600'
                    )}>
                      {performer.rank}
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold text-gray-900">{performer.name}</div>
                      <div className="text-sm text-gray-500">{performer.time} minutes</div>
                    </div>
                    <div className="text-2xl font-bold text-gray-900">{performer.score}%</div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

// ============================================
// EXPORT RESULTS COMPONENT
// ============================================

interface ExportResultsProps {
  testId: string
  onExport: (format: 'pdf' | 'csv') => void
}

export function ExportResults({ testId, onExport }: ExportResultsProps) {
  return (
    <div className="flex gap-3">
      <Button 
        variant="outline" 
        onClick={() => onExport('csv')}
        className="border-gray-200"
      >
        <Download className="h-4 w-4 mr-2" />
        Export CSV
      </Button>
      <Button 
        onClick={() => onExport('pdf')}
        className="bg-blue-600 hover:bg-blue-700"
      >
        <Download className="h-4 w-4 mr-2" />
        Export PDF Report
      </Button>
    </div>
  )
}
