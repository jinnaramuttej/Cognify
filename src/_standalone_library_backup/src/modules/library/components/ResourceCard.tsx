'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import {
  Bookmark,
  BookmarkCheck,
  Eye,
  FileText,
  Flame,
  Sparkles,
  Clock,
  Calendar,
} from 'lucide-react'
import type { LibraryResource } from '../types'

interface ResourceCardProps {
  resource: LibraryResource
  onView: () => void
  onBookmark: () => void
  onAskCogni: () => void
  viewMode?: 'grid' | 'list'
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

export function ResourceCard({
  resource,
  onView,
  onBookmark,
  onAskCogni,
  viewMode = 'grid',
}: ResourceCardProps) {
  const [isHovered, setIsHovered] = useState(false)
  const [imageError, setImageError] = useState(false)

  if (viewMode === 'list') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ 
          y: -2,
          boxShadow: '0 8px 24px -8px rgba(37, 99, 235, 0.15)',
        }}
        transition={{ duration: 0.2 }}
        onHoverStart={() => setIsHovered(true)}
        onHoverEnd={() => setIsHovered(false)}
      >
        <Card
          className="group relative bg-white border-gray-100 hover:border-blue-300 transition-colors duration-200 overflow-hidden cursor-pointer"
          onClick={onView}
        >
          <div className="flex items-center gap-4 p-4">
            {/* Thumbnail */}
            <motion.div 
              className="w-16 h-16 flex-shrink-0 rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 overflow-hidden flex items-center justify-center"
              animate={{ scale: isHovered ? 1.05 : 1 }}
              transition={{ duration: 0.2 }}
            >
              {resource.thumbnailUrl && !imageError ? (
                <img
                  src={resource.thumbnailUrl}
                  alt={resource.title}
                  className="w-full h-full object-cover"
                  onError={() => setImageError(true)}
                />
              ) : (
                <FileText className="h-6 w-6 text-gray-300" />
              )}
            </motion.div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start gap-2">
                <h3 className="font-medium text-gray-900 truncate group-hover:text-blue-600 transition-colors">
                  {resource.title}
                </h3>
                {resource.isTrending && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 300 }}
                  >
                    <Flame className="h-4 w-4 text-orange-500 flex-shrink-0" />
                  </motion.div>
                )}
              </div>
              
              <div className="flex flex-wrap items-center gap-2 mt-1">
                <span className="text-sm text-gray-500">{resource.subject}</span>
                <span className="text-gray-300">•</span>
                <span className="text-sm text-gray-500">{resource.chapter}</span>
                {resource.year && (
                  <>
                    <span className="text-gray-300">•</span>
                    <span className="text-sm text-gray-500">{resource.year}</span>
                  </>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-1.5 mt-2">
                <Badge variant="outline" className="text-xs bg-gray-50 border-gray-200">
                  Class {resource.grade}
                </Badge>
                <Badge variant="outline" className="text-xs bg-gray-50 border-gray-200">
                  {resource.exam}
                </Badge>
                <Badge variant="outline" className={`text-xs ${difficultyColors[resource.difficulty]}`}>
                  {resource.difficulty}
                </Badge>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => { e.stopPropagation(); onAskCogni(); }}
                  className="h-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                >
                  <Sparkles className="h-4 w-4 mr-1" />
                  Ask Cogni
                </Button>
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => { e.stopPropagation(); onBookmark(); }}
                  className="h-8 w-8 p-0 hover:bg-gray-100"
                >
                  {resource.isBookmarked ? (
                    <BookmarkCheck className="h-4 w-4 text-blue-600" />
                  ) : (
                    <Bookmark className="h-4 w-4 text-gray-400" />
                  )}
                </Button>
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button
                  variant="default"
                  size="sm"
                  onClick={onView}
                  className="h-8 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 shadow-md shadow-blue-500/20"
                >
                  <Eye className="h-4 w-4 mr-1" />
                  View
                </Button>
              </motion.div>
            </div>
          </div>
        </Card>
      </motion.div>
    )
  }

  // Grid view
  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      whileHover={{ 
        y: -4,
        boxShadow: '0 12px 28px -8px rgba(37, 99, 235, 0.15)',
      }}
      transition={{ duration: 0.25, ease: [0.25, 0.46, 0.45, 0.94] }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
    >
      <Card
        className="group relative bg-white border-gray-100 hover:border-blue-300 transition-all duration-200 overflow-hidden cursor-pointer"
        onClick={onView}
      >
        {/* Thumbnail Area */}
        <div className="relative aspect-[4/3] bg-gradient-to-br from-gray-50 to-gray-100 overflow-hidden">
          {resource.thumbnailUrl && !imageError ? (
            <motion.img
              src={resource.thumbnailUrl}
              alt={resource.title}
              className="w-full h-full object-cover"
              animate={{ scale: isHovered ? 1.05 : 1 }}
              transition={{ duration: 0.3 }}
              onError={() => setImageError(true)}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <motion.div
                animate={{ 
                  scale: isHovered ? 1.1 : 1,
                  rotate: isHovered ? 5 : 0 
                }}
                transition={{ duration: 0.3 }}
              >
                <FileText className="h-12 w-12 text-gray-300" />
              </motion.div>
            </div>
          )}

          {/* Trending Badge */}
          {resource.isTrending && (
            <motion.div
              initial={{ opacity: 0, scale: 0.5, x: -10 }}
              animate={{ opacity: 1, scale: 1, x: 0 }}
              transition={{ delay: 0.1, type: 'spring', stiffness: 300 }}
              className="absolute top-3 left-3"
            >
              <Badge className="bg-gradient-to-r from-orange-500 to-red-500 text-white border-0 shadow-lg">
                <Flame className="h-3 w-3 mr-1" />
                Trending
              </Badge>
            </motion.div>
          )}

          {/* Resource Type Badge */}
          <motion.div
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.15 }}
            className="absolute top-3 right-3"
          >
            <Badge variant="outline" className={`text-xs backdrop-blur-sm bg-white/80 ${resourceTypeColors[resource.resourceType]}`}>
              {resource.resourceType}
            </Badge>
          </motion.div>

          {/* Year Badge for PYQs */}
          {resource.year && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="absolute bottom-3 left-3"
            >
              <Badge className="bg-gradient-to-r from-blue-500 to-blue-600 text-white border-0 text-xs shadow-lg">
                {resource.year}
              </Badge>
            </motion.div>
          )}

          {/* Hover Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: isHovered ? 1 : 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/30 to-transparent flex items-end justify-center gap-2 pb-4"
          >
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                variant="secondary"
                size="sm"
                onClick={(e) => { e.stopPropagation(); onView(); }}
                className="bg-white text-gray-900 hover:bg-gray-50 shadow-lg"
              >
                <Eye className="h-4 w-4 mr-1" />
                View
              </Button>
            </motion.div>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                variant="secondary"
                size="sm"
                onClick={(e) => { e.stopPropagation(); onBookmark(); }}
                className="bg-white text-gray-900 hover:bg-gray-50 shadow-lg"
              >
                {resource.isBookmarked ? (
                  <BookmarkCheck className="h-4 w-4 text-blue-600" />
                ) : (
                  <Bookmark className="h-4 w-4" />
                )}
              </Button>
            </motion.div>
          </motion.div>
        </div>

        {/* Content Area */}
        <div className="p-4">
          {/* Title */}
          <h3 className="font-medium text-gray-900 line-clamp-2 group-hover:text-blue-600 transition-colors">
            {resource.title}
          </h3>

          {/* Subject & Chapter */}
          <div className="mt-1 text-sm text-gray-500 truncate">
            {resource.subject} • {resource.chapter}
          </div>

          {/* Tags */}
          <div className="flex flex-wrap items-center gap-1.5 mt-3">
            <Badge variant="outline" className="text-xs bg-gray-50 border-gray-200">
              Class {resource.grade}
            </Badge>
            <Badge variant="outline" className={`text-xs ${difficultyColors[resource.difficulty]}`}>
              {resource.difficulty}
            </Badge>
            <Badge variant="outline" className="text-xs bg-gray-50 border-gray-200">
              {resource.exam}
            </Badge>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
            <div className="flex items-center gap-3 text-xs text-gray-400">
              <div className="flex items-center gap-1">
                <Eye className="h-3 w-3" />
                <span>{resource.viewCount}</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                <span>{resource.readingTime}m</span>
              </div>
            </div>
            
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => { e.stopPropagation(); onAskCogni(); }}
                className="h-7 px-2 text-xs text-blue-600 hover:text-blue-700 hover:bg-blue-50"
              >
                <Sparkles className="h-3 w-3 mr-1" />
                Ask Cogni
              </Button>
            </motion.div>
          </div>
        </div>
      </Card>
    </motion.div>
  )
}
