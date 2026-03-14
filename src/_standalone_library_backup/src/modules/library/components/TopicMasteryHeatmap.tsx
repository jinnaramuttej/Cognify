'use client'

import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Grid3X3,
  ChevronDown,
  ChevronUp,
  Target,
  TrendingUp,
  TrendingDown,
  Minus,
  Info,
} from 'lucide-react'
import { cn } from '@/lib/utils'

// Types
export interface MasteryCell {
  id: string
  topic: string
  chapter: string
  subject: string
  mastery: number // 0-100
  trend: 'improving' | 'declining' | 'stable'
  attempts: number
  lastPracticed?: Date
}

interface TopicMasteryHeatmapProps {
  data?: MasteryCell[]
  onCellClick?: (cell: MasteryCell) => void
  maxRows?: number
  className?: string
}

// Color scale function
const getMasteryColor = (mastery: number): string => {
  if (mastery < 20) return 'bg-red-100 text-red-800'
  if (mastery < 40) return 'bg-orange-100 text-orange-800'
  if (mastery < 60) return 'bg-amber-100 text-amber-800'
  if (mastery < 80) return 'bg-emerald-100 text-emerald-800'
  return 'bg-blue-500 text-white'
}

// Get intensity for cell background
const getIntensity = (mastery: number): number => {
  // Scale: 0-100 -> 0.1-1.0
  return 0.1 + (mastery / 100) * 0.9
}

export function TopicMasteryHeatmap({
  data = [],
  onCellClick,
  maxRows = 6,
  className,
}: TopicMasteryHeatmapProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [hoveredCell, setHoveredCell] = useState<MasteryCell | null>(null)
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null)
  
  // Mock data
  const mockData: MasteryCell[] = data.length > 0 ? data : [
    // Physics
    { id: 'p1', topic: 'Kinematics', chapter: 'Motion', subject: 'Physics', mastery: 85, trend: 'improving', attempts: 45 },
    { id: 'p2', topic: 'Newton\'s Laws', chapter: 'Dynamics', subject: 'Physics', mastery: 72, trend: 'stable', attempts: 38 },
    { id: 'p3', topic: 'Work & Energy', chapter: 'Energy', subject: 'Physics', mastery: 65, trend: 'improving', attempts: 32 },
    { id: 'p4', topic: 'Rotational Motion', chapter: 'Rotation', subject: 'Physics', mastery: 45, trend: 'declining', attempts: 28 },
    { id: 'p5', topic: 'Gravitation', chapter: 'Gravity', subject: 'Physics', mastery: 88, trend: 'stable', attempts: 42 },
    { id: 'p6', topic: 'SHM', chapter: 'Oscillations', subject: 'Physics', mastery: 55, trend: 'improving', attempts: 25 },
    { id: 'p7', topic: 'Waves', chapter: 'Waves', subject: 'Physics', mastery: 78, trend: 'stable', attempts: 30 },
    { id: 'p8', topic: 'Electrostatics', chapter: 'Electrostatics', subject: 'Physics', mastery: 35, trend: 'declining', attempts: 20 },
    { id: 'p9', topic: 'Current Electricity', chapter: 'Electricity', subject: 'Physics', mastery: 62, trend: 'improving', attempts: 35 },
    { id: 'p10', topic: 'Magnetism', chapter: 'Magnetism', subject: 'Physics', mastery: 48, trend: 'stable', attempts: 22 },
    // Chemistry
    { id: 'c1', topic: 'Mole Concept', chapter: 'Basic Concepts', subject: 'Chemistry', mastery: 92, trend: 'stable', attempts: 55 },
    { id: 'c2', topic: 'Atomic Structure', chapter: 'Structure', subject: 'Chemistry', mastery: 78, trend: 'improving', attempts: 40 },
    { id: 'c3', topic: 'Periodic Table', chapter: 'Periodicity', subject: 'Chemistry', mastery: 85, trend: 'stable', attempts: 48 },
    { id: 'c4', topic: 'Chemical Bonding', chapter: 'Bonding', subject: 'Chemistry', mastery: 55, trend: 'declining', attempts: 30 },
    { id: 'c5', topic: 'Thermodynamics', chapter: 'Thermodynamics', subject: 'Chemistry', mastery: 40, trend: 'improving', attempts: 25 },
    { id: 'c6', topic: 'Equilibrium', chapter: 'Equilibrium', subject: 'Chemistry', mastery: 68, trend: 'stable', attempts: 35 },
    { id: 'c7', topic: 'Organic Basics', chapter: 'Organic', subject: 'Chemistry', mastery: 75, trend: 'improving', attempts: 42 },
    { id: 'c8', topic: 'Hydrocarbons', chapter: 'Organic', subject: 'Chemistry', mastery: 52, trend: 'stable', attempts: 28 },
    // Mathematics
    { id: 'm1', topic: 'Sets', chapter: 'Sets', subject: 'Mathematics', mastery: 95, trend: 'stable', attempts: 60 },
    { id: 'm2', topic: 'Relations & Functions', chapter: 'Functions', subject: 'Mathematics', mastery: 82, trend: 'improving', attempts: 45 },
    { id: 'm3', topic: 'Trigonometry', chapter: 'Trigonometry', subject: 'Mathematics', mastery: 70, trend: 'stable', attempts: 38 },
    { id: 'm4', topic: 'Complex Numbers', chapter: 'Complex', subject: 'Mathematics', mastery: 58, trend: 'improving', attempts: 32 },
    { id: 'm5', topic: 'Quadratic Equations', chapter: 'Algebra', subject: 'Mathematics', mastery: 88, trend: 'stable', attempts: 50 },
    { id: 'm6', topic: 'Sequences & Series', chapter: 'Series', subject: 'Mathematics', mastery: 65, trend: 'declining', attempts: 28 },
    { id: 'm7', topic: 'Limits', chapter: 'Calculus', subject: 'Mathematics', mastery: 72, trend: 'improving', attempts: 35 },
    { id: 'm8', topic: 'Derivatives', chapter: 'Calculus', subject: 'Mathematics', mastery: 45, trend: 'improving', attempts: 22 },
  ]
  
  // Filter by subject
  const filteredData = selectedSubject
    ? mockData.filter(d => d.subject === selectedSubject)
    : mockData
  
  // Get unique subjects
  const subjects = [...new Set(mockData.map(d => d.subject))]
  
  // Calculate overall stats
  const stats = {
    total: mockData.length,
    avgMastery: Math.round(mockData.reduce((acc, d) => acc + d.mastery, 0) / mockData.length),
    improving: mockData.filter(d => d.trend === 'improving').length,
    declining: mockData.filter(d => d.trend === 'declining').length,
  }
  
  return (
    <Card className={cn('overflow-hidden', className)}>
      {/* Header */}
      <div className="p-4 bg-gradient-to-r from-teal-500 to-cyan-500 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
              <Grid3X3 className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-semibold">Topic Mastery Heatmap</h3>
              <p className="text-sm text-white/70">
                {stats.total} topics • {stats.avgMastery}% avg mastery
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-white hover:bg-white/20"
          >
            {isExpanded ? 'Show Less' : 'Show More'}
            {isExpanded ? (
              <ChevronUp className="h-4 w-4 ml-1" />
            ) : (
              <ChevronDown className="h-4 w-4 ml-1" />
            )}
          </Button>
        </div>
        
        {/* Quick Stats */}
        <div className="flex gap-4 mt-4">
          <div className="flex items-center gap-1.5">
            <TrendingUp className="h-4 w-4" />
            <span className="text-sm">{stats.improving} improving</span>
          </div>
          <div className="flex items-center gap-1.5">
            <TrendingDown className="h-4 w-4" />
            <span className="text-sm">{stats.declining} need attention</span>
          </div>
        </div>
      </div>
      
      {/* Subject Filters */}
      <div className="p-3 border-b border-gray-100 flex gap-2 overflow-x-auto">
        <Button
          variant={selectedSubject === null ? 'default' : 'outline'}
          size="sm"
          onClick={() => setSelectedSubject(null)}
          className="rounded-full"
        >
          All
        </Button>
        {subjects.map((subject) => (
          <Button
            key={subject}
            variant={selectedSubject === subject ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedSubject(subject)}
            className="rounded-full"
          >
            {subject}
          </Button>
        ))}
      </div>
      
      {/* Heatmap Grid */}
      <div className="p-4">
        <div className={cn(
          'grid gap-1.5',
          isExpanded ? 'grid-cols-8' : 'grid-cols-6'
        )}>
          {filteredData.slice(0, isExpanded ? undefined : maxRows * 6).map((cell, index) => (
            <motion.div
              key={cell.id}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.01 }}
              whileHover={{ scale: 1.15, zIndex: 10 }}
              onClick={() => onCellClick?.(cell)}
              onMouseEnter={() => setHoveredCell(cell)}
              onMouseLeave={() => setHoveredCell(null)}
              className={cn(
                'aspect-square rounded-lg flex items-center justify-center text-xs font-medium cursor-pointer transition-all relative',
                getMasteryColor(cell.mastery),
              )}
              title={`${cell.topic}: ${cell.mastery}%`}
            >
              {/* Trend Indicator */}
              {cell.trend === 'improving' && (
                <TrendingUp className="absolute -top-0.5 -right-0.5 h-2.5 w-2.5 text-emerald-500" />
              )}
              {cell.trend === 'declining' && (
                <TrendingDown className="absolute -top-0.5 -right-0.5 h-2.5 w-2.5 text-red-500" />
              )}
              
              {/* Mastery Value */}
              <span>{Math.round(cell.mastery)}</span>
            </motion.div>
          ))}
        </div>
        
        {/* Color Legend */}
        <div className="flex items-center justify-center gap-1 mt-4">
          <span className="text-xs text-gray-500">Low</span>
          <div className="flex gap-0.5">
            {['bg-red-100', 'bg-orange-100', 'bg-amber-100', 'bg-emerald-100', 'bg-blue-500'].map((bg, i) => (
              <div key={i} className={cn('w-5 h-5 rounded', bg)} />
            ))}
          </div>
          <span className="text-xs text-gray-500">High</span>
        </div>
      </div>
      
      {/* Hovered Cell Info */}
      {hoveredCell && (
        <motion.div
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          className="px-4 pb-4"
        >
          <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
            <div className="flex items-center justify-between mb-1">
              <h4 className="font-medium text-gray-900">{hoveredCell.topic}</h4>
              <div className="flex items-center gap-1">
                {hoveredCell.trend === 'improving' && (
                  <Badge className="bg-emerald-100 text-emerald-700">
                    <TrendingUp className="h-3 w-3 mr-0.5" />
                    Improving
                  </Badge>
                )}
                {hoveredCell.trend === 'declining' && (
                  <Badge className="bg-red-100 text-red-700">
                    <TrendingDown className="h-3 w-3 mr-0.5" />
                    Needs Focus
                  </Badge>
                )}
                {hoveredCell.trend === 'stable' && (
                  <Badge className="bg-gray-100 text-gray-700">
                    <Minus className="h-3 w-3 mr-0.5" />
                    Stable
                  </Badge>
                )}
              </div>
            </div>
            <p className="text-sm text-gray-500">
              {hoveredCell.subject} • {hoveredCell.chapter}
            </p>
            <div className="flex items-center gap-4 mt-2 text-xs text-gray-400">
              <span>{hoveredCell.attempts} attempts</span>
              <span>{hoveredCell.mastery}% mastery</span>
            </div>
          </div>
        </motion.div>
      )}
    </Card>
  )
}

export default TopicMasteryHeatmap
