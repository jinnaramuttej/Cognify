'use client'

import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import {
  Calendar,
  Clock,
  Plus,
  Trash2,
  Play,
  Pause,
  CheckCircle2,
  AlertCircle,
  Coffee,
  Brain,
  BookOpen,
  Timer,
  ChevronRight,
  ChevronLeft,
  Sparkles,
  RotateCcw,
  Zap,
  Target,
} from 'lucide-react'
import { cn } from '@/lib/utils'

// Types
export interface StudyItem {
  id: string
  resourceId: string
  title: string
  subject: string
  chapter: string
  estimatedMinutes: number
  priority: 'high' | 'medium' | 'low'
  type: 'learning' | 'revision' | 'practice' | 'quiz'
  status: 'pending' | 'in-progress' | 'completed'
  scheduledTime?: string // HH:mm format
  repetitions?: number
  nextRepetition?: Date
}

export interface StudySession {
  id: string
  items: StudyItem[]
  totalMinutes: number
  completedMinutes: number
  startTime?: Date
  endTime?: Date
}

export interface BreakSuggestion {
  afterMinutes: number
  duration: number
  type: 'short' | 'long' | 'exercise' | 'snack'
  message: string
}

interface SmartSchedulerProps {
  todayItems?: StudyItem[]
  upcomingRevision?: StudyItem[]
  onAddItem?: () => void
  onStartItem?: (itemId: string) => void
  onCompleteItem?: (itemId: string) => void
  onRemoveItem?: (itemId: string) => void
  onReschedule?: (itemId: string, newTime: string) => void
  className?: string
}

// Priority colors
const priorityConfig = {
  high: { color: 'bg-red-500', bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200' },
  medium: { color: 'bg-amber-500', bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' },
  low: { color: 'bg-blue-500', bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
}

// Type icons
const typeIcons = {
  learning: BookOpen,
  revision: RotateCcw,
  practice: Target,
  quiz: Brain,
}

// Break suggestions
const breakSuggestions: BreakSuggestion[] = [
  { afterMinutes: 25, duration: 5, type: 'short', message: 'Take a quick 5-minute break' },
  { afterMinutes: 50, duration: 10, type: 'long', message: 'Time for a 10-minute break' },
  { afterMinutes: 90, duration: 15, type: 'exercise', message: 'Stretch and move for 15 minutes' },
]

export function SmartScheduler({
  todayItems = [],
  upcomingRevision = [],
  onAddItem,
  onStartItem,
  onCompleteItem,
  onRemoveItem,
  onReschedule,
  className,
}: SmartSchedulerProps) {
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [activeSession, setActiveSession] = useState<StudySession | null>(null)
  const [showBreakSuggestion, setShowBreakSuggestion] = useState<BreakSuggestion | null>(null)
  const [activeTimer, setActiveTimer] = useState<number | null>(null) // seconds
  
  // Mock data for demo
  const mockTodayItems: StudyItem[] = todayItems.length > 0 ? todayItems : [
    {
      id: '1',
      resourceId: 'r1',
      title: 'Electrostatics - Coulomb\'s Law',
      subject: 'Physics',
      chapter: 'Electrostatics',
      estimatedMinutes: 45,
      priority: 'high',
      type: 'learning',
      status: 'pending',
      scheduledTime: '09:00',
    },
    {
      id: '2',
      resourceId: 'r2',
      title: 'Organic Chemistry - Reaction Mechanisms',
      subject: 'Chemistry',
      chapter: 'Organic Chemistry',
      estimatedMinutes: 30,
      priority: 'high',
      type: 'revision',
      status: 'pending',
      scheduledTime: '10:00',
      repetitions: 2,
      nextRepetition: new Date(),
    },
    {
      id: '3',
      resourceId: 'r3',
      title: 'Integration Practice Problems',
      subject: 'Mathematics',
      chapter: 'Calculus',
      estimatedMinutes: 60,
      priority: 'medium',
      type: 'practice',
      status: 'pending',
      scheduledTime: '11:00',
    },
    {
      id: '4',
      resourceId: 'r4',
      title: 'JEE Physics Quiz - Kinematics',
      subject: 'Physics',
      chapter: 'Kinematics',
      estimatedMinutes: 25,
      priority: 'low',
      type: 'quiz',
      status: 'completed',
      scheduledTime: '08:00',
    },
  ]
  
  const mockRevision: StudyItem[] = upcomingRevision.length > 0 ? upcomingRevision : [
    {
      id: 'r1',
      resourceId: 'rv1',
      title: 'Thermodynamics Formulas',
      subject: 'Physics',
      chapter: 'Thermodynamics',
      estimatedMinutes: 15,
      priority: 'high',
      type: 'revision',
      status: 'pending',
      repetitions: 1,
    },
    {
      id: 'r2',
      resourceId: 'rv2',
      title: 'Organic Reactions Summary',
      subject: 'Chemistry',
      chapter: 'Organic Chemistry',
      estimatedMinutes: 20,
      priority: 'medium',
      type: 'revision',
      status: 'pending',
      repetitions: 3,
    },
  ]
  
  // Calculate stats
  const stats = useMemo(() => {
    const total = mockTodayItems.reduce((acc, item) => acc + item.estimatedMinutes, 0)
    const completed = mockTodayItems
      .filter(item => item.status === 'completed')
      .reduce((acc, item) => acc + item.estimatedMinutes, 0)
    const inProgress = mockTodayItems.find(item => item.status === 'in-progress')
    
    return { total, completed, inProgress, progress: total > 0 ? (completed / total) * 100 : 0 }
  }, [mockTodayItems])
  
  // Format time
  const formatTime = (minutes: number): string => {
    const h = Math.floor(minutes / 60)
    const m = minutes % 60
    return h > 0 ? `${h}h ${m}m` : `${m}m`
  }
  
  return (
    <Card className={cn('overflow-hidden', className)}>
      {/* Header */}
      <div className="p-4 bg-gradient-to-r from-violet-500 to-purple-600 text-white">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              <h3 className="font-semibold">Today's Study Plan</h3>
            </div>
            <p className="text-sm text-white/80 mt-1">
              {stats.completed > 0 ? `${formatTime(stats.completed)} completed` : 'Start your study session'}
            </p>
          </div>
          <Button
            variant="secondary"
            size="sm"
            onClick={onAddItem}
            className="bg-white/20 hover:bg-white/30 text-white border-0"
          >
            <Plus className="h-4 w-4 mr-1" />
            Add
          </Button>
        </div>
        
        {/* Progress Bar */}
        <div className="mt-4">
          <div className="flex items-center justify-between text-sm mb-1.5">
            <span>{Math.round(stats.progress)}% complete</span>
            <span>{formatTime(stats.total - stats.completed)} remaining</span>
          </div>
          <Progress 
            value={stats.progress} 
            className="h-2 bg-white/20"
          />
        </div>
      </div>
      
      {/* AI Suggestions */}
      <div className="p-3 bg-gradient-to-r from-blue-50 to-purple-50 border-b border-gray-100">
        <div className="flex items-start gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center flex-shrink-0">
            <Sparkles className="h-4 w-4 text-white" />
          </div>
          <div>
            <p className="text-sm text-gray-700">
              <span className="font-medium">AI Suggestion:</span> Based on your weak areas, prioritize 
              <span className="text-blue-600 font-medium"> Electrostatics</span> and 
              <span className="text-purple-600 font-medium"> Organic Chemistry</span> today.
            </p>
            <Button variant="link" size="sm" className="h-auto p-0 mt-1 text-blue-600">
              Apply to schedule <ChevronRight className="h-3 w-3 ml-0.5" />
            </Button>
          </div>
        </div>
      </div>
      
      {/* Study Items */}
      <div className="divide-y divide-gray-100 max-h-[300px] overflow-y-auto">
        {mockTodayItems.map((item, index) => {
          const TypeIcon = typeIcons[item.type]
          const priority = priorityConfig[item.priority]
          
          return (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className={cn(
                'p-4 hover:bg-gray-50 transition-colors',
                item.status === 'completed' && 'bg-gray-50/50'
              )}
            >
              <div className="flex items-start gap-3">
                {/* Time */}
                {item.scheduledTime && (
                  <div className="text-sm text-gray-500 font-mono w-14 flex-shrink-0">
                    {item.scheduledTime}
                  </div>
                )}
                
                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <div className={cn(
                      'w-6 h-6 rounded flex items-center justify-center flex-shrink-0',
                      priority.bg
                    )}>
                      <TypeIcon className={cn('h-3.5 w-3.5', priority.text)} />
                    </div>
                    <h4 className={cn(
                      'font-medium text-sm truncate',
                      item.status === 'completed' ? 'text-gray-400 line-through' : 'text-gray-900'
                    )}>
                      {item.title}
                    </h4>
                  </div>
                  
                  <div className="flex items-center gap-3 text-xs text-gray-500">
                    <span>{item.subject}</span>
                    {item.repetitions && (
                      <Badge variant="outline" className="text-xs">
                        <RotateCcw className="h-3 w-3 mr-0.5" />
                        Rev x{item.repetitions}
                      </Badge>
                    )}
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {item.estimatedMinutes}m
                    </span>
                  </div>
                </div>
                
                {/* Actions */}
                <div className="flex items-center gap-1">
                  {item.status === 'pending' && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onStartItem?.(item.id)}
                      className="h-8 w-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                    >
                      <Play className="h-4 w-4" fill="currentColor" />
                    </Button>
                  )}
                  {item.status === 'in-progress' && (
                    <>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onCompleteItem?.(item.id)}
                        className="h-8 w-8 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
                      >
                        <CheckCircle2 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-gray-400"
                      >
                        <Pause className="h-4 w-4" />
                      </Button>
                    </>
                  )}
                  {item.status === 'completed' && (
                    <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center">
                      <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                    </div>
                  )}
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onRemoveItem?.(item.id)}
                    className="h-8 w-8 text-gray-300 hover:text-red-500 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </motion.div>
          )
        })}
      </div>
      
      {/* Upcoming Revision */}
      <div className="p-4 border-t border-gray-100 bg-amber-50/30">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <RotateCcw className="h-4 w-4 text-amber-600" />
            <h4 className="font-medium text-sm text-gray-900">Upcoming Revision</h4>
          </div>
          <Badge variant="outline" className="text-xs bg-amber-100 text-amber-700 border-amber-200">
            Spaced Repetition
          </Badge>
        </div>
        
        <div className="space-y-2">
          {mockRevision.slice(0, 2).map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between p-2 bg-white rounded-lg border border-gray-100"
            >
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">{item.title}</p>
                <div className="flex items-center gap-2 text-xs text-gray-500 mt-0.5">
                  <span>{item.subject}</span>
                  <span>•</span>
                  <span>{item.estimatedMinutes}m</span>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onAddItem?.()}
                className="ml-2"
              >
                <Plus className="h-3 w-3 mr-1" />
                Add
              </Button>
            </div>
          ))}
        </div>
      </div>
      
      {/* Break Reminder */}
      <AnimatePresence>
        {showBreakSuggestion && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-gray-900 to-gray-800 text-white"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
                <Coffee className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <p className="font-medium">{showBreakSuggestion.message}</p>
                <p className="text-sm text-white/60">You've been studying for {showBreakSuggestion.afterMinutes} minutes</p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowBreakSuggestion(null)}
                className="border-white/20 text-white hover:bg-white/10"
              >
                Dismiss
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  )
}

export default SmartScheduler
