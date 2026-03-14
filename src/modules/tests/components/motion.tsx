'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { ReactNode, useEffect, useState, useRef } from 'react'
import { 
  fadeInUp, 
  staggerContainer, 
  staggerItem, 
  pageTransition,
  transitions,
  TIMING,
  EASE
} from '../utils/motion'

// ============================================
// PAGE WRAPPER - Premium Entrance Animation
// ============================================

interface PageWrapperProps {
  children: ReactNode
  className?: string
  withMesh?: boolean
}

export function PageWrapper({ children, className = '', withMesh = true }: PageWrapperProps) {
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      exit="exit"
      variants={pageTransition}
      className={`${withMesh ? 'bg-mesh ' : ''}${className}`}
    >
      {children}
    </motion.div>
  )
}

// ============================================
// STAGGER CONTAINER - Premium List Animation
// ============================================

interface StaggerContainerProps {
  children: ReactNode
  className?: string
  delay?: number
  staggerDelay?: number
}

export function StaggerContainer({ 
  children, 
  className = '', 
  delay = 0,
  staggerDelay = 0.05
}: StaggerContainerProps) {
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={{
        hidden: { opacity: 0 },
        visible: {
          opacity: 1,
          transition: {
            staggerChildren: staggerDelay,
            delayChildren: delay,
          },
        },
      }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

// ============================================
// STAGGER ITEM - Premium List Item
// ============================================

interface StaggerItemProps {
  children: ReactNode
  className?: string
}

export function StaggerItem({ children, className = '' }: StaggerItemProps) {
  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 20, scale: 0.98 },
        visible: { 
          opacity: 1, 
          y: 0, 
          scale: 1,
          transition: {
            duration: 0.4,
            ease: EASE.enter,
          }
        },
      }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

// ============================================
// ANIMATED CARD - Premium Elevated Card
// ============================================

interface AnimatedCardProps {
  children: ReactNode
  className?: string
  onClick?: () => void
  hoverScale?: number
  hoverY?: number
  glowOnHover?: boolean
}

export function AnimatedCard({ 
  children, 
  className = '', 
  onClick,
  hoverScale = 1.01,
  hoverY = -4,
  glowOnHover = true
}: AnimatedCardProps) {
  const cardRef = useRef<HTMLDivElement>(null)
  
  useEffect(() => {
    const card = cardRef.current
    if (!card || !glowOnHover) return
    
    const handleMouseMove = (e: MouseEvent) => {
      const rect = card.getBoundingClientRect()
      const x = ((e.clientX - rect.left) / rect.width) * 100
      const y = ((e.clientY - rect.top) / rect.height) * 100
      card.style.setProperty('--mouse-x', `${x}%`)
      card.style.setProperty('--mouse-y', `${y}%`)
    }
    
    card.addEventListener('mousemove', handleMouseMove)
    return () => card.removeEventListener('mousemove', handleMouseMove)
  }, [glowOnHover])
  
  return (
    <motion.div
      ref={cardRef}
      initial={{ opacity: 0, y: 20, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      whileHover={{ 
        y: hoverY, 
        scale: hoverScale,
        transition: { duration: TIMING.fast }
      }}
      whileTap={onClick ? { scale: 0.99 } : undefined}
      onClick={onClick}
      className={`bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md hover:border-blue-200 transition-all duration-200 ${glowOnHover ? 'card-glow' : ''} ${className}`}
      style={{ willChange: 'transform' }}
    >
      {children}
    </motion.div>
  )
}

// ============================================
// FADE IN - Premium Directional Fade
// ============================================

interface FadeInProps {
  children: ReactNode
  className?: string
  delay?: number
  direction?: 'up' | 'down' | 'left' | 'right' | 'none'
  duration?: number
}

export function FadeIn({ 
  children, 
  className = '', 
  delay = 0,
  direction = 'up',
  duration = 0.4
}: FadeInProps) {
  const variants = {
    up: {
      hidden: { opacity: 0, y: 24 },
      visible: { opacity: 1, y: 0, transition: { duration, delay, ease: EASE.enter } },
    },
    down: {
      hidden: { opacity: 0, y: -24 },
      visible: { opacity: 1, y: 0, transition: { duration, delay, ease: EASE.enter } },
    },
    left: {
      hidden: { opacity: 0, x: 24 },
      visible: { opacity: 1, x: 0, transition: { duration, delay, ease: EASE.enter } },
    },
    right: {
      hidden: { opacity: 0, x: -24 },
      visible: { opacity: 1, x: 0, transition: { duration, delay, ease: EASE.enter } },
    },
    none: {
      hidden: { opacity: 0 },
      visible: { opacity: 1, transition: { duration, delay } },
    },
  }

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={variants[direction]}
      className={className}
    >
      {children}
    </motion.div>
  )
}

// ============================================
// ANIMATED NUMBER - Count Up Effect
// ============================================

interface AnimatedNumberProps {
  value: number
  duration?: number
  className?: string
  prefix?: string
  suffix?: string
  decimals?: number
}

export function AnimatedNumber({ 
  value, 
  duration = 1.5, 
  className = '',
  prefix = '',
  suffix = '',
  decimals = 0
}: AnimatedNumberProps) {
  const [displayValue, setDisplayValue] = useState(0)
  
  useEffect(() => {
    const startTime = Date.now()
    const endValue = value
    
    const animate = () => {
      const now = Date.now()
      const progress = Math.min((now - startTime) / (duration * 1000), 1)
      
      // Easing function
      const easeOutQuart = 1 - Math.pow(1 - progress, 4)
      const currentValue = Math.floor(easeOutQuart * endValue)
      
      setDisplayValue(currentValue)
      
      if (progress < 1) {
        requestAnimationFrame(animate)
      }
    }
    
    requestAnimationFrame(animate)
  }, [value, duration])
  
  return (
    <span className={className}>
      {prefix}{displayValue.toFixed(decimals)}{suffix}
    </span>
  )
}

// ============================================
// HOVER SCALE - Premium Scale Effect
// ============================================

interface HoverScaleProps {
  children: ReactNode
  className?: string
  scale?: number
  tapScale?: number
}

export function HoverScale({ 
  children, 
  className = '', 
  scale = 1.05,
  tapScale = 0.95
}: HoverScaleProps) {
  return (
    <motion.div
      whileHover={{ scale, transition: { duration: 0.2 } }}
      whileTap={{ scale: tapScale }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

// ============================================
// TYPING DOTS - AI Thinking Indicator
// ============================================

export function TypingDots({ className = '' }: { className?: string }) {
  return (
    <div className={`flex items-center gap-1.5 ${className}`}>
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          className="w-2 h-2 rounded-full bg-gradient-to-r from-blue-500 to-blue-600"
          animate={{
            opacity: [0.3, 1, 0.3],
            y: [0, -4, 0],
            scale: [0.9, 1, 0.9],
          }}
          transition={{
            delay: i * 0.12,
            duration: 0.6,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  )
}

// ============================================
// SHIMMER - Premium Skeleton Loading
// ============================================

interface ShimmerProps {
  className?: string
  variant?: 'default' | 'premium'
}

export function Shimmer({ className = '', variant = 'premium' }: ShimmerProps) {
  return (
    <motion.div
      className={`${variant === 'premium' ? 'shimmer-premium' : 'shimmer'} ${className}`}
      animate={{
        backgroundPosition: ['200% 0', '-200% 0'],
      }}
      transition={{
        duration: variant === 'premium' ? 2 : 1.5,
        repeat: Infinity,
        ease: 'linear',
      }}
    />
  )
}

// ============================================
// RING PROGRESS - Premium Circular Progress
// ============================================

interface RingProgressProps {
  progress: number
  size?: number
  strokeWidth?: number
  className?: string
  color?: string
  bgColor?: string
  showValue?: boolean
  label?: string
  animated?: boolean
}

export function RingProgress({ 
  progress, 
  size = 120, 
  strokeWidth = 8,
  className = '',
  color = '#2563EB',
  bgColor = '#E5E7EB',
  showValue = true,
  label,
  animated = true
}: RingProgressProps) {
  const radius = (size - strokeWidth) / 2
  const circumference = radius * 2 * Math.PI
  const strokeDashoffset = circumference - (progress / 100) * circumference
  const center = size / 2

  return (
    <motion.div 
      className={`relative ${className}`} 
      style={{ width: size, height: size }}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      <svg width={size} height={size} className="transform -rotate-90">
        {/* Background circle with gradient */}
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke={bgColor}
          strokeWidth={strokeWidth}
          className="opacity-50"
        />
        
        {/* Progress circle */}
        <motion.circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          initial={animated ? { strokeDashoffset: circumference } : false}
          animate={{ strokeDashoffset }}
          transition={{ duration: 1, ease: 'easeOut' }}
          style={{
            strokeDasharray: circumference,
            filter: 'drop-shadow(0 0 6px rgba(37, 99, 235, 0.3))'
          }}
        />
      </svg>
      
      {showValue && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <motion.span 
              className="text-2xl font-bold text-gray-900"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              {progress}%
            </motion.span>
            {label && (
              <span className="text-xs text-gray-500 block mt-0.5">{label}</span>
            )}
          </div>
        </div>
      )}
    </motion.div>
  )
}

// ============================================
// ANIMATED PRESENCE WRAPPER
// ============================================

interface AnimatedPresenceWrapperProps {
  children: ReactNode
  show: boolean
  className?: string
}

export function AnimatedPresenceWrapper({ 
  children, 
  show,
  className = ''
}: AnimatedPresenceWrapperProps) {
  return (
    <AnimatePresence mode="wait">
      {show && (
        <motion.div
          initial={{ opacity: 0, y: 10, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -10, scale: 0.98 }}
          transition={{ duration: 0.2 }}
          className={className}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  )
}

// ============================================
// SLIDE IN - Directional Slide Animation
// ============================================

interface SlideInProps {
  children: ReactNode
  className?: string
  direction?: 'left' | 'right' | 'top' | 'bottom'
  delay?: number
}

export function SlideIn({ 
  children, 
  className = '',
  direction = 'left',
  delay = 0
}: SlideInProps) {
  const directionMap = {
    left: { x: -20, y: 0 },
    right: { x: 20, y: 0 },
    top: { x: 0, y: -20 },
    bottom: { x: 0, y: 20 },
  }

  return (
    <motion.div
      initial={{ opacity: 0, ...directionMap[direction] }}
      animate={{ opacity: 1, x: 0, y: 0 }}
      transition={{ 
        duration: 0.3, 
        delay,
        ease: EASE.enter 
      }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

// ============================================
// SCALE IN - Scale Entrance Animation
// ============================================

interface ScaleInProps {
  children: ReactNode
  className?: string
  delay?: number
  duration?: number
}

export function ScaleIn({ 
  children, 
  className = '',
  delay = 0,
  duration = 0.4
}: ScaleInProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ 
        duration,
        delay,
        ease: [0.16, 1, 0.3, 1]
      }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

// ============================================
// PULSE EFFECT - Attention Grabber
// ============================================

interface PulseEffectProps {
  children: ReactNode
  className?: string
  color?: string
}

export function PulseEffect({ 
  children, 
  className = '',
  color = 'rgba(37, 99, 235, 0.3)'
}: PulseEffectProps) {
  return (
    <div className={`relative ${className}`}>
      <motion.div
        className="absolute inset-0 rounded-full"
        style={{ backgroundColor: color }}
        animate={{
          scale: [1, 1.4, 1],
          opacity: [0.3, 0, 0.3],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />
      <div className="relative z-10">{children}</div>
    </div>
  )
}

// ============================================
// CONFETTI - Success Celebration
// ============================================

interface ConfettiProps {
  show: boolean
  onComplete?: () => void
}

export function Confetti({ show, onComplete }: ConfettiProps) {
  const colors = ['#2563EB', '#10B981', '#F59E0B', '#8B5CF6', '#EF4444']
  
  useEffect(() => {
    if (show && onComplete) {
      const timer = setTimeout(onComplete, 3000)
      return () => clearTimeout(timer)
    }
  }, [show, onComplete])
  
  if (!show) return null
  
  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {Array.from({ length: 50 }).map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-2 h-2 rounded-full"
          style={{
            backgroundColor: colors[i % colors.length],
            left: `${Math.random() * 100}%`,
            top: '-10px',
          }}
          initial={{ y: -10, opacity: 1, rotate: 0 }}
          animate={{
            y: window.innerHeight + 100,
            opacity: [1, 1, 0],
            rotate: Math.random() * 720 - 360,
            x: [0, Math.random() * 100 - 50, Math.random() * 200 - 100],
          }}
          transition={{
            duration: 2 + Math.random() * 2,
            delay: Math.random() * 0.5,
            ease: 'easeOut',
          }}
        />
      ))}
    </div>
  )
}

// ============================================
// OPTION CARD - Question Option with Animation
// ============================================

interface OptionCardProps {
  children: ReactNode
  selected?: boolean
  onClick: () => void
  className?: string
  label: string
}

export function OptionCard({ 
  children, 
  selected = false, 
  onClick,
  className = '',
  label
}: OptionCardProps) {
  return (
    <motion.button
      onClick={onClick}
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      whileHover={{ x: 4, transition: { duration: 0.15 } }}
      whileTap={{ scale: 0.99 }}
      className={`
        w-full text-left p-4 rounded-xl border-2 transition-all duration-200
        ${selected 
          ? 'border-blue-500 bg-gradient-to-r from-blue-50 to-indigo-50 shadow-md shadow-blue-500/10' 
          : 'border-gray-200 bg-white hover:border-blue-300 hover:bg-blue-50/50'
        }
        ${className}
      `}
    >
      <div className="flex items-start gap-3">
        <motion.div
          className={`
            flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center 
            font-semibold text-sm transition-all duration-200
            ${selected 
              ? 'bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/30' 
              : 'bg-gray-100 text-gray-500 border border-gray-200'
            }
          `}
          animate={selected ? { scale: [1, 1.1, 1] } : {}}
          transition={{ duration: 0.2 }}
        >
          {label}
        </motion.div>
        <div className="flex-1 pt-1">
          {children}
        </div>
      </div>
    </motion.button>
  )
}

// ============================================
// DIFFICULTY RING - Animated Difficulty Gauge
// ============================================

interface DifficultyRingProps {
  value: number // 0-100
  size?: number
  strokeWidth?: number
  className?: string
}

export function DifficultyRing({ 
  value, 
  size = 140, 
  strokeWidth = 12,
  className = ''
}: DifficultyRingProps) {
  const radius = (size - strokeWidth) / 2
  const circumference = radius * 2 * Math.PI
  const strokeDashoffset = circumference - (value / 100) * circumference
  const center = size / 2

  // Color based on difficulty
  const getColor = (v: number) => {
    if (v < 35) return '#10B981' // Green - Easy
    if (v < 65) return '#2563EB' // Blue - Medium
    return '#EF4444' // Red - Hard
  }

  const getLabel = (v: number) => {
    if (v < 35) return 'Easy'
    if (v < 65) return 'Medium'
    return 'Hard'
  }

  const color = getColor(value)

  return (
    <motion.div 
      className={`relative ${className}`} 
      style={{ width: size, height: size }}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      {/* Outer glow */}
      <div 
        className="absolute inset-0 rounded-full blur-md opacity-20"
        style={{ backgroundColor: color }}
      />
      
      <svg width={size} height={size} className="transform -rotate-90 relative z-10">
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
        
        {/* Gradient definition */}
        <defs>
          <linearGradient id="difficultyGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#10B981" />
            <stop offset="50%" stopColor="#2563EB" />
            <stop offset="100%" stopColor="#EF4444" />
          </linearGradient>
        </defs>
        
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
          transition={{ duration: 0.8, ease: 'easeOut' }}
          style={{
            strokeDasharray: circumference,
            filter: `drop-shadow(0 0 8px ${color}40)`
          }}
        />
        
        {/* Tick marks */}
        {Array.from({ length: 12 }).map((_, i) => {
          const angle = (i * 30 - 90) * (Math.PI / 180)
          const x1 = center + (radius - strokeWidth / 2 - 4) * Math.cos(angle)
          const y1 = center + (radius - strokeWidth / 2 - 4) * Math.sin(angle)
          const x2 = center + (radius - strokeWidth / 2 - 8) * Math.cos(angle)
          const y2 = center + (radius - strokeWidth / 2 - 8) * Math.sin(angle)
          return (
            <line
              key={i}
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              stroke="#9CA3AF"
              strokeWidth={1.5}
              strokeLinecap="round"
            />
          )
        })}
      </svg>
      
      {/* Center content */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center">
          <motion.div
            className="text-3xl font-bold"
            style={{ color }}
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3, duration: 0.2 }}
          >
            {Math.round(value)}
          </motion.div>
          <motion.div
            className="text-xs text-gray-500 mt-1 font-medium"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            {getLabel(value)}
          </motion.div>
        </div>
      </div>
    </motion.div>
  )
}

// ============================================
// TIME BAR - Animated Time Estimate
// ============================================

interface TimeBarProps {
  minutes: number
  questionCount: number
  className?: string
}

export function TimeBar({ minutes, questionCount, className = '' }: TimeBarProps) {
  const avgTimePerQuestion = minutes / questionCount
  const maxMinutes = 180
  
  // Color based on time pressure
  const getTimeColor = (avg: number) => {
    if (avg >= 2.5) return '#10B981' // Green - Relaxed
    if (avg >= 1.5) return '#2563EB' // Blue - Normal
    return '#F59E0B' // Amber - Tight
  }

  const color = getTimeColor(avgTimePerQuestion)
  const percentage = (minutes / maxMinutes) * 100

  return (
    <motion.div 
      className={`bg-gray-50 rounded-xl p-4 ${className}`}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <motion.div
            animate={{ rotate: [0, 5, -5, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <svg className="w-4 h-4" style={{ color }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <polyline points="12,6 12,12 16,14" />
            </svg>
          </motion.div>
          <span className="text-sm font-medium text-gray-700">Estimated Time</span>
        </div>
        <span className="text-lg font-bold text-gray-900">{minutes} min</span>
      </div>
      
      {/* Progress bar */}
      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
        <motion.div
          className="h-full rounded-full"
          style={{ backgroundColor: color }}
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        />
      </div>
      
      {/* Time markers */}
      <div className="flex justify-between mt-2 text-xs text-gray-400">
        <span>0</span>
        <span>45</span>
        <span>90</span>
        <span>180</span>
      </div>
      
      {/* Stats */}
      <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-200">
        <div className="text-center">
          <div className="text-xs text-gray-500">Avg. per Q</div>
          <div className="text-sm font-semibold text-gray-700">
            {avgTimePerQuestion.toFixed(1)} min
          </div>
        </div>
        <div className="text-center">
          <div className="text-xs text-gray-500">Questions</div>
          <div className="text-sm font-semibold text-gray-700">{questionCount}</div>
        </div>
        <div className="text-center">
          <div className="text-xs text-gray-500">Pace</div>
          <div 
            className="text-sm font-semibold"
            style={{ color }}
          >
            {avgTimePerQuestion >= 2.5 ? 'Relaxed' : avgTimePerQuestion >= 1.5 ? 'Normal' : 'Tight'}
          </div>
        </div>
      </div>
    </motion.div>
  )
}

// ============================================
// COVERAGE METER - Question Availability
// ============================================

interface CoverageMeterProps {
  value: number // 0-100
  available: number
  required: number
  className?: string
}

export function CoverageMeter({ 
  value, 
  available, 
  required,
  className = ''
}: CoverageMeterProps) {
  const isSufficient = available >= required
  const color = isSufficient ? '#10B981' : '#F59E0B'

  return (
    <motion.div 
      className={`bg-gray-50 rounded-xl p-4 ${className}`}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
    >
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-gray-700">Coverage</span>
        <div className="flex items-center gap-1.5">
          {isSufficient ? (
            <motion.svg
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="w-4 h-4 text-emerald-500"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </motion.svg>
          ) : (
            <motion.svg
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="w-4 h-4 text-amber-500"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
              <line x1="12" y1="9" x2="12" y2="13" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </motion.svg>
          )}
          <span 
            className="text-sm font-semibold"
            style={{ color }}
          >
            {Math.min(100, value)}%
          </span>
        </div>
      </div>
      
      {/* Progress bar */}
      <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
        <motion.div
          className="h-full rounded-full relative overflow-hidden"
          style={{ backgroundColor: color }}
          initial={{ width: 0 }}
          animate={{ width: `${Math.min(100, value)}%` }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        >
          {/* Shimmer effect */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
            animate={{ x: ['-100%', '100%'] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
          />
        </motion.div>
      </div>
      
      {/* Question count */}
      <div className="flex items-center justify-between mt-2 text-xs">
        <span className="text-gray-500">
          {available} available
        </span>
        <span className="text-gray-500">
          {required} needed
        </span>
      </div>
    </motion.div>
  )
}

// ============================================
// ANIMATED COUNTER - Smooth Number Animation
// ============================================

interface AnimatedCounterProps {
  value: number
  duration?: number
  className?: string
  prefix?: string
  suffix?: string
  decimals?: number
}

export function AnimatedCounter({ 
  value, 
  duration = 0.5, 
  className = '',
  prefix = '',
  suffix = '',
  decimals = 0
}: AnimatedCounterProps) {
  const [displayValue, setDisplayValue] = useState(value)
  
  useEffect(() => {
    const startTime = Date.now()
    const startValue = displayValue
    const endValue = value
    
    const animate = () => {
      const now = Date.now()
      const progress = Math.min((now - startTime) / (duration * 1000), 1)
      
      // Ease out quart
      const easeOutQuart = 1 - Math.pow(1 - progress, 4)
      const currentValue = startValue + (endValue - startValue) * easeOutQuart
      
      setDisplayValue(currentValue)
      
      if (progress < 1) {
        requestAnimationFrame(animate)
      }
    }
    
    requestAnimationFrame(animate)
  }, [value, duration])
  
  return (
    <span className={className}>
      {prefix}{displayValue.toFixed(decimals)}{suffix}
    </span>
  )
}
