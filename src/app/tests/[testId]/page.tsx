'use client'

import { useEffect, useState, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowLeft,
  AlertTriangle,
  Maximize,
  Minimize,
  Clock,
  BookOpen,
  Zap,
  Send
} from 'lucide-react'
import { TestTimer } from '@/modules/tests/components/test-timer'
import { QuestionPanel } from '@/modules/tests/components/question-panel'
import { QuestionNavigator } from '@/modules/tests/components/question-navigator'
import { useTestSession } from '@/modules/tests/hooks/use-test-session'
import { useTimer } from '@/modules/tests/hooks/use-timer'
import type { Test, Question, QuestionOption } from '@/modules/tests/types'
import { cn } from '@/modules/tests/utils'
import { EASE } from '@/modules/tests/utils/motion'
import { StatCard, PageHeader, LiveIndicator } from '@/modules/tests/components/ui-elevated'

export default function TestInterface() {
  const params = useParams()
  const router = useRouter()
  const testId = params.testId as string

  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showSubmitDialog, setShowSubmitDialog] = useState(false)
  const [showTabWarning, setShowTabWarning] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)

  const {
    test,
    questions,
    attemptId,
    currentQuestionIndex,
    answers,
    initSession,
    setCurrentQuestion,
    selectAnswer,
    toggleMarkForReview,
    clearAnswer,
    resetSession
  } = useTestSession()

  const timeRemaining = useTestSession((s) => s.timeRemaining)

  // Fetch test data
  useEffect(() => {
    const fetchTest = async () => {
      try {
        const response = await fetch(`/api/tests/${testId}`)

        if (!response.ok) {
          const data = await response.json()
          throw new Error(data.error || 'Failed to load test')
        }

        const data = await response.json()

        if (!data.questions || data.questions.length === 0) {
          throw new Error('No questions available for this test')
        }

        initSession(data.test, data.questions, data.existingAttempt?.id || `attempt-${Date.now()}`, data.test.timeLimit)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load test')
      } finally {
        setIsLoading(false)
      }
    }

    fetchTest()

    return () => {
      resetSession()
    }
  }, [testId, initSession, resetSession])

  // Tab switch warning
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && test) {
        setShowTabWarning(true)
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange)
  }, [test])

  // Fullscreen toggle
  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen()
      setIsFullscreen(true)
    } else {
      document.exitFullscreen()
      setIsFullscreen(false)
    }
  }, [])

  // Auto-save
  useEffect(() => {
    if (!attemptId || !test) return

    const saveInterval = setInterval(async () => {
      const allAnswers = useTestSession.getState().getAllAnswers()
      try {
        await fetch('/api/tests/attempts/save', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ attemptId, answers: allAnswers })
        })
      } catch (err) {
        // Silent fail for auto-save
      }
    }, 30000)

    return () => clearInterval(saveInterval)
  }, [attemptId, test])

  // Submit handler
  const handleSubmit = useCallback(async (isAutoSubmit = false) => {
    if (!attemptId) return

    try {
      const allAnswers = useTestSession.getState().getAllAnswers()

      await fetch('/api/tests/attempts/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ attemptId, answers: allAnswers, testId })
      })

      router.push(`/tests/${testId}/analysis`)
    } catch (err) {
      // Error handling
    }
  }, [attemptId, router, testId])

  // Timer handler
  const handleTimeEnd = useCallback(() => {
    handleSubmit(true)
  }, [handleSubmit])

  const { urgencyLevel } = useTimer(handleTimeEnd, !!test)

  // Keyboard navigation
  useEffect(() => {
    if (!test) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft' && currentQuestionIndex > 0) {
        setCurrentQuestion(currentQuestionIndex - 1)
      } else if (e.key === 'ArrowRight' && currentQuestionIndex < questions.length - 1) {
        setCurrentQuestion(currentQuestionIndex + 1)
      } else if (e.key >= '1' && e.key <= '4') {
        const optionIndex = parseInt(e.key) - 1
        if (questions[currentQuestionIndex]?.options[optionIndex]) {
          selectAnswer(questions[currentQuestionIndex].id, questions[currentQuestionIndex].options[optionIndex].label)
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [test, currentQuestionIndex, questions, setCurrentQuestion, selectAnswer])

  const handleSelectAnswer = (answer: string) => {
    if (questions[currentQuestionIndex]) {
      selectAnswer(questions[currentQuestionIndex].id, answer)
    }
  }

  const handleClearAnswer = () => {
    if (questions[currentQuestionIndex]) {
      clearAnswer(questions[currentQuestionIndex].id)
    }
  }

  const handleToggleReview = () => {
    if (questions[currentQuestionIndex]) {
      toggleMarkForReview(questions[currentQuestionIndex].id)
    }
  }

  const handleNavigate = (direction: 'prev' | 'next') => {
    if (direction === 'prev' && currentQuestionIndex > 0) {
      setCurrentQuestion(currentQuestionIndex - 1)
    } else if (direction === 'next' && currentQuestionIndex < questions.length - 1) {
      setCurrentQuestion(currentQuestionIndex + 1)
    }
  }

  // Calculate stats
  const attempted = Array.from(answers.values()).filter((a) => a.selectedAnswer).length
  const markedForReview = Array.from(answers.values()).filter((a) => a.isMarkedForReview).length
  const unattempted = questions.length - attempted

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-page bg-mesh flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="relative w-20 h-20 mx-auto mb-6">
            <motion.div
              className="absolute inset-0 rounded-full border-4 border-blue-100"
              animate={{ rotate: 360 }}
              transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
            />
            <motion.div
              className="absolute inset-1 rounded-full border-4 border-transparent border-t-blue-600"
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <BookOpen className="h-6 w-6 text-blue-600" />
            </div>
          </div>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-gray-600 font-medium"
          >
            Preparing your test...
          </motion.p>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-sm text-gray-400 mt-1"
          >
            Please wait a moment
          </motion.p>
        </motion.div>
      </div>
    )
  }

  // Error state
  if (error || !test || questions.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-page bg-mesh flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 text-center max-w-md"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.1, type: 'spring' }}
            className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-red-100 to-red-50 flex items-center justify-center"
          >
            <AlertTriangle className="h-8 w-8 text-red-500" />
          </motion.div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Unable to Load Test</h2>
          <p className="text-gray-500 mb-6">{error || 'The requested test could not be loaded.'}</p>
          <Button
            onClick={() => router.push('/tests')}
            className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"
          >
            Back to Dashboard
          </Button>
        </motion.div>
      </div>
    )
  }

  const currentQuestion = questions[currentQuestionIndex]
  const currentQuestionState = answers.get(currentQuestion.id)

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-gradient-page-elevated bg-mesh flex flex-col"
    >
      {/* Top Bar */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4, ease: EASE.enter }}
        className="border-b border-gray-100 bg-white/80 backdrop-blur-sm sticky top-0 z-20"
      >
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowSubmitDialog(true)}
                  className="text-gray-500 hover:text-red-600 hover:bg-red-50 border border-transparent hover:border-red-200"
                >
                  <ArrowLeft className="h-4 w-4 mr-1.5" />
                  Exit Test
                </Button>
              </motion.div>

              <div className="h-6 w-px bg-gray-200" />

              <div className="flex items-center gap-3">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: 'spring' }}
                  className="p-2 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg shadow-blue-500/20"
                >
                  <BookOpen className="h-4 w-4 text-white" />
                </motion.div>
                <div>
                  <h1 className="font-semibold text-gray-900 text-sm">{test.name}</h1>
                  <div className="flex items-center gap-2">
                    <p className="text-xs text-gray-500">{test.grade} • {test.targetExam || 'Practice'}</p>
                    <LiveIndicator label="In Progress" color="green" />
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* Stats Pills */}
              <div className="hidden md:flex items-center gap-2">
                <motion.div
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 font-medium">
                    {attempted} Answered
                  </Badge>
                </motion.div>
                {markedForReview > 0 && (
                  <motion.div
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.35 }}
                  >
                    <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 font-medium">
                      {markedForReview} Review
                    </Badge>
                  </motion.div>
                )}
              </div>

              <div className="h-6 w-px bg-gray-200 hidden md:block" />

              {/* Timer */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4 }}
                className="flex items-center gap-2"
              >
                <TestTimer
                  timeRemaining={timeRemaining}
                  urgencyLevel={urgencyLevel as 'critical' | 'warning' | 'normal'}
                />
              </motion.div>

              <div className="h-6 w-px bg-gray-200" />

              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={toggleFullscreen}
                  className="text-gray-400 hover:text-gray-600 hover:bg-gray-100"
                >
                  {isFullscreen ? (
                    <Minimize className="h-4 w-4" />
                  ) : (
                    <Maximize className="h-4 w-4" />
                  )}
                </Button>
              </motion.div>

              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Button
                  onClick={() => setShowSubmitDialog(true)}
                  className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-lg shadow-blue-500/25"
                >
                  <Send className="h-4 w-4 mr-1.5" />
                  Submit
                </Button>
              </motion.div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Question Panel */}
        <motion.div
          key={currentQuestionIndex}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
          className="flex-1 overflow-hidden"
        >
          <QuestionPanel
            question={currentQuestion}
            questionNumber={currentQuestionIndex + 1}
            totalQuestions={questions.length}
            questionState={currentQuestionState}
            onSelectAnswer={handleSelectAnswer}
            onClearAnswer={handleClearAnswer}
            onToggleReview={handleToggleReview}
            onNavigate={handleNavigate}
            canGoPrev={currentQuestionIndex > 0}
            canGoNext={currentQuestionIndex < questions.length - 1}
          />
        </motion.div>

        {/* Question Navigator */}
        <QuestionNavigator
          totalQuestions={questions.length}
          currentIndex={currentQuestionIndex}
          answers={answers}
          questionIds={questions.map((q) => q.id)}
          onNavigate={setCurrentQuestion}
          onSubmit={() => setShowSubmitDialog(true)}
        />
      </div>

      {/* Mobile Bottom Bar */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="lg:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-sm border-t border-gray-100 p-3 flex items-center justify-between z-10"
      >
        <div className="flex items-center gap-2">
          <Badge className="bg-gradient-to-r from-blue-500 to-blue-600 text-white border-0 font-medium px-3">
            Q {currentQuestionIndex + 1}/{questions.length}
          </Badge>
          {urgencyLevel !== 'normal' && (
            <motion.div
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 0.5, repeat: Infinity }}
            >
              <Badge className="bg-red-100 text-red-700 border-red-200">
                {Math.floor(timeRemaining / 60)} min left!
              </Badge>
            </motion.div>
          )}
        </div>
        <TestTimer
          timeRemaining={timeRemaining}
          urgencyLevel={urgencyLevel as 'critical' | 'warning' | 'normal'}
        />
      </motion.div>

      {/* Submit Dialog */}
      <AlertDialog open={showSubmitDialog} onOpenChange={setShowSubmitDialog}>
        <AlertDialogContent className="bg-white border-gray-100 max-w-md">
          <AlertDialogHeader>
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring' }}
            >
              <AlertDialogTitle className="text-gray-900 text-xl">Submit Test?</AlertDialogTitle>
            </motion.div>
            <AlertDialogDescription className="text-gray-500 pt-2">
              {(() => {
                if (attempted < questions.length) {
                  return (
                    <div className="space-y-3">
                      <div className="flex items-center gap-3 p-3 bg-amber-50 rounded-lg border border-amber-200">
                        <Zap className="h-5 w-5 text-amber-500" />
                        <div>
                          <p className="text-sm text-amber-700 font-medium">
                            {questions.length - attempted} questions unanswered
                          </p>
                          <p className="text-xs text-amber-600/70">
                            You have attempted {attempted} of {questions.length} questions
                          </p>
                        </div>
                      </div>
                      <p className="text-sm">Are you sure you want to submit?</p>
                    </div>
                  )
                }
                if (markedForReview > 0) {
                  return (
                    <div className="space-y-3">
                      <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                        <AlertTriangle className="h-5 w-5 text-blue-500" />
                        <p className="text-sm text-blue-700">
                          You have {markedForReview} question(s) marked for review
                        </p>
                      </div>
                      <p className="text-sm">Are you sure you want to submit?</p>
                    </div>
                  )
                }
                return 'Are you sure you want to submit your test? This action cannot be undone.'
              })()}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2">
            <AlertDialogCancel className="border-gray-200 text-gray-700 hover:bg-gray-50">
              Continue Test
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => handleSubmit()}
              className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white"
            >
              Submit Test
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Tab Switch Warning */}
      <AlertDialog open={showTabWarning} onOpenChange={setShowTabWarning}>
        <AlertDialogContent className="bg-white border-gray-100 max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-red-600 flex items-center gap-2 text-xl">
              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 0.5, repeat: Infinity }}
              >
                <AlertTriangle className="h-5 w-5" />
              </motion.div>
              Warning: Tab Switch Detected
            </AlertDialogTitle>
            <AlertDialogDescription className="text-gray-500 pt-2">
              Switching tabs during a test is not allowed. Your activity is being monitored.
              Continued tab switching may result in automatic test submission.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction
              onClick={() => setShowTabWarning(false)}
              className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white"
            >
              I Understand
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </motion.div>
  )
}
