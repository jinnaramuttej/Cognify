'use client'

import { useState, useEffect, useCallback } from 'react'
import type {
  IntelligenceResponse,
  WeakTopicRecommendation,
  ContinueLearningItem,
  IntelligenceResource,
  MasteryProfile,
} from '../types'

interface UseIntelligenceOptions {
  userId?: string
  grade?: string | null
  exam?: string | null
  autoFetch?: boolean
  includeResources?: boolean
}

interface UseIntelligenceReturn {
  // Data
  weakTopics: WeakTopicRecommendation[]
  continueLearning: ContinueLearningItem[]
  masteryAwareRecommendations: IntelligenceResource[]
  masteryProfile: MasteryProfile | null
  searchSuggestions: {
    recentSearches: string[]
    suggestedTopics: string[]
    trendingTopics: { topic: string; subject: string; resourceCount: number }[]
  }
  insights: {
    totalStudyTime: number
    averageMastery: number
    resourcesCompleted: number
    topicsNeedingReview: number
  } | null

  // State
  isLoading: boolean
  error: string | null

  // Actions
  refresh: () => Promise<void>
}

export function useIntelligence(options: UseIntelligenceOptions = {}): UseIntelligenceReturn {
  const {
    userId = 'demo-user',
    grade = null,
    exam = null,
    autoFetch = true,
    includeResources = true,
  } = options

  // State
  const [data, setData] = useState<IntelligenceResponse | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch intelligence data
  const fetchIntelligence = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      const params = new URLSearchParams()
      params.set('userId', userId)
      if (grade) params.set('grade', grade)
      if (exam) params.set('exam', exam)
      if (includeResources) params.set('includeResources', 'true')

      const response = await fetch(`/api/library/intelligence?${params.toString()}`)

      if (!response.ok) {
        throw new Error('Failed to fetch intelligence data')
      }

      const intelligenceData = await response.json()
      setData(intelligenceData)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setIsLoading(false)
    }
  }, [userId, grade, exam, includeResources])

  // Initial fetch
  useEffect(() => {
    if (autoFetch) {
      fetchIntelligence()
    }
  }, [autoFetch, fetchIntelligence])

  // Refresh function
  const refresh = useCallback(async () => {
    await fetchIntelligence()
  }, [fetchIntelligence])

  return {
    weakTopics: data?.weakTopics || [],
    continueLearning: data?.continueLearning || [],
    masteryAwareRecommendations: data?.masteryAwareRecommendations || [],
    masteryProfile: data?.masteryProfile || null,
    searchSuggestions: data?.searchSuggestions || {
      recentSearches: [],
      suggestedTopics: [],
      trendingTopics: [],
    },
    insights: data?.insights || null,
    isLoading,
    error,
    refresh,
  }
}

// Hook for smart search
interface UseSmartSearchOptions {
  userId?: string
  debounceMs?: number
}

interface UseSmartSearchReturn {
  search: (query: string) => Promise<void>
  results: any[]
  intent: any
  suggestions: string[]
  isLoading: boolean
  error: string | null
}

export function useSmartSearch(options: UseSmartSearchOptions = {}): UseSmartSearchReturn {
  const { userId = 'demo-user', debounceMs = 300 } = options

  const [results, setResults] = useState<any[]>([])
  const [intent, setIntent] = useState<any>(null)
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [debounceTimer, setDebounceTimer] = useState<NodeJS.Timeout | null>(null)

  const search = useCallback(async (query: string) => {
    // Debounce
    if (debounceTimer) {
      clearTimeout(debounceTimer)
    }

    const timer = setTimeout(async () => {
      if (!query.trim()) {
        setResults([])
        setIntent(null)
        setSuggestions([])
        return
      }

      setIsLoading(true)
      setError(null)

      try {
        const params = new URLSearchParams()
        params.set('q', query)
        params.set('userId', userId)

        const response = await fetch(`/api/library/smart-search?${params.toString()}`)

        if (!response.ok) {
          throw new Error('Search failed')
        }

        const data = await response.json()
        setResults(data.results)
        setIntent(data.intent)
        setSuggestions(data.suggestions)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Search failed')
      } finally {
        setIsLoading(false)
      }
    }, debounceMs)

    setDebounceTimer(timer)
  }, [userId, debounceMs, debounceTimer])

  return {
    search,
    results,
    intent,
    suggestions,
    isLoading,
    error,
  }
}

export default useIntelligence
