'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import {
  ChevronLeft,
  ChevronRight,
  Clock,
  Eye,
  Star,
  TrendingUp,
  Sparkles,
  BookOpen,
  Video,
  Headphones,
  FileText,
  Layers,
  Play,
  Bookmark,
  ArrowRight,
  Zap,
  Award,
  Flame,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import type { LibraryResource, ResourceType } from '../types'

// Types
export type CarouselType = 
  | 'most_accessed' 
  | 'new_content' 
  | 'top_rated' 
  | 'mixed_formats'
  | 'trending'
  | 'recommended'
  | 'continue_learning'
  | 'for_you'

export interface DiscoveryCarouselProps {
  type: CarouselType
  title: string
  subtitle?: string
  resources: CarouselResource[]
  onResourceClick?: (resource: CarouselResource) => void
  onBookmarkClick?: (resource: CarouselResource) => void
  autoPlay?: boolean
  autoPlayInterval?: number
  className?: string
}

export interface CarouselResource {
  id: string
  title: string
  description?: string
  type: ResourceType
  subject: string
  chapter: string
  thumbnail?: string
  duration?: number // in minutes
  viewCount?: number
  rating?: number
  isNew?: boolean
  isTrending?: boolean
  progress?: number // 0-100
  aiScore?: number // AI quality score 0-100
  tags?: string[]
  difficulty?: 'Beginner' | 'Intermediate' | 'Advanced'
  exam?: 'JEE' | 'NEET'
}

// Carousel type configurations
const CAROUSEL_CONFIG: Record<CarouselType, { 
  icon: React.ElementType
  color: string
  gradient: string
  badge: string 
}> = {
  most_accessed: {
    icon: Eye,
    color: 'blue',
    gradient: 'from-blue-500 to-cyan-500',
    badge: 'Popular',
  },
  new_content: {
    icon: Sparkles,
    color: 'green',
    gradient: 'from-green-500 to-emerald-500',
    badge: 'New',
  },
  top_rated: {
    icon: Star,
    color: 'amber',
    gradient: 'from-amber-500 to-yellow-500',
    badge: 'Top Rated',
  },
  mixed_formats: {
    icon: Layers,
    color: 'purple',
    gradient: 'from-purple-500 to-violet-500',
    badge: 'Mixed',
  },
  trending: {
    icon: TrendingUp,
    color: 'orange',
    gradient: 'from-orange-500 to-red-500',
    badge: 'Trending',
  },
  recommended: {
    icon: Sparkles,
    color: 'violet',
    gradient: 'from-violet-500 to-purple-500',
    badge: 'For You',
  },
  continue_learning: {
    icon: BookOpen,
    color: 'teal',
    gradient: 'from-teal-500 to-cyan-500',
    badge: 'Continue',
  },
  for_you: {
    icon: Zap,
    color: 'rose',
    gradient: 'from-rose-500 to-pink-500',
    badge: 'AI Pick',
  },
}

// Resource type icons
const typeIcons: Record<string, React.ElementType> = {
  Notes: FileText,
  Video: Video,
  Audio: Headphones,
  PDF: FileText,
  Interactive: Layers,
  Quiz: Zap,
  Flashcards: Layers,
  Diagram: FileText,
  PYQ: Award,
  'Concept Sheet': FileText,
  'Formula List': FileText,
}

// Difficulty color mapping
const difficultyColors: Record<string, { bg: string; text: string }> = {
  Beginner: { bg: 'bg-green-100', text: 'text-green-700' },
  Intermediate: { bg: 'bg-amber-100', text: 'text-amber-700' },
  Advanced: { bg: 'bg-red-100', text: 'text-red-700' },
}

// Resource Card Component
function DiscoveryCard({ 
  resource, 
  onClick, 
  onBookmark,
  carouselType,
}: { 
  resource: CarouselResource
  onClick?: () => void
  onBookmark?: () => void
  carouselType: CarouselType
}) {
  const [isHovered, setIsHovered] = useState(false)
  const TypeIcon = typeIcons[resource.type] || FileText
  const config = CAROUSEL_CONFIG[carouselType]
  
  // Generate thumbnail placeholder based on type
  const getPlaceholderGradient = () => {
    switch (resource.type) {
      case 'Video': return 'from-violet-400 to-purple-500'
      case 'Audio': return 'from-pink-400 to-rose-500'
      case 'Notes': return 'from-blue-400 to-cyan-500'
      case 'Interactive': return 'from-amber-400 to-orange-500'
      case 'Quiz': return 'from-green-400 to-emerald-500'
      default: return 'from-gray-400 to-slate-500'
    }
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      whileHover={{ y: -4 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      className="flex-shrink-0 w-72"
    >
      <Card
        onClick={onClick}
        className={cn(
          'group relative overflow-hidden cursor-pointer transition-all duration-300',
          'border-gray-100 rounded-2xl',
          'hover:shadow-xl hover:shadow-gray-200/50',
          isHovered && 'border-violet-200'
        )}
      >
        {/* Thumbnail Area */}
        <div className={cn(
          'relative h-36 overflow-hidden',
          'bg-gradient-to-br',
          getPlaceholderGradient()
        )}>
          {/* Placeholder Pattern */}
          <div className="absolute inset-0 opacity-20">
            <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
              <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                <path d="M 20 0 L 0 0 0 20" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-white"/>
              </pattern>
              <rect width="100%" height="100%" fill="url(#grid)" />
            </svg>
          </div>
          
          {/* Type Icon */}
          <div className="absolute inset-0 flex items-center justify-center">
            <motion.div
              initial={{ scale: 1 }}
              animate={{ scale: isHovered ? 1.1 : 1 }}
              transition={{ type: 'spring', stiffness: 300 }}
              className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center"
            >
              <TypeIcon className="h-8 w-8 text-white" />
            </motion.div>
          </div>
          
          {/* Play Button for Video/Audio */}
          {resource.type === 'Video' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: isHovered ? 1 : 0 }}
              className="absolute inset-0 flex items-center justify-center"
            >
              <div className="w-12 h-12 rounded-full bg-white/90 flex items-center justify-center shadow-lg">
                <Play className="h-5 w-5 text-violet-600 ml-0.5" />
              </div>
            </motion.div>
          )}
          
          {/* Top Badges */}
          <div className="absolute top-2 left-2 right-2 flex justify-between">
            <Badge 
              variant="secondary"
              className={cn(
                'px-2 py-0.5 text-xs font-medium border-0 shadow-sm',
                'bg-gradient-to-r text-white',
                config.gradient
              )}
            >
              {config.badge}
            </Badge>
            
            {resource.isNew && (
              <Badge className="h-5 px-1.5 text-xs bg-green-500 text-white border-0">
                NEW
              </Badge>
            )}
          </div>
          
          {/* Progress Bar */}
          {resource.progress !== undefined && resource.progress > 0 && (
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/20">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${resource.progress}%` }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
                className="h-full bg-white"
              />
            </div>
          )}
          
          {/* AI Score Badge */}
          {resource.aiScore !== undefined && resource.aiScore >= 80 && (
            <div className="absolute bottom-2 right-2">
              <Badge className="h-5 px-1.5 text-xs bg-green-500/90 text-white border-0 backdrop-blur-sm">
                <Sparkles className="h-3 w-3 mr-0.5" />
                {resource.aiScore}%
              </Badge>
            </div>
          )}
        </div>
        
        {/* Content Area */}
        <div className="p-4">
          {/* Subject & Chapter */}
          <div className="flex items-center gap-2 text-xs text-gray-500 mb-2">
            <span className="font-medium text-violet-600">{resource.subject}</span>
            <span>•</span>
            <span className="truncate">{resource.chapter}</span>
          </div>
          
          {/* Title */}
          <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-violet-700 transition-colors">
            {resource.title}
          </h3>
          
          {/* Description */}
          {resource.description && (
            <p className="text-sm text-gray-500 line-clamp-2 mb-3">
              {resource.description}
            </p>
          )}
          
          {/* Meta Info */}
          <div className="flex items-center gap-3 text-xs text-gray-400">
            {resource.duration && (
              <div className="flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" />
                {resource.duration} min
              </div>
            )}
            
            {resource.viewCount && (
              <div className="flex items-center gap-1">
                <Eye className="h-3.5 w-3.5" />
                {(resource.viewCount / 1000).toFixed(1)}k views
              </div>
            )}
            
            {resource.rating && (
              <div className="flex items-center gap-1">
                <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                {resource.rating.toFixed(1)}
              </div>
            )}
          </div>
          
          {/* Tags */}
          {resource.tags && resource.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-3">
              {resource.tags.slice(0, 3).map((tag) => (
                <Badge
                  key={tag}
                  variant="secondary"
                  className="h-5 px-1.5 text-xs bg-gray-100 text-gray-600 border-0"
                >
                  {tag}
                </Badge>
              ))}
            </div>
          )}
          
          {/* Difficulty & Exam */}
          <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
            {resource.difficulty && (
              <Badge
                variant="secondary"
                className={cn(
                  'text-xs',
                  difficultyColors[resource.difficulty]?.bg,
                  difficultyColors[resource.difficulty]?.text
                )}
              >
                {resource.difficulty}
              </Badge>
            )}
            
            {resource.exam && (
              <Badge
                variant="secondary"
                className={cn(
                  'text-xs',
                  resource.exam === 'JEE' ? 'bg-blue-100 text-blue-700' : 'bg-teal-100 text-teal-700'
                )}
              >
                {resource.exam}
              </Badge>
            )}
          </div>
        </div>
        
        {/* Hover Actions */}
        <AnimatePresence>
          {isHovered && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="absolute bottom-4 left-4 right-4 flex gap-2"
            >
              <Button
                size="sm"
                onClick={(e) => {
                  e.stopPropagation()
                  onClick?.()
                }}
                className="flex-1 bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 shadow-lg"
              >
                Open
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={(e) => {
                  e.stopPropagation()
                  onBookmark?.()
                }}
                className="px-3 border-gray-200 hover:border-violet-300 hover:bg-violet-50"
              >
                <Bookmark className="h-4 w-4" />
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </Card>
    </motion.div>
  )
}

export function DiscoveryCarousel({
  type,
  title,
  subtitle,
  resources,
  onResourceClick,
  onBookmarkClick,
  autoPlay = false,
  autoPlayInterval = 5000,
  className,
}: DiscoveryCarouselProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(true)
  const [currentIndex, setCurrentIndex] = useState(0)
  
  const config = CAROUSEL_CONFIG[type]
  const Icon = config.icon
  
  // Check scroll position
  const checkScroll = () => {
    if (containerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = containerRef.current
      setCanScrollLeft(scrollLeft > 0)
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10)
    }
  }
  
  useEffect(() => {
    checkScroll()
    const container = containerRef.current
    if (container) {
      container.addEventListener('scroll', checkScroll)
      return () => container.removeEventListener('scroll', checkScroll)
    }
  }, [resources])
  
  // Auto play
  useEffect(() => {
    if (autoPlay && resources.length > 0) {
      const interval = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % resources.length)
        if (containerRef.current) {
          const cardWidth = 288 + 16 // card width + gap
          containerRef.current.scrollTo({
            left: ((currentIndex + 1) % resources.length) * cardWidth,
            behavior: 'smooth',
          })
        }
      }, autoPlayInterval)
      return () => clearInterval(interval)
    }
  }, [autoPlay, autoPlayInterval, resources.length, currentIndex])
  
  // Scroll handlers
  const scroll = (direction: 'left' | 'right') => {
    if (containerRef.current) {
      const cardWidth = 288 + 16 // card width + gap
      const scrollAmount = direction === 'left' ? -cardWidth * 2 : cardWidth * 2
      containerRef.current.scrollBy({
        left: scrollAmount,
        behavior: 'smooth',
      })
    }
  }

  return (
    <div className={cn('relative', className)}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 400, damping: 15 }}
            className={cn(
              'w-10 h-10 rounded-xl flex items-center justify-center',
              'bg-gradient-to-br',
              config.gradient
            )}
          >
            <Icon className="h-5 w-5 text-white" />
          </motion.div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
            {subtitle && (
              <p className="text-sm text-gray-500">{subtitle}</p>
            )}
          </div>
        </div>
        
        {/* Navigation Buttons */}
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => scroll('left')}
            disabled={!canScrollLeft}
            className={cn(
              'h-8 w-8 p-0 rounded-lg border-gray-200',
              canScrollLeft ? 'hover:border-violet-300 hover:bg-violet-50' : 'opacity-50'
            )}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => scroll('right')}
            disabled={!canScrollRight}
            className={cn(
              'h-8 w-8 p-0 rounded-lg border-gray-200',
              canScrollRight ? 'hover:border-violet-300 hover:bg-violet-50' : 'opacity-50'
            )}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      {/* Cards Container */}
      <div className="relative">
        {/* Left Fade */}
        <AnimatePresence>
          {canScrollLeft && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute left-0 top-0 bottom-0 w-16 bg-gradient-to-r from-white to-transparent z-10 pointer-events-none"
            />
          )}
        </AnimatePresence>
        
        {/* Right Fade */}
        <AnimatePresence>
          {canScrollRight && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-white to-transparent z-10 pointer-events-none"
            />
          )}
        </AnimatePresence>
        
        {/* Scrollable Container */}
        <div
          ref={containerRef}
          className="flex gap-4 overflow-x-auto scrollbar-hide pb-2 -mx-4 px-4"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {resources.map((resource, index) => (
            <DiscoveryCard
              key={resource.id}
              resource={resource}
              carouselType={type}
              onClick={() => onResourceClick?.(resource)}
              onBookmark={() => onBookmarkClick?.(resource)}
            />
          ))}
        </div>
      </div>
      
      {/* View All Link */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="mt-4 flex justify-center"
      >
        <Button
          variant="ghost"
          size="sm"
          className="text-violet-600 hover:text-violet-700 hover:bg-violet-50"
        >
          View All
          <ArrowRight className="h-4 w-4 ml-1" />
        </Button>
      </motion.div>
    </div>
  )
}

export default DiscoveryCarousel
