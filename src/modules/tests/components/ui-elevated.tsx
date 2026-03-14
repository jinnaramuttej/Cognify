'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { ReactNode } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { cn } from '@/modules/tests/utils'
import { EASE, TIMING } from '../utils/motion'

// ============================================
// PAGE HEADER - Premium Animated Section Header
// ============================================

interface PageHeaderProps {
  title: string
  subtitle?: string
  badge?: string
  badgeVariant?: 'default' | 'success' | 'warning' | 'error' | 'premium'
  icon?: ReactNode
  action?: ReactNode
  className?: string
  gradient?: boolean
}

export function PageHeader({
  title,
  subtitle,
  badge,
  badgeVariant = 'default',
  icon,
  action,
  className = '',
  gradient = false
}: PageHeaderProps) {
  const badgeColors = {
    default: 'bg-blue-50 text-blue-700 border-blue-200',
    success: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    warning: 'bg-amber-50 text-amber-700 border-amber-200',
    error: 'bg-red-50 text-red-700 border-red-200',
    premium: 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white border-0 shadow-lg shadow-blue-500/20'
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: EASE.enter }}
      className={cn("relative", className)}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-4">
          {icon && (
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.1, duration: 0.3, type: 'spring', stiffness: 300 }}
              className="p-3 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg shadow-blue-500/20"
            >
              <div className="text-white">{icon}</div>
            </motion.div>
          )}
          <div>
            <div className="flex items-center gap-3 flex-wrap">
              <motion.h1
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.15, ease: EASE.enter }}
                className={cn(
                  "text-2xl font-bold tracking-tight",
                  gradient ? "text-gradient-primary" : "text-gray-900"
                )}
              >
                {title}
              </motion.h1>
              {badge && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.25, type: 'spring', stiffness: 400 }}
                >
                  <Badge className={cn("border font-medium", badgeColors[badgeVariant])}>
                    {badge}
                  </Badge>
                </motion.div>
              )}
            </div>
            {subtitle && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.3 }}
                className="text-sm text-gray-500 mt-1"
              >
                {subtitle}
              </motion.p>
            )}
          </div>
        </div>
        {action && (
          <motion.div
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2, ease: EASE.enter }}
          >
            {action}
          </motion.div>
        )}
      </div>
      
      {/* Animated gradient underline */}
      <motion.div
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ delay: 0.3, duration: 0.5, ease: EASE.smooth }}
        className="mt-4 h-px bg-gradient-to-r from-blue-500/50 via-blue-500/20 to-transparent origin-left"
      />
    </motion.div>
  )
}

// ============================================
// SECTION HEADER - For Subsections
// ============================================

interface SectionHeaderProps {
  title: string
  subtitle?: string
  action?: ReactNode
  className?: string
  animated?: boolean
}

export function SectionHeader({
  title,
  subtitle,
  action,
  className = '',
  animated = true
}: SectionHeaderProps) {
  const Wrapper = animated ? motion.div : 'div'
  
  return (
    <motion.div
      initial={animated ? { opacity: 0, y: 10 } : false}
      animate={animated ? { opacity: 1, y: 0 } : false}
      transition={{ duration: 0.3 }}
      className={cn("flex items-center justify-between", className)}
    >
      <div>
        <h2 className="text-base font-semibold text-gray-900">{title}</h2>
        {subtitle && (
          <p className="text-sm text-gray-500 mt-0.5">{subtitle}</p>
        )}
      </div>
      {action}
    </motion.div>
  )
}

// ============================================
// STAT CARD - Premium Animated Stat Display
// ============================================

interface StatCardProps {
  label: string
  value: string | number
  icon?: ReactNode
  trend?: 'up' | 'down' | 'neutral'
  trendValue?: string
  color?: 'blue' | 'emerald' | 'amber' | 'red' | 'purple' | 'gradient'
  className?: string
  animated?: boolean
  delay?: number
}

export function StatCard({
  label,
  value,
  icon,
  trend,
  trendValue,
  color = 'blue',
  className = '',
  animated = true,
  delay = 0
}: StatCardProps) {
  const colors = {
    blue: {
      bg: 'bg-blue-50',
      icon: 'bg-gradient-to-br from-blue-500 to-blue-600',
      text: 'text-blue-700',
      shadow: 'shadow-blue-500/20'
    },
    emerald: {
      bg: 'bg-emerald-50',
      icon: 'bg-gradient-to-br from-emerald-500 to-emerald-600',
      text: 'text-emerald-700',
      shadow: 'shadow-emerald-500/20'
    },
    amber: {
      bg: 'bg-amber-50',
      icon: 'bg-gradient-to-br from-amber-500 to-amber-600',
      text: 'text-amber-700',
      shadow: 'shadow-amber-500/20'
    },
    red: {
      bg: 'bg-red-50',
      icon: 'bg-gradient-to-br from-red-500 to-red-600',
      text: 'text-red-700',
      shadow: 'shadow-red-500/20'
    },
    purple: {
      bg: 'bg-purple-50',
      icon: 'bg-gradient-to-br from-purple-500 to-purple-600',
      text: 'text-purple-700',
      shadow: 'shadow-purple-500/20'
    },
    gradient: {
      bg: 'bg-gradient-to-br from-blue-50 to-indigo-50',
      icon: 'bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-500',
      text: 'text-blue-700',
      shadow: 'shadow-indigo-500/20'
    }
  }

  const colorSet = colors[color]

  return (
    <motion.div
      initial={animated ? { opacity: 0, y: 15, scale: 0.95 } : false}
      animate={animated ? { opacity: 1, y: 0, scale: 1 } : false}
      transition={{ duration: 0.4, delay, ease: EASE.enter }}
      whileHover={{ y: -2, transition: { duration: 0.15 } }}
      className={cn(
        "relative overflow-hidden p-4 rounded-xl border border-gray-100 bg-white",
        "shadow-sm hover:shadow-md hover:border-blue-100 transition-all duration-200",
        className
      )}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-xs text-gray-500 uppercase tracking-wide font-medium">{label}</p>
          <motion.p
            initial={animated ? { opacity: 0, scale: 0.9 } : false}
            animate={animated ? { opacity: 1, scale: 1 } : false}
            transition={{ delay: delay + 0.1 }}
            className={cn("text-2xl font-bold mt-1", colorSet.text)}
          >
            {value}
          </motion.p>
          {trend && trendValue && (
            <motion.div
              initial={animated ? { opacity: 0 } : false}
              animate={animated ? { opacity: 1 } : false}
              transition={{ delay: delay + 0.15 }}
              className={cn(
                "flex items-center gap-1 mt-1.5 text-xs font-medium",
                trend === 'up' && "text-emerald-600",
                trend === 'down' && "text-red-600",
                trend === 'neutral' && "text-gray-500"
              )}
            >
              {trend === 'up' && (
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                </svg>
              )}
              {trend === 'down' && (
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                </svg>
              )}
              <span>{trendValue}</span>
            </motion.div>
          )}
        </div>
        {icon && (
          <motion.div
            initial={animated ? { scale: 0, rotate: -180 } : false}
            animate={animated ? { scale: 1, rotate: 0 } : false}
            transition={{ delay: delay + 0.15, type: 'spring', stiffness: 400, damping: 15 }}
            className={cn("p-2.5 rounded-xl shadow-lg", colorSet.icon, colorSet.shadow)}
          >
            <div className="text-white w-5 h-5 flex items-center justify-center">{icon}</div>
          </motion.div>
        )}
      </div>
      
      {/* Subtle gradient overlay */}
      <div className={cn(
        "absolute inset-0 pointer-events-none",
        colorSet.bg
      )} style={{ opacity: 0.3 }} />
    </motion.div>
  )
}

// ============================================
// EMPTY STATE - Premium Empty State
// ============================================

interface EmptyStateProps {
  icon: ReactNode
  title: string
  description: string
  action?: ReactNode
  className?: string
  size?: 'sm' | 'md' | 'lg'
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  className = '',
  size = 'md'
}: EmptyStateProps) {
  const sizes = {
    sm: { icon: 'w-12 h-12', py: 'py-8' },
    md: { icon: 'w-16 h-16', py: 'py-12' },
    lg: { icon: 'w-20 h-20', py: 'py-16' }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: EASE.enter }}
      className={cn(
        "flex flex-col items-center justify-center px-4",
        sizes[size].py,
        className
      )}
    >
      <motion.div
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ delay: 0.1, type: 'spring', stiffness: 200, damping: 15 }}
        className={cn(
          sizes[size].icon,
          "rounded-2xl bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center mb-4 shadow-inner border border-gray-200/50"
        )}
      >
        <div className="text-gray-400">{icon}</div>
      </motion.div>
      <motion.h3
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="text-base font-semibold text-gray-900 mb-1"
      >
        {title}
      </motion.h3>
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="text-sm text-gray-500 text-center max-w-xs mb-4"
      >
        {description}
      </motion.p>
      {action && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
        >
          {action}
        </motion.div>
      )}
    </motion.div>
  )
}

// ============================================
// LOADING SKELETON - Premium Animated Skeleton
// ============================================

interface LoadingSkeletonProps {
  className?: string
  variant?: 'text' | 'card' | 'circle' | 'rect' | 'stat'
  count?: number
}

export function LoadingSkeleton({ 
  className = '',
  variant = 'rect',
  count = 1
}: LoadingSkeletonProps) {
  const variantClasses = {
    text: 'h-4 rounded',
    card: 'h-32 rounded-xl',
    circle: 'rounded-full aspect-square',
    rect: 'rounded-lg',
    stat: 'h-24 rounded-xl'
  }

  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: i * 0.05 }}
          className={cn(
            "shimmer-premium",
            variantClasses[variant],
            className
          )}
        />
      ))}
    </>
  )
}

// ============================================
// PROGRESS RING - Premium Circular Progress
// ============================================

interface ProgressRingProps {
  value: number
  max?: number
  size?: number
  strokeWidth?: number
  label?: string
  color?: string
  className?: string
  showValue?: boolean
  animated?: boolean
}

export function ProgressRing({
  value,
  max = 100,
  size = 80,
  strokeWidth = 6,
  label,
  color = '#2563EB',
  className = '',
  showValue = true,
  animated = true
}: ProgressRingProps) {
  const radius = (size - strokeWidth) / 2
  const circumference = radius * 2 * Math.PI
  const progress = (value / max) * 100
  const strokeDashoffset = circumference - (progress / 100) * circumference

  return (
    <motion.div
      initial={animated ? { opacity: 0, scale: 0.9 } : false}
      animate={animated ? { opacity: 1, scale: 1 } : false}
      transition={{ duration: 0.3 }}
      className={cn("relative", className)}
      style={{ width: size, height: size }}
    >
      <svg width={size} height={size} className="transform -rotate-90">
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#E5E7EB"
          strokeWidth={strokeWidth}
          className="opacity-50"
        />
        {/* Progress circle */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          initial={animated ? { strokeDashoffset: circumference } : false}
          animate={{ strokeDashoffset }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          style={{ 
            strokeDasharray: circumference,
            filter: `drop-shadow(0 0 6px ${color}40)`
          }}
        />
      </svg>
      {showValue && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <span className="text-lg font-bold text-gray-900">{value}</span>
            {label && (
              <span className="text-xs text-gray-500 block -mt-0.5">{label}</span>
            )}
          </div>
        </div>
      )}
    </motion.div>
  )
}

// ============================================
// LIVE INDICATOR - Animated Live Status
// ============================================

interface LiveIndicatorProps {
  label?: string
  className?: string
  color?: 'blue' | 'green' | 'red' | 'amber'
}

export function LiveIndicator({
  label = 'Live',
  className = '',
  color = 'green'
}: LiveIndicatorProps) {
  const colors = {
    blue: 'bg-blue-500',
    green: 'bg-emerald-500',
    red: 'bg-red-500',
    amber: 'bg-amber-500'
  }

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <span className="relative flex h-2.5 w-2.5">
        <motion.span
          className={cn("absolute inline-flex h-full w-full rounded-full opacity-75", colors[color])}
          animate={{ scale: [1, 1.5, 1], opacity: [0.75, 0, 0.75] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        />
        <span className={cn("relative inline-flex rounded-full h-2.5 w-2.5", colors[color])} />
      </span>
      <span className="text-xs font-medium text-gray-600">{label}</span>
    </div>
  )
}

// ============================================
// STATS GRID - Multiple Stat Cards
// ============================================

interface StatsGridProps {
  stats: Array<{
    label: string
    value: string | number
    icon?: ReactNode
    trend?: 'up' | 'down' | 'neutral'
    trendValue?: string
    color?: 'blue' | 'emerald' | 'amber' | 'red' | 'purple' | 'gradient'
  }>
  columns?: 2 | 3 | 4
  className?: string
}

export function StatsGrid({ stats, columns = 4, className = '' }: StatsGridProps) {
  const gridCols = {
    2: 'grid-cols-2',
    3: 'grid-cols-2 md:grid-cols-3',
    4: 'grid-cols-2 md:grid-cols-4'
  }

  return (
    <div className={cn("grid gap-4", gridCols[columns], className)}>
      {stats.map((stat, i) => (
        <StatCard
          key={stat.label}
          {...stat}
          delay={i * 0.05}
        />
      ))}
    </div>
  )
}

// ============================================
// ANIMATED BADGE - Badge with Animation
// ============================================

interface AnimatedBadgeProps {
  children: ReactNode
  variant?: 'default' | 'success' | 'warning' | 'error' | 'premium'
  className?: string
  pulse?: boolean
}

export function AnimatedBadge({
  children,
  variant = 'default',
  className = '',
  pulse = false
}: AnimatedBadgeProps) {
  const variants = {
    default: 'bg-blue-50 text-blue-700 border-blue-200',
    success: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    warning: 'bg-amber-50 text-amber-700 border-amber-200',
    error: 'bg-red-50 text-red-700 border-red-200',
    premium: 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white border-0 shadow-lg shadow-blue-500/20'
  }

  return (
    <motion.div
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 400, damping: 15 }}
      className={cn("relative", className)}
    >
      <Badge className={cn("border font-medium", variants[variant])}>
        {children}
      </Badge>
      {pulse && (
        <motion.span
          className={cn(
            "absolute inset-0 rounded-full",
            variant === 'premium' ? 'bg-blue-500' : 
            variant === 'success' ? 'bg-emerald-500' :
            variant === 'warning' ? 'bg-amber-500' :
            variant === 'error' ? 'bg-red-500' : 'bg-blue-500'
          )}
          animate={{ scale: [1, 1.3, 1], opacity: [0.5, 0, 0.5] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          style={{ zIndex: -1 }}
        />
      )}
    </motion.div>
  )
}
