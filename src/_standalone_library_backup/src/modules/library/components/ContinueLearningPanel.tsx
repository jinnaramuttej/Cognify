'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { ScrollArea } from '@/components/ui/scroll-area'
import { cn } from '@/lib/utils'
import {
  Play,
  Clock,
  BookOpen,
  ChevronRight,
  Bookmark,
  RotateCcw,
  CheckCircle2,
} from 'lucide-react'
import type { ContinueLearningItem } from '../types'

interface ContinueLearningPanelProps {
  items: ContinueLearningItem[]
  onResourceClick: (resourceId: string) => void
  onBookmarkToggle?: (resourceId: string) => void
  isLoading?: boolean
}

export function ContinueLearningPanel({
  items,
  onResourceClick,
  onBookmarkToggle,
  isLoading = false,
}: ContinueLearningPanelProps) {
  if (isLoading) {
    return (
      <Card className="p-5 bg-white border-gray-100 shadow-sm">
        <div className="animate-pulse space-y-4">
          <div className="h-5 bg-gray-100 rounded w-1/2" />
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-20 bg-gray-50 rounded-xl" />
            ))}
          </div>
        </div>
      </Card>
    )
  }

  if (items.length === 0) {
    return (
      <Card className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200 shadow-sm">
        <div className="text-center py-4">
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', stiffness: 200, damping: 15 }}
            className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center mx-auto mb-3 shadow-lg shadow-blue-500/20"
          >
            <BookOpen className="h-7 w-7 text-white" />
          </motion.div>
          <h3 className="font-semibold text-gray-900">Start Learning</h3>
          <p className="text-sm text-gray-600 mt-1">Your progress will appear here</p>
        </div>
      </Card>
    )
  }

  return (
    <Card className="bg-white border-gray-100 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-gray-100 bg-gradient-to-r from-blue-50/50 to-transparent">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center shadow-md shadow-blue-500/20">
              <RotateCcw className="h-4 w-4 text-white" />
            </div>
            <h3 className="font-semibold text-gray-900">Continue Learning</h3>
          </div>
          <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
            {items.length} in progress
          </Badge>
        </div>
      </div>

      {/* Items */}
      <ScrollArea className="max-h-[300px]">
        <div className="p-3 space-y-2">
          <AnimatePresence mode="popLayout">
            {items.map((item, index) => (
              <ContinueLearningCard
                key={item.resourceId}
                item={item}
                index={index}
                onClick={() => onResourceClick(item.resourceId)}
                onBookmarkToggle={onBookmarkToggle}
              />
            ))}
          </AnimatePresence>
        </div>
      </ScrollArea>
    </Card>
  )
}

function ContinueLearningCard({
  item,
  index,
  onClick,
  onBookmarkToggle,
}: {
  item: ContinueLearningItem
  index: number
  onClick: () => void
  onBookmarkToggle?: (resourceId: string) => void
}) {
  const isCompleted = item.progress >= 100
  const isRecent = Date.now() - new Date(item.lastViewed).getTime() < 24 * 60 * 60 * 1000

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      transition={{ delay: index * 0.05 }}
      layout
    >
      <Card
        className={cn(
          'p-3 cursor-pointer transition-all duration-200 group',
          isCompleted 
            ? 'bg-emerald-50 border-emerald-200 hover:border-emerald-300' 
            : 'bg-gray-50 border-gray-100 hover:border-blue-200 hover:bg-blue-50/50'
        )}
        onClick={onClick}
      >
        <div className="flex items-start gap-3">
          {/* Icon */}
          <div className={cn(
            'w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-105',
            isCompleted 
              ? 'bg-emerald-200' 
              : 'bg-blue-100 group-hover:bg-blue-200'
          )}>
            {isCompleted ? (
              <CheckCircle2 className="h-5 w-5 text-emerald-600" />
            ) : (
              <Play className="h-5 w-5 text-blue-600" />
            )}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <h4 className="text-sm font-medium text-gray-900 truncate group-hover:text-blue-600 transition-colors">
                  {item.title}
                </h4>
                <p className="text-xs text-gray-500 mt-0.5 truncate">
                  {item.subject} • {item.chapter}
                </p>
              </div>
              {onBookmarkToggle && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation()
                    onBookmarkToggle(item.resourceId)
                  }}
                  className="h-7 w-7 p-0 hover:bg-white/50"
                >
                  <Bookmark className={cn(
                    'h-4 w-4',
                    item.isBookmarked ? 'text-blue-500 fill-blue-500' : 'text-gray-400'
                  )} />
                </Button>
              )}
            </div>

            {/* Progress */}
            <div className="mt-2">
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="text-gray-500">
                  {item.progress >= 100 ? 'Completed' : `${Math.round(item.progress)}% complete`}
                </span>
                {item.currentPage > 1 && item.totalPages > 1 && (
                  <span className="text-gray-400">
                    Page {item.currentPage}/{item.totalPages}
                  </span>
                )}
              </div>
              <Progress 
                value={item.progress} 
                className={cn(
                  'h-1.5',
                  isCompleted ? 'bg-emerald-100' : 'bg-gray-200'
                )}
                indicatorClassName={cn(
                  isCompleted 
                    ? 'bg-emerald-500' 
                    : 'bg-gradient-to-r from-blue-500 to-indigo-500'
                )}
              />
            </div>

            {/* Footer */}
            <div className="flex items-center gap-3 mt-2 text-xs text-gray-400">
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {formatTimeSpent(item.timeSpent)}
              </span>
              {isRecent && (
                <Badge variant="outline" className="text-xs bg-white border-gray-200 text-gray-600">
                  Recent
                </Badge>
              )}
            </div>
          </div>

          <ChevronRight className="h-4 w-4 text-gray-300 group-hover:text-blue-500 group-hover:translate-x-1 transition-all flex-shrink-0 mt-3" />
        </div>
      </Card>
    </motion.div>
  )
}

function formatTimeSpent(seconds: number): string {
  if (seconds < 60) return `${seconds}s`
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m`
  const hours = Math.floor(minutes / 60)
  const remainingMinutes = minutes % 60
  return `${hours}h ${remainingMinutes}m`
}

export default ContinueLearningPanel
