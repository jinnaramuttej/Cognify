'use client'

import { useState, useCallback, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ResourceViewer } from './components/ResourceViewer'
import { useLibraryData } from './hooks/useLibraryData'
import { useGamification } from './hooks/useGamification'
import type { LibraryResource, Subject } from './types'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { OverviewPage } from './pages/OverviewPage'
import { ExplorePage } from './pages/ExplorePage'
import { MyResourcesPage } from './pages/MyResourcesPage'
import { RevisionPage } from './pages/RevisionPage'
import { AchievementsPage } from './pages/AchievementsPage'
import { LibraryHeader } from './components/LibraryHeader'
import {
  BookOpen,
  Compass,
  Bookmark,
  RotateCcw,
  Trophy,
} from 'lucide-react'

// Navigation type - clean 5-section structure
type LibrarySection = 'overview' | 'explore' | 'my-resources' | 'revision' | 'achievements'

// Navigation configuration
const NAV_ITEMS: { id: LibrarySection; label: string; icon: any; description: string }[] = [
  { id: 'overview', label: 'Overview', icon: BookOpen, description: 'Your personalized study hub' },
  { id: 'explore', label: 'Explore', icon: Compass, description: 'Discover new resources' },
  { id: 'my-resources', label: 'My Resources', icon: Bookmark, description: 'Saved & bookmarked' },
  { id: 'revision', label: 'Revision', icon: RotateCcw, description: 'Spaced repetition' },
  { id: 'achievements', label: 'Achievements', icon: Trophy, description: 'Badges & milestones' },
]

export default function Library() {
  const {
    resources,
    filteredResources,
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
  } = useLibraryData()

  // Gamification data
  const { data: gamificationData, refetch: refetchGamification } = useGamification('demo-user')

  // UI State
  const [activeSection, setActiveSection] = useState<LibrarySection>('overview')
  const [selectedResource, setSelectedResource] = useState<LibraryResource | null>(null)
  const [isViewerOpen, setIsViewerOpen] = useState(false)
  const hasSeededRef = useRef(false)

  // Seed database on first empty load
  useEffect(() => {
    if (!isLoading && subjects.length === 0 && !hasSeededRef.current) {
      hasSeededRef.current = true
      seedDatabase()
      toast.success('Library initialized with sample resources!')
    }
  }, [isLoading, subjects.length, seedDatabase])

  // Handle resource view
  const handleResourceView = useCallback((resource: LibraryResource) => {
    setSelectedResource(resource)
    setIsViewerOpen(true)
    recordView(resource.id)
  }, [recordView])

  // Handle subject click (navigate to explore)
  const handleSubjectClick = useCallback((subject: Subject) => {
    setFilters({ subject: subject.name })
    setActiveSection('explore')
  }, [setFilters])

  // Handle bookmark toggle
  const handleBookmark = useCallback(async (resourceId: string) => {
    await toggleBookmark(resourceId)
    toast.success('Bookmark updated')
  }, [toggleBookmark])

  // Handle Ask Cogni
  const handleAskCogni = useCallback((resource: LibraryResource) => {
    toast.info(`Asking Cogni about "${resource.title}"`, {
      description: `Subject: ${resource.subject}, Chapter: ${resource.chapter}`,
    })
  }, [])

  // Show error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center bg-white rounded-2xl p-8 shadow-sm border border-gray-100 max-w-md"
        >
          <div className="w-14 h-14 rounded-xl bg-red-50 flex items-center justify-center mx-auto mb-4">
            <BookOpen className="h-7 w-7 text-red-500" />
          </div>
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Unable to Load Library</h2>
          <p className="text-gray-500 mb-6">{error}</p>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={refreshResources}
            className="px-6 py-2.5 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors"
          >
            Try Again
          </motion.button>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <LibraryHeader
        searchQuery={filters.searchQuery}
        onSearchChange={(query) => {
          setFilters({ searchQuery: query })
          if (query.trim()) setActiveSection('explore')
        }}
        sortOption={sortOption}
        onSortChange={setSortOption}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        totalResources={resources.length}
        filteredCount={filteredResources.length}
        activeFilterCount={activeFilterCount}
        grade={grade}
        exam={exam}
        onGradeChange={setGrade}
        onExamChange={setExam}
        activeSection={activeSection}
        onSectionChange={setActiveSection}
        navItems={NAV_ITEMS}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        <main className="flex-1 overflow-auto pb-6">
          <AnimatePresence mode="wait">
            {activeSection === 'overview' && (
              <OverviewPage
                key="overview"
                resources={resources}
                subjects={subjects}
                recentlyViewed={recentlyViewed}
                continueStudying={continueStudying}
                dueForRevision={dueForRevision}
                gamificationData={gamificationData}
                grade={grade}
                exam={exam}
                isLoading={isLoading}
                onResourceClick={handleResourceView}
                onSubjectClick={handleSubjectClick}
                onBookmark={handleBookmark}
              />
            )}

            {activeSection === 'explore' && (
              <ExplorePage
                key="explore"
                resources={resources}
                filteredResources={filteredResources}
                subjects={subjects}
                filters={filters}
                sortOption={sortOption}
                viewMode={viewMode}
                grade={grade}
                exam={exam}
                isLoading={isLoading}
                onFilterChange={setFilters}
                onResetFilters={resetFilters}
                onSortChange={setSortOption}
                onViewModeChange={setViewMode}
                onResourceClick={handleResourceView}
                onBookmark={handleBookmark}
                onAskCogni={handleAskCogni}
              />
            )}

            {activeSection === 'my-resources' && (
              <MyResourcesPage
                key="my-resources"
                resources={resources}
                recentlyViewed={recentlyViewed}
                isLoading={isLoading}
                onResourceClick={handleResourceView}
                onBookmark={handleBookmark}
              />
            )}

            {activeSection === 'revision' && (
              <RevisionPage
                key="revision"
                resources={resources}
                gamificationData={gamificationData}
                isLoading={isLoading}
                onResourceClick={handleResourceView}
              />
            )}

            {activeSection === 'achievements' && (
              <AchievementsPage
                key="achievements"
                gamificationData={gamificationData}
                isLoading={isLoading}
              />
            )}
          </AnimatePresence>
        </main>
      </div>

      {/* Resource Viewer Modal */}
      <ResourceViewer
        resource={selectedResource}
        isOpen={isViewerOpen}
        onClose={() => setIsViewerOpen(false)}
        onBookmark={() => selectedResource && handleBookmark(selectedResource.id)}
        onAskCogni={() => selectedResource && handleAskCogni(selectedResource)}
        onGeneratePractice={() => toast.info('Generating practice questions...')}
        onSummarize={() => toast.info('Summarizing content...')}
        onCreateTest={() => toast.info('Creating test...')}
        isBookmarked={selectedResource?.isBookmarked || false}
      />
    </div>
  )
}
