'use client'

import { useState, useCallback, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Users, 
  BookOpen, 
  Calendar, 
  Clock, 
  BarChart3, 
  Settings,
  Plus,
  Search,
  Filter,
  MoreVertical,
  Eye,
  Edit3,
  Trash2,
  Copy,
  Send,
  FileText,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  ChevronDown,
  Download,
  Upload,
  Shield
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select'
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu'
import { Progress } from '@/components/ui/progress'
import { cn } from '@/modules/tests/utils'
import { 
  FadeIn, 
  StaggerContainer, 
  StaggerItem,
  AnimatedCounter,
  RingProgress
} from './motion'
import type { Test, TestStatus, ScheduledTest, Cohort } from '@/modules/tests/types'

// ============================================
// TEACHER DASHBOARD - Main Component
// ============================================

interface TeacherDashboardProps {
  tests?: Test[]
  cohorts?: Cohort[]
  scheduledTests?: ScheduledTest[]
}

export function TeacherDashboard({ 
  tests = [], 
  cohorts = [],
  scheduledTests = []
}: TeacherDashboardProps) {
  const [activeTab, setActiveTab] = useState('overview')
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')

  // Mock data for demonstration
  const stats = {
    totalTests: 24,
    activeTests: 8,
    totalStudents: 156,
    avgScore: 72.5,
    testsThisWeek: 5,
    pendingReviews: 12
  }

  const filteredTests = useMemo(() => {
    return tests.filter(test => {
      const matchesSearch = test.name.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesStatus = statusFilter === 'all' || test.status === statusFilter
      return matchesSearch && matchesStatus
    })
  }, [tests, searchQuery, statusFilter])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <motion.h1 
            className="text-2xl font-bold text-gray-900"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            Teacher Dashboard
          </motion.h1>
          <motion.p 
            className="text-gray-500 mt-1"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
          >
            Manage tests, cohorts, and student performance
          </motion.p>
        </div>
        <motion.div 
          className="flex gap-3"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <Button variant="outline" className="border-gray-200">
            <Upload className="h-4 w-4 mr-2" />
            Import
          </Button>
          <Button className="bg-blue-600 hover:bg-blue-700">
            <Plus className="h-4 w-4 mr-2" />
            Create Test
          </Button>
        </motion.div>
      </div>

      {/* Stats Grid */}
      <StaggerContainer className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        <StaggerItem>
          <StatCard
            icon={<FileText className="h-4 w-4" />}
            label="Total Tests"
            value={stats.totalTests}
            color="blue"
          />
        </StaggerItem>
        <StaggerItem>
          <StatCard
            icon={<CheckCircle2 className="h-4 w-4" />}
            label="Active"
            value={stats.activeTests}
            color="emerald"
          />
        </StaggerItem>
        <StaggerItem>
          <StatCard
            icon={<Users className="h-4 w-4" />}
            label="Students"
            value={stats.totalStudents}
            color="purple"
          />
        </StaggerItem>
        <StaggerItem>
          <StatCard
            icon={<TrendingUp className="h-4 w-4" />}
            label="Avg Score"
            value={`${stats.avgScore}%`}
            color="amber"
          />
        </StaggerItem>
        <StaggerItem>
          <StatCard
            icon={<Calendar className="h-4 w-4" />}
            label="This Week"
            value={stats.testsThisWeek}
            color="cyan"
          />
        </StaggerItem>
        <StaggerItem>
          <StatCard
            icon={<AlertCircle className="h-4 w-4" />}
            label="Reviews"
            value={stats.pendingReviews}
            color="rose"
          />
        </StaggerItem>
      </StaggerContainer>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-white border border-gray-200 p-1 h-auto">
          <TabsTrigger 
            value="overview"
            className="data-[state=active]:bg-blue-600 data-[state=active]:text-white text-sm px-4 py-2"
          >
            Overview
          </TabsTrigger>
          <TabsTrigger 
            value="tests"
            className="data-[state=active]:bg-blue-600 data-[state=active]:text-white text-sm px-4 py-2"
          >
            My Tests
          </TabsTrigger>
          <TabsTrigger 
            value="cohorts"
            className="data-[state=active]:bg-blue-600 data-[state=active]:text-white text-sm px-4 py-2"
          >
            Cohorts
          </TabsTrigger>
          <TabsTrigger 
            value="schedule"
            className="data-[state=active]:bg-blue-600 data-[state=active]:text-white text-sm px-4 py-2"
          >
            Schedule
          </TabsTrigger>
          <TabsTrigger 
            value="analytics"
            className="data-[state=active]:bg-blue-600 data-[state=active]:text-white text-sm px-4 py-2"
          >
            Analytics
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-6 space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Recent Tests */}
            <Card className="lg:col-span-2 border border-gray-200 shadow-sm">
              <CardHeader className="border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white pb-4">
                <CardTitle className="text-base font-semibold text-gray-900 flex items-center gap-2">
                  <BookOpen className="h-4 w-4 text-blue-600" />
                  Recent Tests
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <div className="space-y-3">
                  {[
                    { name: 'JEE Physics - Mechanics', status: 'active', attempts: 45, avg: 68 },
                    { name: 'NEET Biology - Physiology', status: 'active', attempts: 32, avg: 74 },
                    { name: 'JEE Chemistry - Organic', status: 'upcoming', attempts: 0, avg: 0 },
                    { name: 'Math Integration Practice', status: 'closed', attempts: 28, avg: 71 },
                  ].map((test, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      className="flex items-center gap-4 p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex-1">
                        <div className="font-medium text-gray-900">{test.name}</div>
                        <div className="text-sm text-gray-500">{test.attempts} attempts</div>
                      </div>
                      <Badge 
                        variant="outline"
                        className={cn(
                          test.status === 'active' && 'border-emerald-500 text-emerald-600',
                          test.status === 'upcoming' && 'border-blue-500 text-blue-600',
                          test.status === 'closed' && 'border-gray-400 text-gray-500'
                        )}
                      >
                        {test.status}
                      </Badge>
                      {test.avg > 0 && (
                        <div className="text-sm font-semibold text-gray-700">{test.avg}%</div>
                      )}
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="border border-gray-200 shadow-sm">
              <CardHeader className="border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white pb-4">
                <CardTitle className="text-base font-semibold text-gray-900 flex items-center gap-2">
                  <Settings className="h-4 w-4 text-blue-600" />
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 space-y-3">
                <Button variant="outline" className="w-full justify-start border-gray-200 hover:bg-blue-50 hover:border-blue-200">
                  <Plus className="h-4 w-4 mr-3" />
                  Create New Test
                </Button>
                <Button variant="outline" className="w-full justify-start border-gray-200 hover:bg-blue-50 hover:border-blue-200">
                  <Upload className="h-4 w-4 mr-3" />
                  Import Questions
                </Button>
                <Button variant="outline" className="w-full justify-start border-gray-200 hover:bg-blue-50 hover:border-blue-200">
                  <Users className="h-4 w-4 mr-3" />
                  Manage Cohorts
                </Button>
                <Button variant="outline" className="w-full justify-start border-gray-200 hover:bg-blue-50 hover:border-blue-200">
                  <Shield className="h-4 w-4 mr-3" />
                  Schedule Proctored Exam
                </Button>
                <Button variant="outline" className="w-full justify-start border-gray-200 hover:bg-blue-50 hover:border-blue-200">
                  <Download className="h-4 w-4 mr-3" />
                  Export Results
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Performance Overview */}
          <Card className="border border-gray-200 shadow-sm">
            <CardHeader className="border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white pb-4">
              <CardTitle className="text-base font-semibold text-gray-900 flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-blue-600" />
                Subject Performance Overview
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {[
                  { subject: 'Physics', avg: 72, trend: '+5%', color: '#2563EB' },
                  { subject: 'Chemistry', avg: 68, trend: '+2%', color: '#10B981' },
                  { subject: 'Mathematics', avg: 75, trend: '+8%', color: '#8B5CF6' },
                  { subject: 'Biology', avg: 81, trend: '+3%', color: '#F59E0B' },
                ].map((item, idx) => (
                  <motion.div
                    key={item.subject}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: idx * 0.1 }}
                    className="text-center"
                  >
                    <RingProgress 
                      progress={item.avg} 
                      size={80}
                      strokeWidth={6}
                      color={item.color}
                    />
                    <div className="mt-2 font-semibold text-gray-900">{item.subject}</div>
                    <div className="text-sm text-emerald-600">{item.trend}</div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tests" className="mt-6">
          {/* Search and Filter */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search tests..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 border-gray-200"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-48 border-gray-200">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="upcoming">Upcoming</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="closed">Closed</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Tests Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { id: '1', name: 'JEE Physics Complete', status: 'active', questions: 30, time: 60, attempts: 45 },
              { id: '2', name: 'NEET Biology Revision', status: 'active', questions: 50, time: 45, attempts: 32 },
              { id: '3', name: 'Chemistry Organic', status: 'upcoming', questions: 25, time: 30, attempts: 0 },
              { id: '4', name: 'Math Integration', status: 'draft', questions: 20, time: 40, attempts: 0 },
              { id: '5', name: 'Physics Mechanics', status: 'closed', questions: 40, time: 90, attempts: 28 },
              { id: '6', name: 'JEE Main Mock', status: 'upcoming', questions: 90, time: 180, attempts: 0 },
            ].map((test, idx) => (
              <motion.div
                key={test.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
              >
                <TestManagementCard test={test as unknown as Test} />
              </motion.div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="cohorts" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { id: '1', name: 'JEE 2024 Batch A', students: 45, tests: 12, avgScore: 72 },
              { id: '2', name: 'NEET 2024 Regular', students: 38, tests: 8, avgScore: 68 },
              { id: '3', name: 'JEE Advanced', students: 22, tests: 15, avgScore: 78 },
              { id: '4', name: 'Board Exam Prep', students: 51, tests: 6, avgScore: 75 },
            ].map((cohort, idx) => (
              <motion.div
                key={cohort.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.05 }}
              >
                <Card className="border border-gray-200 shadow-sm hover:shadow-md hover:border-blue-200 transition-all duration-200">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-blue-100">
                          <Users className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                          <div className="font-semibold text-gray-900">{cohort.name}</div>
                          <div className="text-sm text-gray-500">{cohort.students} students</div>
                        </div>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem><Eye className="h-4 w-4 mr-2" /> View Details</DropdownMenuItem>
                          <DropdownMenuItem><Edit3 className="h-4 w-4 mr-2" /> Edit</DropdownMenuItem>
                          <DropdownMenuItem><Send className="h-4 w-4 mr-2" /> Schedule Test</DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-red-600"><Trash2 className="h-4 w-4 mr-2" /> Delete</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div className="p-2 rounded-lg bg-gray-50">
                        <div className="text-gray-500">Tests</div>
                        <div className="font-semibold text-gray-900">{cohort.tests}</div>
                      </div>
                      <div className="p-2 rounded-lg bg-gray-50">
                        <div className="text-gray-500">Avg Score</div>
                        <div className="font-semibold text-gray-900">{cohort.avgScore}%</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="schedule" className="mt-6">
          <Card className="border border-gray-200 shadow-sm">
            <CardHeader className="border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-semibold text-gray-900 flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-blue-600" />
                  Scheduled Tests
                </CardTitle>
                <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                  <Plus className="h-4 w-4 mr-2" />
                  Schedule New
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                {[
                  { test: 'JEE Physics Final', cohort: 'JEE 2024 Batch A', date: '2024-01-15', time: '10:00 AM', proctored: true },
                  { test: 'NEET Biology Mock', cohort: 'NEET 2024 Regular', date: '2024-01-16', time: '2:00 PM', proctored: false },
                  { test: 'Math Practice', cohort: 'JEE Advanced', date: '2024-01-17', time: '9:00 AM', proctored: true },
                ].map((schedule, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="flex items-center gap-4 p-4 rounded-xl border border-gray-200 hover:border-blue-200 hover:bg-blue-50/30 transition-all duration-200"
                  >
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
                        <Calendar className="h-6 w-6 text-blue-600" />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-gray-900">{schedule.test}</div>
                      <div className="text-sm text-gray-500">{schedule.cohort}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium text-gray-900">{schedule.date}</div>
                      <div className="text-sm text-gray-500">{schedule.time}</div>
                    </div>
                    {schedule.proctored && (
                      <Badge className="bg-amber-100 text-amber-700 border-amber-200">
                        <Shield className="h-3 w-3 mr-1" />
                        Proctored
                      </Badge>
                    )}
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="mt-6">
          <Card className="border border-gray-200 shadow-sm">
            <CardHeader className="border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white pb-4">
              <CardTitle className="text-base font-semibold text-gray-900 flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-blue-600" />
                Performance Analytics
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="h-64 flex items-center justify-center text-gray-400">
                <div className="text-center">
                  <BarChart3 className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>Analytics canvas will be displayed here</p>
                  <p className="text-sm mt-1">Interactive charts and insights</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

// ============================================
// STAT CARD
// ============================================

interface StatCardProps {
  icon: React.ReactNode
  label: string
  value: string | number
  color: 'blue' | 'emerald' | 'purple' | 'amber' | 'cyan' | 'rose'
}

function StatCard({ icon, label, value, color }: StatCardProps) {
  const colorMap = {
    blue: 'bg-blue-100 text-blue-600',
    emerald: 'bg-emerald-100 text-emerald-600',
    purple: 'bg-purple-100 text-purple-600',
    amber: 'bg-amber-100 text-amber-600',
    cyan: 'bg-cyan-100 text-cyan-600',
    rose: 'bg-rose-100 text-rose-600',
  }

  return (
    <Card className="border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200">
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <div className={cn('p-2 rounded-lg', colorMap[color])}>
            {icon}
          </div>
          <div>
            <div className="text-sm text-gray-500">{label}</div>
            <div className="text-xl font-bold text-gray-900">
              {typeof value === 'number' ? <AnimatedCounter value={value} /> : value}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// ============================================
// TEST MANAGEMENT CARD
// ============================================

interface TestManagementCardProps {
  test: Test
}

function TestManagementCard({ test }: TestManagementCardProps) {
  const statusColors: Record<TestStatus, string> = {
    draft: 'border-gray-400 text-gray-600 bg-gray-50',
    upcoming: 'border-blue-500 text-blue-600 bg-blue-50',
    active: 'border-emerald-500 text-emerald-600 bg-emerald-50',
    closed: 'border-gray-400 text-gray-500 bg-gray-50',
  }

  return (
    <Card className="border border-gray-200 shadow-sm hover:shadow-md hover:border-blue-200 transition-all duration-200 group">
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <Badge 
            variant="outline" 
            className={cn('capitalize', statusColors[test.status])}
          >
            {test.status}
          </Badge>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem><Eye className="h-4 w-4 mr-2" /> View</DropdownMenuItem>
              <DropdownMenuItem><Edit3 className="h-4 w-4 mr-2" /> Edit</DropdownMenuItem>
              <DropdownMenuItem><Copy className="h-4 w-4 mr-2" /> Duplicate</DropdownMenuItem>
              <DropdownMenuItem><Send className="h-4 w-4 mr-2" /> Publish</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-red-600"><Trash2 className="h-4 w-4 mr-2" /> Delete</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        
        <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">{test.name}</h3>
        
        <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
          <div className="flex items-center gap-1">
            <BookOpen className="h-4 w-4" />
            {test.questionCount} Q
          </div>
          <div className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            {test.timeLimit} min
          </div>
        </div>
        
        {test.status !== 'draft' && (
          <div className="flex items-center gap-2">
            <Progress 
              value={test.status === 'upcoming' ? 0 : 75} 
              className="h-2 flex-1"
            />
            <span className="text-sm font-medium text-gray-600">
              {test.status === 'upcoming' ? '0' : '45'} attempts
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
