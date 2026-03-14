'use client'

import { useState, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Bookmark,
  BookmarkCheck,
  ExternalLink,
  Sparkles,
  FileText,
  Loader2,
  Clock,
  Eye,
  Download,
  FileQuestion,
  TestTube,
  BookMarked,
  X,
} from 'lucide-react'
import type { LibraryResource } from '../types'

interface ResourceViewerProps {
  resource: LibraryResource | null
  isOpen: boolean
  onClose: () => void
  onBookmark: () => void
  onAskCogni: () => void
  onGeneratePractice: () => void
  onSummarize: () => void
  onCreateTest: () => void
  onViewRecorded: () => void
}

const difficultyColors = {
  Beginner: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  Intermediate: 'bg-amber-50 text-amber-700 border-amber-200',
  Advanced: 'bg-red-50 text-red-700 border-red-200',
}

const resourceTypeColors = {
  'Notes': 'bg-blue-50 text-blue-700 border-blue-200',
  'PYQ': 'bg-purple-50 text-purple-700 border-purple-200',
  'Concept Sheet': 'bg-teal-50 text-teal-700 border-teal-200',
  'Diagram': 'bg-pink-50 text-pink-700 border-pink-200',
  'Formula List': 'bg-orange-50 text-orange-700 border-orange-200',
  'Video': 'bg-red-50 text-red-700 border-red-200',
}

export function ResourceViewer({
  resource,
  isOpen,
  onClose,
  onBookmark,
  onAskCogni,
  onGeneratePractice,
  onSummarize,
  onCreateTest,
  onViewRecorded,
}: ResourceViewerProps) {
  const [loadingResources, setLoadingResources] = useState<Set<string>>(new Set())
  const [recordedViews, setRecordedViews] = useState<Set<string>>(new Set())

  // Mark resource as loading when it changes
  const resourceId = resource?.id
  const isLoading = resourceId ? loadingResources.has(resourceId) : false

  // Mark new resource as loading
  const markResourceLoading = useCallback((id: string) => {
    setLoadingResources(prev => new Set(prev).add(id))
  }, [])

  // Mark resource as loaded
  const markResourceLoaded = useCallback((id: string) => {
    setLoadingResources(prev => {
      const next = new Set(prev)
      next.delete(id)
      return next
    })
  }, [])

  // Record view
  const recordResourceView = useCallback((id: string) => {
    if (!recordedViews.has(id)) {
      onViewRecorded()
      setRecordedViews(prev => new Set(prev).add(id))
    }
  }, [recordedViews, onViewRecorded])

  // Handle dialog open state change
  const handleOpenChange = useCallback((open: boolean) => {
    if (!open) {
      onClose()
    } else if (resource) {
      // When opening, mark as loading and record view
      markResourceLoading(resource.id)
      recordResourceView(resource.id)
    }
  }, [onClose, resource, markResourceLoading, recordResourceView])

  // Handle iframe load
  const handleIframeLoad = useCallback(() => {
    if (resource) {
      markResourceLoaded(resource.id)
    }
  }, [resource, markResourceLoaded])

  if (!resource) return null

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-5xl w-[95vw] h-[90vh] p-0 gap-0 flex flex-col bg-white rounded-2xl overflow-hidden">
        {/* Header */}
        <DialogHeader className="px-5 py-4 border-b border-gray-100 bg-gradient-to-r from-white to-gray-50 flex-shrink-0">
          <div className="flex items-start justify-between gap-4">
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex-1 min-w-0"
            >
              <DialogTitle className="text-lg font-semibold text-gray-900 line-clamp-2">
                {resource.title}
              </DialogTitle>
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="flex flex-wrap items-center gap-2 mt-3"
              >
                <Badge variant="outline" className="bg-white border-gray-200 text-gray-700">
                  {resource.subject}
                </Badge>
                <Badge variant="outline" className="bg-white border-gray-200 text-gray-700">
                  {resource.chapter}
                </Badge>
                <Badge variant="outline" className={`text-xs ${difficultyColors[resource.difficulty]}`}>
                  {resource.difficulty}
                </Badge>
                <Badge variant="outline" className="bg-white border-gray-200 text-gray-700">
                  Class {resource.grade}
                </Badge>
                <Badge variant="outline" className="bg-white border-gray-200 text-gray-700">
                  {resource.exam}
                </Badge>
                {resource.year && (
                  <Badge className="bg-gradient-to-r from-blue-500 to-blue-600 text-white border-0 shadow-sm">
                    {resource.year}
                  </Badge>
                )}
                <Badge variant="outline" className={`text-xs ${resourceTypeColors[resource.resourceType] || 'bg-gray-50 text-gray-700 border-gray-200'}`}>
                  {resource.resourceType}
                </Badge>
              </motion.div>
            </motion.div>
            
            {/* Action Buttons */}
            <motion.div
              initial={{ opacity: 0, x: 8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.15 }}
              className="flex items-center gap-2 flex-shrink-0"
            >
              <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onBookmark}
                  className="h-9 w-9 p-0 hover:bg-gray-100 rounded-lg"
                >
                  {resource.isBookmarked ? (
                    <BookmarkCheck className="h-4 w-4 text-blue-600" />
                  ) : (
                    <Bookmark className="h-4 w-4 text-gray-400" />
                  )}
                </Button>
              </motion.div>
              {resource.fileUrl && (
                <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-9 w-9 p-0 hover:bg-gray-100 rounded-lg"
                    asChild
                  >
                    <a href={resource.fileUrl} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="h-4 w-4 text-gray-400" />
                    </a>
                  </Button>
                </motion.div>
              )}
            </motion.div>
          </div>
        </DialogHeader>

        {/* Content */}
        <div className="flex-1 relative bg-gradient-to-br from-gray-50 to-blue-50/30 overflow-hidden">
          <AnimatePresence>
            {isLoading && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-gray-50 to-blue-50/30 z-10"
              >
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="flex flex-col items-center gap-3"
                >
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  >
                    <Loader2 className="h-8 w-8 text-blue-500" />
                  </motion.div>
                  <span className="text-sm text-gray-500 font-medium">Loading resource...</span>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
          
          {/* PDF Viewer / Content Display */}
          <div className="w-full h-full flex items-center justify-center p-4">
            {resource.fileUrl ? (
              <motion.iframe
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 }}
                src={`${resource.fileUrl}#toolbar=0&navpanes=0`}
                className="w-full h-full rounded-xl bg-white shadow-xl"
                onLoad={handleIframeLoad}
                title={resource.title}
              />
            ) : resource.content ? (
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="w-full h-full overflow-auto bg-white rounded-xl shadow-xl p-6 prose prose-sm max-w-none"
              >
                <div dangerouslySetInnerHTML={{ __html: resource.content }} />
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col items-center justify-center py-16"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
                  className="w-20 h-20 rounded-2xl bg-gradient-to-br from-gray-100 to-gray-50 flex items-center justify-center mb-4"
                >
                  <FileText className="h-8 w-8 text-gray-300" />
                </motion.div>
                <p className="text-gray-500 text-center mb-6 max-w-sm">
                  Preview not available for this resource.
                </p>
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Button
                    variant="outline"
                    onClick={onAskCogni}
                    className="border-blue-200 text-blue-600 hover:bg-blue-50 rounded-xl"
                  >
                    <Sparkles className="h-4 w-4 mr-2" />
                    Ask Cogni about this content
                  </Button>
                </motion.div>
              </motion.div>
            )}
          </div>
        </div>

        {/* AI Action Bar */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="px-5 py-3 border-t border-gray-100 bg-white flex-shrink-0"
        >
          <div className="flex flex-wrap items-center gap-2">
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button
                variant="outline"
                size="sm"
                onClick={onAskCogni}
                className="border-blue-200 text-blue-600 hover:bg-blue-50 rounded-lg"
              >
                <Sparkles className="h-4 w-4 mr-1.5" />
                Ask Cogni
              </Button>
            </motion.div>
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button
                variant="outline"
                size="sm"
                onClick={onGeneratePractice}
                className="border-gray-200 text-gray-700 hover:bg-gray-50 rounded-lg"
              >
                <FileQuestion className="h-4 w-4 mr-1.5" />
                Practice Questions
              </Button>
            </motion.div>
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button
                variant="outline"
                size="sm"
                onClick={onSummarize}
                className="border-gray-200 text-gray-700 hover:bg-gray-50 rounded-lg"
              >
                <BookMarked className="h-4 w-4 mr-1.5" />
                Summarize
              </Button>
            </motion.div>
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button
                variant="outline"
                size="sm"
                onClick={onCreateTest}
                className="border-gray-200 text-gray-700 hover:bg-gray-50 rounded-lg"
              >
                <TestTube className="h-4 w-4 mr-1.5" />
                Create Test
              </Button>
            </motion.div>
          </div>
        </motion.div>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.25 }}
          className="px-5 py-3 border-t border-gray-100 bg-gradient-to-r from-gray-50 to-blue-50/30 flex-shrink-0"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4 text-sm text-gray-500">
              <div className="flex items-center gap-1.5">
                <Eye className="h-4 w-4" />
                <span>{resource.viewCount} views</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Clock className="h-4 w-4" />
                <span>{resource.readingTime} min read</span>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onClose}
                  className="rounded-lg"
                >
                  Close
                </Button>
              </motion.div>
              {resource.fileUrl && (
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Button
                    size="sm"
                    asChild
                    className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 rounded-lg shadow-md shadow-blue-500/20"
                  >
                    <a href={resource.fileUrl} download>
                      <Download className="h-4 w-4 mr-1.5" />
                      Download
                    </a>
                  </Button>
                </motion.div>
              )}
            </div>
          </div>
        </motion.div>
      </DialogContent>
    </Dialog>
  )
}
