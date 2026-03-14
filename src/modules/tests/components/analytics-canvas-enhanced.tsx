'use client'

import { useState, useMemo, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown, 
  Clock, 
  Target,
  Users,
  BookOpen,
  Calendar,
  Download,
  Filter,
  RefreshCw,
  Brain,
  AlertTriangle,
  Zap,
  Share2,
  FileText,
  ChevronRight,
  Lightbulb,
  Sparkles,
  X,
  CheckCircle2,
  Info,
  Puzzle,
  Timer,
  Gauge,
  ScatterChart,
  Flame,
  AlertCircle
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import { cn } from '@/modules/tests/utils'
import { 
  FadeIn,
  AnimatedCounter,
  RingProgress,
  Shimmer
} from './motion'
import type { TestAnalytics, ItemAnalytics, UserAnalytics, CohortAnalytics } from '@/modules/tests/types'

// ============================================
// DESIGN TOKENS
// ============================================

const ANALYTICS_TOKENS = {
  colors: {
    primary: '#2563EB',
    success: '#10B981',
    warning: '#F59E0B',
    danger: '#EF4444',
    info: '#06B6D4',
    purple: '#8B5CF6',
    pink: '#EC4899',
    gray: '#6B7280'
  },
  gradients: {
    ability: ['#2563EB', '#8B5CF6', '#EC4899'],
    heat: ['#10B981', '#F59E0B', '#EF4444'],
    time: ['#06B6D4', '#2563EB', '#8B5CF6']
  },
  thresholds: {
    mastery: { low: 40, medium: 70 },
    accuracy: { low: 50, medium: 75 },
    time: { fast: 30, slow: 90 },
    guessing: 0.25
  }
}

// ============================================
// TYPES
// ============================================

interface ThetaRecord {
  timestamp: Date
  theta: number
  standardError: number
  isCorrect: boolean
  questionId: string
}

interface TopicMasteryCell {
  topicId: string
  topicName: string
  subjectId: string
  subjectName: string
  mastery: number // 0-100
  questionsAttempted: number
  questionsCorrect: number
  avgTime: number
  lastPracticed: Date | null
}

interface TimeEfficiencyPoint {
  questionId: string
  timeSpent: number // seconds
  isCorrect: boolean
  difficulty: 'easy' | 'medium' | 'hard'
  topic: string
}

interface MistakePattern {
  type: 'conceptual' | 'calculation' | 'time_pressure' | 'silly' | 'misread'
  count: number
  percentage: number
  recentExamples: string[]
  suggestedFix: string
}

interface GuessingIndicator {
  questionId: string
  timeSpent: number
  confidence: number // 0-1
  isLikelyGuess: boolean
  wasCorrect: boolean
}

interface AccuracyDifficultyPoint {
  difficulty: number // 0-100 scale
  accuracy: number
  count: number
}

interface PerformanceAnalyticsData {
  abilityProgression: ThetaRecord[]
  topicMastery: TopicMasteryCell[]
  timeEfficiency: TimeEfficiencyPoint[]
  mistakePatterns: MistakePattern[]
  guessingIndicators: GuessingIndicator[]
  accuracyDifficulty: AccuracyDifficultyPoint[]
  summary: {
    currentTheta: number
    thetaChange: number
    overallMastery: number
    efficiency: number
    guessingRate: number
    weakestAreas: string[]
    strongestAreas: string[]
  }
}

interface EnhancedAnalyticsCanvasProps {
  testId?: string
  userId?: string
  onFixWithCogni?: (topicId: string) => void
}

// ============================================
// MOCK DATA GENERATOR
// ============================================

function generateMockData(): PerformanceAnalyticsData {
  const now = new Date()
  
  // Generate ability progression (theta over time)
  const abilityProgression: ThetaRecord[] = []
  let currentTheta = 0.2
  for (let i = 30; i >= 0; i--) {
    const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000)
    const isCorrect = Math.random() > 0.4
    currentTheta += (isCorrect ? 0.08 : -0.05) + (Math.random() - 0.5) * 0.1
    currentTheta = Math.max(-2, Math.min(2, currentTheta))
    
    abilityProgression.push({
      timestamp: date,
      theta: parseFloat(currentTheta.toFixed(2)),
      standardError: parseFloat((0.3 + Math.random() * 0.2).toFixed(2)),
      isCorrect,
      questionId: `q-${i}`
    })
  }

  // Generate topic mastery
  const topics = [
    { name: 'Mechanics', subject: 'Physics' },
    { name: 'Thermodynamics', subject: 'Physics' },
    { name: 'Electromagnetism', subject: 'Physics' },
    { name: 'Optics', subject: 'Physics' },
    { name: 'Organic Chemistry', subject: 'Chemistry' },
    { name: 'Inorganic Chemistry', subject: 'Chemistry' },
    { name: 'Physical Chemistry', subject: 'Chemistry' },
    { name: 'Algebra', subject: 'Mathematics' },
    { name: 'Calculus', subject: 'Mathematics' },
    { name: 'Coordinate Geometry', subject: 'Mathematics' },
    { name: 'Trigonometry', subject: 'Mathematics' },
    { name: 'Probability', subject: 'Mathematics' }
  ]

  const topicMastery: TopicMasteryCell[] = topics.map((t, i) => ({
    topicId: `topic-${i}`,
    topicName: t.name,
    subjectId: t.subject.toLowerCase(),
    subjectName: t.subject,
    mastery: Math.round(20 + Math.random() * 70),
    questionsAttempted: Math.round(10 + Math.random() * 50),
    questionsCorrect: Math.round(5 + Math.random() * 30),
    avgTime: Math.round(30 + Math.random() * 60),
    lastPracticed: Math.random() > 0.3 ? new Date(now.getTime() - Math.random() * 7 * 24 * 60 * 60 * 1000) : null
  }))

  // Generate time efficiency data
  const timeEfficiency: TimeEfficiencyPoint[] = []
  const difficulties: ('easy' | 'medium' | 'hard')[] = ['easy', 'medium', 'hard']
  for (let i = 0; i < 50; i++) {
    const difficulty = difficulties[Math.floor(Math.random() * 3)]
    const baseTime = difficulty === 'easy' ? 30 : difficulty === 'medium' ? 60 : 90
    timeEfficiency.push({
      questionId: `q-eff-${i}`,
      timeSpent: Math.round(baseTime + (Math.random() - 0.3) * baseTime),
      isCorrect: Math.random() > (difficulty === 'easy' ? 0.3 : difficulty === 'medium' ? 0.4 : 0.5),
      difficulty,
      topic: topics[Math.floor(Math.random() * topics.length)].name
    })
  }

  // Generate mistake patterns
  const mistakePatterns: MistakePattern[] = [
    {
      type: 'conceptual',
      count: 45,
      percentage: 35,
      recentExamples: ['Newton\'s Laws application', 'Organic reaction mechanism'],
      suggestedFix: 'Review fundamental concepts and practice application-based questions'
    },
    {
      type: 'calculation',
      count: 38,
      percentage: 30,
      recentExamples: ['Integration limits', 'Mole calculations'],
      suggestedFix: 'Practice mental math and verify steps before finalizing'
    },
    {
      type: 'time_pressure',
      count: 25,
      percentage: 20,
      recentExamples: ['Rushed final answers', 'Skipped verification'],
      suggestedFix: 'Practice timed tests and learn to skip difficult questions'
    },
    {
      type: 'silly',
      count: 15,
      percentage: 12,
      recentExamples: ['Sign errors', 'Unit conversion mistakes'],
      suggestedFix: 'Double-check answers before submitting'
    },
    {
      type: 'misread',
      count: 5,
      percentage: 3,
      recentExamples: ['Wrong option selected', 'Misread question'],
      suggestedFix: 'Read questions carefully and highlight key information'
    }
  ]

  // Generate guessing indicators
  const guessingIndicators: GuessingIndicator[] = []
  for (let i = 0; i < 20; i++) {
    const timeSpent = Math.round(5 + Math.random() * 20)
    const confidence = timeSpent / 120
    guessingIndicators.push({
      questionId: `q-guess-${i}`,
      timeSpent,
      confidence: parseFloat(confidence.toFixed(2)),
      isLikelyGuess: timeSpent < 15,
      wasCorrect: Math.random() > 0.6
    })
  }

  // Generate accuracy vs difficulty curve
  const accuracyDifficulty: AccuracyDifficultyPoint[] = []
  for (let difficulty = 10; difficulty <= 90; difficulty += 10) {
    const baseAccuracy = 95 - (difficulty * 0.6)
    accuracyDifficulty.push({
      difficulty,
      accuracy: Math.round(baseAccuracy + (Math.random() - 0.5) * 20),
      count: Math.round(10 + Math.random() * 40)
    })
  }

  // Calculate summary
  const weakTopics = topicMastery.filter(t => t.mastery < 40).map(t => t.topicName)
  const strongTopics = topicMastery.filter(t => t.mastery > 70).map(t => t.topicName)
  const guessingCount = guessingIndicators.filter(g => g.isLikelyGuess).length
  const avgTime = timeEfficiency.reduce((sum, t) => sum + t.timeSpent, 0) / timeEfficiency.length

  return {
    abilityProgression,
    topicMastery,
    timeEfficiency,
    mistakePatterns,
    guessingIndicators,
    accuracyDifficulty,
    summary: {
      currentTheta: abilityProgression[abilityProgression.length - 1]?.theta || 0,
      thetaChange: (abilityProgression[abilityProgression.length - 1]?.theta || 0) - (abilityProgression[0]?.theta || 0),
      overallMastery: Math.round(topicMastery.reduce((sum, t) => sum + t.mastery, 0) / topicMastery.length),
      efficiency: Math.round((avgTime / 60) * 10) / 10,
      guessingRate: Math.round((guessingCount / guessingIndicators.length) * 100),
      weakestAreas: weakTopics.slice(0, 3),
      strongestAreas: strongTopics.slice(0, 3)
    }
  }
}

// ============================================
// MAIN COMPONENT
// ============================================

export function EnhancedAnalyticsCanvas({ testId, userId, onFixWithCogni }: EnhancedAnalyticsCanvasProps) {
  const [timeRange, setTimeRange] = useState('30d')
  const [activeView, setActiveView] = useState('intelligence')
  const [selectedTest, setSelectedTest] = useState('all')
  const [isExporting, setIsExporting] = useState(false)
  const [showShareCard, setShowShareCard] = useState(false)
  
  const data = useMemo(() => generateMockData(), [])

  // Export PDF handler
  const handleExportPDF = useCallback(async () => {
    setIsExporting(true)
    // Simulate PDF generation
    await new Promise(resolve => setTimeout(resolve, 2000))
    setIsExporting(false)
    // In real implementation, would generate and download PDF
    console.log('PDF exported')
  }, [])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <motion.h2 
            className="text-xl font-bold text-gray-900 flex items-center gap-2"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 shadow-lg shadow-blue-500/20">
              <Brain className="h-5 w-5 text-white" />
            </div>
            Performance Intelligence
          </motion.h2>
          <motion.p 
            className="text-gray-500 text-sm mt-1 ml-12"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
          >
            Advanced analytics powered by IRT and Knowledge Tracing
          </motion.p>
        </div>
        <div className="flex items-center gap-3">
          <Select value={selectedTest} onValueChange={setSelectedTest}>
            <SelectTrigger className="w-40 border-gray-200">
              <SelectValue placeholder="Select Test" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Tests</SelectItem>
              <SelectItem value="recent">Last 10 Tests</SelectItem>
              <SelectItem value="jee-main">JEE Main Mock</SelectItem>
              <SelectItem value="neet">NEET Practice</SelectItem>
            </SelectContent>
          </Select>
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-28 border-gray-200">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">7 days</SelectItem>
              <SelectItem value="30d">30 days</SelectItem>
              <SelectItem value="90d">90 days</SelectItem>
              <SelectItem value="all">All time</SelectItem>
            </SelectContent>
          </Select>
          <Button 
            variant="outline" 
            className="border-gray-200"
            onClick={() => setShowShareCard(true)}
          >
            <Share2 className="h-4 w-4 mr-2" />
            Share
          </Button>
          <Button 
            className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
            onClick={handleExportPDF}
            disabled={isExporting}
          >
            {isExporting ? (
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <FileText className="h-4 w-4 mr-2" />
            )}
            {isExporting ? 'Generating...' : 'PDF Report'}
          </Button>
        </div>
      </div>

      {/* Intelligence Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        <IntelligenceCard
          icon={<Brain className="h-4 w-4" />}
          label="Ability (θ)"
          value={data.summary.currentTheta.toFixed(2)}
          change={data.summary.thetaChange}
          color="purple"
        />
        <IntelligenceCard
          icon={<Target className="h-4 w-4" />}
          label="Mastery"
          value={`${data.summary.overallMastery}%`}
          color="blue"
        />
        <IntelligenceCard
          icon={<Timer className="h-4 w-4" />}
          label="Efficiency"
          value={`${data.summary.efficiency}m/q`}
          color="cyan"
        />
        <IntelligenceCard
          icon={<AlertCircle className="h-4 w-4" />}
          label="Guessing Rate"
          value={`${data.summary.guessingRate}%`}
          color={data.summary.guessingRate > 15 ? 'danger' : 'success'}
        />
        <IntelligenceCard
          icon={<TrendingDown className="h-4 w-4" />}
          label="Weak Areas"
          value={data.summary.weakestAreas.length.toString()}
          color="warning"
        />
        <IntelligenceCard
          icon={<TrendingUp className="h-4 w-4" />}
          label="Strong Areas"
          value={data.summary.strongestAreas.length.toString()}
          color="success"
        />
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeView} onValueChange={setActiveView}>
        <TabsList className="bg-white border border-gray-200 p-1 h-auto flex-wrap">
          <TabsTrigger value="intelligence" className="text-sm px-4 py-2 data-[state=active]:bg-blue-600 data-[state=active]:text-white">
            <Brain className="h-4 w-4 mr-2" />
            Intelligence
          </TabsTrigger>
          <TabsTrigger value="ability" className="text-sm px-4 py-2 data-[state=active]:bg-blue-600 data-[state=active]:text-white">
            <TrendingUp className="h-4 w-4 mr-2" />
            Ability
          </TabsTrigger>
          <TabsTrigger value="mastery" className="text-sm px-4 py-2 data-[state=active]:bg-blue-600 data-[state=active]:text-white">
            <Puzzle className="h-4 w-4 mr-2" />
            Mastery
          </TabsTrigger>
          <TabsTrigger value="efficiency" className="text-sm px-4 py-2 data-[state=active]:bg-blue-600 data-[state=active]:text-white">
            <Timer className="h-4 w-4 mr-2" />
            Efficiency
          </TabsTrigger>
          <TabsTrigger value="mistakes" className="text-sm px-4 py-2 data-[state=active]:bg-blue-600 data-[state=active]:text-white">
            <AlertTriangle className="h-4 w-4 mr-2" />
            Mistakes
          </TabsTrigger>
          <TabsTrigger value="accuracy" className="text-sm px-4 py-2 data-[state=active]:bg-blue-600 data-[state=active]:text-white">
            <Gauge className="h-4 w-4 mr-2" />
            Accuracy
          </TabsTrigger>
        </TabsList>

        {/* Intelligence Overview */}
        <TabsContent value="intelligence" className="mt-6 space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Ability Mini Chart */}
            <Card className="border border-gray-200 shadow-sm">
              <CardHeader className="border-b border-gray-100 pb-3">
                <CardTitle className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                  <Brain className="h-4 w-4 text-purple-600" />
                  Ability Progression
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <MiniAbilityChart data={data.abilityProgression.slice(-14)} />
              </CardContent>
            </Card>

            {/* Guessing Indicator */}
            <Card className="border border-gray-200 shadow-sm">
              <CardHeader className="border-b border-gray-100 pb-3">
                <CardTitle className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-amber-600" />
                  Guessing Tendency
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <GuessingGauge guessingRate={data.summary.guessingRate} />
              </CardContent>
            </Card>

            {/* Top Mistakes */}
            <Card className="border border-gray-200 shadow-sm">
              <CardHeader className="border-b border-gray-100 pb-3">
                <CardTitle className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-red-600" />
                  Top Mistake Patterns
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <MiniMistakeList patterns={data.mistakePatterns.slice(0, 3)} />
              </CardContent>
            </Card>
          </div>

          {/* Weak Areas with Fix CTA */}
          <Card className="border border-gray-200 shadow-sm">
            <CardHeader className="border-b border-gray-100 pb-4">
              <CardTitle className="text-base font-semibold text-gray-900 flex items-center gap-2">
                <Zap className="h-4 w-4 text-amber-600" />
                Areas Needing Attention
              </CardTitle>
              <CardDescription>Click "Fix with Cogni" to get personalized remediation</CardDescription>
            </CardHeader>
            <CardContent className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {data.topicMastery
                  .filter(t => t.mastery < 50)
                  .sort((a, b) => a.mastery - b.mastery)
                  .slice(0, 6)
                  .map((topic) => (
                    <WeakTopicCard 
                      key={topic.topicId} 
                      topic={topic} 
                      onFix={onFixWithCogni}
                    />
                  ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Ability Progression */}
        <TabsContent value="ability" className="mt-6 space-y-6">
          <AbilityProgressionGraph data={data.abilityProgression} />
        </TabsContent>

        {/* Topic Mastery Heatmap */}
        <TabsContent value="mastery" className="mt-6 space-y-6">
          <TopicMasteryHeatmapGrid 
            topics={data.topicMastery} 
            onFixWithCogni={onFixWithCogni}
          />
        </TabsContent>

        {/* Time Efficiency */}
        <TabsContent value="efficiency" className="mt-6 space-y-6">
          <TimeEfficiencyScatter data={data.timeEfficiency} />
        </TabsContent>

        {/* Mistake Patterns */}
        <TabsContent value="mistakes" className="mt-6 space-y-6">
          <MistakePatternAnalysis patterns={data.mistakePatterns} />
        </TabsContent>

        {/* Accuracy vs Difficulty */}
        <TabsContent value="accuracy" className="mt-6 space-y-6">
          <AccuracyDifficultyCurve data={data.accuracyDifficulty} />
        </TabsContent>
      </Tabs>

      {/* Share Card Modal */}
      <AnimatePresence>
        {showShareCard && (
          <ShareablePerformanceCard 
            data={data.summary}
            onClose={() => setShowShareCard(false)}
          />
        )}
      </AnimatePresence>
    </div>
  )
}

// ============================================
// SUB-COMPONENTS
// ============================================

// Intelligence Summary Card
interface IntelligenceCardProps {
  icon: React.ReactNode
  label: string
  value: string
  change?: number
  color: 'purple' | 'blue' | 'cyan' | 'success' | 'warning' | 'danger'
}

function IntelligenceCard({ icon, label, value, change, color }: IntelligenceCardProps) {
  const colorClasses = {
    purple: 'bg-purple-100 text-purple-600',
    blue: 'bg-blue-100 text-blue-600',
    cyan: 'bg-cyan-100 text-cyan-600',
    success: 'bg-emerald-100 text-emerald-600',
    warning: 'bg-amber-100 text-amber-600',
    danger: 'bg-red-100 text-red-600'
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className={cn('p-1.5 rounded-lg', colorClasses[color])}>
              {icon}
            </div>
            <span className="text-xs text-gray-500">{label}</span>
          </div>
          <div className="flex items-end gap-2">
            <span className="text-2xl font-bold text-gray-900">{value}</span>
            {change !== undefined && (
              <span className={cn(
                'text-xs font-medium mb-1',
                change >= 0 ? 'text-emerald-600' : 'text-red-600'
              )}>
                {change >= 0 ? '+' : ''}{change.toFixed(2)}
              </span>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

// Mini Ability Chart
function MiniAbilityChart({ data }: { data: ThetaRecord[] }) {
  const maxTheta = 2
  const minTheta = -2
  const range = maxTheta - minTheta

  return (
    <div className="h-32 relative">
      <svg className="w-full h-full" viewBox="0 0 200 80" preserveAspectRatio="none">
        <defs>
          <linearGradient id="abilityGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#2563EB" />
            <stop offset="50%" stopColor="#8B5CF6" />
            <stop offset="100%" stopColor="#EC4899" />
          </linearGradient>
        </defs>
        
        {/* Center line (theta = 0) */}
        <line x1="0" y1="40" x2="200" y2="40" stroke="#E5E7EB" strokeWidth="1" strokeDasharray="4" />
        
        {/* Ability line */}
        <motion.path
          d={`M ${data.map((d, i) => {
            const x = (i / (data.length - 1)) * 200
            const y = 40 - (d.theta / range) * 40
            return `${x} ${y}`
          }).join(' L ')}`}
          fill="none"
          stroke="url(#abilityGradient)"
          strokeWidth="2"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1, ease: 'easeOut' }}
        />
        
        {/* Data points */}
        {data.map((d, i) => {
          const x = (i / (data.length - 1)) * 200
          const y = 40 - (d.theta / range) * 40
          return (
            <motion.circle
              key={i}
              cx={x}
              cy={y}
              r="3"
              fill={d.isCorrect ? '#10B981' : '#EF4444'}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: i * 0.02 }}
            />
          )
        })}
      </svg>
      
      <div className="absolute bottom-0 left-0 right-0 flex justify-between text-xs text-gray-400">
        <span>-2θ</span>
        <span>0</span>
        <span>+2θ</span>
      </div>
    </div>
  )
}

// Guessing Gauge
function GuessingGauge({ guessingRate }: { guessingRate: number }) {
  const getColor = (rate: number) => {
    if (rate < 10) return '#10B981'
    if (rate < 20) return '#F59E0B'
    return '#EF4444'
  }

  const getLabel = (rate: number) => {
    if (rate < 10) return 'Low'
    if (rate < 20) return 'Moderate'
    return 'High'
  }

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-32 h-16 overflow-hidden">
        <svg viewBox="0 0 100 50" className="w-full h-full">
          <defs>
            <linearGradient id="guessGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#10B981" />
              <stop offset="50%" stopColor="#F59E0B" />
              <stop offset="100%" stopColor="#EF4444" />
            </linearGradient>
          </defs>
          
          {/* Background arc */}
          <path
            d="M 10 45 A 40 40 0 0 1 90 45"
            fill="none"
            stroke="#E5E7EB"
            strokeWidth="8"
            strokeLinecap="round"
          />
          
          {/* Progress arc */}
          <motion.path
            d="M 10 45 A 40 40 0 0 1 90 45"
            fill="none"
            stroke="url(#guessGradient)"
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={`${guessingRate * 1.26} 126`}
            initial={{ strokeDasharray: '0 126' }}
            animate={{ strokeDasharray: `${guessingRate * 1.26} 126` }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
          />
        </svg>
        
        <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 text-center">
          <span className="text-2xl font-bold text-gray-900">{guessingRate}%</span>
        </div>
      </div>
      
      <Badge 
        variant="outline"
        className="mt-2"
        style={{ borderColor: getColor(guessingRate), color: getColor(guessingRate) }}
      >
        {getLabel(guessingRate)} Guessing
      </Badge>
    </div>
  )
}

// Mini Mistake List
function MiniMistakeList({ patterns }: { patterns: MistakePattern[] }) {
  return (
    <div className="space-y-2">
      {patterns.map((pattern, idx) => (
        <motion.div
          key={pattern.type}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: idx * 0.1 }}
          className="flex items-center gap-3 p-2 rounded-lg bg-gray-50"
        >
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700 capitalize">{pattern.type}</span>
              <span className="text-xs text-gray-500">{pattern.percentage}%</span>
            </div>
            <div className="h-1.5 bg-gray-200 rounded-full mt-1 overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-amber-500 to-red-500 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${pattern.percentage}%` }}
                transition={{ delay: idx * 0.1 + 0.2, duration: 0.4 }}
              />
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  )
}

// Weak Topic Card with Fix CTA
interface WeakTopicCardProps {
  topic: TopicMasteryCell
  onFix?: (topicId: string) => void
}

function WeakTopicCard({ topic, onFix }: WeakTopicCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className={cn(
        'p-4 rounded-xl border-2 transition-all',
        topic.mastery < 30 
          ? 'border-red-200 bg-red-50/50' 
          : 'border-amber-200 bg-amber-50/50'
      )}
    >
      <div className="flex items-start justify-between mb-2">
        <div>
          <h4 className="font-semibold text-gray-900">{topic.topicName}</h4>
          <p className="text-xs text-gray-500">{topic.subjectName}</p>
        </div>
        <Badge 
          variant="outline"
          className={cn(
            topic.mastery < 30 
              ? 'border-red-300 text-red-600' 
              : 'border-amber-300 text-amber-600'
          )}
        >
          {topic.mastery}%
        </Badge>
      </div>
      
      <div className="flex items-center gap-4 text-xs text-gray-500 mb-3">
        <span>{topic.questionsAttempted} attempts</span>
        <span>•</span>
        <span>{topic.questionsCorrect} correct</span>
      </div>
      
      <Button
        size="sm"
        className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
        onClick={() => onFix?.(topic.topicId)}
      >
        <Sparkles className="h-3.5 w-3.5 mr-2" />
        Fix with Cogni
      </Button>
    </motion.div>
  )
}

// Ability Progression Graph (Full)
function AbilityProgressionGraph({ data }: { data: ThetaRecord[] }) {
  const maxTheta = 2
  const minTheta = -2
  const range = maxTheta - minTheta
  const chartHeight = 300
  const chartWidth = 600

  return (
    <Card className="border border-gray-200 shadow-sm">
      <CardHeader className="border-b border-gray-100 pb-4">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-base font-semibold text-gray-900 flex items-center gap-2">
              <Brain className="h-4 w-4 text-purple-600" />
              Ability Progression (θ over time)
            </CardTitle>
            <CardDescription className="mt-1">
              IRT-based ability estimation showing your learning trajectory
            </CardDescription>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-emerald-500" />
              <span className="text-xs text-gray-500">Correct</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500" />
              <span className="text-xs text-gray-500">Incorrect</span>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        <div className="relative h-80">
          <svg className="w-full h-full" viewBox={`0 0 ${chartWidth} ${chartHeight}`} preserveAspectRatio="none">
            <defs>
              <linearGradient id="abilityFullGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#2563EB" />
                <stop offset="50%" stopColor="#8B5CF6" />
                <stop offset="100%" stopColor="#EC4899" />
              </linearGradient>
              <filter id="glow">
                <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
                <feMerge>
                  <feMergeNode in="coloredBlur"/>
                  <feMergeNode in="SourceGraphic"/>
                </feMerge>
              </filter>
            </defs>
            
            {/* Grid lines */}
            {[-2, -1, 0, 1, 2].map(theta => {
              const y = chartHeight / 2 - (theta / range) * (chartHeight - 40)
              return (
                <g key={theta}>
                  <line 
                    x1="40" 
                    y1={y} 
                    x2={chartWidth - 20} 
                    y2={y} 
                    stroke="#E5E7EB" 
                    strokeWidth="1"
                    strokeDasharray={theta === 0 ? "0" : "4"}
                  />
                  <text 
                    x="30" 
                    y={y + 4} 
                    fill="#9CA3AF" 
                    fontSize="10" 
                    textAnchor="end"
                  >
                    {theta > 0 ? '+' : ''}{theta}θ
                  </text>
                </g>
              )
            })}
            
            {/* Confidence band */}
            <motion.path
              d={`M ${data.map((d, i) => {
                const x = 40 + (i / (data.length - 1)) * (chartWidth - 60)
                const yCenter = chartHeight / 2 - (d.theta / range) * (chartHeight - 40) / 2
                const se = d.standardError * (chartHeight - 40) / range / 2
                return `${x} ${yCenter - se}`
              }).join(' L ')} L ${data.reverse().map((d, i) => {
                const x = 40 + ((data.length - 1 - i) / (data.length - 1)) * (chartWidth - 60)
                const yCenter = chartHeight / 2 - (d.theta / range) * (chartHeight - 40) / 2
                const se = d.standardError * (chartHeight - 40) / range / 2
                return `${x} ${yCenter + se}`
              }).join(' L ')} Z`}
              fill="url(#abilityFullGradient)"
              opacity="0.1"
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.1 }}
              transition={{ duration: 0.5 }}
            />
            
            {/* Main line */}
            <motion.path
              d={`M ${data.map((d, i) => {
                const x = 40 + (i / (data.length - 1)) * (chartWidth - 60)
                const y = chartHeight / 2 - (d.theta / range) * (chartHeight - 40) / 2
                return `${x} ${y}`
              }).join(' L ')}`}
              fill="none"
              stroke="url(#abilityFullGradient)"
              strokeWidth="3"
              strokeLinecap="round"
              filter="url(#glow)"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 1.5, ease: 'easeOut' }}
            />
            
            {/* Data points */}
            {data.map((d, i) => {
              const x = 40 + (i / (data.length - 1)) * (chartWidth - 60)
              const y = chartHeight / 2 - (d.theta / range) * (chartHeight - 40) / 2
              return (
                <motion.circle
                  key={i}
                  cx={x}
                  cy={y}
                  r="5"
                  fill={d.isCorrect ? '#10B981' : '#EF4444'}
                  stroke="white"
                  strokeWidth="2"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: i * 0.02 }}
                />
              )
            })}
          </svg>
          
          {/* Current theta indicator */}
          <div className="absolute top-4 right-4 bg-white border border-gray-200 rounded-lg p-3 shadow-sm">
            <div className="text-xs text-gray-500">Current Ability</div>
            <div className="text-2xl font-bold text-purple-600">
              {data[data.length - 1]?.theta.toFixed(2)}θ
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// Topic Mastery Heatmap Grid
interface TopicMasteryHeatmapGridProps {
  topics: TopicMasteryCell[]
  onFixWithCogni?: (topicId: string) => void
}

function TopicMasteryHeatmapGrid({ topics, onFixWithCogni }: TopicMasteryHeatmapGridProps) {
  const subjects = [...new Set(topics.map(t => t.subjectName))]
  
  const getHeatColor = (mastery: number) => {
    if (mastery < 30) return 'bg-red-500'
    if (mastery < 50) return 'bg-orange-500'
    if (mastery < 70) return 'bg-amber-500'
    if (mastery < 85) return 'bg-emerald-500'
    return 'bg-green-500'
  }

  return (
    <div className="space-y-6">
      {subjects.map(subject => {
        const subjectTopics = topics.filter(t => t.subjectName === subject)
        return (
          <Card key={subject} className="border border-gray-200 shadow-sm">
            <CardHeader className="border-b border-gray-100 pb-3">
              <CardTitle className="text-sm font-semibold text-gray-900">{subject}</CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
                {subjectTopics.map(topic => (
                  <motion.div
                    key={topic.topicId}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    whileHover={{ scale: 1.05 }}
                    className="group relative cursor-pointer"
                    onClick={() => onFixWithCogni?.(topic.topicId)}
                  >
                    <div className={cn(
                      'rounded-lg p-3 text-white transition-all',
                      getHeatColor(topic.mastery)
                    )}>
                      <div className="text-sm font-medium truncate">{topic.topicName}</div>
                      <div className="text-2xl font-bold mt-1">{topic.mastery}%</div>
                      <div className="text-xs opacity-80">{topic.questionsAttempted} questions</div>
                    </div>
                    
                    {/* Hover overlay */}
                    <div className="absolute inset-0 bg-black/60 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <Button size="sm" variant="secondary">
                        <Sparkles className="h-3.5 w-3.5 mr-1" />
                        Fix
                      </Button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        )
      })}
      
      {/* Legend */}
      <div className="flex items-center justify-center gap-6 py-4">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-red-500" />
          <span className="text-xs text-gray-500">&lt;30% Critical</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-orange-500" />
          <span className="text-xs text-gray-500">30-50% Weak</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-amber-500" />
          <span className="text-xs text-gray-500">50-70% Developing</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-emerald-500" />
          <span className="text-xs text-gray-500">70-85% Good</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-green-500" />
          <span className="text-xs text-gray-500">&gt;85% Mastered</span>
        </div>
      </div>
    </div>
  )
}

// Time Efficiency Scatter Plot
function TimeEfficiencyScatter({ data }: { data: TimeEfficiencyPoint[] }) {
  const maxTime = Math.max(...data.map(d => d.timeSpent))
  const chartWidth = 600
  const chartHeight = 300

  return (
    <Card className="border border-gray-200 shadow-sm">
      <CardHeader className="border-b border-gray-100 pb-4">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-base font-semibold text-gray-900 flex items-center gap-2">
              <Timer className="h-4 w-4 text-cyan-600" />
              Time Efficiency Analysis
            </CardTitle>
            <CardDescription className="mt-1">
              Time spent vs accuracy for each question
            </CardDescription>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-emerald-500" />
              <span className="text-xs text-gray-500">Easy</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-amber-500" />
              <span className="text-xs text-gray-500">Medium</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500" />
              <span className="text-xs text-gray-500">Hard</span>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        <div className="relative h-80">
          <svg className="w-full h-full" viewBox={`0 0 ${chartWidth} ${chartHeight}`} preserveAspectRatio="none">
            {/* Grid */}
            {[0, 25, 50, 75, 100].map(percent => {
              const y = chartHeight - (percent / 100) * (chartHeight - 40)
              return (
                <g key={percent}>
                  <line 
                    x1="50" 
                    y1={y} 
                    x2={chartWidth - 20} 
                    y2={y} 
                    stroke="#E5E7EB" 
                    strokeWidth="1"
                    strokeDasharray="4"
                  />
                  <text 
                    x="40" 
                    y={y + 4} 
                    fill="#9CA3AF" 
                    fontSize="10" 
                    textAnchor="end"
                  >
                    {percent}s
                  </text>
                </g>
              )
            })}
            
            {/* Optimal zone indicator */}
            <rect
              x="50"
              y={chartHeight - (60 / maxTime) * (chartHeight - 40)}
              width={chartWidth - 70}
              height={(30 / maxTime) * (chartHeight - 40)}
              fill="#10B981"
              opacity="0.1"
              rx="4"
            />
            
            {/* Data points */}
            {data.map((point, i) => {
              const x = 50 + (i / data.length) * (chartWidth - 70)
              const y = chartHeight - (point.timeSpent / maxTime) * (chartHeight - 40)
              const color = point.difficulty === 'easy' ? '#10B981' : point.difficulty === 'medium' ? '#F59E0B' : '#EF4444'
              
              return (
                <motion.circle
                  key={i}
                  cx={x}
                  cy={y}
                  r={point.isCorrect ? 6 : 4}
                  fill={point.isCorrect ? color : 'transparent'}
                  stroke={color}
                  strokeWidth={2}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: i * 0.01 }}
                />
              )
            })}
          </svg>
          
          {/* Optimal zone label */}
          <div className="absolute top-8 right-8 bg-emerald-50 border border-emerald-200 rounded-lg p-2 text-xs text-emerald-700">
            <Zap className="h-3 w-3 inline mr-1" />
            Optimal: 30-60s
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// Mistake Pattern Analysis
function MistakePatternAnalysis({ patterns }: { patterns: MistakePattern[] }) {
  return (
    <div className="space-y-4">
      <Card className="border border-gray-200 shadow-sm">
        <CardHeader className="border-b border-gray-100 pb-4">
          <CardTitle className="text-base font-semibold text-gray-900 flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-amber-600" />
            Mistake Pattern Detection
          </CardTitle>
          <CardDescription className="mt-1">
            AI-detected patterns in your mistakes with suggested fixes
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y divide-gray-100">
            {patterns.map((pattern, idx) => (
              <motion.div
                key={pattern.type}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="p-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-start gap-4">
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold text-gray-900 capitalize">{pattern.type} Mistakes</h4>
                      <Badge 
                        variant="outline"
                        className={cn(
                          pattern.percentage > 30 && 'border-red-300 text-red-600',
                          pattern.percentage > 15 && pattern.percentage <= 30 && 'border-amber-300 text-amber-600',
                          pattern.percentage <= 15 && 'border-emerald-300 text-emerald-600'
                        )}
                      >
                        {pattern.percentage}% ({pattern.count})
                      </Badge>
                    </div>
                    
                    <div className="h-2 bg-gray-100 rounded-full mb-3 overflow-hidden">
                      <motion.div
                        className="h-full bg-gradient-to-r from-amber-500 to-red-500 rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${pattern.percentage}%` }}
                        transition={{ delay: idx * 0.1 + 0.2, duration: 0.5 }}
                      />
                    </div>
                    
                    <div className="flex flex-wrap gap-2 mb-3">
                      {pattern.recentExamples.map((example, i) => (
                        <Badge key={i} variant="secondary" className="text-xs">
                          {example}
                        </Badge>
                      ))}
                    </div>
                    
                    <div className="flex items-start gap-2 p-3 rounded-lg bg-blue-50 border border-blue-100">
                      <Lightbulb className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                      <p className="text-sm text-blue-700">{pattern.suggestedFix}</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// Accuracy vs Difficulty Curve
function AccuracyDifficultyCurve({ data }: { data: AccuracyDifficultyPoint[] }) {
  const chartWidth = 600
  const chartHeight = 300

  return (
    <Card className="border border-gray-200 shadow-sm">
      <CardHeader className="border-b border-gray-100 pb-4">
        <CardTitle className="text-base font-semibold text-gray-900 flex items-center gap-2">
          <Gauge className="h-4 w-4 text-blue-600" />
          Accuracy vs Difficulty Curve
        </CardTitle>
        <CardDescription className="mt-1">
          How your accuracy changes with question difficulty
        </CardDescription>
      </CardHeader>
      <CardContent className="p-6">
        <div className="relative h-80">
          <svg className="w-full h-full" viewBox={`0 0 ${chartWidth} ${chartHeight}`} preserveAspectRatio="none">
            <defs>
              <linearGradient id="accuracyGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#2563EB" />
                <stop offset="100%" stopColor="#2563EB" stopOpacity="0.1" />
              </linearGradient>
            </defs>
            
            {/* Grid */}
            {[0, 25, 50, 75, 100].map(val => {
              const y = chartHeight - (val / 100) * (chartHeight - 40)
              return (
                <g key={val}>
                  <line 
                    x1="50" 
                    y1={y} 
                    x2={chartWidth - 20} 
                    y2={y} 
                    stroke="#E5E7EB" 
                    strokeWidth="1"
                    strokeDasharray="4"
                  />
                  <text 
                    x="40" 
                    y={y + 4} 
                    fill="#9CA3AF" 
                    fontSize="10" 
                    textAnchor="end"
                  >
                    {val}%
                  </text>
                </g>
              )
            })}
            
            {/* X-axis labels */}
            {[0, 25, 50, 75, 100].map(val => {
              const x = 50 + (val / 100) * (chartWidth - 70)
              return (
                <text 
                  key={val}
                  x={x} 
                  y={chartHeight - 5} 
                  fill="#9CA3AF" 
                  fontSize="10" 
                  textAnchor="middle"
                >
                  {val}
                </text>
              )
            })}
            
            {/* Area under curve */}
            <motion.path
              d={`M 50 ${chartHeight - (data[0]?.accuracy || 0) / 100 * (chartHeight - 40)} 
                  ${data.map(d => {
                    const x = 50 + (d.difficulty / 100) * (chartWidth - 70)
                    const y = chartHeight - (d.accuracy / 100) * (chartHeight - 40)
                    return `L ${x} ${y}`
                  }).join(' ')} 
                  L ${chartWidth - 20} ${chartHeight} L 50 ${chartHeight} Z`}
              fill="url(#accuracyGradient)"
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.3 }}
              transition={{ duration: 0.5 }}
            />
            
            {/* Curve line */}
            <motion.path
              d={`M ${data.map((d, i) => {
                const x = 50 + (d.difficulty / 100) * (chartWidth - 70)
                const y = chartHeight - (d.accuracy / 100) * (chartHeight - 40)
                return `${x} ${y}`
              }).join(' L ')}`}
              fill="none"
              stroke="#2563EB"
              strokeWidth="3"
              strokeLinecap="round"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 1, ease: 'easeOut' }}
            />
            
            {/* Data points */}
            {data.map((d, i) => {
              const x = 50 + (d.difficulty / 100) * (chartWidth - 70)
              const y = chartHeight - (d.accuracy / 100) * (chartHeight - 40)
              const radius = Math.max(4, Math.min(10, d.count / 5))
              
              return (
                <motion.circle
                  key={i}
                  cx={x}
                  cy={y}
                  r={radius}
                  fill="#2563EB"
                  stroke="white"
                  strokeWidth="2"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: i * 0.05 }}
                />
              )
            })}
          </svg>
          
          {/* Axis labels */}
          <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 text-xs text-gray-500">
            Question Difficulty →
          </div>
          <div className="absolute left-0 top-1/2 transform -rotate-90 -translate-y-1/2 text-xs text-gray-500">
            Accuracy % →
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// Shareable Performance Card
interface ShareablePerformanceCardProps {
  data: PerformanceAnalyticsData['summary']
  onClose: () => void
}

function ShareablePerformanceCard({ data, onClose }: ShareablePerformanceCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        onClick={e => e.stopPropagation()}
        className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold">Performance Card</h3>
            <button onClick={onClose} className="p-1 hover:bg-white/20 rounded-lg transition-colors">
              <X className="h-5 w-5" />
            </button>
          </div>
          
          <div className="text-center">
            <div className="text-5xl font-bold mb-2">{data.currentTheta.toFixed(2)}θ</div>
            <div className="text-blue-100">Current Ability Estimate</div>
          </div>
        </div>
        
        {/* Stats */}
        <div className="p-6">
          <div className="grid grid-cols-3 gap-4 text-center mb-6">
            <div>
              <div className="text-2xl font-bold text-gray-900">{data.overallMastery}%</div>
              <div className="text-xs text-gray-500">Mastery</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">{data.efficiency}m</div>
              <div className="text-xs text-gray-500">Avg Time/Q</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">{data.guessingRate}%</div>
              <div className="text-xs text-gray-500">Guessing</div>
            </div>
          </div>
          
          <div className="space-y-3 mb-6">
            <div className="flex items-center justify-between p-3 bg-emerald-50 rounded-lg">
              <span className="text-sm text-emerald-700">Strong Areas</span>
              <span className="text-sm font-medium text-emerald-700">{data.strongestAreas.join(', ') || 'None'}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
              <span className="text-sm text-red-700">Weak Areas</span>
              <span className="text-sm font-medium text-red-700">{data.weakestAreas.join(', ') || 'None'}</span>
            </div>
          </div>
          
          <div className="flex gap-3">
            <Button variant="outline" className="flex-1">
              <Download className="h-4 w-4 mr-2" />
              Save Image
            </Button>
            <Button className="flex-1 bg-blue-600 hover:bg-blue-700">
              <Share2 className="h-4 w-4 mr-2" />
              Share
            </Button>
          </div>
        </div>
        
        {/* Footer */}
        <div className="px-6 py-3 bg-gray-50 border-t border-gray-100">
          <div className="flex items-center justify-center gap-2 text-xs text-gray-500">
            <Brain className="h-3 w-3" />
            <span>Generated by Cognify Test Engine</span>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}

// ============================================
// DEFAULT EXPORT
// ============================================

export { EnhancedAnalyticsCanvas as AnalyticsCanvas }
export type { PerformanceAnalyticsData, ThetaRecord, TopicMasteryCell, TimeEfficiencyPoint, MistakePattern, GuessingIndicator, AccuracyDifficultyPoint }
