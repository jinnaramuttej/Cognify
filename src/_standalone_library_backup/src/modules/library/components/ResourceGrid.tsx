'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { ResourceCard } from './ResourceCard'
import { FileQuestion, Search, BookOpen, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { LibraryResource, ViewMode } from '../types'

interface ResourceGridProps {
  resources: LibraryResource[]
  isLoading: boolean
  viewMode: ViewMode
  hasFilters: boolean
  onResourceView: (resource: LibraryResource) => void
  onResourceBookmark: (resourceId: string) => void
  onAskCogni: (resource: LibraryResource) => void
  onClearFilters: () => void
}

// Skeleton component for loading state
function ResourceSkeleton({ viewMode }: { viewMode: ViewMode }) {
  if (viewMode === 'list') {
    return (
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            className="flex items-center gap-4 p-4 bg-white border border-gray-100 rounded-xl"
          >
            <div className="w-16 h-16 rounded-xl bg-gray-100 animate-pulse" />
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-gray-100 rounded animate-pulse w-3/4" />
              <div className="h-3 bg-gray-100 rounded animate-pulse w-1/2" />
              <div className="flex gap-2">
                <div className="h-5 w-16 bg-gray-100 rounded animate-pulse" />
                <div className="h-5 w-12 bg-gray-100 rounded animate-pulse" />
              </div>
            </div>
            <div className="h-8 w-20 bg-gray-100 rounded animate-pulse" />
          </motion.div>
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {Array.from({ length: 9 }).map((_, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.05 }}
          className="bg-white border border-gray-100 rounded-xl overflow-hidden"
        >
          <div className="aspect-[4/3] bg-gray-100 animate-pulse" />
          <div className="p-4 space-y-3">
            <div className="h-4 bg-gray-100 rounded animate-pulse w-3/4" />
            <div className="h-3 bg-gray-100 rounded animate-pulse w-1/2" />
            <div className="flex gap-2">
              <div className="h-5 w-16 bg-gray-100 rounded animate-pulse" />
              <div className="h-5 w-20 bg-gray-100 rounded animate-pulse" />
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  )
}

// Enhanced empty state
function EmptyState({ hasFilters, onClearFilters }: { hasFilters: boolean; onClearFilters: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      className="flex flex-col items-center justify-center py-20 px-4"
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
          {hasFilters ? (
            <Search className="h-8 w-8" />
          ) : (
            <BookOpen className="h-8 w-8" />
          )}
        </div>
        
        {/* Subtle glow */}
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          className="absolute inset-0 rounded-2xl bg-blue-500/10 blur-xl -z-10"
        />
      </motion.div>

      {/* Title */}
      <motion.h3
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="text-lg font-semibold text-gray-900 mb-2"
      >
        {hasFilters ? 'No resources found' : 'Start exploring'}
      </motion.h3>

      {/* Description */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="text-sm text-gray-500 text-center max-w-sm mb-6"
      >
        {hasFilters
          ? 'Try adjusting your filters or search terms to find what you\'re looking for.'
          : 'Select a subject or search for a concept to begin your learning journey.'}
      </motion.p>

      {/* Action Button */}
      {hasFilters && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Button
            variant="outline"
            onClick={onClearFilters}
            className="border-blue-200 text-blue-600 hover:bg-blue-50 hover:border-blue-300"
          >
            <Sparkles className="h-4 w-4 mr-2" />
            Clear all filters
          </Button>
        </motion.div>
      )}
    </motion.div>
  )
}

export function ResourceGrid({
  resources,
  isLoading,
  viewMode,
  hasFilters,
  onResourceView,
  onResourceBookmark,
  onAskCogni,
  onClearFilters,
}: ResourceGridProps) {
  // Loading state with animated skeletons
  if (isLoading) {
    return <ResourceSkeleton viewMode={viewMode} />
  }

  // Empty state with animations
  if (resources.length === 0) {
    return <EmptyState hasFilters={hasFilters} onClearFilters={onClearFilters} />
  }

  // List view
  if (viewMode === 'list') {
    return (
      <motion.div
        initial="hidden"
        animate="visible"
        variants={{
          hidden: { opacity: 0 },
          visible: {
            opacity: 1,
            transition: { staggerChildren: 0.05 },
          },
        }}
        className="space-y-3"
      >
        {resources.map((resource) => (
          <motion.div
            key={resource.id}
            variants={{
              hidden: { opacity: 0, y: 12 },
              visible: { opacity: 1, y: 0 },
            }}
          >
            <ResourceCard
              resource={resource}
              viewMode="list"
              onView={() => onResourceView(resource)}
              onBookmark={() => onResourceBookmark(resource.id)}
              onAskCogni={() => onAskCogni(resource)}
            />
          </motion.div>
        ))}
      </motion.div>
    )
  }

  // Grid view
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={{
        hidden: { opacity: 0 },
        visible: {
          opacity: 1,
          transition: { staggerChildren: 0.05 },
        },
      }}
      className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4"
    >
      {resources.map((resource) => (
        <motion.div
          key={resource.id}
          variants={{
            hidden: { opacity: 0, y: 20, scale: 0.95 },
            visible: { opacity: 1, y: 0, scale: 1 },
          }}
        >
          <ResourceCard
            resource={resource}
            viewMode="grid"
            onView={() => onResourceView(resource)}
            onBookmark={() => onResourceBookmark(resource.id)}
            onAskCogni={() => onAskCogni(resource)}
          />
        </motion.div>
      ))}
    </motion.div>
  )
}
