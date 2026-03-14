'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import {
  Bookmark,
  BookOpen,
  Clock,
  FileText,
  Trash2,
  RefreshCw,
  ExternalLink,
  Calendar,
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { AnimatedStatCard } from '@/components/ui/animated-counter'
import type { LibraryResource } from '@/modules/library/types'
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

interface BookmarkItem {
  id: string
  resourceId: string
  pyqId: string | null
  sectionTitle: string | null
  createdAt: string
  resource?: LibraryResource
}

export default function BookmarksPage() {
  const router = useRouter()
  const [bookmarks, setBookmarks] = useState<BookmarkItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [groupBy, setGroupBy] = useState<'subject' | 'chapter' | 'date'>('subject')

  // Fetch bookmarks
  const fetchBookmarks = useCallback(async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/library/bookmarks?userId=demo-user')
      if (response.ok) {
        const data = await response.json()
        setBookmarks(data.bookmarks || [])
      }
    } catch (error) {
      console.error('Failed to fetch bookmarks:', error)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchBookmarks()
  }, [fetchBookmarks])

  // Remove bookmark
  const removeBookmark = async (bookmarkId: string, resourceId: string) => {
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
      setBookmarks(prev => prev.filter(b => b.id !== bookmarkId))
      toast.success('Bookmark removed')
    } catch {
      toast.error('Failed to remove bookmark')
    }
  }

  // Open resource
  const openResource = (resourceId: string) => {
    router.push(`/library/resource/${resourceId}`)
  }

  // Group bookmarks
  const groupedBookmarks = useCallback(() => {
    const groups: Record<string, BookmarkItem[]> = {}

    bookmarks.forEach(bookmark => {
      let key: string
      if (groupBy === 'subject') {
        key = bookmark.resource?.subject || 'Unknown'
      } else if (groupBy === 'chapter') {
        key = bookmark.resource?.chapter || 'Unknown'
      } else {
        key = new Date(bookmark.createdAt).toLocaleDateString()
      }

      if (!groups[key]) groups[key] = []
      groups[key].push(bookmark)
    })

    return groups
  }, [bookmarks, groupBy])

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

  const groups = groupedBookmarks()

  return (
    <div className="min-h-screen cognify-bg">
      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/80 backdrop-blur-lg border-b border-gray-100 sticky top-0 z-40"
      >
        <div className="px-4 md:px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center shadow-lg shadow-orange-500/30">
                <Bookmark className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Bookmarks</h1>
                <p className="text-sm text-gray-500">{bookmarks.length} saved resources</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {(['subject', 'chapter', 'date'] as const).map((option) => (
                <Button
                  key={option}
                  variant={groupBy === option ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setGroupBy(option)}
                  className={cn(
                    'capitalize',
                    groupBy === option && 'bg-blue-600 hover:bg-blue-700'
                  )}
                >
                  {option}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </motion.header>

      {/* Main Content */}
      <main className="p-4 md:p-6 lg:p-8">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-4"
          >
            <AnimatedStatCard label="Total Bookmarks" value={bookmarks.length} icon={Bookmark} color="orange" />
            <AnimatedStatCard label="Resources" value={bookmarks.filter(b => b.resourceId).length} icon={FileText} color="blue" />
            <AnimatedStatCard label="Subjects" value={new Set(bookmarks.map(b => b.resource?.subject)).size} icon={BookOpen} color="green" />
            <AnimatedStatCard label="This Week" value={bookmarks.filter(b => {
              const weekAgo = new Date()
              weekAgo.setDate(weekAgo.getDate() - 7)
              return new Date(b.createdAt) > weekAgo
            }).length} icon={Calendar} color="purple" />
          </motion.div>

          {/* Bookmarks List */}
          {bookmarks.length === 0 ? (
            <Card className="p-8 border-gray-200">
              <div className="text-center">
                <Bookmark className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 mb-2">No bookmarks yet</p>
                <p className="text-sm text-gray-400 mb-4">
                  Save resources to access them quickly later
                </p>
                <Button onClick={() => router.push('/library')}>
                  Browse Library
                </Button>
              </div>
            </Card>
          ) : (
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="space-y-6"
            >
              {Object.entries(groups).map(([group, items]) => (
                <motion.div key={group} variants={itemVariants}>
                  <div className="flex items-center gap-2 mb-3">
                    {groupBy === 'date' && <Calendar className="w-4 h-4 text-gray-400" />}
                    <h3 className="font-semibold text-gray-900">{group}</h3>
                    <Badge variant="secondary" className="bg-gray-100">
                      {items.length}
                    </Badge>
                  </div>
                  <div className="space-y-2">
                    {items.map((bookmark) => (
                      <motion.div
                        key={bookmark.id}
                        whileHover={{ scale: 1.01 }}
                        className="group"
                      >
                        <Card className="border-gray-200 hover:border-blue-200 transition-all duration-200">
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between gap-4">
                              <div
                                className="flex-1 min-w-0 cursor-pointer"
                                onClick={() => bookmark.resourceId && openResource(bookmark.resourceId)}
                              >
                                <div className="flex items-center gap-2 mb-1">
                                  <FileText className="w-4 h-4 text-gray-400" />
                                  <span className="font-medium text-gray-900 truncate group-hover:text-blue-600 transition-colors">
                                    {bookmark.resource?.title || bookmark.sectionTitle || 'Unknown Resource'}
                                  </span>
                                </div>
                                {bookmark.resource && (
                                  <div className="flex items-center gap-2 text-xs text-gray-500">
                                    <span>{bookmark.resource.subject}</span>
                                    <span className="text-gray-300">•</span>
                                    <span>{bookmark.resource.chapter}</span>
                                    <span className="text-gray-300">•</span>
                                    <span className="flex items-center gap-1">
                                      <Clock className="w-3 h-3" />
                                      {bookmark.resource.readingTime} min
                                    </span>
                                  </div>
                                )}
                              </div>
                              <div className="flex items-center gap-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => bookmark.resourceId && openResource(bookmark.resourceId)}
                                  className="text-blue-600 hover:text-blue-700"
                                >
                                  <ExternalLink className="w-4 h-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => removeBookmark(bookmark.id, bookmark.resourceId)}
                                  className="text-gray-400 hover:text-red-500"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>
      </main>
    </div>
  )
}
