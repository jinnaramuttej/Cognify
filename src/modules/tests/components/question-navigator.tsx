'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { Switch } from '@/components/ui/switch'
import {
  Grid3X3, Flag, AlertCircle, CheckCircle2, Send, Flame, Lock
} from 'lucide-react'
import type { QuestionState } from '../types'
import { cn } from '../utils'

interface QuestionNavigatorProps {
  totalQuestions: number
  currentIndex: number
  answers: Map<string, QuestionState>
  questionIds: string[]
  onNavigate: (index: number) => void
  onSubmit: () => void
}

type FilterType = 'all' | 'attempted' | 'unattempted' | 'marked'

export function QuestionNavigator({
  totalQuestions,
  currentIndex,
  answers,
  questionIds,
  onNavigate,
  onSubmit
}: QuestionNavigatorProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [filter, setFilter] = useState<FilterType>('all')
  const [heatmapMode, setHeatmapMode] = useState(false)

  const getQuestionStatus = (index: number): 'unattempted' | 'attempted' | 'marked_for_review' | 'current' | 'locked' => {
    // Mock section lock for last 5 questions of JEE Adv pattern
    if (index >= totalQuestions - 5 && currentIndex < totalQuestions - 10) return 'locked'
    if (index === currentIndex) return 'current'

    const questionId = questionIds[index]
    const state = answers.get(questionId)
    if (!state) return 'unattempted'
    if (state.isMarkedForReview) return 'marked_for_review'
    if (state.selectedAnswer) return 'attempted'
    return 'unattempted'
  }

  const getHeatmapColor = (index: number) => {
    // Mock heatmap generation based on index (simulating time spent / difficulty)
    const heat = (index * 13) % 100
    if (heat > 80) return 'bg-red-500/20 text-red-700 border-red-300' // High time / Hard
    if (heat > 40) return 'bg-amber-500/20 text-amber-700 border-amber-300' // Medium
    return 'bg-emerald-500/20 text-emerald-700 border-emerald-300' // Fast / Easy
  }

  const getStatusStyles = (status: string, index: number) => {
    if (heatmapMode && status === 'attempted') return getHeatmapColor(index)

    switch (status) {
      case 'current':
        return 'ring-2 ring-blue-500 ring-offset-2 bg-white border-blue-500 text-blue-700 font-black scale-110 z-10'
      case 'locked':
        return 'bg-gray-100 text-gray-300 border-gray-200 cursor-not-allowed opacity-60'
      case 'attempted':
        return 'bg-gradient-to-br from-emerald-500 to-emerald-600 text-white shadow-md shadow-emerald-500/20 border-transparent'
      case 'marked_for_review':
        return 'bg-gradient-to-br from-amber-400 to-amber-500 text-white shadow-md shadow-amber-500/20 border-transparent'
      case 'unattempted':
      default:
        return 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200 hover:border-blue-300'
    }
  }

  const attempted = Array.from(answers.values()).filter((a) => a.selectedAnswer).length
  const markedForReview = Array.from(answers.values()).filter((a) => a.isMarkedForReview).length
  const unattempted = totalQuestions - attempted

  const shouldShowQuestion = (index: number): boolean => {
    const status = getQuestionStatus(index)
    if (status === 'locked') return filter === 'all'
    switch (filter) {
      case 'attempted': return status === 'attempted' || status === 'current'
      case 'unattempted': return status === 'unattempted' || status === 'current'
      case 'marked': return status === 'marked_for_review' || status === 'current'
      default: return true
    }
  }

  const handleQuestionClick = (index: number) => {
    if (getQuestionStatus(index) === 'locked') return;
    onNavigate(index)
    setIsOpen(false)
  }

  const renderLegend = () => (
    <div className="flex flex-col gap-3 text-xs mb-4 p-4 bg-gray-50 rounded-2xl border border-gray-100">
      <div className="flex flex-wrap gap-x-4 gap-y-2">
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded bg-emerald-500 shadow-sm" />
          <span className="text-gray-600 font-semibold text-[10px] uppercase">Ans ({attempted})</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded bg-amber-400 shadow-sm" />
          <span className="text-gray-600 font-semibold text-[10px] uppercase">Rev ({markedForReview})</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded bg-white border border-gray-300" />
          <span className="text-gray-600 font-semibold text-[10px] uppercase">Pend ({unattempted})</span>
        </div>
      </div>

      <div className="flex items-center justify-between pt-2 border-t border-gray-200 mt-1">
        <div className="flex items-center gap-1.5 text-gray-700 font-semibold">
          <Flame size={14} className={heatmapMode ? 'text-orange-500' : 'text-gray-400'} />
          Time Heatmap
        </div>
        <Switch checked={heatmapMode} onCheckedChange={setHeatmapMode} className="data-[state=checked]:bg-orange-500 scale-75" />
      </div>
    </div>
  )

  const renderFilters = () => (
    <div className="flex gap-1.5 mb-2">
      {([
        { key: 'all', label: 'All' },
        { key: 'attempted', label: 'Done' },
        { key: 'unattempted', label: 'Pend' },
        { key: 'marked', label: 'Rev' }
      ] as const).map((f) => (
        <button
          key={f.key}
          onClick={() => setFilter(f.key)}
          className={cn(
            "flex-1 py-1.5 text-[10px] uppercase tracking-wider rounded-lg font-bold transition-all",
            filter === f.key
              ? "bg-blue-600 text-white shadow-md shadow-blue-500/20"
              : "bg-gray-100 text-gray-500 hover:bg-gray-200"
          )}
        >
          {f.label}
        </button>
      ))}
    </div>
  )

  const renderQuestionGrid = () => (
    <ScrollArea className="h-[calc(100vh-28rem)]">
      <div className="grid grid-cols-5 gap-2 p-1">
        {Array.from({ length: totalQuestions }).map((_, index) => {
          const status = getQuestionStatus(index)
          if (!shouldShowQuestion(index)) return null

          return (
            <div key={index} className="relative group">
              <motion.button
                initial={false}
                animate={{ scale: status === 'current' ? 1.05 : 1 }}
                whileHover={{ scale: status === 'locked' ? 1 : 1.1 }}
                whileTap={{ scale: status === 'locked' ? 1 : 0.95 }}
                onClick={() => handleQuestionClick(index)}
                className={cn(
                  "w-full aspect-square rounded-xl text-xs transition-all duration-300 flex items-center justify-center border-2",
                  getStatusStyles(status, index)
                )}
              >
                {status === 'marked_for_review' ? <Flag className="h-3.5 w-3.5" /> :
                  status === 'locked' ? <Lock className="h-3 w-3" /> :
                    (heatmapMode && status === 'attempted') ? <Flame className="h-4 w-4 opacity-50" /> :
                      status === 'attempted' ? <CheckCircle2 className="h-4 w-4" /> : index + 1}
              </motion.button>
            </div>
          )
        })}
      </div>
    </ScrollArea>
  )

  const renderSubmitSection = () => (
    <div className="pt-4 border-t border-gray-100 mt-auto">
      {unattempted > 0 && (
        <div className="flex items-center gap-2 text-xs text-amber-700 bg-amber-50 rounded-lg p-2.5 border border-amber-200 mb-3">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span className="font-semibold">{unattempted} Qs unattempted</span>
        </div>
      )}
      <Button onClick={onSubmit} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold h-12 rounded-xl shadow-lg shadow-blue-500/20 group">
        <Send className="h-4 w-4 mr-2 group-hover:translate-x-1 transition-transform" /> Submit Test
      </Button>
    </div>
  )

  const renderProgressRing = () => {
    const progress = (attempted / totalQuestions) * 100
    const circumference = 2 * Math.PI * 34
    const offset = circumference - (progress / 100) * circumference

    return (
      <div className="flex items-center gap-4 mb-2 px-2">
        <div className="relative w-16 h-16 shrink-0">
          <svg width="64" height="64" className="transform -rotate-90">
            <circle cx="32" cy="32" r="28" fill="none" stroke="#f3f4f6" strokeWidth="6" />
            <motion.circle
              cx="32" cy="32" r="28" fill="none" stroke="#2563eb" strokeWidth="6" strokeLinecap="round"
              initial={{ strokeDashoffset: circumference }}
              animate={{ strokeDashoffset: offset }}
              transition={{ duration: 1, ease: 'easeOut' }}
              style={{ strokeDasharray: circumference }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-sm font-black text-gray-900">{Math.round(progress)}%</span>
          </div>
        </div>
        <div>
          <h4 className="font-bold text-gray-900 leading-tight">Test Completion</h4>
          <p className="text-xs text-gray-500">{attempted} of {totalQuestions} answered</p>
        </div>
      </div>
    )
  }

  const Content = () => (
    <div className="h-full flex flex-col pt-2">
      {renderProgressRing()}
      {renderLegend()}
      {renderFilters()}
      {renderQuestionGrid()}
      {renderSubmitSection()}
    </div>
  )

  return (
    <>
      {/* Desktop */}
      <div className="hidden lg:flex flex-col h-full border-l border-gray-200 bg-white w-80 shrink-0 p-5 shadow-[-10px_0_30px_-15px_rgba(0,0,0,0.05)] z-10">
        <Content />
      </div>

      {/* Mobile */}
      <div className="lg:hidden">
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild>
            <Button className="fixed bottom-24 right-4 z-50 bg-gray-900 text-white rounded-full h-14 w-14 shadow-2xl border-2 border-white/20">
              <Grid3X3 className="h-6 w-6" />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-[85vw] sm:w-96 bg-white p-5">
            <SheetHeader className="mb-4 text-left">
              <SheetTitle className="font-bold">Navigator</SheetTitle>
            </SheetHeader>
            <Content />
          </SheetContent>
        </Sheet>
      </div>
    </>
  )
}
