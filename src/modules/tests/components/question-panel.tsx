'use client'

import { useState, useRef } from 'react'
import { motion, AnimatePresence, useAnimation, PanInfo } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import {
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Flag,
  HelpCircle,
  X,
  Sparkles
} from 'lucide-react'
import type { Question, QuestionState } from '../types'
import { cn, getDifficultyBg } from '../utils'
import { EASE } from '../utils/motion'

interface QuestionPanelProps {
  question: Question
  questionNumber: number
  totalQuestions: number
  questionState: QuestionState | undefined
  onSelectAnswer: (answer: string) => void
  onClearAnswer: () => void
  onToggleReview: () => void
  onNavigate: (direction: 'prev' | 'next') => void
  canGoPrev: boolean
  canGoNext: boolean
}

const SWIPE_THRESHOLD = 50;

export function QuestionPanel({
  question,
  questionNumber,
  totalQuestions,
  questionState,
  onSelectAnswer,
  onClearAnswer,
  onToggleReview,
  onNavigate,
  canGoPrev,
  canGoNext
}: QuestionPanelProps) {
  const [showClearConfirm, setShowClearConfirm] = useState(false)
  const controls = useAnimation()

  const selectedAnswer = questionState?.selectedAnswer
  const isMarkedForReview = questionState?.isMarkedForReview ?? false

  const handleOptionClick = (label: string) => {
    onSelectAnswer(label)
  }

  const handleClear = () => {
    if (showClearConfirm) {
      onClearAnswer()
      setShowClearConfirm(false)
    } else {
      setShowClearConfirm(true)
      setTimeout(() => setShowClearConfirm(false), 3000)
    }
  }

  const handleDragEnd = async (e: any, info: PanInfo) => {
    const offset = info.offset.x
    const velocity = info.velocity.x

    if (offset < -SWIPE_THRESHOLD || velocity < -500) {
      // Swipe Left -> Next Question
      if (canGoNext) {
        await controls.start({ x: -100, opacity: 0, transition: { duration: 0.2 } })
        onNavigate('next')
      } else {
        controls.start({ x: 0, opacity: 1, transition: { type: "spring", bounce: 0.5 } })
      }
    } else if (offset > SWIPE_THRESHOLD || velocity > 500) {
      // Swipe Right -> Prev Question
      if (canGoPrev) {
        await controls.start({ x: 100, opacity: 0, transition: { duration: 0.2 } })
        onNavigate('prev')
      } else {
        controls.start({ x: 0, opacity: 1, transition: { type: "spring", bounce: 0.5 } })
      }
    } else {
      controls.start({ x: 0, opacity: 1, transition: { type: "spring", bounce: 0.5 } })
    }
  }

  const progress = (questionNumber / totalQuestions) * 100

  return (
    <div className="flex flex-col h-full bg-background relative overflow-hidden">
      {/* Question Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between p-4 border-b border-border bg-card z-10"
      >
        <div className="flex items-center gap-3 flex-wrap">
          <Badge className="bg-gradient-to-r from-blue-500 to-blue-600 text-white border-0 font-bold px-4 py-1.5 shadow-md shadow-blue-500/20">
            Q {questionNumber} / {totalQuestions}
          </Badge>

          <Badge variant="outline" className="border-border text-foreground font-bold bg-card drop-shadow-sm">
            +{question.marks} <span className="text-[10px] text-gray-400 ml-1">MARKS</span>
          </Badge>

          <Badge variant="outline" className={cn("border-0 font-bold drop-shadow-sm", getDifficultyBg(question.difficulty))}>
            {question.difficulty.toUpperCase()}
          </Badge>

          {question.isPYQ && (
            <Badge variant="outline" className="border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 font-bold drop-shadow-sm">
              <Sparkles className="h-3 w-3 mr-1" />
              PYQ {question.pyqYear}
            </Badge>
          )}
        </div>

        <AnimatePresence>
          {isMarkedForReview && (
            <motion.div initial={{ opacity: 0, scale: 0.8, x: 20 }} animate={{ opacity: 1, scale: 1, x: 0 }} exit={{ opacity: 0, scale: 0.8, x: 20 }}>
              <Badge className="bg-gradient-to-r from-amber-400 to-amber-500 text-white border-0 shadow-lg shadow-amber-500/20 px-3 py-1 font-bold">
                <Flag className="h-3.5 w-3.5 mr-1" />
                Review
              </Badge>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Progress Bar */}
      <div className="h-1 bg-muted w-full z-10">
        <motion.div initial={{ width: 0 }} animate={{ width: `${progress}%` }} transition={{ duration: 0.3 }} className="h-full bg-gradient-to-r from-blue-500 to-blue-600" />
      </div>

      {/* Swipeable Question Content Area */}
      <div className="flex-1 overflow-x-hidden overflow-y-auto w-full relative">
        <motion.div
          key={question.id}
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={1}
          onDragEnd={handleDragEnd}
          animate={controls}
          initial={{ opacity: 0, scale: 0.98 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
          className="max-w-3xl mx-auto space-y-8 p-6 md:p-10 cursor-grab active:cursor-grabbing min-h-full"
        >
          {/* Question Text */}
          <div className="space-y-4">
            <h2 className="text-xl md:text-2xl text-foreground leading-relaxed font-semibold transition-colors">
              {question.text}
            </h2>

            {question.imageUrl && (
              <div className="mt-6 rounded-2xl border-2 border-gray-100 overflow-hidden bg-white p-2 shadow-sm pointer-events-none">
                <img src={question.imageUrl} alt="Question diagram" className="max-w-full h-auto mx-auto rounded-xl" />
              </div>
            )}
          </div>

          {/* Options */}
          <div className="space-y-3 pt-4 cursor-auto" onPointerDown={(e) => e.stopPropagation()}>
            {question.options.map((option, index) => {
              const isSelected = selectedAnswer === option.label
              return (
                <motion.button
                  key={option.id}
                  onClick={() => handleOptionClick(option.label)}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  className={cn(
                    "w-full text-left p-5 rounded-2xl border-2 transition-all duration-200 group relative overflow-hidden",
                    isSelected
                      ? "border-primary bg-primary/5 shadow-md shadow-primary/10"
                      : "border-border bg-card hover:border-primary/50 hover:shadow-sm"
                  )}
                >
                  {/* Option Shortcut Hint (A B C D keys) */}
                  <div className="absolute top-1/2 -translate-y-1/2 right-4 opacity-0 group-hover:opacity-100 transition-opacity hidden md:block">
                    <kbd className="px-2 py-1 rounded-md bg-white border border-gray-200 font-mono text-gray-400 text-[10px] font-bold shadow-sm">
                      {index + 1}
                    </kbd>
                  </div>

                  <div className="flex items-start gap-5">
                    <div className={cn(
                      "flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm transition-all duration-300",
                      isSelected
                        ? "bg-blue-600 text-white shadow-md shadow-blue-500/30 scale-110"
                        : "bg-gray-100 text-gray-500 group-hover:bg-blue-100 group-hover:text-blue-600"
                    )}
                    >
                      {isSelected ? <CheckCircle2 className="h-5 w-5" /> : option.label}
                    </div>
                    <div className="flex-1 pt-2 pr-8">
                      <p className={cn("text-foreground text-base transition-colors", isSelected && "font-bold")}>
                        {option.text}
                      </p>
                      {option.imageUrl && (
                        <div className="mt-4 pointer-events-none">
                          <img src={option.imageUrl} alt={`Option ${option.label}`} className="max-w-full h-auto rounded-xl border-2 border-transparent group-hover:border-blue-100 transition-colors" />
                        </div>
                      )}
                    </div>
                  </div>
                </motion.button>
              )
            })}
          </div>

          <p className="text-center text-[10px] uppercase font-bold text-gray-300 pt-8 tracking-widest hidden md:block select-none">
            Swipe left/right to navigate • Press 1-4 to select options • Press R to review
          </p>
        </motion.div>
      </div>

      {/* Question Footer */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="border-t border-border bg-card p-4 shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.05)] z-10"
      >
        <div className="flex items-center justify-between max-w-4xl mx-auto w-full">
          {/* Left Actions */}
          <div className="flex items-center gap-4">
            <motion.label className="flex items-center gap-2 cursor-pointer group px-3 py-2 rounded-xl hover:bg-gray-50 transition-colors">
              <Checkbox checked={isMarkedForReview} onCheckedChange={onToggleReview} className="data-[state=checked]:bg-amber-500 data-[state=checked]:border-amber-500 w-5 h-5 rounded-md" />
              <span className={cn("text-sm font-bold transition-colors select-none", isMarkedForReview ? "text-amber-600 font-bold" : "text-gray-500 group-hover:text-gray-800")}>
                Mark for Review
              </span>
            </motion.label>

            <div className="w-0.5 h-8 bg-gray-100" />

            <Button variant="ghost" size="sm" onClick={handleClear} className={cn(
              "text-gray-400 hover:text-red-500 hover:bg-red-50 font-bold transition-all px-4 rounded-xl",
              showClearConfirm && "bg-red-50 text-red-600 border border-red-200"
            )}
            >
              <X className="h-4 w-4 mr-2" />
              {showClearConfirm ? 'Confirm Clear' : 'Clear'}
            </Button>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => onNavigate('prev')} disabled={!canGoPrev} className="border-2 border-gray-200 text-gray-600 hover:bg-gray-50 hover:border-gray-300 disabled:opacity-30 rounded-xl h-10 px-4 font-bold">
              <ChevronLeft className="h-4 w-4 md:mr-1" />
              <span className="hidden md:inline">Previous</span>
            </Button>

            <Button size="sm" onClick={() => onNavigate('next')} disabled={!canGoNext} className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/20 disabled:opacity-30 rounded-xl h-10 px-4 font-bold border-2 border-transparent">
              <span className="hidden md:inline">Next</span>
              <ChevronRight className="h-4 w-4 md:ml-1" />
            </Button>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
