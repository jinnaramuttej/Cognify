'use client'

import React, { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Highlighter,
  Tag,
  Download,
  Sparkles,
  MessageSquare,
  Trash2,
  ChevronRight,
  Search,
  Filter,
  X,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Separator } from '@/components/ui/separator'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

// Highlight color definitions
export const HIGHLIGHT_COLORS = {
  yellow: { bg: '#FEF08A', border: '#EAB308', name: 'Yellow' },
  green: { bg: '#BBF7D0', border: '#22C55E', name: 'Green' },
  pink: { bg: '#FBCFE8', border: '#EC4899', name: 'Pink' },
  blue: { bg: '#BFDBFE', border: '#3B82F6', name: 'Blue' },
  orange: { bg: '#FED7AA', border: '#F97316', name: 'Orange' },
} as const

export type HighlightColorKey = keyof typeof HIGHLIGHT_COLORS

// Types
export interface Highlight {
  id: string
  text: string
  color: HighlightColorKey
  note?: string
  tags: string[]
  resourceId: string
  position: {
    start: number
    end: number
    page?: number
  }
  createdAt: string
}

export interface AnnotationPanelProps {
  highlights: Highlight[]
  onHighlightClick?: (highlight: Highlight) => void
  onHighlightUpdate?: (id: string, updates: Partial<Highlight>) => void
  onHighlightDelete?: (id: string) => void
  onExportNotes?: () => void
  onSyncFlashcards?: (highlights: Highlight[]) => void
  className?: string
}

const ColorPicker: React.FC<{
  selectedColor: HighlightColorKey
  onColorSelect: (color: HighlightColorKey) => void
  size?: 'sm' | 'md'
}> = ({ selectedColor, onColorSelect, size = 'md' }) => {
  const sizeClasses = size === 'sm' ? 'w-5 h-5' : 'w-6 h-6'

  return (
    <div className="flex gap-1.5">
      {(Object.keys(HIGHLIGHT_COLORS) as HighlightColorKey[]).map((color) => (
        <motion.button
          key={color}
          whileHover={{ scale: 1.15 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => onColorSelect(color)}
          className={`${sizeClasses} rounded-full border-2 transition-all ${
            selectedColor === color
              ? 'ring-2 ring-offset-1 ring-primary'
              : 'hover:scale-110'
          }`}
          style={{
            backgroundColor: HIGHLIGHT_COLORS[color].bg,
            borderColor: HIGHLIGHT_COLORS[color].border,
          }}
          title={HIGHLIGHT_COLORS[color].name}
        />
      ))}
    </div>
  )
}

const HighlightCard: React.FC<{
  highlight: Highlight
  onClick?: () => void
  onUpdate?: (updates: Partial<Highlight>) => void
  onDelete?: () => void
}> = ({ highlight, onClick, onUpdate, onDelete }) => {
  const [isEditing, setIsEditing] = useState(false)
  const [note, setNote] = useState(highlight.note || '')
  const [newTag, setNewTag] = useState('')

  const handleAddTag = () => {
    if (newTag.trim() && !highlight.tags.includes(newTag.trim())) {
      onUpdate?.({ tags: [...highlight.tags, newTag.trim()] })
      setNewTag('')
    }
  }

  const handleRemoveTag = (tagToRemove: string) => {
    onUpdate?.({ tags: highlight.tags.filter((t) => t !== tagToRemove) })
  }

  const handleSaveNote = () => {
    onUpdate?.({ note })
    setIsEditing(false)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -10 }}
      className="group relative rounded-lg border bg-card p-3 transition-all hover:shadow-md"
      style={{
        borderLeftColor: HIGHLIGHT_COLORS[highlight.color].border,
        borderLeftWidth: '4px',
      }}
    >
      {/* Highlight text */}
      <div
        className="mb-2 cursor-pointer rounded px-2 py-1 text-sm"
        style={{ backgroundColor: HIGHLIGHT_COLORS[highlight.color].bg }}
        onClick={onClick}
      >
        "{highlight.text}"
      </div>

      {/* Color picker for editing */}
      <div className="mb-2 flex items-center justify-between">
        <ColorPicker
          selectedColor={highlight.color}
          onColorSelect={(color) => onUpdate?.({ color })}
          size="sm"
        />
        <div className="flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={() => setIsEditing(!isEditing)}
          >
            <MessageSquare className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-destructive hover:text-destructive"
            onClick={onDelete}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      {/* Note section */}
      <AnimatePresence>
        {isEditing && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="mb-2 overflow-hidden"
          >
            <Textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Add a note..."
              className="min-h-[60px] text-sm"
            />
            <div className="mt-2 flex gap-2">
              <Button size="sm" onClick={handleSaveNote}>
                Save
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setIsEditing(false)}
              >
                Cancel
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Display note if exists */}
      {highlight.note && !isEditing && (
        <div className="mb-2 rounded bg-muted/50 p-2 text-xs text-muted-foreground">
          <span className="font-medium">Note:</span> {highlight.note}
        </div>
      )}

      {/* Tags */}
      <div className="flex flex-wrap items-center gap-1">
        <Tag className="h-3 w-3 text-muted-foreground" />
        {highlight.tags.map((tag) => (
          <Badge
            key={tag}
            variant="secondary"
            className="cursor-pointer text-[10px] hover:bg-destructive/20"
            onClick={() => handleRemoveTag(tag)}
          >
            {tag}
            <X className="ml-1 h-2 w-2" />
          </Badge>
        ))}
        <div className="flex items-center">
          <Input
            value={newTag}
            onChange={(e) => setNewTag(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAddTag()}
            placeholder="Add tag..."
            className="h-5 w-16 border-none bg-transparent p-0 text-[10px] focus-visible:ring-0"
          />
        </div>
      </div>

      {/* Jump arrow */}
      <motion.button
        whileHover={{ x: 2 }}
        onClick={onClick}
        className="absolute right-2 top-2 text-muted-foreground opacity-0 transition-opacity hover:text-primary group-hover:opacity-100"
      >
        <ChevronRight className="h-4 w-4" />
      </motion.button>
    </motion.div>
  )
}

export const AnnotationPanel: React.FC<AnnotationPanelProps> = ({
  highlights,
  onHighlightClick,
  onHighlightUpdate,
  onHighlightDelete,
  onExportNotes,
  onSyncFlashcards,
  className,
}) => {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedColor, setSelectedColor] = useState<HighlightColorKey | 'all'>('all')
  const [selectedTag, setSelectedTag] = useState<string | null>(null)

  // Get all unique tags
  const allTags = useMemo(() => {
    const tags = new Set<string>()
    highlights.forEach((h) => h.tags.forEach((t) => tags.add(t)))
    return Array.from(tags).sort()
  }, [highlights])

  // Filter highlights
  const filteredHighlights = useMemo(() => {
    return highlights.filter((h) => {
      const matchesSearch =
        searchQuery === '' ||
        h.text.toLowerCase().includes(searchQuery.toLowerCase()) ||
        h.note?.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesColor = selectedColor === 'all' || h.color === selectedColor
      const matchesTag = !selectedTag || h.tags.includes(selectedTag)
      return matchesSearch && matchesColor && matchesTag
    })
  }, [highlights, searchQuery, selectedColor, selectedTag])

  // Group highlights by color for stats
  const colorStats = useMemo(() => {
    const stats: Record<HighlightColorKey, number> = {
      yellow: 0,
      green: 0,
      pink: 0,
      blue: 0,
      orange: 0,
    }
    highlights.forEach((h) => stats[h.color]++)
    return stats
  }, [highlights])

  const handleSyncFlashcards = () => {
    const highlightsWithNotes = highlights.filter((h) => h.note)
    onSyncFlashcards?.(highlightsWithNotes)
  }

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Highlighter className="h-5 w-5 text-primary" />
            Highlights & Notes
          </CardTitle>
          <Badge variant="secondary">{highlights.length}</Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Search and filter */}
        <div className="space-y-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search highlights..."
              className="pl-9"
            />
          </div>

          <div className="flex items-center gap-2">
            <Select
              value={selectedColor}
              onValueChange={(v) => setSelectedColor(v as HighlightColorKey | 'all')}
            >
              <SelectTrigger className="h-8 w-full">
                <Filter className="mr-2 h-3 w-3" />
                <SelectValue placeholder="Filter by color" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Colors</SelectItem>
                {(Object.keys(HIGHLIGHT_COLORS) as HighlightColorKey[]).map((color) => (
                  <SelectItem key={color} value={color}>
                    <div className="flex items-center gap-2">
                      <span
                        className="h-3 w-3 rounded-full"
                        style={{ backgroundColor: HIGHLIGHT_COLORS[color].bg }}
                      />
                      {HIGHLIGHT_COLORS[color].name}
                      <span className="ml-auto text-muted-foreground">
                        ({colorStats[color]})
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Tag filter */}
          {allTags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {allTags.slice(0, 6).map((tag) => (
                <Badge
                  key={tag}
                  variant={selectedTag === tag ? 'default' : 'outline'}
                  className="cursor-pointer text-xs"
                  onClick={() => setSelectedTag(selectedTag === tag ? null : tag)}
                >
                  {tag}
                </Badge>
              ))}
              {allTags.length > 6 && (
                <Badge variant="outline" className="text-xs">
                  +{allTags.length - 6} more
                </Badge>
              )}
            </div>
          )}
        </div>

        <Separator />

        {/* Highlights list */}
        <ScrollArea className="h-[400px] pr-2">
          <AnimatePresence mode="popLayout">
            {filteredHighlights.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center justify-center py-8 text-muted-foreground"
              >
                <Highlighter className="mb-2 h-8 w-8 opacity-50" />
                <p className="text-sm">No highlights found</p>
                <p className="text-xs">Select text in the document to highlight</p>
              </motion.div>
            ) : (
              <div className="space-y-3">
                {filteredHighlights.map((highlight) => (
                  <HighlightCard
                    key={highlight.id}
                    highlight={highlight}
                    onClick={() => onHighlightClick?.(highlight)}
                    onUpdate={(updates) => onHighlightUpdate?.(highlight.id, updates)}
                    onDelete={() => onHighlightDelete?.(highlight.id)}
                  />
                ))}
              </div>
            )}
          </AnimatePresence>
        </ScrollArea>

        <Separator />

        {/* Action buttons */}
        <div className="flex flex-col gap-2">
          <Button
            variant="outline"
            className="w-full justify-start"
            onClick={onExportNotes}
            disabled={highlights.length === 0}
          >
            <Download className="mr-2 h-4 w-4" />
            Export All Notes
          </Button>
          <Button
            variant="default"
            className="w-full justify-start bg-gradient-to-r from-primary to-primary/80"
            onClick={handleSyncFlashcards}
            disabled={highlights.filter((h) => h.note).length === 0}
          >
            <Sparkles className="mr-2 h-4 w-4" />
            Sync to Flashcards
            <Badge variant="secondary" className="ml-auto">
              {highlights.filter((h) => h.note).length}
            </Badge>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

export default AnnotationPanel
