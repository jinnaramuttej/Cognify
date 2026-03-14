'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { 
  CheckCircle, Flag, HelpCircle, Circle, 
  ChevronLeft, ChevronRight, X
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { cn } from '@/modules/tests/utils'
import type { QuestionState } from '@/modules/tests/types'

// ============================================
// TYPES
// ============================================

interface QuestionPaletteProps {
  questions: Array<{ id: string }>
  answers: Map<string, QuestionState>
  currentIndex: number
  onQuestionSelect: (index: number) => void
  stats: {
    answered: number
    marked: number
    notAnswered: number
    total: number
  }
  className?: string
}

// ============================================
// STATUS CONFIG
// ============================================

const STATUS_CONFIG = {
  answered: {
    bg: 'bg-emerald-100',
    border: 'border-emerald-400',
    text: 'text-emerald-700',
    icon: CheckCircle,
    label: 'Answered',
  },
  marked: {
    bg: 'bg-purple-100',
    border: 'border-purple-400',
    text: 'text-purple-700',
    icon: Flag,
    label: 'Marked for Review',
  },
  markedAnswered: {
    bg: 'bg-violet-100',
    border: 'border-violet-400',
    text: 'text-violet-700',
    icon: Flag,
    label: 'Marked & Answered',
  },
  notAnswered: {
    bg: 'bg-red-50',
    border: 'border-red-300',
    text: 'text-red-600',
    icon: X,
    label: 'Not Answered',
  },
  notVisited: {
    bg: 'bg-gray-50',
    border: 'border-gray-200',
    text: 'text-gray-500',
    icon: Circle,
    label: 'Not Visited',
  },
  current: {
    bg: 'bg-blue-100',
    border: 'border-blue-500',
    text: 'text-blue-700',
    icon: HelpCircle,
    label: 'Current',
  },
}

// ============================================
// QUESTION BUTTON COMPONENT
// ============================================

interface QuestionButtonProps {
  number: number
  state: QuestionState
  isCurrent: boolean
  onClick: () => void
}

function QuestionButton({ number, state, isCurrent, onClick }: QuestionButtonProps) {
  // Determine status
  const getStatus = () => {
    if (isCurrent) return 'current'
    if (state.selectedAnswer && state.isMarkedForReview) return 'markedAnswered'
    if (state.isMarkedForReview) return 'marked'
    if (state.selectedAnswer) return 'answered'
    if (state.visitCount > 0) return 'notAnswered'
    return 'notVisited'
  }

  const status = getStatus()
  const config = STATUS_CONFIG[status]
  const Icon = config.icon

  return (
    <motion.button
      onClick={onClick}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className={cn(
        "relative w-10 h-10 rounded-lg border-2 flex items-center justify-center",
        "font-semibold text-sm transition-all duration-200",
        "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1",
        config.bg,
        config.border,
        config.text,
        isCurrent && "ring-2 ring-blue-500 ring-offset-2 shadow-md"
      )}
    >
      {status === 'answered' && (
        <CheckCircle className="h-4 w-4" />
      )}
      {status === 'marked' && (
        <Flag className="h-4 w-4" />
      )}
      {status === 'markedAnswered' && (
        <div className="relative">
          <span>{number}</span>
          <Flag className="h-3 w-3 absolute -top-1 -right-2 text-purple-600" />
        </div>
      )}
      {status === 'notAnswered' && (
        <X className="h-4 w-4" />
      )}
      {status === 'notVisited' && (
        <span>{number}</span>
      )}
      {status === 'current' && (
        <span>{number}</span>
      )}
    </motion.button>
  )
}

// ============================================
// MAIN PALETTE COMPONENT
// ============================================

export function QuestionPalette({
  questions,
  answers,
  currentIndex,
  onQuestionSelect,
  stats,
  className = '',
}: QuestionPaletteProps) {
  return (
    <motion.aside
      initial={{ x: 100, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: 100, opacity: 0 }}
      transition={{ type: 'spring', stiffness: 200, damping: 25 }}
      className={cn(
        "w-72 border-l border-gray-200 bg-white flex flex-col",
        "hidden lg:flex", // Hidden on mobile, visible on lg+
        className
      )}
    >
      {/* Header */}
      <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
        <h3 className="font-semibold text-gray-900 mb-3">Question Navigator</h3>
        
        {/* Stats */}
        <div className="grid grid-cols-2 gap-2">
          <div className="flex items-center gap-2 p-2 rounded-lg bg-emerald-50 border border-emerald-100">
            <CheckCircle className="h-4 w-4 text-emerald-600" />
            <div>
              <div className="text-sm font-bold text-emerald-700">{stats.answered}</div>
              <div className="text-[10px] text-emerald-600">Answered</div>
            </div>
          </div>
          <div className="flex items-center gap-2 p-2 rounded-lg bg-purple-50 border border-purple-100">
            <Flag className="h-4 w-4 text-purple-600" />
            <div>
              <div className="text-sm font-bold text-purple-700">{stats.marked}</div>
              <div className="text-[10px] text-purple-600">Marked</div>
            </div>
          </div>
        </div>
      </div>

      {/* Question Grid */}
      <ScrollArea className="flex-1 p-4">
        <div className="grid grid-cols-5 gap-2">
          {questions.map((question, index) => {
            const state = answers.get(question.id) || {
              questionId: question.id,
              selectedAnswer: null,
              isMarkedForReview: false,
              isDoubtful: false,
              status: 'unattempted' as const,
              timeSpent: 0,
              visitCount: 0,
            }

            return (
              <QuestionButton
                key={question.id}
                number={index + 1}
                state={state}
                isCurrent={index === currentIndex}
                onClick={() => onQuestionSelect(index)}
              />
            )
          })}
        </div>
      </ScrollArea>

      {/* Legend */}
      <div className="p-4 border-t border-gray-200 bg-gray-50">
        <h4 className="text-xs font-medium text-gray-500 mb-2">Legend</h4>
        <div className="space-y-1.5">
          {[
            { status: 'answered', icon: CheckCircle, label: 'Answered' },
            { status: 'marked', icon: Flag, label: 'Marked' },
            { status: 'notAnswered', icon: X, label: 'Not Answered' },
            { status: 'notVisited', icon: Circle, label: 'Not Visited' },
          ].map(({ status, icon: Icon, label }) => {
            const config = STATUS_CONFIG[status]
            return (
              <div key={status} className="flex items-center gap-2 text-xs">
                <div className={cn(
                  "w-5 h-5 rounded flex items-center justify-center",
                  config.bg,
                  config.border,
                  "border"
                )}>
                  <Icon className="h-3 w-3" />
                </div>
                <span className="text-gray-600">{label}</span>
              </div>
            )
          })}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="p-4 border-t border-gray-200">
        <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
          <span>Progress</span>
          <span>{Math.round((stats.answered / stats.total) * 100)}%</span>
        </div>
        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${(stats.answered / stats.total) * 100}%` }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="h-full bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-full"
          />
        </div>
      </div>
    </motion.aside>
  )
}

// ============================================
// MOBILE PALETTE (Bottom Sheet)
// ============================================

interface MobilePaletteProps extends QuestionPaletteProps {
  isOpen: boolean
  onClose: () => void
}

export function MobilePalette({
  questions,
  answers,
  currentIndex,
  onQuestionSelect,
  stats,
  isOpen,
  onClose,
}: MobilePaletteProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/40 z-40 lg:hidden"
          />

          {/* Bottom Sheet */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 bg-white rounded-t-2xl shadow-2xl z-50 max-h-[80vh] overflow-hidden lg:hidden"
          >
            {/* Handle */}
            <div className="flex justify-center py-2">
              <div className="w-10 h-1 bg-gray-300 rounded-full" />
            </div>

            {/* Header */}
            <div className="px-4 pb-4 border-b border-gray-100">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-gray-900">Questions</h3>
                <Button variant="ghost" size="sm" onClick={onClose}>
                  <X className="h-4 w-4" />
                </Button>
              </div>

              {/* Quick Stats */}
              <div className="flex gap-2">
                <Badge variant="outline" className="bg-emerald-50 border-emerald-200 text-emerald-700">
                  {stats.answered} Answered
                </Badge>
                <Badge variant="outline" className="bg-purple-50 border-purple-200 text-purple-700">
                  {stats.marked} Marked
                </Badge>
                <Badge variant="outline" className="bg-red-50 border-red-200 text-red-700">
                  {stats.notAnswered} Unanswered
                </Badge>
              </div>
            </div>

            {/* Question Grid */}
            <ScrollArea className="p-4 max-h-[50vh]">
              <div className="grid grid-cols-6 gap-2">
                {questions.map((question, index) => {
                  const state = answers.get(question.id) || {
                    questionId: question.id,
                    selectedAnswer: null,
                    isMarkedForReview: false,
                    isDoubtful: false,
                    status: 'unattempted' as const,
                    timeSpent: 0,
                    visitCount: 0,
                  }

                  return (
                    <QuestionButton
                      key={question.id}
                      number={index + 1}
                      state={state}
                      isCurrent={index === currentIndex}
                      onClick={() => {
                        onQuestionSelect(index)
                        onClose()
                      }}
                    />
                  )
                })}
              </div>
            </ScrollArea>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
