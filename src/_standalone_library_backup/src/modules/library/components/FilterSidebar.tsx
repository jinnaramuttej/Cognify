'use client'

import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import {
  ChevronDown,
  ChevronRight,
  Filter,
  RotateCcw,
  Clock,
  GraduationCap,
  Target,
  BookOpen,
  FileText,
  Zap,
  Layers,
  Flame,
  Calendar,
  Sparkles,
} from 'lucide-react'
import type { LibraryFilters, Difficulty, ResourceType, LibraryResource } from '../types'

interface FilterSidebarProps {
  filters: LibraryFilters
  onFilterChange: (filters: Partial<LibraryFilters>) => void
  onReset: () => void
  activeFilterCount: number
  resources: LibraryResource[]
}

interface FilterSectionProps {
  title: string
  icon: React.ReactNode
  children: React.ReactNode
  defaultOpen?: boolean
}

function FilterSection({ title, icon, children, defaultOpen = true }: FilterSectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen)

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <CollapsibleTrigger className="flex items-center justify-between w-full py-2.5 text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors">
        <div className="flex items-center gap-2">
          {icon}
          {title}
        </div>
        <motion.div
          animate={{ rotate: isOpen ? 0 : -90 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronDown className="h-4 w-4 text-gray-400" />
        </motion.div>
      </CollapsibleTrigger>
      <AnimatePresence initial={false}>
        {isOpen && (
          <CollapsibleContent forceMount>
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="pt-2 pb-4 overflow-hidden"
            >
              {children}
            </motion.div>
          </CollapsibleContent>
        )}
      </AnimatePresence>
    </Collapsible>
  )
}

interface FilterContentProps {
  filters: LibraryFilters
  onFilterChange: (filters: Partial<LibraryFilters>) => void
  filterOptions: { subjects: string[]; chapters: string[]; years: number[] }
  filteredChapters: string[]
}

const DIFFICULTIES: Difficulty[] = ['Beginner', 'Intermediate', 'Advanced']
const RESOURCE_TYPES: ResourceType[] = ['Notes', 'PYQ', 'Concept Sheet', 'Diagram', 'Formula List']

function FilterContent({ 
  filters, 
  onFilterChange, 
  filterOptions, 
  filteredChapters 
}: FilterContentProps) {
  return (
    <div className="space-y-1">
      {/* Quick Filters */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mb-4"
      >
        <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-2">
          Quick Filters
        </p>
        <div className="flex flex-wrap gap-2">
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Button
              variant={filters.trending ? 'default' : 'outline'}
              size="sm"
              onClick={() => onFilterChange({ trending: !filters.trending })}
              className={`h-8 rounded-lg ${
                filters.trending 
                  ? 'bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white border-0 shadow-md shadow-orange-500/20' 
                  : 'border-gray-200 hover:border-orange-300 hover:bg-orange-50'
              }`}
            >
              <Flame className="h-3.5 w-3.5 mr-1" />
              Trending
            </Button>
          </motion.div>
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Button
              variant={filters.recentlyAdded ? 'default' : 'outline'}
              size="sm"
              onClick={() => onFilterChange({ recentlyAdded: !filters.recentlyAdded })}
              className={`h-8 rounded-lg ${
                filters.recentlyAdded 
                  ? 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white border-0 shadow-md shadow-blue-500/20' 
                  : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50'
              }`}
            >
              <Clock className="h-3.5 w-3.5 mr-1" />
              New
            </Button>
          </motion.div>
        </div>
      </motion.div>

      {/* Subject Filter */}
      <FilterSection title="Subject" icon={<BookOpen className="h-4 w-4 text-gray-400" />}>
        <div className="space-y-2">
          {filterOptions.subjects.map((subject, index) => (
            <motion.div
              key={subject}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className="flex items-center space-x-2"
            >
              <Checkbox
                id={`subject-${subject}`}
                checked={filters.subject === subject}
                onCheckedChange={(checked) => 
                  onFilterChange({ 
                    subject: checked ? subject : null,
                    chapter: checked ? filters.chapter : null 
                  })
                }
                className="data-[state=checked]:bg-blue-500 data-[state=checked]:border-blue-500"
              />
              <Label htmlFor={`subject-${subject}`} className="text-sm text-gray-700 cursor-pointer">
                {subject}
              </Label>
            </motion.div>
          ))}
        </div>
      </FilterSection>

      {/* Chapter Filter */}
      <AnimatePresence>
        {filters.subject && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            <FilterSection title="Chapter" icon={<Layers className="h-4 w-4 text-gray-400" />} defaultOpen={true}>
              <ScrollArea className="h-40">
                <div className="space-y-2 pr-4">
                  {filteredChapters.map((chapter, index) => (
                    <motion.div
                      key={chapter}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.03 }}
                      className="flex items-center space-x-2"
                    >
                      <Checkbox
                        id={`chapter-${chapter}`}
                        checked={filters.chapter === chapter}
                        onCheckedChange={(checked) => 
                          onFilterChange({ chapter: checked ? chapter : null })
                        }
                        className="data-[state=checked]:bg-blue-500 data-[state=checked]:border-blue-500"
                      />
                      <Label htmlFor={`chapter-${chapter}`} className="text-sm text-gray-700 cursor-pointer truncate">
                        {chapter}
                      </Label>
                    </motion.div>
                  ))}
                </div>
              </ScrollArea>
            </FilterSection>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Resource Type Filter */}
      <FilterSection title="Resource Type" icon={<FileText className="h-4 w-4 text-gray-400" />} defaultOpen={false}>
        <div className="space-y-2">
          {RESOURCE_TYPES.map((type, index) => (
            <motion.div
              key={type}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className="flex items-center space-x-2"
            >
              <Checkbox
                id={`type-${type}`}
                checked={filters.resourceType === type}
                onCheckedChange={(checked) => 
                  onFilterChange({ resourceType: checked ? type : null })
                }
                className="data-[state=checked]:bg-blue-500 data-[state=checked]:border-blue-500"
              />
              <Label htmlFor={`type-${type}`} className="text-sm text-gray-700 cursor-pointer">
                {type}
              </Label>
            </motion.div>
          ))}
        </div>
      </FilterSection>

      {/* Difficulty Filter */}
      <FilterSection title="Difficulty" icon={<Zap className="h-4 w-4 text-gray-400" />} defaultOpen={false}>
        <div className="space-y-2">
          {DIFFICULTIES.map((difficulty, index) => (
            <motion.div
              key={difficulty}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className="flex items-center space-x-2"
            >
              <Checkbox
                id={`difficulty-${difficulty}`}
                checked={filters.difficulty === difficulty}
                onCheckedChange={(checked) => 
                  onFilterChange({ difficulty: checked ? difficulty : null })
                }
                className="data-[state=checked]:bg-blue-500 data-[state=checked]:border-blue-500"
              />
              <Label htmlFor={`difficulty-${difficulty}`} className="text-sm text-gray-700 cursor-pointer">
                {difficulty}
              </Label>
            </motion.div>
          ))}
        </div>
      </FilterSection>

      {/* Year Filter (for PYQs) */}
      {filterOptions.years.length > 0 && (
        <FilterSection title="Year" icon={<Calendar className="h-4 w-4 text-gray-400" />} defaultOpen={false}>
          <div className="space-y-2">
            {filterOptions.years.map((year, index) => (
              <motion.div
                key={year}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="flex items-center space-x-2"
              >
                <Checkbox
                  id={`year-${year}`}
                  checked={filters.year === year}
                  onCheckedChange={(checked) => 
                    onFilterChange({ year: checked ? year : null })
                  }
                  className="data-[state=checked]:bg-blue-500 data-[state=checked]:border-blue-500"
                />
                <Label htmlFor={`year-${year}`} className="text-sm text-gray-700 cursor-pointer">
                  {year}
                </Label>
              </motion.div>
            ))}
          </div>
        </FilterSection>
      )}
    </div>
  )
}

export function FilterSidebar({
  filters,
  onFilterChange,
  onReset,
  activeFilterCount,
  resources,
}: FilterSidebarProps) {
  // Extract unique values from resources
  const filterOptions = useMemo(() => {
    const subjects = new Set<string>()
    const chapters = new Set<string>()
    const years = new Set<number>()

    resources.forEach(r => {
      subjects.add(r.subject)
      chapters.add(r.chapter)
      if (r.year) years.add(r.year)
    })

    return {
      subjects: Array.from(subjects).sort(),
      chapters: Array.from(chapters).sort(),
      years: Array.from(years).sort((a, b) => b - a),
    }
  }, [resources])

  // Get chapters for selected subject
  const filteredChapters = useMemo(() => {
    if (!filters.subject) return filterOptions.chapters
    return filterOptions.chapters.filter(ch => 
      resources.some(r => r.subject === filters.subject && r.chapter === ch)
    )
  }, [filters.subject, filterOptions.chapters, resources])

  return (
    <>
      {/* Desktop Sidebar */}
      <motion.aside
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3 }}
        className="hidden lg:block w-64 flex-shrink-0 border-r border-gray-100 bg-white/80 backdrop-blur-sm"
      >
        <div className="sticky top-[120px] h-[calc(100vh-120px)] flex flex-col">
          {/* Header */}
          <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
                <Filter className="h-4 w-4 text-blue-600" />
              </div>
              <span className="font-semibold text-gray-900">Filters</span>
            </div>
            <AnimatePresence>
              {activeFilterCount > 0 && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                >
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onReset}
                    className="h-7 px-2 text-xs text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg"
                  >
                    <RotateCcw className="h-3 w-3 mr-1" />
                    Reset
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Filter Content */}
          <ScrollArea className="flex-1 px-4 py-2 custom-scrollbar">
            <FilterContent 
              filters={filters}
              onFilterChange={onFilterChange}
              filterOptions={filterOptions}
              filteredChapters={filteredChapters}
            />
          </ScrollArea>

          {/* Active Filters Footer */}
          <AnimatePresence>
            {activeFilterCount > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                className="px-4 py-3 border-t border-gray-100 bg-gradient-to-r from-blue-50 to-indigo-50"
              >
                <div className="flex flex-wrap gap-1.5">
                  {filters.subject && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      exit={{ scale: 0 }}
                    >
                      <Badge variant="secondary" className="text-xs bg-white border border-blue-100 text-blue-700">
                        {filters.subject}
                      </Badge>
                    </motion.div>
                  )}
                  {filters.chapter && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      exit={{ scale: 0 }}
                    >
                      <Badge variant="secondary" className="text-xs bg-white border border-blue-100 text-blue-700 truncate max-w-[100px]">
                        {filters.chapter}
                      </Badge>
                    </motion.div>
                  )}
                  {filters.resourceType && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      exit={{ scale: 0 }}
                    >
                      <Badge variant="secondary" className="text-xs bg-white border border-purple-100 text-purple-700">
                        {filters.resourceType}
                      </Badge>
                    </motion.div>
                  )}
                  {filters.difficulty && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      exit={{ scale: 0 }}
                    >
                      <Badge variant="secondary" className="text-xs bg-white border border-amber-100 text-amber-700">
                        {filters.difficulty}
                      </Badge>
                    </motion.div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.aside>

      {/* Mobile Filter Button */}
      <div className="lg:hidden fixed bottom-4 left-4 z-50">
        <Sheet>
          <SheetTrigger asChild>
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Button 
                className="h-12 px-4 rounded-xl shadow-lg bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"
              >
                <Filter className="h-4 w-4 mr-2" />
                Filters
                {activeFilterCount > 0 && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                  >
                    <Badge className="ml-2 bg-white text-blue-600 font-semibold">
                      {activeFilterCount}
                    </Badge>
                  </motion.div>
                )}
              </Button>
            </motion.div>
          </SheetTrigger>
          <SheetContent side="left" className="w-80 p-0">
            <SheetHeader className="px-4 py-3 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <SheetTitle className="text-lg">Filters</SheetTitle>
                {activeFilterCount > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onReset}
                    className="h-7 px-2 text-xs text-blue-600"
                  >
                    <RotateCcw className="h-3 w-3 mr-1" />
                    Reset
                  </Button>
                )}
              </div>
            </SheetHeader>
            <ScrollArea className="h-[calc(100vh-80px)] px-4 py-4">
              <FilterContent 
                filters={filters}
                onFilterChange={onFilterChange}
                filterOptions={filterOptions}
                filteredChapters={filteredChapters}
              />
            </ScrollArea>
          </SheetContent>
        </Sheet>
      </div>
    </>
  )
}
