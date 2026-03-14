'use client'

import { motion } from 'framer-motion'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { 
  Atom, 
  FlaskConical, 
  Calculator, 
  Leaf, 
  BookOpen,
  AlertTriangle,
  ChevronRight,
  FileText,
  Layers
} from 'lucide-react'
import type { Subject } from '../types'
import { cn } from '@/lib/utils'

interface SubjectCardProps {
  subject: Subject
  onClick: () => void
  selectedGrade?: string | null
  selectedExam?: string | null
}

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Atom,
  FlaskConical,
  Calculator,
  Leaf,
  BookOpen,
}

// Animated progress ring component
function ProgressRing({ 
  progress, 
  size = 48, 
  strokeWidth = 4,
  color = '#2563EB'
}: { 
  progress: number
  size?: number
  strokeWidth?: number
  color?: string
}) {
  const radius = (size - strokeWidth) / 2
  const circumference = radius * 2 * Math.PI
  const offset = circumference - (progress / 100) * circumference

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg
        width={size}
        height={size}
        className="transform -rotate-90"
      >
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-gray-100"
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
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ 
            duration: 1, 
            ease: 'easeOut',
            delay: 0.3
          }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <motion.span 
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5, duration: 0.3 }}
          className="text-xs font-semibold text-gray-700"
        >
          {progress}%
        </motion.span>
      </div>
    </div>
  )
}

export function SubjectCard({ 
  subject, 
  onClick,
  selectedGrade,
  selectedExam 
}: SubjectCardProps) {
  const IconComponent = iconMap[subject.icon] || BookOpen
  
  // Check if subject is relevant for selected exam
  const isRelevant = !selectedExam || 
    subject.exam === 'Both' || 
    subject.exam === selectedExam

  return (
    <motion.div
      initial={{ opacity: 0, y: 16, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      whileHover={{ 
        y: -4,
        boxShadow: '0 12px 28px -8px rgba(37, 99, 235, 0.15)',
      }}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.25, ease: [0.25, 0.46, 0.45, 0.94] }}
      className="h-full"
    >
      <Card
        className={cn(
          "group relative bg-white border-gray-100 hover:border-blue-300 transition-all duration-200 cursor-pointer overflow-hidden h-full flex flex-col",
          !isRelevant && "opacity-60"
        )}
        onClick={onClick}
      >
        {/* Header with Icon */}
        <div className="p-4 border-b border-gray-50">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <motion.div 
                className="w-12 h-12 rounded-xl flex items-center justify-center shadow-lg"
                style={{ 
                  backgroundColor: `${subject.color}15`,
                  boxShadow: `0 4px 12px -2px ${subject.color}30`
                }}
                whileHover={{ scale: 1.05, rotate: 5 }}
                transition={{ duration: 0.2 }}
              >
                <IconComponent 
                  className="h-6 w-6"
                  style={{ color: subject.color }}
                />
              </motion.div>
              <div>
                <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                  {subject.name}
                </h3>
                <p className="text-xs text-gray-400">{subject.code}</p>
              </div>
            </div>
            
            {/* Exam Badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 }}
            >
              <Badge 
                variant="outline" 
                className={cn(
                  "text-xs",
                  subject.exam === 'JEE' && "bg-blue-50 text-blue-700 border-blue-200",
                  subject.exam === 'NEET' && "bg-emerald-50 text-emerald-700 border-emerald-200",
                  subject.exam === 'Both' && "bg-purple-50 text-purple-700 border-purple-200"
                )}
              >
                {subject.exam}
              </Badge>
            </motion.div>
          </div>
        </div>

        {/* Stats */}
        <div className="p-4 space-y-4 flex-1">
          {/* Progress Ring */}
          <div className="flex items-center gap-4">
            <ProgressRing 
              progress={subject.userProgress} 
              size={52}
              strokeWidth={4}
              color={subject.color}
            />
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-700">Your Progress</p>
              <p className="text-xs text-gray-400">
                {subject.userProgress >= 75 ? 'Almost there!' : 
                 subject.userProgress >= 50 ? 'Halfway done' : 
                 subject.userProgress >= 25 ? 'Good start!' : 'Just getting started'}
              </p>
            </div>
          </div>

          {/* Resource Counts */}
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 rounded-lg">
              <Layers className="h-4 w-4 text-gray-400" />
              <span className="text-gray-600">{subject.totalChapters} chapters</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 rounded-lg">
              <FileText className="h-4 w-4 text-gray-400" />
              <span className="text-gray-600">{subject.totalResources} resources</span>
            </div>
          </div>

          {/* Weak Topics Warning */}
          {subject.weakTopicCount > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="flex items-center gap-2 text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg border border-red-100"
            >
              <AlertTriangle className="h-4 w-4" />
              <span>{subject.weakTopicCount} weak topic{subject.weakTopicCount > 1 ? 's' : ''} need attention</span>
            </motion.div>
          )}
        </div>

        {/* Hover Indicator */}
        <motion.div
          initial={{ opacity: 0, x: -8 }}
          animate={{ opacity: isRelevant ? 1 : 0 }}
          className="absolute right-4 top-1/2 -translate-y-1/2 group-hover:opacity-100 opacity-0 transition-opacity"
        >
          <motion.div
            animate={{ x: [0, 4, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            <ChevronRight className="h-5 w-5 text-blue-500" />
          </motion.div>
        </motion.div>
      </Card>
    </motion.div>
  )
}
