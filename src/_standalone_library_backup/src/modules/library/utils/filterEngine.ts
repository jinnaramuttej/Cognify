import type { LibraryResource, LibraryFilters, SortOption } from '../types'

/**
 * Filter Engine for Library Resources
 * Implements AND logic across all filter categories
 */

export function filterResources(
  resources: LibraryResource[],
  filters: LibraryFilters,
  sortOption: SortOption = 'newest'
): LibraryResource[] {
  let filtered = [...resources]

  // Grade filter
  if (filters.grade) {
    filtered = filtered.filter(r => r.grade === filters.grade)
  }

  // Exam filter
  if (filters.exam) {
    filtered = filtered.filter(r => r.exam === filters.exam)
  }

  // Subject filter
  if (filters.subject) {
    filtered = filtered.filter(r => r.subject.toLowerCase() === filters.subject?.toLowerCase())
  }

  // Chapter filter
  if (filters.chapter) {
    filtered = filtered.filter(r => r.chapter.toLowerCase() === filters.chapter?.toLowerCase())
  }

  // Resource type filter
  if (filters.resourceType) {
    filtered = filtered.filter(r => r.resourceType === filters.resourceType)
  }

  // Difficulty filter
  if (filters.difficulty) {
    filtered = filtered.filter(r => r.difficulty === filters.difficulty)
  }

  // Year filter (for PYQs)
  if (filters.year) {
    filtered = filtered.filter(r => r.year === filters.year)
  }

  // Recently added (within last 7 days)
  if (filters.recentlyAdded) {
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
    filtered = filtered.filter(r => new Date(r.createdAt) >= sevenDaysAgo)
  }

  // Trending resources
  if (filters.trending) {
    filtered = filtered.filter(r => r.isTrending)
  }

  // Full-text search
  if (filters.searchQuery.trim()) {
    const query = filters.searchQuery.toLowerCase().trim()
    const searchTerms = query.split(/\s+/)
    
    filtered = filtered.filter(r => {
      const searchableText = [
        r.title,
        r.description,
        r.subject,
        r.chapter,
        ...r.tags
      ].join(' ').toLowerCase()
      
      return searchTerms.every(term => searchableText.includes(term))
    })
  }

  // Apply sorting
  return sortResources(filtered, sortOption)
}

/**
 * Sort resources based on the selected option
 */
export function sortResources(
  resources: LibraryResource[],
  sortOption: SortOption
): LibraryResource[] {
  const sorted = [...resources]

  switch (sortOption) {
    case 'newest':
      return sorted.sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )
    case 'oldest':
      return sorted.sort((a, b) => 
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      )
    case 'most_viewed':
      return sorted.sort((a, b) => b.viewCount - a.viewCount)
    case 'title_asc':
      return sorted.sort((a, b) => a.title.localeCompare(b.title))
    case 'title_desc':
      return sorted.sort((a, b) => b.title.localeCompare(a.title))
    case 'relevance':
      // Sort by a combination of factors
      return sorted.sort((a, b) => {
        const scoreA = (a.isTrending ? 10 : 0) + a.viewCount / 100
        const scoreB = (b.isTrending ? 10 : 0) + b.viewCount / 100
        return scoreB - scoreA
      })
    default:
      return sorted
  }
}

/**
 * Extract unique filter options from resources
 */
export function extractFilterOptions(resources: LibraryResource[]) {
  const subjects = new Set<string>()
  const chapters = new Set<string>()
  const grades = new Set<string>()
  const exams = new Set<string>()
  const resourceTypes = new Set<string>()
  const difficulties = new Set<string>()
  const years = new Set<number>()

  resources.forEach(r => {
    subjects.add(r.subject)
    chapters.add(r.chapter)
    grades.add(r.grade)
    exams.add(r.exam)
    resourceTypes.add(r.resourceType)
    difficulties.add(r.difficulty)
    if (r.year) years.add(r.year)
  })

  return {
    subjects: Array.from(subjects).sort(),
    chapters: Array.from(chapters).sort(),
    grades: Array.from(grades).sort(),
    exams: Array.from(exams).sort(),
    resourceTypes: Array.from(resourceTypes),
    difficulties: Array.from(difficulties),
    years: Array.from(years).sort((a, b) => b - a),
  }
}

/**
 * Get chapters for a specific subject
 */
export function getChaptersForSubject(
  resources: LibraryResource[],
  subject: string
): string[] {
  const chapters = new Set<string>()
  resources
    .filter(r => r.subject.toLowerCase() === subject.toLowerCase())
    .forEach(r => chapters.add(r.chapter))
  return Array.from(chapters).sort()
}

/**
 * Check if any filters are active
 */
export function hasActiveFilters(filters: LibraryFilters): boolean {
  return !!(
    filters.grade ||
    filters.exam ||
    filters.subject ||
    filters.chapter ||
    filters.resourceType ||
    filters.difficulty ||
    filters.year ||
    filters.recentlyAdded ||
    filters.trending ||
    filters.searchQuery.trim()
  )
}

/**
 * Count active filters
 */
export function countActiveFilters(filters: LibraryFilters): number {
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
}

/**
 * Create default filters
 */
export function createDefaultFilters(): LibraryFilters {
  return {
    grade: null,
    exam: null,
    subject: null,
    chapter: null,
    resourceType: null,
    difficulty: null,
    year: null,
    recentlyAdded: false,
    trending: false,
    searchQuery: '',
  }
}

/**
 * Build search query for API
 */
export function buildSearchQuery(filters: LibraryFilters, sortOption: SortOption): URLSearchParams {
  const params = new URLSearchParams()
  
  if (filters.grade) params.set('grade', filters.grade)
  if (filters.exam) params.set('exam', filters.exam)
  if (filters.subject) params.set('subject', filters.subject)
  if (filters.chapter) params.set('chapter', filters.chapter)
  if (filters.resourceType) params.set('resourceType', filters.resourceType)
  if (filters.difficulty) params.set('difficulty', filters.difficulty)
  if (filters.year) params.set('year', String(filters.year))
  if (filters.recentlyAdded) params.set('recentlyAdded', 'true')
  if (filters.trending) params.set('trending', 'true')
  if (filters.searchQuery) params.set('search', filters.searchQuery)
  params.set('sort', sortOption)
  
  return params
}
