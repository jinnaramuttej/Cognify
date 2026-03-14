'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
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
  FileImage,
  Loader2,
} from 'lucide-react'
import { cn } from '@/lib/utils'

// Types
export interface SearchSuggestion {
  id: string
  type: 'resource' | 'chapter' | 'subject' | 'topic' | 'recent' | 'trending' | 'ai'
  title: string
  subtitle?: string
  icon?: string
  resourceId?: string
}

export interface SearchHistoryItem {
  id: string
  query: string
  timestamp: Date
}

interface SmartSearchBarProps {
  value: string
  onChange: (value: string) => void
  onSearch: (query: string) => void
  onSuggestionClick?: (suggestion: SearchSuggestion) => void
  placeholder?: string
  suggestions?: SearchSuggestion[]
  recentSearches?: SearchHistoryItem[]
  trendingTopics?: string[]
  isLoading?: boolean
  className?: string
}

// Resource type icons
const typeIcons: Record<string, React.ElementType> = {
  resource: FileText,
  chapter: BookOpen,
  subject: Target,
  topic: Layers,
  video: Video,
  audio: Headphones,
  notes: FileText,
  interactive: Layers,
  diagram: FileImage,
  recent: Clock,
  trending: TrendingUp,
  ai: Sparkles,
}

export function SmartSearchBar({
  value,
  onChange,
  onSearch,
  onSuggestionClick,
  placeholder = 'Search resources, chapters, topics...',
  suggestions = [],
  recentSearches = [],
  trendingTopics = [],
  isLoading = false,
  className,
}: SmartSearchBarProps) {
  const [isFocused, setIsFocused] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const inputRef = useRef<HTMLInputElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  
  // Combined suggestions for display
  const displaySuggestions = [
    // AI suggestions at top
    ...(value.trim() ? [{
      id: 'ai-suggestion',
      type: 'ai' as const,
      title: `Ask Cogni: "${value}"`,
      subtitle: 'AI-powered search',
    }] : []),
    // Regular suggestions
    ...suggestions,
  ]
  
  // Show recent and trending when no value
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
            // Handle recent/trending selection
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
          onSearch(value)
        }
        setIsFocused(false)
        break
      case 'Escape':
        setIsFocused(false)
        inputRef.current?.blur()
        break
    }
  }, [selectedIndex, showDefaultSuggestions, displaySuggestions, recentSearches, trendingTopics, value, onChange, onSearch, onSuggestionClick])
  
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
    inputRef.current?.focus()
  }
  
  // Handle value change with selection reset
  const handleChange = (newValue: string) => {
    setSelectedIndex(-1) // Reset selection when input changes
    onChange(newValue)
  }
  
  return (
    <div ref={containerRef} className={cn('relative', className)}>
      {/* Search Input */}
      <motion.div
        initial={false}
        animate={{
          boxShadow: isFocused
            ? '0 0 0 2px rgba(37, 99, 235, 0.2), 0 4px 20px rgba(37, 99, 235, 0.1)'
            : '0 1px 3px rgba(0, 0, 0, 0.05)',
        }}
        className="relative"
      >
        <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
          <Search className={cn(
            'h-5 w-5 transition-colors',
            isFocused ? 'text-blue-500' : 'text-gray-400'
          )} />
        </div>
        
        <Input
          ref={inputRef}
          value={value}
          onChange={(e) => handleChange(e.target.value)}
          onFocus={() => {
            setIsFocused(true)
            setSelectedIndex(-1) // Reset selection when focused
          }}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className={cn(
            'h-12 pl-12 pr-20 text-base',
            'border-gray-200 rounded-xl',
            'focus:border-blue-300 focus:ring-0',
            'transition-all duration-200'
          )}
        />
        
        {/* Right Actions */}
        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
          {isLoading && (
            <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
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
          
          <Button
            size="sm"
            onClick={() => onSearch(value)}
            className="h-8 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 shadow-md"
          >
            Search
          </Button>
        </div>
      </motion.div>
      
      {/* Suggestions Dropdown */}
      <AnimatePresence>
        {isFocused && (showDefaultSuggestions || displaySuggestions.length > 0) && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.15 }}
            className="absolute top-full left-0 right-0 mt-2 z-50"
          >
            <Card className="border-gray-200 shadow-xl overflow-hidden">
              {showDefaultSuggestions ? (
                /* Default: Recent + Trending */
                <div className="max-h-80 overflow-y-auto">
                  {/* Recent Searches */}
                  {recentSearches.length > 0 && (
                    <div className="p-2">
                      <div className="text-xs text-gray-500 font-medium px-3 py-2">
                        Recent Searches
                      </div>
                      {recentSearches.map((item, index) => {
                        const Icon = Clock
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
                              'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-colors',
                              isSelected ? 'bg-blue-50 text-blue-700' : 'hover:bg-gray-50'
                            )}
                          >
                            <Icon className={cn(
                              'h-4 w-4 flex-shrink-0',
                              isSelected ? 'text-blue-500' : 'text-gray-400'
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
                      'p-2',
                      recentSearches.length > 0 && 'border-t border-gray-100'
                    )}>
                      <div className="text-xs text-gray-500 font-medium px-3 py-2">
                        Trending Topics
                      </div>
                      <div className="flex flex-wrap gap-2 px-3 pb-2">
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
                                'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm transition-colors',
                                isSelected
                                  ? 'bg-orange-100 text-orange-700 border-orange-200'
                                  : 'bg-orange-50 text-orange-600 border border-orange-100 hover:bg-orange-100'
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
                    const isAISuggestion = suggestion.type === 'ai'
                    
                    return (
                      <motion.button
                        key={suggestion.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.02 }}
                        onClick={() => {
                          if (isAISuggestion) {
                            onSearch(value)
                          } else {
                            onSuggestionClick?.(suggestion)
                          }
                          setIsFocused(false)
                        }}
                        className={cn(
                          'w-full flex items-center gap-3 px-4 py-3 text-left transition-colors',
                          index > 0 && 'border-t border-gray-50',
                          isSelected ? 'bg-blue-50' : 'hover:bg-gray-50',
                          isAISuggestion && 'bg-gradient-to-r from-blue-50 to-purple-50'
                        )}
                      >
                        <div className={cn(
                          'w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0',
                          isAISuggestion
                            ? 'bg-gradient-to-br from-blue-500 to-purple-500'
                            : isSelected
                            ? 'bg-blue-100'
                            : 'bg-gray-100'
                        )}>
                          <Icon className={cn(
                            'h-4 w-4',
                            isAISuggestion ? 'text-white' : isSelected ? 'text-blue-600' : 'text-gray-500'
                          )} />
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className={cn(
                            'font-medium truncate',
                            isAISuggestion ? 'text-blue-700' : isSelected ? 'text-blue-700' : 'text-gray-900'
                          )}>
                            {suggestion.title}
                          </div>
                          {suggestion.subtitle && (
                            <div className="text-sm text-gray-500 truncate">
                              {suggestion.subtitle}
                            </div>
                          )}
                        </div>
                        
                        <ArrowRight className={cn(
                          'h-4 w-4 flex-shrink-0',
                          isSelected ? 'text-blue-400' : 'text-gray-300'
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

export default SmartSearchBar
