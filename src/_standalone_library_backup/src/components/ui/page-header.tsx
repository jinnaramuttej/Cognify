'use client'

import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { AnimatedUnderline } from '@/components/motion'

interface PageHeaderProps {
  title: string
  subtitle?: string
  badge?: string
  badgeVariant?: 'default' | 'secondary' | 'outline' | 'destructive'
  icon?: React.ReactNode
  action?: React.ReactNode
  className?: string
  size?: 'sm' | 'md' | 'lg'
}

const sizeClasses = {
  sm: {
    title: 'text-lg font-semibold',
    subtitle: 'text-sm',
    icon: 'w-8 h-8',
  },
  md: {
    title: 'text-xl font-semibold',
    subtitle: 'text-sm',
    icon: 'w-10 h-10',
  },
  lg: {
    title: 'text-2xl font-bold',
    subtitle: 'text-base',
    icon: 'w-12 h-12',
  },
}

export function PageHeader({
  title,
  subtitle,
  badge,
  badgeVariant = 'default',
  icon,
  action,
  className,
  size = 'md',
}: PageHeaderProps) {
  const sizes = sizeClasses[size]

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] }}
      className={cn('flex items-start justify-between gap-4', className)}
    >
      <div className="flex items-start gap-4">
        {icon && (
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.3, delay: 0.1 }}
            className={cn(
              'rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/20',
              sizes.icon
            )}
          >
            {icon}
          </motion.div>
        )}
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <AnimatedUnderline>
              <h1 className={cn('text-gray-900', sizes.title)}>
                {title}
              </h1>
            </AnimatedUnderline>
            {badge && (
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.3, delay: 0.2 }}
              >
                <Badge variant={badgeVariant} className="text-xs">
                  {badge}
                </Badge>
              </motion.div>
            )}
          </div>
          {subtitle && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3, delay: 0.15 }}
              className={cn('text-gray-500', sizes.subtitle)}
            >
              {subtitle}
            </motion.p>
          )}
        </div>
      </div>
      {action && (
        <motion.div
          initial={{ opacity: 0, x: 8 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          {action}
        </motion.div>
      )}
    </motion.div>
  )
}

// Section header for subsections within a page
interface SectionHeaderProps {
  title: string
  subtitle?: string
  action?: React.ReactNode
  className?: string
}

export function SectionHeader({
  title,
  subtitle,
  action,
  className,
}: SectionHeaderProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.3 }}
      className={cn('flex items-center justify-between mb-4', className)}
    >
      <div>
        <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
        {subtitle && (
          <p className="text-sm text-gray-500 mt-0.5">{subtitle}</p>
        )}
      </div>
      {action && <div>{action}</div>}
    </motion.div>
  )
}
