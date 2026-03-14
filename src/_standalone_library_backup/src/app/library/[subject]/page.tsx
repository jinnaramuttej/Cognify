'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import {
  BookOpen,
  ChevronRight,
  ChevronDown,
  Clock,
  Target,
  TrendingUp,
  Brain,
  ArrowLeft,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  MinusCircle,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { CircularProgress, MiniProgressRing, AnimatedProgress } from '@/components/ui/circular-progress'
import { AnimatedCounter, AnimatedStatCard } from '@/components/ui/animated-counter'
import { TopicProgress, ChapterHeatmap } from '@/components/ui/chapter-heatmap'
import type { Chapter, ChapterInsights, LibraryResource } from '@/modules/library/types'

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.05, delayChildren: 0.1 },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 16, scale: 0.98 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] },
  },
}

interface ChapterWithResources extends Chapter {
  resources?: LibraryResource[]
}

interface SubjectData {
  id: string
  name: string
  code: string
  exam: string
  color: string
  icon: string
  chapters: ChapterWithResources[]
  progress: number
  totalResources: number
}

export default function SubjectPage() {
  const params = useParams()
  const router = useRouter()
  const subjectCode = params.subject as string

  const [subject, setSubject] = useState<SubjectData | null>(null)
  const [selectedChapter, setSelectedChapter] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch subject data
  const fetchSubjectData = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const response = await fetch(`/api/library/subject/${subjectCode}`)
      if (!response.ok) throw new Error('Failed to fetch subject data')
      const data = await response.json()
      setSubject(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setIsLoading(false)
    }
  }, [subjectCode])

  useEffect(() => {
    fetchSubjectData()
  }, [fetchSubjectData])

  // Handle chapter click
  const handleChapterClick = (chapterId: string) => {
    router.push(`/library/${subjectCode}/${chapterId}`)
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

  // Error state
  if (error || !subject) {
    return (
      <div className="min-h-screen cognify-bg flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center bg-white rounded-2xl p-8 shadow-xl border border-gray-100"
        >
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-gray-600 mb-4">{error || 'Subject not found'}</p>
          <Button onClick={() => router.push('/library')}>Back to Library</Button>
        </motion.div>
      </div>
    )
  }

  // Calculate stats
  const completedChapters = subject.chapters.filter(c => c.userProgress >= 100).length
  const weakChapters = subject.chapters.filter(c => c.isWeakTopic).length
  const avgProgress = subject.chapters.length > 0
    ? Math.round(subject.chapters.reduce((acc, c) => acc + c.userProgress, 0) / subject.chapters.length)
    : 0

  // Generate heatmap topics
  const heatmapTopics = subject.chapters.map(c => ({
    id: c.id,
    name: c.name,
    value: c.userProgress,
    status: c.userProgress >= 70 ? 'strong' : c.userProgress >= 40 ? 'moderate' : 'weak' as const,
  }))

  return (
    <div className="min-h-screen cognify-bg">
      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/80 backdrop-blur-lg border-b border-gray-100 sticky top-0 z-40"
      >
        <div className="px-4 md:px-6 py-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              onClick={() => router.push('/library')}
              className="text-gray-500 hover:text-gray-700"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Library
            </Button>
            <ChevronRight className="h-4 w-4 text-gray-300" />
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 200, damping: 15 }}
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ backgroundColor: subject.color || '#2563EB' }}
            >
              <BookOpen className="h-5 w-5 text-white" />
            </motion.div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">{subject.name}</h1>
              <p className="text-sm text-gray-500">
                {subject.chapters.length} chapters • {subject.totalResources} resources
              </p>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Main Content */}
      <div className="flex">
        {/* Left Panel - Chapter Navigation */}
        <motion.aside
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="hidden lg:block w-80 border-r border-gray-200 bg-white/50 sticky top-[73px] h-[calc(100vh-73px)] overflow-y-auto"
        >
          <div className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-gray-900">Chapters</h2>
              <motion.button
                whileHover={{ scale: 1.1, rotate: 180 }}
                whileTap={{ scale: 0.9 }}
                onClick={fetchSubjectData}
                className="text-gray-400 hover:text-gray-600"
              >
                <RefreshCw className="h-4 w-4" />
              </motion.button>
            </div>

            <div className="space-y-2">
              {subject.chapters.map((chapter, index) => (
                <motion.div
                  key={chapter.id}
                  initial={{ opacity: 0, x: -16 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.03 }}
                >
                  <motion.button
                    onClick={() => handleChapterClick(chapter.id)}
                    whileHover={{ x: 4 }}
                    className={cn(
                      'w-full text-left p-3 rounded-xl transition-all duration-200 group',
                      'hover:bg-blue-50 hover:border-blue-200 border border-transparent',
                      selectedChapter === chapter.id && 'bg-blue-50 border-blue-200'
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <div className="relative flex-shrink-0">
                        <MiniProgressRing value={chapter.userProgress} size={32} strokeWidth={3} />
                        {chapter.isWeakTopic && (
                          <motion.div
                            animate={{ scale: [1, 1.2, 1] }}
                            transition={{ duration: 2, repeat: Infinity }}
                            className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"
                          />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm text-gray-900 truncate group-hover:text-blue-600 transition-colors">
                          {chapter.number}. {chapter.name}
                        </p>
                        <div className="flex items-center gap-2 text-xs text-gray-500 mt-0.5">
                          <span>{chapter.userProgress}%</span>
                          <span className="text-gray-300">•</span>
                          <span>{chapter.totalResources} resources</span>
                        </div>
                      </div>
                      <ChevronRight className="h-4 w-4 text-gray-300 group-hover:text-blue-500 transition-colors" />
                    </div>
                  </motion.button>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.aside>

        {/* Right Panel - Content */}
        <main className="flex-1 p-4 md:p-6 lg:p-8">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-6 max-w-5xl mx-auto"
          >
            {/* Stats Cards */}
            <motion.div variants={itemVariants} className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <AnimatedStatCard
                label="Overall Progress"
                value={avgProgress}
                suffix="%"
                icon={TrendingUp}
                color="blue"
              />
              <AnimatedStatCard
                label="Chapters Done"
                value={completedChapters}
                suffix={`/ ${subject.chapters.length}`}
                icon={CheckCircle2}
                color="green"
              />
              <AnimatedStatCard
                label="Weak Topics"
                value={weakChapters}
                icon={AlertCircle}
                color={weakChapters > 0 ? 'red' : 'green'}
              />
              <AnimatedStatCard
                label="Resources"
                value={subject.totalResources}
                icon={BookOpen}
                color="purple"
              />
            </motion.div>

            {/* Performance Overview */}
            <motion.div variants={itemVariants}>
              <Card className="border-gray-200 shadow-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Target className="w-5 h-5 text-blue-500" />
                    Chapter Mastery Heatmap
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ChapterHeatmap
                    topics={heatmapTopics}
                    onTopicClick={(topic) => handleChapterClick(topic.id)}
                  />
                </CardContent>
              </Card>
            </motion.div>

            {/* AI Recommendations */}
            <motion.div variants={itemVariants}>
              <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Brain className="w-5 h-5 text-blue-500" />
                    AI Recommendations
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {weakChapters > 0 ? (
                    <div className="space-y-3">
                      {subject.chapters.filter(c => c.isWeakTopic).slice(0, 3).map((chapter, index) => (
                        <motion.div
                          key={chapter.id}
                          initial={{ opacity: 0, x: -16 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="flex items-center justify-between p-3 bg-white rounded-xl border border-red-100"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-red-100 flex items-center justify-center">
                              <AlertCircle className="w-4 h-4 text-red-500" />
                            </div>
                            <div>
                              <p className="font-medium text-sm text-gray-900">{chapter.name}</p>
                              <p className="text-xs text-gray-500">Focus area • {chapter.userProgress}% mastery</p>
                            </div>
                          </div>
                          <Button size="sm" onClick={() => handleChapterClick(chapter.id)}>
                            Start Practice
                          </Button>
                        </motion.div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex items-center gap-3 p-4 bg-green-50 rounded-xl border border-green-100">
                      <CheckCircle2 className="w-5 h-5 text-green-500" />
                      <div>
                        <p className="font-medium text-gray-900">Great progress!</p>
                        <p className="text-sm text-gray-600">No weak topics detected. Keep up the good work!</p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            {/* All Chapters List (Mobile) */}
            <motion.div variants={itemVariants} className="lg:hidden">
              <Card className="border-gray-200 shadow-sm">
                <CardHeader>
                  <CardTitle className="text-lg">All Chapters</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {subject.chapters.map((chapter, index) => (
                    <motion.div
                      key={chapter.id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.03 }}
                      onClick={() => handleChapterClick(chapter.id)}
                      className="p-3 rounded-xl bg-gray-50 hover:bg-blue-50 cursor-pointer transition-colors"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-sm text-gray-900">
                          {chapter.number}. {chapter.name}
                        </span>
                        {chapter.isWeakTopic && (
                          <Badge variant="destructive" className="text-xs">Weak</Badge>
                        )}
                      </div>
                      <AnimatedProgress value={chapter.userProgress} />
                    </motion.div>
                  ))}
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        </main>
      </div>
    </div>
  )
}
