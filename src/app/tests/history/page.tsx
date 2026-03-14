'use client'

import { useEffect, useState, useRef } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { 
  History, 
  Clock, 
  Trophy, 
  TrendingUp,
  TrendingDown,
  ArrowRight,
  Loader2,
  AlertCircle,
  RotateCcw,
  Flame,
  Target,
  Calendar,
  Zap
} from 'lucide-react'
import { cn, formatDateTime, formatTimeShort, getSubjectBg } from '@/modules/tests/utils'
import { useRouter } from 'next/navigation'
import { PageHeader, StatCard, EmptyState, LoadingSkeleton } from '@/modules/tests/components/ui-elevated'
import { FadeIn, StaggerContainer, StaggerItem } from '@/modules/tests/components/motion'

interface TestHistoryItem {
  id: string
  testId: string
  testName: string
  subject?: string
  score: number
  totalMarks: number
  percentage: number
  accuracy: number
  timeSpent: number
  status: string
  startedAt: string
  submittedAt: string
}

export default function TestHistoryPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [history, setHistory] = useState<TestHistoryItem[]>([])
  const [stats, setStats] = useState({
    totalTests: 0,
    averageScore: 0,
    totalTime: 0,
    improvement: 0
  })

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const response = await fetch('/api/tests/history')
        if (response.ok) {
          const data = await response.json()
          setHistory(data.history || [])
          setStats(data.stats || {
            totalTests: 0,
            averageScore: 0,
            totalTime: 0,
            improvement: 0
          })
        }
      } catch (error) {
        // Error handling
      } finally {
        setIsLoading(false)
      }
    }
    
    fetchHistory()
  }, [])

  const handleRetake = (testId: string) => {
    router.push(`/tests/${testId}`)
  }

  const handleViewAnalysis = (testId: string, attemptId: string) => {
    router.push(`/tests/${testId}/analysis?attempt=${attemptId}`)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-page bg-mesh">
        <div className="bg-white/80 backdrop-blur-sm border-b border-gray-100">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <LoadingSkeleton variant="text" className="w-48 h-8" />
          </div>
        </div>
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <LoadingSkeleton key={i} variant="stat" />
            ))}
          </div>
          <LoadingSkeleton variant="card" className="h-96" />
        </div>
      </div>
    )
  }

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-gradient-page-elevated bg-mesh"
    >
      {/* Header */}
      <motion.div 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4 }}
        className="bg-white/80 backdrop-blur-sm border-b border-gray-100 sticky top-0 z-10"
      >
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <PageHeader
            title="Test History"
            subtitle="Track your progress and review past performances"
            icon={<History className="h-6 w-6" />}
            gradient
          />
        </div>
      </motion.div>

      {/* Main Content */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Stats Summary */}
        <FadeIn delay={0.1}>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard
              label="Tests Taken"
              value={stats.totalTests}
              icon={<Trophy className="h-4 w-4" />}
              color="blue"
              delay={0.1}
            />
            <StatCard
              label="Avg. Score"
              value={`${stats.averageScore}%`}
              icon={<Target className="h-4 w-4" />}
              color="emerald"
              delay={0.15}
            />
            <StatCard
              label="Total Time"
              value={formatTimeShort(stats.totalTime)}
              icon={<Clock className="h-4 w-4" />}
              color="amber"
              delay={0.2}
            />
            <StatCard
              label="Improvement"
              value={`${stats.improvement >= 0 ? '+' : ''}${stats.improvement}%`}
              icon={stats.improvement >= 0 ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
              color={stats.improvement >= 0 ? 'emerald' : 'red'}
              trend={stats.improvement >= 0 ? 'up' : 'down'}
              delay={0.25}
            />
          </div>
        </FadeIn>

        {/* History List */}
        <FadeIn delay={0.2}>
          <Card className="border-gray-100 bg-white/80 backdrop-blur-sm shadow-xl shadow-gray-200/50 overflow-hidden">
            <CardHeader className="border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
              <CardTitle className="text-base font-semibold text-gray-900 flex items-center gap-2">
                <Calendar className="h-4 w-4 text-blue-600" />
                Recent Attempts
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {history.length === 0 ? (
                <EmptyState
                  icon={<History className="h-8 w-8" />}
                  title="No test history yet"
                  description="Complete a test to see your progress and track your performance over time."
                  action={
                    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                      <Button 
                        onClick={() => router.push('/tests')}
                        className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 shadow-lg shadow-blue-500/25"
                      >
                        <Zap className="h-4 w-4 mr-2" />
                        Take a Test
                      </Button>
                    </motion.div>
                  }
                  size="lg"
                />
              ) : (
                <StaggerContainer className="divide-y divide-gray-100">
                  {history.map((item, index) => (
                    <StaggerItem key={item.id}>
                      <motion.div 
                        className="p-4 hover:bg-gradient-to-r hover:from-blue-50/50 hover:to-white transition-all duration-200"
                        whileHover={{ x: 4 }}
                      >
                        <div className="flex items-center justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                              <h3 className="font-semibold text-gray-900 truncate">{item.testName}</h3>
                              {item.subject && (
                                <Badge variant="outline" className={cn("text-xs font-medium", getSubjectBg(item.subject))}>
                                  {item.subject}
                                </Badge>
                              )}
                            </div>
                            <div className="flex items-center gap-4 text-sm text-gray-500">
                              <span className="flex items-center gap-1.5">
                                <Clock className="h-3.5 w-3.5" />
                                {formatDateTime(item.submittedAt)}
                              </span>
                              <span className="flex items-center gap-1.5">
                                <Flame className="h-3.5 w-3.5" />
                                {formatTimeShort(item.timeSpent)}
                              </span>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-6">
                            {/* Score */}
                            <div className="text-right">
                              <div className="flex items-center gap-1.5">
                                <motion.span 
                                  className="text-2xl font-bold text-gray-900"
                                  initial={{ scale: 0 }}
                                  animate={{ scale: 1 }}
                                  transition={{ delay: index * 0.05 + 0.2, type: 'spring' }}
                                >
                                  {item.score}
                                </motion.span>
                                <span className="text-gray-400 text-sm">/{item.totalMarks}</span>
                              </div>
                              <div className="mt-1.5 w-24">
                                <Progress 
                                  value={item.percentage} 
                                  className="h-1.5 bg-gray-100"
                                />
                              </div>
                            </div>
                            
                            {/* Accuracy */}
                            <div className="text-center w-20">
                              <motion.p 
                                className="text-lg font-bold text-emerald-600"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: index * 0.05 + 0.25 }}
                              >
                                {item.accuracy}%
                              </motion.p>
                              <p className="text-xs text-gray-500">Accuracy</p>
                            </div>
                            
                            {/* Actions */}
                            <div className="flex items-center gap-2">
                              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleViewAnalysis(item.testId, item.id)}
                                  className="border-gray-200 text-gray-700 hover:bg-white hover:border-blue-300 hover:text-blue-600"
                                >
                                  Analysis
                                  <ArrowRight className="h-3.5 w-3.5 ml-1.5" />
                                </Button>
                              </motion.div>
                              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleRetake(item.testId)}
                                  className="border-gray-200 text-gray-700 hover:bg-white hover:border-blue-300 hover:text-blue-600"
                                >
                                  <RotateCcw className="h-3.5 w-3.5 mr-1.5" />
                                  Retake
                                </Button>
                              </motion.div>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    </StaggerItem>
                  ))}
                </StaggerContainer>
              )}
            </CardContent>
          </Card>
        </FadeIn>
      </div>
    </motion.div>
  )
}
