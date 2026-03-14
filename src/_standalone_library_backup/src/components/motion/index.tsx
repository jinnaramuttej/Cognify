'use client'

import { motion, AnimatePresence, type MotionProps } from 'framer-motion'
import { forwardRef } from 'react'
import { cn } from '@/lib/utils'
import {
  fadeInVariants,
  scaleInVariants,
  slideInRightVariants,
  defaultViewport,
  type Variants,
} from '@/lib/motion'

// Page wrapper with entrance animation
interface PageWrapperProps extends MotionProps {
  children: React.ReactNode
  className?: string
}

export function PageWrapper({ children, className, ...props }: PageWrapperProps) {
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      exit="exit"
      variants={{
        hidden: {
          opacity: 0,
          y: 12,
        },
        visible: {
          opacity: 1,
          y: 0,
          transition: {
            duration: 0.35,
            ease: [0.25, 0.46, 0.45, 0.94],
          },
        },
        exit: {
          opacity: 0,
          y: -8,
          transition: {
            duration: 0.2,
          },
        },
      }}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  )
}

// Stagger container for list animations
interface StaggerContainerProps extends MotionProps {
  children: React.ReactNode
  className?: string
  delay?: number
}

export function StaggerContainer({ children, className, delay = 0.1, ...props }: StaggerContainerProps) {
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={{
        hidden: { opacity: 0 },
        visible: {
          opacity: 1,
          transition: {
            staggerChildren: 0.05,
            delayChildren: delay,
          },
        },
      }}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  )
}

// Stagger item - children of StaggerContainer
interface StaggerItemProps extends MotionProps {
  children: React.ReactNode
  className?: string
}

export function StaggerItem({ children, className, ...props }: StaggerItemProps) {
  return (
    <motion.div
      variants={{
        hidden: {
          opacity: 0,
          y: 16,
          scale: 0.98,
        },
        visible: {
          opacity: 1,
          y: 0,
          scale: 1,
          transition: {
            duration: 0.3,
            ease: [0.25, 0.46, 0.45, 0.94],
          },
        },
      }}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  )
}

// Fade in wrapper
interface FadeInProps extends MotionProps {
  children: React.ReactNode
  className?: string
  delay?: number
}

export function FadeIn({ children, className, delay = 0, ...props }: FadeInProps) {
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      exit="exit"
      variants={{
        hidden: { opacity: 0 },
        visible: {
          opacity: 1,
          transition: { duration: 0.3, delay },
        },
        exit: { opacity: 0, transition: { duration: 0.2 } },
      }}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  )
}

// Animated card with hover effects
interface AnimatedCardProps extends MotionProps {
  children: React.ReactNode
  className?: string
  onClick?: () => void
  disabled?: boolean
  hoverScale?: number
  hoverY?: number
}

export const AnimatedCard = forwardRef<HTMLDivElement, AnimatedCardProps>(
  ({ children, className, onClick, disabled = false, hoverScale = 1.01, hoverY = -4, ...props }, ref) => {
    return (
      <motion.div
        ref={ref}
        initial="rest"
        whileHover={disabled ? undefined : 'hover'}
        whileTap={disabled || !onClick ? undefined : 'tap'}
        variants={{
          rest: {
            scale: 1,
            y: 0,
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
          },
          hover: {
            scale: hoverScale,
            y: hoverY,
            boxShadow: '0 12px 24px -8px rgba(37, 99, 235, 0.12)',
            transition: {
              duration: 0.2,
              ease: [0.25, 0.46, 0.45, 0.94],
            },
          },
          tap: {
            scale: 0.995,
            transition: { duration: 0.1 },
          },
        }}
        onClick={onClick}
        className={cn(
          'bg-white border border-gray-200 rounded-xl transition-colors duration-200',
          !disabled && onClick && 'cursor-pointer hover:border-blue-500/50',
          disabled && 'opacity-60 cursor-not-allowed',
          className
        )}
        {...props}
      >
        {children}
      </motion.div>
    )
  }
)
AnimatedCard.displayName = 'AnimatedCard'

// Animated button wrapper
interface AnimatedButtonProps extends MotionProps {
  children: React.ReactNode
  className?: string
  onClick?: () => void
  disabled?: boolean
}

export function AnimatedButton({ children, className, onClick, disabled = false, ...props }: AnimatedButtonProps) {
  return (
    <motion.button
      initial="rest"
      whileHover={disabled ? undefined : 'hover'}
      whileTap={disabled || !onClick ? undefined : 'tap'}
      variants={{
        rest: { scale: 1 },
        hover: { scale: 1.02, transition: { duration: 0.15 } },
        tap: { scale: 0.98, transition: { duration: 0.1 } },
      }}
      onClick={onClick}
      disabled={disabled}
      className={className}
      {...props}
    >
      {children}
    </motion.button>
  )
}

// Scale in wrapper for modals/dialogs
interface ScaleInProps extends MotionProps {
  children: React.ReactNode
  className?: string
  isOpen?: boolean
}

export function ScaleIn({ children, className, isOpen = true, ...props }: ScaleInProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial="hidden"
          animate="visible"
          exit="exit"
          variants={scaleInVariants}
          className={className}
          {...props}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  )
}

// Slide in from right wrapper
interface SlideInRightProps extends MotionProps {
  children: React.ReactNode
  className?: string
  isOpen?: boolean
}

export function SlideInRight({ children, className, isOpen = true, ...props }: SlideInRightProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial="hidden"
          animate="visible"
          exit="exit"
          variants={slideInRightVariants}
          className={className}
          {...props}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  )
}

// Number counter animation
interface CounterProps {
  value: number
  duration?: number
  className?: string
  prefix?: string
  suffix?: string
}

export function Counter({ value, duration = 0.8, className, prefix = '', suffix = '' }: CounterProps) {
  return (
    <motion.span
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={className}
    >
      {prefix}
      <motion.span
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration }}
      >
        {value}
      </motion.span>
      {suffix}
    </motion.span>
  )
}

// Shimmer loading effect
interface ShimmerProps {
  className?: string
}

export function Shimmer({ className }: ShimmerProps) {
  return (
    <motion.div
      initial={{ backgroundPosition: '200% 0' }}
      animate={{ backgroundPosition: '-200% 0' }}
      transition={{
        duration: 1.5,
        repeat: Infinity,
        ease: 'linear',
      }}
      className={cn(
        'bg-gradient-to-r from-gray-100 via-gray-50 to-gray-100 bg-[length:200%_100%]',
        className
      )}
    />
  )
}

// Animated underline for headers
interface AnimatedUnderlineProps {
  children: React.ReactNode
  className?: string
  color?: string
}

export function AnimatedUnderline({ children, className, color = 'bg-blue-500' }: AnimatedUnderlineProps) {
  return (
    <span className="relative inline-block">
      {children}
      <motion.span
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{
          duration: 0.4,
          ease: [0.25, 0.46, 0.45, 0.94],
          delay: 0.2,
        }}
        className={cn(
          'absolute bottom-0 left-0 w-full h-0.5 origin-left',
          color
        )}
      />
    </span>
  )
}

// Typing dots animation
interface TypingDotsProps {
  className?: string
}

export function TypingDots({ className }: TypingDotsProps) {
  return (
    <span className={cn('inline-flex gap-1', className)}>
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          initial={{ opacity: 0.3 }}
          animate={{ opacity: [0.3, 1, 0.3] }}
          transition={{
            duration: 1,
            repeat: Infinity,
            delay: i * 0.15,
          }}
          className="w-1.5 h-1.5 rounded-full bg-current"
        />
      ))}
    </span>
  )
}

// Presence wrapper for conditional rendering
interface PresenceWrapperProps {
  children: React.ReactNode
  show: boolean
  className?: string
  variants?: Variants
}

export function PresenceWrapper({ children, show, className, variants = fadeInVariants }: PresenceWrapperProps) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial="hidden"
          animate="visible"
          exit="exit"
          variants={variants}
          className={className}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  )
}

// Lazy load animation - triggers when element enters viewport
interface LazyAnimateProps extends MotionProps {
  children: React.ReactNode
  className?: string
  variants?: Variants
}

export function LazyAnimate({ children, className, variants = fadeInVariants, ...props }: LazyAnimateProps) {
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      exit="exit"
      viewport={defaultViewport}
      variants={variants}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  )
}
