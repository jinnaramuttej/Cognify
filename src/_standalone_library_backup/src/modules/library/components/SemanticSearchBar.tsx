'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import {
  Search,
  X,
  Sparkles,
  Clock,
  TrendingUp,
  ArrowRight,
  FileText,
  Video,
  Headphones,
  BookOpen,
  Target,
  Layers,
  Loader2,
  Lightbulb,
  Wand2,
  Filter,
} from 'lucide-react'
import { cn } from '@/lib/utils'

// Types
export interface SemanticSuggestion {
  id: string
  type: 'resource' | 'chapter' | 'subject' | 'topic' | 'recent' | 'trending' | 'ai' | 'semantic'
  title: string
  subtitle?: string
  icon?: string
  resourceId?: string
  relevanceScore?: number
  matchedKeywords?: string[]
}

export interface SemanticChip {
  id: string
  label: string
  type: 'subject' | 'difficulty' | 'content_type' | 'exam' | 'topic'
  color: string
}

export interface NaturalLanguageQuery {
  original: string
  parsed: {
    subjects: string[]
    topics: string[]
    contentTypes: string[]
    difficulty: string | null
    exam: string | null
    grade: string | null
    timeContext: string | null
  }
  suggestedFilters: SemanticChip[]
}

interface SemanticSearchBarProps {
  value: string
  onChange: (value: string) => void
  onSearch: (query: string, filters?: SemanticChip[]) => void
  onSuggestionClick?: (suggestion: SemanticSuggestion) => void
  onSemanticParse?: (query: NaturalLanguageQuery) => void
  placeholder?: string
  suggestions?: SemanticSuggestion[]
  recentSearches?: { id: string; query: string; timestamp: Date }[]
  trendingTopics?: string[]
  semanticChips?: SemanticChip[]
  isLoading?: boolean
  className?: string
}

// Content type icons
const typeIcons: Record<string, React.ElementType> = {
  resource: FileText,
  chapter: BookOpen,
  subject: Target,
  topic: Layers,
  video: Video,
  audio: Headphones,
  notes: FileText,
  interactive: Layers,
  recent: Clock,
  trending: TrendingUp,
  ai: Sparkles,
  semantic: Wand2,
}

// Semantic suggestion chips - AI-powered suggestions
const SEMANTIC_CHIPS: SemanticChip[] = [
  { id: '1', label: 'JEE 12th', type: 'exam', color: 'blue' },
  { id: '2', label: 'Thermodynamics', type: 'topic', color: 'purple' },
  { id: '3', label: 'Video', type: 'content_type', color: 'green' },
  { id: '4', label: 'Beginner', type: 'difficulty', color: 'amber' },
  { id: '5', label: 'Physics', type: 'subject', color: 'rose' },
  { id: '6', label: 'NEET', type: 'exam', color: 'teal' },
]

// Example natural language queries for demo
const EXAMPLE_NL_QUERIES = [
  "Show me thermodynamics videos for JEE 12th",
  "Easy physics notes for beginners",
  "NEET biology PYQs from 2023",
  "Organic chemistry advanced level",
  "Quick revision formulas for JEE",
]

// Parse natural language query (demo implementation)
function parseNaturalLanguage(query: string): NaturalLanguageQuery {
  const lowerQuery = query.toLowerCase()
  
  const subjects = ['physics', 'chemistry', 'biology', 'mathematics', 'math']
    .filter(s => lowerQuery.includes(s))
  
  const topics = ['thermodynamics', 'organic', 'inorganic', 'mechanics', 'electrostatics', 'optics', 'algebra', 'calculus', 'geometry']
    .filter(t => lowerQuery.includes(t))
  
  const contentTypes = []
  if (lowerQuery.includes('video')) contentTypes.push('Video')
  if (lowerQuery.includes('notes')) contentTypes.push('Notes')
  if (lowerQuery.includes('pyq') || lowerQuery.includes('previous year')) contentTypes.push('PYQ')
  if (lowerQuery.includes('formula')) contentTypes.push('Formula List')
  if (lowerQuery.includes('diagram')) contentTypes.push('Diagram')
  
  let difficulty: string | null = null
  if (lowerQuery.includes('easy') || lowerQuery.includes('beginner')) difficulty = 'Beginner'
  if (lowerQuery.includes('intermediate')) difficulty = 'Intermediate'
  if (lowerQuery.includes('advanced') || lowerQuery.includes('hard')) difficulty = 'Advanced'
  
  let exam: string | null = null
  if (lowerQuery.includes('jee')) exam = 'JEE'
  if (lowerQuery.includes('neet')) exam = 'NEET'
  
  let grade: string | null = null
  if (lowerQuery.includes('11th') || lowerQuery.includes('class 11')) grade = '11'
  if (lowerQuery.includes('12th') || lowerQuery.includes('class 12')) grade = '12'
  
  let timeContext: string | null = null
  if (lowerQuery.includes('quick') || lowerQuery.includes('short')) timeContext = 'short'
  if (lowerQuery.includes('detailed') || lowerQuery.includes('comprehensive')) timeContext = 'long'
  if (lowerQuery.includes('revision')) timeContext = 'revision'
  
  // Build suggested filters
  const suggestedFilters: SemanticChip[] = []
  
  subjects.forEach((s, i) => {
    suggestedFilters.push({
      id: `subject-${i}`,
      label: s.charAt(0).toUpperCase() + s.slice(1),
      type: 'subject',
      color: 'rose',
    })
  })
  
  topics.forEach((t, i) => {
    suggestedFilters.push({
      id: `topic-${i}`,
      label: t.charAt(0).toUpperCase() + t.slice(1),
      type: 'topic',
      color: 'purple',
    })
  })
  
  contentTypes.forEach((ct, i) => {
    suggestedFilters.push({
      id: `content-${i}`,
      label: ct,
      type: 'content_type',
      color: 'green',
    })
  })
  
  if (exam) {
    suggestedFilters.push({
      id: 'exam-filter',
      label: exam,
      type: 'exam',
      color: 'blue',
    })
  }
  
  if (difficulty) {
    suggestedFilters.push({
      id: 'difficulty-filter',
      label: difficulty,
      type: 'difficulty',
      color: 'amber',
    })
  }
  
  return {
    original: query,
    parsed: {
      subjects,
      topics,
      contentTypes,
      difficulty,
      exam,
      grade,
      timeContext,
    },
    suggestedFilters,
  }
}

// Chip color mapping
const chipColorClasses: Record<string, { bg: string; text: string; border: string }> = {
  blue: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
  purple: { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200' },
  green: { bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200' },
  amber: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' },
  rose: { bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-200' },
  teal: { bg: 'bg-teal-50', text: 'text-teal-700', border: 'border-teal-200' },
}

export function SemanticSearchBar({
  value,
  onChange,
  onSearch,
  onSuggestionClick,
  onSemanticParse,
  placeholder = 'Try: "Show me thermodynamics videos for JEE 12th"',
  suggestions = [],
  recentSearches = [],
  trendingTopics = [],
  semanticChips = SEMANTIC_CHIPS,
  isLoading = false,
  className,
}: SemanticSearchBarProps) {
  const [isFocused, setIsFocused] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const [activeChips, setActiveChips] = useState<SemanticChip[]>([])
  const inputRef = useRef<HTMLInputElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  
  // Parse query when value changes
  const parsedQuery = useMemo(() => {
    if (value.trim().length > 3) {
      return parseNaturalLanguage(value)
    }
    return null
  }, [value])
  
  // Combined suggestions for display
  const displaySuggestions = [
    // AI semantic suggestion at top
    ...(value.trim() ? [{
      id: 'semantic-suggestion',
      type: 'semantic' as const,
      title: `Search semantically: "${value}"`,
      subtitle: parsedQuery ? `Found: ${parsedQuery.suggestedFilters.map(f => f.label).join(', ')}` : 'AI will understand your intent',
      relevanceScore: 95,
    }] : []),
    // AI ask suggestion
    ...(value.trim() ? [{
      id: 'ai-suggestion',
      type: 'ai' as const,
      title: `Ask Cogni: "${value}"`,
      subtitle: 'AI-powered search',
    }] : []),
    // Regular suggestions
    ...suggestions,
  ]
  
  // Show default suggestions when no value
  const showDefaultSuggestions = !value.trim() && isFocused
  
  // Handle keyboard navigation
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    const totalItems = showDefaultSuggestions
      ? recentSearches.length + trendingTopics.length
      : displaySuggestions.length
    
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setSelectedIndex(prev => 
          prev < totalItems - 1 ? prev + 1 : 0
        )
        break
      case 'ArrowUp':
        e.preventDefault()
        setSelectedIndex(prev => 
          prev > 0 ? prev - 1 : totalItems - 1
        )
        break
      case 'Enter':
        e.preventDefault()
        if (selectedIndex >= 0) {
          if (showDefaultSuggestions) {
            if (selectedIndex < recentSearches.length) {
              onChange(recentSearches[selectedIndex].query)
              onSearch(recentSearches[selectedIndex].query)
            } else {
              const topic = trendingTopics[selectedIndex - recentSearches.length]
              onChange(topic)
              onSearch(topic)
            }
          } else {
            onSuggestionClick?.(displaySuggestions[selectedIndex])
          }
        } else {
          onSearch(value, activeChips)
        }
        setIsFocused(false)
        break
      case 'Escape':
        setIsFocused(false)
        inputRef.current?.blur()
        break
    }
  }, [selectedIndex, showDefaultSuggestions, displaySuggestions, recentSearches, trendingTopics, value, activeChips, onChange, onSearch, onSuggestionClick])
  
  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsFocused(false)
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])
  
  // Clear search
  const handleClear = () => {
    onChange('')
    setActiveChips([])
    inputRef.current?.focus()
  }
  
  // Handle value change with selection reset
  const handleChange = (newValue: string) => {
    setSelectedIndex(-1)
    onChange(newValue)
  }
  
  // Toggle chip
  const toggleChip = (chip: SemanticChip) => {
    setActiveChips(prev => 
      prev.some(c => c.id === chip.id)
        ? prev.filter(c => c.id !== chip.id)
        : [...prev, chip]
    )
  }
  
  // Remove active chip
  const removeActiveChip = (chipId: string) => {
    setActiveChips(prev => prev.filter(c => c.id !== chipId))
  }

  return (
    <div ref={containerRef} className={cn('relative', className)}>
      {/* Search Input with Predictive Motion */}
      <motion.div
        initial={false}
        animate={{
          boxShadow: isFocused
            ? '0 0 0 3px rgba(139, 92, 246, 0.15), 0 8px 32px rgba(139, 92, 246, 0.1)'
            : '0 2px 8px rgba(0, 0, 0, 0.04)',
        }}
        transition={{ duration: 0.2 }}
        className="relative"
      >
        <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
          <motion.div
            animate={{ 
              scale: isFocused ? 1.1 : 1,
              rotate: isFocused ? 10 : 0 
            }}
            transition={{ type: 'spring', stiffness: 400, damping: 15 }}
          >
            <Search className={cn(
              'h-5 w-5 transition-colors',
              isFocused ? 'text-violet-500' : 'text-gray-400'
            )} />
          </motion.div>
        </div>
        
        <Input
          ref={inputRef}
          value={value}
          onChange={(e) => handleChange(e.target.value)}
          onFocus={() => {
            setIsFocused(true)
            setSelectedIndex(-1)
          }}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className={cn(
            'h-14 pl-12 pr-28 text-base',
            'border-gray-200 rounded-2xl',
            'focus:border-violet-300 focus:ring-0',
            'transition-all duration-300',
            'placeholder:text-gray-400'
          )}
        />
        
        {/* Right Actions */}
        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
          {isLoading && (
            <Loader2 className="h-4 w-4 animate-spin text-violet-400" />
          )}
          
          {value && (
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
            >
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClear}
                className="h-8 w-8 p-0 hover:bg-gray-100"
              >
                <X className="h-4 w-4 text-gray-400" />
              </Button>
            </motion.div>
          )}
          
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Button
              size="sm"
              onClick={() => onSearch(value, activeChips)}
              className="h-9 px-4 bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 shadow-lg shadow-violet-500/20 rounded-xl"
            >
              <Sparkles className="h-4 w-4 mr-1.5" />
              Search
            </Button>
          </motion.div>
        </div>
      </motion.div>
      
      {/* Active Chips */}
      <AnimatePresence>
        {activeChips.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="flex flex-wrap gap-2 mt-3 px-1"
          >
            {activeChips.map((chip) => {
              const colors = chipColorClasses[chip.color] || chipColorClasses.blue
              return (
                <motion.div
                  key={chip.id}
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.8, opacity: 0 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                >
                  <Badge
                    variant="secondary"
                    className={cn(
                      'px-3 py-1.5 rounded-full text-sm font-medium border cursor-pointer',
                      colors.bg, colors.text, colors.border,
                      'hover:shadow-md transition-shadow'
                    )}
                    onClick={() => removeActiveChip(chip.id)}
                  >
                    {chip.label}
                    <X className="h-3 w-3 ml-1.5" />
                  </Badge>
                </motion.div>
              )
            })}
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Semantic Suggestion Chips */}
      <AnimatePresence>
        {isFocused && !value.trim() && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="flex flex-wrap gap-2 mt-3 px-1"
          >
            <span className="text-xs text-gray-400 font-medium py-1.5 flex items-center gap-1">
              <Lightbulb className="h-3 w-3" />
              Quick filters:
            </span>
            {semanticChips.map((chip, index) => {
              const colors = chipColorClasses[chip.color] || chipColorClasses.blue
              const isActive = activeChips.some(c => c.id === chip.id)
              
              return (
                <motion.button
                  key={chip.id}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.03 }}
                  onClick={() => toggleChip(chip)}
                  className={cn(
                    'px-3 py-1.5 rounded-full text-sm font-medium border transition-all',
                    isActive
                      ? `${colors.bg} ${colors.text} ${colors.border} shadow-sm`
                      : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  )}
                >
                  {chip.label}
                </motion.button>
              )
            })}
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Parsed Query Preview */}
      <AnimatePresence>
        {parsedQuery && parsedQuery.suggestedFilters.length > 0 && value.trim().length > 5 && (
          <motion.div
            initial={{ opacity: 0, y: -8, height: 0 }}
            animate={{ opacity: 1, y: 0, height: 'auto' }}
            exit={{ opacity: 0, y: -8, height: 0 }}
            className="mt-3 px-1"
          >
            <div className="flex items-center gap-2 text-sm">
              <Wand2 className="h-4 w-4 text-violet-500" />
              <span className="text-gray-500">AI detected:</span>
              <div className="flex flex-wrap gap-1.5">
                {parsedQuery.suggestedFilters.map((filter, index) => {
                  const colors = chipColorClasses[filter.color] || chipColorClasses.blue
                  return (
                    <motion.span
                      key={index}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.05 }}
                      className={cn(
                        'px-2 py-0.5 rounded-md text-xs font-medium',
                        colors.bg, colors.text
                      )}
                    >
                      {filter.label}
                    </motion.span>
                  )
                })}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Suggestions Dropdown */}
      <AnimatePresence>
        {isFocused && (showDefaultSuggestions || displaySuggestions.length > 0) && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.15 }}
            className="absolute top-full left-0 right-0 mt-3 z-50"
          >
            <Card className="border-gray-200 shadow-2xl overflow-hidden rounded-2xl">
              {showDefaultSuggestions ? (
                /* Default: Recent + Trending + Example Queries */
                <div className="max-h-[400px] overflow-y-auto">
                  {/* Example Natural Language Queries */}
                  <div className="p-3 border-b border-gray-100 bg-gradient-to-r from-violet-50 to-purple-50">
                    <div className="text-xs text-violet-600 font-medium px-2 py-1.5 flex items-center gap-1.5">
                      <Wand2 className="h-3.5 w-3.5" />
                      Try natural language search
                    </div>
                    {EXAMPLE_NL_QUERIES.map((query, index) => (
                      <motion.button
                        key={index}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.03 }}
                        onClick={() => {
                          onChange(query)
                          inputRef.current?.focus()
                        }}
                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-colors hover:bg-white/60 group"
                      >
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-purple-500 flex items-center justify-center flex-shrink-0">
                          <Sparkles className="h-4 w-4 text-white" />
                        </div>
                        <span className="flex-1 text-sm text-gray-700 group-hover:text-violet-700 truncate">
                          "{query}"
                        </span>
                        <ArrowRight className="h-4 w-4 text-gray-300 group-hover:text-violet-400 transition-colors" />
                      </motion.button>
                    ))}
                  </div>
                  
                  {/* Recent Searches */}
                  {recentSearches.length > 0 && (
                    <div className="p-2">
                      <div className="text-xs text-gray-500 font-medium px-3 py-2 flex items-center gap-1.5">
                        <Clock className="h-3.5 w-3.5" />
                        Recent Searches
                      </div>
                      {recentSearches.slice(0, 5).map((item, index) => {
                        const isSelected = selectedIndex === index
                        
                        return (
                          <motion.button
                            key={item.id}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.03 }}
                            onClick={() => {
                              onChange(item.query)
                              onSearch(item.query)
                              setIsFocused(false)
                            }}
                            className={cn(
                              'w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-colors',
                              isSelected ? 'bg-violet-50 text-violet-700' : 'hover:bg-gray-50'
                            )}
                          >
                            <Clock className={cn(
                              'h-4 w-4 flex-shrink-0',
                              isSelected ? 'text-violet-500' : 'text-gray-400'
                            )} />
                            <span className="flex-1 truncate">{item.query}</span>
                            <ArrowRight className="h-4 w-4 text-gray-300" />
                          </motion.button>
                        )
                      })}
                    </div>
                  )}
                  
                  {/* Trending Topics */}
                  {trendingTopics.length > 0 && (
                    <div className={cn(
                      'p-3',
                      recentSearches.length > 0 && 'border-t border-gray-100'
                    )}>
                      <div className="text-xs text-gray-500 font-medium px-1 py-2 flex items-center gap-1.5">
                        <TrendingUp className="h-3.5 w-3.5" />
                        Trending Now
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {trendingTopics.map((topic, index) => {
                          const isSelected = selectedIndex === recentSearches.length + index
                          
                          return (
                            <motion.button
                              key={topic}
                              initial={{ opacity: 0, scale: 0.9 }}
                              animate={{ opacity: 1, scale: 1 }}
                              transition={{ delay: index * 0.03 }}
                              onClick={() => {
                                onChange(topic)
                                onSearch(topic)
                                setIsFocused(false)
                              }}
                              className={cn(
                                'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm transition-all',
                                isSelected
                                  ? 'bg-gradient-to-r from-orange-100 to-amber-100 text-orange-700 border border-orange-200'
                                  : 'bg-orange-50 text-orange-600 border border-orange-100 hover:bg-orange-100 hover:shadow-sm'
                              )}
                            >
                              <TrendingUp className="h-3 w-3" />
                              {topic}
                            </motion.button>
                          )
                        })}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                /* Search Suggestions */
                <div className="max-h-80 overflow-y-auto">
                  {displaySuggestions.map((suggestion, index) => {
                    const Icon = typeIcons[suggestion.type] || FileText
                    const isSelected = selectedIndex === index
                    const isSemantic = suggestion.type === 'semantic'
                    const isAISuggestion = suggestion.type === 'ai'
                    
                    return (
                      <motion.button
                        key={suggestion.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.02 }}
                        onClick={() => {
                          if (isSemantic || isAISuggestion) {
                            onSearch(value, parsedQuery?.suggestedFilters || activeChips)
                          } else {
                            onSuggestionClick?.(suggestion)
                          }
                          setIsFocused(false)
                        }}
                        className={cn(
                          'w-full flex items-center gap-3 px-4 py-3.5 text-left transition-colors',
                          index > 0 && 'border-t border-gray-50',
                          isSelected ? 'bg-violet-50' : 'hover:bg-gray-50',
                          isSemantic && 'bg-gradient-to-r from-violet-50 to-purple-50',
                          isAISuggestion && 'bg-gradient-to-r from-blue-50 to-indigo-50'
                        )}
                      >
                        <div className={cn(
                          'w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0',
                          isSemantic
                            ? 'bg-gradient-to-br from-violet-500 to-purple-500 shadow-lg shadow-violet-500/20'
                            : isAISuggestion
                            ? 'bg-gradient-to-br from-blue-500 to-indigo-500 shadow-lg shadow-blue-500/20'
                            : isSelected
                            ? 'bg-violet-100'
                            : 'bg-gray-100'
                        )}>
                          <Icon className={cn(
                            'h-4 w-4',
                            isSemantic || isAISuggestion ? 'text-white' : isSelected ? 'text-violet-600' : 'text-gray-500'
                          )} />
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className={cn(
                            'font-medium truncate',
                            isSemantic ? 'text-violet-700' : isAISuggestion ? 'text-blue-700' : isSelected ? 'text-violet-700' : 'text-gray-900'
                          )}>
                            {suggestion.title}
                          </div>
                          {suggestion.subtitle && (
                            <div className="text-sm text-gray-500 truncate flex items-center gap-2">
                              {suggestion.subtitle}
                              {suggestion.relevanceScore && (
                                <Badge variant="secondary" className="h-5 px-1.5 text-xs bg-green-100 text-green-700">
                                  {suggestion.relevanceScore}% match
                                </Badge>
                              )}
                            </div>
                          )}
                        </div>
                        
                        <ArrowRight className={cn(
                          'h-4 w-4 flex-shrink-0',
                          isSelected ? 'text-violet-400' : 'text-gray-300'
                        )} />
                      </motion.button>
                    )
                  })}
                </div>
              )}
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default SemanticSearchBar
