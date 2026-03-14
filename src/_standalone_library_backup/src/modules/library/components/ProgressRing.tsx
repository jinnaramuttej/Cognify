'use client'

import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

type ColorVariant = 'blue' | 'green' | 'orange'
type SizeVariant = 'sm' | 'md' | 'lg'

interface ProgressRingProps {
  value: number
  color?: ColorVariant
  size?: SizeVariant
  showPercentage?: boolean
  className?: string
  animated?: boolean
  glowOnHover?: boolean
}

const colorMap: Record<ColorVariant, { primary: string; glow: string }> = {
  blue: {
    primary: '#2563EB',
    glow: 'rgba(37, 99, 235, 0.5)',
  },
  green: {
    primary: '#10B981',
    glow: 'rgba(16, 185, 129, 0.5)',
  },
  orange: {
    primary: '#F59E0B',
    glow: 'rgba(245, 158, 11, 0.5)',
  },
}

const sizeMap: Record<SizeVariant, { dimension: number; strokeWidth: number; fontSize: string }> = {
  sm: {
    dimension: 48,
    strokeWidth: 4,
    fontSize: 'text-xs',
  },
  md: {
    dimension: 80,
    strokeWidth: 6,
    fontSize: 'text-sm',
  },
  lg: {
    dimension: 120,
    strokeWidth: 8,
    fontSize: 'text-lg',
  },
}

export function ProgressRing({
  value,
  color = 'blue',
  size = 'md',
  showPercentage = true,
  className,
  animated = true,
  glowOnHover = true,
}: ProgressRingProps) {
  const { dimension, strokeWidth, fontSize } = sizeMap[size]
  const { primary, glow } = colorMap[color]
  const radius = (dimension - strokeWidth) / 2
  const circumference = radius * 2 * Math.PI
  const offset = circumference - (Math.min(Math.max(value, 0), 100) / 100) * circumference

  return (
    <div
      className={cn(
        'relative inline-flex items-center justify-center group',
        className
      )}
      style={{ width: dimension, height: dimension }}
    >
      <svg
        width={dimension}
        height={dimension}
        className="transform -rotate-90"
      >
        {/* Glow filter definition */}
        <defs>
          <filter id={`glow-${color}`} x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="3" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Background circle */}
        <circle
          cx={dimension / 2}
          cy={dimension / 2}
          r={radius}
          strokeWidth={strokeWidth}
          stroke="#E5E7EB"
          fill="none"
          className="transition-colors duration-200"
        />

        {/* Progress circle */}
        <motion.circle
          cx={dimension / 2}
          cy={dimension / 2}
          r={radius}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          stroke={primary}
          fill="none"
          initial={animated ? { strokeDashoffset: circumference } : false}
          animate={{ strokeDashoffset: offset }}
          transition={animated ? { duration: 1.2, ease: 'easeOut' } : { duration: 0 }}
          style={{ strokeDasharray: circumference }}
          className={cn(
            'transition-all duration-300',
            glowOnHover && 'group-hover:filter'
          )}
          filter={glowOnHover ? `url(#glow-${color})` : undefined}
        />
      </svg>

      {/* Percentage display */}
      {showPercentage && (
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.span
            initial={animated ? { opacity: 0, scale: 0.5 } : false}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3, duration: 0.3 }}
            className={cn('font-bold text-gray-900', fontSize)}
          >
            {Math.round(value)}%
          </motion.span>
        </div>
      )}
    </div>
  )
}

// Mini progress ring for inline use
interface MiniRingProps {
  value: number
  size?: number
  strokeWidth?: number
  className?: string
  color?: ColorVariant
}

export function MiniProgressRing({
  value,
  size = 24,
  strokeWidth = 3,
  className,
  color,
}: MiniRingProps) {
  const radius = (size - strokeWidth) / 2
  const circumference = radius * 2 * Math.PI
  const offset = circumference - (Math.min(Math.max(value, 0), 100) / 100) * circumference

  const getAutoColor = (): ColorVariant => {
    if (value >= 80) return 'green'
    if (value >= 60) return 'blue'
    return 'orange'
  }

  const resolvedColor = color || getAutoColor()
  const { primary } = colorMap[resolvedColor]

  return (
    <svg
      width={size}
      height={size}
      className={cn('transform -rotate-90', className)}
    >
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        strokeWidth={strokeWidth}
        stroke="#E5E7EB"
        fill="none"
      />
      <motion.circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        stroke={primary}
        fill="none"
        initial={{ strokeDashoffset: circumference }}
        animate={{ strokeDashoffset: offset }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        style={{ strokeDasharray: circumference }}
      />
    </svg>
  )
}

// Progress bar with animation
interface AnimatedProgressProps {
  value: number
  className?: string
  barClassName?: string
  showLabel?: boolean
  label?: string
  color?: ColorVariant
}

export function AnimatedProgress({
  value,
  className,
  barClassName,
  showLabel = false,
  label,
  color = 'blue',
}: AnimatedProgressProps) {
  const { primary } = colorMap[color]

  return (
    <div className={cn('space-y-1', className)}>
      {(showLabel || label) && (
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">{label}</span>
          <span className="font-medium text-gray-900">{Math.round(value)}%</span>
        </div>
      )}
      <div className={cn('h-2 bg-gray-100 rounded-full overflow-hidden', barClassName)}>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${Math.min(Math.max(value, 0), 100)}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="h-full rounded-full"
          style={{ backgroundColor: primary }}
        />
      </div>
    </div>
  )
}
