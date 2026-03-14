'use client'

import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Grid3X3, 
  TrendingUp, 
  TrendingDown,
  Minus,
  Clock,
  Target,
  ChevronDown,
  ChevronRight,
  Info
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/modules/tests/utils'
import { FadeIn, AnimatedCounter } from './motion'
import type { HeatmapCell, TopicMastery } from '@/modules/tests/types'

// ============================================
// TOPIC MASTERY HEATMAP
// ============================================

interface TopicMasteryHeatmapProps {
  subjects?: { id: string; name: string; color: string }[]
  className?: string
}

export function TopicMasteryHeatmap({ 
  subjects = [
    { id: 'math', name: 'Mathematics', color: '#8B5CF6' },
    { id: 'physics', name: 'Physics', color: '#2563EB' },
    { id: 'chemistry', name: 'Chemistry', color: '#10B981' },
    { id: 'biology', name: 'Biology', color: '#F59E0B' }
  ],
  className
}: TopicMasteryHeatmapProps) {
  const [selectedCell, setSelectedCell] = useState<HeatmapCell | null>(null)
  const [hoveredSubject, setHoveredSubject] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')

  // Generate heatmap data
  const heatmapData = useMemo<HeatmapCell[]>(() => [
    // Mathematics
    { subjectId: 'math', chapterId: 'calc', name: 'Calculus', mastery: 72, timeSpent: 245, status: 'reviewing' },
    { subjectId: 'math', chapterId: 'algebra', name: 'Algebra', mastery: 85, timeSpent: 180, status: 'mastered' },
    { subjectId: 'math', chapterId: 'trig', name: 'Trigonometry', mastery: 68, timeSpent: 120, status: 'learning' },
    { subjectId: 'math', chapterId: 'coord', name: 'Coordinate Geometry', mastery: 55, timeSpent: 95, status: 'learning' },
    { subjectId: 'math', chapterId: 'vector', name: 'Vectors', mastery: 78, timeSpent: 110, status: 'reviewing' },
    { subjectId: 'math', chapterId: 'matrix', name: 'Matrices', mastery: 90, timeSpent: 85, status: 'mastered' },
    // Physics
    { subjectId: 'physics', chapterId: 'mech', name: 'Mechanics', mastery: 65, timeSpent: 280, status: 'learning' },
    { subjectId: 'physics', chapterId: 'thermo', name: 'Thermodynamics', mastery: 88, timeSpent: 195, status: 'mastered' },
    { subjectId: 'physics', chapterId: 'em', name: 'Electromagnetism', mastery: 58, timeSpent: 165, status: 'learning' },
    { subjectId: 'physics', chapterId: 'optics', name: 'Optics', mastery: 75, timeSpent: 130, status: 'reviewing' },
    { subjectId: 'physics', chapterId: 'modern', name: 'Modern Physics', mastery: 82, timeSpent: 145, status: 'reviewing' },
    // Chemistry
    { subjectId: 'chemistry', chapterId: 'organic', name: 'Organic Chemistry', mastery: 48, timeSpent: 220, status: 'learning' },
    { subjectId: 'chemistry', chapterId: 'inorganic', name: 'Inorganic Chemistry', mastery: 72, timeSpent: 175, status: 'reviewing' },
    { subjectId: 'chemistry', chapterId: 'physical', name: 'Physical Chemistry', mastery: 78, timeSpent: 190, status: 'reviewing' },
    { subjectId: 'chemistry', chapterId: 'electro', name: 'Electrochemistry', mastery: 62, timeSpent: 140, status: 'learning' },
    // Biology
    { subjectId: 'biology', chapterId: 'botany', name: 'Botany', mastery: 85, timeSpent: 160, status: 'mastered' },
    { subjectId: 'biology', chapterId: 'zoology', name: 'Zoology', mastery: 78, timeSpent: 145, status: 'reviewing' },
    { subjectId: 'biology', chapterId: 'genetics', name: 'Genetics', mastery: 70, timeSpent: 120, status: 'learning' },
    { subjectId: 'biology', chapterId: 'ecology', name: 'Ecology', mastery: 92, timeSpent: 95, status: 'mastered' },
  ], [])

  // Get mastery color
  const getMasteryColor = (mastery: number) => {
    if (mastery >= 80) return { bg: 'bg-emerald-500', text: 'text-white', border: 'border-emerald-600' }
    if (mastery >= 60) return { bg: 'bg-blue-500', text: 'text-white', border: 'border-blue-600' }
    if (mastery >= 40) return { bg: 'bg-amber-500', text: 'text-white', border: 'border-amber-600' }
    return { bg: 'bg-red-500', text: 'text-white', border: 'border-red-600' }
  }

  // Get status badge
  const getStatusBadge = (status: TopicMastery['status']) => {
    const badges = {
      mastered: { label: 'Mastered', color: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
      reviewing: { label: 'Reviewing', color: 'bg-blue-100 text-blue-700 border-blue-200' },
      learning: { label: 'Learning', color: 'bg-amber-100 text-amber-700 border-amber-200' }
    }
    return badges[status]
  }

  // Group by subject
  const groupedData = useMemo(() => {
    const groups: Record<string, HeatmapCell[]> = {}
    heatmapData.forEach(cell => {
      if (!groups[cell.subjectId]) {
        groups[cell.subjectId] = []
      }
      groups[cell.subjectId].push(cell)
    })
    return groups
  }, [heatmapData])

  // Calculate overall stats
  const overallStats = useMemo(() => {
    const total = heatmapData.length
    const avgMastery = heatmapData.reduce((sum, c) => sum + c.mastery, 0) / total
    const mastered = heatmapData.filter(c => c.status === 'mastered').length
    const learning = heatmapData.filter(c => c.status === 'learning').length
    return { total, avgMastery: Math.round(avgMastery), mastered, learning }
  }, [heatmapData])

  return (
    <div className={className}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-600 shadow-lg shadow-indigo-500/20">
            <Grid3X3 className="h-5 w-5 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">Topic Mastery</h2>
            <p className="text-sm text-gray-500">Visual overview of your learning progress</p>
          </div>
        </div>
        
        <div className="flex gap-2">
          <button
            onClick={() => setViewMode('grid')}
            className={cn(
              "p-2 rounded-lg transition-colors",
              viewMode === 'grid' ? 'bg-indigo-100 text-indigo-600' : 'text-gray-400 hover:bg-gray-100'
            )}
          >
            <Grid3X3 className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 mb-6">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-emerald-500" />
          <span className="text-xs text-gray-600">Mastered (80%+)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-blue-500" />
          <span className="text-xs text-gray-600">Reviewing (60-79%)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-amber-500" />
          <span className="text-xs text-gray-600">Learning (40-59%)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-red-500" />
          <span className="text-xs text-gray-600">Needs Focus (&lt;40%)</span>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-4 gap-3 mb-6">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-3 rounded-xl bg-indigo-50 border border-indigo-100 text-center"
        >
          <div className="text-2xl font-bold text-indigo-600">
            <AnimatedCounter value={overallStats.avgMastery} />%
          </div>
          <div className="text-xs text-gray-500">Avg Mastery</div>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="p-3 rounded-xl bg-emerald-50 border border-emerald-100 text-center"
        >
          <div className="text-2xl font-bold text-emerald-600">{overallStats.mastered}</div>
          <div className="text-xs text-gray-500">Mastered</div>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="p-3 rounded-xl bg-amber-50 border border-amber-100 text-center"
        >
          <div className="text-2xl font-bold text-amber-600">{overallStats.learning}</div>
          <div className="text-xs text-gray-500">Learning</div>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="p-3 rounded-xl bg-blue-50 border border-blue-100 text-center"
        >
          <div className="text-2xl font-bold text-blue-600">{overallStats.total}</div>
          <div className="text-xs text-gray-500">Topics</div>
        </motion.div>
      </div>

      {/* Heatmap Grid */}
      <div className="space-y-4">
        {subjects.map((subject) => {
          const chapters = groupedData[subject.id] || []
          const subjectAvg = chapters.length > 0 
            ? Math.round(chapters.reduce((sum, c) => sum + c.mastery, 0) / chapters.length)
            : 0
          
          return (
            <motion.div
              key={subject.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 rounded-xl bg-white border border-gray-200 shadow-sm"
            >
              {/* Subject Header */}
              <div 
                className="flex items-center justify-between mb-3 cursor-pointer"
                onMouseEnter={() => setHoveredSubject(subject.id)}
                onMouseLeave={() => setHoveredSubject(null)}
              >
                <div className="flex items-center gap-3">
                  <div 
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: subject.color }}
                  />
                  <h3 className="font-semibold text-gray-900">{subject.name}</h3>
                  <Badge variant="outline" className="text-xs">
                    {chapters.length} topics
                  </Badge>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-600">{subjectAvg}%</span>
                  {subjectAvg >= 70 ? (
                    <TrendingUp className="h-4 w-4 text-emerald-500" />
                  ) : subjectAvg >= 50 ? (
                    <Minus className="h-4 w-4 text-gray-400" />
                  ) : (
                    <TrendingDown className="h-4 w-4 text-red-500" />
                  )}
                </div>
              </div>

              {/* Topic Grid */}
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                {chapters.map((chapter, idx) => {
                  const colors = getMasteryColor(chapter.mastery)
                  const isSelected = selectedCell?.chapterId === chapter.chapterId
                  
                  return (
                    <motion.div
                      key={chapter.chapterId}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: idx * 0.02 }}
                      onClick={() => setSelectedCell(isSelected ? null : chapter)}
                      className={cn(
                        "relative p-2 rounded-lg cursor-pointer transition-all",
                        colors.bg,
                        colors.text,
                        isSelected && "ring-2 ring-offset-2 ring-indigo-500"
                      )}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <div className="text-center">
                        <div className="text-lg font-bold">{chapter.mastery}%</div>
                        <div className="text-xs opacity-80 truncate">{chapter.name}</div>
                      </div>
                    </motion.div>
                  )
                })}
              </div>
            </motion.div>
          )
        })}
      </div>

      {/* Selected Topic Detail */}
      <AnimatePresence>
        {selectedCell && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="mt-4 p-4 rounded-xl bg-indigo-50 border border-indigo-100"
          >
            <div className="flex items-start justify-between">
              <div>
                <h4 className="font-semibold text-gray-900">{selectedCell.name}</h4>
                <div className="flex items-center gap-3 mt-2">
                  <Badge className={getStatusBadge(selectedCell.status).color}>
                    {getStatusBadge(selectedCell.status).label}
                  </Badge>
                  <div className="flex items-center gap-1 text-sm text-gray-500">
                    <Clock className="h-4 w-4" />
                    {selectedCell.timeSpent}m spent
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-indigo-600">{selectedCell.mastery}%</div>
                <div className="text-xs text-gray-500">Mastery Score</div>
              </div>
            </div>
            
            <div className="mt-4">
              <div className="h-2 bg-white rounded-full overflow-hidden">
                <motion.div
                  className={cn("h-full rounded-full", getMasteryColor(selectedCell.mastery).bg)}
                  initial={{ width: 0 }}
                  animate={{ width: `${selectedCell.mastery}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>
              <div className="flex justify-between mt-2 text-xs text-gray-500">
                <span>0%</span>
                <span>Target: 80%</span>
                <span>100%</span>
              </div>
            </div>

            <div className="mt-4 flex gap-2">
              <button className="flex-1 px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 transition-colors">
                Practice Now
              </button>
              <button className="px-4 py-2 rounded-lg bg-white border border-indigo-200 text-indigo-600 text-sm font-medium hover:bg-indigo-50 transition-colors">
                View Details
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ============================================
// TRENDING RESOURCES COMPONENT
// ============================================

interface TrendingResourcesProps {
  className?: string
}

export function TrendingResources({ className }: TrendingResourcesProps) {
  const trendingItems = useMemo(() => [
    { id: '1', title: 'JEE Main 2024 Physics Solutions', type: 'test', attempts: 2450, growth: 45 },
    { id: '2', title: 'Integration Shortcuts PDF', type: 'notes', attempts: 1890, growth: 32 },
    { id: '3', title: 'Organic Chemistry Reaction Map', type: 'notes', attempts: 1650, growth: 28 },
    { id: '4', title: 'NEET Biology Quick Revision', type: 'test', attempts: 1420, growth: 22 },
    { id: '5', title: 'Calculus Problem Set', type: 'practice', attempts: 1280, growth: 18 }
  ], [])

  return (
    <Card className={cn("border border-gray-200 shadow-sm", className)}>
      <CardHeader className="border-b border-gray-100 pb-3">
        <CardTitle className="text-base font-semibold text-gray-900 flex items-center gap-2">
          <TrendingUp className="h-4 w-4 text-indigo-600" />
          Trending Among Similar Students
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="divide-y divide-gray-100">
          {trendingItems.map((item, idx) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="p-4 hover:bg-gray-50 transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-semibold text-sm">
                  {idx + 1}
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900 text-sm">{item.title}</h4>
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <span className="capitalize">{item.type}</span>
                    <span>•</span>
                    <span>{item.attempts.toLocaleString()} students</span>
                  </div>
                </div>
                <div className="flex items-center gap-1 text-emerald-600">
                  <TrendingUp className="h-3 w-3" />
                  <span className="text-xs font-medium">+{item.growth}%</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

// ============================================
// TEACHER SUGGESTIONS COMPONENT
// ============================================

interface TeacherSuggestionsProps {
  className?: string
}

export function TeacherSuggestions({ className }: TeacherSuggestionsProps) {
  const suggestions = useMemo(() => [
    { id: '1', teacher: 'Mr. Sharma', title: 'Complete Thermodynamics Test', dueDate: 'Tomorrow', priority: 'high' },
    { id: '2', teacher: 'Ms. Patel', title: 'Integration Practice Set', dueDate: 'In 2 days', priority: 'medium' },
    { id: '3', teacher: 'Mr. Kumar', title: 'Organic Chemistry Revision', dueDate: 'This week', priority: 'low' }
  ], [])

  return (
    <Card className={cn("border border-gray-200 shadow-sm", className)}>
      <CardHeader className="border-b border-gray-100 pb-3">
        <CardTitle className="text-base font-semibold text-gray-900 flex items-center gap-2">
          <Info className="h-4 w-4 text-amber-600" />
          Teacher Suggestions
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="divide-y divide-gray-100">
          {suggestions.map((item, idx) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="p-4 hover:bg-gray-50 transition-colors cursor-pointer"
            >
              <div className="flex items-start gap-3">
                <div className={cn(
                  "w-1 h-12 rounded-full",
                  item.priority === 'high' ? 'bg-red-500' :
                  item.priority === 'medium' ? 'bg-amber-500' : 'bg-gray-300'
                )} />
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900 text-sm">{item.title}</h4>
                  <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
                    <span>{item.teacher}</span>
                    <span>•</span>
                    <span>{item.dueDate}</span>
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 text-gray-400" />
              </div>
            </motion.div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
