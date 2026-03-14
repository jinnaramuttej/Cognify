'use client'

import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Sparkles,
  Layers,
  FileText,
  Edit3,
  Check,
  X,
  Plus,
  Trash2,
  ChevronDown,
  Wand2,
  Loader2,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'
import type { Flashcard } from './FlashcardDeck'

// Types
export interface Resource {
  id: string
  title: string
  type: 'notes' | 'pdf' | 'video' | 'concept'
  subject: string
  chapter: string
  wordCount?: number
}

export interface GeneratedFlashcard {
  id: string
  front: string
  back: string
  tags: string[]
  isEditing: boolean
  isNew: boolean
}

export interface FlashcardGeneratorProps {
  resources: Resource[]
  onGenerate?: (resourceId: string, count: number) => Promise<GeneratedFlashcard[]>
  onSave?: (cards: Flashcard[]) => Promise<void>
  className?: string
}

// Card count options
const cardCountOptions = [
  { value: 5, label: '5 Cards', description: 'Quick review' },
  { value: 10, label: '10 Cards', description: 'Standard session' },
  { value: 20, label: '20 Cards', description: 'Deep dive' },
]

// Resource type icons/colors
const resourceTypeConfig = {
  notes: { color: 'bg-blue-50 text-blue-600 border-blue-200', icon: FileText },
  pdf: { color: 'bg-red-50 text-red-600 border-red-200', icon: FileText },
  video: { color: 'bg-purple-50 text-purple-600 border-purple-200', icon: FileText },
  concept: { color: 'bg-green-50 text-green-600 border-green-200', icon: Sparkles },
}

export function FlashcardGenerator({
  resources,
  onGenerate,
  onSave,
  className,
}: FlashcardGeneratorProps) {
  // State
  const [selectedResource, setSelectedResource] = useState<Resource | null>(null)
  const [cardCount, setCardCount] = useState(10)
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedCards, setGeneratedCards] = useState<GeneratedFlashcard[]>([])
  const [error, setError] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [showResourceDropdown, setShowResourceDropdown] = useState(false)

  // Generate flashcards
  const handleGenerate = useCallback(async () => {
    if (!selectedResource || !onGenerate) return

    setIsGenerating(true)
    setError(null)
    setGeneratedCards([])

    try {
      const cards = await onGenerate(selectedResource.id, cardCount)
      setGeneratedCards(
        cards.map((card) => ({
          ...card,
          isEditing: false,
          isNew: true,
        }))
      )
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate flashcards')
    } finally {
      setIsGenerating(false)
    }
  }, [selectedResource, cardCount, onGenerate])

  // Edit card
  const handleEditCard = useCallback((cardId: string, field: 'front' | 'back', value: string) => {
    setGeneratedCards((prev) =>
      prev.map((card) =>
        card.id === cardId ? { ...card, [field]: value, isNew: false } : card
      )
    )
  }, [])

  // Toggle edit mode
  const handleToggleEdit = useCallback((cardId: string) => {
    setGeneratedCards((prev) =>
      prev.map((card) => (card.id === cardId ? { ...card, isEditing: !card.isEditing } : card))
    )
  }, [])

  // Remove card
  const handleRemoveCard = useCallback((cardId: string) => {
    setGeneratedCards((prev) => prev.filter((card) => card.id !== cardId))
  }, [])

  // Add new card
  const handleAddCard = useCallback(() => {
    const newCard: GeneratedFlashcard = {
      id: `new-${Date.now()}`,
      front: '',
      back: '',
      tags: [],
      isEditing: true,
      isNew: true,
    }
    setGeneratedCards((prev) => [...prev, newCard])
  }, [])

  // Save cards
  const handleSave = useCallback(async () => {
    if (!onSave || generatedCards.length === 0) return

    // Validate cards
    const invalidCards = generatedCards.filter((card) => !card.front.trim() || !card.back.trim())
    if (invalidCards.length > 0) {
      setError('Please fill in all card fields before saving')
      return
    }

    setIsSaving(true)
    try {
      const cardsToSave: Flashcard[] = generatedCards.map((card) => ({
        id: card.id,
        front: card.front,
        back: card.back,
        tags: card.tags,
        createdAt: new Date().toISOString(),
      }))
      await onSave(cardsToSave)
      // Reset after save
      setGeneratedCards([])
      setSelectedResource(null)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save flashcards')
    } finally {
      setIsSaving(false)
    }
  }, [generatedCards, onSave])

  return (
    <div className={cn('flex flex-col', className)}>
      {/* Generator Controls */}
      {!generatedCards.length && (
        <Card className="border-cyan-100 bg-gradient-to-br from-white to-cyan-50/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-cyan-700">
              <Wand2 className="w-5 h-5" />
              AI Flashcard Generator
            </CardTitle>
            <CardDescription>
              Generate intelligent flashcards from your study materials
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Resource Selector */}
            <div className="space-y-2">
              <Label className="text-gray-700">Select Resource</Label>
              <div className="relative">
                <Button
                  variant="outline"
                  className="w-full justify-between bg-white border-gray-200"
                  onClick={() => setShowResourceDropdown(!showResourceDropdown)}
                >
                  {selectedResource ? (
                    <span className="flex items-center gap-2">
                      <span
                        className={cn(
                          'w-6 h-6 rounded flex items-center justify-center text-xs',
                          resourceTypeConfig[selectedResource.type].color
                        )}
                      >
                        {selectedResource.type.charAt(0).toUpperCase()}
                      </span>
                      {selectedResource.title}
                    </span>
                  ) : (
                    <span className="text-gray-400">Choose a resource...</span>
                  )}
                  <ChevronDown
                    className={cn('w-4 h-4 transition-transform', showResourceDropdown && 'rotate-180')}
                  />
                </Button>

                <AnimatePresence>
                  {showResourceDropdown && (
                    <motion.div
                      initial={{ opacity: 0, y: -8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      className="absolute top-full left-0 right-0 mt-1 z-10 bg-white border border-gray-200 rounded-lg shadow-lg max-h-64 overflow-y-auto"
                    >
                      {resources.map((resource) => {
                        const IconComponent = resourceTypeConfig[resource.type].icon
                        return (
                          <button
                            key={resource.id}
                            className="w-full px-4 py-3 flex items-center gap-3 hover:bg-cyan-50 transition-colors text-left"
                            onClick={() => {
                              setSelectedResource(resource)
                              setShowResourceDropdown(false)
                            }}
                          >
                            <span
                              className={cn(
                                'w-8 h-8 rounded-lg flex items-center justify-center',
                                resourceTypeConfig[resource.type].color
                              )}
                            >
                              <IconComponent className="w-4 h-4" />
                            </span>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-gray-900 truncate">{resource.title}</p>
                              <p className="text-xs text-gray-500">
                                {resource.subject} • {resource.chapter}
                                {resource.wordCount && ` • ${resource.wordCount} words`}
                              </p>
                            </div>
                          </button>
                        )
                      })}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Card Count Selection */}
            <div className="space-y-2">
              <Label className="text-gray-700">Number of Cards</Label>
              <div className="grid grid-cols-3 gap-2">
                {cardCountOptions.map((option) => (
                  <button
                    key={option.value}
                    className={cn(
                      'p-3 rounded-lg border-2 transition-all text-center',
                      cardCount === option.value
                        ? 'border-cyan-500 bg-cyan-50'
                        : 'border-gray-200 bg-white hover:border-cyan-200'
                    )}
                    onClick={() => setCardCount(option.value)}
                  >
                    <p
                      className={cn(
                        'font-semibold',
                        cardCount === option.value ? 'text-cyan-700' : 'text-gray-700'
                      )}
                    >
                      {option.label}
                    </p>
                    <p className="text-xs text-gray-500">{option.description}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Generate Button */}
            <Button
              className="w-full bg-cyan-500 hover:bg-cyan-600 text-white h-12"
              disabled={!selectedResource || isGenerating}
              onClick={handleGenerate}
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Generating Flashcards...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Generate Flashcards
                </>
              )}
            </Button>

            {/* Error */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700"
                >
                  <AlertCircle className="w-4 h-4" />
                  <span className="text-sm">{error}</span>
                </motion.div>
              )}
            </AnimatePresence>
          </CardContent>
        </Card>
      )}

      {/* Generated Cards Preview */}
      {generatedCards.length > 0 && (
        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Badge className="bg-cyan-100 text-cyan-700 border-cyan-200">
                <Layers className="w-3 h-3 mr-1" />
                {generatedCards.length} Cards Generated
              </Badge>
              <Badge variant="outline" className="text-gray-600">
                {selectedResource?.title}
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={handleAddCard}>
                <Plus className="w-4 h-4 mr-1" />
                Add Card
              </Button>
              <Button
                className="bg-cyan-500 hover:bg-cyan-600 text-white"
                size="sm"
                onClick={handleSave}
                disabled={isSaving}
              >
                {isSaving ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4 mr-1" />
                    Save All
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Cards List */}
          <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
            <AnimatePresence>
              {generatedCards.map((card, index) => (
                <motion.div
                  key={card.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ delay: index * 0.05 }}
                  className={cn(
                    'bg-white rounded-xl border-2 p-4 transition-all',
                    card.isEditing
                      ? 'border-cyan-300 shadow-md'
                      : 'border-gray-200 hover:border-cyan-200',
                    card.isNew && 'ring-2 ring-cyan-100'
                  )}
                >
                  {/* Card Header */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-cyan-100 text-cyan-700 text-xs font-semibold flex items-center justify-center">
                        {index + 1}
                      </span>
                      {card.tags.length > 0 && (
                        <div className="flex gap-1">
                          {card.tags.map((tag) => (
                            <Badge key={tag} variant="secondary" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 text-gray-400 hover:text-cyan-600"
                        onClick={() => handleToggleEdit(card.id)}
                      >
                        <Edit3 className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 text-gray-400 hover:text-red-600"
                        onClick={() => handleRemoveCard(card.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Card Content */}
                  {card.isEditing ? (
                    <div className="space-y-3">
                      <div>
                        <Label className="text-xs text-gray-500 mb-1 block">Front (Question)</Label>
                        <Textarea
                          value={card.front}
                          onChange={(e) => handleEditCard(card.id, 'front', e.target.value)}
                          placeholder="Enter the question..."
                          className="min-h-[60px] resize-none"
                        />
                      </div>
                      <div>
                        <Label className="text-xs text-gray-500 mb-1 block">Back (Answer)</Label>
                        <Textarea
                          value={card.back}
                          onChange={(e) => handleEditCard(card.id, 'back', e.target.value)}
                          placeholder="Enter the answer..."
                          className="min-h-[60px] resize-none"
                        />
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        className="w-full"
                        onClick={() => handleToggleEdit(card.id)}
                      >
                        <Check className="w-4 h-4 mr-1" />
                        Done Editing
                      </Button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <p className="text-xs text-gray-400 font-medium">QUESTION</p>
                        <p className="text-gray-800 font-medium">{card.front}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs text-gray-400 font-medium">ANSWER</p>
                        <p className="text-gray-700">{card.back}</p>
                      </div>
                    </div>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* Action Footer */}
          <div className="flex items-center justify-between pt-4 border-t border-gray-100">
            <Button
              variant="ghost"
              className="text-gray-500"
              onClick={() => {
                setGeneratedCards([])
                setError(null)
              }}
            >
              <X className="w-4 h-4 mr-1" />
              Cancel
            </Button>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <CheckCircle2 className="w-4 h-4 text-green-500" />
              Edit cards before saving
            </div>
          </div>

          {/* Error */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700"
              >
                <AlertCircle className="w-4 h-4" />
                <span className="text-sm">{error}</span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </div>
  )
}

export default FlashcardGenerator
