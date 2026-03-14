'use client'

import { useState, useCallback, useEffect, useMemo, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Clock,
  Target,
  TrendingUp,
  Trophy,
  X,
  Pause,
  Play,
  RotateCcw,
  Calendar,
  Brain,
  CheckCircle2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { cn } from '@/lib/utils'
import type { Flashcard } from './FlashcardDeck'

// SM-2 Algorithm Types
export interface SM2Result {
  interval: number
  easeFactor: number
  repetitions: number
  nextReviewDate: Date
}

export interface ReviewSession {
  totalCards: number
  cardsReviewed: number
  correctCount: number
  startTime: Date
  endTime?: Date
  averageTime: number
}

export interface FlashcardReviewerProps {
  cards: Flashcard[]
  onRate?: (cardId: string, rating: 'again' | 'hard' | 'good' | 'easy', sm2Result: SM2Result) => void
  onSessionComplete?: (session: ReviewSession) => void
  onExit?: () => void
  className?: string
}

// Rating configurations with SM-2 quality values
const ratingQuality = {
  again: 0,
  hard: 3,
  good: 4,
  easy: 5,
}

// SM-2 Algorithm Implementation
function calculateSM2(
  currentInterval: number,
  currentEaseFactor: number,
  currentRepetitions: number,
  quality: number
): SM2Result {
  let interval: number
  let easeFactor: number
  let repetitions: number

  // If quality < 3: reset repetitions
  if (quality < 3) {
    repetitions = 0
    interval = 1
  } else {
    // Calculate new interval
    if (currentRepetitions === 0) {
      interval = 1
    } else if (currentRepetitions === 1) {
      interval = 6
    } else {
      interval = Math.round(currentInterval * currentEaseFactor)
    }
    repetitions = currentRepetitions + 1
  }

  // Calculate new ease factor
  easeFactor = currentEaseFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02))
  easeFactor = Math.max(1.3, easeFactor)

  // Calculate next review date
  const nextReviewDate = new Date()
  nextReviewDate.setDate(nextReviewDate.getDate() + interval)

  return {
    interval,
    easeFactor,
    repetitions,
    nextReviewDate,
  }
}

// Format time estimate
function formatTimeEstimate(minutes: number): string {
  if (minutes < 1) return '< 1 min'
  if (minutes < 60) return `${Math.round(minutes)} min`
  const hours = Math.floor(minutes / 60)
  const mins = Math.round(minutes % 60)
  return `${hours}h ${mins}m`
}

// Format next review date
function formatNextReview(date: Date): string {
  const now = new Date()
  const diffDays = Math.ceil((date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))

  if (diffDays <= 0) return 'Today'
  if (diffDays === 1) return 'Tomorrow'
  if (diffDays < 7) return `In ${diffDays} days`
  if (diffDays < 30) return `In ${Math.round(diffDays / 7)} weeks`
  return `In ${Math.round(diffDays / 30)} months`
}

// Rating button config
const ratingButtons = [
  {
    rating: 'again' as const,
    label: 'Again',
    description: 'Complete blackout',
    color: 'bg-red-500 hover:bg-red-600',
    quality: 0,
    intervalText: '1 min',
  },
  {
    rating: 'hard' as const,
    label: 'Hard',
    description: 'Incorrect, but recalled',
    color: 'bg-orange-500 hover:bg-orange-600',
    quality: 3,
    intervalText: '10 min',
  },
  {
    rating: 'good' as const,
    label: 'Good',
    description: 'Correct with effort',
    color: 'bg-cyan-500 hover:bg-cyan-600',
    quality: 4,
    intervalText: '1 day',
  },
  {
    rating: 'easy' as const,
    label: 'Easy',
    description: 'Perfect response',
    color: 'bg-green-500 hover:bg-green-600',
    quality: 5,
    intervalText: '4 days',
  },
]

export function FlashcardReviewer({
  cards,
  onRate,
  onSessionComplete,
  onExit,
  className,
}: FlashcardReviewerProps) {
  // State
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isFlipped, setIsFlipped] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [sessionStartTime] = useState(new Date())
  const [cardTimes, setCardTimes] = useState<number[]>([])
  const [currentCardStartTime, setCurrentCardStartTime] = useState(new Date())
  const [ratings, setRatings] = useState<Map<string, 'again' | 'hard' | 'good' | 'easy'>>(new Map())
  const [lastSM2Result, setLastSM2Result] = useState<SM2Result | null>(null)
  const [showResult, setShowResult] = useState(false)

  // Refs for keyboard handlers
  const isFlippedRef = useRef(isFlipped)
  const isPausedRef = useRef(isPaused)
  const onExitRef = useRef(onExit)

  // Keep refs updated
  useEffect(() => {
    isFlippedRef.current = isFlipped
    isPausedRef.current = isPaused
    onExitRef.current = onExit
  }, [isFlipped, isPaused, onExit])

  // Get due cards (sorted by next review date)
  const dueCards = useMemo(() => {
    return cards.filter((card) => {
      if (!card.nextReviewAt) return true
      return new Date(card.nextReviewAt) <= new Date()
    })
  }, [cards])

  const currentCard = dueCards[currentIndex]
  const progress = dueCards.length > 0 ? (currentIndex / dueCards.length) * 100 : 0

  // Session stats
  const sessionStats = useMemo(() => {
    const reviewed = currentIndex
    const correct = Array.from(ratings.values()).filter((r) => r === 'good' || r === 'easy').length
    const avgTime = cardTimes.length > 0 ? cardTimes.reduce((a, b) => a + b, 0) / cardTimes.length : 0
    const accuracy = reviewed > 0 ? (correct / reviewed) * 100 : 0

    return {
      reviewed,
      correct,
      avgTime,
      accuracy,
    }
  }, [currentIndex, ratings, cardTimes])

  // Time estimate
  const timeEstimate = useMemo(() => {
    const remaining = dueCards.length - currentIndex
    const avgSeconds = sessionStats.avgTime || 30 // Default 30 seconds per card
    return formatTimeEstimate((remaining * avgSeconds) / 60)
  }, [dueCards.length, currentIndex, sessionStats.avgTime])

  // Handler functions - defined before useEffect
  const handleFlip = useCallback(() => {
    if (!isPausedRef.current) {
      setIsFlipped((prev) => !prev)
    }
  }, [])

  const handleRate = useCallback(
    (rating: 'again' | 'hard' | 'good' | 'easy') => {
      if (!currentCard) return

      // Calculate time spent on this card
      const timeSpent = (new Date().getTime() - currentCardStartTime.getTime()) / 1000
      setCardTimes((prev) => [...prev, timeSpent])

      // Store rating
      setRatings((prev) => new Map(prev).set(currentCard.id, rating))

      // Calculate SM-2 result
      const currentInterval = currentCard.interval || 0
      const currentEaseFactor = currentCard.easeFactor || 2.5
      const currentRepetitions = currentCard.repetitions || 0
      const quality = ratingQuality[rating]

      const sm2Result = calculateSM2(currentInterval, currentEaseFactor, currentRepetitions, quality)
      setLastSM2Result(sm2Result)

      // Call onRate callback
      onRate?.(currentCard.id, rating, sm2Result)

      // Show result briefly then advance
      setShowResult(true)
      setTimeout(() => {
        setShowResult(false)
        if (currentIndex < dueCards.length - 1) {
          setCurrentIndex((prev) => prev + 1)
          setIsFlipped(false)
          setCurrentCardStartTime(new Date())
        } else {
          // Session complete
          const session: ReviewSession = {
            totalCards: dueCards.length,
            cardsReviewed: currentIndex + 1,
            correctCount: sessionStats.correct + (rating === 'good' || rating === 'easy' ? 1 : 0),
            startTime: sessionStartTime,
            endTime: new Date(),
            averageTime: (sessionStats.avgTime * cardTimes.length + timeSpent) / (cardTimes.length + 1),
          }
          onSessionComplete?.(session)
        }
      }, 800)
    },
    [
      currentCard,
      currentIndex,
      dueCards.length,
      onRate,
      onSessionComplete,
      sessionStartTime,
      sessionStats,
      cardTimes,
      currentCardStartTime,
    ]
  )

  const handlePause = useCallback(() => {
    setIsPaused((prev) => !prev)
  }, [])

  const handleExit = useCallback(() => {
    if (onExitRef.current) {
      onExitRef.current()
    }
  }, [])

  // Keep a ref to handleRate for keyboard events
  const handleRateRef = useRef(handleRate)
  useEffect(() => {
    handleRateRef.current = handleRate
  }, [handleRate])

  // Keyboard shortcuts - defined after all handler functions
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return
      }

      const flipped = isFlippedRef.current
      const paused = isPausedRef.current

      switch (e.key) {
        case ' ':
          e.preventDefault()
          if (!paused) setIsFlipped((prev) => !prev)
          break
        case '1':
          if (flipped && !paused) handleRateRef.current('again')
          break
        case '2':
          if (flipped && !paused) handleRateRef.current('hard')
          break
        case '3':
          if (flipped && !paused) handleRateRef.current('good')
          break
        case '4':
          if (flipped && !paused) handleRateRef.current('easy')
          break
        case 'Escape':
          if (onExitRef.current) onExitRef.current()
          break
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  // Completion screen
  if (currentIndex >= dueCards.length && dueCards.length > 0) {
    return (
      <div className={cn('flex flex-col items-center py-12', className)}>
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-center"
        >
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-cyan-400 to-cyan-600 flex items-center justify-center mx-auto mb-6 shadow-lg">
            <Trophy className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Session Complete!</h2>
          <p className="text-gray-500 mb-6">Great job reviewing your flashcards</p>

          <div className="grid grid-cols-3 gap-4 mb-8">
            <Card className="bg-gradient-to-br from-cyan-50 to-white border-cyan-100">
              <CardContent className="p-4 text-center">
                <p className="text-2xl font-bold text-cyan-600">{sessionStats.reviewed}</p>
                <p className="text-xs text-gray-500">Cards Reviewed</p>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-green-50 to-white border-green-100">
              <CardContent className="p-4 text-center">
                <p className="text-2xl font-bold text-green-600">{Math.round(sessionStats.accuracy)}%</p>
                <p className="text-xs text-gray-500">Accuracy</p>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-purple-50 to-white border-purple-100">
              <CardContent className="p-4 text-center">
                <p className="text-2xl font-bold text-purple-600">
                  {formatTimeEstimate((Date.now() - sessionStartTime.getTime()) / 60000)}
                </p>
                <p className="text-xs text-gray-500">Total Time</p>
              </CardContent>
            </Card>
          </div>

          <Button onClick={handleExit} className="bg-cyan-500 hover:bg-cyan-600 text-white">
            <RotateCcw className="w-4 h-4 mr-2" />
            Start New Session
          </Button>
        </motion.div>
      </div>
    )
  }

  // No cards due
  if (dueCards.length === 0) {
    return (
      <div className={cn('flex flex-col items-center justify-center py-16', className)}>
        <div className="w-16 h-16 rounded-full bg-green-50 flex items-center justify-center mb-4">
          <CheckCircle2 className="w-8 h-8 text-green-500" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-1">All caught up!</h3>
        <p className="text-gray-500 text-sm mb-4">No cards due for review right now</p>
        <Button variant="outline" onClick={handleExit}>
          Go Back
        </Button>
      </div>
    )
  }

  return (
    <div className={cn('flex flex-col', className)}>
      {/* Header Stats */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-4">
          {/* Due cards count */}
          <div className="flex items-center gap-2 text-sm">
            <div className="w-8 h-8 rounded-lg bg-cyan-50 flex items-center justify-center">
              <Target className="w-4 h-4 text-cyan-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Due</p>
              <p className="font-semibold text-gray-900">{dueCards.length - currentIndex} cards</p>
            </div>
          </div>

          {/* Time estimate */}
          <div className="flex items-center gap-2 text-sm">
            <div className="w-8 h-8 rounded-lg bg-purple-50 flex items-center justify-center">
              <Clock className="w-4 h-4 text-purple-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Est. Time</p>
              <p className="font-semibold text-gray-900">{timeEstimate}</p>
            </div>
          </div>

          {/* Accuracy */}
          {sessionStats.reviewed > 0 && (
            <div className="flex items-center gap-2 text-sm">
              <div className="w-8 h-8 rounded-lg bg-green-50 flex items-center justify-center">
                <TrendingUp className="w-4 h-4 text-green-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Accuracy</p>
                <p className="font-semibold text-gray-900">{Math.round(sessionStats.accuracy)}%</p>
              </div>
            </div>
          )}
        </div>

        {/* Controls */}
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={handlePause}
            className="text-gray-500 hover:text-gray-700"
          >
            {isPaused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleExit}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Progress bar */}
      <div className="mb-6">
        <Progress value={progress} className="h-1.5 bg-cyan-100 [&>div]:bg-cyan-500" />
      </div>

      {/* Paused Overlay */}
      <AnimatePresence>
        {isPaused && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-white/80 backdrop-blur-sm z-10 flex items-center justify-center rounded-xl"
          >
            <div className="text-center">
              <Pause className="w-12 h-12 text-cyan-500 mx-auto mb-4" />
              <p className="text-lg font-medium text-gray-900">Session Paused</p>
              <Button onClick={handlePause} className="mt-4 bg-cyan-500 hover:bg-cyan-600 text-white">
                <Play className="w-4 h-4 mr-2" />
                Resume
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Flashcard */}
      <div className="relative perspective-1000 flex-1">
        <motion.div
          animate={{ rotateY: isFlipped ? 180 : 0 }}
          transition={{ duration: 0.4, type: 'spring', stiffness: 300, damping: 30 }}
          className="relative w-full cursor-pointer min-h-[300px]"
          style={{ transformStyle: 'preserve-3d' }}
          onClick={handleFlip}
        >
          {/* Front */}
          <Card
            className={cn(
              'absolute inset-0 w-full min-h-[300px]',
              'bg-gradient-to-br from-white to-cyan-50/30',
              'border-2 border-cyan-200 shadow-lg',
              'backface-hidden'
            )}
            style={{ backfaceVisibility: 'hidden' }}
          >
            <CardContent className="flex flex-col items-center justify-center h-full p-8 text-center">
              <Badge variant="outline" className="mb-4 bg-cyan-50 border-cyan-200 text-cyan-700">
                <Brain className="w-3 h-3 mr-1" />
                Question
              </Badge>
              <p className="text-xl font-medium text-gray-800 leading-relaxed">
                {currentCard.front}
              </p>
              <p className="text-sm text-gray-400 mt-6">Tap to reveal answer</p>
            </CardContent>
          </Card>

          {/* Back */}
          <Card
            className={cn(
              'absolute inset-0 w-full min-h-[300px]',
              'bg-gradient-to-br from-cyan-500 to-cyan-600',
              'border-2 border-cyan-300 shadow-xl'
            )}
            style={{
              backfaceVisibility: 'hidden',
              transform: 'rotateY(180deg)',
            }}
          >
            <CardContent className="flex flex-col items-center justify-center h-full p-8 text-center">
              <Badge className="mb-4 bg-white/20 border-white/30 text-white border">
                Answer
              </Badge>
              <p className="text-xl font-medium text-white leading-relaxed mb-6">
                {currentCard.back}
              </p>

              {/* Rating Buttons */}
              <div className="w-full space-y-2">
                <p className="text-white/80 text-sm">How well did you know this?</p>
                <div className="grid grid-cols-4 gap-2">
                  {ratingButtons.map((btn) => (
                    <Button
                      key={btn.rating}
                      size="sm"
                      className={cn(btn.color, 'text-white flex-col h-auto py-2')}
                      onClick={(e) => {
                        e.stopPropagation()
                        handleRate(btn.rating)
                      }}
                    >
                      <span className="font-semibold">{btn.label}</span>
                      <span className="text-[10px] opacity-80">{btn.intervalText}</span>
                    </Button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Last Rating Result */}
      <AnimatePresence>
        {showResult && lastSM2Result && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50"
          >
            <Card className="bg-white shadow-xl border-cyan-100">
              <CardContent className="flex items-center gap-4 px-4 py-3">
                <Calendar className="w-5 h-5 text-cyan-600" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Next Review</p>
                  <p className="text-xs text-gray-500">
                    {formatNextReview(lastSM2Result.nextReviewDate)} • Interval:{' '}
                    {lastSM2Result.interval} days
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Keyboard shortcuts hint */}
      <div className="flex justify-center gap-4 mt-4 text-xs text-gray-400">
        <span>
          <kbd className="px-1.5 py-0.5 bg-gray-100 rounded text-gray-600">Space</kbd> Flip
        </span>
        <span>
          <kbd className="px-1.5 py-0.5 bg-gray-100 rounded text-gray-600">1-4</kbd> Rate
        </span>
        <span>
          <kbd className="px-1.5 py-0.5 bg-gray-100 rounded text-gray-600">Esc</kbd> Exit
        </span>
      </div>
    </div>
  )
}

export default FlashcardReviewer
