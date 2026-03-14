'use client'

import { useState, useMemo, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Users, BookOpen, Calendar, Clock, BarChart3, Settings, Plus, Search,
  Filter, MoreVertical, Eye, Edit3, Trash2, Copy, Send, FileText,
  TrendingUp, TrendingDown, AlertCircle, CheckCircle2, ChevronDown,
  ChevronUp, Download, Upload, Shield, AlertTriangle, Trophy, Target,
  Zap, Flame, Star, Award, UserX, UserCheck, FileSpreadsheet, FileDown,
  X, Save, Play, Pause, RefreshCw, Mail, Phone, MapPin, GraduationCap,
  Clock4, Timer, Percent, Layers, PieChart as PieChartIcon, Activity
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue 
} from '@/components/ui/select'
import { 
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter 
} from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { Progress } from '@/components/ui/progress'
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu'
import { cn } from '@/modules/tests/utils'
import { 
  FadeIn, 
  StaggerContainer, 
  StaggerItem,
  AnimatedCounter,
  RingProgress
} from './motion'

// ============================================
// TYPES
// ============================================

interface Student {
  id: string
  name: string
  email: string
  avatar?: string
  cohortId: string
  cohortName: string
  testsAttempted: number
  avgScore: number
  accuracy: number
  timeSpent: number // minutes
  lastActive: Date
  status: 'active' | 'inactive' | 'at_risk'
  riskFactors: string[]
  subjectPerformance: { subject: string; score: number }[]
}

interface CohortData {
  id: string
  name: string
  description?: string
  grade: string
  targetExam: string
  studentCount: number
  testsAssigned: number
  avgScore: number
  createdAt: Date
  teachers: string[]
}

interface ScheduledTestRun {
  id: string
  testId: string
  testName: string
  cohortId: string
  cohortName: string
  scheduledStart: Date
  scheduledEnd: Date
  timezone: string
  duration: number
  proctorMode: 'none' | 'lightweight' | 'full'
  accessCode?: string
  allowLateEntry: boolean
  status: 'scheduled' | 'active' | 'completed' | 'cancelled'
  attemptCount: number
  avgScore?: number
}

interface QuestionPerformance {
  id: string
  questionText: string
  subject: string
  chapter: string
  difficulty: 'easy' | 'medium' | 'hard'
  attempts: number
  correct: number
  incorrect: number
  skipped: number
  accuracy: number
  avgTime: number
  discriminationIndex: number
  pValue: number
}

interface TopicMastery {
  topic: string
  subject: string
  masteryLevel: number // 0-100
  studentsAttempted: number
  avgAccuracy: number
}

// ============================================
// SAMPLE DATA
// ============================================

const SAMPLE_STUDENTS: Student[] = [
  { id: 's1', name: 'Rahul Sharma', email: 'rahul@school.com', cohortId: 'c1', cohortName: 'JEE 2024 Batch A', testsAttempted: 12, avgScore: 85, accuracy: 82, timeSpent: 240, lastActive: new Date(), status: 'active', riskFactors: [], subjectPerformance: [{ subject: 'Physics', score: 88 }, { subject: 'Chemistry', score: 78 }, { subject: 'Math', score: 90 }] },
  { id: 's2', name: 'Priya Patel', email: 'priya@school.com', cohortId: 'c1', cohortName: 'JEE 2024 Batch A', testsAttempted: 10, avgScore: 72, accuracy: 68, timeSpent: 180, lastActive: new Date(Date.now() - 86400000), status: 'active', riskFactors: [], subjectPerformance: [{ subject: 'Physics', score: 65 }, { subject: 'Chemistry', score: 75 }, { subject: 'Math', score: 76 }] },
  { id: 's3', name: 'Amit Kumar', email: 'amit@school.com', cohortId: 'c1', cohortName: 'JEE 2024 Batch A', testsAttempted: 5, avgScore: 45, accuracy: 42, timeSpent: 90, lastActive: new Date(Date.now() - 3 * 86400000), status: 'at_risk', riskFactors: ['Low accuracy', 'Inconsistent practice', 'Declining scores'], subjectPerformance: [{ subject: 'Physics', score: 35 }, { subject: 'Chemistry', score: 50 }, { subject: 'Math', score: 48 }] },
  { id: 's4', name: 'Sneha Gupta', email: 'sneha@school.com', cohortId: 'c2', cohortName: 'NEET 2024', testsAttempted: 15, avgScore: 92, accuracy: 90, timeSpent: 320, lastActive: new Date(), status: 'active', riskFactors: [], subjectPerformance: [{ subject: 'Biology', score: 95 }, { subject: 'Chemistry', score: 88 }, { subject: 'Physics', score: 85 }] },
  { id: 's5', name: 'Vikram Singh', email: 'vikram@school.com', cohortId: 'c1', cohortName: 'JEE 2024 Batch A', testsAttempted: 3, avgScore: 38, accuracy: 35, timeSpent: 45, lastActive: new Date(Date.now() - 7 * 86400000), status: 'at_risk', riskFactors: ['Very low scores', 'Inactive for 7 days', 'Missing tests'], subjectPerformance: [{ subject: 'Physics', score: 30 }, { subject: 'Chemistry', score: 45 }, { subject: 'Math', score: 38 }] },
  { id: 's6', name: 'Neha Reddy', email: 'neha@school.com', cohortId: 'c2', cohortName: 'NEET 2024', testsAttempted: 11, avgScore: 78, accuracy: 75, timeSpent: 200, lastActive: new Date(Date.now() - 86400000), status: 'active', riskFactors: [], subjectPerformance: [{ subject: 'Biology', score: 82 }, { subject: 'Chemistry', score: 72 }, { subject: 'Physics', score: 78 }] },
  { id: 's7', name: 'Arjun Mehta', email: 'arjun@school.com', cohortId: 'c1', cohortName: 'JEE 2024 Batch A', testsAttempted: 8, avgScore: 55, accuracy: 52, timeSpent: 120, lastActive: new Date(Date.now() - 2 * 86400000), status: 'at_risk', riskFactors: ['Below average performance', 'Struggling in Physics'], subjectPerformance: [{ subject: 'Physics', score: 40 }, { subject: 'Chemistry', score: 65 }, { subject: 'Math', score: 60 }] },
  { id: 's8', name: 'Divya Nair', email: 'divya@school.com', cohortId: 'c2', cohortName: 'NEET 2024', testsAttempted: 14, avgScore: 88, accuracy: 86, timeSpent: 280, lastActive: new Date(), status: 'active', riskFactors: [], subjectPerformance: [{ subject: 'Biology', score: 92 }, { subject: 'Chemistry', score: 85 }, { subject: 'Physics', score: 82 }] },
]

const SAMPLE_COHORTS: CohortData[] = [
  { id: 'c1', name: 'JEE 2024 Batch A', description: 'JEE Main preparation batch', grade: '12th', targetExam: 'JEE Main', studentCount: 45, testsAssigned: 12, avgScore: 68, createdAt: new Date('2024-01-01'), teachers: ['Dr. Sharma', 'Mr. Kumar'] },
  { id: 'c2', name: 'NEET 2024', description: 'NEET UG preparation', grade: '12th', targetExam: 'NEET', studentCount: 38, testsAssigned: 8, avgScore: 72, createdAt: new Date('2024-01-05'), teachers: ['Dr. Patel', 'Ms. Gupta'] },
  { id: 'c3', name: 'JEE Advanced', description: 'JEE Advanced focused batch', grade: '12th', targetExam: 'JEE Advanced', studentCount: 22, testsAssigned: 15, avgScore: 78, createdAt: new Date('2024-01-10'), teachers: ['Dr. Sharma'] },
  { id: 'c4', name: 'Board Exam Prep', description: 'CBSE Board exam preparation', grade: '12th', targetExam: 'CBSE', studentCount: 51, testsAssigned: 6, avgScore: 75, createdAt: new Date('2024-01-15'), teachers: ['Mr. Verma', 'Ms. Singh'] },
]

const SAMPLE_SCHEDULED_TESTS: ScheduledTestRun[] = [
  { id: 'st1', testId: 't1', testName: 'JEE Physics - Mechanics Final', cohortId: 'c1', cohortName: 'JEE 2024 Batch A', scheduledStart: new Date(Date.now() + 86400000), scheduledEnd: new Date(Date.now() + 86400000 + 7200000), timezone: 'Asia/Kolkata', duration: 90, proctorMode: 'full', accessCode: 'JEE2024A', allowLateEntry: false, status: 'scheduled', attemptCount: 0 },
  { id: 'st2', testId: 't2', testName: 'NEET Biology Mock Test 3', cohortId: 'c2', cohortName: 'NEET 2024', scheduledStart: new Date(Date.now() - 3600000), scheduledEnd: new Date(Date.now() + 3600000), timezone: 'Asia/Kolkata', duration: 120, proctorMode: 'lightweight', allowLateEntry: true, status: 'active', attemptCount: 28, avgScore: 72 },
  { id: 'st3', testId: 't3', testName: 'JEE Chemistry - Organic', cohortId: 'c3', cohortName: 'JEE Advanced', scheduledStart: new Date(Date.now() - 86400000 * 2), scheduledEnd: new Date(Date.now() - 86400000 * 2 + 7200000), timezone: 'Asia/Kolkata', duration: 60, proctorMode: 'none', allowLateEntry: false, status: 'completed', attemptCount: 20, avgScore: 68 },
  { id: 'st4', testId: 't4', testName: 'Math Integration Practice', cohortId: 'c1', cohortName: 'JEE 2024 Batch A', scheduledStart: new Date(Date.now() + 86400000 * 3), scheduledEnd: new Date(Date.now() + 86400000 * 3 + 5400000), timezone: 'Asia/Kolkata', duration: 45, proctorMode: 'none', allowLateEntry: true, status: 'scheduled', attemptCount: 0 },
]

const SAMPLE_QUESTION_PERFORMANCE: QuestionPerformance[] = [
  { id: 'q1', questionText: 'A particle moves in a straight line with constant acceleration...', subject: 'Physics', chapter: 'Mechanics', difficulty: 'medium', attempts: 156, correct: 98, incorrect: 45, skipped: 13, accuracy: 62.8, avgTime: 85, discriminationIndex: 0.45, pValue: 0.62 },
  { id: 'q2', questionText: 'Which of the following compounds will give a positive iodoform test?', subject: 'Chemistry', chapter: 'Organic', difficulty: 'hard', attempts: 142, correct: 52, incorrect: 78, skipped: 12, accuracy: 36.6, avgTime: 95, discriminationIndex: 0.52, pValue: 0.35 },
  { id: 'q3', questionText: 'Find the value of ∫₀^π sin²x dx / (1 + 2^cos x)', subject: 'Math', chapter: 'Integration', difficulty: 'hard', attempts: 98, correct: 28, incorrect: 62, skipped: 8, accuracy: 28.6, avgTime: 120, discriminationIndex: 0.68, pValue: 0.28 },
  { id: 'q4', questionText: 'The genetic material in most organisms is DNA...', subject: 'Biology', chapter: 'Molecular Biology', difficulty: 'easy', attempts: 180, correct: 145, incorrect: 25, skipped: 10, accuracy: 80.6, avgTime: 45, discriminationIndex: 0.38, pValue: 0.75 },
  { id: 'q5', questionText: 'Two blocks of masses 2kg and 4kg are connected...', subject: 'Physics', chapter: 'Laws of Motion', difficulty: 'medium', attempts: 167, correct: 102, incorrect: 55, skipped: 10, accuracy: 61.1, avgTime: 72, discriminationIndex: 0.62, pValue: 0.58 },
]

const SAMPLE_TOPIC_MASTERY: TopicMastery[] = [
  { topic: 'Mechanics', subject: 'Physics', masteryLevel: 72, studentsAttempted: 145, avgAccuracy: 68 },
  { topic: 'Thermodynamics', subject: 'Physics', masteryLevel: 58, studentsAttempted: 132, avgAccuracy: 55 },
  { topic: 'Electromagnetism', subject: 'Physics', masteryLevel: 65, studentsAttempted: 128, avgAccuracy: 62 },
  { topic: 'Optics', subject: 'Physics', masteryLevel: 78, studentsAttempted: 140, avgAccuracy: 75 },
  { topic: 'Organic Chemistry', subject: 'Chemistry', masteryLevel: 45, studentsAttempted: 150, avgAccuracy: 42 },
  { topic: 'Physical Chemistry', subject: 'Chemistry', masteryLevel: 62, studentsAttempted: 145, avgAccuracy: 58 },
  { topic: 'Inorganic Chemistry', subject: 'Chemistry', masteryLevel: 55, studentsAttempted: 138, avgAccuracy: 52 },
  { topic: 'Calculus', subject: 'Math', masteryLevel: 68, studentsAttempted: 155, avgAccuracy: 65 },
  { topic: 'Algebra', subject: 'Math', masteryLevel: 75, studentsAttempted: 160, avgAccuracy: 72 },
  { topic: 'Coordinate Geometry', subject: 'Math', masteryLevel: 58, studentsAttempted: 142, avgAccuracy: 55 },
  { topic: 'Human Physiology', subject: 'Biology', masteryLevel: 82, studentsAttempted: 175, avgAccuracy: 78 },
  { topic: 'Genetics', subject: 'Biology', masteryLevel: 70, studentsAttempted: 165, avgAccuracy: 68 },
]

// ============================================
// MAIN COMPONENT
// ============================================

export function TeacherDashboardEnhanced() {
  const [activeTab, setActiveTab] = useState('overview')
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState<'name' | 'score' | 'accuracy'>('score')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const [cohortFilter, setCohortFilter] = useState<string>('all')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  
  // Modal states
  const [showScheduleModal, setShowScheduleModal] = useState(false)
  const [showCohortModal, setShowCohortModal] = useState(false)
  const [showImportModal, setShowImportModal] = useState(false)
  const [showExportModal, setShowExportModal] = useState(false)
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null)

  // Stats
  const stats = useMemo(() => {
    const atRisk = SAMPLE_STUDENTS.filter(s => s.status === 'at_risk').length
    const avgScore = Math.round(SAMPLE_STUDENTS.reduce((sum, s) => sum + s.avgScore, 0) / SAMPLE_STUDENTS.length)
    const totalTests = SAMPLE_SCHEDULED_TESTS.length
    const activeTests = SAMPLE_SCHEDULED_TESTS.filter(t => t.status === 'active').length
    
    return {
      totalStudents: SAMPLE_STUDENTS.length,
      atRiskStudents: atRisk,
      avgScore,
      totalTests,
      activeTests,
      totalCohorts: SAMPLE_COHORTS.length,
      completionRate: 78
    }
  }, [])

  // Filtered students
  const filteredStudents = useMemo(() => {
    let result = [...SAMPLE_STUDENTS]
    
    if (searchQuery) {
      result = result.filter(s => 
        s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.email.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }
    
    if (cohortFilter !== 'all') {
      result = result.filter(s => s.cohortId === cohortFilter)
    }
    
    if (statusFilter !== 'all') {
      result = result.filter(s => s.status === statusFilter)
    }
    
    result.sort((a, b) => {
      let aVal: string | number = ''
      let bVal: string | number = ''
      
      if (sortBy === 'name') {
        aVal = a.name.toLowerCase()
        bVal = b.name.toLowerCase()
      } else if (sortBy === 'score') {
        aVal = a.avgScore
        bVal = b.avgScore
      } else {
        aVal = a.accuracy
        bVal = b.accuracy
      }
      
      if (sortOrder === 'asc') {
        return aVal < bVal ? -1 : 1
      }
      return aVal > bVal ? -1 : 1
    })
    
    return result
  }, [searchQuery, cohortFilter, statusFilter, sortBy, sortOrder])

  // Leaderboard
  const leaderboard = useMemo(() => {
    return [...SAMPLE_STUDENTS]
      .sort((a, b) => b.avgScore - a.avgScore)
      .slice(0, 10)
  }, [])

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
            Manage tests, cohorts, and monitor student performance
          </motion.p>
        </div>
        <motion.div 
          className="flex gap-3"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <Button variant="outline" className="border-gray-200" onClick={() => setShowImportModal(true)}>
            <Upload className="h-4 w-4 mr-2" />
            Import
          </Button>
          <Button variant="outline" className="border-gray-200" onClick={() => setShowExportModal(true)}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button className="bg-blue-600 hover:bg-blue-700" onClick={() => setShowScheduleModal(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Schedule Test
          </Button>
        </motion.div>
      </div>

      {/* Stats Grid */}
      <StaggerContainer className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        <StaggerItem>
          <StatCard
            icon={<Users className="h-4 w-4" />}
            label="Total Students"
            value={stats.totalStudents}
            color="blue"
          />
        </StaggerItem>
        <StaggerItem>
          <StatCard
            icon={<AlertTriangle className="h-4 w-4" />}
            label="At Risk"
            value={stats.atRiskStudents}
            color="rose"
            alert={stats.atRiskStudents > 0}
          />
        </StaggerItem>
        <StaggerItem>
          <StatCard
            icon={<Target className="h-4 w-4" />}
            label="Avg Score"
            value={`${stats.avgScore}%`}
            color="emerald"
          />
        </StaggerItem>
        <StaggerItem>
          <StatCard
            icon={<CheckCircle2 className="h-4 w-4" />}
            label="Active Tests"
            value={stats.activeTests}
            color="amber"
          />
        </StaggerItem>
        <StaggerItem>
          <StatCard
            icon={<Users className="h-4 w-4" />}
            label="Cohorts"
            value={stats.totalCohorts}
            color="purple"
          />
        </StaggerItem>
        <StaggerItem>
          <StatCard
            icon={<Percent className="h-4 w-4" />}
            label="Completion"
            value={`${stats.completionRate}%`}
            color="cyan"
          />
        </StaggerItem>
      </StaggerContainer>

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-white border border-gray-200 p-1 h-auto flex-wrap">
          <TabsTrigger value="overview" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white text-sm px-4 py-2">
            Overview
          </TabsTrigger>
          <TabsTrigger value="students" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white text-sm px-4 py-2">
            Students
          </TabsTrigger>
          <TabsTrigger value="cohorts" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white text-sm px-4 py-2">
            Cohorts
          </TabsTrigger>
          <TabsTrigger value="schedule" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white text-sm px-4 py-2">
            Schedule
          </TabsTrigger>
          <TabsTrigger value="analytics" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white text-sm px-4 py-2">
            Analytics
          </TabsTrigger>
          <TabsTrigger value="questions" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white text-sm px-4 py-2">
            Questions
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="mt-6 space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* At-Risk Students Alert */}
            {stats.atRiskStudents > 0 && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="lg:col-span-3"
              >
                <Card className="border-red-200 bg-red-50">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="p-2 rounded-lg bg-red-100">
                        <AlertTriangle className="h-5 w-5 text-red-600" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-red-900">Attention Required</h3>
                        <p className="text-sm text-red-700 mt-1">
                          {stats.atRiskStudents} students are at risk of falling behind. Review their performance and consider intervention.
                        </p>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="mt-2 border-red-300 text-red-700 hover:bg-red-100"
                          onClick={() => { setStatusFilter('at_risk'); setActiveTab('students'); }}
                        >
                          View At-Risk Students
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* Leaderboard */}
            <Card className="border border-gray-200 shadow-sm">
              <CardHeader className="border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white pb-4">
                <CardTitle className="text-base font-semibold text-gray-900 flex items-center gap-2">
                  <Trophy className="h-4 w-4 text-amber-500" />
                  Top Performers
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <div className="space-y-3">
                  {leaderboard.slice(0, 5).map((student, idx) => (
                    <motion.div
                      key={student.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      className="flex items-center gap-3"
                    >
                      <div className={cn(
                        'w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm',
                        idx === 0 && 'bg-amber-100 text-amber-700',
                        idx === 1 && 'bg-gray-200 text-gray-700',
                        idx === 2 && 'bg-orange-100 text-orange-700',
                        idx > 2 && 'bg-gray-100 text-gray-500'
                      )}>
                        {idx + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-gray-900 truncate">{student.name}</div>
                        <div className="text-xs text-gray-500">{student.cohortName}</div>
                      </div>
                      <div className="text-sm font-bold text-emerald-600">{student.avgScore}%</div>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Active Tests */}
            <Card className="border border-gray-200 shadow-sm">
              <CardHeader className="border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white pb-4">
                <CardTitle className="text-base font-semibold text-gray-900 flex items-center gap-2">
                  <Activity className="h-4 w-4 text-blue-600" />
                  Active Tests
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <div className="space-y-3">
                  {SAMPLE_SCHEDULED_TESTS.filter(t => t.status === 'active' || t.status === 'scheduled').slice(0, 4).map((test, idx) => (
                    <motion.div
                      key={test.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      className="p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="font-medium text-gray-900 text-sm">{test.testName}</div>
                          <div className="text-xs text-gray-500">{test.cohortName}</div>
                        </div>
                        <Badge variant="outline" className={cn(
                          test.status === 'active' ? 'border-emerald-500 text-emerald-600' : 'border-blue-500 text-blue-600'
                        )}>
                          {test.status}
                        </Badge>
                      </div>
                      {test.status === 'active' && (
                        <div className="mt-2 flex items-center gap-2 text-xs text-gray-500">
                          <Users className="h-3 w-3" />
                          {test.attemptCount} attempts
                        </div>
                      )}
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Topic Mastery Heatmap */}
            <Card className="border border-gray-200 shadow-sm">
              <CardHeader className="border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white pb-4">
                <CardTitle className="text-base font-semibold text-gray-900 flex items-center gap-2">
                  <Layers className="h-4 w-4 text-blue-600" />
                  Topic Mastery
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <TopicMasteryHeatmap data={SAMPLE_TOPIC_MASTERY} compact />
              </CardContent>
            </Card>
          </div>

          {/* Performance Charts */}
          <Card className="border border-gray-200 shadow-sm">
            <CardHeader className="border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white pb-4">
              <CardTitle className="text-base font-semibold text-gray-900 flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-blue-600" />
                Subject Performance Overview
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {['Physics', 'Chemistry', 'Math', 'Biology'].map((subject, idx) => {
                  const subjectData = SAMPLE_TOPIC_MASTERY.filter(t => t.subject === subject)
                  const avgMastery = Math.round(subjectData.reduce((sum, t) => sum + t.masteryLevel, 0) / subjectData.length) || 70
                  const colors = ['#2563EB', '#10B981', '#8B5CF6', '#F59E0B']
                  
                  return (
                    <motion.div
                      key={subject}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: idx * 0.1 }}
                      className="text-center"
                    >
                      <RingProgress 
                        progress={avgMastery} 
                        size={80}
                        strokeWidth={6}
                        color={colors[idx]}
                      />
                      <div className="mt-2 font-semibold text-gray-900">{subject}</div>
                      <div className={cn(
                        'text-sm',
                        avgMastery >= 70 ? 'text-emerald-600' : avgMastery >= 50 ? 'text-amber-600' : 'text-red-600'
                      )}>
                        {avgMastery}% mastery
                      </div>
                    </motion.div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Students Tab */}
        <TabsContent value="students" className="mt-6">
          <Card className="border border-gray-200 shadow-sm">
            <CardHeader className="border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white pb-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <CardTitle className="text-base font-semibold text-gray-900">Student Management</CardTitle>
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search students..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 w-full sm:w-64 border-gray-200"
                    />
                  </div>
                  <Select value={cohortFilter} onValueChange={setCohortFilter}>
                    <SelectTrigger className="w-full sm:w-40 border-gray-200">
                      <SelectValue placeholder="Cohort" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Cohorts</SelectItem>
                      {SAMPLE_COHORTS.map(c => (
                        <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-full sm:w-40 border-gray-200">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="at_risk">At Risk</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <StudentTable 
                students={filteredStudents}
                sortBy={sortBy}
                sortOrder={sortOrder}
                onSort={(field) => {
                  if (sortBy === field) {
                    setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
                  } else {
                    setSortBy(field)
                    setSortOrder('desc')
                  }
                }}
                onSelectStudent={setSelectedStudent}
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Cohorts Tab */}
        <TabsContent value="cohorts" className="mt-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold text-gray-900">Manage Cohorts</h3>
            <Button onClick={() => setShowCohortModal(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Cohort
            </Button>
          </div>
          <CohortManagement cohorts={SAMPLE_COHORTS} />
        </TabsContent>

        {/* Schedule Tab */}
        <TabsContent value="schedule" className="mt-6">
          <ScheduledTestsManager 
            tests={SAMPLE_SCHEDULED_TESTS}
            onCreateNew={() => setShowScheduleModal(true)}
          />
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="mt-6">
          <ClassAnalytics students={SAMPLE_STUDENTS} cohorts={SAMPLE_COHORTS} />
        </TabsContent>

        {/* Questions Tab */}
        <TabsContent value="questions" className="mt-6">
          <QuestionPerformanceBreakdown questions={SAMPLE_QUESTION_PERFORMANCE} />
        </TabsContent>
      </Tabs>

      {/* Schedule Test Modal */}
      <ScheduleTestModal 
        isOpen={showScheduleModal}
        onClose={() => setShowScheduleModal(false)}
        cohorts={SAMPLE_COHORTS}
      />

      {/* Create Cohort Modal */}
      <CreateCohortModal 
        isOpen={showCohortModal}
        onClose={() => setShowCohortModal(false)}
      />

      {/* Import Students Modal */}
      <ImportStudentsModal 
        isOpen={showImportModal}
        onClose={() => setShowImportModal(false)}
      />

      {/* Export Modal */}
      <ExportResultsModal 
        isOpen={showExportModal}
        onClose={() => setShowExportModal(false)}
      />

      {/* Student Detail Modal */}
      <StudentDetailModal 
        student={selectedStudent}
        isOpen={!!selectedStudent}
        onClose={() => setSelectedStudent(null)}
      />
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
  alert?: boolean
}

function StatCard({ icon, label, value, color, alert }: StatCardProps) {
  const colorMap = {
    blue: 'bg-blue-100 text-blue-600',
    emerald: 'bg-emerald-100 text-emerald-600',
    purple: 'bg-purple-100 text-purple-600',
    amber: 'bg-amber-100 text-amber-600',
    cyan: 'bg-cyan-100 text-cyan-600',
    rose: 'bg-rose-100 text-rose-600',
  }

  return (
    <Card className={cn(
      'border shadow-sm hover:shadow-md transition-shadow duration-200',
      alert ? 'border-rose-200 bg-rose-50' : 'border-gray-200'
    )}>
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
// STUDENT TABLE
// ============================================

interface StudentTableProps {
  students: Student[]
  sortBy: 'name' | 'score' | 'accuracy'
  sortOrder: 'asc' | 'desc'
  onSort: (field: 'name' | 'score' | 'accuracy') => void
  onSelectStudent: (student: Student) => void
}

function StudentTable({ students, sortBy, sortOrder, onSort, onSelectStudent }: StudentTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="bg-gray-50 border-b border-gray-100">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              <button onClick={() => onSort('name')} className="flex items-center gap-1 hover:text-gray-900">
                Student {sortBy === 'name' && (sortOrder === 'asc' ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />)}
              </button>
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cohort</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              <button onClick={() => onSort('score')} className="flex items-center gap-1 hover:text-gray-900">
                Score {sortBy === 'score' && (sortOrder === 'asc' ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />)}
              </button>
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              <button onClick={() => onSort('accuracy')} className="flex items-center gap-1 hover:text-gray-900">
                Accuracy {sortBy === 'accuracy' && (sortOrder === 'asc' ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />)}
              </button>
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tests</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {students.map((student) => (
            <motion.tr
              key={student.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className={cn(
                'hover:bg-gray-50 transition-colors cursor-pointer',
                student.status === 'at_risk' && 'bg-red-50'
              )}
              onClick={() => onSelectStudent(student)}
            >
              <td className="px-4 py-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white text-sm font-medium">
                    {student.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">{student.name}</div>
                    <div className="text-xs text-gray-500">{student.email}</div>
                  </div>
                </div>
              </td>
              <td className="px-4 py-3 text-sm text-gray-600">{student.cohortName}</td>
              <td className="px-4 py-3">
                <div className="flex items-center gap-2">
                  <span className={cn(
                    'font-semibold',
                    student.avgScore >= 70 ? 'text-emerald-600' : student.avgScore >= 50 ? 'text-amber-600' : 'text-red-600'
                  )}>
                    {student.avgScore}%
                  </span>
                  {student.avgScore >= 80 && <Star className="h-4 w-4 text-amber-500" />}
                </div>
              </td>
              <td className="px-4 py-3">
                <div className="flex items-center gap-2">
                  <Progress value={student.accuracy} className="w-16 h-2" />
                  <span className="text-sm text-gray-600">{student.accuracy}%</span>
                </div>
              </td>
              <td className="px-4 py-3 text-sm text-gray-600">{student.testsAttempted}</td>
              <td className="px-4 py-3">
                {student.status === 'at_risk' ? (
                  <Badge className="bg-red-100 text-red-700 border-red-200">
                    <AlertTriangle className="h-3 w-3 mr-1" />
                    At Risk
                  </Badge>
                ) : student.status === 'active' ? (
                  <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200">Active</Badge>
                ) : (
                  <Badge className="bg-gray-100 text-gray-700 border-gray-200">Inactive</Badge>
                )}
              </td>
              <td className="px-4 py-3">
                <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); onSelectStudent(student); }}>
                  <Eye className="h-4 w-4" />
                </Button>
              </td>
            </motion.tr>
          ))}
        </tbody>
      </table>
      
      {students.length === 0 && (
        <div className="p-12 text-center text-gray-500">
          No students found matching your criteria
        </div>
      )}
    </div>
  )
}

// ============================================
// TOPIC MASTERY HEATMAP
// ============================================

interface TopicMasteryHeatmapProps {
  data: TopicMastery[]
  compact?: boolean
}

function TopicMasteryHeatmap({ data, compact }: TopicMasteryHeatmapProps) {
  const getColor = (mastery: number) => {
    if (mastery >= 75) return 'bg-emerald-500'
    if (mastery >= 50) return 'bg-amber-500'
    if (mastery >= 30) return 'bg-orange-500'
    return 'bg-red-500'
  }

  const subjects = [...new Set(data.map(d => d.subject))]

  return (
    <div className="space-y-3">
      {subjects.map(subject => (
        <div key={subject}>
          <div className="text-xs font-medium text-gray-500 mb-1">{subject}</div>
          <div className={cn('grid gap-1', compact ? 'grid-cols-4' : 'grid-cols-3 md:grid-cols-4')}>
            {data.filter(d => d.subject === subject).map(topic => (
              <motion.div
                key={topic.topic}
                whileHover={{ scale: 1.05 }}
                className={cn(
                  'p-2 rounded text-center cursor-pointer transition-all',
                  getColor(topic.masteryLevel)
                )}
              >
                <div className="text-xs font-medium text-white truncate">{topic.topic}</div>
                <div className="text-lg font-bold text-white">{topic.masteryLevel}%</div>
              </motion.div>
            ))}
          </div>
        </div>
      ))}
      
      {/* Legend */}
      <div className="flex items-center gap-4 pt-2 border-t border-gray-100">
        <div className="flex items-center gap-1">
          <span className="w-3 h-3 rounded bg-emerald-500" />
          <span className="text-xs text-gray-500">75%+</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="w-3 h-3 rounded bg-amber-500" />
          <span className="text-xs text-gray-500">50-74%</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="w-3 h-3 rounded bg-orange-500" />
          <span className="text-xs text-gray-500">30-49%</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="w-3 h-3 rounded bg-red-500" />
          <span className="text-xs text-gray-500">&lt;30%</span>
        </div>
      </div>
    </div>
  )
}

// ============================================
// COHORT MANAGEMENT
// ============================================

interface CohortManagementProps {
  cohorts: CohortData[]
}

function CohortManagement({ cohorts }: CohortManagementProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {cohorts.map((cohort, idx) => (
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
                    <div className="text-xs text-gray-500">{cohort.targetExam} • {cohort.grade}</div>
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
                    <DropdownMenuItem><Upload className="h-4 w-4 mr-2" /> Import Students</DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="text-red-600"><Trash2 className="h-4 w-4 mr-2" /> Delete</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              
              {cohort.description && (
                <p className="text-sm text-gray-500 mb-3">{cohort.description}</p>
              )}
              
              <div className="grid grid-cols-3 gap-2 text-sm mb-3">
                <div className="p-2 rounded-lg bg-gray-50 text-center">
                  <div className="text-gray-500 text-xs">Students</div>
                  <div className="font-semibold text-gray-900">{cohort.studentCount}</div>
                </div>
                <div className="p-2 rounded-lg bg-gray-50 text-center">
                  <div className="text-gray-500 text-xs">Tests</div>
                  <div className="font-semibold text-gray-900">{cohort.testsAssigned}</div>
                </div>
                <div className="p-2 rounded-lg bg-gray-50 text-center">
                  <div className="text-gray-500 text-xs">Avg</div>
                  <div className="font-semibold text-gray-900">{cohort.avgScore}%</div>
                </div>
              </div>
              
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <GraduationCap className="h-3 w-3" />
                <span>Teachers: {cohort.teachers.join(', ')}</span>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  )
}

// ============================================
// SCHEDULED TESTS MANAGER
// ============================================

interface ScheduledTestsManagerProps {
  tests: ScheduledTestRun[]
  onCreateNew: () => void
}

function ScheduledTestsManager({ tests, onCreateNew }: ScheduledTestsManagerProps) {
  const statusColors = {
    scheduled: 'border-blue-500 text-blue-600 bg-blue-50',
    active: 'border-emerald-500 text-emerald-600 bg-emerald-50',
    completed: 'border-gray-500 text-gray-600 bg-gray-50',
    cancelled: 'border-red-500 text-red-600 bg-red-50',
  }

  return (
    <Card className="border border-gray-200 shadow-sm">
      <CardHeader className="border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold text-gray-900 flex items-center gap-2">
            <Calendar className="h-4 w-4 text-blue-600" />
            Scheduled Tests
          </CardTitle>
          <Button size="sm" className="bg-blue-600 hover:bg-blue-700" onClick={onCreateNew}>
            <Plus className="h-4 w-4 mr-2" />
            Schedule New
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        <div className="space-y-4">
          {tests.map((test, idx) => (
            <motion.div
              key={test.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="flex items-center gap-4 p-4 rounded-xl border border-gray-200 hover:border-blue-200 hover:bg-blue-50/30 transition-all duration-200"
            >
              <div className="flex-shrink-0">
                <div className={cn(
                  'w-12 h-12 rounded-xl flex items-center justify-center',
                  test.status === 'active' ? 'bg-emerald-100' : test.status === 'scheduled' ? 'bg-blue-100' : 'bg-gray-100'
                )}>
                  <Calendar className={cn(
                    'h-6 w-6',
                    test.status === 'active' ? 'text-emerald-600' : test.status === 'scheduled' ? 'text-blue-600' : 'text-gray-600'
                  )} />
                </div>
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-gray-900">{test.testName}</div>
                <div className="text-sm text-gray-500">{test.cohortName}</div>
                <div className="flex items-center gap-4 mt-1 text-xs text-gray-400">
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {test.scheduledStart.toLocaleDateString()} {test.scheduledStart.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                  <span className="flex items-center gap-1">
                    <Timer className="h-3 w-3" />
                    {test.duration} min
                  </span>
                  {test.proctorMode !== 'none' && (
                    <span className="flex items-center gap-1">
                      <Shield className="h-3 w-3" />
                      Proctored
                    </span>
                  )}
                </div>
              </div>
              
              <div className="text-right">
                <Badge variant="outline" className={cn('capitalize', statusColors[test.status])}>
                  {test.status}
                </Badge>
                {test.status === 'active' && (
                  <div className="mt-1 text-sm text-gray-600">
                    {test.attemptCount} attempts
                  </div>
                )}
                {test.status === 'completed' && test.avgScore && (
                  <div className="mt-1 text-sm font-semibold text-emerald-600">
                    Avg: {test.avgScore}%
                  </div>
                )}
              </div>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {test.status === 'scheduled' && (
                    <>
                      <DropdownMenuItem><Edit3 className="h-4 w-4 mr-2" /> Edit Schedule</DropdownMenuItem>
                      <DropdownMenuItem><Play className="h-4 w-4 mr-2" /> Start Now</DropdownMenuItem>
                    </>
                  )}
                  {test.status === 'active' && (
                    <>
                      <DropdownMenuItem><Eye className="h-4 w-4 mr-2" /> View Progress</DropdownMenuItem>
                      <DropdownMenuItem><Pause className="h-4 w-4 mr-2" /> Pause</DropdownMenuItem>
                    </>
                  )}
                  {test.status === 'completed' && (
                    <>
                      <DropdownMenuItem><BarChart3 className="h-4 w-4 mr-2" /> View Results</DropdownMenuItem>
                      <DropdownMenuItem><Download className="h-4 w-4 mr-2" /> Export</DropdownMenuItem>
                    </>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="text-red-600"><Trash2 className="h-4 w-4 mr-2" /> Cancel</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </motion.div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

// ============================================
// CLASS ANALYTICS
// ============================================

interface ClassAnalyticsProps {
  students: Student[]
  cohorts: CohortData[]
}

function ClassAnalytics({ students, cohorts }: ClassAnalyticsProps) {
  // Calculate distribution
  const scoreDistribution = [
    { range: '90-100%', count: students.filter(s => s.avgScore >= 90).length, color: 'bg-emerald-500' },
    { range: '80-89%', count: students.filter(s => s.avgScore >= 80 && s.avgScore < 90).length, color: 'bg-emerald-400' },
    { range: '70-79%', count: students.filter(s => s.avgScore >= 70 && s.avgScore < 80).length, color: 'bg-amber-400' },
    { range: '60-69%', count: students.filter(s => s.avgScore >= 60 && s.avgScore < 70).length, color: 'bg-amber-500' },
    { range: '50-59%', count: students.filter(s => s.avgScore >= 50 && s.avgScore < 60).length, color: 'bg-orange-500' },
    { range: '<50%', count: students.filter(s => s.avgScore < 50).length, color: 'bg-red-500' },
  ]

  const maxCount = Math.max(...scoreDistribution.map(d => d.count))

  return (
    <div className="space-y-6">
      {/* Score Distribution */}
      <Card className="border border-gray-200 shadow-sm">
        <CardHeader className="border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white pb-4">
          <CardTitle className="text-base font-semibold text-gray-900 flex items-center gap-2">
            <BarChart3 className="h-4 w-4 text-blue-600" />
            Score Distribution
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-4">
            {scoreDistribution.map((item, idx) => (
              <motion.div
                key={item.range}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="flex items-center gap-4"
              >
                <div className="w-20 text-sm text-gray-600">{item.range}</div>
                <div className="flex-1 h-8 bg-gray-100 rounded-lg overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${(item.count / maxCount) * 100}%` }}
                    transition={{ delay: idx * 0.1 + 0.2, duration: 0.5, ease: 'easeOut' }}
                    className={cn('h-full rounded-lg', item.color)}
                  />
                </div>
                <div className="w-12 text-right font-semibold text-gray-700">{item.count}</div>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Cohort Comparison */}
      <Card className="border border-gray-200 shadow-sm">
        <CardHeader className="border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white pb-4">
          <CardTitle className="text-base font-semibold text-gray-900 flex items-center gap-2">
            <PieChartIcon className="h-4 w-4 text-blue-600" />
            Cohort Comparison
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {cohorts.map((cohort, idx) => (
              <motion.div
                key={cohort.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.1 }}
                className="text-center p-4 rounded-xl bg-gray-50 border border-gray-100"
              >
                <RingProgress 
                  progress={cohort.avgScore} 
                  size={70}
                  strokeWidth={5}
                  color={cohort.avgScore >= 70 ? '#10B981' : cohort.avgScore >= 50 ? '#F59E0B' : '#EF4444'}
                />
                <div className="mt-2 font-medium text-gray-900 text-sm">{cohort.name}</div>
                <div className="text-xs text-gray-500">{cohort.studentCount} students</div>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Weekly Activity */}
      <Card className="border border-gray-200 shadow-sm">
        <CardHeader className="border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white pb-4">
          <CardTitle className="text-base font-semibold text-gray-900 flex items-center gap-2">
            <Activity className="h-4 w-4 text-blue-600" />
            Weekly Activity Trend
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="flex items-end gap-2 h-40">
            {[65, 78, 82, 70, 95, 88, 72].map((value, idx) => (
              <motion.div
                key={idx}
                initial={{ height: 0 }}
                animate={{ height: `${value}%` }}
                transition={{ delay: idx * 0.1, duration: 0.5, ease: 'easeOut' }}
                className="flex-1 bg-gradient-to-t from-blue-600 to-blue-400 rounded-t-lg"
              />
            ))}
          </div>
          <div className="flex gap-2 mt-2">
            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => (
              <div key={day} className="flex-1 text-center text-xs text-gray-500">{day}</div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// ============================================
// QUESTION PERFORMANCE BREAKDOWN
// ============================================

interface QuestionPerformanceBreakdownProps {
  questions: QuestionPerformance[]
}

function QuestionPerformanceBreakdown({ questions }: QuestionPerformanceBreakdownProps) {
  const [sortBy, setSortBy] = useState<'accuracy' | 'discrimination' | 'attempts'>('accuracy')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')

  const sortedQuestions = useMemo(() => {
    return [...questions].sort((a, b) => {
      const aVal = a[sortBy]
      const bVal = b[sortBy]
      return sortOrder === 'asc' ? aVal - bVal : bVal - aVal
    })
  }, [questions, sortBy, sortOrder])

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-emerald-100 text-emerald-700'
      case 'medium': return 'bg-amber-100 text-amber-700'
      case 'hard': return 'bg-red-100 text-red-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  return (
    <Card className="border border-gray-200 shadow-sm">
      <CardHeader className="border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white pb-4">
        <CardTitle className="text-base font-semibold text-gray-900 flex items-center gap-2">
          <BarChart3 className="h-4 w-4 text-blue-600" />
          Question Performance Analysis
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Question</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subject</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Difficulty</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <button onClick={() => { if (sortBy === 'attempts') setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc'); setSortBy('attempts'); }} className="flex items-center gap-1">
                    Attempts
                  </button>
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <button onClick={() => { if (sortBy === 'accuracy') setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc'); setSortBy('accuracy'); }} className="flex items-center gap-1">
                    Accuracy
                  </button>
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Avg Time</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <button onClick={() => { if (sortBy === 'discrimination') setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc'); setSortBy('discrimination'); }} className="flex items-center gap-1">
                    Discrimination
                  </button>
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">P-Value</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {sortedQuestions.map((q, idx) => (
                <motion.tr
                  key={q.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: idx * 0.05 }}
                  className="hover:bg-gray-50"
                >
                  <td className="px-4 py-3">
                    <div className="max-w-xs truncate text-sm text-gray-900">{q.questionText}</div>
                    <div className="text-xs text-gray-500">{q.chapter}</div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">{q.subject}</td>
                  <td className="px-4 py-3">
                    <Badge variant="outline" className={cn('capitalize text-xs', getDifficultyColor(q.difficulty))}>
                      {q.difficulty}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">{q.attempts}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Progress value={q.accuracy} className="w-16 h-2" />
                      <span className={cn(
                        'text-sm font-medium',
                        q.accuracy >= 60 ? 'text-emerald-600' : q.accuracy >= 40 ? 'text-amber-600' : 'text-red-600'
                      )}>
                        {q.accuracy.toFixed(1)}%
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">{q.avgTime}s</td>
                  <td className="px-4 py-3">
                    <span className={cn(
                      'text-sm font-medium',
                      q.discriminationIndex >= 0.4 ? 'text-emerald-600' : q.discriminationIndex >= 0.2 ? 'text-amber-600' : 'text-red-600'
                    )}>
                      {q.discriminationIndex.toFixed(2)}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={cn(
                      'text-sm font-medium',
                      q.pValue >= 0.3 && q.pValue <= 0.7 ? 'text-emerald-600' : 'text-amber-600'
                    )}>
                      {q.pValue.toFixed(2)}
                    </span>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  )
}

// ============================================
// SCHEDULE TEST MODAL
// ============================================

interface ScheduleTestModalProps {
  isOpen: boolean
  onClose: () => void
  cohorts: CohortData[]
}

function ScheduleTestModal({ isOpen, onClose, cohorts }: ScheduleTestModalProps) {
  const [formData, setFormData] = useState({
    testName: '',
    cohortId: '',
    date: '',
    startTime: '',
    duration: 60,
    proctorMode: 'none' as 'none' | 'lightweight' | 'full',
    accessCode: '',
    allowLateEntry: false,
  })

  const handleSchedule = () => {
    // Implementation would call API
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-blue-600" />
            Schedule Test
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-700">Test Name</label>
            <Input
              value={formData.testName}
              onChange={(e) => setFormData({ ...formData, testName: e.target.value })}
              className="mt-1"
              placeholder="e.g., JEE Physics - Mechanics Final"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700">Assign to Cohort</label>
            <Select value={formData.cohortId} onValueChange={(v) => setFormData({ ...formData, cohortId: v })}>
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Select cohort" />
              </SelectTrigger>
              <SelectContent>
                {cohorts.map(c => (
                  <SelectItem key={c.id} value={c.id}>{c.name} ({c.studentCount} students)</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700">Date</label>
              <Input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="mt-1"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Start Time</label>
              <Input
                type="time"
                value={formData.startTime}
                onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                className="mt-1"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700">Duration (minutes)</label>
              <Input
                type="number"
                value={formData.duration}
                onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) })}
                className="mt-1"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Proctoring</label>
              <Select value={formData.proctorMode} onValueChange={(v: any) => setFormData({ ...formData, proctorMode: v })}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  <SelectItem value="lightweight">Lightweight</SelectItem>
                  <SelectItem value="full">Full Proctoring</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700">Access Code (optional)</label>
            <Input
              value={formData.accessCode}
              onChange={(e) => setFormData({ ...formData, accessCode: e.target.value })}
              className="mt-1"
              placeholder="Leave empty for open access"
            />
          </div>
        </div>

        <DialogFooter className="mt-4">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSchedule} className="bg-blue-600 hover:bg-blue-700">
            <Calendar className="h-4 w-4 mr-2" />
            Schedule Test
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// ============================================
// CREATE COHORT MODAL
// ============================================

function CreateCohortModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    grade: '12th',
    targetExam: 'JEE Main',
  })

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-blue-600" />
            Create Cohort
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-700">Cohort Name</label>
            <Input
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="mt-1"
              placeholder="e.g., JEE 2024 Batch A"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700">Description</label>
            <Textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="mt-1"
              rows={2}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700">Grade</label>
              <Select value={formData.grade} onValueChange={(v) => setFormData({ ...formData, grade: v })}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="11th">11th</SelectItem>
                  <SelectItem value="12th">12th</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Target Exam</label>
              <Select value={formData.targetExam} onValueChange={(v) => setFormData({ ...formData, targetExam: v })}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="JEE Main">JEE Main</SelectItem>
                  <SelectItem value="JEE Advanced">JEE Advanced</SelectItem>
                  <SelectItem value="NEET">NEET</SelectItem>
                  <SelectItem value="CBSE">CBSE Boards</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <DialogFooter className="mt-4">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={onClose} className="bg-blue-600 hover:bg-blue-700">
            <Save className="h-4 w-4 mr-2" />
            Create Cohort
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// ============================================
// IMPORT STUDENTS MODAL
// ============================================

function ImportStudentsModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [file, setFile] = useState<File | null>(null)

  const templateColumns = [
    { name: 'name', required: true },
    { name: 'email', required: true },
    { name: 'cohort', required: true },
    { name: 'phone', required: false },
    { name: 'roll_number', required: false },
  ]

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5 text-blue-600" />
            Import Students
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Template Download */}
          <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
            <div className="flex items-start gap-3">
              <FileSpreadsheet className="h-5 w-5 text-blue-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-gray-900">Download Template</h4>
                <p className="text-sm text-gray-600 mt-1">Use the template for correct format</p>
                <Button size="sm" variant="outline" className="mt-2">
                  <Download className="h-4 w-4 mr-2" />
                  Download Template
                </Button>
              </div>
            </div>
          </div>

          {/* Column Reference */}
          <div>
            <h4 className="font-medium text-gray-900 mb-2">Required Columns</h4>
            <div className="flex flex-wrap gap-2">
              {templateColumns.map(col => (
                <code key={col.name} className={cn(
                  'px-2 py-1 rounded text-xs',
                  col.required ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-700'
                )}>
                  {col.name}{col.required ? '*' : ''}
                </code>
              ))}
            </div>
          </div>

          {/* File Upload */}
          <div className="border-2 border-dashed border-gray-200 rounded-lg p-8 text-center hover:border-blue-300 transition-colors">
            <input 
              type="file" 
              accept=".csv" 
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              className="hidden"
              id="student-csv-upload"
            />
            <label htmlFor="student-csv-upload" className="cursor-pointer">
              <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-600">{file ? file.name : 'Click to upload CSV'}</p>
            </label>
          </div>
        </div>

        <DialogFooter className="mt-4">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={onClose} className="bg-blue-600 hover:bg-blue-700" disabled={!file}>
            <Upload className="h-4 w-4 mr-2" />
            Import
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// ============================================
// EXPORT RESULTS MODAL
// ============================================

function ExportResultsModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [exportFormat, setExportFormat] = useState<'csv' | 'pdf'>('csv')
  const [exportScope, setExportScope] = useState<'all' | 'cohort' | 'test'>('all')

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Download className="h-5 w-5 text-blue-600" />
            Export Results
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-700">Export Format</label>
            <div className="grid grid-cols-2 gap-3 mt-2">
              <button
                onClick={() => setExportFormat('csv')}
                className={cn(
                  'p-4 rounded-lg border-2 text-center transition-all',
                  exportFormat === 'csv' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                )}
              >
                <FileSpreadsheet className="h-6 w-6 mx-auto mb-2 text-emerald-600" />
                <div className="font-medium">CSV</div>
                <div className="text-xs text-gray-500">Spreadsheet format</div>
              </button>
              <button
                onClick={() => setExportFormat('pdf')}
                className={cn(
                  'p-4 rounded-lg border-2 text-center transition-all',
                  exportFormat === 'pdf' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                )}
              >
                <FileDown className="h-6 w-6 mx-auto mb-2 text-red-600" />
                <div className="font-medium">PDF</div>
                <div className="text-xs text-gray-500">Document format</div>
              </button>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700">Export Scope</label>
            <Select value={exportScope} onValueChange={(v: any) => setExportScope(v)}>
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Results</SelectItem>
                <SelectItem value="cohort">By Cohort</SelectItem>
                <SelectItem value="test">By Test</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {exportScope !== 'all' && (
            <div>
              <label className="text-sm font-medium text-gray-700">
                Select {exportScope === 'cohort' ? 'Cohort' : 'Test'}
              </label>
              <Select>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder={`Select ${exportScope}`} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">Option 1</SelectItem>
                  <SelectItem value="2">Option 2</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
        </div>

        <DialogFooter className="mt-4">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={onClose} className="bg-blue-600 hover:bg-blue-700">
            <Download className="h-4 w-4 mr-2" />
            Export {exportFormat.toUpperCase()}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// ============================================
// STUDENT DETAIL MODAL
// ============================================

interface StudentDetailModalProps {
  student: Student | null
  isOpen: boolean
  onClose: () => void
}

function StudentDetailModal({ student, isOpen, onClose }: StudentDetailModalProps) {
  if (!student) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-blue-600" />
            Student Details
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Profile Header */}
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white text-xl font-bold">
              {student.name.split(' ').map(n => n[0]).join('')}
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">{student.name}</h3>
              <p className="text-gray-500">{student.email}</p>
              <div className="flex items-center gap-2 mt-2">
                <Badge variant="outline">{student.cohortName}</Badge>
                {student.status === 'at_risk' ? (
                  <Badge className="bg-red-100 text-red-700">
                    <AlertTriangle className="h-3 w-3 mr-1" />
                    At Risk
                  </Badge>
                ) : (
                  <Badge className="bg-emerald-100 text-emerald-700">Active</Badge>
                )}
              </div>
            </div>
          </div>

          {/* Risk Factors */}
          {student.riskFactors.length > 0 && (
            <div className="bg-red-50 rounded-lg p-4 border border-red-200">
              <h4 className="font-medium text-red-900 mb-2">Risk Factors</h4>
              <ul className="space-y-1">
                {student.riskFactors.map((factor, idx) => (
                  <li key={idx} className="text-sm text-red-700 flex items-center gap-2">
                    <AlertCircle className="h-4 w-4" />
                    {factor}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Stats Grid */}
          <div className="grid grid-cols-4 gap-4">
            <div className="p-4 rounded-lg bg-gray-50 text-center">
              <div className="text-2xl font-bold text-gray-900">{student.avgScore}%</div>
              <div className="text-sm text-gray-500">Avg Score</div>
            </div>
            <div className="p-4 rounded-lg bg-gray-50 text-center">
              <div className="text-2xl font-bold text-gray-900">{student.accuracy}%</div>
              <div className="text-sm text-gray-500">Accuracy</div>
            </div>
            <div className="p-4 rounded-lg bg-gray-50 text-center">
              <div className="text-2xl font-bold text-gray-900">{student.testsAttempted}</div>
              <div className="text-sm text-gray-500">Tests</div>
            </div>
            <div className="p-4 rounded-lg bg-gray-50 text-center">
              <div className="text-2xl font-bold text-gray-900">{student.timeSpent}m</div>
              <div className="text-sm text-gray-500">Time Spent</div>
            </div>
          </div>

          {/* Subject Performance */}
          <div>
            <h4 className="font-medium text-gray-900 mb-3">Subject Performance</h4>
            <div className="space-y-3">
              {student.subjectPerformance.map(sp => (
                <div key={sp.subject} className="flex items-center gap-3">
                  <div className="w-20 text-sm text-gray-600">{sp.subject}</div>
                  <Progress value={sp.score} className="flex-1 h-3" />
                  <div className={cn(
                    'w-12 text-right font-semibold',
                    sp.score >= 70 ? 'text-emerald-600' : sp.score >= 50 ? 'text-amber-600' : 'text-red-600'
                  )}>
                    {sp.score}%
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <DialogFooter className="mt-4">
          <Button variant="outline" onClick={onClose}>Close</Button>
          <Button variant="outline" className="text-blue-600 border-blue-200">
            <Mail className="h-4 w-4 mr-2" />
            Send Message
          </Button>
          <Button className="bg-blue-600 hover:bg-blue-700">
            <Target className="h-4 w-4 mr-2" />
            Create Remediation Plan
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default TeacherDashboardEnhanced
