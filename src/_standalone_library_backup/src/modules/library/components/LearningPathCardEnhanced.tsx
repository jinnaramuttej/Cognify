'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import {
  ChevronRight,
  Clock,
  Target,
  Trophy,
  Star,
  Lock,
  CheckCircle2,
  Zap,
  Flame,
  BookOpen,
  ArrowRight,
  Play,
  Medal,
  Sparkles,
} from 'lucide-react'
import { cn } from '@/lib/utils'

// Types
export interface PathStage {
  id: string
  name: string
  description?: string
  order: number
  estimatedMinutes: number
  isCompleted: boolean
  isLocked: boolean
  resourceCount: number
  badgeIcon?: string
}

export interface LearningPathData {
  id: string
  name: string
  description?: string
  subject: string
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced'
  totalStages: number
  estimatedHours: number
  progress: number
  currentStage: number
  isEnrolled: boolean
  stages?: PathStage[]
  prerequisites?: { id: string; name: string; isCompleted: boolean }[]
  earnedBadges?: { id: string; name: string; icon: string; earnedAt: Date }[]
}

interface LearningPathCardEnhancedProps {
  path: LearningPathData
  onClick: () => void
  onEnroll?: () => void
  variant?: 'default' | 'compact' | 'detailed'
  className?: string
}

const difficultyConfig = {
  Beginner: { 
    color: 'from-emerald-500 to-teal-500', 
    bg: 'bg-emerald-50', 
    text: 'text-emerald-700',
    border: 'border-emerald-200',
    icon: Star,
  },
  Intermediate: { 
    color: 'from-amber-500 to-orange-500', 
    bg: 'bg-amber-50', 
    text: 'text-amber-700',
    border: 'border-amber-200',
    icon: Zap,
  },
  Advanced: { 
    color: 'from-red-500 to-rose-500', 
    bg: 'bg-red-50', 
    text: 'text-red-700',
    border: 'border-red-200',
    icon: Flame,
  },
}

// Format time
function formatTime(hours: number): string {
  if (hours < 1) {
    return `${Math.round(hours * 60)}min`
  }
  const h = Math.floor(hours)
  const m = Math.round((hours - h) * 60)
  return m > 0 ? `${h}h ${m}m` : `${h}h`
}

export function LearningPathCardEnhanced({
  path,
  onClick,
  onEnroll,
  variant = 'default',
  className,
}: LearningPathCardEnhancedProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const diffConfig = difficultyConfig[path.difficulty]
  const DiffIcon = diffConfig.icon
  
  // Calculate stats
  const completedStages = path.stages?.filter(s => s.isCompleted).length || 0
  const isComplete = path.progress === 100
  const canStart = !path.prerequisites || path.prerequisites.every(p => p.isCompleted)
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
      className={className}
    >
      <Card
        className={cn(
          'overflow-hidden cursor-pointer transition-all duration-300',
          'border-gray-100 hover:border-blue-300 hover:shadow-xl hover:shadow-blue-500/10',
          isComplete && 'border-emerald-200 bg-emerald-50/30',
        )}
        onClick={onClick}
      >
        {/* Header with gradient */}
        <div className={cn(
          'p-4 bg-gradient-to-r',
          diffConfig.color,
        )}>
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <Badge className="bg-white/20 text-white border-0 text-xs">
                  {path.subject}
                </Badge>
                <Badge className="bg-white/20 text-white border-0 text-xs gap-1">
                  <DiffIcon className="h-3 w-3" />
                  {path.difficulty}
                </Badge>
              </div>
              <h3 className="font-semibold text-white truncate">{path.name}</h3>
            </div>
            
            {/* Progress Ring */}
            <div className="relative w-14 h-14 flex-shrink-0">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                <circle
                  cx="18"
                  cy="18"
                  r="16"
                  fill="none"
                  stroke="rgba(255,255,255,0.2)"
                  strokeWidth="3"
                />
                <motion.circle
                  cx="18"
                  cy="18"
                  r="16"
                  fill="none"
                  stroke="white"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeDasharray={`${path.progress} 100`}
                  initial={{ strokeDasharray: '0 100' }}
                  animate={{ strokeDasharray: `${path.progress} 100` }}
                  transition={{ duration: 0.8, delay: 0.2 }}
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-white text-xs font-bold">
                  {Math.round(path.progress)}%
                </span>
              </div>
            </div>
          </div>
          
          {/* Stats */}
          <div className="flex items-center gap-4 mt-3 text-white/80 text-sm">
            <div className="flex items-center gap-1">
              <BookOpen className="h-4 w-4" />
              <span>{path.totalStages} stages</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              <span>{formatTime(path.estimatedHours)}</span>
            </div>
            {path.isEnrolled && (
              <div className="flex items-center gap-1">
                <Target className="h-4 w-4" />
                <span>Stage {path.currentStage}</span>
              </div>
            )}
          </div>
        </div>
        
        {/* Content */}
        <div className="p-4">
          {/* Progress Bar */}
          {path.isEnrolled && (
            <div className="mb-4">
              <div className="flex items-center justify-between text-sm mb-1.5">
                <span className="text-gray-600">Progress</span>
                <span className="font-medium text-gray-900">
                  {completedStages}/{path.totalStages} completed
                </span>
              </div>
              <Progress value={path.progress} className="h-2" />
            </div>
          )}
          
          {/* Earned Badges */}
          {path.earnedBadges && path.earnedBadges.length > 0 && (
            <div className="flex items-center gap-2 mb-4">
              <Trophy className="h-4 w-4 text-amber-500" />
              <div className="flex -space-x-1">
                {path.earnedBadges.map((badge, index) => (
                  <motion.div
                    key={badge.id}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: index * 0.1 }}
                    className="w-7 h-7 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white text-xs font-bold shadow-sm ring-2 ring-white"
                  >
                    {badge.icon || '✓'}
                  </motion.div>
                ))}
              </div>
              <span className="text-sm text-gray-500">
                {path.earnedBadges.length} badges earned
              </span>
            </div>
          )}
          
          {/* Prerequisites Warning */}
          {path.prerequisites && path.prerequisites.length > 0 && !canStart && (
            <div className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg mb-4">
              <Lock className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
              <div>
                <div className="text-sm font-medium text-amber-800">Prerequisites Required</div>
                <div className="text-xs text-amber-700 mt-1">
                  Complete: {path.prerequisites.filter(p => !p.isCompleted).map(p => p.name).join(', ')}
                </div>
              </div>
            </div>
          )}
          
          {/* Stage Progress (if expanded) */}
          {isExpanded && path.stages && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-4"
            >
              <div className="text-sm font-medium text-gray-700 mb-2">Stages</div>
              <div className="space-y-2">
                {path.stages.map((stage, index) => (
                  <motion.div
                    key={stage.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className={cn(
                      'flex items-center gap-3 p-2 rounded-lg',
                      stage.isCompleted && 'bg-emerald-50',
                      stage.isLocked && 'opacity-50',
                    )}
                  >
                    <div className={cn(
                      'w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0',
                      stage.isCompleted
                        ? 'bg-emerald-500 text-white'
                        : stage.isLocked
                        ? 'bg-gray-200 text-gray-400'
                        : 'bg-blue-100 text-blue-600',
                    )}>
                      {stage.isCompleted ? (
                        <CheckCircle2 className="h-4 w-4" />
                      ) : stage.isLocked ? (
                        <Lock className="h-3 w-3" />
                      ) : (
                        <span className="text-xs font-medium">{stage.order}</span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className={cn(
                        'text-sm font-medium truncate',
                        stage.isCompleted ? 'text-emerald-700' : 'text-gray-700'
                      )}>
                        {stage.name}
                      </div>
                      <div className="text-xs text-gray-500 flex items-center gap-2">
                        <Clock className="h-3 w-3" />
                        {stage.estimatedMinutes}m
                        <span>•</span>
                        {stage.resourceCount} resources
                      </div>
                    </div>
                    {stage.badgeIcon && stage.isCompleted && (
                      <Medal className="h-5 w-5 text-amber-500" />
                    )}
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
          
          {/* Actions */}
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation()
                setIsExpanded(!isExpanded)
              }}
              className="text-gray-500"
            >
              {isExpanded ? 'Less' : 'Details'}
              <ChevronRight className={cn(
                'h-4 w-4 ml-1 transition-transform',
                isExpanded && 'rotate-90'
              )} />
            </Button>
            
            {path.isEnrolled ? (
              <Button
                onClick={(e) => {
                  e.stopPropagation()
                  onClick()
                }}
                className="gap-1 bg-gradient-to-r from-blue-500 to-blue-600"
              >
                {isComplete ? (
                  <>
                    <Trophy className="h-4 w-4" />
                    Completed
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4" />
                    Continue
                  </>
                )}
              </Button>
            ) : (
              <Button
                onClick={(e) => {
                  e.stopPropagation()
                  onEnroll?.()
                }}
                disabled={!canStart}
                className="gap-1"
              >
                <Sparkles className="h-4 w-4" />
                {canStart ? 'Enroll Now' : 'Locked'}
              </Button>
            )}
          </div>
        </div>
      </Card>
    </motion.div>
  )
}

export default LearningPathCardEnhanced
