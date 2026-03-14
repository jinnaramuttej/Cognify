'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'

interface SegmentToggleProps<T extends string> {
  options: { value: T; label: string }[]
  value: T | null
  onChange: (value: T) => void
  className?: string
  size?: 'sm' | 'md' | 'lg'
}

export function SegmentToggle<T extends string>({
  options,
  value,
  onChange,
  className,
  size = 'md',
}: SegmentToggleProps<T>) {
  const sizeClasses = {
    sm: 'text-xs py-1 px-3',
    md: 'text-sm py-2 px-4',
    lg: 'text-base py-2.5 px-5',
  }

  return (
    <div className={cn('relative inline-flex rounded-xl bg-gray-100 p-1', className)}>
      {options.map((option) => (
        <button
          key={option.value}
          onClick={() => onChange(option.value)}
          className={cn(
            'relative z-10 font-medium transition-colors duration-200 rounded-lg',
            sizeClasses[size],
            value === option.value ? 'text-gray-900' : 'text-gray-500 hover:text-gray-700'
          )}
        >
          {value === option.value && (
            <motion.div
              layoutId="segment-bg"
              className="absolute inset-0 bg-white rounded-lg shadow-sm"
              initial={false}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            />
          )}
          <span className="relative z-10">{option.label}</span>
        </button>
      ))}
    </div>
  )
}

// Grade/Exam Selector Component
interface GradeExamSelectorProps {
  grade: '11' | '12' | null
  exam: 'JEE' | 'NEET' | null
  onGradeChange: (grade: '11' | '12' | null) => void
  onExamChange: (exam: 'JEE' | 'NEET' | null) => void
  className?: string
}

export function GradeExamSelector({
  grade,
  exam,
  onGradeChange,
  onExamChange,
  className,
}: GradeExamSelectorProps) {
  const gradeOptions = [
    { value: '11' as const, label: 'Class 11' },
    { value: '12' as const, label: 'Class 12' },
  ]

  const examOptions = [
    { value: 'JEE' as const, label: 'JEE' },
    { value: 'NEET' as const, label: 'NEET' },
  ]

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className={cn('flex flex-col sm:flex-row gap-4', className)}
    >
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-600">Grade</label>
        <SegmentToggle
          options={gradeOptions}
          value={grade}
          onChange={onGradeChange}
        />
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-600">Exam</label>
        <SegmentToggle
          options={examOptions}
          value={exam}
          onChange={onExamChange}
        />
      </div>
    </motion.div>
  )
}
