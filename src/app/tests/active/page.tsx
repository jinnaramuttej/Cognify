'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { 
  GraduationCap, ChevronLeft, Clock, Play, 
  Calendar, AlertCircle, CheckCircle, Timer,
  BookOpen, Pause
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { cn } from '@/modules/tests/utils'

// ============================================
// DESIGN SYSTEM
// ============================================

const DESIGN = {
  colors: {
    primary: '#2563EB',
    success: '#10B981',
    warning: '#F59E0B',
    error: '#EF4444',
  },
  status: {
    ongoing: { color: '#2563EB', bg: 'bg-blue-50', border: 'border-blue-200', label: 'In Progress' },
    assigned: { color: '#F59E0B', bg: 'bg-amber-50', border: 'border-amber-200', label: 'Assigned' },
    upcoming: { color: '#6B7280', bg: 'bg-gray-50', border: 'border-gray-200', label: 'Upcoming' },
    paused: { color: '#8B5CF6', bg: 'bg-purple-50', border: 'border-purple-200', label: 'Paused' },
  }
}

// ============================================
// TEST CARD COMPONENT
// ============================================

interface TestCardProps {
  test: {
    id: string
    name: string
    subject: string
    status: 'ongoing' | 'assigned' | 'upcoming' | 'paused'
    progress?: number
    totalQuestions: number
    answeredQuestions?: number
    timeLimit: number
    remainingTime?: number
    scheduledAt?: string
    endsAt?: string
  }
}

function TestCard({ test }: TestCardProps) {
  const statusConfig = DESIGN.status[test.status]
  const progressPercent = test.progress || (test.answeredQuestions && test.totalQuestions 
    ? (test.answeredQuestions / test.totalQuestions) * 100 
    : 0)

  const formatTime = (minutes: number) => {
    if (minutes >= 60) {
      const hrs = Math.floor(minutes / 60)
      const mins = minutes % 60
      return `${hrs}h ${mins}m`
    }
    return `${minutes}m`
  }

  const formatRemaining = (minutes: number) => {
    if (minutes <= 0) return 'Expired'
    if (minutes < 60) return `${minutes}m left`
    const hrs = Math.floor(minutes / 60)
    const mins = minutes % 60
    return `${hrs}h ${mins}m left`
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "p-4 rounded-xl border-2 transition-all",
        statusConfig.bg,
        statusConfig.border
      )}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-semibold text-gray-900">{test.name}</h3>
            <Badge 
              variant="outline"
              className="text-xs"
              style={{ 
                backgroundColor: `${statusConfig.color}15`,
                borderColor: statusConfig.color,
                color: statusConfig.color
              }}
            >
              {statusConfig.label}
            </Badge>
          </div>
          <div className="flex items-center gap-3 text-sm text-gray-500">
            <span className="flex items-center gap-1">
              <BookOpen className="h-3.5 w-3.5" />
              {test.subject}
            </span>
            <span className="flex items-center gap-1">
              <Timer className="h-3.5 w-3.5" />
              {formatTime(test.timeLimit)}
            </span>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      {(test.status === 'ongoing' || test.status === 'paused') && test.answeredQuestions !== undefined && (
        <div className="mb-3">
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="text-gray-500">
              {test.answeredQuestions}/{test.totalQuestions} questions
            </span>
            <span className="font-medium text-gray-700">
              {Math.round(progressPercent)}%
            </span>
          </div>
          <Progress value={progressPercent} className="h-2" />
        </div>
      )}

      {/* Time Info */}
      <div className="flex items-center justify-between">
        {test.remainingTime && (
          <div className="text-sm">
            {test.remainingTime > 0 ? (
              <span className="flex items-center gap-1 text-amber-600">
                <Clock className="h-4 w-4" />
                {formatRemaining(test.remainingTime)}
              </span>
            ) : (
              <span className="text-red-600 font-medium">Time expired</span>
            )}
          </div>
        )}

        {test.scheduledAt && (
          <div className="text-sm text-gray-500 flex items-center gap-1">
            <Calendar className="h-4 w-4" />
            Starts {test.scheduledAt}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          {test.status === 'ongoing' && (
            <Link href={`/tests/${test.id}`}>
              <Button size="sm" className="bg-blue-600 hover:bg-blue-700 gap-1">
                <Play className="h-3.5 w-3.5" />
                Resume
              </Button>
            </Link>
          )}

          {test.status === 'paused' && (
            <Link href={`/tests/${test.id}`}>
              <Button size="sm" className="bg-purple-600 hover:bg-purple-700 gap-1">
                <Play className="h-3.5 w-3.5" />
                Continue
              </Button>
            </Link>
          )}

          {test.status === 'assigned' && (
            <Link href={`/tests/${test.id}`}>
              <Button size="sm" className="bg-amber-600 hover:bg-amber-700 gap-1">
                <Play className="h-3.5 w-3.5" />
                Start
              </Button>
            </Link>
          )}

          {test.status === 'upcoming' && (
            <Button size="sm" variant="outline" disabled>
              <Calendar className="h-3.5 w-3.5 mr-1" />
              Scheduled
            </Button>
          )}
        </div>
      </div>
    </motion.div>
  )
}

// ============================================
// EMPTY STATE COMPONENT
// ============================================

function EmptyState({ type }: { type: 'ongoing' | 'assigned' | 'upcoming' }) {
  const messages = {
    ongoing: {
      icon: Play,
      title: 'No ongoing tests',
      description: 'Start a test to see it here',
      action: 'Create Test',
      href: '/tests/create',
    },
    assigned: {
      icon: Calendar,
      title: 'No assigned tests',
      description: 'Tests assigned by your teacher will appear here',
      action: null,
      href: null,
    },
    upcoming: {
      icon: Clock,
      title: 'No upcoming tests',
      description: 'Scheduled tests will appear here',
      action: null,
      href: null,
    },
  }

  const config = messages[type]
  const Icon = config.icon

  return (
    <div className="text-center py-12">
      <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
        <Icon className="h-8 w-8 text-gray-400" />
      </div>
      <h3 className="font-medium text-gray-900 mb-1">{config.title}</h3>
      <p className="text-sm text-gray-500 mb-4">{config.description}</p>
      {config.action && config.href && (
        <Link href={config.href}>
          <Button>{config.action}</Button>
        </Link>
      )}
    </div>
  )
}

// ============================================
// MAIN ACTIVE TESTS PAGE
// ============================================

export default function ActiveTestsPage() {
  // Mock data
  const [ongoingTests] = useState([
    {
      id: 'test-1',
      name: 'JEE Main Physics Mock 3',
      subject: 'Physics',
      status: 'ongoing' as const,
      totalQuestions: 30,
      answeredQuestions: 14,
      timeLimit: 60,
      remainingTime: 45,
    },
  ])

  const [assignedTests] = useState([
    {
      id: 'test-2',
      name: 'Weekly Chemistry Quiz',
      subject: 'Chemistry',
      status: 'assigned' as const,
      totalQuestions: 25,
      timeLimit: 45,
      remainingTime: 1440, // 24 hours in minutes
    },
  ])

  const [upcomingTests] = useState([
    {
      id: 'test-3',
      name: 'NEET Biology Grand Test',
      subject: 'Biology',
      status: 'upcoming' as const,
      totalQuestions: 50,
      timeLimit: 90,
      scheduledAt: 'Tomorrow, 10:00 AM',
    },
  ])

  return (
    <div className="bg-transparent">
      {/* Header */}

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <Tabs defaultValue="ongoing" className="space-y-6">
          <TabsList className="bg-white border border-gray-200 p-1 rounded-lg">
            <TabsTrigger 
              value="ongoing"
              className="data-[state=active]:bg-blue-600 data-[state=active]:text-white"
            >
              Ongoing ({ongoingTests.length})
            </TabsTrigger>
            <TabsTrigger 
              value="assigned"
              className="data-[state=active]:bg-blue-600 data-[state=active]:text-white"
            >
              Assigned ({assignedTests.length})
            </TabsTrigger>
            <TabsTrigger 
              value="upcoming"
              className="data-[state=active]:bg-blue-600 data-[state=active]:text-white"
            >
              Upcoming ({upcomingTests.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="ongoing" className="space-y-4">
            {ongoingTests.length > 0 ? (
              ongoingTests.map((test) => (
                <TestCard key={test.id} test={test} />
              ))
            ) : (
              <EmptyState type="ongoing" />
            )}
          </TabsContent>

          <TabsContent value="assigned" className="space-y-4">
            {assignedTests.length > 0 ? (
              assignedTests.map((test) => (
                <TestCard key={test.id} test={test} />
              ))
            ) : (
              <EmptyState type="assigned" />
            )}
          </TabsContent>

          <TabsContent value="upcoming" className="space-y-4">
            {upcomingTests.length > 0 ? (
              upcomingTests.map((test) => (
                <TestCard key={test.id} test={test} />
              ))
            ) : (
              <EmptyState type="upcoming" />
            )}
          </TabsContent>
        </Tabs>

        {/* Quick Stats */}
        <Card className="mt-8 bg-white border border-gray-200 rounded-xl shadow-sm">
          <CardContent className="p-4">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-blue-600">{ongoingTests.length}</div>
                <div className="text-xs text-gray-500">In Progress</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-amber-600">{assignedTests.length}</div>
                <div className="text-xs text-gray-500">Pending</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-600">{upcomingTests.length}</div>
                <div className="text-xs text-gray-500">Scheduled</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
