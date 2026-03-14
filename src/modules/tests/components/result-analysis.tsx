'use client'

import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Trophy, Target, Clock, TrendingUp, TrendingDown, 
  CheckCircle, XCircle, AlertCircle, BookOpen, 
  Lightbulb, Zap, ArrowRight, ChevronDown, ChevronUp,
  Brain, Sparkles, BarChart3, PieChart
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { cn } from '@/modules/tests/utils'
import { RingProgress, AnimatedCounter } from './motion'
import type { TestAttempt, ChapterBreakdownItem, MistakeAnalysis } from '@/modules/tests/types'

// ============================================
// DESIGN TOKENS
// ============================================

const RESULT_TOKENS = {
  grades: {
    excellent: { min: 90, color: '#10B981', label: 'Excellent', icon: Trophy },
    good: { min: 75, color: '#3B82F6', label: 'Good', icon: Target },
    average: { min: 50, color: '#F59E0B', label: 'Average', icon: BarChart3 },
    needsWork: { min: 0, color: '#EF4444', label: 'Needs Work', icon: AlertCircle },
  },
  subjects: {
    physics: { color: '#3B82F6', bg: 'bg-blue-50', border: 'border-blue-200' },
    chemistry: { color: '#10B981', bg: 'bg-emerald-50', border: 'border-emerald-200' },
    math: { color: '#8B5CF6', bg: 'bg-purple-50', border: 'border-purple-200' },
    biology: { color: '#F59E0B', bg: 'bg-amber-50', border: 'border-amber-200' },
  },
  mistakes: {
    conceptual: { color: '#EF4444', label: 'Conceptual Gap', icon: Brain },
    calculation: { color: '#F59E0B', label: 'Calculation Error', icon: BarChart3 },
    time_pressure: { color: '#3B82F6', label: 'Time Pressure', icon: Clock },
    silly: { color: '#8B5CF6', label: 'Silly Mistake', icon: AlertCircle },
  }
}

// ============================================
// RESULT HEADER COMPONENT
// ============================================

interface ResultHeaderProps {
  score: number
  totalMarks: number
  percentage: number
  rank?: number
  totalAttempts?: number
  timeSpent: number
  testName: string
}

function ResultHeader({ score, totalMarks, percentage, rank, totalAttempts, timeSpent, testName }: ResultHeaderProps) {
  // Determine grade
  const getGrade = () => {
    if (percentage >= 90) return RESULT_TOKENS.grades.excellent
    if (percentage >= 75) return RESULT_TOKENS.grades.good
    if (percentage >= 50) return RESULT_TOKENS.grades.average
    return RESULT_TOKENS.grades.needsWork
  }

  const grade = getGrade()
  const GradeIcon = grade.icon

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}m ${secs}s`
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative overflow-hidden"
    >
      {/* Background gradient */}
      <div 
        className="absolute inset-0 opacity-10"
        style={{ 
          background: `linear-gradient(135deg, ${grade.color} 0%, transparent 100%)` 
        }}
      />

      <Card className="bg-white border border-gray-200 rounded-2xl shadow-sm relative">
        <CardContent className="p-6 md:p-8">
          <div className="flex flex-col md:flex-row items-center gap-6 md:gap-10">
            {/* Score Ring */}
            <div className="flex-shrink-0">
              <RingProgress
                progress={percentage}
                size={140}
                strokeWidth={12}
                color={grade.color}
                showValue
                label="Score"
              />
            </div>

            {/* Stats */}
            <div className="flex-1 text-center md:text-left">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <div className="flex items-center justify-center md:justify-start gap-2 mb-2">
                  <GradeIcon className="h-6 w-6" style={{ color: grade.color }} />
                  <span className="text-2xl font-bold" style={{ color: grade.color }}>
                    {grade.label}
                  </span>
                </div>
                <h2 className="text-lg text-gray-600 mb-4">{testName}</h2>
              </motion.div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.3 }}
                  className="bg-gray-50 rounded-xl p-3"
                >
                  <div className="text-sm text-gray-500">Score</div>
                  <div className="text-xl font-bold text-gray-900">
                    <AnimatedCounter value={score} suffix={`/${totalMarks}`} />
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.35 }}
                  className="bg-gray-50 rounded-xl p-3"
                >
                  <div className="text-sm text-gray-500">Time</div>
                  <div className="text-xl font-bold text-gray-900">
                    {formatTime(timeSpent)}
                  </div>
                </motion.div>

                {rank && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.4 }}
                    className="bg-gray-50 rounded-xl p-3"
                  >
                    <div className="text-sm text-gray-500">Rank</div>
                    <div className="text-xl font-bold text-gray-900">
                      #{rank} <span className="text-sm text-gray-400">/ {totalAttempts}</span>
                    </div>
                  </motion.div>
                )}

                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.45 }}
                  className="bg-gray-50 rounded-xl p-3"
                >
                  <div className="text-sm text-gray-500">Accuracy</div>
                  <div className="text-xl font-bold text-gray-900">
                    <AnimatedCounter value={percentage} suffix="%" />
                  </div>
                </motion.div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

// ============================================
// SUBJECT BREAKDOWN COMPONENT
// ============================================

interface SubjectBreakdownProps {
  breakdown: Array<{
    subjectId: string
    subjectName: string
    correct: number
    incorrect: number
    total: number
    accuracy: number
    timeSpent: number
    color: string
  }>
}

function SubjectBreakdown({ breakdown }: SubjectBreakdownProps) {
  return (
    <Card className="bg-white border border-gray-200 rounded-xl shadow-sm">
      <CardHeader className="border-b border-gray-100 pb-4">
        <CardTitle className="text-base font-semibold text-gray-900 flex items-center gap-2">
          <PieChart className="h-4 w-4 text-blue-600" />
          Subject Performance
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4">
        <div className="space-y-4">
          {breakdown.map((subject, index) => (
            <motion.div
              key={subject.subjectId}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="space-y-2"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div 
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: subject.color }}
                  />
                  <span className="font-medium text-gray-900">{subject.subjectName}</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <span className="text-emerald-600">{subject.correct} correct</span>
                  <span className="text-red-500">{subject.incorrect} wrong</span>
                  <span className="font-medium text-gray-900">{subject.accuracy}%</span>
                </div>
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${subject.accuracy}%` }}
                  transition={{ duration: 0.8, delay: index * 0.1 }}
                  className="h-full rounded-full"
                  style={{ backgroundColor: subject.color }}
                />
              </div>
            </motion.div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

// ============================================
// MISTAKE TAXONOMY COMPONENT
// ============================================

interface MistakeTaxonomyProps {
  analysis: MistakeAnalysis
}

function MistakeTaxonomy({ analysis }: MistakeTaxonomyProps) {
  const mistakeTypes = [
    { type: 'conceptual', count: analysis.conceptual, ...RESULT_TOKENS.mistakes.conceptual },
    { type: 'calculation', count: analysis.calculation, ...RESULT_TOKENS.mistakes.calculation },
    { type: 'time_pressure', count: analysis.timePressure, ...RESULT_TOKENS.mistakes.time_pressure },
    { type: 'silly', count: analysis.silly, ...RESULT_TOKENS.mistakes.silly },
  ].filter(m => m.count > 0)

  const maxCount = Math.max(...mistakeTypes.map(m => m.count))

  return (
    <Card className="bg-white border border-gray-200 rounded-xl shadow-sm">
      <CardHeader className="border-b border-gray-100 pb-4">
        <CardTitle className="text-base font-semibold text-gray-900 flex items-center gap-2">
          <AlertCircle className="h-4 w-4 text-amber-500" />
          Mistake Analysis
        </CardTitle>
        <CardDescription>
          Understanding your mistakes helps you improve faster
        </CardDescription>
      </CardHeader>
      <CardContent className="p-4">
        <div className="space-y-3">
          {mistakeTypes.map((mistake, index) => {
            const Icon = mistake.icon
            const percentage = (mistake.count / analysis.total) * 100

            return (
              <motion.div
                key={mistake.type}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center gap-3"
              >
                <div 
                  className="w-8 h-8 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: `${mistake.color}15` }}
                >
                  <Icon className="h-4 w-4" style={{ color: mistake.color }} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-gray-700">{mistake.label}</span>
                    <span className="text-sm text-gray-500">{mistake.count} mistakes</span>
                  </div>
                  <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${(mistake.count / maxCount) * 100}%` }}
                      transition={{ duration: 0.6, delay: index * 0.1 }}
                      className="h-full rounded-full"
                      style={{ backgroundColor: mistake.color }}
                    />
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>

        {analysis.conceptual > analysis.total * 0.4 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mt-4 p-3 rounded-lg bg-amber-50 border border-amber-200"
          >
            <div className="flex items-start gap-2">
              <Lightbulb className="h-4 w-4 text-amber-600 mt-0.5" />
              <div className="text-sm text-amber-800">
                <span className="font-medium">Recommendation:</span> Focus on understanding core concepts before practicing more questions.
              </div>
            </div>
          </motion.div>
        )}
      </CardContent>
    </Card>
  )
}

// ============================================
// WEAK TOPICS COMPONENT
// ============================================

interface WeakTopicsProps {
  chapters: ChapterBreakdownItem[]
  onFixWithCogni: (chapterId: string) => void
}

function WeakTopics({ chapters, onFixWithCogni }: WeakTopicsProps) {
  const weakChapters = chapters
    .filter(c => c.accuracy < 70)
    .sort((a, b) => a.accuracy - b.accuracy)
    .slice(0, 5)

  if (weakChapters.length === 0) {
    return (
      <Card className="bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200 rounded-xl shadow-sm">
        <CardContent className="p-6 text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="w-16 h-16 mx-auto mb-4 rounded-full bg-emerald-100 flex items-center justify-center"
          >
            <Trophy className="h-8 w-8 text-emerald-600" />
          </motion.div>
          <h3 className="font-semibold text-emerald-800 mb-1">Great Performance!</h3>
          <p className="text-sm text-emerald-600">No significant weak areas detected</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-white border border-gray-200 rounded-xl shadow-sm">
      <CardHeader className="border-b border-gray-100 pb-4">
        <CardTitle className="text-base font-semibold text-gray-900 flex items-center gap-2">
          <Target className="h-4 w-4 text-red-500" />
          Areas to Improve
        </CardTitle>
        <CardDescription>
          These topics need your attention
        </CardDescription>
      </CardHeader>
      <CardContent className="p-4">
        <div className="space-y-3">
          {weakChapters.map((chapter, index) => (
            <motion.div
              key={chapter.chapterId}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="p-3 rounded-xl border border-gray-100 hover:border-blue-200 hover:bg-blue-50/30 transition-all duration-200"
            >
              <div className="flex items-center justify-between mb-2">
                <div>
                  <span className="font-medium text-gray-900">{chapter.chapterName}</span>
                  <Badge variant="outline" className="ml-2 text-xs bg-gray-50">
                    {chapter.subjectName}
                  </Badge>
                </div>
                <span className={cn(
                  "text-sm font-semibold",
                  chapter.accuracy < 40 ? "text-red-600" : 
                  chapter.accuracy < 60 ? "text-amber-600" : "text-blue-600"
                )}>
                  {chapter.accuracy}%
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="text-xs text-gray-500">
                  {chapter.correct}/{chapter.total} correct
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onFixWithCogni(chapter.chapterId)}
                  className="gap-1 text-xs h-7 bg-gradient-to-r from-blue-600 to-blue-700 text-white border-0 hover:from-blue-700 hover:to-blue-800"
                >
                  <Sparkles className="h-3 w-3" />
                  Fix with Cogni
                </Button>
              </div>
            </motion.div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

// ============================================
// MAIN RESULT ANALYSIS COMPONENT
// ============================================

interface ResultAnalysisProps {
  attempt: TestAttempt
  onFixWithCogni: (chapterId: string) => void
  onRetry: () => void
  onViewHistory: () => void
}

export function ResultAnalysis({ 
  attempt, 
  onFixWithCogni, 
  onRetry, 
  onViewHistory 
}: ResultAnalysisProps) {
  const [expandedSection, setExpandedSection] = useState<string | null>('weak')

  // Parse attempt data
  const subjectBreakdown = useMemo(() => {
    try {
      return typeof attempt.subjectBreakdown === 'string' 
        ? JSON.parse(attempt.subjectBreakdown) 
        : attempt.subjectBreakdown || []
    } catch {
      return []
    }
  }, [attempt.subjectBreakdown])

  const chapterBreakdown = useMemo(() => {
    try {
      return typeof attempt.chapterBreakdown === 'string'
        ? JSON.parse(attempt.chapterBreakdown)
        : attempt.chapterBreakdown || []
    } catch {
      return []
    }
  }, [attempt.chapterBreakdown])

  const mistakeAnalysis = useMemo(() => {
    try {
      return typeof attempt.mistakeAnalysis === 'string'
        ? JSON.parse(attempt.mistakeAnalysis)
        : attempt.mistakeAnalysis || { conceptual: 0, calculation: 0, timePressure: 0, silly: 0, total: 0 }
    } catch {
      return { conceptual: 0, calculation: 0, timePressure: 0, silly: 0, total: 0 }
    }
  }, [attempt.mistakeAnalysis])

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6 max-w-4xl mx-auto"
    >
      {/* Result Header */}
      <ResultHeader
        score={attempt.score}
        totalMarks={attempt.totalMarks}
        percentage={attempt.percentage}
        rank={attempt.rank}
        totalAttempts={attempt.totalAttempts}
        timeSpent={attempt.timeSpent}
        testName="Test Result"
      />

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card className="bg-emerald-50 border border-emerald-200 rounded-xl text-center p-4">
            <CheckCircle className="h-6 w-6 text-emerald-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-emerald-700">{attempt.correctCount}</div>
            <div className="text-xs text-emerald-600">Correct</div>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.55 }}
        >
          <Card className="bg-red-50 border border-red-200 rounded-xl text-center p-4">
            <XCircle className="h-6 w-6 text-red-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-red-700">{attempt.incorrectCount}</div>
            <div className="text-xs text-red-600">Incorrect</div>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <Card className="bg-gray-50 border border-gray-200 rounded-xl text-center p-4">
            <Target className="h-6 w-6 text-gray-500 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-700">{attempt.unattemptedCount}</div>
            <div className="text-xs text-gray-500">Skipped</div>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.65 }}
        >
          <Card className="bg-blue-50 border border-blue-200 rounded-xl text-center p-4">
            <Clock className="h-6 w-6 text-blue-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-blue-700">
              {Math.floor(attempt.timeSpent / 60)}m
            </div>
            <div className="text-xs text-blue-600">Time Taken</div>
          </Card>
        </motion.div>
      </div>

      {/* Subject Breakdown */}
      {subjectBreakdown.length > 0 && (
        <SubjectBreakdown breakdown={subjectBreakdown} />
      )}

      {/* Mistake Taxonomy */}
      {mistakeAnalysis.total > 0 && (
        <MistakeTaxonomy analysis={mistakeAnalysis} />
      )}

      {/* Weak Topics */}
      <WeakTopics 
        chapters={chapterBreakdown} 
        onFixWithCogni={onFixWithCogni}
      />

      {/* Action Buttons */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="flex flex-col sm:flex-row gap-3"
      >
        <Button
          onClick={onRetry}
          className="flex-1 gap-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
        >
          <Zap className="h-4 w-4" />
          Retry Test
        </Button>
        <Button
          onClick={onViewHistory}
          variant="outline"
          className="flex-1 gap-2"
        >
          <BookOpen className="h-4 w-4" />
          View History
        </Button>
      </motion.div>
    </motion.div>
  )
}
