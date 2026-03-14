'use client'

import { useState, useCallback, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Layers,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Sparkles,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { cn } from '@/lib/utils'

// Flashcard Types
export interface Flashcard {
  id: string
  front: string
  back: string
  tags: string[]
  resourceId?: string
  resourceName?: string
  createdAt: string
  lastReviewedAt?: string
  nextReviewAt?: string
  interval?: number
  easeFactor?: number
  repetitions?: number
}

export interface FlashcardDeckProps {
  cards: Flashcard[]
  onRate?: (cardId: string, rating: 'again' | 'hard' | 'good' | 'easy') => void
  onNavigate?: (cardIndex: number) => void
  currentIndex?: number
  showProgress?: boolean
  className?: string
}

// Rating colors
const ratingConfig = {
  again: {
    label: 'Again',
    color: 'bg-red-500 hover:bg-red-600',
    textColor: 'text-white',
    description: 'Didn\'t know',
    shortcut: '1',
  },
  hard: {
    label: 'Hard',
    color: 'bg-orange-500 hover:bg-orange-600',
    textColor: 'text-white',
    description: 'Barely knew',
    shortcut: '2',
  },
  good: {
    label: 'Good',
    color: 'bg-cyan-500 hover:bg-cyan-600',
    textColor: 'text-white',
    description: 'Knew it well',
    shortcut: '3',
  },
  easy: {
    label: 'Easy',
    color: 'bg-green-500 hover:bg-green-600',
    textColor: 'text-white',
    description: 'Too easy',
    shortcut: '4',
  },
}

// Flip animation variants
const flipVariants = {
  front: {
    rotateY: 0,
    transition: {
      duration: 0.4,
      type: 'spring',
      stiffness: 300,
      damping: 30,
    },
  },
  back: {
    rotateY: 180,
    transition: {
      duration: 0.4,
      type: 'spring',
      stiffness: 300,
      damping: 30,
    },
  },
}

// Card slide animation variants
const slideVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 300 : -300,
    opacity: 0,
    scale: 0.9,
  }),
  center: {
    x: 0,
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.3,
      type: 'spring',
      stiffness: 300,
      damping: 30,
    },
  },
  exit: (direction: number) => ({
    x: direction < 0 ? 300 : -300,
    opacity: 0,
    scale: 0.9,
    transition: {
      duration: 0.2,
    },
  }),
}

export function FlashcardDeck({
  cards,
  onRate,
  onNavigate,
  currentIndex = 0,
  showProgress = true,
  className,
}: FlashcardDeckProps) {
  const [index, setIndex] = useState(currentIndex)
  const [isFlipped, setIsFlipped] = useState(false)
  const [direction, setDirection] = useState(0)

  // Use refs for keyboard handlers to avoid stale closures
  const isFlippedRef = useRef(isFlipped)
  const indexRef = useRef(index)
  const cardsRef = useRef(cards)
  const onNavigateRef = useRef(onNavigate)
  const onRateRef = useRef(onRate)

  // Keep refs updated
  useEffect(() => {
    isFlippedRef.current = isFlipped
    indexRef.current = index
    cardsRef.current = cards
    onNavigateRef.current = onNavigate
    onRateRef.current = onRate
  }, [isFlipped, index, cards, onNavigate, onRate])

  const currentCard = cards[index]
  const progress = cards.length > 0 ? ((index + 1) / cards.length) * 100 : 0

  // Navigation functions - defined first
  const handleNext = useCallback(() => {
    const currentIndex = indexRef.current
    const currentCards = cardsRef.current
    if (currentIndex < currentCards.length - 1) {
      setDirection(1)
      setIndex((prev) => prev + 1)
      setIsFlipped(false)
      onNavigateRef.current?.(currentIndex + 1)
    }
  }, [])

  const handlePrev = useCallback(() => {
    const currentIndex = indexRef.current
    if (currentIndex > 0) {
      setDirection(-1)
      setIndex((prev) => prev - 1)
      setIsFlipped(false)
      onNavigateRef.current?.(currentIndex - 1)
    }
  }, [])

  const handleRate = useCallback(
    (rating: 'again' | 'hard' | 'good' | 'easy') => {
      const currentCards = cardsRef.current
      const currentIndex = indexRef.current
      const card = currentCards[currentIndex]
      if (card) {
        onRateRef.current?.(card.id, rating)
        // Auto-advance to next card after rating
        if (currentIndex < currentCards.length - 1) {
          setTimeout(() => {
            handleNext()
          }, 300)
        }
      }
    },
    [handleNext]
  )

  const handleFlip = useCallback(() => {
    setIsFlipped((prev) => !prev)
  }, [])

  // Keyboard shortcuts - defined after all handler functions
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return
      }

      const flipped = isFlippedRef.current

      switch (e.key) {
        case ' ':
          e.preventDefault()
          setIsFlipped((prev) => !prev)
          break
        case 'ArrowLeft':
          if (!flipped) {
            handlePrev()
          }
          break
        case 'ArrowRight':
          if (!flipped) {
            handleNext()
          }
          break
        case '1':
          if (flipped) handleRate('again')
          break
        case '2':
          if (flipped) handleRate('hard')
          break
        case '3':
          if (flipped) handleRate('good')
          break
        case '4':
          if (flipped) handleRate('easy')
          break
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handlePrev, handleNext, handleRate])

  if (!cards.length) {
    return (
      <div className={cn('flex flex-col items-center justify-center py-16', className)}>
        <div className="w-16 h-16 rounded-full bg-cyan-50 flex items-center justify-center mb-4">
          <Layers className="w-8 h-8 text-cyan-500" />
        </div>
        <p className="text-gray-500 text-lg font-medium">No flashcards available</p>
        <p className="text-gray-400 text-sm mt-1">Create some cards to start studying</p>
      </div>
    )
  }

  return (
    <div className={cn('flex flex-col', className)}>
      {/* Progress Section */}
      {showProgress && (
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-600">
              Card {index + 1} of {cards.length}
            </span>
            <span className="text-sm text-cyan-600 font-medium">
              {Math.round(progress)}% complete
            </span>
          </div>
          <Progress value={progress} className="h-2 bg-cyan-100 [&>div]:bg-cyan-500" />
        </div>
      )}

      {/* Flashcard Area */}
      <div className="relative perspective-1000">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={index}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            className="relative w-full"
            style={{ perspective: '1000px' }}
          >
            <div
              className="relative cursor-pointer min-h-[320px] sm:min-h-[380px]"
              onClick={handleFlip}
            >
              {/* Card Container with 3D flip */}
              <motion.div
                animate={isFlipped ? 'back' : 'front'}
                variants={flipVariants}
                className="relative w-full h-full"
                style={{ transformStyle: 'preserve-3d' }}
              >
                {/* Front Side */}
                <Card
                  className={cn(
                    'absolute inset-0 w-full min-h-[320px] sm:min-h-[380px]',
                    'bg-gradient-to-br from-white to-cyan-50/30',
                    'border-2 border-cyan-200 shadow-lg',
                    'backface-hidden'
                  )}
                  style={{ backfaceVisibility: 'hidden' }}
                >
                  <CardContent className="flex flex-col items-center justify-center h-full p-8 text-center">
                    {/* Card Type Indicator */}
                    <div className="absolute top-4 left-4">
                      <Badge variant="outline" className="bg-cyan-50 border-cyan-200 text-cyan-700">
                        <Layers className="w-3 h-3 mr-1" />
                        Question
                      </Badge>
                    </div>

                    {/* Flip Hint */}
                    <div className="absolute top-4 right-4">
                      <Badge variant="outline" className="bg-gray-50 border-gray-200 text-gray-500">
                        <RotateCcw className="w-3 h-3 mr-1" />
                        Tap to flip
                      </Badge>
                    </div>

                    {/* Question Content */}
                    <div className="flex-1 flex items-center justify-center">
                      <p className="text-xl sm:text-2xl font-medium text-gray-800 leading-relaxed">
                        {currentCard.front}
                      </p>
                    </div>

                    {/* Tags */}
                    {currentCard.tags.length > 0 && (
                      <div className="absolute bottom-4 left-4 flex flex-wrap gap-1">
                        {currentCard.tags.slice(0, 3).map((tag) => (
                          <Badge
                            key={tag}
                            variant="secondary"
                            className="bg-cyan-100 text-cyan-700 text-xs"
                          >
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Back Side */}
                <Card
                  className={cn(
                    'absolute inset-0 w-full min-h-[320px] sm:min-h-[380px]',
                    'bg-gradient-to-br from-cyan-500 to-cyan-600',
                    'border-2 border-cyan-300 shadow-xl',
                    'backface-hidden'
                  )}
                  style={{
                    backfaceVisibility: 'hidden',
                    transform: 'rotateY(180deg)',
                  }}
                >
                  <CardContent className="flex flex-col items-center justify-center h-full p-8 text-center">
                    {/* Card Type Indicator */}
                    <div className="absolute top-4 left-4">
                      <Badge className="bg-white/20 border-white/30 text-white border">
                        <Sparkles className="w-3 h-3 mr-1" />
                        Answer
                      </Badge>
                    </div>

                    {/* Answer Content */}
                    <div className="flex-1 flex items-center justify-center">
                      <p className="text-xl sm:text-2xl font-medium text-white leading-relaxed">
                        {currentCard.back}
                      </p>
                    </div>

                    {/* Rating Buttons */}
                    <div className="absolute bottom-20 left-0 right-0 px-4">
                      <p className="text-white/80 text-sm mb-3">How well did you know this?</p>
                      <div className="flex justify-center gap-2">
                        {(Object.keys(ratingConfig) as Array<keyof typeof ratingConfig>).map(
                          (rating) => (
                            <Button
                              key={rating}
                              size="sm"
                              className={cn(
                                ratingConfig[rating].color,
                                ratingConfig[rating].textColor,
                                'flex-1 max-w-[80px]'
                              )}
                              onClick={(e) => {
                                e.stopPropagation()
                                handleRate(rating)
                              }}
                            >
                              <div className="flex flex-col items-center">
                                <span className="font-semibold">{ratingConfig[rating].label}</span>
                                <span className="text-[10px] opacity-80">
                                  [{ratingConfig[rating].shortcut}]
                                </span>
                              </div>
                            </Button>
                          )
                        )}
                      </div>
                    </div>

                    {/* Related Resource Link */}
                    {currentCard.resourceId && currentCard.resourceName && (
                      <div className="absolute bottom-4 left-4">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-white/80 hover:text-white hover:bg-white/10"
                          onClick={(e) => {
                            e.stopPropagation()
                            // Navigate to resource
                          }}
                        >
                          <ExternalLink className="w-3 h-3 mr-1" />
                          {currentCard.resourceName}
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation Controls */}
      <div className="flex items-center justify-center gap-4 mt-6">
        <Button
          variant="outline"
          size="lg"
          onClick={handlePrev}
          disabled={index === 0}
          className="w-12 h-12 rounded-full"
        >
          <ChevronLeft className="w-5 h-5" />
        </Button>

        <Button
          variant="outline"
          size="lg"
          onClick={handleFlip}
          className="gap-2 bg-cyan-50 border-cyan-200 hover:bg-cyan-100 text-cyan-700"
        >
          <RotateCcw className="w-4 h-4" />
          Flip
          <span className="text-xs opacity-60 ml-1">[Space]</span>
        </Button>

        <Button
          variant="outline"
          size="lg"
          onClick={handleNext}
          disabled={index === cards.length - 1}
          className="w-12 h-12 rounded-full"
        >
          <ChevronRight className="w-5 h-5" />
        </Button>
      </div>

      {/* Keyboard Shortcuts Hint */}
      <div className="flex justify-center gap-4 mt-4 text-xs text-gray-400">
        <span>
          <kbd className="px-1.5 py-0.5 bg-gray-100 rounded text-gray-600">←</kbd> Prev
        </span>
        <span>
          <kbd className="px-1.5 py-0.5 bg-gray-100 rounded text-gray-600">Space</kbd> Flip
        </span>
        <span>
          <kbd className="px-1.5 py-0.5 bg-gray-100 rounded text-gray-600">→</kbd> Next
        </span>
        <span>
          <kbd className="px-1.5 py-0.5 bg-gray-100 rounded text-gray-600">1-4</kbd> Rate
        </span>
      </div>
    </div>
  )
}

export default FlashcardDeck
