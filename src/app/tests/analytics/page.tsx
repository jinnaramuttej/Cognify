'use client'

import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { 
  ChevronLeft, BarChart3, TrendingUp, TrendingDown,
  Target, Clock, CheckCircle, XCircle, AlertCircle,
  BookOpen, Sparkles, Filter
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { cn } from '@/modules/tests/utils'

// ============================================
// DESIGN SYSTEM
// ============================================

const DESIGN = {
  colors: {
    primary: '#2563EB',
    success: '#10B981',
    warning: '#F59E0B',
    error: '#EF4444',
  },
  subjects: {
    Physics: { color: '#2563EB', bg: 'bg-blue-50', border: 'border-blue-200' },
    Chemistry: { color: '#10B981', bg: 'bg-emerald-50', border: 'border-emerald-200' },
    Mathematics: { color: '#7C3AED', bg: 'bg-purple-50', border: 'border-purple-200' },
    Biology: { color: '#F59E0B', bg: 'bg-amber-50', border: 'border-amber-200' },
  },
  masteryLevels: [
    { min: 80, label: 'Mastered', color: '#10B981' },
    { min: 60, label: 'Proficient', color: '#2563EB' },
    { min: 40, label: 'Developing', color: '#F59E0B' },
    { min: 0, label: 'Needs Work', color: '#EF4444' },
  ],
}

// ============================================
// TOPIC MASTERY HEATMAP
// ============================================

function TopicMasteryHeatmap() {
  const topics = [
    { subject: 'Physics', chapter: 'Mechanics', mastery: 85, questions: 45 },
    { subject: 'Physics', chapter: 'Thermodynamics', mastery: 72, questions: 32 },
    { subject: 'Physics', chapter: 'Electromagnetism', mastery: 45, questions: 28 },
    { subject: 'Physics', chapter: 'Optics', mastery: 68, questions: 20 },
    { subject: 'Chemistry', chapter: 'Physical', mastery: 78, questions: 35 },
    { subject: 'Chemistry', chapter: 'Organic', mastery: 52, questions: 40 },
    { subject: 'Chemistry', chapter: 'Inorganic', mastery: 65, questions: 30 },
    { subject: 'Mathematics', chapter: 'Calculus', mastery: 88, questions: 50 },
    { subject: 'Mathematics', chapter: 'Algebra', mastery: 75, questions: 42 },
    { subject: 'Mathematics', chapter: 'Coordinate Geometry', mastery: 62, questions: 35 },
    { subject: 'Biology', chapter: 'Physiology', mastery: 82, questions: 38 },
    { subject: 'Biology', chapter: 'Genetics', mastery: 58, questions: 25 },
  ]

  const getMasteryLevel = (mastery: number) => {
    return DESIGN.masteryLevels.find(l => mastery >= l.min) || DESIGN.masteryLevels[3]
  }

  return (
    <Card className="bg-white border border-gray-200 rounded-xl shadow-sm">
      <CardHeader className="border-b border-gray-100 pb-3">
        <CardTitle className="text-sm font-semibold text-gray-900 flex items-center gap-2">
          <Target className="h-4 w-4 text-blue-600" />
          Topic Mastery
        </CardTitle>
        <CardDescription>Performance across all chapters</CardDescription>
      </CardHeader>
      <CardContent className="p-4">
        <div className="space-y-2">
          {topics.map((topic, index) => {
            const level = getMasteryLevel(topic.mastery)
            const subjectConfig = DESIGN.subjects[topic.subject as keyof typeof DESIGN.subjects]

            return (
              <motion.div
                key={`${topic.subject}-${topic.chapter}`}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.03 }}
                className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors"
              >
                {/* Heatmap Cell */}
                <div
                  className="w-12 h-12 rounded-lg flex items-center justify-center text-xs font-bold text-white"
                  style={{ backgroundColor: level.color }}
                >
                  {topic.mastery}%
                </div>

                {/* Topic Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm text-gray-900 truncate">
                      {topic.chapter}
                    </span>
                    <Badge 
                      variant="outline" 
                      className="text-[10px] shrink-0"
                      style={{ 
                        backgroundColor: `${subjectConfig.color}10`,
                        borderColor: subjectConfig.color,
                        color: subjectConfig.color
                      }}
                    >
                      {topic.subject}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-xs text-gray-500">{topic.questions} questions</span>
                    <span 
                      className="text-xs font-medium"
                      style={{ color: level.color }}
                    >
                      {level.label}
                    </span>
                  </div>
                </div>

                {/* Action */}
                {topic.mastery < 60 && (
                  <Button size="sm" variant="outline" className="shrink-0 text-xs gap-1">
                    <Sparkles className="h-3 w-3" />
                    Improve
                  </Button>
                )}
              </motion.div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}

// ============================================
// MISTAKE CLASSIFICATION
// ============================================

function MistakeClassification() {
  const mistakes = [
    { type: 'Conceptual Gap', count: 28, percentage: 40, color: '#EF4444', icon: AlertCircle },
    { type: 'Calculation Error', count: 21, percentage: 30, color: '#F59E0B', icon: XCircle },
    { type: 'Time Pressure', count: 14, percentage: 20, color: '#2563EB', icon: Clock },
    { type: 'Silly Mistake', count: 7, percentage: 10, color: '#8B5CF6', icon: XCircle },
  ]

  return (
    <Card className="bg-white border border-gray-200 rounded-xl shadow-sm">
      <CardHeader className="border-b border-gray-100 pb-3">
        <CardTitle className="text-sm font-semibold text-gray-900 flex items-center gap-2">
          <AlertCircle className="h-4 w-4 text-amber-500" />
          Mistake Analysis
        </CardTitle>
        <CardDescription>Understanding your error patterns</CardDescription>
      </CardHeader>
      <CardContent className="p-4">
        <div className="space-y-4">
          {mistakes.map((mistake, index) => {
            const Icon = mistake.icon

            return (
              <motion.div
                key={mistake.type}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center"
                      style={{ backgroundColor: `${mistake.color}15` }}
                    >
                      <Icon className="h-4 w-4" style={{ color: mistake.color }} />
                    </div>
                    <div>
                      <span className="font-medium text-sm text-gray-900">{mistake.type}</span>
                      <span className="text-xs text-gray-500 ml-2">{mistake.count} mistakes</span>
                    </div>
                  </div>
                  <span className="font-semibold text-sm" style={{ color: mistake.color }}>
                    {mistake.percentage}%
                  </span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${mistake.percentage}%` }}
                    transition={{ duration: 0.8, delay: index * 0.1 }}
                    className="h-full rounded-full"
                    style={{ backgroundColor: mistake.color }}
                  />
                </div>
              </motion.div>
            )
          })}
        </div>

        {/* Recommendation */}
        <div className="mt-4 p-3 rounded-lg bg-red-50 border border-red-200">
          <div className="flex items-start gap-2">
            <AlertCircle className="h-4 w-4 text-red-600 mt-0.5" />
            <div className="text-xs text-red-800">
              <span className="font-medium">Focus Area:</span> Your conceptual errors are highest. 
              Consider reviewing fundamental concepts before practicing more problems.
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// ============================================
// IMPROVEMENT TREND
// ============================================

function ImprovementTrend() {
  const weeks = [
    { week: 'Week 1', accuracy: 58, tests: 3 },
    { week: 'Week 2', accuracy: 62, tests: 4 },
    { week: 'Week 3', accuracy: 68, tests: 5 },
    { week: 'Week 4', accuracy: 71, tests: 4 },
    { week: 'Current', accuracy: 75, tests: 2 },
  ]

  return (
    <Card className="bg-white border border-gray-200 rounded-xl shadow-sm">
      <CardHeader className="border-b border-gray-100 pb-3">
        <CardTitle className="text-sm font-semibold text-gray-900 flex items-center gap-2">
          <TrendingUp className="h-4 w-4 text-green-500" />
          Improvement Trend
        </CardTitle>
        <CardDescription>Your progress over time</CardDescription>
      </CardHeader>
      <CardContent className="p-4">
        {/* Simple Bar Chart */}
        <div className="flex items-end justify-between h-40 gap-2 mb-4">
          {weeks.map((week, index) => {
            const height = (week.accuracy / 100) * 140

            return (
              <motion.div
                key={week.week}
                initial={{ height: 0 }}
                animate={{ height }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="flex-1 flex flex-col items-center"
              >
                <div
                  className="w-full rounded-t-lg bg-gradient-to-t from-blue-600 to-blue-500"
                  style={{ height: '100%' }}
                />
              </motion.div>
            )
          })}
        </div>

        {/* Labels */}
        <div className="flex items-center justify-between text-xs text-gray-500">
          {weeks.map((week) => (
            <div key={week.week} className="text-center flex-1">
              <div className="font-medium">{week.week}</div>
              <div className="text-[10px]">{week.accuracy}%</div>
            </div>
          ))}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3 mt-4 pt-4 border-t border-gray-100">
          <div className="text-center p-2 rounded-lg bg-green-50">
            <div className="text-lg font-bold text-green-600">+17%</div>
            <div className="text-xs text-green-700">Overall Improvement</div>
          </div>
          <div className="text-center p-2 rounded-lg bg-blue-50">
            <div className="text-lg font-bold text-blue-600">18</div>
            <div className="text-xs text-blue-700">Tests This Month</div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// ============================================
// MAIN ANALYTICS PAGE
// ============================================

export default function AnalyticsPage() {
  return (
    <div className="bg-transparent">
      {/* Header */}

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          {[
            { label: 'Total Tests', value: '47', icon: BookOpen, color: '#2563EB' },
            { label: 'Avg. Accuracy', value: '72%', icon: Target, color: '#10B981' },
            { label: 'Time/Question', value: '52s', icon: Clock, color: '#F59E0B' },
            { label: 'Improvement', value: '+17%', icon: TrendingUp, color: '#8B5CF6' },
          ].map((stat, index) => {
            const Icon = stat.icon
            return (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-white rounded-xl border border-gray-200 p-4 text-center shadow-sm"
              >
                <div className="w-8 h-8 mx-auto mb-2 rounded-lg flex items-center justify-center" 
                  style={{ backgroundColor: `${stat.color}15` }}>
                  <Icon className="h-4 w-4" style={{ color: stat.color }} />
                </div>
                <div className="text-xl font-bold text-gray-900">{stat.value}</div>
                <div className="text-xs text-gray-500">{stat.label}</div>
              </motion.div>
            )
          })}
        </div>

        {/* Tabs for different analytics views */}
        <Tabs defaultValue="mastery" className="space-y-6">
          <TabsList className="bg-white border border-gray-200 p-1 rounded-lg">
            <TabsTrigger 
              value="mastery"
              className="data-[state=active]:bg-blue-600 data-[state=active]:text-white"
            >
              Topic Mastery
            </TabsTrigger>
            <TabsTrigger 
              value="mistakes"
              className="data-[state=active]:bg-blue-600 data-[state=active]:text-white"
            >
              Mistake Analysis
            </TabsTrigger>
            <TabsTrigger 
              value="trends"
              className="data-[state=active]:bg-blue-600 data-[state=active]:text-white"
            >
              Improvement
            </TabsTrigger>
          </TabsList>

          <TabsContent value="mastery">
            <TopicMasteryHeatmap />
          </TabsContent>

          <TabsContent value="mistakes">
            <MistakeClassification />
          </TabsContent>

          <TabsContent value="trends">
            <ImprovementTrend />
          </TabsContent>
        </Tabs>

        {/* Action Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
          <Card className="bg-gradient-to-br from-blue-600 to-blue-700 text-white border-0 rounded-xl shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-xl bg-white/20">
                  <Sparkles className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-1">Personalized Study Plan</h3>
                  <p className="text-blue-100 text-sm mb-4">
                    Get AI-generated study recommendations based on your performance patterns
                  </p>
                  <Button variant="secondary" size="sm">
                    Generate Plan
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border border-gray-200 rounded-xl shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-xl bg-amber-100">
                  <AlertCircle className="h-6 w-6 text-amber-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-1 text-gray-900">Focus Areas</h3>
                  <p className="text-gray-500 text-sm mb-3">
                    3 chapters need immediate attention
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {['Organic Chemistry', 'Electromagnetism', 'Genetics'].map((topic) => (
                      <Badge key={topic} variant="outline" className="bg-amber-50 border-amber-200 text-amber-700">
                        {topic}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
