'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Highlighter,
  MessageSquare,
  Bookmark,
  Tag,
  Send,
  Trash2,
  Edit3,
  ChevronRight,
  ChevronLeft,
  Palette,
  Sparkles,
  X,
  Check,
  Clock,
  FileText,
} from 'lucide-react'
import { cn } from '@/lib/utils'

// Types
export interface Highlight {
  id: string
  text: string
  startPosition: number
  endPosition: number
  color: HighlightColor
  note?: string
  createdAt: Date
}

export interface Note {
  id: string
  content: string
  timestamp?: number // For video/audio notes
  createdAt: Date
  updatedAt: Date
}

type HighlightColor = 'yellow' | 'green' | 'blue' | 'pink' | 'orange'

interface QuickNotePanelProps {
  resourceId: string
  highlights?: Highlight[]
  notes?: Note[]
  onHighlight?: (text: string, color: HighlightColor, note?: string) => void
  onNote?: (content: string, timestamp?: number) => void
  onHighlightClick?: (highlight: Highlight) => void
  onDeleteHighlight?: (id: string) => void
  onDeleteNote?: (id: string) => void
  currentTime?: number // For video/audio timestamped notes
  selectedText?: string
  className?: string
}

const highlightColors: Record<HighlightColor, { bg: string; border: string; label: string }> = {
  yellow: { bg: 'bg-yellow-100', border: 'border-yellow-300', label: 'Important' },
  green: { bg: 'bg-green-100', border: 'border-green-300', label: 'Key Concept' },
  blue: { bg: 'bg-blue-100', border: 'border-blue-300', label: 'Definition' },
  pink: { bg: 'bg-pink-100', border: 'border-pink-300', label: 'Formula' },
  orange: { bg: 'bg-orange-100', border: 'border-orange-300', label: 'Example' },
}

export function QuickNotePanel({
  resourceId,
  highlights = [],
  notes = [],
  onHighlight,
  onNote,
  onHighlightClick,
  onDeleteHighlight,
  onDeleteNote,
  currentTime,
  selectedText,
  className,
}: QuickNotePanelProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<'highlights' | 'notes'>('highlights')
  const [newNote, setNewNote] = useState('')
  const [highlightColor, setHighlightColor] = useState<HighlightColor>('yellow')
  const [highlightNote, setHighlightNote] = useState('')
  const [modalDismissed, setModalDismissed] = useState(false)
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null)
  const [editContent, setEditContent] = useState('')
  
  // Format timestamp
  const formatTimestamp = (seconds: number): string => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }
  
  // Handle add note
  const handleAddNote = useCallback(() => {
    if (!newNote.trim()) return
    onNote?.(newNote.trim(), currentTime)
    setNewNote('')
  }, [newNote, currentTime, onNote])
  
  // Handle add highlight
  const handleAddHighlight = useCallback(() => {
    if (!selectedText || !onHighlight) return
    onHighlight(selectedText, highlightColor, highlightNote || undefined)
    setModalDismissed(true)
    setHighlightNote('')
  }, [selectedText, highlightColor, highlightNote, onHighlight])
  
  // Derive modal visibility from selectedText and dismissed state
  const showHighlightModal = selectedText && selectedText.length > 0 && !modalDismissed
  
  return (
    <>
      {/* Floating Toggle Button */}
      <motion.button
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'fixed z-40 w-12 h-12 rounded-full shadow-lg',
          'bg-gradient-to-r from-blue-500 to-purple-500',
          'flex items-center justify-center text-white',
          'transition-all duration-300',
          isOpen ? 'right-[320px]' : 'right-4',
          'bottom-20',
        )}
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.div
              key="close"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
            >
              <X className="h-5 w-5" />
            </motion.div>
          ) : (
            <motion.div
              key="open"
              initial={{ rotate: 90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: -90, opacity: 0 }}
            >
              <Edit3 className="h-5 w-5" />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>
      
      {/* Slide-out Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ x: 320, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 320, opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className={cn(
              'fixed right-0 top-0 bottom-0 w-80 z-30',
              'bg-white border-l border-gray-200 shadow-xl',
              'flex flex-col',
              className
            )}
          >
            {/* Header */}
            <div className="p-4 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-gray-900">Study Notes</h3>
                <Badge variant="outline" className="text-xs">
                  {highlights.length + notes.length} items
                </Badge>
              </div>
              
              {/* Tabs */}
              <div className="flex gap-1 mt-3 p-1 bg-gray-100 rounded-lg">
                <button
                  onClick={() => setActiveTab('highlights')}
                  className={cn(
                    'flex-1 py-1.5 text-sm font-medium rounded-md transition-colors',
                    activeTab === 'highlights'
                      ? 'bg-white text-blue-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  )}
                >
                  <Highlighter className="h-4 w-4 inline-block mr-1" />
                  Highlights
                </button>
                <button
                  onClick={() => setActiveTab('notes')}
                  className={cn(
                    'flex-1 py-1.5 text-sm font-medium rounded-md transition-colors',
                    activeTab === 'notes'
                      ? 'bg-white text-blue-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  )}
                >
                  <MessageSquare className="h-4 w-4 inline-block mr-1" />
                  Notes
                </button>
              </div>
            </div>
            
            {/* Content */}
            <ScrollArea className="flex-1 p-4">
              {/* Highlight Modal (when text is selected) */}
              <AnimatePresence>
                {showHighlightModal && selectedText && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-xl"
                  >
                    <div className="text-sm font-medium text-blue-800 mb-2">
                      Add Highlight
                    </div>
                    <div className="text-sm text-blue-700 bg-white p-2 rounded border border-blue-100 mb-3 line-clamp-2">
                      "{selectedText}"
                    </div>
                    
                    {/* Color Selection */}
                    <div className="flex gap-1 mb-3">
                      {(Object.keys(highlightColors) as HighlightColor[]).map((color) => (
                        <button
                          key={color}
                          onClick={() => setHighlightColor(color)}
                          className={cn(
                            'w-6 h-6 rounded-full border-2 transition-all',
                            highlightColors[color].bg.split(' ')[0],
                            highlightColor === color
                              ? `${highlightColors[color].border} scale-110`
                              : 'border-transparent hover:scale-105'
                          )}
                          title={highlightColors[color].label}
                        />
                      ))}
                    </div>
                    
                    {/* Note */}
                    <Input
                      value={highlightNote}
                      onChange={(e) => setHighlightNote(e.target.value)}
                      placeholder="Add a note (optional)"
                      className="mb-2 text-sm"
                    />
                    
                    {/* Actions */}
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setModalDismissed(true)}
                        className="flex-1"
                      >
                        Cancel
                      </Button>
                      <Button
                        size="sm"
                        onClick={handleAddHighlight}
                        className="flex-1 bg-gradient-to-r from-blue-500 to-purple-500"
                      >
                        <Check className="h-4 w-4 mr-1" />
                        Save
                      </Button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
              
              {/* Highlights Tab */}
              {activeTab === 'highlights' && (
                <div className="space-y-3">
                  {highlights.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <Highlighter className="h-8 w-8 mx-auto mb-2 opacity-30" />
                      <p className="text-sm">Select text to add highlights</p>
                    </div>
                  ) : (
                    highlights.map((highlight, index) => (
                      <motion.div
                        key={highlight.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        onClick={() => onHighlightClick?.(highlight)}
                        className={cn(
                          'p-3 rounded-lg border cursor-pointer transition-all hover:shadow-md',
                          highlightColors[highlight.color].bg,
                          highlightColors[highlight.color].border,
                        )}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <p className="text-sm text-gray-700 line-clamp-2">
                              "{highlight.text}"
                            </p>
                            {highlight.note && (
                              <p className="text-xs text-gray-500 mt-1 italic">
                                {highlight.note}
                              </p>
                            )}
                            <div className="flex items-center gap-2 mt-2 text-xs text-gray-400">
                              <Badge variant="outline" className="text-xs h-5">
                                {highlightColors[highlight.color].label}
                              </Badge>
                              <Clock className="h-3 w-3" />
                              {new Date(highlight.createdAt).toLocaleDateString()}
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 flex-shrink-0 opacity-0 group-hover:opacity-100"
                            onClick={(e) => {
                              e.stopPropagation()
                              onDeleteHighlight?.(highlight.id)
                            }}
                          >
                            <Trash2 className="h-3 w-3 text-gray-400" />
                          </Button>
                        </div>
                      </motion.div>
                    ))
                  )}
                </div>
              )}
              
              {/* Notes Tab */}
              {activeTab === 'notes' && (
                <div className="space-y-3">
                  {/* Add Note */}
                  <div className="p-3 bg-gray-50 rounded-xl">
                    <Textarea
                      value={newNote}
                      onChange={(e) => setNewNote(e.target.value)}
                      placeholder={currentTime ? `Note at ${formatTimestamp(currentTime)}` : "Write a note..."}
                      className="min-h-[80px] resize-none border-gray-200"
                    />
                    <div className="flex items-center justify-between mt-2">
                      {currentTime !== undefined && (
                        <Badge variant="outline" className="text-xs">
                          <Clock className="h-3 w-3 mr-1" />
                          {formatTimestamp(currentTime)}
                        </Badge>
                      )}
                      <Button
                        size="sm"
                        onClick={handleAddNote}
                        disabled={!newNote.trim()}
                        className="ml-auto"
                      >
                        <Send className="h-4 w-4 mr-1" />
                        Save
                      </Button>
                    </div>
                  </div>
                  
                  {/* Notes List */}
                  {notes.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-30" />
                      <p className="text-sm">No notes yet</p>
                    </div>
                  ) : (
                    notes.map((note, index) => (
                      <motion.div
                        key={note.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="p-3 bg-white border border-gray-200 rounded-lg group"
                      >
                        {editingNoteId === note.id ? (
                          <div>
                            <Textarea
                              value={editContent}
                              onChange={(e) => setEditContent(e.target.value)}
                              className="min-h-[60px] resize-none"
                            />
                            <div className="flex gap-2 mt-2">
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => setEditingNoteId(null)}
                              >
                                Cancel
                              </Button>
                              <Button
                                size="sm"
                                onClick={() => {
                                  // Handle update
                                  setEditingNoteId(null)
                                }}
                              >
                                Save
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <>
                            <p className="text-sm text-gray-700">{note.content}</p>
                            <div className="flex items-center justify-between mt-2">
                              <div className="flex items-center gap-2 text-xs text-gray-400">
                                {note.timestamp !== undefined && (
                                  <>
                                    <Clock className="h-3 w-3" />
                                    {formatTimestamp(note.timestamp)}
                                    <span>•</span>
                                  </>
                                )}
                                {new Date(note.updatedAt).toLocaleDateString()}
                              </div>
                              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-6 w-6"
                                  onClick={() => {
                                    setEditingNoteId(note.id)
                                    setEditContent(note.content)
                                  }}
                                >
                                  <Edit3 className="h-3 w-3" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-6 w-6"
                                  onClick={() => onDeleteNote?.(note.id)}
                                >
                                  <Trash2 className="h-3 w-3" />
                                </Button>
                              </div>
                            </div>
                          </>
                        )}
                      </motion.div>
                    ))
                  )}
                </div>
              )}
            </ScrollArea>
            
            {/* AI Suggest */}
            <div className="p-4 border-t border-gray-100">
              <Button
                variant="outline"
                className="w-full justify-start text-blue-600 hover:bg-blue-50"
              >
                <Sparkles className="h-4 w-4 mr-2" />
                Generate Study Summary
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

export default QuickNotePanel
