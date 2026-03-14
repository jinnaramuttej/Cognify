'use client'

import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import {
  CheckCircle2,
  XCircle,
  HelpCircle,
  ArrowRight,
  ArrowLeft,
  RotateCcw,
  Lightbulb,
  Sparkles,
  Trophy,
  Target,
  Clock,
} from 'lucide-react'
import { cn } from '@/lib/utils'

// Types
export interface QuizQuestion {
  id: string
  type: 'multiple-choice' | 'true-false' | 'fill-blank'
  question: string
  options?: string[]
  correctAnswer: string | number
  explanation?: string
  hint?: string
  difficulty?: 'Beginner' | 'Intermediate' | 'Advanced'
  points?: number
}

export interface QuizResult {
  questionId: string
  isCorrect: boolean
  userAnswer: string | number
  timeSpent: number // seconds
}

interface InteractiveQuizProps {
  questions: QuizQuestion[]
  title?: string
  onComplete?: (results: QuizResult[], score: number) => void
  onAskCogni?: (questionId: string) => void
  showProgress?: boolean
  allowRetry?: boolean
  shuffleQuestions?: boolean
  className?: string
}

export function InteractiveQuiz({
  questions,
  title = 'Quick Quiz',
  onComplete,
  onAskCogni,
  showProgress = true,
  allowRetry = true,
  shuffleQuestions = false,
  className,
}: InteractiveQuizProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState<string | number | null>(null)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [showExplanation, setShowExplanation] = useState(false)
  const [showHint, setShowHint] = useState(false)
  const [results, setResults] = useState<QuizResult[]>([])
  const [startTime, setStartTime] = useState<number>(Date.now())
  const [isComplete, setIsComplete] = useState(false)
  
  // Get current question
  const currentQuestion = questions[currentIndex]
  const progress = ((currentIndex + 1) / questions.length) * 100
  const score = results.filter(r => r.isCorrect).length
  
  // Handle answer selection
  const handleSelect = useCallback((answer: string | number) => {
    if (!isSubmitted) {
      setSelectedAnswer(answer)
    }
  }, [isSubmitted])
  
  // Submit answer
  const handleSubmit = useCallback(() => {
    if (selectedAnswer === null) return
    
    const timeSpent = Math.round((Date.now() - startTime) / 1000)
    const isCorrect = String(selectedAnswer) === String(currentQuestion.correctAnswer)
    
    const result: QuizResult = {
      questionId: currentQuestion.id,
      isCorrect,
      userAnswer: selectedAnswer,
      timeSpent,
    }
    
    setResults(prev => [...prev, result])
    setIsSubmitted(true)
    
    if (currentQuestion.explanation) {
      setShowExplanation(true)
    }
  }, [selectedAnswer, currentQuestion, startTime])
  
  // Move to next question
  const handleNext = useCallback(() => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(prev => prev + 1)
      setSelectedAnswer(null)
      setIsSubmitted(false)
      setShowExplanation(false)
      setShowHint(false)
      setStartTime(Date.now())
    } else {
      setIsComplete(true)
      onComplete?.(results, score)
    }
  }, [currentIndex, questions.length, results, score, onComplete])
  
  // Retry quiz
  const handleRetry = useCallback(() => {
    setCurrentIndex(0)
    setSelectedAnswer(null)
    setIsSubmitted(false)
    setShowExplanation(false)
    setShowHint(false)
    setResults([])
    setStartTime(Date.now())
    setIsComplete(false)
  }, [])
  
  // Completion screen
  if (isComplete) {
    const percentage = Math.round((score / questions.length) * 100)
    const isPerfect = percentage === 100
    const isGood = percentage >= 70
    
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className={cn('p-6', className)}
      >
        <Card className="p-6 text-center">
          {/* Result Icon */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
            className={cn(
              'w-20 h-20 rounded-full mx-auto mb-4 flex items-center justify-center',
              isPerfect ? 'bg-gradient-to-br from-yellow-400 to-orange-500' :
              isGood ? 'bg-gradient-to-br from-emerald-400 to-teal-500' :
              'bg-gradient-to-br from-gray-400 to-gray-500'
            )}
          >
            {isPerfect ? (
              <Trophy className="h-10 w-10 text-white" />
            ) : isGood ? (
              <Target className="h-10 w-10 text-white" />
            ) : (
              <HelpCircle className="h-10 w-10 text-white" />
            )}
          </motion.div>
          
          <h3 className="text-xl font-bold text-gray-900 mb-2">
            {isPerfect ? 'Perfect Score!' : isGood ? 'Great Job!' : 'Keep Practicing!'}
          </h3>
          
          <p className="text-gray-600 mb-4">
            You scored {score} out of {questions.length} ({percentage}%)
          </p>
          
          {/* Score Breakdown */}
          <div className="flex justify-center gap-6 mb-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-emerald-600">{score}</div>
              <div className="text-sm text-gray-500">Correct</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">{questions.length - score}</div>
              <div className="text-sm text-gray-500">Incorrect</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {Math.round(results.reduce((acc, r) => acc + r.timeSpent, 0) / 60)}m
              </div>
              <div className="text-sm text-gray-500">Time</div>
            </div>
          </div>
          
          {/* Actions */}
          <div className="flex justify-center gap-3">
            {allowRetry && (
              <Button
                variant="outline"
                onClick={handleRetry}
                className="gap-2"
              >
                <RotateCcw className="h-4 w-4" />
                Try Again
              </Button>
            )}
            <Button
              onClick={() => onAskCogni?.('review')}
              className="gap-2 bg-gradient-to-r from-blue-500 to-blue-600"
            >
              <Sparkles className="h-4 w-4" />
              Review with Cogni
            </Button>
          </div>
        </Card>
      </motion.div>
    )
  }
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn('p-4', className)}
    >
      <Card className="overflow-hidden">
        {/* Header */}
        <div className="p-4 bg-gradient-to-r from-blue-500 to-purple-500 text-white">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold">{title}</h3>
            <div className="flex items-center gap-2 text-sm">
              <Clock className="h-4 w-4" />
              <span>Q{currentIndex + 1}/{questions.length}</span>
            </div>
          </div>
          
          {showProgress && (
            <div className="h-1.5 bg-white/20 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                className="h-full bg-white"
              />
            </div>
          )}
        </div>
        
        {/* Question */}
        <div className="p-5">
          <div className="flex items-start gap-3 mb-4">
            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
              <span className="text-sm font-medium text-blue-600">{currentIndex + 1}</span>
            </div>
            <div>
              <p className="text-gray-900 font-medium">{currentQuestion.question}</p>
              {currentQuestion.difficulty && (
                <Badge className={cn(
                  'mt-2 text-xs',
                  currentQuestion.difficulty === 'Beginner' && 'bg-emerald-100 text-emerald-700',
                  currentQuestion.difficulty === 'Intermediate' && 'bg-amber-100 text-amber-700',
                  currentQuestion.difficulty === 'Advanced' && 'bg-red-100 text-red-700'
                )}>
                  {currentQuestion.difficulty}
                </Badge>
              )}
            </div>
          </div>
          
          {/* Options */}
          {currentQuestion.type === 'multiple-choice' && currentQuestion.options && (
            <div className="space-y-2">
              {currentQuestion.options.map((option, index) => {
                const isSelected = selectedAnswer === index
                const isCorrect = index === currentQuestion.correctAnswer
                const showResult = isSubmitted
                
                return (
                  <motion.button
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    onClick={() => handleSelect(index)}
                    disabled={isSubmitted}
                    className={cn(
                      'w-full p-4 rounded-xl text-left transition-all flex items-center gap-3',
                      'border-2',
                      showResult
                        ? isCorrect
                          ? 'border-emerald-500 bg-emerald-50'
                          : isSelected
                          ? 'border-red-500 bg-red-50'
                          : 'border-gray-200 bg-gray-50'
                        : isSelected
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50/50'
                    )}
                  >
                    <div className={cn(
                      'w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 font-medium text-sm',
                      showResult
                        ? isCorrect
                          ? 'bg-emerald-500 text-white'
                          : isSelected
                          ? 'bg-red-500 text-white'
                          : 'bg-gray-100 text-gray-500'
                        : isSelected
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-100 text-gray-500'
                    )}>
                      {showResult ? (
                        isCorrect ? (
                          <CheckCircle2 className="h-5 w-5" />
                        ) : isSelected ? (
                          <XCircle className="h-5 w-5" />
                        ) : (
                          String.fromCharCode(65 + index)
                        )
                      ) : (
                        String.fromCharCode(65 + index)
                      )}
                    </div>
                    <span className={cn(
                      showResult && isCorrect && 'text-emerald-700 font-medium',
                      showResult && isSelected && !isCorrect && 'text-red-700'
                    )}>
                      {option}
                    </span>
                  </motion.button>
                )
              })}
            </div>
          )}
          
          {/* Hint */}
          {currentQuestion.hint && !isSubmitted && (
            <div className="mt-4">
              <AnimatePresence mode="wait">
                {showHint ? (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-sm text-amber-800"
                  >
                    <div className="flex items-start gap-2">
                      <Lightbulb className="h-4 w-4 mt-0.5 flex-shrink-0" />
                      <span>{currentQuestion.hint}</span>
                    </div>
                  </motion.div>
                ) : (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowHint(true)}
                    className="text-amber-600 hover:text-amber-700 hover:bg-amber-50"
                  >
                    <Lightbulb className="h-4 w-4 mr-1" />
                    Show Hint
                  </Button>
                )}
              </AnimatePresence>
            </div>
          )}
          
          {/* Explanation */}
          <AnimatePresence>
            {isSubmitted && showExplanation && currentQuestion.explanation && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-xl"
              >
                <div className="flex items-start gap-2">
                  <Sparkles className="h-5 w-5 text-blue-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <div className="font-medium text-blue-900 mb-1">Explanation</div>
                    <p className="text-sm text-blue-700">{currentQuestion.explanation}</p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          
          {/* Actions */}
          <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-100">
            <div className="text-sm text-gray-500">
              {currentQuestion.points && (
                <Badge variant="outline" className="mr-2">
                  {currentQuestion.points} pts
                </Badge>
              )}
            </div>
            
            <div className="flex items-center gap-2">
              {!isSubmitted ? (
                <>
                  <Button
                    variant="ghost"
                    onClick={() => onAskCogni?.(currentQuestion.id)}
                    className="text-blue-600"
                  >
                    <Sparkles className="h-4 w-4 mr-1" />
                    Ask Cogni
                  </Button>
                  <Button
                    onClick={handleSubmit}
                    disabled={selectedAnswer === null}
                    className="gap-1"
                  >
                    Submit
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </>
              ) : (
                <Button onClick={handleNext} className="gap-1">
                  {currentIndex < questions.length - 1 ? (
                    <>
                      Next Question
                      <ArrowRight className="h-4 w-4" />
                    </>
                  ) : (
                    <>
                      See Results
                      <Trophy className="h-4 w-4" />
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>
        </div>
      </Card>
    </motion.div>
  )
}

export default InteractiveQuiz
