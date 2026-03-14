'use client'

import { useEffect, useState, useRef } from 'react'
import { motion, useSpring, useTransform, useInView, type MotionValue } from 'framer-motion'
import { cn } from '@/lib/utils'

interface AnimatedCounterProps {
  value: number
  duration?: number
  className?: string
  prefix?: string
  suffix?: string
  decimals?: number
  triggerOnView?: boolean
}

function useAnimatedCounter(value: number, duration: number, inView: boolean) {
  const spring = useSpring(0, { duration: duration * 1000 })
  const display = useTransform(spring, (current) => Math.round(current))

  useEffect(() => {
    if (inView) {
      spring.set(value)
    }
  }, [spring, value, inView])

  return display
}

export function AnimatedCounter({
  value,
  duration = 1,
  className,
  prefix = '',
  suffix = '',
  decimals = 0,
  triggerOnView = true,
}: AnimatedCounterProps) {
  const ref = useRef<HTMLSpanElement>(null)
  const isInView = useInView(ref, { once: true })
  const [displayValue, setDisplayValue] = useState(0)

  useEffect(() => {
    if (!triggerOnView || isInView) {
      const startTime = Date.now()
      const endTime = startTime + duration * 1000

      const animate = () => {
        const now = Date.now()
        const progress = Math.min((now - startTime) / (duration * 1000), 1)
        const easeOut = 1 - Math.pow(1 - progress, 3)
        const current = value * easeOut

        setDisplayValue(decimals > 0 ? parseFloat(current.toFixed(decimals)) : Math.round(current))

        if (now < endTime) {
          requestAnimationFrame(animate)
        }
      }

      requestAnimationFrame(animate)
    }
  }, [value, duration, decimals, triggerOnView, isInView])

  return (
    <motion.span
      ref={ref}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={cn('tabular-nums', className)}
    >
      {prefix}
      {decimals > 0 ? displayValue.toFixed(decimals) : displayValue}
      {suffix}
    </motion.span>
  )
}

// Stats card with animated counter
interface StatCardProps {
  label: string
  value: number
  icon?: React.ElementType
  prefix?: string
  suffix?: string
  trend?: {
    value: number
    isPositive: boolean
  }
  color?: 'blue' | 'green' | 'purple' | 'orange' | 'red'
  className?: string
}

const colorMap = {
  blue: 'from-blue-500 to-blue-600',
  green: 'from-green-500 to-green-600',
  purple: 'from-purple-500 to-purple-600',
  orange: 'from-orange-500 to-orange-600',
  red: 'from-red-500 to-red-600',
}

const bgColorMap = {
  blue: 'bg-blue-50',
  green: 'bg-green-50',
  purple: 'bg-purple-50',
  orange: 'bg-orange-50',
  red: 'bg-red-50',
}

export function AnimatedStatCard({
  label,
  value,
  icon: Icon,
  prefix = '',
  suffix = '',
  trend,
  color = 'blue',
  className,
}: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      transition={{ duration: 0.3 }}
      className={cn(
        'relative p-4 rounded-xl bg-white border border-gray-100 overflow-hidden',
        'hover:border-blue-200 hover:shadow-lg hover:shadow-blue-500/5 transition-all duration-200',
        className
      )}
    >
      {/* Background decoration */}
      <div className={cn(
        'absolute -top-4 -right-4 w-24 h-24 rounded-full opacity-50 blur-2xl',
        bgColorMap[color]
      )} />

      <div className="relative flex items-center gap-3">
        {Icon && (
          <motion.div
            whileHover={{ scale: 1.1, rotate: 5 }}
            className={cn(
              'w-11 h-11 rounded-xl bg-gradient-to-br flex items-center justify-center text-white shadow-lg',
              colorMap[color]
            )}
          >
            <Icon className="w-5 h-5" />
          </motion.div>
        )}
        <div>
          <p className="text-sm text-gray-500">{label}</p>
          <div className="flex items-baseline gap-2">
            <AnimatedCounter
              value={value}
              prefix={prefix}
              suffix={suffix}
              className="text-2xl font-bold text-gray-900"
            />
            {trend && (
              <motion.span
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                className={cn(
                  'text-xs font-medium',
                  trend.isPositive ? 'text-green-600' : 'text-red-600'
                )}
              >
                {trend.isPositive ? '+' : ''}{trend.value}%
              </motion.span>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  )
}
