'use client'

import { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import type { 
  LibraryResource, 
  LibraryFilters, 
  SortOption, 
  ViewMode,
  RecommendationItem,
  Subject,
  Grade,
  Exam
} from '../types'
import { filterResources, createDefaultFilters, buildSearchQuery } from '../utils/filterEngine'

interface UseLibraryDataOptions {
  userId?: string
  autoFetch?: boolean
}

interface UseLibraryDataReturn {
  // Data
  resources: LibraryResource[]
  filteredResources: LibraryResource[]
  recommendations: RecommendationItem[]
  subjects: Subject[]
  recentlyViewed: LibraryResource[]
  continueStudying: LibraryResource | null
  
  // State
  filters: LibraryFilters
  sortOption: SortOption
  viewMode: ViewMode
  grade: Grade | null
  exam: Exam | null
  isLoading: boolean
  error: string | null
  activeFilterCount: number
  dueForRevision: number
  
  // Actions
  setFilters: (filters: Partial<LibraryFilters>) => void
  resetFilters: () => void
  setSortOption: (option: SortOption) => void
  setViewMode: (mode: ViewMode) => void
  setGrade: (grade: Grade | null) => void
  setExam: (exam: Exam | null) => void
  toggleBookmark: (resourceId: string) => Promise<void>
  recordView: (resourceId: string) => Promise<void>
  refreshResources: () => Promise<void>
  refreshHome: () => Promise<void>
  seedDatabase: () => Promise<void>
}

export function useLibraryData(options: UseLibraryDataOptions = {}): UseLibraryDataReturn {
  const { userId = 'demo-user', autoFetch = true } = options

  // State
  const [resources, setResources] = useState<LibraryResource[]>([])
  const [recommendations, setRecommendations] = useState<RecommendationItem[]>([])
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [recentlyViewed, setRecentlyViewed] = useState<LibraryResource[]>([])
  const [continueStudying, setContinueStudying] = useState<LibraryResource | null>(null)
  const [filters, setFiltersState] = useState<LibraryFilters>(createDefaultFilters())
  const [sortOption, setSortOption] = useState<SortOption>('newest')
  const [viewMode, setViewMode] = useState<ViewMode>('grid')
  const [grade, setGradeState] = useState<Grade | null>('12')
  const [exam, setExamState] = useState<Exam | null>('JEE')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [dueForRevision, setDueForRevision] = useState(0)

  // Track if initial fetch has been done
  const initialFetchDone = useRef(false)

  // Filter resources client-side for instant feedback
  const filteredResources = useMemo(() => {
    return filterResources(resources, filters, sortOption)
  }, [resources, filters, sortOption])

  // Count active filters
  const activeFilterCount = useMemo(() => {
    let count = 0
    if (filters.grade) count++
    if (filters.exam) count++
    if (filters.subject) count++
    if (filters.chapter) count++
    if (filters.resourceType) count++
    if (filters.difficulty) count++
    if (filters.year) count++
    if (filters.recentlyAdded) count++
    if (filters.trending) count++
    if (filters.searchQuery.trim()) count++
    return count
  }, [filters])

  // Fetch home data
  const fetchHomeData = useCallback(async (gradeVal: Grade | null, examVal: Exam | null) => {
    setIsLoading(true)
    setError(null)

    try {
      const params = new URLSearchParams()
      params.set('userId', userId)
      if (gradeVal) params.set('grade', gradeVal)
      if (examVal) params.set('exam', examVal)

      const response = await fetch(`/api/library/home?${params.toString()}`)
      
      if (!response.ok) {
        throw new Error('Failed to fetch library data')
      }

      const data = await response.json()
      setSubjects(data.subjects || [])
      setRecentlyViewed(data.recentlyViewed || [])
      setContinueStudying(data.continueStudying)
      setDueForRevision(data.dueForRevision || 0)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setIsLoading(false)
    }
  }, [userId])

  // Fetch resources
  const fetchResources = useCallback(async (currentFilters: LibraryFilters, currentSort: SortOption) => {
    setIsLoading(true)
    setError(null)

    try {
      const params = buildSearchQuery(currentFilters, currentSort)
      params.set('userId', userId)

      const response = await fetch(`/api/library/resources?${params.toString()}`)
      
      if (!response.ok) {
        throw new Error('Failed to fetch resources')
      }

      const data = await response.json()
      setResources(data.resources || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setIsLoading(false)
    }
  }, [userId])

  // Fetch recommendations
  const fetchRecommendations = useCallback(async () => {
    try {
      const response = await fetch(`/api/library/recommendations?userId=${userId}`)
      
      if (response.ok) {
        const data = await response.json()
        setRecommendations(data.recommendations || [])
      }
    } catch {
      // Silent fail for recommendations
    }
  }, [userId])

  // Seed database
  const seedDatabase = useCallback(async () => {
    try {
      const response = await fetch('/api/library/seed')
      if (response.ok) {
        await fetchHomeData(grade, exam)
        await fetchResources(filters, sortOption)
      }
    } catch (err) {
      setError('Failed to seed database')
    }
  }, [fetchHomeData, fetchResources, grade, exam, filters, sortOption])

  // Initial fetch - only once
  useEffect(() => {
    if (autoFetch && !initialFetchDone.current) {
      initialFetchDone.current = true
      fetchHomeData(grade, exam)
      fetchResources(filters, sortOption)
      fetchRecommendations()
    }
  }, [autoFetch])

  // Update filters
  const setFilters = useCallback((newFilters: Partial<LibraryFilters>) => {
    setFiltersState(prev => ({ ...prev, ...newFilters }))
  }, [])

  // Reset filters
  const resetFilters = useCallback(() => {
    setFiltersState(createDefaultFilters())
  }, [])

  // Set grade
  const setGrade = useCallback((newGrade: Grade | null) => {
    setGradeState(newGrade)
    setFiltersState(prev => ({ ...prev, grade: newGrade }))
  }, [])

  // Set exam
  const setExam = useCallback((newExam: Exam | null) => {
    setExamState(newExam)
    setFiltersState(prev => ({ ...prev, exam: newExam }))
  }, [])

  // Toggle bookmark
  const toggleBookmark = useCallback(async (resourceId: string) => {
    try {
      const response = await fetch('/api/library/bookmarks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, resourceId, action: 'toggle' })
      })

      if (response.ok) {
        const data = await response.json()
        setResources(prev => 
          prev.map(r => 
            r.id === resourceId 
              ? { ...r, isBookmarked: data.bookmarked }
              : r
          )
        )
      }
    } catch {
      // Silent fail
    }
  }, [userId])

  // Record view
  const recordView = useCallback(async (resourceId: string) => {
    try {
      await fetch('/api/library/views', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, resourceId })
      })

      setResources(prev =>
        prev.map(r =>
          r.id === resourceId
            ? { ...r, viewCount: r.viewCount + 1 }
            : r
        )
      )
    } catch {
      // Silent fail
    }
  }, [userId])

  // Refresh resources
  const refreshResources = useCallback(async () => {
    await fetchResources(filters, sortOption)
    await fetchRecommendations()
  }, [fetchResources, fetchRecommendations, filters, sortOption])

  // Refresh home
  const refreshHome = useCallback(async () => {
    await fetchHomeData(grade, exam)
  }, [fetchHomeData, grade, exam])

  return {
    resources,
    filteredResources,
    recommendations,
    subjects,
    recentlyViewed,
    continueStudying,
    filters,
    sortOption,
    viewMode,
    grade,
    exam,
    isLoading,
    error,
    activeFilterCount,
    dueForRevision,
    setFilters,
    resetFilters,
    setSortOption,
    setViewMode,
    setGrade,
    setExam,
    toggleBookmark,
    recordView,
    refreshResources,
    refreshHome,
    seedDatabase,
  }
}
