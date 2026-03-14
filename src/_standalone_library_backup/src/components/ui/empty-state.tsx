'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  BookOpen,
  Search,
  FileQuestion,
  Bookmark,
  Clock,
  Sparkles,
  FolderOpen,
  Inbox,
} from 'lucide-react'

type EmptyStateType = 
  | 'default' 
  | 'search' 
  | 'resources' 
  | 'bookmarks' 
  | 'history' 
  | 'pyqs' 
  | 'error'

interface EmptyStateProps {
  type?: EmptyStateType
  title?: string
  description?: string
  icon?: React.ReactNode
  action?: {
    label: string
    onClick: () => void
  }
  className?: string
}

const defaultContent: Record<EmptyStateType, {
  icon: React.ReactNode
  title: string
  description: string
}> = {
  default: {
    icon: <Inbox className="w-8 h-8" />,
    title: 'Nothing here yet',
    description: 'Content will appear here once available.',
  },
  search: {
    icon: <Search className="w-8 h-8" />,
    title: 'No results found',
    description: 'Try adjusting your search terms or filters to find what you\'re looking for.',
  },
  resources: {
    icon: <BookOpen className="w-8 h-8" />,
    title: 'No resources available',
    description: 'Resources will appear here once they are added to the library.',
  },
  bookmarks: {
    icon: <Bookmark className="w-8 h-8" />,
    title: 'No bookmarks yet',
    description: 'Bookmark resources to quickly access them later from this section.',
  },
  history: {
    icon: <Clock className="w-8 h-8" />,
    title: 'No recent activity',
    description: 'Your recently viewed resources will appear here.',
  },
  pyqs: {
    icon: <FileQuestion className="w-8 h-8" />,
    title: 'No PYQs found',
    description: 'Previous year questions will appear here based on your selection.',
  },
  error: {
    icon: <FolderOpen className="w-8 h-8" />,
    title: 'Something went wrong',
    description: 'We encountered an issue loading the content. Please try again.',
  },
}

export function EmptyState({
  type = 'default',
  title,
  description,
  icon,
  action,
  className,
}: EmptyStateProps) {
  const content = defaultContent[type]

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] }}
      className={cn(
        'flex flex-col items-center justify-center py-16 px-4 text-center',
        className
      )}
    >
      {/* Animated Icon */}
      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{
          type: 'spring',
          stiffness: 200,
          damping: 15,
          delay: 0.1,
        }}
        className="relative mb-6"
      >
        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center text-gray-400 shadow-inner">
          {icon || content.icon}
        </div>
        
        {/* Subtle glow effect */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1.2, opacity: 0.5 }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            repeatType: 'reverse',
            ease: 'easeInOut',
          }}
          className="absolute inset-0 rounded-2xl bg-blue-500/10 blur-xl -z-10"
        />
      </motion.div>

      {/* Title */}
      <motion.h3
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.2 }}
        className="text-lg font-semibold text-gray-900 mb-2"
      >
        {title || content.title}
      </motion.h3>

      {/* Description */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3, delay: 0.3 }}
        className="text-sm text-gray-500 max-w-sm mb-6"
      >
        {description || content.description}
      </motion.p>

      {/* Action Button */}
      <AnimatePresence>
        {action && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.3, delay: 0.4 }}
          >
            <Button
              onClick={action.onClick}
              className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-lg shadow-blue-500/20 hover:shadow-blue-500/30 transition-all"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              {action.label}
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

// Loading skeleton for cards
export function EmptyStateSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: i * 0.1 }}
          className="bg-white rounded-xl border border-gray-200 p-4"
        >
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-lg bg-gray-100 animate-pulse" />
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-gray-100 rounded animate-pulse w-3/4" />
              <div className="h-3 bg-gray-100 rounded animate-pulse w-1/2" />
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  )
}
