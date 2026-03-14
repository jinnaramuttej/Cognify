'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { ScrollArea } from '@/components/ui/scroll-area'
import { cn } from '@/lib/utils'
import {
  AlertTriangle,
  TrendingDown,
  TrendingUp,
  Minus,
  ChevronRight,
  BookOpen,
  Clock,
  Target,
  Sparkles,
  ArrowRight,
  Brain,
  Zap,
  AlertCircle,
} from 'lucide-react'
import type { WeakTopicRecommendation, IntelligenceResource } from '../types'

interface WeakTopicPanelProps {
  weakTopics: WeakTopicRecommendation[]
  onResourceClick: (resourceId: string) => void
  onViewAll?: () => void
  isLoading?: boolean
}

const urgencyConfig = {
  high: {
    bg: 'bg-gradient-to-r from-red-50 to-orange-50',
    border: 'border-red-200',
    badge: 'bg-red-100 text-red-700 border-red-200',
    icon: AlertTriangle,
    iconColor: 'text-red-500',
    pulse: true,
  },
  medium: {
    bg: 'bg-gradient-to-r from-amber-50 to-yellow-50',
    border: 'border-amber-200',
    badge: 'bg-amber-100 text-amber-700 border-amber-200',
    icon: AlertCircle,
    iconColor: 'text-amber-500',
    pulse: false,
  },
  low: {
    bg: 'bg-gradient-to-r from-blue-50 to-indigo-50',
    border: 'border-blue-200',
    badge: 'bg-blue-100 text-blue-700 border-blue-200',
    icon: Target,
    iconColor: 'text-blue-500',
    pulse: false,
  },
}

const trendConfig = {
  declining: { icon: TrendingDown, color: 'text-red-500', label: 'Declining' },
  stable: { icon: Minus, color: 'text-gray-500', label: 'Stable' },
  improving: { icon: TrendingUp, color: 'text-emerald-500', label: 'Improving' },
}

export function WeakTopicPanel({
  weakTopics,
  onResourceClick,
  onViewAll,
  isLoading = false,
}: WeakTopicPanelProps) {
  const [expandedTopic, setExpandedTopic] = useState<string | null>(null)

  if (isLoading) {
    return (
      <Card className="p-6 bg-white border-gray-100 shadow-sm">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-100 rounded-lg w-1/3" />
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-24 bg-gray-50 rounded-xl" />
            ))}
          </div>
        </div>
      </Card>
    )
  }

  if (weakTopics.length === 0) {
    return (
      <Card className="p-6 bg-gradient-to-br from-emerald-50 to-teal-50 border-emerald-200 shadow-sm">
        <div className="text-center py-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200 }}
            className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center mx-auto mb-4 shadow-lg"
          >
            <Sparkles className="h-8 w-8 text-white" />
          </motion.div>
          <h3 className="text-lg font-semibold text-gray-900">Great Progress!</h3>
          <p className="text-sm text-gray-600 mt-1">No weak topics detected based on your recent tests.</p>
        </div>
      </Card>
    )
  }

  return (
    <Card className="bg-white border-gray-100 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="p-5 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center shadow-lg shadow-orange-500/20">
              <Brain className="h-5 w-5 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Focus Areas</h3>
              <p className="text-sm text-gray-500">Based on your test performance</p>
            </div>
          </div>
          {onViewAll && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onViewAll}
              className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
            >
              View All
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          )}
        </div>
      </div>

      {/* Topics List */}
      <ScrollArea className="max-h-[500px]">
        <div className="p-4 space-y-3">
          <AnimatePresence mode="popLayout">
            {weakTopics.map((topic, index) => {
              const config = urgencyConfig[topic.urgency]
              const Icon = config.icon
              const TrendIcon = trendConfig[topic.trend].icon

              return (
                <motion.div
                  key={topic.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ delay: index * 0.05 }}
                  layout
                >
                  <Card
                    className={cn(
                      'border overflow-hidden transition-all duration-200 cursor-pointer',
                      config.border,
                      expandedTopic === topic.id ? 'ring-2 ring-blue-500/20' : ''
                    )}
                    onClick={() => setExpandedTopic(
                      expandedTopic === topic.id ? null : topic.id
                    )}
                  >
                    {/* Main Content */}
                    <div className={cn('p-4', config.bg)}>
                      <div className="flex items-start gap-3">
                        <div className="relative">
                          <div className={cn(
                            'w-10 h-10 rounded-xl flex items-center justify-center',
                            topic.urgency === 'high' ? 'bg-red-100' : 
                            topic.urgency === 'medium' ? 'bg-amber-100' : 'bg-blue-100'
                          )}>
                            <Icon className={cn('h-5 w-5', config.iconColor)} />
                          </div>
                          {config.pulse && (
                            <motion.div
                              className="absolute inset-0 rounded-xl bg-red-400"
                              animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0, 0.5] }}
                              transition={{ duration: 2, repeat: Infinity }}
                            />
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h4 className="font-medium text-gray-900 truncate">{topic.topic}</h4>
                            <Badge variant="outline" className={cn('text-xs', config.badge)}>
                              {topic.accuracy.toFixed(0)}% accuracy
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-500 mt-0.5">
                            {topic.subject} • {topic.chapter}
                          </p>

                          {/* Accuracy Bar */}
                          <div className="mt-3">
                            <div className="flex items-center justify-between text-xs mb-1">
                              <span className="text-gray-500">Mastery Level</span>
                              <div className="flex items-center gap-1">
                                <TrendIcon className={cn('h-3 w-3', trendConfig[topic.trend].color)} />
                                <span className={trendConfig[topic.trend].color}>
                                  {trendConfig[topic.trend].label}
                                </span>
                              </div>
                            </div>
                            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                              <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${topic.accuracy}%` }}
                                transition={{ duration: 0.8, ease: 'easeOut' }}
                                className={cn(
                                  'h-full rounded-full',
                                  topic.accuracy < 40 ? 'bg-gradient-to-r from-red-500 to-orange-500' :
                                  topic.accuracy < 60 ? 'bg-gradient-to-r from-amber-500 to-yellow-500' :
                                  'bg-gradient-to-r from-emerald-500 to-teal-500'
                                )}
                              />
                            </div>
                          </div>
                        </div>

                        <motion.div
                          animate={{ rotate: expandedTopic === topic.id ? 90 : 0 }}
                          transition={{ duration: 0.2 }}
                        >
                          <ChevronRight className="h-5 w-5 text-gray-400" />
                        </motion.div>
                      </div>

                      {/* Suggested Action */}
                      <div className="mt-3 flex items-start gap-2 p-3 bg-white/60 rounded-lg">
                        <Zap className="h-4 w-4 text-amber-500 flex-shrink-0 mt-0.5" />
                        <p className="text-sm text-gray-700">{topic.suggestedAction}</p>
                      </div>
                    </div>

                    {/* Expanded Resources */}
                    <AnimatePresence>
                      {expandedTopic === topic.id && topic.recommendedResources.length > 0 && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className="border-t border-gray-100 bg-white"
                        >
                          <div className="p-4 space-y-2">
                            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3">
                              Recommended Resources
                            </p>
                            {topic.recommendedResources.slice(0, 3).map((resource, i) => (
                              <ResourceItem
                                key={resource.id}
                                resource={resource}
                                index={i}
                                onClick={() => onResourceClick(resource.id)}
                              />
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </Card>
                </motion.div>
              )
            })}
          </AnimatePresence>
        </div>
      </ScrollArea>
    </Card>
  )
}

// Resource Item Component
function ResourceItem({
  resource,
  index,
  onClick,
}: {
  resource: IntelligenceResource
  index: number
  onClick: () => void
}) {
  const difficultyColors = {
    Beginner: 'bg-emerald-100 text-emerald-700',
    Intermediate: 'bg-amber-100 text-amber-700',
    Advanced: 'bg-red-100 text-red-700',
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05 }}
    >
      <button
        onClick={onClick}
        className="w-full text-left p-3 rounded-xl bg-gray-50 hover:bg-blue-50 border border-gray-100 hover:border-blue-200 transition-all duration-200 group"
      >
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0 group-hover:bg-blue-200 transition-colors">
            <BookOpen className="h-4 w-4 text-blue-600" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h5 className="text-sm font-medium text-gray-900 truncate group-hover:text-blue-600 transition-colors">
                {resource.title}
              </h5>
              <Badge variant="outline" className={cn('text-xs', difficultyColors[resource.difficulty as keyof typeof difficultyColors])}>
                {resource.difficulty}
              </Badge>
            </div>
            <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {resource.estimatedTime}m
              </span>
              <span className="flex items-center gap-1">
                <Target className="h-3 w-3" />
                {resource.matchScore}% match
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-1 line-clamp-1">{resource.reason}</p>
          </div>
          <ArrowRight className="h-4 w-4 text-gray-300 group-hover:text-blue-500 group-hover:translate-x-1 transition-all" />
        </div>
      </button>
    </motion.div>
  )
}

export default WeakTopicPanel
