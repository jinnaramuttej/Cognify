'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { ScrollArea } from '@/components/ui/scroll-area'
import { cn } from '@/lib/utils'
import {
  Search,
  SlidersHorizontal,
  Grid,
  List,
  BookOpen,
  Sparkles,
  Filter,
  X,
  ChevronDown,
  Clock,
  Eye,
  Bookmark,
  BookmarkCheck,
} from 'lucide-react'
import type { LibraryResource, Subject, LibraryFilters, SortOption, ViewMode } from '../types'

interface ExplorePageProps {
  resources: LibraryResource[]
  filteredResources: LibraryResource[]
  subjects: Subject[]
  filters: LibraryFilters
  sortOption: SortOption
  viewMode: ViewMode
  grade: string | null
  exam: string | null
  isLoading: boolean
  onFilterChange: (filters: Partial<LibraryFilters>) => void
  onResetFilters: () => void
  onSortChange: (option: SortOption) => void
  onViewModeChange: (mode: ViewMode) => void
  onResourceClick: (resource: LibraryResource) => void
  onBookmark: (resourceId: string) => void
  onAskCogni: (resource: LibraryResource) => void
}

const sortOptions: { value: SortOption; label: string }[] = [
  { value: 'relevance', label: 'Most Relevant' },
  { value: 'newest', label: 'Newest First' },
  { value: 'most_viewed', label: 'Most Viewed' },
  { value: 'title_asc', label: 'Title (A-Z)' },
]

const resourceTypes = ['Notes', 'PYQ', 'Concept Sheet', 'Video', 'Formula List']
const difficulties = ['Beginner', 'Intermediate', 'Advanced']

export function ExplorePage({
  resources,
  filteredResources,
  subjects,
  filters,
  sortOption,
  viewMode,
  grade,
  exam,
  isLoading,
  onFilterChange,
  onResetFilters,
  onSortChange,
  onViewModeChange,
  onResourceClick,
  onBookmark,
  onAskCogni,
}: ExplorePageProps) {
  const [showFilters, setShowFilters] = useState(false)
  const [activeFilterPanel, setActiveFilterPanel] = useState<string | null>(null)

  // Count active filters
  const activeFilterCount = [
    filters.subject,
    filters.resourceType,
    filters.difficulty,
    filters.trending,
    filters.searchQuery.trim(),
  ].filter(Boolean).length

  return (
    <div className="flex h-full">
      {/* Filter Sidebar - Desktop */}
      <aside className="hidden lg:block w-64 border-r border-gray-100 bg-white flex-shrink-0">
        <FilterSidebar
          filters={filters}
          subjects={subjects}
          onFilterChange={onFilterChange}
          onReset={onResetFilters}
          activeFilterCount={activeFilterCount}
        />
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0">
        {/* Toolbar */}
        <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-sm border-b border-gray-100 p-4">
          <div className="flex items-center gap-3">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                value={filters.searchQuery}
                onChange={(e) => onFilterChange({ searchQuery: e.target.value })}
                placeholder="Search resources, topics, chapters..."
                className="pl-10 bg-gray-50 border-gray-200 focus:bg-white"
              />
            </div>

            {/* Mobile Filter Toggle */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
              className={cn('lg:hidden gap-2', activeFilterCount > 0 && 'border-blue-500 text-blue-600')}
            >
              <Filter className="h-4 w-4" />
              {activeFilterCount > 0 && (
                <Badge className="ml-1 h-5 w-5 p-0 flex items-center justify-center text-xs">
                  {activeFilterCount}
                </Badge>
              )}
            </Button>

            {/* Sort */}
            <select
              value={sortOption}
              onChange={(e) => onSortChange(e.target.value as SortOption)}
              className="hidden md:block text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white"
            >
              {sortOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>

            {/* View Mode Toggle */}
            <div className="hidden md:flex items-center border border-gray-200 rounded-lg overflow-hidden">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => onViewModeChange('grid')}
                className="rounded-none"
              >
                <Grid className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => onViewModeChange('list')}
                className="rounded-none"
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Active Filters Pills */}
          {activeFilterCount > 0 && (
            <div className="flex items-center gap-2 mt-3 overflow-x-auto pb-1">
              {filters.subject && (
                <FilterPill label={filters.subject} onRemove={() => onFilterChange({ subject: null })} />
              )}
              {filters.resourceType && (
                <FilterPill label={filters.resourceType} onRemove={() => onFilterChange({ resourceType: null })} />
              )}
              {filters.difficulty && (
                <FilterPill label={filters.difficulty} onRemove={() => onFilterChange({ difficulty: null })} />
              )}
              {filters.trending && (
                <FilterPill label="Trending" onRemove={() => onFilterChange({ trending: false })} />
              )}
              <Button variant="ghost" size="sm" onClick={onResetFilters} className="text-xs text-gray-500">
                Clear all
              </Button>
            </div>
          )}
        </div>

        {/* Results */}
        <div className="flex-1 p-4 md:p-6">
          {isLoading ? (
            <LoadingGrid />
          ) : filteredResources.length === 0 ? (
            <EmptyState
              hasFilters={activeFilterCount > 0}
              onReset={onResetFilters}
            />
          ) : (
            <>
              <p className="text-sm text-gray-500 mb-4">
                Showing {filteredResources.length} of {resources.length} resources
              </p>
              <motion.div
                initial="hidden"
                animate="visible"
                variants={{
                  hidden: { opacity: 0 },
                  visible: { opacity: 1, transition: { staggerChildren: 0.03 } },
                }}
                className={cn(
                  viewMode === 'grid'
                    ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4'
                    : 'space-y-2'
                )}
              >
                {filteredResources.map((resource) => (
                  <ResourceCard
                    key={resource.id}
                    resource={resource}
                    viewMode={viewMode}
                    onClick={() => onResourceClick(resource)}
                    onBookmark={(e) => {
                      e.stopPropagation()
                      onBookmark(resource.id)
                    }}
                    onAskCogni={(e) => {
                      e.stopPropagation()
                      onAskCogni(resource)
                    }}
                  />
                ))}
              </motion.div>
            </>
          )}
        </div>
      </main>

      {/* Mobile Filter Drawer */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 lg:hidden"
          >
            <div className="absolute inset-0 bg-black/50" onClick={() => setShowFilters(false)} />
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25 }}
              className="absolute left-0 top-0 bottom-0 w-80 bg-white"
            >
              <div className="flex items-center justify-between p-4 border-b">
                <h3 className="font-semibold">Filters</h3>
                <Button variant="ghost" size="sm" onClick={() => setShowFilters(false)}>
                  <X className="h-5 w-5" />
                </Button>
              </div>
              <ScrollArea className="h-full pb-20">
                <FilterSidebar
                  filters={filters}
                  subjects={subjects}
                  onFilterChange={onFilterChange}
                  onReset={onResetFilters}
                  activeFilterCount={activeFilterCount}
                />
              </ScrollArea>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// Filter Sidebar Component
function FilterSidebar({
  filters,
  subjects,
  onFilterChange,
  onReset,
  activeFilterCount,
}: {
  filters: LibraryFilters
  subjects: Subject[]
  onFilterChange: (filters: Partial<LibraryFilters>) => void
  onReset: () => void
  activeFilterCount: number
}) {
  return (
    <div className="p-4 space-y-6">
      {/* Quick Filters */}
      <div>
        <h4 className="text-sm font-medium text-gray-900 mb-3">Quick Filters</h4>
        <div className="space-y-2">
          <FilterButton
            label="Trending"
            active={filters.trending}
            onClick={() => onFilterChange({ trending: !filters.trending })}
          />
        </div>
      </div>

      {/* Subject */}
      <div>
        <h4 className="text-sm font-medium text-gray-900 mb-3">Subject</h4>
        <div className="space-y-1">
          {subjects.map((subject) => (
            <FilterButton
              key={subject.id}
              label={subject.name}
              active={filters.subject === subject.name}
              onClick={() => onFilterChange({ 
                subject: filters.subject === subject.name ? null : subject.name 
              })}
            />
          ))}
        </div>
      </div>

      {/* Resource Type */}
      <div>
        <h4 className="text-sm font-medium text-gray-900 mb-3">Resource Type</h4>
        <div className="space-y-1">
          {resourceTypes.map((type) => (
            <FilterButton
              key={type}
              label={type}
              active={filters.resourceType === type}
              onClick={() => onFilterChange({ 
                resourceType: filters.resourceType === type ? null : type as any 
              })}
            />
          ))}
        </div>
      </div>

      {/* Difficulty */}
      <div>
        <h4 className="text-sm font-medium text-gray-900 mb-3">Difficulty</h4>
        <div className="space-y-1">
          {difficulties.map((diff) => (
            <FilterButton
              key={diff}
              label={diff}
              active={filters.difficulty === diff}
              onClick={() => onFilterChange({ 
                difficulty: filters.difficulty === diff ? null : diff as any 
              })}
            />
          ))}
        </div>
      </div>

      {/* Reset */}
      {activeFilterCount > 0 && (
        <Button variant="outline" className="w-full" onClick={onReset}>
          Clear All Filters
        </Button>
      )}
    </div>
  )
}

// Filter Button
function FilterButton({
  label,
  active,
  onClick,
}: {
  label: string
  active: boolean
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'w-full text-left px-3 py-2 rounded-lg text-sm transition-colors',
        active
          ? 'bg-blue-50 text-blue-700 font-medium'
          : 'text-gray-600 hover:bg-gray-50'
      )}
    >
      {label}
    </button>
  )
}

// Filter Pill
function FilterPill({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <Badge variant="secondary" className="gap-1 pr-1">
      {label}
      <button onClick={onRemove} className="ml-1 hover:bg-gray-200 rounded-full p-0.5">
        <X className="h-3 w-3" />
      </button>
    </Badge>
  )
}

// Resource Card
function ResourceCard({
  resource,
  viewMode,
  onClick,
  onBookmark,
  onAskCogni,
}: {
  resource: LibraryResource
  viewMode: ViewMode
  onClick: () => void
  onBookmark: (e: React.MouseEvent) => void
  onAskCogni: (e: React.MouseEvent) => void
}) {
  const difficultyColors = {
    Beginner: 'bg-emerald-50 text-emerald-700',
    Intermediate: 'bg-amber-50 text-amber-700',
    Advanced: 'bg-red-50 text-red-700',
  }

  if (viewMode === 'list') {
    return (
      <motion.div
        variants={{ hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0 } }}
      >
        <Card
          onClick={onClick}
          className="p-4 bg-white border-gray-100 hover:border-blue-200 hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center flex-shrink-0 group-hover:bg-blue-100 transition-colors">
              <BookOpen className="h-6 w-6 text-blue-500" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-medium text-gray-900 truncate group-hover:text-blue-600 transition-colors">
                {resource.title}
              </h3>
              <p className="text-sm text-gray-500 truncate">
                {resource.subject} • {resource.chapter}
              </p>
            </div>
            <div className="flex items-center gap-3 flex-shrink-0">
              <Badge variant="outline" className={difficultyColors[resource.difficulty]}>
                {resource.difficulty}
              </Badge>
              <Button variant="ghost" size="sm" onClick={onAskCogni}>
                <Sparkles className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm" onClick={onBookmark}>
                {resource.isBookmarked ? (
                  <BookmarkCheck className="h-4 w-4 text-blue-500" />
                ) : (
                  <Bookmark className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
        </Card>
      </motion.div>
    )
  }

  return (
    <motion.div
      variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
    >
      <Card
        onClick={onClick}
        className="p-4 bg-white border-gray-100 hover:border-blue-200 hover:shadow-md transition-all cursor-pointer group overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <Badge variant="outline" className={difficultyColors[resource.difficulty]}>
            {resource.difficulty}
          </Badge>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="sm" onClick={onAskCogni} className="h-8 w-8 p-0">
              <Sparkles className="h-4 w-4 text-blue-500" />
            </Button>
            <Button variant="ghost" size="sm" onClick={onBookmark} className="h-8 w-8 p-0">
              {resource.isBookmarked ? (
                <BookmarkCheck className="h-4 w-4 text-blue-500" />
              ) : (
                <Bookmark className="h-4 w-4 text-gray-400" />
              )}
            </Button>
          </div>
        </div>

        {/* Title */}
        <h3 className="font-medium text-gray-900 line-clamp-2 mb-1 group-hover:text-blue-600 transition-colors">
          {resource.title}
        </h3>
        <p className="text-sm text-gray-500 truncate mb-3">
          {resource.subject} • {resource.chapter}
        </p>

        {/* Type Badge */}
        <Badge variant="secondary" className="text-xs">
          {resource.resourceType}
        </Badge>

        {/* Footer */}
        <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-50 text-xs text-gray-400">
          <div className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {resource.readingTime}m
          </div>
          <div className="flex items-center gap-1">
            <Eye className="h-3 w-3" />
            {resource.viewCount}
          </div>
        </div>
      </Card>
    </motion.div>
  )
}

// Empty State
function EmptyState({ hasFilters, onReset }: { hasFilters: boolean; onReset: () => void }) {
  return (
    <div className="text-center py-16">
      <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto mb-4">
        <Search className="h-8 w-8 text-gray-400" />
      </div>
      <h3 className="text-lg font-medium text-gray-900 mb-2">
        {hasFilters ? 'No matching resources' : 'No resources found'}
      </h3>
      <p className="text-gray-500 mb-4">
        {hasFilters
          ? 'Try adjusting your filters or search query'
          : 'Start by adding some resources to the library'}
      </p>
      {hasFilters && (
        <Button variant="outline" onClick={onReset}>
          Clear Filters
        </Button>
      )}
    </div>
  )
}

// Loading Grid
function LoadingGrid() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <Card key={i} className="p-4">
          <Skeleton className="h-4 w-20 mb-3" />
          <Skeleton className="h-5 w-full mb-2" />
          <Skeleton className="h-4 w-3/4 mb-4" />
          <Skeleton className="h-8 w-full" />
        </Card>
      ))}
    </div>
  )
}

export default ExplorePage
