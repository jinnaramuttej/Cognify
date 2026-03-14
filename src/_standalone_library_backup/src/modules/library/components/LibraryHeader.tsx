'use client'

import { motion } from 'framer-motion'
import { SearchBar } from './SearchBar'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { BookOpen, LayoutGrid, List, ArrowUpDown } from 'lucide-react'
import type { SortOption, ViewMode } from '../types'

interface LibraryHeaderProps {
  searchQuery: string
  onSearchChange: (query: string) => void
  sortOption: SortOption
  onSortChange: (option: SortOption) => void
  viewMode: ViewMode
  onViewModeChange: (mode: ViewMode) => void
  totalResources: number
  filteredCount: number
  activeFilterCount: number
  grade: string | null
  exam: string | null
  onGradeChange: (grade: string | null) => void
  onExamChange: (exam: string | null) => void
  activeSection: string
  onSectionChange: (section: string) => void
  navItems: { id: string; label: string; icon: any; description: string }[]
}

export function LibraryHeader({
  searchQuery,
  onSearchChange,
  sortOption,
  onSortChange,
  viewMode,
  onViewModeChange,
  totalResources,
  filteredCount,
  activeFilterCount,
  grade,
  exam,
  onGradeChange,
  onExamChange,
  activeSection,
  onSectionChange,
  navItems,
}: LibraryHeaderProps) {
  return (
    <header className="bg-white border-b border-gray-100 sticky top-0 z-40">
      {/* Main Header */}
      <div className="px-4 md:px-6 py-4">
        <div className="flex flex-col lg:flex-row lg:items-center gap-4">
          {/* Logo & Title */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex-shrink-0"
          >
            <div className="flex items-center gap-3">
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.1 }}
                className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/20"
              >
                <BookOpen className="h-5 w-5 text-white" />
              </motion.div>
              <div>
                <h1 className="text-lg font-bold text-gray-900">Library</h1>
                <p className="text-xs text-gray-500">
                  {grade ? `Class ${grade}` : 'All Classes'} • {exam || 'All Exams'}
                </p>
              </div>
            </div>
          </motion.div>

          {/* Search Bar */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex-1 max-w-xl"
          >
            <SearchBar value={searchQuery} onChange={onSearchChange} />
          </motion.div>

          {/* View Controls - Desktop Only */}
          <div className="hidden lg:flex items-center gap-2">
            {/* View Mode Toggle */}
            <div className="flex items-center border border-gray-200 rounded-lg bg-white overflow-hidden">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => onViewModeChange('grid')}
                className={cn(
                  'rounded-none h-9',
                  viewMode === 'grid' ? 'bg-gray-900 text-white' : ''
                )}
              >
                <LayoutGrid className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => onViewModeChange('list')}
                className={cn(
                  'rounded-none h-9',
                  viewMode === 'list' ? 'bg-gray-900 text-white' : ''
                )}
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs - Clean 5 Section Design */}
      <div className="border-t border-gray-50 bg-white px-4 md:px-6">
        <div className="flex items-center gap-1 py-2 overflow-x-auto scrollbar-hide">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = activeSection === item.id

            return (
              <Button
                key={item.id}
                variant="ghost"
                size="sm"
                onClick={() => onSectionChange(item.id)}
                className={cn(
                  'gap-2 rounded-lg flex-shrink-0 px-4',
                  isActive
                    ? 'bg-blue-50 text-blue-600 hover:bg-blue-50 hover:text-blue-600'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                )}
              >
                <Icon className="h-4 w-4" />
                <span>{item.label}</span>
              </Button>
            )
          })}
        </div>
      </div>
    </header>
  )
}

export default LibraryHeader
