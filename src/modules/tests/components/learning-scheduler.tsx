'use client'

import { useState, useMemo, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Calendar, 
  Clock, 
  Plus, 
  CheckCircle2, 
  XCircle,
  AlertCircle,
  Coffee,
  BookOpen,
  Timer,
  Bell,
  ChevronLeft,
  ChevronRight,
  Trash2,
  MoreVertical,
  Sparkles,
  Zap,
  Target,
  RefreshCw,
  Brain
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Input } from '@/components/ui/input'
import { cn } from '@/modules/tests/utils'
import { 
  FadeIn,
  AnimatedCounter,
  RingProgress,
  Shimmer
} from './motion'

// ============================================
// TYPES
// ============================================

interface StudyTask {
  id: string
  title: string
  subject: string
  type: 'practice' | 'revision' | 'test' | 'video' | 'reading'
  duration: number // minutes
  scheduledTime: Date
  status: 'pending' | 'in_progress' | 'completed' | 'skipped'
  priority: 'high' | 'medium' | 'low'
  repetitionSchedule?: RepetitionSchedule
}

interface RepetitionSchedule {
  nextReview: Date
  interval: number // days
  easeFactor: number
  repetitions: number
}

interface BreakSlot {
  id: string
  startTime: Date
  duration: number
  type: 'short' | 'long' | 'meal'
  suggested: boolean
}

interface DailyPlan {
  date: Date
  tasks: StudyTask[]
  breaks: BreakSlot[]
  totalStudyTime: number
  totalBreakTime: number
  completedTasks: number
}

// ============================================
// SMART LEARNING SCHEDULER
// ============================================

export function SmartLearningScheduler() {
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [showAddTask, setShowAddTask] = useState(false)
  const [viewMode, setViewMode] = useState<'day' | 'week'>('day')

  // Generate time slots
  const timeSlots = useMemo(() => {
    const slots = []
    for (let i = 6; i <= 22; i++) {
      slots.push(`${i.toString().padStart(2, '0')}:00`)
      if (i < 22) slots.push(`${i.toString().padStart(2, '0')}:30`)
    }
    return slots
  }, [])

  // Simulated daily plan
  const dailyPlan = useMemo<DailyPlan>(() => ({
    date: selectedDate,
    tasks: [
      {
        id: 'task-1',
        title: 'Integration Practice',
        subject: 'Mathematics',
        type: 'practice',
        duration: 45,
        scheduledTime: new Date(selectedDate.setHours(8, 0, 0, 0)),
        status: 'completed',
        priority: 'high',
        repetitionSchedule: {
          nextReview: new Date(Date.now() + 86400000),
          interval: 1,
          easeFactor: 2.5,
          repetitions: 2
        }
      },
      {
        id: 'task-2',
        title: 'Thermodynamics Revision',
        subject: 'Physics',
        type: 'revision',
        duration: 30,
        scheduledTime: new Date(selectedDate.setHours(9, 30, 0, 0)),
        status: 'completed',
        priority: 'medium',
        repetitionSchedule: {
          nextReview: new Date(Date.now() + 172800000),
          interval: 2,
          easeFactor: 2.6,
          repetitions: 3
        }
      },
      {
        id: 'task-3',
        title: 'Organic Chemistry Video',
        subject: 'Chemistry',
        type: 'video',
        duration: 25,
        scheduledTime: new Date(selectedDate.setHours(11, 0, 0, 0)),
        status: 'in_progress',
        priority: 'low'
      },
      {
        id: 'task-4',
        title: 'JEE Mock Test',
        subject: 'All',
        type: 'test',
        duration: 90,
        scheduledTime: new Date(selectedDate.setHours(14, 0, 0, 0)),
        status: 'pending',
        priority: 'high'
      },
      {
        id: 'task-5',
        title: 'Electrochemistry Notes',
        subject: 'Chemistry',
        type: 'reading',
        duration: 20,
        scheduledTime: new Date(selectedDate.setHours(16, 30, 0, 0)),
        status: 'pending',
        priority: 'medium',
        repetitionSchedule: {
          nextReview: new Date(Date.now() + 259200000),
          interval: 3,
          easeFactor: 2.4,
          repetitions: 1
        }
      }
    ],
    breaks: [
      { id: 'break-1', startTime: new Date(selectedDate.setHours(10, 15, 0, 0)), duration: 15, type: 'short', suggested: true },
      { id: 'break-2', startTime: new Date(selectedDate.setHours(12, 0, 0, 0)), duration: 45, type: 'meal', suggested: true },
      { id: 'break-3', startTime: new Date(selectedDate.setHours(15, 30, 0, 0)), duration: 20, type: 'short', suggested: true },
      { id: 'break-4', startTime: new Date(selectedDate.setHours(17, 30, 0, 0)), duration: 30, type: 'long', suggested: false }
    ],
    totalStudyTime: 210,
    totalBreakTime: 110,
    completedTasks: 2
  }), [selectedDate])

  // Repetition suggestions
  const repetitionSuggestions = useMemo(() => [
    { id: 'rep-1', title: 'Integration by Parts', subject: 'Mathematics', dueIn: '2h', urgency: 'high' },
    { id: 'rep-2', title: 'Rotational Motion', subject: 'Physics', dueIn: '1d', urgency: 'medium' },
    { id: 'rep-3', title: 'Organic Reactions', subject: 'Chemistry', dueIn: '2d', urgency: 'low' }
  ], [])

  // Progress percentage
  const progressPercent = useMemo(() => {
    return Math.round((dailyPlan.completedTasks / dailyPlan.tasks.length) * 100)
  }, [dailyPlan])

  // Navigate date
  const navigateDate = (direction: 'prev' | 'next') => {
    const newDate = new Date(selectedDate)
    newDate.setDate(newDate.getDate() + (direction === 'next' ? 1 : -1))
    setSelectedDate(newDate)
  }

  // Format time
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })
  }

  // Get task color
  const getTaskColor = (type: StudyTask['type']) => {
    const colors = {
      practice: 'from-blue-500 to-blue-600',
      revision: 'from-purple-500 to-purple-600',
      test: 'from-red-500 to-red-600',
      video: 'from-emerald-500 to-emerald-600',
      reading: 'from-amber-500 to-amber-600'
    }
    return colors[type]
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 shadow-lg shadow-emerald-500/20">
            <Calendar className="h-5 w-5 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">Study Scheduler</h2>
            <p className="text-sm text-gray-500">Smart planning with spaced repetition</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setViewMode(viewMode === 'day' ? 'week' : 'day')}
            className="border-emerald-200 hover:bg-emerald-50"
          >
            {viewMode === 'day' ? 'Week View' : 'Day View'}
          </Button>
          <Button 
            size="sm"
            className="bg-emerald-600 hover:bg-emerald-700"
            onClick={() => setShowAddTask(true)}
          >
            <Plus className="h-4 w-4 mr-1" />
            Add Task
          </Button>
        </div>
      </div>

      {/* Date Navigation */}
      <FadeIn>
        <Card className="border border-gray-200 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => navigateDate('prev')}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              
              <div className="text-center">
                <div className="text-lg font-semibold text-gray-900">
                  {selectedDate.toLocaleDateString('en-US', { weekday: 'long' })}
                </div>
                <div className="text-sm text-gray-500">
                  {selectedDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                </div>
              </div>
              
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => navigateDate('next')}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>

            {/* Progress Bar */}
            <div className="mt-4">
              <div className="flex items-center justify-between text-sm mb-2">
                <span className="text-gray-500">Daily Progress</span>
                <span className="font-medium text-gray-900">{dailyPlan.completedTasks}/{dailyPlan.tasks.length} tasks</span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${progressPercent}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>
            </div>

            {/* Time Stats */}
            <div className="grid grid-cols-3 gap-4 mt-4">
              <div className="text-center p-2 rounded-lg bg-emerald-50">
                <div className="text-lg font-bold text-emerald-600">{dailyPlan.totalStudyTime}m</div>
                <div className="text-xs text-gray-500">Study Time</div>
              </div>
              <div className="text-center p-2 rounded-lg bg-amber-50">
                <div className="text-lg font-bold text-amber-600">{dailyPlan.totalBreakTime}m</div>
                <div className="text-xs text-gray-500">Breaks</div>
              </div>
              <div className="text-center p-2 rounded-lg bg-purple-50">
                <div className="text-lg font-bold text-purple-600">{progressPercent}%</div>
                <div className="text-xs text-gray-500">Complete</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </FadeIn>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Schedule */}
        <div className="lg:col-span-2 space-y-4">
          {/* Tasks Timeline */}
          <Card className="border border-gray-200 shadow-sm">
            <CardHeader className="border-b border-gray-100 pb-3">
              <CardTitle className="text-base font-semibold text-gray-900 flex items-center gap-2">
                <Timer className="h-4 w-4 text-emerald-600" />
                Today's Schedule
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <div className="space-y-3">
                {dailyPlan.tasks.map((task, idx) => (
                  <TaskCard 
                    key={task.id} 
                    task={task} 
                    index={idx}
                    color={getTaskColor(task.type)}
                  />
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Break Suggestions */}
          <Card className="border border-gray-200 shadow-sm">
            <CardHeader className="border-b border-gray-100 pb-3">
              <CardTitle className="text-base font-semibold text-gray-900 flex items-center gap-2">
                <Coffee className="h-4 w-4 text-amber-600" />
                Suggested Breaks
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {dailyPlan.breaks.filter(b => b.suggested).map((breakItem, idx) => (
                  <motion.div
                    key={breakItem.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: idx * 0.05 }}
                    className="p-3 rounded-xl bg-amber-50 border border-amber-100 text-center"
                  >
                    <Coffee className="h-5 w-5 text-amber-600 mx-auto mb-1" />
                    <div className="text-sm font-medium text-gray-900">
                      {breakItem.duration}m {breakItem.type}
                    </div>
                    <div className="text-xs text-gray-500">
                      {formatTime(breakItem.startTime)}
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Repetition Due */}
          <Card className="border border-gray-200 shadow-sm">
            <CardHeader className="border-b border-gray-100 pb-3">
              <CardTitle className="text-base font-semibold text-gray-900 flex items-center gap-2">
                <RefreshCw className="h-4 w-4 text-purple-600" />
                Due for Review
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-3">
              {repetitionSuggestions.map((item, idx) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="flex items-center gap-3 p-3 rounded-lg border border-gray-100 hover:border-purple-200 hover:bg-purple-50/30 transition-colors cursor-pointer"
                >
                  <div className={cn(
                    "w-2 h-8 rounded-full",
                    item.urgency === 'high' ? 'bg-red-500' :
                    item.urgency === 'medium' ? 'bg-amber-500' : 'bg-gray-300'
                  )} />
                  <div className="flex-1">
                    <div className="font-medium text-gray-900 text-sm">{item.title}</div>
                    <div className="text-xs text-gray-500">{item.subject}</div>
                  </div>
                  <div className="text-xs text-gray-400">Due: {item.dueIn}</div>
                </motion.div>
              ))}
              
              <Button variant="outline" className="w-full mt-2 border-purple-200 hover:bg-purple-50">
                <RefreshCw className="h-4 w-4 mr-2" />
                Start Review Session
              </Button>
            </CardContent>
          </Card>

          {/* AI Planning Assistant */}
          <Card className="bg-gradient-to-br from-purple-600 to-indigo-600 text-white border-0 shadow-lg shadow-purple-500/20">
            <CardContent className="p-5">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-lg bg-white/20">
                  <Sparkles className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-semibold">AI Planner</h3>
                  <p className="text-xs text-purple-200">Optimize your schedule</p>
                </div>
              </div>
              
              <div className="space-y-3 text-sm">
                <div className="p-3 rounded-lg bg-white/10 backdrop-blur-sm">
                  <div className="font-medium mb-1">Suggestion</div>
                  <p className="text-purple-100 text-xs">
                    Based on your performance, add 15m of Integration practice before your mock test.
                  </p>
                </div>
                
                <div className="flex gap-2">
                  <Button size="sm" className="flex-1 bg-white text-purple-600 hover:bg-purple-50">
                    Accept
                  </Button>
                  <Button size="sm" variant="outline" className="flex-1 border-white/30 text-white hover:bg-white/10">
                    Ignore
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card className="border border-gray-200 shadow-sm">
            <CardContent className="p-4 space-y-2">
              <Button variant="outline" className="w-full justify-start border-gray-200 hover:bg-emerald-50 hover:border-emerald-200">
                <Target className="h-4 w-4 mr-3 text-emerald-600" />
                Quick Practice (10m)
              </Button>
              <Button variant="outline" className="w-full justify-start border-gray-200 hover:bg-blue-50 hover:border-blue-200">
                <BookOpen className="h-4 w-4 mr-3 text-blue-600" />
                Revision Session
              </Button>
              <Button variant="outline" className="w-full justify-start border-gray-200 hover:bg-purple-50 hover:border-purple-200">
                <Zap className="h-4 w-4 mr-3 text-purple-600" />
                Speed Test
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

// ============================================
// TASK CARD
// ============================================

interface TaskCardProps {
  task: StudyTask
  index: number
  color: string
}

function TaskCard({ task, index, color }: TaskCardProps) {
  const statusIcons = {
    pending: <Clock className="h-4 w-4 text-gray-400" />,
    in_progress: <Timer className="h-4 w-4 text-blue-500 animate-pulse" />,
    completed: <CheckCircle2 className="h-4 w-4 text-emerald-500" />,
    skipped: <XCircle className="h-4 w-4 text-gray-400" />
  }

  const typeIcons = {
    practice: <Target className="h-4 w-4" />,
    revision: <BookOpen className="h-4 w-4" />,
    test: <Zap className="h-4 w-4" />,
    video: <BookOpen className="h-4 w-4" />,
    reading: <BookOpen className="h-4 w-4" />
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05 }}
      className={cn(
        "flex items-center gap-4 p-3 rounded-xl border transition-all cursor-pointer",
        task.status === 'completed' ? 'bg-gray-50 border-gray-200 opacity-60' :
        task.status === 'in_progress' ? 'bg-blue-50 border-blue-200' :
        'bg-white border-gray-200 hover:border-emerald-200 hover:shadow-sm'
      )}
    >
      {/* Status */}
      <div className="flex-shrink-0">
        {statusIcons[task.status]}
      </div>

      {/* Time */}
      <div className="flex-shrink-0 w-14 text-sm text-gray-500">
        {task.scheduledTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })}
      </div>

      {/* Type Badge */}
      <div className={cn(
        "p-2 rounded-lg bg-gradient-to-br text-white",
        color
      )}>
        {typeIcons[task.type]}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <h4 className={cn(
            "font-medium truncate",
            task.status === 'completed' ? 'text-gray-500 line-through' : 'text-gray-900'
          )}>
            {task.title}
          </h4>
          {task.repetitionSchedule && (
            <Badge variant="outline" className="text-xs border-purple-200 text-purple-600">
              SM-2
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <span>{task.subject}</span>
          <span>•</span>
          <span>{task.duration}m</span>
          {task.priority === 'high' && (
            <>
              <span>•</span>
              <Badge className="text-xs bg-red-100 text-red-600 border-0">High</Badge>
            </>
          )}
        </div>
      </div>

      {/* Actions */}
      {task.status !== 'completed' && (
        <Button size="sm" variant="ghost" className="opacity-0 group-hover:opacity-100">
          <MoreVertical className="h-4 w-4" />
        </Button>
      )}
    </motion.div>
  )
}
