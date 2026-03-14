'use client'

import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Brain,
  Target,
  TrendingDown,
  TrendingUp,
  AlertTriangle,
  BookOpen,
  Video,
  Headphones,
  FileText,
  Layers,
  Sparkles,
  ChevronRight,
  ArrowRight,
  Clock,
  BarChart3,
  LineChart,
  CheckCircle2,
  Lightbulb,
  Zap,
  Calendar,
  X,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

// Types
export interface WeakTopic {
  id: string
  topic: string
  chapter: string
  subject: string
  accuracy: number // 0-100
  attempts: number
  lastAttemptDate: string
  trend: 'declining' | 'stable' | 'improving'
  urgency: 'high' | 'medium' | 'low'
  recommendedResources: RecommendedResource[]
  conceptGaps: string[]
  practiceNeeded: number
}

export interface RecommendedResource {
  id: string
  title: string
  type: 'Notes' | 'Video' | 'Audio' | 'Quiz' | 'Interactive'
  relevance: number // 0-100
  duration: number // minutes
  reason: string
}

export interface MasteryTimeline {
  date: string
  mastery: number // 0-100
  testsTaken: number
  avgAccuracy: number
}

export interface ConceptMastery {
  concept: string
  mastery: number
  lastWeek: number
  change: number
}

export interface TestAnalyticsIntegrationProps {
  weakTopics?: WeakTopic[]
  masteryTimeline?: MasteryTimeline[]
  conceptMastery?: ConceptMastery[]
  onResourceClick?: (resourceId: string) => void
  onPracticeClick?: (topicId: string) => void
  className?: string
}

// Urgency colors
const urgencyColors = {
  high: { bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-700', badge: 'bg-red-100 text-red-700' },
  medium: { bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-700', badge: 'bg-amber-100 text-amber-700' },
  low: { bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-700', badge: 'bg-green-100 text-green-700' },
}

// Resource type icons
const typeIcons: Record<string, React.ElementType> = {
  Notes: FileText,
  Video: Video,
  Audio: Headphones,
  Quiz: Target,
  Interactive: Layers,
}

// Mastery Timeline Chart
function MasteryTimelineChart({ data }: { data: MasteryTimeline[] }) {
  const width = 400
  const height = 150
  const padding = 30
  
  const xMax = data.length - 1
  const yMax = 100
  
  const points = data.map((d, i) => ({
    x: padding + (i / xMax) * (width - 2 * padding),
    y: height - padding - (d.mastery / yMax) * (height - 2 * padding),
    data: d,
  }))
  
  const pathD = points.reduce((acc, p, i) => {
    if (i === 0) return `M ${p.x} ${p.y}`
    const prev = points[i - 1]
    const cpX = (prev.x + p.x) / 2
    return `${acc} C ${cpX} ${prev.y}, ${cpX} ${p.y}, ${p.x} ${p.y}`
  }, '')
  
  return (
    <div className="relative">
      <svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`} className="overflow-visible">
        {/* Grid */}
        {[0, 25, 50, 75, 100].map(percent => (
          <g key={percent}>
            <line
              x1={padding}
              y1={height - padding - (percent / 100) * (height - 2 * padding)}
              x2={width - padding}
              y2={height - padding - (percent / 100) * (height - 2 * padding)}
              stroke="#E5E7EB"
              strokeWidth="1"
              strokeDasharray="4 4"
            />
            <text
              x={padding - 5}
              y={height - padding - (percent / 100) * (height - 2 * padding)}
              textAnchor="end"
              alignmentBaseline="middle"
              className="text-xs fill-gray-400"
            >
              {percent}%
            </text>
          </g>
        ))}
        
        {/* Area fill */}
        <motion.path
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          d={`${pathD} L ${points[points.length - 1].x} ${height - padding} L ${points[0].x} ${height - padding} Z`}
          fill="url(#masteryGradient)"
        />
        
        {/* Line */}
        <motion.path
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1.5, ease: 'easeOut' }}
          d={pathD}
          fill="none"
          stroke="url(#lineGradient)"
          strokeWidth="3"
          strokeLinecap="round"
        />
        
        {/* Gradients */}
        <defs>
          <linearGradient id="masteryGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#8B5CF6" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#8B5CF6" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#7C3AED" />
            <stop offset="100%" stopColor="#A78BFA" />
          </linearGradient>
        </defs>
        
        {/* Points */}
        {points.map((p, i) => (
          <motion.circle
            key={i}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: i * 0.1 + 0.5 }}
            cx={p.x}
            cy={p.y}
            r="4"
            className="fill-violet-500"
          />
        ))}
      </svg>
      
      {/* X-axis labels */}
      <div className="flex justify-between px-8 mt-2">
        {data.filter((_, i) => i % Math.ceil(data.length / 5) === 0).map((d, i) => (
          <span key={i} className="text-xs text-gray-500">{d.date}</span>
        ))}
      </div>
    </div>
  )
}

// Concept Mastery Bar
function ConceptMasteryBar({ concept }: { concept: ConceptMastery }) {
  const isImproved = concept.change > 0
  
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-sm">
        <span className="text-gray-700">{concept.concept}</span>
        <div className="flex items-center gap-2">
          <span className="font-medium text-gray-900">{concept.mastery}%</span>
          <span className={cn(
            'text-xs flex items-center',
            isImproved ? 'text-green-600' : 'text-red-500'
          )}>
            {isImproved ? (
              <TrendingUp className="h-3 w-3 mr-0.5" />
            ) : (
              <TrendingDown className="h-3 w-3 mr-0.5" />
            )}
            {Math.abs(concept.change)}%
          </span>
        </div>
      </div>
      <Progress value={concept.mastery} className="h-2" />
    </div>
  )
}

// Weak Topic Card
function WeakTopicCard({
  topic,
  onResourceClick,
  onPracticeClick,
}: {
  topic: WeakTopic
  onResourceClick?: (resourceId: string) => void
  onPracticeClick?: () => void
}) {
  const [expanded, setExpanded] = useState(false)
  const colors = urgencyColors[topic.urgency]
  
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className={cn(
        'rounded-2xl border-2 overflow-hidden transition-all',
        colors.bg,
        colors.border
      )}
    >
      <div className="p-4">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className={cn(
              'w-12 h-12 rounded-xl flex items-center justify-center',
              topic.urgency === 'high' ? 'bg-red-500' :
              topic.urgency === 'medium' ? 'bg-amber-500' : 'bg-green-500'
            )}>
              {topic.urgency === 'high' ? (
                <AlertTriangle className="h-6 w-6 text-white" />
              ) : (
                <Target className="h-6 w-6 text-white" />
              )}
            </div>
            
            <div>
              <h4 className="font-semibold text-gray-900">{topic.topic}</h4>
              <p className="text-sm text-gray-500">{topic.subject} • {topic.chapter}</p>
            </div>
          </div>
          
          <div className="text-right">
            <Badge className={cn('border-0', colors.badge)}>
              {topic.urgency === 'high' ? 'Needs Attention' : 
               topic.urgency === 'medium' ? 'Practice Needed' : 'On Track'}
            </Badge>
          </div>
        </div>
        
        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mb-4">
          <div className="bg-white/60 rounded-lg p-2 text-center">
            <div className="text-lg font-bold text-gray-900">{topic.accuracy}%</div>
            <div className="text-xs text-gray-500">Accuracy</div>
          </div>
          <div className="bg-white/60 rounded-lg p-2 text-center">
            <div className="text-lg font-bold text-gray-900">{topic.attempts}</div>
            <div className="text-xs text-gray-500">Attempts</div>
          </div>
          <div className="bg-white/60 rounded-lg p-2 text-center">
            <div className="text-lg font-bold text-gray-900">{topic.practiceNeeded}</div>
            <div className="text-xs text-gray-500">Practice Left</div>
          </div>
        </div>
        
        {/* Trend */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2 text-sm">
            {topic.trend === 'improving' ? (
              <>
                <TrendingUp className="h-4 w-4 text-green-500" />
                <span className="text-green-600">Improving</span>
              </>
            ) : topic.trend === 'declining' ? (
              <>
                <TrendingDown className="h-4 w-4 text-red-500" />
                <span className="text-red-600">Declining</span>
              </>
            ) : (
              <>
                <BarChart3 className="h-4 w-4 text-gray-400" />
                <span className="text-gray-500">Stable</span>
              </>
            )}
          </div>
          
          <span className="text-xs text-gray-500">
            Last attempt: {topic.lastAttemptDate}
          </span>
        </div>
        
        {/* Concept Gaps */}
        <div className="mb-4">
          <div className="text-xs text-gray-500 mb-2">Concept Gaps</div>
          <div className="flex flex-wrap gap-1.5">
            {topic.conceptGaps.map((gap, i) => (
              <Badge key={i} variant="secondary" className="text-xs bg-white border-gray-200">
                {gap}
              </Badge>
            ))}
          </div>
        </div>
        
        {/* Actions */}
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setExpanded(!expanded)}
            className="flex-1 border-gray-200"
          >
            {expanded ? 'Hide' : 'View'} Resources ({topic.recommendedResources.length})
            <ChevronRight className={cn('h-4 w-4 ml-1 transition-transform', expanded && 'rotate-90')} />
          </Button>
          
          <Button
            size="sm"
            onClick={onPracticeClick}
            className="bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700"
          >
            <Zap className="h-4 w-4 mr-1.5" />
            Practice
          </Button>
        </div>
      </div>
      
      {/* Expanded Resources */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-t border-gray-200 overflow-hidden"
          >
            <div className="p-4 space-y-2 bg-white/40">
              {topic.recommendedResources.map((resource) => {
                const TypeIcon = typeIcons[resource.type] || FileText
                
                return (
                  <motion.button
                    key={resource.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    whileHover={{ scale: 1.01 }}
                    onClick={() => onResourceClick?.(resource.id)}
                    className="w-full flex items-center gap-3 p-3 bg-white rounded-xl border border-gray-100 hover:border-violet-200 transition-all text-left"
                  >
                    <div className={cn(
                      'w-10 h-10 rounded-lg flex items-center justify-center',
                      'bg-gradient-to-br from-violet-500 to-purple-500'
                    )}>
                      <TypeIcon className="h-5 w-5 text-white" />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-gray-900 truncate">{resource.title}</div>
                      <div className="text-xs text-gray-500 flex items-center gap-2">
                        <span>{resource.type}</span>
                        <span>•</span>
                        <span className="flex items-center gap-0.5">
                          <Clock className="h-3 w-3" />
                          {resource.duration} min
                        </span>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <Badge className="bg-green-100 text-green-700 border-0">
                        {resource.relevance}% match
                      </Badge>
                      <div className="text-xs text-gray-400 mt-1">{resource.reason}</div>
                    </div>
                  </motion.button>
                )
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

// Generate demo data
function generateWeakTopics(): WeakTopic[] {
  return [
    {
      id: '1',
      topic: 'Electrostatics',
      chapter: 'Electric Charges',
      subject: 'Physics',
      accuracy: 35,
      attempts: 12,
      lastAttemptDate: '2 days ago',
      trend: 'declining',
      urgency: 'high',
      conceptGaps: ['Coulomb\'s Law', 'Electric Field Lines', 'Gauss\'s Theorem'],
      practiceNeeded: 8,
      recommendedResources: [
        { id: 'r1', title: 'Coulomb\'s Law - Complete Guide', type: 'Video', relevance: 95, duration: 25, reason: 'Addresses #1 gap' },
        { id: 'r2', title: 'Electric Field Practice Problems', type: 'Quiz', relevance: 88, duration: 15, reason: 'Builds problem skills' },
        { id: 'r3', title: 'Gauss\'s Theorem Explained', type: 'Notes', relevance: 82, duration: 20, reason: 'Concept clarity' },
      ],
    },
    {
      id: '2',
      topic: 'Organic Reaction Mechanisms',
      chapter: 'Organic Chemistry',
      subject: 'Chemistry',
      accuracy: 52,
      attempts: 8,
      lastAttemptDate: '1 day ago',
      trend: 'stable',
      urgency: 'medium',
      conceptGaps: ['SN1 vs SN2', 'Electrophilic Addition'],
      practiceNeeded: 5,
      recommendedResources: [
        { id: 'r4', title: 'Reaction Mechanisms Deep Dive', type: 'Video', relevance: 90, duration: 35, reason: 'Core concepts' },
      ],
    },
    {
      id: '3',
      topic: 'Integration Techniques',
      chapter: 'Calculus',
      subject: 'Mathematics',
      accuracy: 68,
      attempts: 15,
      lastAttemptDate: '3 days ago',
      trend: 'improving',
      urgency: 'low',
      conceptGaps: ['Substitution Method'],
      practiceNeeded: 3,
      recommendedResources: [
        { id: 'r5', title: 'Integration Practice Set', type: 'Quiz', relevance: 85, duration: 20, reason: 'Speed improvement' },
      ],
    },
  ]
}

function generateMasteryTimeline(): MasteryTimeline[] {
  const data = []
  for (let i = 6; i >= 0; i--) {
    const date = new Date()
    date.setDate(date.getDate() - i)
    data.push({
      date: date.toLocaleDateString('en-US', { weekday: 'short' }),
      mastery: Math.min(100, 45 + (6 - i) * 8 + Math.random() * 5),
      testsTaken: Math.floor(Math.random() * 3) + 1,
      avgAccuracy: Math.min(100, 50 + (6 - i) * 7 + Math.random() * 10),
    })
  }
  return data
}

function generateConceptMastery(): ConceptMastery[] {
  return [
    { concept: 'Mechanics', mastery: 78, lastWeek: 72, change: 6 },
    { concept: 'Thermodynamics', mastery: 65, lastWeek: 70, change: -5 },
    { concept: 'Electrostatics', mastery: 42, lastWeek: 38, change: 4 },
    { concept: 'Organic Chemistry', mastery: 55, lastWeek: 52, change: 3 },
    { concept: 'Calculus', mastery: 72, lastWeek: 68, change: 4 },
  ]
}

export function TestAnalyticsIntegration({
  weakTopics: providedWeakTopics,
  masteryTimeline: providedTimeline,
  conceptMastery: providedMastery,
  onResourceClick,
  onPracticeClick,
  className,
}: TestAnalyticsIntegrationProps) {
  const weakTopics = providedWeakTopics || generateWeakTopics()
  const masteryTimeline = providedTimeline || generateMasteryTimeline()
  const conceptMastery = providedMastery || generateConceptMastery()
  
  // Stats
  const avgAccuracy = Math.round(weakTopics.reduce((sum, t) => sum + t.accuracy, 0) / weakTopics.length)
  const highUrgencyCount = weakTopics.filter(t => t.urgency === 'high').length
  const currentMastery = masteryTimeline[masteryTimeline.length - 1]?.mastery || 0
  const weeklyImprovement = currentMastery - (masteryTimeline[0]?.mastery || 0)
  
  return (
    <div className={cn('space-y-6', className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
            <Brain className="h-5 w-5 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Test Analytics</h2>
            <p className="text-sm text-gray-500">AI-powered learning suggestions</p>
          </div>
        </div>
        
        <Badge className="bg-violet-100 text-violet-700 border-0">
          <Sparkles className="h-3 w-3 mr-1" />
          AI Analysis
        </Badge>
      </div>
      
      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { icon: Target, label: 'Avg Accuracy', value: `${avgAccuracy}%`, color: 'from-blue-500 to-cyan-500' },
          { icon: AlertTriangle, label: 'Need Attention', value: highUrgencyCount, color: 'from-red-500 to-orange-500' },
          { icon: TrendingUp, label: 'Weekly Growth', value: `+${weeklyImprovement.toFixed(1)}%`, color: 'from-green-500 to-emerald-500' },
          { icon: Lightbulb, label: 'Resources Suggested', value: weakTopics.reduce((s, t) => s + t.recommendedResources.length, 0), color: 'from-amber-500 to-yellow-500' },
        ].map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="p-4 border-gray-100 rounded-2xl">
              <div className="flex items-center gap-3">
                <div className={cn(
                  'w-10 h-10 rounded-lg flex items-center justify-center bg-gradient-to-br',
                  stat.color
                )}>
                  <stat.icon className="h-5 w-5 text-white" />
                </div>
                <div>
                  <div className="text-xl font-bold text-gray-900">{stat.value}</div>
                  <div className="text-xs text-gray-500">{stat.label}</div>
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Mastery Timeline */}
        <div className="lg:col-span-2">
          <Card className="p-4 border-gray-100 rounded-2xl">
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <LineChart className="h-5 w-5 text-violet-500" />
              Mastery Timeline
            </h3>
            
            <MasteryTimelineChart data={masteryTimeline} />
            
            {/* Legend */}
            <div className="flex items-center justify-center gap-6 mt-4 text-sm text-gray-500">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-violet-500" />
                <span>Mastery Level</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <span>Last 7 days</span>
              </div>
            </div>
          </Card>
        </div>
        
        {/* Concept Mastery */}
        <div>
          <Card className="p-4 border-gray-100 rounded-2xl h-full">
            <h3 className="font-semibold text-gray-900 mb-4">Concept Mastery</h3>
            
            <div className="space-y-4">
              {conceptMastery.map((concept, index) => (
                <motion.div
                  key={concept.concept}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <ConceptMasteryBar concept={concept} />
                </motion.div>
              ))}
            </div>
          </Card>
        </div>
      </div>
      
      {/* Weak Topics */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-900 flex items-center gap-2">
            <Target className="h-5 w-5 text-red-500" />
            Areas Needing Improvement
          </h3>
          
          <Button variant="ghost" size="sm" className="text-violet-600 hover:text-violet-700 hover:bg-violet-50">
            View All Analysis
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {weakTopics.map((topic) => (
            <WeakTopicCard
              key={topic.id}
              topic={topic}
              onResourceClick={onResourceClick}
              onPracticeClick={() => {
                onPracticeClick?.(topic.id)
                toast.info(`Starting practice for ${topic.topic}...`)
              }}
            />
          ))}
        </div>
      </div>
      
      {/* AI Suggestion Banner */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Card className="p-4 bg-gradient-to-r from-violet-500 to-purple-600 text-white border-0 rounded-2xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                <Sparkles className="h-6 w-6" />
              </div>
              <div>
                <h4 className="font-semibold text-lg">AI Study Plan Ready</h4>
                <p className="text-violet-100 text-sm">
                  Based on your test results, we've created a personalized 7-day study plan
                </p>
              </div>
            </div>
            
            <Button 
              variant="secondary"
              className="bg-white text-violet-700 hover:bg-violet-50"
            >
              View Study Plan
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </Card>
      </motion.div>
    </div>
  )
}

export default TestAnalyticsIntegration
