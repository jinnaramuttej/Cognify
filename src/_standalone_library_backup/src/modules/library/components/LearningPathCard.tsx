'use client'

import { motion } from 'framer-motion'
import { GraduationCap, Clock, ArrowRight, Play } from 'lucide-react'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ProgressRing } from './ProgressRing'
import { cn } from '@/lib/utils'
import type { Difficulty } from '@/modules/library/types'

export interface LearningPathCardData {
  id: string
  name: string
  subject: string
  difficulty: Difficulty
  progress: number // 0-100
  totalStages: number
  currentStage: number
  estimatedTime: number // in minutes
  description?: string
}

interface LearningPathCardProps {
  path: LearningPathCardData
  onClick?: () => void
  onContinue?: () => void
  className?: string
}

const difficultyConfig: Record<Difficulty, { color: string; bgColor: string; borderColor: string }> = {
  Beginner: {
    color: 'text-green-700',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200',
  },
  Intermediate: {
    color: 'text-amber-700',
    bgColor: 'bg-amber-50',
    borderColor: 'border-amber-200',
  },
  Advanced: {
    color: 'text-red-700',
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200',
  },
}

const progressColorMap = (progress: number): 'blue' | 'green' | 'orange' => {
  if (progress >= 80) return 'green'
  if (progress >= 40) return 'blue'
  return 'orange'
}

export function LearningPathCard({
  path,
  onClick,
  onContinue,
  className,
}: LearningPathCardProps) {
  const { name, subject, difficulty, progress, totalStages, currentStage, estimatedTime, description } = path
  const difficultyStyle = difficultyConfig[difficulty]
  const isStarted = progress > 0
  const isCompleted = progress >= 100

  const formatTime = (minutes: number): string => {
    if (minutes < 60) return `${minutes}m`
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
    >
      <Card
        className={cn(
          'cursor-pointer transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/10 border-gray-200',
          className
        )}
        onClick={onClick}
      >
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <GraduationCap className="w-4 h-4 text-[#2563EB]" />
                <span className="text-sm text-gray-500 font-medium">{subject}</span>
              </div>
              <CardTitle className="text-lg font-semibold text-gray-900 truncate">
                {name}
              </CardTitle>
              {description && (
                <p className="text-sm text-gray-500 mt-1 line-clamp-2">{description}</p>
              )}
            </div>
            <ProgressRing
              value={progress}
              color={progressColorMap(progress)}
              size="sm"
              showPercentage={false}
              className="ml-4 flex-shrink-0"
            />
          </div>
        </CardHeader>

        <CardContent className="pb-3">
          <div className="flex items-center gap-4 flex-wrap">
            {/* Difficulty Badge */}
            <Badge
              variant="outline"
              className={cn(
                'font-medium',
                difficultyStyle.color,
                difficultyStyle.bgColor,
                difficultyStyle.borderColor
              )}
            >
              {difficulty}
            </Badge>

            {/* Stage Progress */}
            <div className="flex items-center gap-1.5 text-sm text-gray-600">
              <span className="font-medium text-gray-900">Stage {currentStage}</span>
              <span className="text-gray-400">/</span>
              <span>{totalStages}</span>
            </div>

            {/* Estimated Time */}
            <div className="flex items-center gap-1.5 text-sm text-gray-600">
              <Clock className="w-4 h-4 text-gray-400" />
              <span>{formatTime(estimatedTime)}</span>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mt-4">
            <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
              <span>Progress</span>
              <span className="font-medium">{Math.round(progress)}%</span>
            </div>
            <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
                className="h-full bg-gradient-to-r from-[#2563EB] to-[#3B82F6] rounded-full"
              />
            </div>
          </div>
        </CardContent>

        <CardFooter className="pt-0">
          <Button
            className={cn(
              'w-full gap-2',
              isCompleted
                ? 'bg-[#10B981] hover:bg-[#10B981]/90'
                : 'bg-[#2563EB] hover:bg-[#2563EB]/90'
            )}
            onClick={(e) => {
              e.stopPropagation()
              onContinue?.()
            }}
          >
            {isCompleted ? (
              <>
                <span>Review Path</span>
                <ArrowRight className="w-4 h-4" />
              </>
            ) : isStarted ? (
              <>
                <span>Continue</span>
                <ArrowRight className="w-4 h-4" />
              </>
            ) : (
              <>
                <Play className="w-4 h-4" />
                <span>Start Learning</span>
              </>
            )}
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  )
}

// Skeleton loader for LearningPathCard
export function LearningPathCardSkeleton() {
  return (
    <Card className="border-gray-200">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-4 h-4 bg-gray-200 rounded animate-pulse" />
              <div className="w-20 h-4 bg-gray-200 rounded animate-pulse" />
            </div>
            <div className="w-3/4 h-5 bg-gray-200 rounded animate-pulse" />
          </div>
          <div className="w-12 h-12 bg-gray-200 rounded-full animate-pulse" />
        </div>
      </CardHeader>
      <CardContent className="pb-3">
        <div className="flex items-center gap-4">
          <div className="w-20 h-5 bg-gray-200 rounded animate-pulse" />
          <div className="w-16 h-4 bg-gray-200 rounded animate-pulse" />
          <div className="w-12 h-4 bg-gray-200 rounded animate-pulse" />
        </div>
        <div className="mt-4">
          <div className="h-1.5 bg-gray-200 rounded-full animate-pulse" />
        </div>
      </CardContent>
      <CardFooter className="pt-0">
        <div className="w-full h-9 bg-gray-200 rounded-md animate-pulse" />
      </CardFooter>
    </Card>
  )
}
