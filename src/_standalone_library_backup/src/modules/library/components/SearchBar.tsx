'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Search, X, Sparkles } from 'lucide-react'

interface SearchBarProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
}

export function SearchBar({ 
  value, 
  onChange, 
  placeholder = 'Search by subject, chapter, concept...',
  className = ''
}: SearchBarProps) {
  const [localValue, setLocalValue] = useState(value)
  const [isFocused, setIsFocused] = useState(false)

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      onChange(localValue)
    }, 300)

    return () => clearTimeout(timer)
  }, [localValue, onChange])

  // Sync with external value
  useEffect(() => {
    setLocalValue(value)
  }, [value])

  const handleClear = useCallback(() => {
    setLocalValue('')
    onChange('')
  }, [onChange])

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`relative flex items-center ${className}`}
    >
      <motion.div
        animate={{ 
          scale: isFocused ? 1.1 : 1,
          color: isFocused ? '#2563EB' : '#9CA3AF'
        }}
        transition={{ duration: 0.2 }}
        className="absolute left-3 pointer-events-none"
      >
        <Search className="h-4 w-4" />
      </motion.div>
      
      <Input
        type="text"
        value={localValue}
        onChange={(e) => setLocalValue(e.target.value)}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        placeholder={placeholder}
        className="pl-10 pr-10 h-10 bg-white border-gray-200 rounded-xl focus:border-blue-400 focus:ring-blue-500/20 transition-all duration-200"
      />
      
      <AnimatePresence>
        {localValue && (
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
            transition={{ duration: 0.15 }}
          >
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClear}
              className="absolute right-1 h-8 w-8 p-0 hover:bg-gray-100 rounded-lg"
            >
              <X className="h-4 w-4 text-gray-400" />
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Animated border glow on focus */}
      <AnimatePresence>
        {isFocused && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 rounded-xl pointer-events-none"
            style={{
              boxShadow: '0 0 0 2px rgba(37, 99, 235, 0.2)',
            }}
          />
        )}
      </AnimatePresence>
    </motion.div>
  )
}
