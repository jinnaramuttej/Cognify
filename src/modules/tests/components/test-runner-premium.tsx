'use client'

import { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import { motion, AnimatePresence, useAnimation } from 'framer-motion'
import { 
  ChevronLeft, ChevronRight, Flag, Bookmark, Clock, 
  AlertCircle, CheckCircle, HelpCircle, Eye, EyeOff,
  Pause, Play, Send, AlertTriangle, Shield
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { cn } from '@/modules/tests/utils'
import { CircularTimer } from './circular-timer'
import { QuestionPalette, type QuestionState } from './question-palette'
import { ProctorBar } from './proctor-bar'
import type { Question, Test } from '@/modules/tests/types'

// ============================================
// DESIGN TOKENS
// ============================================

const DESIGN_TOKENS = {
  colors: {
    primary: '#2563EB',
    primaryHover: '#1D4ED8',
    success: '#10B981',
    warning: '#F59E0B',
    error: '#EF4444',
    info: '#3B82F6',
    background: '#F8FAFC',
    card: '#FFFFFF',
    border: '#E5E7EB',
  },
  status: {
    answered: { bg: 'bg-emerald-100', border: 'border-emerald-300', text: 'text-emerald-700', dot: 'bg-emerald-500' },
    marked: { bg: 'bg-purple-100', border: 'border-purple-300', text: 'text-purple-700', dot: 'bg-purple-500' },
    markedAnswered: { bg: 'bg-violet-100', border: 'border-violet-300', text: 'text-violet-700', dot: 'bg-violet-500' },
    notAnswered: { bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-600', dot: 'bg-red-400' },
    notVisited: { bg: 'bg-gray-50', border: 'border-gray-200', text: 'text-gray-500', dot: 'bg-gray-300' },
    current: { bg: 'bg-blue-100', border: 'border-blue-400', text: 'text-blue-700', dot: 'bg-blue-500' },
  },
  animation: {
    questionEnter: { x: 50, opacity: 0 },
    questionExit: { x: -50, opacity: 0 },
    duration: 0.3,
  }
}

// ============================================
// ANIMATION VARIANTS
// ============================================

const questionVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 60 : -60,
    opacity: 0,
    scale: 0.98,
  }),
  center: {
    x: 0,
    opacity: 1,
    scale: 1,
    transition: {
      type: 'spring',
      stiffness: 300,
      damping: 30,
    }
  },
  exit: (direction: number) => ({
    x: direction > 0 ? -60 : 60,
    opacity: 0,
    scale: 0.98,
    transition: {
      type: 'spring',
      stiffness: 300,
      damping: 30,
    }
  }),
}

const optionVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: (i: number) => ({
    opacity: 1,
    x: 0,
    transition: {
      delay: i * 0.08,
      type: 'spring',
      stiffness: 200,
    }
  }),
  selected: {
    scale: [1, 1.02, 1],
    transition: { duration: 0.2 }
  }
}

// ============================================
// QUESTION CARD COMPONENT
// ============================================

interface QuestionCardProps {
  question: Question
  questionNumber: number
  selectedAnswer: string | null
  isMarkedForReview: boolean
  isDoubtful: boolean
  showExplanation: boolean
  onAnswerSelect: (answer: string) => void
  onMarkForReview: () => void
  onDoubtful: () => void
  onClear: () => void
}

function QuestionCard({
  question,
  questionNumber,
  selectedAnswer,
  isMarkedForReview,
  isDoubtful,
  showExplanation,
  onAnswerSelect,
  onMarkForReview,
  onDoubtful,
  onClear,
}: QuestionCardProps) {
  const options = useMemo(() => {
    try {
      return typeof question.options === 'string' 
        ? JSON.parse(question.options) 
        : question.options
    } catch {
      return []
    }
  }, [question.options])

  return (
    <motion.div
      className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Question Header */}
      <div className="bg-gradient-to-r from-gray-50 to-white border-b border-gray-100 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <motion.div
              key={questionNumber}
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-blue-500/20"
            >
              {questionNumber}
            </motion.div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-900">
                  {question.difficulty === 'easy' && 'Basic'}
                  {question.difficulty === 'medium' && 'Intermediate'}
                  {question.difficulty === 'hard' && 'Advanced'}
                </span>
                <span className="text-xs text-gray-400">•</span>
                <span className="text-sm text-gray-500">{question.marks} marks</span>
              </div>
              {question.isPYQ && (
                <Badge variant="outline" className="mt-1 text-xs bg-amber-50 border-amber-200 text-amber-700">
                  PYQ {question.pyqYear}
                </Badge>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {isMarkedForReview && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="flex items-center gap-1 px-2 py-1 rounded-lg bg-purple-100 text-purple-700 text-xs font-medium"
              >
                <Flag className="h-3 w-3" />
                Review
              </motion.div>
            )}
            {isDoubtful && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="flex items-center gap-1 px-2 py-1 rounded-lg bg-amber-100 text-amber-700 text-xs font-medium"
              >
                <HelpCircle className="h-3 w-3" />
                Doubtful
              </motion.div>
            )}
          </div>
        </div>
      </div>

      {/* Question Content */}
      <div className="p-6">
        {/* Passage if exists */}
        {question.passage && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 rounded-xl bg-blue-50 border border-blue-100"
          >
            <p className="text-sm text-blue-800 italic">{question.passage}</p>
          </motion.div>
        )}

        {/* Question Text */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="mb-6"
        >
          <p className="text-lg text-gray-900 leading-relaxed">{question.text}</p>
          {question.imageUrl && (
            <motion.img
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              src={question.imageUrl}
              alt="Question diagram"
              className="mt-4 rounded-xl border border-gray-100 max-w-full"
            />
          )}
        </motion.div>

        {/* Options */}
        <div className="space-y-3">
          {options.map((option: any, index: number) => {
            const optionLabel = option.label || option.id || String.fromCharCode(65 + index)
            const isSelected = selectedAnswer === optionLabel
            const optionKey = `option-${index}`

            return (
              <motion.button
                key={optionKey}
                custom={index}
                variants={optionVariants}
                initial="hidden"
                animate={isSelected ? ['visible', 'selected'] : 'visible'}
                onClick={() => onAnswerSelect(optionLabel)}
                className={cn(
                  "w-full text-left p-4 rounded-xl border-2 transition-all duration-200 group",
                  "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2",
                  isSelected
                    ? 'border-blue-500 bg-gradient-to-r from-blue-50 to-indigo-50 shadow-md shadow-blue-500/10'
                    : 'border-gray-200 bg-white hover:border-blue-300 hover:bg-blue-50/50'
                )}
                whileHover={{ x: 4 }}
                whileTap={{ scale: 0.995 }}
              >
                <div className="flex items-start gap-3">
                  <motion.div
                    className={cn(
                      "flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center",
                      "font-semibold text-sm transition-all duration-200",
                      isSelected
                        ? 'bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/30'
                        : 'bg-gray-100 text-gray-500 border border-gray-200 group-hover:border-blue-300 group-hover:bg-blue-100'
                    )}
                    animate={isSelected ? { scale: [1, 1.1, 1] } : {}}
                    transition={{ duration: 0.2 }}
                  >
                    {optionLabel}
                  </motion.div>
                  <div className="flex-1 pt-1.5">
                    <p className={cn(
                      "text-gray-700 leading-relaxed",
                      isSelected && "text-gray-900 font-medium"
                    )}>
                      {option.text || option}
                    </p>
                    {option.imageUrl && (
                      <img
                        src={option.imageUrl}
                        alt={`Option ${optionLabel}`}
                        className="mt-2 rounded-lg border border-gray-100 max-w-xs"
                      />
                    )}
                  </div>
                  {isSelected && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="flex-shrink-0"
                    >
                      <CheckCircle className="h-5 w-5 text-blue-600" />
                    </motion.div>
                  )}
                </div>
              </motion.button>
            )
          })}
        </div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="flex flex-wrap gap-2 mt-6 pt-6 border-t border-gray-100"
        >
          <Button
            variant="outline"
            size="sm"
            onClick={onMarkForReview}
            className={cn(
              "gap-2",
              isMarkedForReview && "border-purple-400 bg-purple-50 text-purple-700"
            )}
          >
            <Flag className="h-4 w-4" />
            {isMarkedForReview ? 'Unmark Review' : 'Mark for Review'}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={onDoubtful}
            className={cn(
              "gap-2",
              isDoubtful && "border-amber-400 bg-amber-50 text-amber-700"
            )}
          >
            <HelpCircle className="h-4 w-4" />
            {isDoubtful ? 'Clear Doubt' : 'Mark Doubtful'}
          </Button>
          {selectedAnswer && (
            <Button
              variant="outline"
              size="sm"
              onClick={onClear}
              className="gap-2 text-gray-600"
            >
              Clear Response
            </Button>
          )}
        </motion.div>
      </div>

      {/* Explanation (shown after submission) */}
      <AnimatePresence>
        {showExplanation && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-t border-gray-200"
          >
            <div className="p-6 bg-gradient-to-r from-emerald-50 to-teal-50">
              <div className="flex items-center gap-2 mb-3">
                {selectedAnswer === question.correctAnswer ? (
                  <>
                    <CheckCircle className="h-5 w-5 text-emerald-600" />
                    <span className="font-medium text-emerald-700">Correct Answer</span>
                  </>
                ) : (
                  <>
                    <AlertCircle className="h-5 w-5 text-red-500" />
                    <span className="font-medium text-red-600">Incorrect</span>
                  </>
                )}
              </div>
              <p className="text-sm text-gray-700 mb-2">
                <strong>Correct Answer:</strong> {question.correctAnswer}
              </p>
              <p className="text-sm text-gray-600">{question.explanation}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

// ============================================
// MAIN TEST RUNNER COMPONENT
// ============================================

interface TestRunnerProps {
  testId: string
  test: Test
  questions: Question[]
  onComplete: (attemptId: string) => void
  onExit: () => void
}

export function TestRunner({ testId, test, questions, onComplete, onExit }: TestRunnerProps) {
  // State
  const [currentIndex, setCurrentIndex] = useState(0)
  const [answers, setAnswers] = useState<Map<string, QuestionState>>(new Map())
  const [timeRemaining, setTimeRemaining] = useState(test.timeLimit * 60)
  const [isPaused, setIsPaused] = useState(false)
  const [showPalette, setShowPalette] = useState(true)
  const [showSubmitDialog, setShowSubmitDialog] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [attemptId, setAttemptId] = useState<string | null>(null)
  const [direction, setDirection] = useState(0)

  // Refs
  const containerRef = useRef<HTMLDivElement>(null)
  const questionStartTime = useRef<number>(Date.now())

  // Current question
  const currentQuestion = questions[currentIndex]

  // Initialize answer states
  useEffect(() => {
    const initialAnswers = new Map<string, QuestionState>()
    questions.forEach(q => {
      initialAnswers.set(q.id, {
        questionId: q.id,
        selectedAnswer: null,
        isMarkedForReview: false,
        isDoubtful: false,
        status: 'unattempted',
        timeSpent: 0,
        visitCount: 0,
      })
    })
    setAnswers(initialAnswers)
  }, [questions])

  // Timer
  useEffect(() => {
    if (isPaused || timeRemaining <= 0) return

    const timer = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          // Auto-submit
          handleSubmit()
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [isPaused, timeRemaining])

  // Track time per question
  useEffect(() => {
    questionStartTime.current = Date.now()
  }, [currentIndex])

  // Navigation
  const goToQuestion = useCallback((index: number) => {
    if (index < 0 || index >= questions.length) return

    // Update time spent on current question
    const currentAnswer = answers.get(currentQuestion?.id)
    if (currentAnswer && currentQuestion) {
      const timeSpent = Math.floor((Date.now() - questionStartTime.current) / 1000)
      setAnswers(prev => {
        const newMap = new Map(prev)
        newMap.set(currentQuestion.id, {
          ...currentAnswer,
          timeSpent: currentAnswer.timeSpent + timeSpent,
          visitCount: currentAnswer.visitCount + 1,
        })
        return newMap
      })
    }

    setDirection(index > currentIndex ? 1 : -1)
    setCurrentIndex(index)
  }, [currentIndex, currentQuestion, answers])

  const nextQuestion = useCallback(() => {
    goToQuestion(currentIndex + 1)
  }, [currentIndex, goToQuestion])

  const prevQuestion = useCallback(() => {
    goToQuestion(currentIndex - 1)
  }, [currentIndex, goToQuestion])

  // Answer actions
  const selectAnswer = useCallback((answer: string) => {
    if (!currentQuestion) return
    
    setAnswers(prev => {
      const newMap = new Map(prev)
      const current = newMap.get(currentQuestion.id) || {
        questionId: currentQuestion.id,
        selectedAnswer: null,
        isMarkedForReview: false,
        isDoubtful: false,
        status: 'unattempted' as const,
        timeSpent: 0,
        visitCount: 0,
      }
      newMap.set(currentQuestion.id, {
        ...current,
        selectedAnswer: answer,
        status: 'attempted',
      })
      return newMap
    })
  }, [currentQuestion])

  const markForReview = useCallback(() => {
    if (!currentQuestion) return
    
    setAnswers(prev => {
      const newMap = new Map(prev)
      const current = newMap.get(currentQuestion.id)
      if (current) {
        newMap.set(currentQuestion.id, {
          ...current,
          isMarkedForReview: !current.isMarkedForReview,
          status: current.selectedAnswer 
            ? (!current.isMarkedForReview ? 'marked_for_review' : 'attempted')
            : (!current.isMarkedForReview ? 'marked_for_review' : 'unattempted'),
        })
      }
      return newMap
    })
  }, [currentQuestion])

  const markDoubtful = useCallback(() => {
    if (!currentQuestion) return
    
    setAnswers(prev => {
      const newMap = new Map(prev)
      const current = newMap.get(currentQuestion.id)
      if (current) {
        newMap.set(currentQuestion.id, {
          ...current,
          isDoubtful: !current.isDoubtful,
        })
      }
      return newMap
    })
  }, [currentQuestion])

  const clearAnswer = useCallback(() => {
    if (!currentQuestion) return
    
    setAnswers(prev => {
      const newMap = new Map(prev)
      const current = newMap.get(currentQuestion.id)
      if (current) {
        newMap.set(currentQuestion.id, {
          ...current,
          selectedAnswer: null,
          status: 'unattempted',
        })
      }
      return newMap
    })
  }, [currentQuestion])

  // Submit
  const handleSubmit = useCallback(async () => {
    if (isSubmitting) return
    setIsSubmitting(true)

    try {
      // Calculate stats
      let correct = 0
      let incorrect = 0
      let unattempted = 0
      let totalMarks = 0
      let obtainedMarks = 0

      answers.forEach((answer, questionId) => {
        const question = questions.find(q => q.id === questionId)
        if (!question) return

        totalMarks += question.marks

        if (!answer.selectedAnswer) {
          unattempted++
        } else if (answer.selectedAnswer === question.correctAnswer) {
          correct++
          obtainedMarks += question.marks
        } else {
          incorrect++
          obtainedMarks -= question.negativeMarks
        }
      })

      const response = await fetch('/api/tests/attempts/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          testId,
          answers: Array.from(answers.entries()).map(([questionId, state]) => ({
            questionId,
            selectedAnswer: state.selectedAnswer,
            timeSpent: state.timeSpent,
            isMarkedForReview: state.isMarkedForReview,
          })),
        }),
      })

      const result = await response.json()
      
      if (result.success) {
        onComplete(result.attemptId)
      }
    } catch (error) {
      console.error('Failed to submit test:', error)
    } finally {
      setIsSubmitting(false)
    }
  }, [testId, answers, questions, isSubmitting, onComplete])

  // Stats
  const stats = useMemo(() => {
    let answered = 0
    let marked = 0
    let notAnswered = 0

    answers.forEach(answer => {
      if (answer.selectedAnswer) {
        answered++
        if (answer.isMarkedForReview) marked++
      } else {
        if (answer.isMarkedForReview) marked++
        notAnswered++
      }
    })

    return { answered, marked, notAnswered, total: questions.length }
  }, [answers, questions.length])

  const currentAnswer = currentQuestion ? answers.get(currentQuestion.id) : null

  return (
    <div ref={containerRef} className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Test Info */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
                  <span className="text-white font-bold text-sm">
                    {test.targetExam?.charAt(0) || 'T'}
                  </span>
                </div>
                <div>
                  <h1 className="font-semibold text-gray-900 text-sm">{test.name}</h1>
                  <p className="text-xs text-gray-500">{test.questionCount} Questions • {test.timeLimit} min</p>
                </div>
              </div>
            </div>

            {/* Timer */}
            <CircularTimer
              timeRemaining={timeRemaining}
              totalTime={test.timeLimit * 60}
              isPaused={isPaused}
              onPause={() => setIsPaused(!isPaused)}
            />

            {/* Actions */}
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowPalette(!showPalette)}
                className="gap-2"
              >
                {showPalette ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                <span className="hidden sm:inline">Palette</span>
              </Button>
              <Button
                variant="default"
                size="sm"
                onClick={() => setShowSubmitDialog(true)}
                className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 gap-2"
              >
                <Send className="h-4 w-4" />
                Submit
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Proctor Bar */}
      <ProctorBar attemptId={attemptId} />

      {/* Main Content */}
      <div className="flex-1 flex">
        {/* Question Area */}
        <main className="flex-1 p-4 lg:p-6">
          <AnimatePresence mode="wait" custom={direction}>
            {currentQuestion && (
              <motion.div
                key={currentQuestion.id}
                custom={direction}
                variants={questionVariants}
                initial="enter"
                animate="center"
                exit="exit"
              >
                <QuestionCard
                  question={currentQuestion}
                  questionNumber={currentIndex + 1}
                  selectedAnswer={currentAnswer?.selectedAnswer || null}
                  isMarkedForReview={currentAnswer?.isMarkedForReview || false}
                  isDoubtful={currentAnswer?.isDoubtful || false}
                  showExplanation={false}
                  onAnswerSelect={selectAnswer}
                  onMarkForReview={markForReview}
                  onDoubtful={markDoubtful}
                  onClear={clearAnswer}
                />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Navigation */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex items-center justify-between mt-6"
          >
            <Button
              variant="outline"
              onClick={prevQuestion}
              disabled={currentIndex === 0}
              className="gap-2"
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                onClick={() => setIsPaused(!isPaused)}
                className="gap-2"
              >
                {isPaused ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
                {isPaused ? 'Resume' : 'Pause'}
              </Button>
            </div>

            {currentIndex < questions.length - 1 ? (
              <Button
                onClick={nextQuestion}
                className="gap-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </Button>
            ) : (
              <Button
                onClick={() => setShowSubmitDialog(true)}
                className="gap-2 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800"
              >
                <Send className="h-4 w-4" />
                Submit Test
              </Button>
            )}
          </motion.div>
        </main>

        {/* Question Palette */}
        <AnimatePresence>
          {showPalette && (
            <QuestionPalette
              questions={questions}
              answers={answers}
              currentIndex={currentIndex}
              onQuestionSelect={goToQuestion}
              stats={stats}
            />
          )}
        </AnimatePresence>
      </div>

      {/* Submit Dialog */}
      <AnimatePresence>
        {showSubmitDialog && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setShowSubmitDialog(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={e => e.stopPropagation()}
              className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6"
            >
              <div className="text-center mb-6">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-blue-100 flex items-center justify-center">
                  <AlertTriangle className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Submit Test?</h3>
                <p className="text-gray-500">Are you sure you want to submit your test?</p>
              </div>

              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="text-center p-3 rounded-xl bg-emerald-50">
                  <div className="text-2xl font-bold text-emerald-600">{stats.answered}</div>
                  <div className="text-xs text-emerald-600">Answered</div>
                </div>
                <div className="text-center p-3 rounded-xl bg-purple-50">
                  <div className="text-2xl font-bold text-purple-600">{stats.marked}</div>
                  <div className="text-xs text-purple-600">Marked</div>
                </div>
                <div className="text-center p-3 rounded-xl bg-red-50">
                  <div className="text-2xl font-bold text-red-600">{stats.notAnswered}</div>
                  <div className="text-xs text-red-600">Unanswered</div>
                </div>
              </div>

              {stats.notAnswered > 0 && (
                <div className="mb-6 p-3 rounded-lg bg-amber-50 border border-amber-200 text-sm text-amber-700 flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 flex-shrink-0" />
                  You have {stats.notAnswered} unanswered question(s)
                </div>
              )}

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => setShowSubmitDialog(false)}
                  className="flex-1"
                >
                  Continue Test
                </Button>
                <Button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700"
                >
                  {isSubmitting ? 'Submitting...' : 'Submit Now'}
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
