'use client'

import { useState, useMemo, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Sparkles,
  Search,
  TrendingUp,
  Clock,
  Filter,
  Grid,
  List,
  SlidersHorizontal,
  Bookmark,
  Bell,
  ChevronDown,
  RefreshCcw,
  LayoutGrid,
} from 'lucide-react'
import { cn } from '@/lib/utils'

// Import our new discovery components
import { SemanticSearchBar, type SemanticSuggestion, type SemanticChip } from './SemanticSearchBar'
import SmartFilters, { type SmartFiltersState, type AIQualityScore } from './SmartFilters'
import DiscoveryCarousel, { type CarouselResource, type CarouselType } from './DiscoveryCarousel'
import TagCloudExplorer, { type TopicNode, type TopicResource } from './TagCloudExplorer'
import SavedSearches, { type SavedSearch, type NewResourceNotification, type SearchFilter } from './SavedSearches'
import MediaPreviewCard from './MediaPreviewCard'
import type { LibraryResource, ResourceType, Difficulty } from '../types'

// Types
interface DiscoveryEngineProps {
  resources: LibraryResource[]
  className?: string
}

// Demo data generators
function generateDemoTopics(): TopicNode[] {
  return [
    { id: '1', name: 'Thermodynamics', subject: 'Physics', count: 45, growth: 25, relatedTopics: ['2', '3', '8'] },
    { id: '2', name: 'Kinetics', subject: 'Physics', count: 38, growth: 15, relatedTopics: ['1', '4'] },
    { id: '3', name: 'Waves', subject: 'Physics', count: 32, relatedTopics: ['1', '5'] },
    { id: '4', name: 'Electrostatics', subject: 'Physics', count: 55, growth: 30, relatedTopics: ['2', '6'] },
    { id: '5', name: 'Optics', subject: 'Physics', count: 28, relatedTopics: ['3', '7'] },
    { id: '6', name: 'Organic Chemistry', subject: 'Chemistry', count: 62, growth: 20, relatedTopics: ['4', '9'] },
    { id: '7', name: 'Inorganic Chemistry', subject: 'Chemistry', count: 41, relatedTopics: ['5', '6'] },
    { id: '8', name: 'Calculus', subject: 'Mathematics', count: 58, growth: 35, relatedTopics: ['1', '10'] },
    { id: '9', name: 'Algebra', subject: 'Mathematics', count: 47, relatedTopics: ['6', '8'] },
    { id: '10', name: 'Geometry', subject: 'Mathematics', count: 35, relatedTopics: ['8', '9'] },
    { id: '11', name: 'Human Physiology', subject: 'Biology', count: 52, growth: 18, relatedTopics: ['12'] },
    { id: '12', name: 'Genetics', subject: 'Biology', count: 39, relatedTopics: ['11', '13'] },
    { id: '13', name: 'Ecology', subject: 'Biology', count: 28, relatedTopics: ['12'] },
  ]
}

function generateCarouselResources(): CarouselResource[] {
  const types: ResourceType[] = ['Notes', 'Video', 'Audio', 'PDF', 'Interactive', 'Quiz']
  const subjects = ['Physics', 'Chemistry', 'Mathematics', 'Biology']
  const chapters = ['Thermodynamics', 'Organic Chemistry', 'Calculus', 'Human Physiology', 'Electrostatics']
  const difficulties: ('Beginner' | 'Intermediate' | 'Advanced')[] = ['Beginner', 'Intermediate', 'Advanced']
  const exams: ('JEE' | 'NEET')[] = ['JEE', 'NEET']
  
  return Array.from({ length: 12 }, (_, i) => ({
    id: `carousel-${i + 1}`,
    title: `${['Complete Guide to', 'Master', 'Quick Revision', 'Advanced'][i % 4]} ${chapters[i % chapters.length]} ${['Part 1', 'Part 2', ''][i % 3]}`.trim(),
    description: 'Comprehensive study material with examples and practice problems.',
    type: types[i % types.length],
    subject: subjects[i % subjects.length],
    chapter: chapters[i % chapters.length],
    duration: Math.floor(Math.random() * 60) + 15,
    viewCount: Math.floor(Math.random() * 5000) + 500,
    rating: 4 + Math.random(),
    isNew: i < 3,
    isTrending: i >= 3 && i < 6,
    progress: i < 4 ? Math.floor(Math.random() * 80) + 10 : undefined,
    aiScore: Math.floor(Math.random() * 20) + 80,
    difficulty: difficulties[i % 3],
    exam: exams[i % 2],
    tags: ['JEE', 'NEET', 'Important'].slice(0, (i % 3) + 1),
  }))
}

function generateSavedSearches(): SavedSearch[] {
  return [
    {
      id: '1',
      name: 'JEE Physics Videos',
      query: 'physics videos for JEE',
      filters: [
        { type: 'subject', value: 'physics', label: 'Physics' },
        { type: 'type', value: 'video', label: 'Video' },
        { type: 'exam', value: 'jee', label: 'JEE' },
      ],
      alertsEnabled: true,
      alertFrequency: 'daily',
      lastChecked: '2 hours ago',
      newResultsCount: 3,
      createdAt: '2024-01-15',
      totalResults: 124,
    },
    {
      id: '2',
      name: 'Organic Chemistry Notes',
      query: 'organic chemistry notes',
      filters: [
        { type: 'subject', value: 'chemistry', label: 'Chemistry' },
        { type: 'type', value: 'notes', label: 'Notes' },
      ],
      alertsEnabled: true,
      alertFrequency: 'weekly',
      lastChecked: '1 day ago',
      newResultsCount: 0,
      createdAt: '2024-01-10',
      totalResults: 87,
    },
    {
      id: '3',
      name: 'NEET Biology PYQs',
      query: 'biology previous year questions',
      filters: [
        { type: 'subject', value: 'biology', label: 'Biology' },
        { type: 'type', value: 'pyq', label: 'PYQ' },
        { type: 'exam', value: 'neet', label: 'NEET' },
      ],
      alertsEnabled: false,
      alertFrequency: 'instant',
      lastChecked: '3 days ago',
      newResultsCount: 0,
      createdAt: '2024-01-05',
      totalResults: 156,
    },
  ]
}

function generateNotifications(): NewResourceNotification[] {
  return [
    {
      id: 'n1',
      searchId: '1',
      resourceName: 'Electrostatics - Complete Video Lecture',
      resourceType: 'Video',
      addedAt: '1 hour ago',
      isRead: false,
    },
    {
      id: 'n2',
      searchId: '1',
      resourceName: 'JEE Physics Wave Optics Problems',
      resourceType: 'Notes',
      addedAt: '2 hours ago',
      isRead: false,
    },
    {
      id: 'n3',
      searchId: '1',
      resourceName: 'Mechanics Practice Set - JEE 2024',
      resourceType: 'Quiz',
      addedAt: '3 hours ago',
      isRead: false,
    },
  ]
}

// Default filter state
const defaultFilters: SmartFiltersState = {
  contentTypes: [],
  difficulties: [],
  examTypes: [],
  grades: [],
  lengthRange: [0, 120],
  aiQualityMin: 0,
  yearRange: [2018, 2024],
  hasVideo: false,
  hasAudio: false,
  hasQuiz: false,
}

export function DiscoveryEngine({ resources, className }: DiscoveryEngineProps) {
  // State
  const [searchQuery, setSearchQuery] = useState('')
  const [activeChips, setActiveChips] = useState<SemanticChip[]>([])
  const [filters, setFilters] = useState<SmartFiltersState>(defaultFilters)
  const [selectedTopic, setSelectedTopic] = useState<TopicNode | null>(null)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [isSearching, setIsSearching] = useState(false)
  const [showFilters, setShowFilters] = useState(true)
  
  // Demo data
  const topics = useMemo(() => generateDemoTopics(), [])
  const carouselResources = useMemo(() => generateCarouselResources(), [])
  const savedSearches = useMemo(() => generateSavedSearches(), [])
  const notifications = useMemo(() => generateNotifications(), [])
  
  // AI Quality Score (demo)
  const aiQualityScore: AIQualityScore = useMemo(() => ({
    overall: 87,
    relevance: 92,
    freshness: 85,
    completeness: 84,
  }), [])
  
  // Recent searches (demo)
  const recentSearches = useMemo(() => [
    { id: 'r1', query: 'thermodynamics jee videos', timestamp: new Date() },
    { id: 'r2', query: 'organic chemistry notes', timestamp: new Date() },
    { id: 'r3', query: 'calculus practice problems', timestamp: new Date() },
  ], [])
  
  // Trending topics (demo)
  const trendingTopics = useMemo(() => [
    'Thermodynamics',
    'Organic Chemistry',
    'Electrostatics',
    'Human Physiology',
  ], [])
  
  // Calculate active filter count
  const activeFilterCount = useMemo(() => {
    let count = 0
    count += filters.contentTypes.length
    count += filters.difficulties.length
    count += filters.examTypes.length
    count += filters.grades.length
    if (filters.hasVideo) count++
    if (filters.hasAudio) count++
    if (filters.hasQuiz) count++
    if (filters.aiQualityMin > 0) count++
    if (filters.lengthRange[0] > 0 || filters.lengthRange[1] < 120) count++
    return count
  }, [filters])
  
  // Handlers
  const handleSearch = useCallback((query: string, chips?: SemanticChip[]) => {
    setIsSearching(true)
    console.log('Searching:', query, chips)
    // Simulate search delay
    setTimeout(() => setIsSearching(false), 500)
  }, [])
  
  const handleFilterChange = useCallback((newFilters: Partial<SmartFiltersState>) => {
    setFilters(prev => ({ ...prev, ...newFilters }))
  }, [])
  
  const handleFilterReset = useCallback(() => {
    setFilters(defaultFilters)
  }, [])
  
  const handleTopicClick = useCallback((topic: TopicNode) => {
    setSelectedTopic(prev => prev?.id === topic.id ? null : topic)
  }, [])
  
  const handleResourceClick = useCallback((resource: CarouselResource) => {
    console.log('Resource clicked:', resource)
  }, [])
  
  const handleBookmarkClick = useCallback((resource: CarouselResource) => {
    console.log('Bookmark clicked:', resource)
  }, [])
  
  const handleRunSavedSearch = useCallback((search: SavedSearch) => {
    setSearchQuery(search.query)
    handleSearch(search.query)
  }, [handleSearch])
  
  const handleCreateSearch = useCallback((name: string, query: string, filters: SearchFilter[]) => {
    console.log('Creating saved search:', name, query, filters)
  }, [])

  return (
    <div className={cn('min-h-screen bg-gradient-to-b from-gray-50/50 to-white', className)}>
      {/* Hero Search Section */}
      <div className="sticky top-0 z-30 bg-white/80 backdrop-blur-xl border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          {/* Search Bar */}
          <SemanticSearchBar
            value={searchQuery}
            onChange={setSearchQuery}
            onSearch={handleSearch}
            semanticChips={activeChips}
            recentSearches={recentSearches}
            trendingTopics={trendingTopics}
            isLoading={isSearching}
            className="max-w-3xl mx-auto"
          />
        </div>
      </div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex gap-6">
          {/* Filters Sidebar */}
          {showFilters && (
            <SmartFilters
              filters={filters}
              onFilterChange={handleFilterChange}
              onReset={handleFilterReset}
              activeFilterCount={activeFilterCount}
              aiQualityScore={aiQualityScore}
              className="flex-shrink-0"
            />
          )}
          
          {/* Main Content */}
          <main className="flex-1 min-w-0 space-y-8">
            {/* Results Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <h2 className="text-xl font-semibold text-gray-900">Discover</h2>
                <Badge variant="secondary" className="bg-violet-100 text-violet-700">
                  {resources.length || 150} resources
                </Badge>
              </div>
              
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowFilters(!showFilters)}
                  className="hidden lg:flex"
                >
                  <SlidersHorizontal className="h-4 w-4 mr-1.5" />
                  {showFilters ? 'Hide Filters' : 'Show Filters'}
                </Button>
                
                <div className="flex items-center gap-1 p-1 bg-gray-100 rounded-lg">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setViewMode('grid')}
                    className={cn(
                      'h-8 w-8 p-0',
                      viewMode === 'grid' ? 'bg-white shadow-sm' : ''
                    )}
                  >
                    <Grid className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setViewMode('list')}
                    className={cn(
                      'h-8 w-8 p-0',
                      viewMode === 'list' ? 'bg-white shadow-sm' : ''
                    )}
                  >
                    <List className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
            
            {/* Dynamic Carousels */}
            <div className="space-y-8">
              {/* Most Accessed This Week */}
              <DiscoveryCarousel
                type="most_accessed"
                title="Most Accessed This Week"
                subtitle="Popular among students right now"
                resources={carouselResources}
                onResourceClick={handleResourceClick}
                onBookmarkClick={handleBookmarkClick}
              />
              
              {/* New Content Added */}
              <DiscoveryCarousel
                type="new_content"
                title="New Content Added"
                subtitle="Fresh resources just uploaded"
                resources={carouselResources.slice().reverse()}
                onResourceClick={handleResourceClick}
                onBookmarkClick={handleBookmarkClick}
              />
              
              {/* Top Rated by Learners */}
              <DiscoveryCarousel
                type="top_rated"
                title="Top Rated by Learners"
                subtitle="Highest rated study materials"
                resources={carouselResources.filter(r => (r.rating || 0) >= 4.5)}
                onResourceClick={handleResourceClick}
                onBookmarkClick={handleBookmarkClick}
              />
              
              {/* Mix of Formats */}
              <DiscoveryCarousel
                type="mixed_formats"
                title="Learn Your Way"
                subtitle="Video, Audio, Notes & more"
                resources={carouselResources}
                onResourceClick={handleResourceClick}
                onBookmarkClick={handleBookmarkClick}
              />
            </div>
            
            {/* Topic Explorer */}
            <TagCloudExplorer
              topics={topics}
              selectedTopic={selectedTopic}
              onTopicClick={handleTopicClick}
              previewResources={carouselResources.slice(0, 3).map(r => ({
                id: r.id,
                title: r.title,
                type: r.type,
                subject: r.subject,
                chapter: r.chapter,
                viewCount: r.viewCount || 0,
                rating: r.rating,
              }))}
              onResourceClick={(r) => console.log('Resource:', r)}
            />
            
            {/* Saved Searches */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <SavedSearches
                savedSearches={savedSearches}
                notifications={notifications}
                onRunSearch={handleRunSavedSearch}
                onDeleteSearch={(id) => console.log('Delete:', id)}
                onToggleAlert={(id, enabled) => console.log('Toggle alert:', id, enabled)}
                onUpdateFrequency={(id, freq) => console.log('Update frequency:', id, freq)}
                onRenameSearch={(id, name) => console.log('Rename:', id, name)}
                onCreateSearch={handleCreateSearch}
                onMarkNotificationRead={(id) => console.log('Mark read:', id)}
              />
              
              {/* Quick Stats Card */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gradient-to-br from-violet-500 to-purple-600 rounded-2xl p-6 text-white"
              >
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
                    <Sparkles className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">Your Discovery Stats</h3>
                    <p className="text-violet-200 text-sm">This week's activity</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-white/10 rounded-xl p-4 text-center">
                    <div className="text-3xl font-bold">24</div>
                    <div className="text-violet-200 text-sm mt-1">Resources Viewed</div>
                  </div>
                  <div className="bg-white/10 rounded-xl p-4 text-center">
                    <div className="text-3xl font-bold">8</div>
                    <div className="text-violet-200 text-sm mt-1">Bookmarked</div>
                  </div>
                  <div className="bg-white/10 rounded-xl p-4 text-center">
                    <div className="text-3xl font-bold">3</div>
                    <div className="text-violet-200 text-sm mt-1">New Topics</div>
                  </div>
                </div>
                
                <div className="mt-6 pt-4 border-t border-white/20">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-violet-200">Weekly Goal Progress</span>
                    <span className="font-medium">75%</span>
                  </div>
                  <div className="mt-2 h-2 bg-white/20 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: '75%' }}
                      transition={{ duration: 1, ease: 'easeOut' }}
                      className="h-full bg-white rounded-full"
                    />
                  </div>
                </div>
              </motion.div>
            </div>
          </main>
        </div>
      </div>
    </div>
  )
}

export default DiscoveryEngine
