'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  GraduationCap,
  Lock,
  CheckCircle,
  Clock,
  Trophy,
  BookOpen,
  FileText,
  Video,
  HelpCircle,
  ChevronDown,
  ChevronRight,
  Play,
  Award,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ProgressRing, AnimatedProgress } from './ProgressRing'
import { cn } from '@/lib/utils'
import type { Difficulty, ResourceType } from '@/modules/library/types'

// Types
export type StageLevel = 'Beginner' | 'Intermediate' | 'Advanced'

export interface PathResource {
  id: string
  title: string
  type: ResourceType
  duration: number // in minutes
  isCompleted: boolean
  isLocked: boolean
}

export interface PathStage {
  id: string
  name: string
  level: StageLevel
  description: string
  progress: number
  resources: PathResource[]
  isLocked: boolean
  isCompleted: boolean
}

export interface PathBadge {
  id: string
  name: string
  description: string
  icon: string
  earnedAt: string | null
}

export interface LearningPathData {
  id: string
  name: string
  subject: string
  description: string
  difficulty: Difficulty
  progress: number
  totalStages: number
  currentStage: number
  estimatedTime: number
  stages: PathStage[]
  badges: PathBadge[]
}

interface LearningPathViewerProps {
  path: LearningPathData
  onResourceClick?: (resource: PathResource) => void
  onStageClick?: (stage: PathStage) => void
  className?: string
}

// Resource type icons
const resourceIcons: Record<ResourceType, React.ReactNode> = {
  Notes: <FileText className="w-4 h-4" />,
  PYQ: <HelpCircle className="w-4 h-4" />,
  'Concept Sheet': <BookOpen className="w-4 h-4" />,
  Diagram: <FileText className="w-4 h-4" />,
  'Formula List': <FileText className="w-4 h-4" />,
  Video: <Video className="w-4 h-4" />,
}

// Stage level colors
const stageLevelColors: Record<StageLevel, { bg: string; border: string; text: string; badge: string }> = {
  Beginner: {
    bg: 'bg-green-50',
    border: 'border-green-200',
    text: 'text-green-700',
    badge: 'bg-green-100 text-green-700 border-green-200',
  },
  Intermediate: {
    bg: 'bg-amber-50',
    border: 'border-amber-200',
    text: 'text-amber-700',
    badge: 'bg-amber-100 text-amber-700 border-amber-200',
  },
  Advanced: {
    bg: 'bg-red-50',
    border: 'border-red-200',
    text: 'text-red-700',
    badge: 'bg-red-100 text-red-700 border-red-200',
  },
}

export function LearningPathViewer({
  path,
  onResourceClick,
  onStageClick,
  className,
}: LearningPathViewerProps) {
  const [expandedStages, setExpandedStages] = useState<Set<string>>(
    new Set(path.stages.filter((s) => !s.isLocked).map((s) => s.id))
  )

  const toggleStage = (stageId: string) => {
    setExpandedStages((prev) => {
      const next = new Set(prev)
      if (next.has(stageId)) {
        next.delete(stageId)
      } else {
        next.add(stageId)
      }
      return next
    })
  }

  const formatTime = (minutes: number): string => {
    if (minutes < 60) return `${minutes}m`
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`
  }

  const earnedBadges = path.badges.filter((b) => b.earnedAt)
  const completedStages = path.stages.filter((s) => s.isCompleted).length

  return (
    <div className={cn('space-y-6', className)}>
      {/* Header Section */}
      <Card className="border-gray-200 bg-gradient-to-br from-white to-blue-50/30">
        <CardHeader className="pb-4">
          <div className="flex items-start gap-6">
            {/* Progress Ring */}
            <div className="flex-shrink-0">
              <ProgressRing
                value={path.progress}
                color={path.progress >= 80 ? 'green' : 'blue'}
                size="lg"
                glowOnHover
              />
            </div>

            {/* Path Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <GraduationCap className="w-5 h-5 text-[#2563EB]" />
                <span className="text-sm font-medium text-gray-500">{path.subject}</span>
              </div>
              <CardTitle className="text-2xl font-bold text-gray-900 mb-2">
                {path.name}
              </CardTitle>
              <p className="text-gray-600 text-sm mb-4">{path.description}</p>

              {/* Stats Row */}
              <div className="flex items-center gap-6 flex-wrap">
                <div className="flex items-center gap-2">
                  <Badge
                    variant="outline"
                    className={cn(
                      'font-medium',
                      path.difficulty === 'Beginner' && 'text-green-700 bg-green-50 border-green-200',
                      path.difficulty === 'Intermediate' && 'text-amber-700 bg-amber-50 border-amber-200',
                      path.difficulty === 'Advanced' && 'text-red-700 bg-red-50 border-red-200'
                    )}
                  >
                    {path.difficulty}
                  </Badge>
                </div>

                <div className="flex items-center gap-1.5 text-sm text-gray-600">
                  <CheckCircle className="w-4 h-4 text-[#10B981]" />
                  <span>
                    <span className="font-semibold text-gray-900">{completedStages}</span>/{path.totalStages} stages
                  </span>
                </div>

                <div className="flex items-center gap-1.5 text-sm text-gray-600">
                  <Clock className="w-4 h-4 text-gray-400" />
                  <span>{formatTime(path.estimatedTime)} remaining</span>
                </div>
              </div>
            </div>
          </div>
        </CardHeader>

        {/* Overall Progress Bar */}
        <CardContent className="pt-0">
          <AnimatedProgress
            value={path.progress}
            label="Overall Progress"
            showLabel
            color={path.progress >= 80 ? 'green' : 'blue'}
          />
        </CardContent>
      </Card>

      {/* Badges Section */}
      {earnedBadges.length > 0 && (
        <Card className="border-gray-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Trophy className="w-5 h-5 text-[#F59E0B]" />
              Badges Earned
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              {earnedBadges.map((badge) => (
                <motion.div
                  key={badge.id}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-amber-50 to-yellow-50 border border-amber-200 rounded-lg"
                >
                  <Award className="w-5 h-5 text-[#F59E0B]" />
                  <div>
                    <p className="font-medium text-gray-900 text-sm">{badge.name}</p>
                    <p className="text-xs text-gray-500">{badge.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stages List */}
      <div className="space-y-3">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-[#2563EB]" />
          Learning Stages
        </h3>

        {path.stages.map((stage, index) => {
          const isExpanded = expandedStages.has(stage.id)
          const levelStyle = stageLevelColors[stage.level]
          const completedResources = stage.resources.filter((r) => r.isCompleted).length

          return (
            <motion.div
              key={stage.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card
                className={cn(
                  'transition-all duration-200',
                  stage.isLocked
                    ? 'bg-gray-50 border-gray-200 opacity-60'
                    : 'border-gray-200 hover:border-[#2563EB]/30 hover:shadow-md'
                )}
              >
                {/* Stage Header */}
                <div
                  className={cn(
                    'flex items-center gap-4 p-4 cursor-pointer',
                    stage.isLocked && 'cursor-not-allowed'
                  )}
                  onClick={() => !stage.isLocked && toggleStage(stage.id)}
                >
                  {/* Stage Number / Status */}
                  <div
                    className={cn(
                      'w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0',
                      stage.isCompleted
                        ? 'bg-[#10B981] text-white'
                        : stage.isLocked
                        ? 'bg-gray-200 text-gray-400'
                        : 'bg-[#2563EB] text-white'
                    )}
                  >
                    {stage.isLocked ? (
                      <Lock className="w-5 h-5" />
                    ) : stage.isCompleted ? (
                      <CheckCircle className="w-5 h-5" />
                    ) : (
                      <span className="font-semibold">{index + 1}</span>
                    )}
                  </div>

                  {/* Stage Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-semibold text-gray-900">{stage.name}</h4>
                      <Badge variant="outline" className={levelStyle.badge}>
                        {stage.level}
                      </Badge>
                      {stage.isCompleted && (
                        <Badge className="bg-[#10B981] text-white border-0">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Complete
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-gray-500 truncate">{stage.description}</p>
                  </div>

                  {/* Progress Info */}
                  <div className="flex items-center gap-4 flex-shrink-0">
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900">
                        {completedResources}/{stage.resources.length} resources
                      </p>
                      <div className="w-24 h-1.5 bg-gray-200 rounded-full overflow-hidden mt-1">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${stage.progress}%` }}
                          className="h-full bg-[#2563EB] rounded-full"
                        />
                      </div>
                    </div>
                    {!stage.isLocked && (
                      <motion.div
                        animate={{ rotate: isExpanded ? 180 : 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <ChevronDown className="w-5 h-5 text-gray-400" />
                      </motion.div>
                    )}
                  </div>
                </div>

                {/* Resources List */}
                <AnimatePresence>
                  {isExpanded && !stage.isLocked && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <div className="border-t border-gray-100 px-4 py-3 bg-gray-50/50">
                        <div className="space-y-2">
                          {stage.resources.map((resource, resourceIndex) => (
                            <motion.div
                              key={resource.id}
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: resourceIndex * 0.05 }}
                              className={cn(
                                'flex items-center gap-3 p-3 rounded-lg transition-all',
                                resource.isLocked
                                  ? 'bg-gray-100 opacity-50 cursor-not-allowed'
                                  : resource.isCompleted
                                  ? 'bg-green-50 border border-green-200'
                                  : 'bg-white border border-gray-200 hover:border-[#2563EB]/50 cursor-pointer'
                              )}
                              onClick={() => !resource.isLocked && onResourceClick?.(resource)}
                            >
                              {/* Resource Icon */}
                              <div
                                className={cn(
                                  'w-8 h-8 rounded-lg flex items-center justify-center',
                                  resource.isCompleted
                                    ? 'bg-[#10B981] text-white'
                                    : resource.isLocked
                                    ? 'bg-gray-200 text-gray-400'
                                    : 'bg-[#2563EB]/10 text-[#2563EB]'
                                )}
                              >
                                {resource.isLocked ? (
                                  <Lock className="w-4 h-4" />
                                ) : resource.isCompleted ? (
                                  <CheckCircle className="w-4 h-4" />
                                ) : (
                                  resourceIcons[resource.type]
                                )}
                              </div>

                              {/* Resource Info */}
                              <div className="flex-1 min-w-0">
                                <p
                                  className={cn(
                                    'font-medium text-sm truncate',
                                    resource.isCompleted ? 'text-green-700' : 'text-gray-900'
                                  )}
                                >
                                  {resource.title}
                                </p>
                                <div className="flex items-center gap-2 text-xs text-gray-500">
                                  <span>{resource.type}</span>
                                  <span>•</span>
                                  <span>{formatTime(resource.duration)}</span>
                                </div>
                              </div>

                              {/* Action Button */}
                              {!resource.isLocked && (
                                <Button
                                  size="sm"
                                  variant={resource.isCompleted ? 'outline' : 'default'}
                                  className={cn(
                                    'flex-shrink-0',
                                    !resource.isCompleted && 'bg-[#2563EB] hover:bg-[#2563EB]/90'
                                  )}
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    onResourceClick?.(resource)
                                  }}
                                >
                                  {resource.isCompleted ? (
                                    'Review'
                                  ) : (
                                    <>
                                      <Play className="w-3 h-3 mr-1" />
                                      Start
                                    </>
                                  )}
                                </Button>
                              )}
                            </motion.div>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </Card>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}

// Skeleton loader
export function LearningPathViewerSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header Skeleton */}
      <Card className="border-gray-200">
        <CardHeader className="pb-4">
          <div className="flex items-start gap-6">
            <div className="w-[120px] h-[120px] bg-gray-200 rounded-full animate-pulse" />
            <div className="flex-1 space-y-3">
              <div className="w-24 h-4 bg-gray-200 rounded animate-pulse" />
              <div className="w-3/4 h-6 bg-gray-200 rounded animate-pulse" />
              <div className="w-full h-4 bg-gray-200 rounded animate-pulse" />
              <div className="flex gap-4">
                <div className="w-20 h-6 bg-gray-200 rounded animate-pulse" />
                <div className="w-24 h-6 bg-gray-200 rounded animate-pulse" />
                <div className="w-28 h-6 bg-gray-200 rounded animate-pulse" />
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-2 bg-gray-200 rounded-full animate-pulse" />
        </CardContent>
      </Card>

      {/* Stages Skeleton */}
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="border-gray-200">
            <div className="flex items-center gap-4 p-4">
              <div className="w-10 h-10 bg-gray-200 rounded-full animate-pulse" />
              <div className="flex-1 space-y-2">
                <div className="w-1/3 h-5 bg-gray-200 rounded animate-pulse" />
                <div className="w-2/3 h-4 bg-gray-200 rounded animate-pulse" />
              </div>
              <div className="w-24 h-4 bg-gray-200 rounded animate-pulse" />
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}
