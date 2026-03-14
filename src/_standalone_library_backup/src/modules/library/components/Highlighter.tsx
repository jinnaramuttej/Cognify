'use client'

import React, { useState, useCallback, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Highlighter as HighlighterIcon,
  MessageSquare,
  Trash2,
  X,
  Check,
} from 'lucide-react'
import { HIGHLIGHT_COLORS, type HighlightColorKey } from './AnnotationPanel'

// Types
export interface TextHighlight {
  id: string
  startOffset: number
  endOffset: number
  text: string
  color: HighlightColorKey
  note?: string
}

export interface HighlighterProps {
  content: string
  highlights: TextHighlight[]
  onHighlightCreate?: (highlight: Omit<TextHighlight, 'id'>) => void
  onHighlightUpdate?: (id: string, updates: Partial<TextHighlight>) => void
  onHighlightDelete?: (id: string) => void
  onHighlightClick?: (highlight: TextHighlight) => void
  className?: string
}

// Color picker popup component
const ColorPickerPopup: React.FC<{
  position: { x: number; y: number }
  selectedText: string
  onColorSelect: (color: HighlightColorKey) => void
  onAddNote: () => void
  onClose: () => void
}> = ({ position, selectedText, onColorSelect, onAddNote, onClose }) => {
  const popupRef = useRef<HTMLDivElement>(null)

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (popupRef.current && !popupRef.current.contains(e.target as Node)) {
        onClose()
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [onClose])

  // Adjust position to stay within viewport
  const adjustedPosition = {
    x: Math.min(position.x, window.innerWidth - 280),
    y: Math.min(position.y, window.innerHeight - 100),
  }

  return (
    <motion.div
      ref={popupRef}
      initial={{ opacity: 0, scale: 0.9, y: -10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9, y: -10 }}
      className="fixed z-50 rounded-lg border bg-popover p-3 shadow-lg"
      style={{
        left: adjustedPosition.x,
        top: adjustedPosition.y,
      }}
    >
      <div className="mb-2 text-xs text-muted-foreground">
        <HighlighterIcon className="mr-1 inline h-3 w-3" />
        Highlight: "{selectedText.slice(0, 30)}
        {selectedText.length > 30 ? '...' : ''}"
      </div>

      <div className="mb-3 flex items-center gap-2">
        {(Object.keys(HIGHLIGHT_COLORS) as HighlightColorKey[]).map((color) => (
          <motion.button
            key={color}
            whileHover={{ scale: 1.15 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => onColorSelect(color)}
            className="h-7 w-7 rounded-full border-2 transition-all hover:ring-2 hover:ring-primary/50"
            style={{
              backgroundColor: HIGHLIGHT_COLORS[color].bg,
              borderColor: HIGHLIGHT_COLORS[color].border,
            }}
            title={HIGHLIGHT_COLORS[color].name}
          />
        ))}
      </div>

      <div className="flex gap-2">
        <button
          onClick={onAddNote}
          className="flex items-center gap-1 rounded-md bg-muted px-2 py-1 text-xs transition-colors hover:bg-muted/80"
        >
          <MessageSquare className="h-3 w-3" />
          Add Note
        </button>
        <button
          onClick={onClose}
          className="flex items-center gap-1 rounded-md px-2 py-1 text-xs text-muted-foreground hover:text-foreground"
        >
          <X className="h-3 w-3" />
          Cancel
        </button>
      </div>
    </motion.div>
  )
}

// Note input popup
const NoteInputPopup: React.FC<{
  position: { x: number; y: number }
  highlightColor: HighlightColorKey
  onSave: (note: string) => void
  onClose: () => void
}> = ({ position, highlightColor, onSave, onClose }) => {
  const [note, setNote] = useState('')
  const inputRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  const adjustedPosition = {
    x: Math.min(position.x, window.innerWidth - 280),
    y: Math.min(position.y, window.innerHeight - 150),
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="fixed z-50 w-64 rounded-lg border bg-popover p-3 shadow-lg"
      style={{
        left: adjustedPosition.x,
        top: adjustedPosition.y,
      }}
    >
      <div
        className="mb-2 h-1 w-full rounded"
        style={{ backgroundColor: HIGHLIGHT_COLORS[highlightColor].bg }}
      />
      <textarea
        ref={inputRef}
        value={note}
        onChange={(e) => setNote(e.target.value)}
        placeholder="Add a note to this highlight..."
        className="min-h-[60px] w-full resize-none rounded border bg-background p-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
        onKeyDown={(e) => {
          if (e.key === 'Enter' && e.ctrlKey) {
            onSave(note)
          }
        }}
      />
      <div className="mt-2 flex justify-end gap-2">
        <button
          onClick={onClose}
          className="flex items-center gap-1 rounded-md px-2 py-1 text-xs text-muted-foreground hover:text-foreground"
        >
          <X className="h-3 w-3" />
          Cancel
        </button>
        <button
          onClick={() => onSave(note)}
          className="flex items-center gap-1 rounded-md bg-primary px-2 py-1 text-xs text-primary-foreground hover:bg-primary/90"
        >
          <Check className="h-3 w-3" />
          Save
        </button>
      </div>
    </motion.div>
  )
}

// Highlight menu (shown when clicking on existing highlight)
const HighlightMenu: React.FC<{
  position: { x: number; y: number }
  highlight: TextHighlight
  onUpdateColor: (color: HighlightColorKey) => void
  onEditNote: () => void
  onDelete: () => void
  onClose: () => void
}> = ({ position, highlight, onUpdateColor, onEditNote, onDelete, onClose }) => {
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose()
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [onClose])

  const adjustedPosition = {
    x: Math.min(position.x, window.innerWidth - 200),
    y: Math.min(position.y, window.innerHeight - 200),
  }

  return (
    <motion.div
      ref={menuRef}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="fixed z-50 rounded-lg border bg-popover p-2 shadow-lg"
      style={{
        left: adjustedPosition.x,
        top: adjustedPosition.y,
      }}
    >
      <div className="mb-2 flex gap-1">
        {(Object.keys(HIGHLIGHT_COLORS) as HighlightColorKey[]).map((color) => (
          <motion.button
            key={color}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => {
              onUpdateColor(color)
              onClose()
            }}
            className={`h-6 w-6 rounded-full border-2 ${
              highlight.color === color ? 'ring-2 ring-primary' : ''
            }`}
            style={{
              backgroundColor: HIGHLIGHT_COLORS[color].bg,
              borderColor: HIGHLIGHT_COLORS[color].border,
            }}
          />
        ))}
      </div>
      <div className="flex gap-1">
        <button
          onClick={() => {
            onEditNote()
            onClose()
          }}
          className="flex items-center gap-1 rounded bg-muted px-2 py-1 text-xs hover:bg-muted/80"
        >
          <MessageSquare className="h-3 w-3" />
          Note
        </button>
        <button
          onClick={() => {
            onDelete()
            onClose()
          }}
          className="flex items-center gap-1 rounded bg-destructive/10 px-2 py-1 text-xs text-destructive hover:bg-destructive/20"
        >
          <Trash2 className="h-3 w-3" />
          Remove
        </button>
      </div>
    </motion.div>
  )
}

export const Highlighter: React.FC<HighlighterProps> = ({
  content,
  highlights,
  onHighlightCreate,
  onHighlightUpdate,
  onHighlightDelete,
  onHighlightClick,
  className,
}) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const [selection, setSelection] = useState<{
    text: string
    position: { x: number; y: number }
    range: { start: number; end: number } | null
  } | null>(null)
  const [showNoteInput, setShowNoteInput] = useState(false)
  const [pendingHighlight, setPendingHighlight] = useState<Omit<TextHighlight, 'id'> | null>(null)
  const [activeHighlight, setActiveHighlight] = useState<{
    highlight: TextHighlight
    position: { x: number; y: number }
  } | null>(null)

  // Handle text selection
  const handleMouseUp = useCallback(() => {
    const selection = window.getSelection()
    if (!selection || selection.isCollapsed) return

    const text = selection.toString().trim()
    if (!text || text.length < 2) return

    const range = selection.getRangeAt(0)
    const rect = range.getBoundingClientRect()

    // Calculate offsets relative to the container
    if (containerRef.current) {
      const containerText = containerRef.current.textContent || ''
      const preSelectionRange = document.createRange()
      preSelectionRange.selectNodeContents(containerRef.current)
      preSelectionRange.setEnd(range.startContainer, range.startOffset)
      const startOffset = preSelectionRange.toString().length
      const endOffset = startOffset + text.length

      // Check if this selection overlaps with existing highlights
      const overlaps = highlights.some(
        (h) =>
          (startOffset >= h.startOffset && startOffset < h.endOffset) ||
          (endOffset > h.startOffset && endOffset <= h.endOffset) ||
          (startOffset <= h.startOffset && endOffset >= h.endOffset)
      )

      if (!overlaps) {
        setSelection({
          text,
          position: {
            x: rect.left + rect.width / 2,
            y: rect.top - 10,
          },
          range: { start: startOffset, end: endOffset },
        })
      }
    }
  }, [highlights])

  // Handle clicking on highlighted text
  const handleHighlightClick = useCallback(
    (e: React.MouseEvent) => {
      const target = e.target as HTMLElement
      const highlightId = target.dataset.highlightId

      if (highlightId) {
        const highlight = highlights.find((h) => h.id === highlightId)
        if (highlight) {
          onHighlightClick?.(highlight)
          setActiveHighlight({
            highlight,
            position: { x: e.clientX, y: e.clientY },
          })
        }
      }
    },
    [highlights, onHighlightClick]
  )

  // Create highlight with color
  const handleColorSelect = useCallback(
    (color: HighlightColorKey) => {
      if (selection?.range) {
        const newHighlight: Omit<TextHighlight, 'id'> = {
          startOffset: selection.range.start,
          endOffset: selection.range.end,
          text: selection.text,
          color,
        }
        setPendingHighlight(newHighlight)
        setShowNoteInput(true)
        setSelection(null)
      }
    },
    [selection]
  )

  // Save note and create highlight
  const handleSaveNote = useCallback(
    (note: string) => {
      if (pendingHighlight) {
        onHighlightCreate?.({
          ...pendingHighlight,
          note: note || undefined,
        })
        setPendingHighlight(null)
        setShowNoteInput(false)
      }
    },
    [pendingHighlight, onHighlightCreate]
  )

  // Render content with highlights applied
  const renderHighlightedContent = () => {
    if (highlights.length === 0) {
      return <span>{content}</span>
    }

    // Sort highlights by start offset
    const sortedHighlights = [...highlights].sort((a, b) => a.startOffset - b.startOffset)

    const elements: React.ReactNode[] = []
    let lastIndex = 0

    sortedHighlights.forEach((highlight, index) => {
      // Add text before highlight
      if (highlight.startOffset > lastIndex) {
        elements.push(
          <span key={`text-${index}`}>
            {content.slice(lastIndex, highlight.startOffset)}
          </span>
        )
      }

      // Add highlighted text
      elements.push(
        <span
          key={`highlight-${highlight.id}`}
          data-highlight-id={highlight.id}
          className="cursor-pointer rounded px-0.5 transition-all hover:brightness-95"
          style={{ backgroundColor: HIGHLIGHT_COLORS[highlight.color].bg }}
          title={highlight.note || 'Click to edit'}
        >
          {content.slice(highlight.startOffset, highlight.endOffset)}
        </span>
      )

      lastIndex = highlight.endOffset
    })

    // Add remaining text
    if (lastIndex < content.length) {
      elements.push(<span key="text-end">{content.slice(lastIndex)}</span>)
    }

    return elements
  }

  return (
    <div
      ref={containerRef}
      className={`relative select-text ${className || ''}`}
      onMouseUp={handleMouseUp}
      onClick={handleHighlightClick}
    >
      {renderHighlightedContent()}

      {/* Color picker popup */}
      <AnimatePresence>
        {selection && (
          <ColorPickerPopup
            position={selection.position}
            selectedText={selection.text}
            onColorSelect={handleColorSelect}
            onAddNote={() => {
              // Will show note input after color selection
              handleColorSelect('yellow')
            }}
            onClose={() => setSelection(null)}
          />
        )}
      </AnimatePresence>

      {/* Note input popup */}
      <AnimatePresence>
        {showNoteInput && pendingHighlight && (
          <NoteInputPopup
            position={{
              x: window.innerWidth / 2 - 128,
              y: window.innerHeight / 2 - 75,
            }}
            highlightColor={pendingHighlight.color}
            onSave={handleSaveNote}
            onClose={() => {
              setShowNoteInput(false)
              setPendingHighlight(null)
            }}
          />
        )}
      </AnimatePresence>

      {/* Highlight menu */}
      <AnimatePresence>
        {activeHighlight && (
          <HighlightMenu
            position={activeHighlight.position}
            highlight={activeHighlight.highlight}
            onUpdateColor={(color) =>
              onHighlightUpdate?.(activeHighlight.highlight.id, { color })
            }
            onEditNote={() => {
              // Could open note editor here
              setPendingHighlight({
                startOffset: activeHighlight.highlight.startOffset,
                endOffset: activeHighlight.highlight.endOffset,
                text: activeHighlight.highlight.text,
                color: activeHighlight.highlight.color,
                note: activeHighlight.highlight.note,
              })
              setShowNoteInput(true)
            }}
            onDelete={() => onHighlightDelete?.(activeHighlight.highlight.id)}
            onClose={() => setActiveHighlight(null)}
          />
        )}
      </AnimatePresence>
    </div>
  )
}

export default Highlighter
