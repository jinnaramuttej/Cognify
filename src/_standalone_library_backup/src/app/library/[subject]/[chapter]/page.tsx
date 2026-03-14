'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import {
  BookOpen,
  ChevronRight,
  Clock,
  Target,
  TrendingUp,
  Brain,
  ArrowLeft,
  RefreshCw,
  AlertCircle,
  FileText,
  Bookmark,
  Sparkles,
  Play,
  Weight,
  BarChart3,
  Zap,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { CircularProgress, AnimatedProgress } from '@/components/ui/circular-progress'
import { AnimatedCounter, AnimatedStatCard } from '@/components/ui/animated-counter'
import { ChapterHeatmap } from '@/components/ui/chapter-heatmap'
import type { Chapter, LibraryResource } from '@/modules/library/types'

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.04, delayChildren: 0.1 },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 12, scale: 0.98 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.25, ease: [0.25, 0.46, 0.45, 0.94] },
  },
}

// Resource type icons
const resourceTypeIcons: Record<string, string> = {
  'Notes': '📝',
  'PYQ': '📋',
  'Concept Sheet': '📄',
  'Diagram': '🖼️',
  'Formula List': '📐',
  'Video': '🎬',
}

interface ChapterData {
  id: string
  name: string
  number: number
  description: string
  weightage: number
  difficulty: string
  subject: {
    id: string
    name: string
    code: string
    color: string
  }
  userProgress: number
  isWeakTopic: boolean
  resources: LibraryResource[]
  insights: {
    accuracy: number
    lastTestScore: number | null
    totalTests: number
    timeSpent: number
  }
}

export default function ChapterPage() {
  const params = useParams()
  const router = useRouter()
  const subjectCode = params.subject as string
  const chapterId = params.chapter as string

  const [chapter, setChapter] = useState<ChapterData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch chapter data
  const fetchChapterData = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const response = await fetch(`/api/library/chapter/${chapterId}`)
      if (!response.ok) throw new Error('Failed to fetch chapter data')
      const data = await response.json()
      setChapter(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setIsLoading(false)
    }
  }, [chapterId])

  useEffect(() => {
    fetchChapterData()
  }, [fetchChapterData])

  // Handle resource click
  const handleResourceClick = (resource: LibraryResource) => {
    router.push(`/library/resource/${resource.id}`)
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
  if (error || !chapter) {
    return (
      <div className="min-h-screen cognify-bg flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center bg-white rounded-2xl p-8 shadow-xl border border-gray-100"
        >
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-gray-600 mb-4">{error || 'Chapter not found'}</p>
          <Button onClick={() => router.push('/library')}>Back to Library</Button>
        </motion.div>
      </div>
    )
  }

  // Generate topic heatmap
  const topicHeatmap = chapter.resources.map(r => ({
    id: r.id,
    name: r.title,
    value: Math.round(Math.random() * 100), // Placeholder - would be calculated from actual progress
    status: Math.random() > 0.7 ? 'strong' : Math.random() > 0.4 ? 'moderate' : 'weak' as const,
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
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push('/library')}
              className="text-gray-500 hover:text-gray-700 p-0 h-auto"
            >
              Library
            </Button>
            <ChevronRight className="h-4 w-4" />
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push(`/library/${subjectCode}`)}
              className="text-gray-500 hover:text-gray-700 p-0 h-auto"
            >
              {chapter.subject.name}
            </Button>
            <ChevronRight className="h-4 w-4" />
            <span className="text-gray-900 font-medium">Chapter {chapter.number}</span>
          </div>

          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                className="relative"
              >
                <CircularProgress
                  value={chapter.userProgress}
                  size={64}
                  strokeWidth={5}
                  showValue={false}
                  progressColor={chapter.isWeakTopic ? '#EF4444' : '#2563EB'}
                >
                  <div className="flex flex-col items-center">
                    <span className="text-lg font-bold text-gray-900">{chapter.userProgress}</span>
                    <span className="text-[10px] text-gray-500">%</span>
                  </div>
                </CircularProgress>
                {chapter.isWeakTopic && (
                  <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full border-2 border-white flex items-center justify-center"
                  >
                    <AlertCircle className="w-2.5 h-2.5 text-white" />
                  </motion.div>
                )}
              </motion.div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">
                  {chapter.number}. {chapter.name}
                </h1>
                <p className="text-sm text-gray-500 mt-0.5">{chapter.description}</p>
              </div>
            </div>
            <motion.button
              whileHover={{ scale: 1.1, rotate: 180 }}
              whileTap={{ scale: 0.9 }}
              onClick={fetchChapterData}
              className="text-gray-400 hover:text-gray-600"
            >
              <RefreshCw className="h-4 w-4" />
            </motion.button>
          </div>
        </div>
      </motion.header>

      {/* Main Content */}
      <main className="p-4 md:p-6 lg:p-8">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-6 max-w-6xl mx-auto"
        >
          {/* Chapter Stats */}
          <motion.div variants={itemVariants} className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="p-4 border-gray-200 hover:border-blue-200 transition-colors">
              <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
                <Weight className="w-4 h-4" />
                JEE Weightage
              </div>
              <p className="text-2xl font-bold text-gray-900">{chapter.weightage}%</p>
            </Card>
            <Card className="p-4 border-gray-200 hover:border-blue-200 transition-colors">
              <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
                <BarChart3 className="w-4 h-4" />
                Difficulty
              </div>
              <Badge className={cn(
                'mt-1',
                chapter.difficulty === 'Beginner' ? 'bg-green-100 text-green-700' :
                chapter.difficulty === 'Intermediate' ? 'bg-yellow-100 text-yellow-700' :
                'bg-red-100 text-red-700'
              )}>
                {chapter.difficulty}
              </Badge>
            </Card>
            <Card className="p-4 border-gray-200 hover:border-blue-200 transition-colors">
              <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
                <Clock className="w-4 h-4" />
                Study Time
              </div>
              <p className="text-2xl font-bold text-gray-900">{chapter.insights.timeSpent}m</p>
            </Card>
            <Card className="p-4 border-gray-200 hover:border-blue-200 transition-colors">
              <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
                <Target className="w-4 h-4" />
                Accuracy
              </div>
              <p className="text-2xl font-bold text-gray-900">{chapter.insights.accuracy}%</p>
            </Card>
          </motion.div>

          {/* Resources Grid */}
          <motion.div variants={itemVariants}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">
                Resources ({chapter.resources.length})
              </h2>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="bg-white">
                  {chapter.resources.filter(r => r.isBookmarked).length} saved
                </Badge>
              </div>
            </div>

            {chapter.resources.length === 0 ? (
              <Card className="p-8 border-gray-200">
                <div className="text-center">
                  <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">No resources available for this chapter yet.</p>
                </div>
              </Card>
            ) : (
              <motion.div
                variants={containerVariants}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
              >
                {chapter.resources.map((resource) => (
                  <motion.div
                    key={resource.id}
                    variants={itemVariants}
                    whileHover={{ y: -4 }}
                    onClick={() => handleResourceClick(resource)}
                    className="group cursor-pointer"
                  >
                    <Card className="h-full border-gray-200 hover:border-blue-300 hover:shadow-lg hover:shadow-blue-500/5 transition-all duration-200 overflow-hidden">
                      {/* Card Header */}
                      <div className="relative p-4 pb-0">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-2">
                            <span className="text-lg">
                              {resourceTypeIcons[resource.resourceType] || '📄'}
                            </span>
                            <Badge variant="outline" className="text-xs bg-white">
                              {resource.resourceType}
                            </Badge>
                          </div>
                          <motion.div
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                          >
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={(e) => {
                                e.stopPropagation()
                                // Toggle bookmark
                              }}
                            >
                              <Bookmark className={cn(
                                'w-4 h-4',
                                resource.isBookmarked ? 'fill-blue-500 text-blue-500' : 'text-gray-400'
                              )} />
                            </Button>
                          </motion.div>
                        </div>
                      </div>

                      {/* Card Content */}
                      <CardContent className="p-4 pt-3">
                        <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-2 mb-2">
                          {resource.title}
                        </h3>
                        <p className="text-sm text-gray-500 line-clamp-2 mb-3">
                          {resource.description}
                        </p>

                        <div className="flex items-center justify-between text-xs text-gray-400">
                          <div className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {resource.readingTime} min read
                          </div>
                          <div className="flex items-center gap-1">
                            <Play className="w-3 h-3" />
                            {resource.viewCount} views
                          </div>
                        </div>
                      </CardContent>

                      {/* Hover Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                    </Card>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </motion.div>

          {/* AI Actions */}
          <motion.div variants={itemVariants}>
            <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Brain className="w-5 h-5 text-blue-500" />
                  AI Study Tools
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {[
                    { icon: Sparkles, label: 'Summarize Chapter', action: 'summarize' },
                    { icon: Target, label: 'Generate Practice', action: 'practice' },
                    { icon: FileText, label: 'Create Mini Test', action: 'test' },
                    { icon: Zap, label: 'Quick Revision', action: 'revision' },
                  ].map((tool) => (
                    <motion.button
                      key={tool.action}
                      whileHover={{ scale: 1.02, y: -2 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => {
                        // Handle AI action
                      }}
                      className="flex items-center gap-2 p-3 bg-white rounded-xl border border-blue-100 hover:border-blue-300 transition-colors text-left"
                    >
                      <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
                        <tool.icon className="w-4 h-4 text-blue-600" />
                      </div>
                      <span className="text-sm font-medium text-gray-700">{tool.label}</span>
                    </motion.button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Topic Heatmap */}
          {topicHeatmap.length > 0 && (
            <motion.div variants={itemVariants}>
              <Card className="border-gray-200">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <TrendingUp className="w-5 h-5 text-blue-500" />
                    Topic Mastery
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ChapterHeatmap
                    topics={topicHeatmap}
                    onTopicClick={(topic) => {
                      const resource = chapter.resources.find(r => r.id === topic.id)
                      if (resource) handleResourceClick(resource)
                    }}
                  />
                </CardContent>
              </Card>
            </motion.div>
          )}
        </motion.div>
      </main>
    </div>
  )
}
