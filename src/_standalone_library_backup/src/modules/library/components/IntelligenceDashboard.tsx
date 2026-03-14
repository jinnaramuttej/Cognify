'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Skeleton } from '@/components/ui/skeleton'
import { ScrollArea } from '@/components/ui/scroll-area'
import { cn } from '@/lib/utils'
import {
  Brain,
  TrendingUp,
  TrendingDown,
  Target,
  Clock,
  BookOpen,
  ChevronRight,
  Sparkles,
  Zap,
  AlertTriangle,
  CheckCircle2,
  Play,
  ArrowRight,
  RefreshCw,
} from 'lucide-react'
import { useIntelligence } from '../hooks/useIntelligence'
import type { WeakTopicRecommendation, ContinueLearningItem } from '../types'

interface IntelligenceDashboardProps {
  onResourceClick: (resourceId: string) => void
  grade?: string | null
  exam?: string | null
}

export function IntelligenceDashboard({
  onResourceClick,
  grade,
  exam,
}: IntelligenceDashboardProps) {
  const {
    weakTopics,
    continueLearning,
    masteryAwareRecommendations,
    masteryProfile,
    insights,
    isLoading,
    error,
    refresh,
  } = useIntelligence({ grade, exam, includeResources: true })

  const [activeSection, setActiveSection] = useState<'weak' | 'continue' | 'mastery'>('weak')

  if (error) {
    return (
      <Card className="p-6 bg-red-50 border-red-200">
        <div className="text-center">
          <AlertTriangle className="h-8 w-8 text-red-500 mx-auto mb-2" />
          <p className="text-red-600">{error}</p>
          <Button variant="outline" size="sm" onClick={refresh} className="mt-3">
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry
          </Button>
        </div>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {/* Header with Insights */}
      {insights && !isLoading && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-3"
        >
          <InsightCard
            icon={Clock}
            label="Study Time"
            value={formatStudyTime(insights.totalStudyTime)}
            color="blue"
          />
          <InsightCard
            icon={Target}
            label="Avg Mastery"
            value={`${Math.round(insights.averageMastery)}%`}
            progress={insights.averageMastery}
            color="emerald"
          />
          <InsightCard
            icon={CheckCircle2}
            label="Completed"
            value={insights.resourcesCompleted.toString()}
            color="purple"
          />
          <InsightCard
            icon={AlertTriangle}
            label="Need Review"
            value={insights.topicsNeedingReview.toString()}
            highlight={insights.topicsNeedingReview > 0}
            color="orange"
          />
        </motion.div>
      )}

      {/* Section Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        <Button
          variant={activeSection === 'weak' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setActiveSection('weak')}
          className={cn(
            'gap-2 rounded-lg flex-shrink-0',
            activeSection === 'weak' && 'bg-gradient-to-r from-orange-500 to-red-500 text-white'
          )}
        >
          <AlertTriangle className="h-4 w-4" />
          Weak Topics
          {weakTopics.length > 0 && (
            <Badge variant="secondary" className="ml-1 bg-white/20 text-inherit">
              {weakTopics.length}
            </Badge>
          )}
        </Button>
        <Button
          variant={activeSection === 'continue' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setActiveSection('continue')}
          className={cn(
            'gap-2 rounded-lg flex-shrink-0',
            activeSection === 'continue' && 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white'
          )}
        >
          <Play className="h-4 w-4" />
          Continue
          {continueLearning.length > 0 && (
            <Badge variant="secondary" className="ml-1 bg-white/20 text-inherit">
              {continueLearning.length}
            </Badge>
          )}
        </Button>
        <Button
          variant={activeSection === 'mastery' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setActiveSection('mastery')}
          className={cn(
            'gap-2 rounded-lg flex-shrink-0',
            activeSection === 'mastery' && 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white'
          )}
        >
          <Sparkles className="h-4 w-4" />
          For You
          {masteryAwareRecommendations.length > 0 && (
            <Badge variant="secondary" className="ml-1 bg-white/20 text-inherit">
              {masteryAwareRecommendations.length}
            </Badge>
          )}
        </Button>
      </div>

      {/* Content Sections */}
      <AnimatePresence mode="wait">
        {isLoading ? (
          <LoadingState key="loading" />
        ) : activeSection === 'weak' ? (
          <WeakTopicsSection
            key="weak"
            weakTopics={weakTopics}
            onResourceClick={onResourceClick}
          />
        ) : activeSection === 'continue' ? (
          <ContinueSection
            key="continue"
            items={continueLearning}
            onResourceClick={onResourceClick}
          />
        ) : (
          <MasterySection
            key="mastery"
            recommendations={masteryAwareRecommendations}
            masteryProfile={masteryProfile}
            onResourceClick={onResourceClick}
          />
        )}
      </AnimatePresence>
    </div>
  )
}

// Insight Card
function InsightCard({
  icon: Icon,
  label,
  value,
  progress,
  color,
  highlight,
}: {
  icon: any
  label: string
  value: string
  progress?: number
  color: string
  highlight?: boolean
}) {
  const colorClasses = {
    blue: 'from-blue-500 to-blue-600',
    emerald: 'from-emerald-500 to-emerald-600',
    purple: 'from-purple-500 to-purple-600',
    orange: 'from-orange-500 to-orange-600',
  }

  return (
    <motion.div whileHover={{ scale: 1.02 }}>
      <Card className={cn(
        'p-3 transition-all',
        highlight ? 'bg-orange-50 border-orange-200' : 'bg-white border-gray-100'
      )}>
        <div className="flex items-center gap-2">
          <div className={cn(
            'w-8 h-8 rounded-lg bg-gradient-to-br flex items-center justify-center text-white',
            colorClasses[color as keyof typeof colorClasses]
          )}>
            <Icon className="h-4 w-4" />
          </div>
          <div className="min-w-0">
            <p className="text-xs text-gray-500">{label}</p>
            <p className={cn(
              'font-semibold truncate',
              highlight ? 'text-orange-600' : 'text-gray-900'
            )}>{value}</p>
          </div>
        </div>
        {progress !== undefined && (
          <Progress value={progress} className="h-1 mt-2" />
        )}
      </Card>
    </motion.div>
  )
}

// Weak Topics Section
function WeakTopicsSection({
  weakTopics,
  onResourceClick,
}: {
  weakTopics: WeakTopicRecommendation[]
  onResourceClick: (id: string) => void
}) {
  if (weakTopics.length === 0) {
    return (
      <Card className="p-6 bg-gradient-to-br from-emerald-50 to-teal-50 border-emerald-200">
        <div className="text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center mx-auto mb-3 shadow-lg"
          >
            <Sparkles className="h-7 w-7 text-white" />
          </motion.div>
          <h3 className="font-semibold text-gray-900">Great Progress!</h3>
          <p className="text-sm text-gray-600 mt-1">No weak topics detected</p>
        </div>
      </Card>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="space-y-3"
    >
      {weakTopics.slice(0, 3).map((topic, index) => (
        <WeakTopicCard
          key={topic.id}
          topic={topic}
          index={index}
          onResourceClick={onResourceClick}
        />
      ))}
    </motion.div>
  )
}

// Weak Topic Card
function WeakTopicCard({
  topic,
  index,
  onResourceClick,
}: {
  topic: WeakTopicRecommendation
  index: number
  onResourceClick: (id: string) => void
}) {
  const [expanded, setExpanded] = useState(false)

  const urgencyConfig = {
    high: { bg: 'from-red-50 to-orange-50', border: 'border-red-200', badge: 'bg-red-100 text-red-700' },
    medium: { bg: 'from-amber-50 to-yellow-50', border: 'border-amber-200', badge: 'bg-amber-100 text-amber-700' },
    low: { bg: 'from-blue-50 to-indigo-50', border: 'border-blue-200', badge: 'bg-blue-100 text-blue-700' },
  }

  const config = urgencyConfig[topic.urgency]

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05 }}
    >
      <Card
        className={cn('overflow-hidden border', config.border)}
        onClick={() => setExpanded(!expanded)}
      >
        <div className={cn('p-4 bg-gradient-to-r', config.bg)}>
          <div className="flex items-start gap-3">
            <div className={cn(
              'w-10 h-10 rounded-xl flex items-center justify-center',
              topic.urgency === 'high' ? 'bg-red-200' : topic.urgency === 'medium' ? 'bg-amber-200' : 'bg-blue-200'
            )}>
              <AlertTriangle className={cn(
                'h-5 w-5',
                topic.urgency === 'high' ? 'text-red-600' : topic.urgency === 'medium' ? 'text-amber-600' : 'text-blue-600'
              )} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h4 className="font-medium text-gray-900 truncate">{topic.topic}</h4>
                <Badge className={cn('text-xs', config.badge)}>
                  {Math.round(topic.accuracy)}%
                </Badge>
              </div>
              <p className="text-sm text-gray-500">{topic.subject} • {topic.chapter}</p>

              <div className="mt-2 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${topic.accuracy}%` }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className={cn(
                    'h-full rounded-full',
                    topic.accuracy < 40 ? 'bg-red-500' : topic.accuracy < 60 ? 'bg-amber-500' : 'bg-emerald-500'
                  )}
                />
              </div>
            </div>
            <motion.div animate={{ rotate: expanded ? 90 : 0 }}>
              <ChevronRight className="h-5 w-5 text-gray-400" />
            </motion.div>
          </div>

          <div className="mt-3 flex items-center gap-2 p-2 bg-white/60 rounded-lg">
            <Zap className="h-4 w-4 text-amber-500" />
            <p className="text-sm text-gray-700">{topic.suggestedAction}</p>
          </div>
        </div>

        <AnimatePresence>
          {expanded && topic.recommendedResources.length > 0 && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="border-t border-gray-100 bg-white p-3 space-y-2"
            >
              {topic.recommendedResources.slice(0, 3).map((r) => (
                <button
                  key={r.id}
                  onClick={(e) => { e.stopPropagation(); onResourceClick(r.id) }}
                  className="w-full text-left p-2 rounded-lg bg-gray-50 hover:bg-blue-50 transition-colors flex items-center gap-2 group"
                >
                  <BookOpen className="h-4 w-4 text-blue-500" />
                  <span className="text-sm text-gray-700 group-hover:text-blue-600 truncate">
                    {r.title}
                  </span>
                  <ArrowRight className="h-4 w-4 text-gray-300 group-hover:text-blue-500 ml-auto" />
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </Card>
    </motion.div>
  )
}

// Continue Section
function ContinueSection({
  items,
  onResourceClick,
}: {
  items: ContinueLearningItem[]
  onResourceClick: (id: string) => void
}) {
  if (items.length === 0) {
    return (
      <Card className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
        <div className="text-center">
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center mx-auto mb-3 shadow-lg"
          >
            <BookOpen className="h-7 w-7 text-white" />
          </motion.div>
          <h3 className="font-semibold text-gray-900">Start Learning</h3>
          <p className="text-sm text-gray-600 mt-1">Your progress will appear here</p>
        </div>
      </Card>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="space-y-2"
    >
      {items.slice(0, 5).map((item, index) => (
        <motion.div
          key={item.resourceId}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.05 }}
        >
          <Card
            className="p-3 bg-gray-50 border-gray-100 hover:border-blue-200 hover:bg-blue-50/50 transition-all cursor-pointer group"
            onClick={() => onResourceClick(item.resourceId)}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                <Play className="h-5 w-5 text-blue-600" />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-medium text-gray-900 truncate group-hover:text-blue-600 transition-colors">
                  {item.title}
                </h4>
                <p className="text-xs text-gray-500 truncate">{item.subject} • {item.chapter}</p>
                <div className="mt-1.5 h-1 bg-gray-200 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${item.progress}%` }}
                    className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full"
                  />
                </div>
              </div>
              <span className="text-xs text-gray-400">{Math.round(item.progress)}%</span>
            </div>
          </Card>
        </motion.div>
      ))}
    </motion.div>
  )
}

// Mastery Section
function MasterySection({
  recommendations,
  masteryProfile,
  onResourceClick,
}: {
  recommendations: any[]
  masteryProfile: any
  onResourceClick: (id: string) => void
}) {
  if (recommendations.length === 0) {
    return (
      <Card className="p-6 bg-gradient-to-br from-emerald-50 to-teal-50 border-emerald-200">
        <div className="text-center">
          <Sparkles className="h-8 w-8 text-emerald-500 mx-auto mb-2" />
          <p className="text-gray-600">No recommendations available yet</p>
        </div>
      </Card>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="space-y-2"
    >
      {masteryProfile && (
        <Card className="p-3 bg-gradient-to-r from-emerald-50 to-teal-50 border-emerald-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Target className="h-4 w-4 text-emerald-600" />
              <span className="text-sm text-emerald-700">Your mastery level:</span>
            </div>
            <span className="font-semibold text-emerald-700">{Math.round(masteryProfile.overallMastery)}%</span>
          </div>
        </Card>
      )}
      {recommendations.slice(0, 5).map((r, index) => (
        <motion.div
          key={r.id}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.05 }}
        >
          <Card
            className="p-3 bg-white border-gray-100 hover:border-emerald-200 hover:shadow-sm transition-all cursor-pointer group"
            onClick={() => onResourceClick(r.id)}
          >
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-100 to-teal-100 flex items-center justify-center group-hover:from-emerald-200 group-hover:to-teal-200 transition-colors">
                <Sparkles className="h-5 w-5 text-emerald-600" />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-medium text-gray-900 truncate group-hover:text-emerald-600 transition-colors">
                  {r.title}
                </h4>
                <p className="text-xs text-gray-500">{r.subject} • {r.chapter}</p>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="outline" className="text-xs">{r.difficulty}</Badge>
                  <span className="text-xs text-gray-400">{r.estimatedTime}m</span>
                </div>
              </div>
              <ArrowRight className="h-4 w-4 text-gray-300 group-hover:text-emerald-500 transition-colors" />
            </div>
          </Card>
        </motion.div>
      ))}
    </motion.div>
  )
}

// Loading State
function LoadingState() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="space-y-3"
    >
      {[1, 2, 3].map((i) => (
        <Card key={i} className="p-4">
          <div className="flex items-start gap-3">
            <Skeleton className="w-10 h-10 rounded-xl" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
              <Skeleton className="h-2 w-full" />
            </div>
          </div>
        </Card>
      ))}
    </motion.div>
  )
}

// Utility function
function formatStudyTime(seconds: number): string {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  if (hours > 0) return `${hours}h ${minutes}m`
  return `${minutes}m`
}

export default IntelligenceDashboard
