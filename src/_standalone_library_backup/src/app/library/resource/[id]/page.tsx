'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import {
  BookOpen,
  ChevronRight,
  Clock,
  Target,
  Brain,
  ArrowLeft,
  RefreshCw,
  AlertCircle,
  Bookmark,
  Share2,
  Download,
  Highlighter,
  MessageSquare,
  ChevronDown,
  ChevronUp,
  Sparkles,
  FileText,
  Play,
  CheckCircle2,
  X,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { CircularProgress } from '@/components/ui/circular-progress'
import { Separator } from '@/components/ui/separator'
import type { LibraryResource } from '@/modules/library/types'
import { toast } from 'sonner'

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.05, delayChildren: 0.1 },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
}

interface ResourceData extends LibraryResource {
  chapter: {
    id: string
    name: string
    number: number
    userProgress: number
  }
  subject: {
    id: string
    name: string
    code: string
    color: string
  }
  relatedResources: LibraryResource[]
}

export default function ResourceViewerPage() {
  const params = useParams()
  const router = useRouter()
  const resourceId = params.id as string

  const [resource, setResource] = useState<ResourceData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [scrollProgress, setScrollProgress] = useState(0)
  const [isBookmarked, setIsBookmarked] = useState(false)
  const [showAIPanel, setShowAIPanel] = useState(true)
  const contentRef = useRef<HTMLDivElement>(null)

  // Fetch resource data
  const fetchResourceData = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const response = await fetch(`/api/library/resource/${resourceId}?userId=demo-user`)
      if (!response.ok) throw new Error('Failed to fetch resource')
      const data = await response.json()
      setResource(data)
      setIsBookmarked(data.isBookmarked)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setIsLoading(false)
    }
  }, [resourceId])

  useEffect(() => {
    fetchResourceData()
  }, [fetchResourceData])

  // Track scroll progress
  useEffect(() => {
    const handleScroll = () => {
      if (contentRef.current) {
        const { scrollTop, scrollHeight, clientHeight } = contentRef.current
        const progress = Math.round((scrollTop / (scrollHeight - clientHeight)) * 100)
        setScrollProgress(Math.min(progress, 100))
      }
    }

    const contentEl = contentRef.current
    contentEl?.addEventListener('scroll', handleScroll)
    return () => contentEl?.removeEventListener('scroll', handleScroll)
  }, [])

  // Toggle bookmark
  const handleBookmark = async () => {
    try {
      await fetch('/api/library/bookmarks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: 'demo-user',
          resourceId,
          action: 'toggle'
        })
      })
      setIsBookmarked(!isBookmarked)
      toast.success(isBookmarked ? 'Bookmark removed' : 'Bookmark added')
    } catch {
      toast.error('Failed to update bookmark')
    }
  }

  // AI Actions
  const handleAIAction = (action: string) => {
    toast.info(`AI Action: ${action}`, {
      description: `Processing ${resource?.title || 'resource'}...`
    })
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
  if (error || !resource) {
    return (
      <div className="min-h-screen cognify-bg flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center bg-white rounded-2xl p-8 shadow-xl border border-gray-100"
        >
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-gray-600 mb-4">{error || 'Resource not found'}</p>
          <Button onClick={() => router.push('/library')}>Back to Library</Button>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen cognify-bg flex flex-col">
      {/* Scroll Progress Bar */}
      <motion.div
        initial={{ scaleX: 0 }}
        animate={{ scaleX: scrollProgress / 100 }}
        className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-blue-600 origin-left z-50"
      />

      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/80 backdrop-blur-lg border-b border-gray-100 sticky top-0 z-40"
      >
        <div className="px-4 md:px-6 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.back()}
                className="text-gray-500 hover:text-gray-700"
              >
                <ArrowLeft className="h-4 w-4 mr-1" />
                Back
              </Button>
              <Separator orientation="vertical" className="h-6" />
              <div className="flex items-center gap-2 text-sm">
                <Badge variant="outline" className="bg-white">
                  {resource.resourceType}
                </Badge>
                <span className="text-gray-400">•</span>
                <span className="text-gray-600">{resource.subject.name}</span>
                <ChevronRight className="h-3 w-3 text-gray-300" />
                <span className="text-gray-600">{resource.chapter.name}</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <motion.div
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleBookmark}
                  className="h-9 w-9"
                >
                  <Bookmark className={cn(
                    'w-4 h-4',
                    isBookmarked ? 'fill-blue-500 text-blue-500' : 'text-gray-400'
                  )} />
                </Button>
              </motion.div>
              <Button variant="ghost" size="icon" className="h-9 w-9">
                <Share2 className="w-4 h-4 text-gray-400" />
              </Button>
              {resource.allowDownload && (
                <Button variant="ghost" size="icon" className="h-9 w-9">
                  <Download className="w-4 h-4 text-gray-400" />
                </Button>
              )}
            </div>
          </div>
        </div>
      </motion.header>

      {/* Main Content */}
      <div className="flex-1 flex">
        {/* Content Area */}
        <main
          ref={contentRef}
          className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8"
        >
          <motion.article
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="max-w-4xl mx-auto space-y-6"
          >
            {/* Title */}
            <motion.div variants={itemVariants}>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
                {resource.title}
              </h1>
              <div className="flex items-center gap-4 text-sm text-gray-500">
                <span className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  {resource.readingTime} min read
                </span>
                <span className="flex items-center gap-1">
                  <Play className="w-4 h-4" />
                  {resource.viewCount} views
                </span>
                <Badge variant="outline" className="bg-white text-xs">
                  {resource.difficulty}
                </Badge>
              </div>
            </motion.div>

            {/* Description */}
            <motion.p variants={itemVariants} className="text-gray-600 leading-relaxed">
              {resource.description}
            </motion.p>

            {/* Content */}
            <motion.div
              variants={itemVariants}
              className="prose prose-gray max-w-none"
            >
              {resource.content ? (
                <div
                  className="text-gray-700 leading-[1.8] space-y-4"
                  dangerouslySetInnerHTML={{ __html: resource.content }}
                />
              ) : (
                <div className="bg-gray-50 rounded-xl p-8 text-center">
                  <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500 mb-4">
                    This resource content is available as a downloadable file.
                  </p>
                  {resource.fileUrl && (
                    <Button className="gap-2">
                      <Download className="w-4 h-4" />
                      Download Resource
                    </Button>
                  )}
                </div>
              )}
            </motion.div>

            {/* Tags */}
            {resource.tags.length > 0 && (
              <motion.div variants={itemVariants} className="flex flex-wrap gap-2 pt-4">
                {resource.tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="bg-gray-100">
                    {tag}
                  </Badge>
                ))}
              </motion.div>
            )}

            {/* Action Bar */}
            <motion.div
              variants={itemVariants}
              className="flex items-center justify-between pt-6 border-t border-gray-100"
            >
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" className="gap-2">
                  <Highlighter className="w-4 h-4" />
                  Highlight
                </Button>
                <Button variant="outline" size="sm" className="gap-2">
                  <MessageSquare className="w-4 h-4" />
                  Ask Cogni
                </Button>
              </div>
              <span className="text-sm text-gray-400">
                {scrollProgress}% completed
              </span>
            </motion.div>
          </motion.article>
        </main>

        {/* AI Insight Sidebar */}
        <AnimatePresence>
          {showAIPanel && (
            <motion.aside
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ type: 'spring', stiffness: 200, damping: 25 }}
              className="hidden lg:block w-80 border-l border-gray-200 bg-white/50 overflow-y-auto"
            >
              <div className="p-4 space-y-4 sticky top-0">
                {/* Header */}
                <div className="flex items-center justify-between">
                  <h2 className="font-semibold text-gray-900 flex items-center gap-2">
                    <Brain className="w-5 h-5 text-blue-500" />
                    AI Insights
                  </h2>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setShowAIPanel(false)}
                    className="h-8 w-8"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>

                {/* Chapter Mastery */}
                <Card className="border-gray-200">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-4">
                      <CircularProgress
                        value={resource.chapter.userProgress}
                        size={56}
                        strokeWidth={5}
                      />
                      <div>
                        <p className="text-sm text-gray-500">Chapter Mastery</p>
                        <p className="text-lg font-bold text-gray-900">
                          {resource.chapter.userProgress}%
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* AI Quick Actions */}
                <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-blue-500" />
                      Quick Actions
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {[
                      { label: 'Explain This', icon: Brain },
                      { label: 'Generate Practice', icon: Target },
                      { label: 'Summarize', icon: FileText },
                      { label: 'Create Mini Test', icon: CheckCircle2 },
                    ].map((action) => (
                      <motion.button
                        key={action.label}
                        whileHover={{ scale: 1.02, x: 4 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handleAIAction(action.label)}
                        className="w-full flex items-center gap-3 p-3 bg-white rounded-lg border border-blue-100 hover:border-blue-300 transition-colors text-left"
                      >
                        <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
                          <action.icon className="w-4 h-4 text-blue-600" />
                        </div>
                        <span className="text-sm font-medium text-gray-700">{action.label}</span>
                      </motion.button>
                    ))}
                  </CardContent>
                </Card>

                {/* Related Resources */}
                {resource.relatedResources.length > 0 && (
                  <Card className="border-gray-200">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">Related Resources</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      {resource.relatedResources.slice(0, 3).map((related) => (
                        <motion.button
                          key={related.id}
                          whileHover={{ scale: 1.02 }}
                          onClick={() => router.push(`/library/resource/${related.id}`)}
                          className="w-full text-left p-2 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {related.title}
                          </p>
                          <p className="text-xs text-gray-500">{related.readingTime} min</p>
                        </motion.button>
                      ))}
                    </CardContent>
                  </Card>
                )}
              </div>
            </motion.aside>
          )}
        </AnimatePresence>
      </div>

      {/* Floating AI Button (Mobile) */}
      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setShowAIPanel(!showAIPanel)}
        className="lg:hidden fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full shadow-lg shadow-blue-500/30 flex items-center justify-center text-white z-50"
      >
        <Brain className="w-6 h-6" />
      </motion.button>
    </div>
  )
}
