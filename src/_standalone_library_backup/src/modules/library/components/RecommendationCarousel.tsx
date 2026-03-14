'use client'

import { useRef } from 'react'
import { motion } from 'framer-motion'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Brain,
  Clock,
  TrendingUp,
  Target,
  Zap,
  Flame,
} from 'lucide-react'
import { cn } from '@/lib/utils'

// Types
export interface RecommendationItem {
  id: string
  title: string
  subject: string
  chapter: string
  type: 'weak_area' | 'trending' | 'revision' | 'new' | 'ai_suggested'
  reason: string
  estimatedMinutes: number
  priority: 'high' | 'medium' | 'low'
  progress?: number
}

interface RecommendationCarouselProps {
  title?: string
  subtitle?: string
  items?: RecommendationItem[]
  onItemClick?: (itemId: string) => void
  className?: string
}

const typeConfig = {
  weak_area: {
    color: 'from-red-500 to-rose-500',
    bg: 'bg-red-50 border-red-200',
    icon: Target,
    label: 'Weak Area',
  },
  trending: {
    color: 'from-orange-500 to-amber-500',
    bg: 'bg-orange-50 border-orange-200',
    icon: Flame,
    label: 'Trending',
  },
  revision: {
    color: 'from-purple-500 to-violet-500',
    bg: 'bg-purple-50 border-purple-200',
    icon: Clock,
    label: 'Revision',
  },
  new: {
    color: 'from-emerald-500 to-teal-500',
    bg: 'bg-emerald-50 border-emerald-200',
    icon: Zap,
    label: 'New',
  },
  ai_suggested: {
    color: 'from-blue-500 to-indigo-500',
    bg: 'bg-blue-50 border-blue-200',
    icon: Brain,
    label: 'AI Suggested',
  },
}

export function RecommendationCarousel({
  title = 'Recommended for You',
  subtitle = 'Personalized based on your progress',
  items = [],
  onItemClick,
  className,
}: RecommendationCarouselProps) {
  const scrollRef = useRef<HTMLDivElement>(null)
  
  // Mock data for demo
  const mockItems: RecommendationItem[] = items.length > 0 ? items : [
    {
      id: '1',
      title: 'Electrostatics: Coulomb\'s Law Deep Dive',
      subject: 'Physics',
      chapter: 'Electrostatics',
      type: 'weak_area',
      reason: 'Your accuracy is 45% in this topic',
      estimatedMinutes: 30,
      priority: 'high',
      progress: 15,
    },
    {
      id: '2',
      title: 'JEE Main 2024: Predicted Questions',
      subject: 'All Subjects',
      chapter: 'Mixed',
      type: 'trending',
      reason: 'Highly viewed by similar students',
      estimatedMinutes: 45,
      priority: 'medium',
    },
    {
      id: '3',
      title: 'Organic Chemistry: Reaction Mechanisms',
      subject: 'Chemistry',
      chapter: 'Organic Chemistry',
      type: 'revision',
      reason: 'Time for spaced repetition',
      estimatedMinutes: 20,
      priority: 'high',
      progress: 60,
    },
    {
      id: '4',
      title: 'Integration: Advanced Problems',
      subject: 'Mathematics',
      chapter: 'Calculus',
      type: 'ai_suggested',
      reason: 'Based on your test performance',
      estimatedMinutes: 35,
      priority: 'medium',
    },
    {
      id: '5',
      title: 'Modern Physics: Quick Notes',
      subject: 'Physics',
      chapter: 'Modern Physics',
      type: 'new',
      reason: 'Newly added to your syllabus',
      estimatedMinutes: 25,
      priority: 'low',
    },
    {
      id: '6',
      title: 'Thermodynamics: Formula Sheet',
      subject: 'Physics',
      chapter: 'Thermodynamics',
      type: 'weak_area',
      reason: 'Improve your weak area',
      estimatedMinutes: 15,
      priority: 'high',
      progress: 30,
    },
  ]
  
  // Scroll handlers
  const scroll = (direction: 'left' | 'right') => {
    if (!scrollRef.current) return
    const scrollAmount = 320
    scrollRef.current.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth',
    })
  }
  
  return (
    <div className={cn('relative', className)}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-semibold text-gray-900 flex items-center gap-2">
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <Sparkles className="h-5 w-5 text-blue-500" />
            </motion.div>
            {title}
          </h3>
          <p className="text-sm text-gray-500 mt-0.5">{subtitle}</p>
        </div>
        
        {/* Navigation */}
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => scroll('left')}
            className="h-8 w-8 rounded-full"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => scroll('right')}
            className="h-8 w-8 rounded-full"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      {/* Carousel */}
      <div
        ref={scrollRef}
        className="flex gap-4 overflow-x-auto scrollbar-hide pb-2 -mx-4 px-4"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {mockItems.map((item, index) => {
          const config = typeConfig[item.type]
          const Icon = config.icon
          
          return (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05 }}
              whileHover={{ y: -4 }}
              onClick={() => onItemClick?.(item.id)}
              className="flex-shrink-0 w-[300px] cursor-pointer"
            >
              <Card className="h-full overflow-hidden border-gray-100 hover:border-blue-200 hover:shadow-lg transition-all duration-300">
                {/* Gradient Top */}
                <div className={cn('h-2 bg-gradient-to-r', config.color)} />
                
                <div className="p-4">
                  {/* Type Badge */}
                  <div className="flex items-center justify-between mb-3">
                    <Badge className={cn('gap-1', config.bg)}>
                      <Icon className="h-3 w-3" />
                      {config.label}
                    </Badge>
                    <div className="flex items-center gap-1 text-xs text-gray-500">
                      <Clock className="h-3 w-3" />
                      {item.estimatedMinutes}m
                    </div>
                  </div>
                  
                  {/* Title */}
                  <h4 className="font-medium text-gray-900 line-clamp-2 mb-1">
                    {item.title}
                  </h4>
                  
                  {/* Subject & Chapter */}
                  <p className="text-sm text-gray-500">
                    {item.subject} • {item.chapter}
                  </p>
                  
                  {/* Reason */}
                  <p className="text-xs text-gray-400 mt-2 line-clamp-1">
                    {item.reason}
                  </p>
                  
                  {/* Progress */}
                  {item.progress !== undefined && (
                    <div className="mt-3">
                      <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                        <span>Progress</span>
                        <span>{item.progress}%</span>
                      </div>
                      <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${item.progress}%` }}
                          transition={{ duration: 0.5, delay: 0.2 }}
                          className={cn('h-full rounded-full bg-gradient-to-r', config.color)}
                        />
                      </div>
                    </div>
                  )}
                  
                  {/* Priority Indicator */}
                  <div className="mt-3 flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      <div
                        className={cn(
                          'w-2 h-2 rounded-full',
                          item.priority === 'high' ? 'bg-red-500' :
                          item.priority === 'medium' ? 'bg-amber-500' : 'bg-gray-400',
                        )}
                      />
                      <span className="text-xs text-gray-400 capitalize">{item.priority} priority</span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                    >
                      Start
                    </Button>
                  </div>
                </div>
              </Card>
            </motion.div>
          )
        })}
      </div>
      
      {/* Fade edges */}
      <div className="absolute left-0 top-12 bottom-0 w-8 bg-gradient-to-r from-white to-transparent pointer-events-none" />
      <div className="absolute right-0 top-12 bottom-0 w-8 bg-gradient-to-l from-white to-transparent pointer-events-none" />
    </div>
  )
}

export default RecommendationCarousel
