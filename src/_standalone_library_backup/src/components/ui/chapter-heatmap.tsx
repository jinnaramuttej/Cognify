'use client'

import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

interface HeatmapCell {
  id: string
  name: string
  value: number // 0-100
  status: 'strong' | 'moderate' | 'weak'
}

interface ChapterHeatmapProps {
  topics: HeatmapCell[]
  onTopicClick?: (topic: HeatmapCell) => void
  className?: string
}

const statusColors = {
  strong: {
    bg: 'bg-green-500',
    border: 'border-green-400',
    text: 'text-green-700',
    glow: 'shadow-green-500/20',
  },
  moderate: {
    bg: 'bg-yellow-500',
    border: 'border-yellow-400',
    text: 'text-yellow-700',
    glow: 'shadow-yellow-500/20',
  },
  weak: {
    bg: 'bg-red-500',
    border: 'border-red-400',
    text: 'text-red-700',
    glow: 'shadow-red-500/20',
  },
}

export function ChapterHeatmap({ topics, onTopicClick, className }: ChapterHeatmapProps) {
  const getStatus = (value: number): 'strong' | 'moderate' | 'weak' => {
    if (value >= 70) return 'strong'
    if (value >= 40) return 'moderate'
    return 'weak'
  }

  return (
    <div className={cn('space-y-4', className)}>
      {/* Legend */}
      <div className="flex items-center gap-4 text-sm">
        <span className="text-gray-500">Mastery Level:</span>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-sm bg-green-500" />
          <span className="text-gray-600">Strong</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-sm bg-yellow-500" />
          <span className="text-gray-600">Moderate</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-sm bg-red-500" />
          <span className="text-gray-600">Weak</span>
        </div>
      </div>

      {/* Heatmap Grid */}
      <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2">
        {topics.map((topic, index) => {
          const status = getStatus(topic.value)
          const colors = statusColors[status]

          return (
            <motion.button
              key={topic.id}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.02, duration: 0.2 }}
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onTopicClick?.(topic)}
              className={cn(
                'relative aspect-square rounded-lg border-2 transition-all duration-200',
                'hover:shadow-lg group cursor-pointer',
                colors.bg,
                colors.border,
                colors.glow
              )}
            >
              {/* Tooltip */}
              <div className={cn(
                'absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 rounded-md',
                'bg-gray-900 text-white text-xs font-medium whitespace-nowrap',
                'opacity-0 group-hover:opacity-100 transition-opacity duration-200',
                'pointer-events-none z-10'
              )}>
                {topic.name}
                <span className="ml-1">({topic.value}%)</span>
              </div>

              {/* Value display */}
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-white text-xs font-bold opacity-90">
                  {topic.value}
                </span>
              </div>
            </motion.button>
          )
        })}
      </div>
    </div>
  )
}

// Topic progress bar with status indicator
interface TopicProgressProps {
  name: string
  progress: number
  isWeak?: boolean
  className?: string
}

export function TopicProgress({ name, progress, isWeak, className }: TopicProgressProps) {
  const getStatus = () => {
    if (progress >= 70) return { color: 'bg-green-500', textColor: 'text-green-600' }
    if (progress >= 40) return { color: 'bg-yellow-500', textColor: 'text-yellow-600' }
    return { color: 'bg-red-500', textColor: 'text-red-600' }
  }

  const status = getStatus()

  return (
    <motion.div
      initial={{ opacity: 0, x: -16 }}
      animate={{ opacity: 1, x: 0 }}
      className={cn('group', className)}
    >
      <div className="flex items-center justify-between mb-1.5">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-700">{name}</span>
          {isWeak && (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="px-1.5 py-0.5 text-xs font-medium bg-red-100 text-red-600 rounded"
            >
              Weak
            </motion.span>
          )}
        </div>
        <span className={cn('text-sm font-semibold', status.textColor)}>
          {progress}%
        </span>
      </div>
      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className={cn('h-full rounded-full', status.color)}
        />
      </div>
    </motion.div>
  )
}
