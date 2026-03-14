'use client'

import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

interface CircularProgressProps {
  value: number
  size?: number
  strokeWidth?: number
  showValue?: boolean
  className?: string
  progressColor?: string
  bgColor?: string
  children?: React.ReactNode
}

export function CircularProgress({
  value,
  size = 80,
  strokeWidth = 6,
  showValue = true,
  className,
  progressColor = '#2563EB',
  bgColor = '#E5E7EB',
  children,
}: CircularProgressProps) {
  const radius = (size - strokeWidth) / 2
  const circumference = radius * 2 * Math.PI
  const offset = circumference - (Math.min(value, 100) / 100) * circumference

  return (
    <div className={cn('relative inline-flex items-center justify-center', className)} style={{ width: size, height: size }}>
      <svg width={size} height={size} className="transform -rotate-90">
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
          stroke={bgColor}
          fill="none"
          className="transition-colors duration-200"
        />
        {/* Progress circle */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          stroke={progressColor}
          fill="none"
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1, ease: 'easeOut' }}
          style={{ strokeDasharray: circumference }}
        />
      </svg>
      {children || (showValue && (
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.span
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3, duration: 0.3 }}
            className="text-sm font-bold text-gray-900"
          >
            {Math.round(value)}%
          </motion.span>
        </div>
      ))}
    </div>
  )
}

// Mini progress ring for inline use
export function MiniProgressRing({
  value,
  size = 24,
  strokeWidth = 3,
  className,
}: {
  value: number
  size?: number
  strokeWidth?: number
  className?: string
}) {
  const radius = (size - strokeWidth) / 2
  const circumference = radius * 2 * Math.PI
  const offset = circumference - (Math.min(value, 100) / 100) * circumference

  const getColor = () => {
    if (value >= 80) return '#10B981' // green
    if (value >= 60) return '#2563EB' // blue
    if (value >= 40) return '#F59E0B' // amber
    return '#EF4444' // red
  }

  return (
    <svg width={size} height={size} className={cn('transform -rotate-90', className)}>
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
        stroke={getColor()}
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
export function AnimatedProgress({
  value,
  className,
  barClassName,
  showLabel = false,
  label,
}: {
  value: number
  className?: string
  barClassName?: string
  showLabel?: boolean
  label?: string
}) {
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
          animate={{ width: `${Math.min(value, 100)}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full"
        />
      </div>
    </div>
  )
}
