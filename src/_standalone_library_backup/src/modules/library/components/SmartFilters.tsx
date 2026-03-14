'use client'

import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Slider } from '@/components/ui/slider'
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
  Video,
  Headphones,
  FileImage,
  Brain,
  Gauge,
  Clock3,
  Award,
  CheckCircle2,
  X,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Difficulty, ResourceType } from '../types'

// Types
export interface SmartFilterValue {
  id: string
  label: string
  count?: number
}

export interface AIQualityScore {
  overall: number // 0-100
  relevance: number
  freshness: number
  completeness: number
}

export interface SmartFiltersState {
  contentTypes: ResourceType[]
  difficulties: Difficulty[]
  examTypes: ('JEE' | 'NEET')[]
  grades: ('11' | '12')[]
  lengthRange: [number, number] // in minutes
  aiQualityMin: number // 0-100
  yearRange: [number, number]
  hasVideo: boolean
  hasAudio: boolean
  hasQuiz: boolean
}

interface SmartFiltersProps {
  filters: SmartFiltersState
  onFilterChange: (filters: Partial<SmartFiltersState>) => void
  onReset: () => void
  activeFilterCount: number
  aiQualityScore?: AIQualityScore
  className?: string
}

// Filter options
const CONTENT_TYPES: { type: ResourceType; icon: React.ElementType; color: string }[] = [
  { type: 'Notes', icon: FileText, color: 'blue' },
  { type: 'Video', icon: Video, color: 'purple' },
  { type: 'Audio', icon: Headphones, color: 'pink' },
  { type: 'PDF', icon: FileText, color: 'rose' },
  { type: 'Interactive', icon: Layers, color: 'amber' },
  { type: 'Quiz', icon: Zap, color: 'green' },
  { type: 'Flashcards', icon: Brain, color: 'teal' },
  { type: 'Diagram', icon: FileImage, color: 'indigo' },
]

const DIFFICULTIES: { type: Difficulty; color: string }[] = [
  { type: 'Beginner', color: 'green' },
  { type: 'Intermediate', color: 'amber' },
  { type: 'Advanced', color: 'red' },
]

const EXAM_TYPES = ['JEE', 'NEET'] as const
const GRADES = ['11', '12'] as const

interface FilterSectionProps {
  title: string
  icon: React.ReactNode
  children: React.ReactNode
  defaultOpen?: boolean
  count?: number
}

function FilterSection({ title, icon, children, defaultOpen = true, count }: FilterSectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen)

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <CollapsibleTrigger className="flex items-center justify-between w-full py-2.5 text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors group">
        <div className="flex items-center gap-2">
          {icon}
          {title}
          {count !== undefined && count > 0 && (
            <Badge variant="secondary" className="h-5 px-1.5 text-xs bg-violet-100 text-violet-700">
              {count}
            </Badge>
          )}
        </div>
        <motion.div
          animate={{ rotate: isOpen ? 0 : -90 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronDown className="h-4 w-4 text-gray-400 group-hover:text-gray-600" />
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

// Color mapping for filter types
const typeColorClasses: Record<string, { bg: string; text: string; border: string; selected: string }> = {
  blue: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200', selected: 'data-[state=checked]:bg-blue-500 data-[state=checked]:border-blue-500' },
  purple: { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200', selected: 'data-[state=checked]:bg-purple-500 data-[state=checked]:border-purple-500' },
  pink: { bg: 'bg-pink-50', text: 'text-pink-700', border: 'border-pink-200', selected: 'data-[state=checked]:bg-pink-500 data-[state=checked]:border-pink-500' },
  rose: { bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-200', selected: 'data-[state=checked]:bg-rose-500 data-[state=checked]:border-rose-500' },
  amber: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200', selected: 'data-[state=checked]:bg-amber-500 data-[state=checked]:border-amber-500' },
  green: { bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200', selected: 'data-[state=checked]:bg-green-500 data-[state=checked]:border-green-500' },
  teal: { bg: 'bg-teal-50', text: 'text-teal-700', border: 'border-teal-200', selected: 'data-[state=checked]:bg-teal-500 data-[state=checked]:border-teal-500' },
  indigo: { bg: 'bg-indigo-50', text: 'text-indigo-700', border: 'border-indigo-200', selected: 'data-[state=checked]:bg-indigo-500 data-[state=checked]:border-indigo-500' },
  red: { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200', selected: 'data-[state=checked]:bg-red-500 data-[state=checked]:border-red-500' },
}

// AI Quality Score Component
function AIQualityIndicator({ score }: { score: AIQualityScore }) {
  const getScoreColor = (value: number) => {
    if (value >= 80) return 'text-green-500'
    if (value >= 60) return 'text-amber-500'
    return 'text-red-500'
  }

  const getScoreGradient = (value: number) => {
    if (value >= 80) return 'from-green-500 to-emerald-500'
    if (value >= 60) return 'from-amber-500 to-yellow-500'
    return 'from-red-500 to-rose-500'
  }

  return (
    <div className="p-4 bg-gradient-to-br from-violet-50 to-purple-50 rounded-xl border border-violet-100">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-purple-500 flex items-center justify-center">
          <Sparkles className="h-4 w-4 text-white" />
        </div>
        <div>
          <div className="font-semibold text-gray-900">AI Quality Score</div>
          <div className="text-xs text-gray-500">Content relevance indicator</div>
        </div>
      </div>
      
      {/* Overall Score */}
      <div className="flex items-center gap-3 mb-4">
        <div className="relative w-16 h-16">
          <svg className="w-16 h-16 transform -rotate-90">
            <circle
              cx="32"
              cy="32"
              r="28"
              className="fill-none stroke-gray-200"
              strokeWidth="6"
            />
            <circle
              cx="32"
              cy="32"
              r="28"
              className={`fill-none stroke-current ${getScoreColor(score.overall)}`}
              strokeWidth="6"
              strokeLinecap="round"
              strokeDasharray={`${(score.overall / 100) * 176} 176`}
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className={cn('text-lg font-bold', getScoreColor(score.overall))}>
              {score.overall}
            </span>
          </div>
        </div>
        <div className="flex-1">
          <div className="text-sm text-gray-600 mb-1">Overall Quality</div>
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${score.overall}%` }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
              className={cn('h-full rounded-full bg-gradient-to-r', getScoreGradient(score.overall))}
            />
          </div>
        </div>
      </div>
      
      {/* Breakdown */}
      <div className="space-y-2">
        {[
          { label: 'Relevance', value: score.relevance, icon: Target },
          { label: 'Freshness', value: score.freshness, icon: Flame },
          { label: 'Completeness', value: score.completeness, icon: CheckCircle2 },
        ].map((item) => {
          const Icon = item.icon
          return (
            <div key={item.label} className="flex items-center gap-2">
              <Icon className="h-3.5 w-3.5 text-gray-400" />
              <span className="text-xs text-gray-600 w-24">{item.label}</span>
              <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${item.value}%` }}
                  transition={{ duration: 0.5, ease: 'easeOut', delay: 0.1 }}
                  className={cn('h-full rounded-full bg-gradient-to-r', getScoreGradient(item.value))}
                />
              </div>
              <span className={cn('text-xs font-medium w-8 text-right', getScoreColor(item.value))}>
                {item.value}%
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// Filter Content Component
function FilterContent({ 
  filters, 
  onFilterChange,
  aiQualityScore,
}: { 
  filters: SmartFiltersState
  onFilterChange: (filters: Partial<SmartFiltersState>) => void
  aiQualityScore?: AIQualityScore
}) {
  return (
    <div className="space-y-1">
      {/* AI Quality Score */}
      {aiQualityScore && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-4"
        >
          <AIQualityIndicator score={aiQualityScore} />
        </motion.div>
      )}
      
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
              variant={filters.hasVideo ? 'default' : 'outline'}
              size="sm"
              onClick={() => onFilterChange({ hasVideo: !filters.hasVideo })}
              className={cn(
                'h-8 rounded-lg',
                filters.hasVideo
                  ? 'bg-gradient-to-r from-purple-500 to-violet-500 hover:from-purple-600 hover:to-violet-600 text-white border-0 shadow-md shadow-purple-500/20'
                  : 'border-gray-200 hover:border-purple-300 hover:bg-purple-50'
              )}
            >
              <Video className="h-3.5 w-3.5 mr-1" />
              Video
            </Button>
          </motion.div>
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Button
              variant={filters.hasAudio ? 'default' : 'outline'}
              size="sm"
              onClick={() => onFilterChange({ hasAudio: !filters.hasAudio })}
              className={cn(
                'h-8 rounded-lg',
                filters.hasAudio
                  ? 'bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white border-0 shadow-md shadow-pink-500/20'
                  : 'border-gray-200 hover:border-pink-300 hover:bg-pink-50'
              )}
            >
              <Headphones className="h-3.5 w-3.5 mr-1" />
              Audio
            </Button>
          </motion.div>
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Button
              variant={filters.hasQuiz ? 'default' : 'outline'}
              size="sm"
              onClick={() => onFilterChange({ hasQuiz: !filters.hasQuiz })}
              className={cn(
                'h-8 rounded-lg',
                filters.hasQuiz
                  ? 'bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white border-0 shadow-md shadow-green-500/20'
                  : 'border-gray-200 hover:border-green-300 hover:bg-green-50'
              )}
            >
              <Zap className="h-3.5 w-3.5 mr-1" />
              Quiz
            </Button>
          </motion.div>
        </div>
      </motion.div>

      {/* Content Type Filter */}
      <FilterSection 
        title="Content Type" 
        icon={<Layers className="h-4 w-4 text-gray-400" />}
        count={filters.contentTypes.length}
      >
        <div className="grid grid-cols-2 gap-2">
          {CONTENT_TYPES.map((item) => {
            const isSelected = filters.contentTypes.includes(item.type)
            const colors = typeColorClasses[item.color] || typeColorClasses.blue
            
            return (
              <motion.button
                key={item.type}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  onFilterChange({
                    contentTypes: isSelected
                      ? filters.contentTypes.filter(t => t !== item.type)
                      : [...filters.contentTypes, item.type]
                  })
                }}
                className={cn(
                  'flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all border',
                  isSelected
                    ? `${colors.bg} ${colors.text} ${colors.border}`
                    : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
                )}
              >
                <item.icon className="h-4 w-4" />
                <span className="truncate">{item.type}</span>
                {isSelected && <CheckCircle2 className="h-3.5 w-3.5 ml-auto" />}
              </motion.button>
            )
          })}
        </div>
      </FilterSection>

      {/* Difficulty Filter */}
      <FilterSection 
        title="Difficulty" 
        icon={<Gauge className="h-4 w-4 text-gray-400" />}
        count={filters.difficulties.length}
      >
        <div className="space-y-2">
          {DIFFICULTIES.map((item) => {
            const isSelected = filters.difficulties.includes(item.type)
            const colors = typeColorClasses[item.color] || typeColorClasses.blue
            
            return (
              <motion.button
                key={item.type}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                onClick={() => {
                  onFilterChange({
                    difficulties: isSelected
                      ? filters.difficulties.filter(d => d !== item.type)
                      : [...filters.difficulties, item.type]
                  })
                }}
                className={cn(
                  'w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm transition-all border',
                  isSelected
                    ? `${colors.bg} ${colors.text} ${colors.border}`
                    : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
                )}
              >
                <div className="flex items-center gap-2">
                  <div className={cn(
                    'w-2 h-2 rounded-full',
                    item.type === 'Beginner' && 'bg-green-500',
                    item.type === 'Intermediate' && 'bg-amber-500',
                    item.type === 'Advanced' && 'bg-red-500'
                  )} />
                  {item.type}
                </div>
                {isSelected && <CheckCircle2 className="h-4 w-4" />}
              </motion.button>
            )
          })}
        </div>
      </FilterSection>

      {/* Exam Type Filter */}
      <FilterSection 
        title="Exam Type" 
        icon={<Award className="h-4 w-4 text-gray-400" />}
        count={filters.examTypes.length}
      >
        <div className="space-y-2">
          {EXAM_TYPES.map((exam) => {
            const isSelected = filters.examTypes.includes(exam)
            
            return (
              <motion.div
                key={exam}
                whileHover={{ scale: 1.01 }}
                className="flex items-center space-x-3 px-1 py-1 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Checkbox
                  id={`exam-${exam}`}
                  checked={isSelected}
                  onCheckedChange={(checked) => 
                    onFilterChange({
                      examTypes: checked 
                        ? [...filters.examTypes, exam]
                        : filters.examTypes.filter(e => e !== exam)
                    })
                  }
                  className="data-[state=checked]:bg-violet-500 data-[state=checked]:border-violet-500"
                />
                <Label htmlFor={`exam-${exam}`} className="text-sm text-gray-700 cursor-pointer flex items-center gap-2">
                  {exam === 'JEE' && (
                    <Badge variant="secondary" className="h-5 px-1.5 bg-blue-50 text-blue-700 border-blue-200">
                      JEE
                    </Badge>
                  )}
                  {exam === 'NEET' && (
                    <Badge variant="secondary" className="h-5 px-1.5 bg-teal-50 text-teal-700 border-teal-200">
                      NEET
                    </Badge>
                  )}
                  <span>{exam === 'JEE' ? 'Engineering' : 'Medical'}</span>
                </Label>
              </motion.div>
            )
          })}
        </div>
      </FilterSection>

      {/* Grade Filter */}
      <FilterSection 
        title="Grade" 
        icon={<GraduationCap className="h-4 w-4 text-gray-400" />}
        count={filters.grades.length}
        defaultOpen={false}
      >
        <div className="flex gap-2">
          {GRADES.map((grade) => {
            const isSelected = filters.grades.includes(grade)
            
            return (
              <motion.button
                key={grade}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  onFilterChange({
                    grades: isSelected
                      ? filters.grades.filter(g => g !== grade)
                      : [...filters.grades, grade]
                  })
                }}
                className={cn(
                  'flex-1 py-2 rounded-lg text-sm font-medium transition-all border',
                  isSelected
                    ? 'bg-gradient-to-r from-violet-500 to-purple-500 text-white border-0 shadow-md'
                    : 'bg-white text-gray-600 border-gray-200 hover:border-violet-300'
                )}
              >
                Class {grade}
              </motion.button>
            )
          })}
        </div>
      </FilterSection>

      {/* Length Filter */}
      <FilterSection 
        title="Content Length" 
        icon={<Clock3 className="h-4 w-4 text-gray-400" />}
        defaultOpen={false}
      >
        <div className="px-1">
          <div className="flex justify-between text-xs text-gray-500 mb-2">
            <span>{filters.lengthRange[0]} min</span>
            <span>{filters.lengthRange[1]}+ min</span>
          </div>
          <Slider
            value={filters.lengthRange}
            min={0}
            max={120}
            step={5}
            onValueChange={(value) => onFilterChange({ lengthRange: value as [number, number] })}
            className="w-full"
          />
          <div className="flex justify-center mt-3">
            <Badge variant="secondary" className="bg-violet-50 text-violet-700 border-violet-200">
              {filters.lengthRange[0]} - {filters.lengthRange[1]} minutes
            </Badge>
          </div>
        </div>
      </FilterSection>

      {/* AI Quality Minimum */}
      <FilterSection 
        title="Min AI Quality Score" 
        icon={<Sparkles className="h-4 w-4 text-gray-400" />}
        defaultOpen={false}
      >
        <div className="px-1">
          <div className="flex justify-between text-xs text-gray-500 mb-2">
            <span>0%</span>
            <span>100%</span>
          </div>
          <Slider
            value={[filters.aiQualityMin]}
            min={0}
            max={100}
            step={10}
            onValueChange={(value) => onFilterChange({ aiQualityMin: value[0] })}
            className="w-full"
          />
          <div className="flex justify-center mt-3">
            <Badge 
              variant="secondary" 
              className={cn(
                'border',
                filters.aiQualityMin >= 70 ? 'bg-green-50 text-green-700 border-green-200' :
                filters.aiQualityMin >= 40 ? 'bg-amber-50 text-amber-700 border-amber-200' :
                'bg-gray-50 text-gray-700 border-gray-200'
              )}
            >
              {filters.aiQualityMin}%+ Quality
            </Badge>
          </div>
        </div>
      </FilterSection>

      {/* Year Filter */}
      <FilterSection 
        title="Year" 
        icon={<Calendar className="h-4 w-4 text-gray-400" />}
        defaultOpen={false}
      >
        <div className="px-1">
          <div className="flex justify-between text-xs text-gray-500 mb-2">
            <span>{filters.yearRange[0]}</span>
            <span>{filters.yearRange[1]}</span>
          </div>
          <Slider
            value={filters.yearRange}
            min={2018}
            max={2024}
            step={1}
            onValueChange={(value) => onFilterChange({ yearRange: value as [number, number] })}
            className="w-full"
          />
          <div className="flex justify-center mt-3">
            <Badge variant="secondary" className="bg-violet-50 text-violet-700 border-violet-200">
              {filters.yearRange[0]} - {filters.yearRange[1]}
            </Badge>
          </div>
        </div>
      </FilterSection>
    </div>
  )
}

export function SmartFilters({
  filters,
  onFilterChange,
  onReset,
  activeFilterCount,
  aiQualityScore,
  className,
}: SmartFiltersProps) {
  return (
    <>
      {/* Desktop Sidebar */}
      <motion.aside
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3 }}
        className={cn(
          'hidden lg:block w-72 flex-shrink-0 border-r border-gray-100 bg-white/80 backdrop-blur-sm',
          className
        )}
      >
        <div className="sticky top-[120px] h-[calc(100vh-120px)] flex flex-col">
          {/* Header */}
          <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-purple-500 flex items-center justify-center">
                <Filter className="h-4 w-4 text-white" />
              </div>
              <span className="font-semibold text-gray-900">Smart Filters</span>
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
                    className="h-7 px-2 text-xs text-violet-600 hover:text-violet-700 hover:bg-violet-50 rounded-lg"
                  >
                    <RotateCcw className="h-3 w-3 mr-1" />
                    Reset
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Filter Content */}
          <ScrollArea className="flex-1 px-4 py-3 custom-scrollbar">
            <FilterContent 
              filters={filters}
              onFilterChange={onFilterChange}
              aiQualityScore={aiQualityScore}
            />
          </ScrollArea>

          {/* Active Filters Footer */}
          <AnimatePresence>
            {activeFilterCount > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                className="px-4 py-3 border-t border-gray-100 bg-gradient-to-r from-violet-50 to-purple-50"
              >
                <div className="text-xs text-gray-500 mb-2">Active filters:</div>
                <div className="flex flex-wrap gap-1.5">
                  {filters.contentTypes.slice(0, 3).map((type) => (
                    <Badge key={type} variant="secondary" className="text-xs bg-white border border-violet-100 text-violet-700">
                      {type}
                    </Badge>
                  ))}
                  {filters.difficulties.map((diff) => (
                    <Badge key={diff} variant="secondary" className="text-xs bg-white border border-amber-100 text-amber-700">
                      {diff}
                    </Badge>
                  ))}
                  {activeFilterCount > 5 && (
                    <Badge variant="secondary" className="text-xs bg-white border border-gray-100 text-gray-600">
                      +{activeFilterCount - 5} more
                    </Badge>
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
                className="h-12 px-4 rounded-xl shadow-lg bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700"
              >
                <Filter className="h-4 w-4 mr-2" />
                Filters
                {activeFilterCount > 0 && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                  >
                    <Badge className="ml-2 bg-white text-violet-600 font-semibold">
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
                <SheetTitle className="text-lg">Smart Filters</SheetTitle>
                {activeFilterCount > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onReset}
                    className="h-7 px-2 text-xs text-violet-600"
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
                aiQualityScore={aiQualityScore}
              />
            </ScrollArea>
          </SheetContent>
        </Sheet>
      </div>
    </>
  )
}

export default SmartFilters
