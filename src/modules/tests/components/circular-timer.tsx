'use client'

import { useEffect, useRef, useState } from 'react'
import { motion, useAnimation } from 'framer-motion'
import { Pause, Play, AlertTriangle } from 'lucide-react'
import { cn } from '@/modules/tests/utils'

// ============================================
// DESIGN TOKENS
// ============================================

const TIMER_TOKENS = {
  colors: {
    safe: '#10B981',      // Green - > 25% time
    warning: '#F59E0B',   // Amber - 10-25% time
    danger: '#EF4444',    // Red - < 10% time
    critical: '#DC2626',  // Dark red - < 5 min
  },
  sizes: {
    sm: { outer: 48, stroke: 4, font: 'text-sm' },
    md: { outer: 80, stroke: 6, font: 'text-lg' },
    lg: { outer: 120, stroke: 8, font: 'text-2xl' },
  }
}

// ============================================
// CIRCULAR TIMER COMPONENT
// ============================================

interface CircularTimerProps {
  timeRemaining: number // seconds
  totalTime: number // seconds
  size?: 'sm' | 'md' | 'lg'
  showSeconds?: boolean
  isPaused?: boolean
  onPause?: () => void
  className?: string
}

export function CircularTimer({
  timeRemaining,
  totalTime,
  size = 'md',
  showSeconds = true,
  isPaused = false,
  onPause,
  className = '',
}: CircularTimerProps) {
  const controls = useAnimation()
  const prevTimeRef = useRef(timeRemaining)
  const [isAnimating, setIsAnimating] = useState(false)

  // Size config
  const sizeConfig = TIMER_TOKENS.sizes[size]
  const { outer: diameter, stroke: strokeWidth } = sizeConfig
  const radius = (diameter - strokeWidth) / 2
  const circumference = radius * 2 * Math.PI
  const center = diameter / 2

  // Calculate progress
  const progress = (totalTime - timeRemaining) / totalTime
  const strokeDashoffset = circumference * (1 - progress)

  // Determine color based on time remaining
  const getTimeColor = () => {
    const percentRemaining = (timeRemaining / totalTime) * 100
    
    if (percentRemaining > 25) return TIMER_TOKENS.colors.safe
    if (percentRemaining > 10) return TIMER_TOKENS.colors.warning
    return TIMER_TOKENS.colors.danger
  }

  const color = getTimeColor()
  const isLowTime = (timeRemaining / totalTime) < 0.1

  // Format time
  const formatTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600)
    const mins = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60

    if (hrs > 0) {
      return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
    }
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  // Animate on time change
  useEffect(() => {
    if (prevTimeRef.current !== timeRemaining) {
      // Pulse animation on low time
      if (isLowTime && timeRemaining % 60 === 0) {
        controls.start({
          scale: [1, 1.05, 1],
          transition: { duration: 0.3 }
        })
      }
      prevTimeRef.current = timeRemaining
    }
  }, [timeRemaining, isLowTime, controls])

  return (
    <motion.div
      animate={controls}
      className={cn('relative', className)}
      style={{ width: diameter, height: diameter }}
    >
      {/* Background glow for warning states */}
      {isLowTime && (
        <motion.div
          className="absolute inset-0 rounded-full"
          style={{ backgroundColor: `${color}20` }}
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      )}

      <svg
        width={diameter}
        height={diameter}
        className="transform -rotate-90"
      >
        {/* Tick marks */}
        {Array.from({ length: 12 }).map((_, i) => {
          const angle = (i * 30 - 90) * (Math.PI / 180)
          const innerRadius = radius - strokeWidth / 2 - 3
          const outerRadius = radius - strokeWidth / 2 - 1
          const x1 = center + innerRadius * Math.cos(angle)
          const y1 = center + innerRadius * Math.sin(angle)
          const x2 = center + outerRadius * Math.cos(angle)
          const y2 = center + outerRadius * Math.sin(angle)

          return (
            <line
              key={i}
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              stroke={color}
              strokeWidth={i % 3 === 0 ? 2 : 1}
              strokeOpacity={i % 3 === 0 ? 0.5 : 0.2}
              strokeLinecap="round"
            />
          )
        })}

        {/* Background track */}
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke="#E5E7EB"
          strokeWidth={strokeWidth}
          className="opacity-30"
        />

        {/* Progress arc */}
        <motion.circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{ duration: 0.5, ease: 'linear' }}
          style={{
            strokeDasharray: circumference,
            filter: `drop-shadow(0 0 6px ${color}40)`,
          }}
        />

        {/* Decorative inner circle */}
        <circle
          cx={center}
          cy={center}
          r={radius - strokeWidth - 4}
          fill="none"
          stroke={color}
          strokeWidth={0.5}
          strokeOpacity={0.2}
        />
      </svg>

      {/* Time display */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center">
          <motion.div
            className={cn(
              'font-bold tabular-nums',
              sizeConfig.font,
              isLowTime ? 'text-red-600' : 'text-gray-900'
            )}
            animate={isLowTime ? { scale: [1, 1.02, 1] } : {}}
            transition={{ duration: 0.5, repeat: isLowTime ? Infinity : 0 }}
          >
            {formatTime(timeRemaining)}
          </motion.div>
          
          {isLowTime && (
            <motion.div
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center justify-center gap-1 mt-0.5"
            >
              <AlertTriangle className="h-3 w-3 text-red-500" />
              <span className="text-[10px] text-red-500 font-medium">Low Time</span>
            </motion.div>
          )}
        </div>
      </div>

      {/* Pause overlay */}
      {isPaused && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute inset-0 flex items-center justify-center bg-white/80 rounded-full"
        >
          <Play className="h-6 w-6 text-gray-700" />
        </motion.div>
      )}
    </motion.div>
  )
}

// ============================================
// MINI TIMER (For Header)
// ============================================

interface MiniTimerProps {
  timeRemaining: number
  totalTime: number
  isPaused?: boolean
  onPause?: () => void
}

export function MiniTimer({ timeRemaining, totalTime, isPaused, onPause }: MiniTimerProps) {
  const percentRemaining = (timeRemaining / totalTime) * 100
  const isLowTime = percentRemaining < 10

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <motion.button
      onClick={onPause}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={cn(
        "flex items-center gap-2 px-3 py-2 rounded-xl border-2 transition-all duration-200",
        isLowTime
          ? "border-red-300 bg-red-50"
          : "border-gray-200 bg-white hover:border-blue-300"
      )}
    >
      <CircularTimer
        timeRemaining={timeRemaining}
        totalTime={totalTime}
        size="sm"
        showSeconds={false}
        isPaused={isPaused}
      />
      <div className="flex flex-col items-start">
        <span className={cn(
          "font-bold tabular-nums text-sm",
          isLowTime ? "text-red-600" : "text-gray-900"
        )}>
          {formatTime(timeRemaining)}
        </span>
        <span className="text-[10px] text-gray-400">
          {isPaused ? 'Paused' : 'Remaining'}
        </span>
      </div>
      {isPaused ? (
        <Play className="h-4 w-4 text-gray-400" />
      ) : (
        <Pause className="h-4 w-4 text-gray-400" />
      )}
    </motion.button>
  )
}
