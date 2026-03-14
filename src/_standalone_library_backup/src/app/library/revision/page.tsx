'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import {
  RefreshCw,
  Calendar,
  Clock,
  Target,
  Brain,
  Play,
  CheckCircle2,
  AlertTriangle,
  FileText,
  ChevronRight,
  Flame,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { AnimatedStatCard } from '@/components/ui/animated-counter'
import { CircularProgress } from '@/components/ui/circular-progress'
import { toast } from 'sonner'

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.04 },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.25 } },
}

interface RevisionItem {
  id: string
  resourceId: string
  resource?: {
    id: string
    title: string
    subject: string
    chapter: string
    readingTime: number
  }
  lastRevisedAt: string | null
  nextRevisionAt: string
  revisionCount: number
  confidence: number
  isOverdue: boolean
  priority: 'high' | 'medium' | 'low'
}

export default function RevisionPage() {
  const router = useRouter()
  const [revisions, setRevisions] = useState<RevisionItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())

  // Fetch revision schedule
  const fetchRevisions = useCallback(async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/library/revision?userId=demo-user')
      if (response.ok) {
        const data = await response.json()
        setRevisions(data.revisions || [])
      }
    } catch (error) {
      console.error('Failed to fetch revisions:', error)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchRevisions()
  }, [fetchRevisions])

  // Get stats
  const stats = {
    due: revisions.filter(r => r.isOverdue).length,
    today: revisions.filter(r => {
      const date = new Date(r.nextRevisionAt)
      const today = new Date()
      return date.toDateString() === today.toDateString()
    }).length,
    completed: revisions.filter(r => r.revisionCount > 0).length,
    streak: 7, // Placeholder
  }

  // Start revision session
  const startRevision = (revision: RevisionItem) => {
    if (revision.resource) {
      router.push(`/library/resource/${revision.resource.id}`)
    }
  }

  // Mark as revised
  const markAsRevised = async (revisionId: string) => {
    try {
      await fetch('/api/library/revision', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: 'demo-user',
          revisionId,
          action: 'complete'
        })
      })
      toast.success('Revision marked as complete!')
      fetchRevisions()
    } catch {
      toast.error('Failed to update revision')
    }
  }

  // Get calendar days
  const getCalendarDays = () => {
    const today = new Date()
    const days = []
    for (let i = -3; i <= 10; i++) {
      const date = new Date(today)
      date.setDate(date.getDate() + i)
      const hasRevision = revisions.some(r => 
        new Date(r.nextRevisionAt).toDateString() === date.toDateString()
      )
      const isOverdue = date < today && hasRevision
      days.push({ date, hasRevision, isOverdue, isToday: date.toDateString() === today.toDateString() })
    }
    return days
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen cognify-bg flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="w-10 h-10 border-3 border-blue-500 border-t-transparent rounded-full"
        />
      </div>
    )
  }

  const calendarDays = getCalendarDays()
  const overdueRevisions = revisions.filter(r => r.isOverdue)
  const upcomingRevisions = revisions.filter(r => !r.isOverdue).slice(0, 10)

  return (
    <div className="min-h-screen cognify-bg">
      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/80 backdrop-blur-lg border-b border-gray-100 sticky top-0 z-40"
      >
        <div className="px-4 md:px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center shadow-lg shadow-green-500/30">
              <RefreshCw className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Revision Tracker</h1>
              <p className="text-sm text-gray-500">Spaced repetition for better retention</p>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Main Content */}
      <main className="p-4 md:p-6 lg:p-8">
        <div className="max-w-6xl mx-auto space-y-6">
          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-4"
          >
            <AnimatedStatCard label="Due Today" value={stats.due} icon={AlertTriangle} color={stats.due > 0 ? 'red' : 'green'} />
            <AnimatedStatCard label="Today's Tasks" value={stats.today} icon={Calendar} color="blue" />
            <AnimatedStatCard label="Completed" value={stats.completed} icon={CheckCircle2} color="green" />
            <AnimatedStatCard label="Study Streak" value={stats.streak} suffix=" days" icon={Flame} color="orange" />
          </motion.div>

          {/* Calendar Strip */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="border-gray-200">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
                  {calendarDays.map((day, index) => (
                    <motion.button
                      key={index}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.02 }}
                      onClick={() => setSelectedDate(day.date)}
                      className={cn(
                        'flex-shrink-0 w-14 h-20 rounded-xl flex flex-col items-center justify-center transition-all',
                        day.isToday && 'ring-2 ring-blue-500',
                        day.hasRevision && day.isOverdue && 'bg-red-50 border border-red-200',
                        day.hasRevision && !day.isOverdue && 'bg-blue-50 border border-blue-200',
                        !day.hasRevision && 'bg-gray-50 border border-gray-100 hover:border-gray-200',
                        selectedDate.toDateString() === day.date.toDateString() && 'ring-2 ring-blue-500'
                      )}
                    >
                      <span className="text-xs text-gray-500">
                        {day.date.toLocaleDateString('en', { weekday: 'short' })}
                      </span>
                      <span className={cn(
                        'text-lg font-bold',
                        day.isToday ? 'text-blue-600' : 'text-gray-900'
                      )}>
                        {day.date.getDate()}
                      </span>
                      {day.hasRevision && (
                        <div className={cn(
                          'w-2 h-2 rounded-full mt-1',
                          day.isOverdue ? 'bg-red-500' : 'bg-blue-500'
                        )} />
                      )}
                    </motion.button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Overdue Section */}
          {overdueRevisions.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="border-red-200 bg-red-50/50">
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2 text-red-700">
                    <AlertTriangle className="w-5 h-5" />
                    Overdue Revisions ({overdueRevisions.length})
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {overdueRevisions.map((revision) => (
                    <motion.div
                      key={revision.id}
                      variants={itemVariants}
                      initial="hidden"
                      animate="visible"
                      className="flex items-center justify-between p-3 bg-white rounded-xl border border-red-100"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center">
                          <FileText className="w-5 h-5 text-red-500" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">
                            {revision.resource?.title || 'Unknown Resource'}
                          </p>
                          <p className="text-sm text-gray-500">
                            {revision.resource?.subject} • {revision.resource?.chapter}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button size="sm" onClick={() => startRevision(revision)}>
                          <Play className="w-4 h-4 mr-1" />
                          Revise
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => markAsRevised(revision.id)}
                        >
                          <CheckCircle2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </motion.div>
                  ))}
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Upcoming Revisions */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="border-gray-200">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-blue-500" />
                    Upcoming Schedule
                  </div>
                  <Button variant="outline" size="sm" className="gap-2">
                    <Play className="w-4 h-4" />
                    Start Session
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {upcomingRevisions.length === 0 ? (
                  <div className="text-center py-8">
                    <CheckCircle2 className="w-12 h-12 text-green-300 mx-auto mb-3" />
                    <p className="text-gray-500">All caught up!</p>
                    <p className="text-sm text-gray-400">No upcoming revisions scheduled</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {upcomingRevisions.map((revision) => (
                      <motion.div
                        key={revision.id}
                        variants={itemVariants}
                        initial="hidden"
                        animate="visible"
                        whileHover={{ x: 4 }}
                        onClick={() => startRevision(revision)}
                        className="flex items-center justify-between p-4 rounded-xl bg-gray-50 hover:bg-blue-50 cursor-pointer transition-colors group"
                      >
                        <div className="flex items-center gap-4">
                          <div className="relative">
                            <CircularProgress
                              value={revision.confidence}
                              size={48}
                              strokeWidth={4}
                              progressColor={revision.confidence >= 70 ? '#10B981' : revision.confidence >= 40 ? '#2563EB' : '#EF4444'}
                            />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900 group-hover:text-blue-600 transition-colors">
                              {revision.resource?.title || 'Unknown Resource'}
                            </p>
                            <div className="flex items-center gap-2 text-sm text-gray-500 mt-0.5">
                              <span>{revision.resource?.subject}</span>
                              <span className="text-gray-300">•</span>
                              <span>{revision.resource?.chapter}</span>
                              <span className="text-gray-300">•</span>
                              <span className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {revision.resource?.readingTime} min
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="text-right">
                            <Badge variant="outline" className={cn(
                              revision.priority === 'high' ? 'border-red-200 text-red-700' :
                              revision.priority === 'medium' ? 'border-yellow-200 text-yellow-700' :
                              'border-green-200 text-green-700'
                            )}>
                              {revision.priority}
                            </Badge>
                            <p className="text-xs text-gray-500 mt-1">
                              {new Date(revision.nextRevisionAt).toLocaleDateString()}
                            </p>
                          </div>
                          <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-blue-500 transition-colors" />
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* AI Suggestions */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Brain className="w-5 h-5 text-blue-500" />
                  AI Study Recommendations
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="p-4 bg-white rounded-xl">
                    <h4 className="font-medium text-gray-900 mb-2">Optimal Study Time</h4>
                    <p className="text-sm text-gray-600">
                      Based on your patterns, the best time for revision is between 6-8 PM.
                      Schedule your sessions then for better retention.
                    </p>
                  </div>
                  <div className="p-4 bg-white rounded-xl">
                    <h4 className="font-medium text-gray-900 mb-2">Focus Areas</h4>
                    <p className="text-sm text-gray-600">
                      You have {overdueRevisions.length} overdue revisions. Focus on clearing
                      those before starting new topics.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </main>
    </div>
  )
}
