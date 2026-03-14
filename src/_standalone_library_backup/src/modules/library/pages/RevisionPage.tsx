'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Skeleton } from '@/components/ui/skeleton'
import { ScrollArea } from '@/components/ui/scroll-area'
import { cn } from '@/lib/utils'
import {
  RotateCcw,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  Flame,
  ChevronRight,
  BookOpen,
  Bell,
  Settings,
} from 'lucide-react'
import type { LibraryResource } from '../types'

interface RevisionPageProps {
  resources: LibraryResource[]
  gamificationData: any
  isLoading: boolean
  onResourceClick: (resource: LibraryResource) => void
}

export function RevisionPage({
  resources,
  gamificationData,
  isLoading,
  onResourceClick,
}: RevisionPageProps) {
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list')

  // Mock revision data - would come from API in production
  const revisionItems = [
    { 
      id: 'r1', 
      title: 'Electrostatics - Coulomb\'s Law', 
      subject: 'Physics',
      dueDate: new Date(),
      status: 'due',
      interval: 1,
      confidence: 45,
    },
    { 
      id: 'r2', 
      title: 'Organic Chemistry - Reaction Mechanisms', 
      subject: 'Chemistry',
      dueDate: new Date(Date.now() - 86400000), // Yesterday
      status: 'overdue',
      interval: 3,
      confidence: 60,
    },
    { 
      id: 'r3', 
      title: 'Calculus - Integration Techniques', 
      subject: 'Mathematics',
      dueDate: new Date(Date.now() + 86400000), // Tomorrow
      status: 'upcoming',
      interval: 7,
      confidence: 75,
    },
    { 
      id: 'r4', 
      title: 'Thermodynamics - Laws', 
      subject: 'Physics',
      dueDate: new Date(Date.now() + 2 * 86400000),
      status: 'upcoming',
      interval: 14,
      confidence: 80,
    },
  ]

  // Stats
  const dueToday = revisionItems.filter(r => r.status === 'due').length
  const overdue = revisionItems.filter(r => r.status === 'overdue').length
  const streak = gamificationData?.streak?.currentStreak || 0

  if (isLoading) {
    return <LoadingState />
  }

  return (
    <div className="p-4 md:p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Spaced Repetition</h1>
        <p className="text-gray-500">Review at optimal intervals for long-term retention</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <Card className="p-4 bg-white border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
              <Clock className="h-5 w-5 text-blue-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{dueToday}</p>
              <p className="text-xs text-gray-500">Due Today</p>
            </div>
          </div>
        </Card>
        <Card className="p-4 bg-white border-gray-100">
          <div className="flex items-center gap-3">
            <div className={cn(
              'w-10 h-10 rounded-xl flex items-center justify-center',
              overdue > 0 ? 'bg-red-50' : 'bg-gray-50'
            )}>
              <AlertTriangle className={cn(
                'h-5 w-5',
                overdue > 0 ? 'text-red-500' : 'text-gray-400'
              )} />
            </div>
            <div>
              <p className={cn(
                'text-2xl font-bold',
                overdue > 0 ? 'text-red-600' : 'text-gray-900'
              )}>{overdue}</p>
              <p className="text-xs text-gray-500">Overdue</p>
            </div>
          </div>
        </Card>
        <Card className="p-4 bg-white border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center">
              <Flame className="h-5 w-5 text-orange-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{streak}</p>
              <p className="text-xs text-gray-500">Day Streak</p>
            </div>
          </div>
        </Card>
      </div>

      {/* View Toggle */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Button
            variant={viewMode === 'list' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('list')}
            className="gap-2"
          >
            <Clock className="h-4 w-4" />
            List
          </Button>
          <Button
            variant={viewMode === 'calendar' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('calendar')}
            className="gap-2"
          >
            <Calendar className="h-4 w-4" />
            Calendar
          </Button>
        </div>
        <Button variant="ghost" size="sm" className="gap-2 text-gray-500">
          <Settings className="h-4 w-4" />
          Settings
        </Button>
      </div>

      {/* Revision List */}
      {viewMode === 'list' ? (
        <div className="space-y-3">
          {/* Overdue */}
          {revisionItems.filter(r => r.status === 'overdue').length > 0 && (
            <div className="mb-4">
              <h3 className="text-sm font-medium text-red-600 mb-2 flex items-center gap-2">
                <AlertTriangle className="h-4 w-4" />
                Overdue
              </h3>
              {revisionItems.filter(r => r.status === 'overdue').map((item, index) => (
                <RevisionCard
                  key={item.id}
                  item={item}
                  index={index}
                  onClick={() => onResourceClick(resources[0])}
                  variant="overdue"
                />
              ))}
            </div>
          )}

          {/* Due Today */}
          <div className="mb-4">
            <h3 className="text-sm font-medium text-gray-900 mb-2 flex items-center gap-2">
              <Bell className="h-4 w-4 text-blue-500" />
              Due Today
            </h3>
            {revisionItems.filter(r => r.status === 'due').length === 0 ? (
              <Card className="p-6 bg-gray-50 border-gray-100 text-center">
                <CheckCircle2 className="h-8 w-8 text-emerald-500 mx-auto mb-2" />
                <p className="text-gray-600">All caught up for today!</p>
              </Card>
            ) : (
              revisionItems.filter(r => r.status === 'due').map((item, index) => (
                <RevisionCard
                  key={item.id}
                  item={item}
                  index={index}
                  onClick={() => onResourceClick(resources[0])}
                  variant="due"
                />
              ))
            )}
          </div>

          {/* Upcoming */}
          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-2">Upcoming</h3>
            {revisionItems.filter(r => r.status === 'upcoming').map((item, index) => (
              <RevisionCard
                key={item.id}
                item={item}
                index={index}
                onClick={() => onResourceClick(resources[0])}
                variant="upcoming"
              />
            ))}
          </div>
        </div>
      ) : (
        <CalendarView items={revisionItems} />
      )}
    </div>
  )
}

// Revision Card
function RevisionCard({
  item,
  index,
  onClick,
  variant,
}: {
  item: any
  index: number
  onClick: () => void
  variant: 'overdue' | 'due' | 'upcoming'
}) {
  const variantStyles = {
    overdue: {
      card: 'border-red-200 bg-red-50/50',
      badge: 'bg-red-100 text-red-700',
      indicator: 'bg-red-500',
    },
    due: {
      card: 'border-blue-200 bg-blue-50/50',
      badge: 'bg-blue-100 text-blue-700',
      indicator: 'bg-blue-500',
    },
    upcoming: {
      card: 'border-gray-100 bg-white',
      badge: 'bg-gray-100 text-gray-700',
      indicator: 'bg-gray-300',
    },
  }

  const styles = variantStyles[variant]

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05 }}
    >
      <Card
        onClick={onClick}
        className={cn(
          'p-4 mb-2 cursor-pointer transition-all hover:shadow-md',
          styles.card
        )}
      >
        <div className="flex items-center gap-4">
          <div className={cn('w-1 h-12 rounded-full', styles.indicator)} />
          <div className="flex-1 min-w-0">
            <h4 className="font-medium text-gray-900 truncate">{item.title}</h4>
            <p className="text-sm text-gray-500">{item.subject}</p>
          </div>
          <div className="flex items-center gap-3 flex-shrink-0">
            <Badge variant="outline" className={styles.badge}>
              {item.interval}d interval
            </Badge>
            <div className="text-right">
              <p className="text-sm font-medium text-gray-900">{item.confidence}%</p>
              <p className="text-xs text-gray-400">confidence</p>
            </div>
            <ChevronRight className="h-5 w-5 text-gray-300" />
          </div>
        </div>
      </Card>
    </motion.div>
  )
}

// Calendar View
function CalendarView({ items }: { items: any[] }) {
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  const today = new Date()
  const weekDates = Array.from({ length: 7 }, (_, i) => {
    const date = new Date(today)
    date.setDate(today.getDate() + i - 3)
    return date
  })

  return (
    <Card className="p-4 bg-white border-gray-100">
      <div className="grid grid-cols-7 gap-1 mb-2">
        {days.map((day) => (
          <div key={day} className="text-center text-xs text-gray-500 font-medium py-2">
            {day}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {weekDates.map((date, index) => {
          const isToday = date.toDateString() === today.toDateString()
          const dayItems = items.filter(
            (item) => new Date(item.dueDate).toDateString() === date.toDateString()
          )
          const hasOverdue = dayItems.some((i) => i.status === 'overdue')

          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.03 }}
              className={cn(
                'min-h-24 p-2 rounded-lg border transition-colors',
                isToday ? 'border-blue-500 bg-blue-50' : 'border-gray-100',
                hasOverdue && 'border-red-200 bg-red-50'
              )}
            >
              <p className={cn(
                'text-sm font-medium mb-1',
                isToday ? 'text-blue-600' : 'text-gray-600'
              )}>
                {date.getDate()}
              </p>
              {dayItems.map((item) => (
                <div
                  key={item.id}
                  className={cn(
                    'text-xs p-1 rounded mb-1 truncate',
                    item.status === 'overdue'
                      ? 'bg-red-100 text-red-700'
                      : item.status === 'due'
                      ? 'bg-blue-100 text-blue-700'
                      : 'bg-gray-100 text-gray-600'
                  )}
                >
                  {item.title.substring(0, 10)}...
                </div>
              ))}
            </motion.div>
          )
        })}
      </div>
    </Card>
  )
}

// Loading State
function LoadingState() {
  return (
    <div className="p-4 md:p-6 max-w-4xl mx-auto">
      <Skeleton className="h-8 w-48 mb-2" />
      <Skeleton className="h-5 w-64 mb-6" />
      <div className="grid grid-cols-3 gap-3 mb-6">
        <Skeleton className="h-20 rounded-xl" />
        <Skeleton className="h-20 rounded-xl" />
        <Skeleton className="h-20 rounded-xl" />
      </div>
      <div className="space-y-3">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-16 rounded-xl" />
        ))}
      </div>
    </div>
  )
}

export default RevisionPage
