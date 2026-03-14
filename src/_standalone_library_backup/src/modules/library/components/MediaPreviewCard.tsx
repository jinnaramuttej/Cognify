'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence, useMotionValue, useTransform } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  Bookmark,
  BookmarkCheck,
  Eye,
  Clock,
  FileText,
  Video,
  Headphones,
  FileImage,
  Layers,
  Sparkles,
  RotateCcw,
  ChevronRight,
  Zap,
  Flame,
  TrendingUp,
  Star,
  BookOpen,
  Target,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react'
import { cn } from '@/lib/utils'

// Types
export interface MediaResource {
  id: string
  title: string
  description: string
  subject: string
  chapter: string
  grade: string
  exam: string
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced'
  resourceType: 'Video' | 'Audio' | 'PDF' | 'Notes' | 'Interactive' | 'Concept Sheet' | 'Diagram'
  mediaType: 'video' | 'audio' | 'pdf' | 'text' | 'interactive'
  thumbnailUrl?: string
  duration?: number // seconds
  readingTime?: number // minutes
  viewCount: number
  isBookmarked: boolean
  isTrending: boolean
  progress?: number // 0-100
  lastViewedAt?: Date
  weightage?: number // exam weightage percentage
  hasQuiz?: boolean
  hasFlashcards?: boolean
  transcript?: boolean
  chapters?: number
}

interface MediaPreviewCardProps {
  resource: MediaResource
  onView: () => void
  onBookmark: () => void
  onAskCogni: () => void
  onAddToRevision: () => void
  onQuickPlay?: () => void
  variant?: 'default' | 'compact' | 'detailed'
}

// Resource type configurations
const resourceTypeConfig = {
  Video: {
    icon: Video,
    color: 'from-red-500 to-rose-600',
    bg: 'bg-red-50',
    text: 'text-red-600',
    border: 'border-red-200',
    glow: 'shadow-red-500/20',
  },
  Audio: {
    icon: Headphones,
    color: 'from-purple-500 to-violet-600',
    bg: 'bg-purple-50',
    text: 'text-purple-600',
    border: 'border-purple-200',
    glow: 'shadow-purple-500/20',
  },
  PDF: {
    icon: FileText,
    color: 'from-orange-500 to-amber-600',
    bg: 'bg-orange-50',
    text: 'text-orange-600',
    border: 'border-orange-200',
    glow: 'shadow-orange-500/20',
  },
  Notes: {
    icon: BookOpen,
    color: 'from-blue-500 to-blue-600',
    bg: 'bg-blue-50',
    text: 'text-blue-600',
    border: 'border-blue-200',
    glow: 'shadow-blue-500/20',
  },
  Interactive: {
    icon: Layers,
    color: 'from-emerald-500 to-teal-600',
    bg: 'bg-emerald-50',
    text: 'text-emerald-600',
    border: 'border-emerald-200',
    glow: 'shadow-emerald-500/20',
  },
  'Concept Sheet': {
    icon: Target,
    color: 'from-cyan-500 to-sky-600',
    bg: 'bg-cyan-50',
    text: 'text-cyan-600',
    border: 'border-cyan-200',
    glow: 'shadow-cyan-500/20',
  },
  Diagram: {
    icon: FileImage,
    color: 'from-pink-500 to-rose-600',
    bg: 'bg-pink-50',
    text: 'text-pink-600',
    border: 'border-pink-200',
    glow: 'shadow-pink-500/20',
  },
}

const difficultyConfig = {
  Beginner: { color: 'bg-emerald-100 text-emerald-700 border-emerald-200', icon: Star },
  Intermediate: { color: 'bg-amber-100 text-amber-700 border-amber-200', icon: Zap },
  Advanced: { color: 'bg-red-100 text-red-700 border-red-200', icon: Flame },
}

// Format duration
function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600)
  const mins = Math.floor((seconds % 3600) / 60)
  const secs = seconds % 60
  
  if (hours > 0) {
    return `${hours}h ${mins}m`
  }
  if (mins > 0) {
    return `${mins}m ${secs}s`
  }
  return `${secs}s`
}

// Format time ago
function formatTimeAgo(date: Date): string {
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMins / 60)
  const diffDays = Math.floor(diffHours / 24)
  
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays < 7) return `${diffDays}d ago`
  return `${Math.floor(diffDays / 7)}w ago`
}

export function MediaPreviewCard({
  resource,
  onView,
  onBookmark,
  onAskCogni,
  onAddToRevision,
  onQuickPlay,
  variant = 'default',
}: MediaPreviewCardProps) {
  const [isHovered, setIsHovered] = useState(false)
  const [showQuickActions, setShowQuickActions] = useState(false)
  const [imageError, setImageError] = useState(false)
  const cardRef = useRef<HTMLDivElement>(null)
  
  // Mouse position for spotlight effect
  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)
  
  const spotlightX = useTransform(mouseX, [0, 300], [0, 100])
  const spotlightY = useTransform(mouseY, [0, 200], [0, 100])
  
  const typeConfig = resourceTypeConfig[resource.resourceType] || resourceTypeConfig.Notes
  const diffConfig = difficultyConfig[resource.difficulty]
  const TypeIcon = typeConfig.icon
  
  // Handle mouse move for spotlight
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!cardRef.current) return
    const rect = cardRef.current.getBoundingClientRect()
    mouseX.set(e.clientX - rect.left)
    mouseY.set(e.clientY - rect.top)
  }
  
  // Get duration display
  const durationDisplay = resource.duration
    ? formatDuration(resource.duration)
    : resource.readingTime
    ? `${resource.readingTime} min read`
    : '5 min read'

  return (
    <motion.div
      ref={cardRef}
      initial={{ opacity: 0, y: 20, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      whileHover={{ 
        y: -6,
        transition: { duration: 0.2 },
      }}
      transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      onMouseMove={handleMouseMove}
      className="relative"
    >
      <Card
        className={cn(
          'group relative overflow-hidden cursor-pointer transition-all duration-300',
          'bg-white border-gray-100',
          isHovered && 'border-blue-300 shadow-xl shadow-blue-500/10',
        )}
        onClick={onView}
      >
        {/* Spotlight Effect */}
        <motion.div
          className="pointer-events-none absolute inset-0 z-10 opacity-0 transition-opacity duration-300"
          style={{
            background: `radial-gradient(400px circle at ${spotlightX}% ${spotlightY}%, rgba(37, 99, 235, 0.06), transparent 40%)`,
            opacity: isHovered ? 1 : 0,
          }}
        />
        
        {/* Thumbnail Area */}
        <div className="relative aspect-video bg-gradient-to-br from-gray-50 to-gray-100 overflow-hidden">
          {/* Thumbnail Image or Placeholder */}
          {resource.thumbnailUrl && !imageError ? (
            <motion.img
              src={resource.thumbnailUrl}
              alt={resource.title}
              className="w-full h-full object-cover"
              animate={{ scale: isHovered ? 1.08 : 1 }}
              transition={{ duration: 0.4, ease: 'easeOut' }}
              onError={() => setImageError(true)}
            />
          ) : (
            <div className={cn(
              'w-full h-full flex items-center justify-center bg-gradient-to-br',
              typeConfig.color,
              'opacity-20'
            )}>
              <TypeIcon className="h-16 w-16 text-white/40" />
            </div>
          )}
          
          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
          
          {/* Top Badges */}
          <div className="absolute top-3 left-3 right-3 flex items-start justify-between gap-2">
            {/* Trending Badge */}
            {resource.isTrending && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8, x: -10 }}
                animate={{ opacity: 1, scale: 1, x: 0 }}
                transition={{ delay: 0.1, type: 'spring', stiffness: 300 }}
              >
                <Badge className="bg-gradient-to-r from-orange-500 to-red-500 text-white border-0 shadow-lg gap-1">
                  <TrendingUp className="h-3 w-3" />
                  Trending
                </Badge>
              </motion.div>
            )}
            
            {/* Resource Type Badge */}
            <motion.div
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.15 }}
              className="ml-auto"
            >
              <Badge className={cn(
                'backdrop-blur-md bg-white/90 border-0 gap-1 shadow-lg',
                typeConfig.text
              )}>
                <TypeIcon className="h-3 w-3" />
                {resource.resourceType}
              </Badge>
            </motion.div>
          </div>
          
          {/* Duration Badge */}
          <div className="absolute bottom-3 left-3">
            <Badge className="bg-black/60 backdrop-blur-sm text-white border-0 text-xs">
              <Clock className="h-3 w-3 mr-1" />
              {durationDisplay}
            </Badge>
          </div>
          
          {/* Progress Indicator */}
          {resource.progress && resource.progress > 0 && (
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${resource.progress}%` }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="h-full bg-blue-500"
              />
            </div>
          )}
          
          {/* Resume Indicator */}
          {resource.progress && resource.progress > 0 && resource.progress < 100 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: isHovered ? 1 : 0, y: isHovered ? 0 : 10 }}
              className="absolute bottom-12 left-3"
            >
              <Badge className="bg-blue-500 text-white border-0 shadow-lg gap-1">
                <RotateCcw className="h-3 w-3" />
                Resume from {Math.round(resource.progress)}%
              </Badge>
            </motion.div>
          )}
          
          {/* Hover Play Button for Video/Audio */}
          <AnimatePresence>
            {(resource.mediaType === 'video' || resource.mediaType === 'audio') && isHovered && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="absolute inset-0 flex items-center justify-center"
              >
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={(e) => {
                    e.stopPropagation()
                    onQuickPlay?.()
                  }}
                  className={cn(
                    'w-16 h-16 rounded-full flex items-center justify-center',
                    'bg-white/90 backdrop-blur-md shadow-xl',
                    'transition-transform'
                  )}
                >
                  <Play className={cn('h-7 w-7 ml-1', typeConfig.text)} fill="currentColor" />
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>
          
          {/* Quick Actions Toolbar */}
          <AnimatePresence>
            {isHovered && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                className="absolute bottom-3 right-3 flex items-center gap-1.5"
              >
                <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={(e) => {
                      e.stopPropagation()
                      onBookmark()
                    }}
                    className="h-8 w-8 p-0 bg-white/90 backdrop-blur-sm hover:bg-white"
                  >
                    {resource.isBookmarked ? (
                      <BookmarkCheck className="h-4 w-4 text-blue-600" />
                    ) : (
                      <Bookmark className="h-4 w-4" />
                    )}
                  </Button>
                </motion.div>
                
                <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={(e) => {
                      e.stopPropagation()
                      onAddToRevision()
                    }}
                    className="h-8 w-8 p-0 bg-white/90 backdrop-blur-sm hover:bg-white"
                  >
                    <RotateCcw className="h-4 w-4" />
                  </Button>
                </motion.div>
                
                <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={(e) => {
                      e.stopPropagation()
                      onAskCogni()
                    }}
                    className="h-8 w-8 p-0 bg-white/90 backdrop-blur-sm hover:bg-white"
                  >
                    <Sparkles className="h-4 w-4 text-blue-600" />
                  </Button>
                </motion.div>
                
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Button
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation()
                      onView()
                    }}
                    className="h-8 bg-white text-gray-900 hover:bg-gray-50 shadow-lg"
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    Open
                  </Button>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
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
          
          {/* Meta Tags */}
          <div className="flex flex-wrap items-center gap-1.5 mt-3">
            <Badge variant="outline" className="text-xs bg-gray-50 border-gray-200">
              Class {resource.grade}
            </Badge>
            <Badge variant="outline" className={cn('text-xs', diffConfig.color)}>
              <diffConfig.icon className="h-3 w-3 mr-0.5" />
              {resource.difficulty}
            </Badge>
            <Badge variant="outline" className="text-xs bg-gray-50 border-gray-200">
              {resource.exam}
            </Badge>
            
            {/* Weightage Badge */}
            {resource.weightage && resource.weightage > 0 && (
              <Badge className="text-xs bg-blue-50 text-blue-700 border-blue-200 border">
                <Target className="h-3 w-3 mr-0.5" />
                {resource.weightage}% weightage
              </Badge>
            )}
          </div>
          
          {/* Feature Indicators */}
          <div className="flex items-center gap-3 mt-3 pt-3 border-t border-gray-100">
            {/* View Count */}
            <div className="flex items-center gap-1 text-xs text-gray-400">
              <Eye className="h-3.5 w-3.5" />
              <span>{resource.viewCount.toLocaleString()}</span>
            </div>
            
            {/* Duration */}
            <div className="flex items-center gap-1 text-xs text-gray-400">
              <Clock className="h-3.5 w-3.5" />
              <span>{durationDisplay}</span>
            </div>
            
            {/* Has Quiz */}
            {resource.hasQuiz && (
              <div className="flex items-center gap-1 text-xs text-emerald-600">
                <CheckCircle2 className="h-3.5 w-3.5" />
                <span>Quiz</span>
              </div>
            )}
            
            {/* Has Flashcards */}
            {resource.hasFlashcards && (
              <div className="flex items-center gap-1 text-xs text-purple-600">
                <Layers className="h-3.5 w-3.5" />
                <span>Flashcards</span>
              </div>
            )}
            
            {/* Has Transcript */}
            {resource.transcript && (
              <div className="flex items-center gap-1 text-xs text-blue-600">
                <FileText className="h-3.5 w-3.5" />
                <span>Transcript</span>
              </div>
            )}
          </div>
          
          {/* Last Viewed */}
          {resource.lastViewedAt && (
            <div className="mt-2 text-xs text-gray-400 flex items-center gap-1">
              <Clock className="h-3 w-3" />
              Last viewed {formatTimeAgo(resource.lastViewedAt)}
            </div>
          )}
        </div>
      </Card>
    </motion.div>
  )
}

export default MediaPreviewCard
