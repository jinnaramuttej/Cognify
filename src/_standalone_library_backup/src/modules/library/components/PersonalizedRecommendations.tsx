'use client'

import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import {
  Sparkles,
  Brain,
  Target,
  TrendingUp,
  TrendingDown,
  Clock,
  ChevronRight,
  Lightbulb,
  Zap,
  AlertTriangle,
  CheckCircle2,
  ArrowRight,
  RefreshCw,
  BookOpen,
  Layers,
  Flame,
} from 'lucide-react'
import { cn } from '@/lib/utils'

// Types
export interface WeakConcept {
  id: string
  topic: string
  chapter: string
  subject: string
  accuracy: number // 0-100
  attemptCount: number
  trend: 'improving' | 'declining' | 'stable'
  urgency: 'high' | 'medium' | 'low'
  recommendedAction: string
  linkedResources: { id: string; title: string; type: string }[]
}

export interface StudyBoost {
  id: string
  type: 'weak_area' | 'trending' | 'revision' | 'new_concept'
  title: string
  description: string
  estimatedTime: number // minutes
  priority: number
  resourceId?: string
  reason: string
}

export interface RecommendationCluster {
  id: string
  name: string
  type: 'weak_concepts' | 'connected_topics' | 'exam_weightage' | 'difficulty_progression'
  items: {
    id: string
    title: string
    chapter: string
    subject: string
    reason: string
    priority: 'high' | 'medium' | 'low'
  }[]
  estimatedTotalTime: number
}

interface PersonalizedRecommendationsProps {
  weakConcepts?: WeakConcept[]
  studyBoosts?: StudyBoost[]
  clusters?: RecommendationCluster[]
  onResourceClick?: (resourceId: string) => void
  onRefresh?: () => void
  isLoading?: boolean
  className?: string
}

const urgencyConfig = {
  high: { color: 'bg-red-100 text-red-700 border-red-200', icon: AlertTriangle },
  medium: { color: 'bg-amber-100 text-amber-700 border-amber-200', icon: Clock },
  low: { color: 'bg-blue-100 text-blue-700 border-blue-200', icon: Target },
}

const trendConfig = {
  improving: { color: 'text-emerald-600', icon: TrendingUp },
  declining: { color: 'text-red-600', icon: TrendingDown },
  stable: { color: 'text-gray-500', icon: null },
}

const boostTypeConfig = {
  weak_area: { color: 'from-red-500 to-rose-500', icon: AlertTriangle, label: 'Weak Area' },
  trending: { color: 'from-orange-500 to-amber-500', icon: Flame, label: 'Trending' },
  revision: { color: 'from-purple-500 to-violet-500', icon: RefreshCw, label: 'Revision Due' },
  new_concept: { color: 'from-emerald-500 to-teal-500', icon: Lightbulb, label: 'New Concept' },
}

export function PersonalizedRecommendations({
  weakConcepts = [],
  studyBoosts = [],
  clusters = [],
  onResourceClick,
  onRefresh,
  isLoading = false,
  className,
}: PersonalizedRecommendationsProps) {
  const [activeTab, setActiveTab] = useState<'boosts' | 'weak' | 'clusters'>('boosts')
  const [expandedCluster, setExpandedCluster] = useState<string | null>(null)
  
  // Sort study boosts by priority
  const sortedBoosts = useMemo(() => 
    [...studyBoosts].sort((a, b) => b.priority - a.priority),
    [studyBoosts]
  )
  
  // Sort weak concepts by accuracy (lowest first) and urgency
  const sortedWeakConcepts = useMemo(() => 
    [...weakConcepts].sort((a, b) => {
      const urgencyOrder = { high: 0, medium: 1, low: 2 }
      if (urgencyOrder[a.urgency] !== urgencyOrder[b.urgency]) {
        return urgencyOrder[a.urgency] - urgencyOrder[b.urgency]
      }
      return a.accuracy - b.accuracy
    }),
    [weakConcepts]
  )
  
  return (
    <Card className={cn('overflow-hidden', className)}>
      {/* Header */}
      <div className="p-4 bg-gradient-to-r from-blue-500 via-blue-600 to-purple-600 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            <h3 className="font-semibold">Personalized for You</h3>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onRefresh}
            className="text-white hover:bg-white/20"
          >
            <RefreshCw className={cn('h-4 w-4', isLoading && 'animate-spin')} />
          </Button>
        </div>
        
        {/* Tabs */}
        <div className="flex gap-1 mt-3">
          {[
            { key: 'boosts', label: 'Study Boost', count: studyBoosts.length },
            { key: 'weak', label: 'Weak Areas', count: weakConcepts.length },
            { key: 'clusters', label: 'Clusters', count: clusters.length },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as typeof activeTab)}
              className={cn(
                'flex-1 py-2 text-sm font-medium rounded-lg transition-all',
                activeTab === tab.key
                  ? 'bg-white text-blue-600 shadow-lg'
                  : 'text-white/80 hover:bg-white/10'
              )}
            >
              {tab.label}
              {tab.count > 0 && (
                <Badge className={cn(
                  'ml-1.5 text-xs',
                  activeTab === tab.key ? 'bg-blue-100 text-blue-700' : 'bg-white/20 text-white border-0'
                )}>
                  {tab.count}
                </Badge>
              )}
            </button>
          ))}
        </div>
      </div>
      
      {/* Content */}
      <div className="p-4 max-h-[400px] overflow-y-auto">
        <AnimatePresence mode="wait">
          {/* Study Boost Tab */}
          {activeTab === 'boosts' && (
            <motion.div
              key="boosts"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-3"
            >
              {sortedBoosts.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Sparkles className="h-10 w-10 mx-auto mb-2 opacity-30" />
                  <p>Your study boost items will appear here</p>
                </div>
              ) : (
                sortedBoosts.map((boost, index) => {
                  const config = boostTypeConfig[boost.type]
                  return (
                    <motion.div
                      key={boost.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      onClick={() => boost.resourceId && onResourceClick?.(boost.resourceId)}
                      className="group cursor-pointer"
                    >
                      <div className="flex items-start gap-3 p-3 rounded-xl border border-gray-100 hover:border-blue-200 hover:bg-blue-50/30 transition-all">
                        <div className={cn(
                          'w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 bg-gradient-to-br',
                          config.color
                        )}>
                          <config.icon className="h-5 w-5 text-white" />
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-xs">{config.label}</Badge>
                            <span className="text-xs text-gray-400">{boost.estimatedTime}m</span>
                          </div>
                          <h4 className="font-medium text-gray-900 mt-1 truncate group-hover:text-blue-600">
                            {boost.title}
                          </h4>
                          <p className="text-sm text-gray-500 line-clamp-2 mt-0.5">
                            {boost.reason}
                          </p>
                        </div>
                        
                        <ChevronRight className="h-5 w-5 text-gray-300 group-hover:text-blue-500 transition-colors" />
                      </div>
                    </motion.div>
                  )
                })
              )}
            </motion.div>
          )}
          
          {/* Weak Areas Tab */}
          {activeTab === 'weak' && (
            <motion.div
              key="weak"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-3"
            >
              {sortedWeakConcepts.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <CheckCircle2 className="h-10 w-10 mx-auto mb-2 text-emerald-500" />
                  <p className="font-medium text-emerald-600">No weak areas detected!</p>
                  <p className="text-sm">Keep up the great work!</p>
                </div>
              ) : (
                sortedWeakConcepts.map((concept, index) => {
                  const urgencyConf = urgencyConfig[concept.urgency]
                  const trendConf = trendConfig[concept.trend]
                  const UrgencyIcon = urgencyConf.icon
                  const TrendIcon = trendConf.icon
                  
                  return (
                    <motion.div
                      key={concept.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="p-3 rounded-xl border border-gray-100 hover:border-blue-200 transition-all"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <Badge className={cn('text-xs', urgencyConf.color)}>
                              <UrgencyIcon className="h-3 w-3 mr-0.5" />
                              {concept.urgency} priority
                            </Badge>
                            {TrendIcon && (
                              <TrendIcon className={cn('h-4 w-4', trendConf.color)} />
                            )}
                          </div>
                          <h4 className="font-medium text-gray-900">{concept.topic}</h4>
                          <p className="text-sm text-gray-500">{concept.chapter} • {concept.subject}</p>
                        </div>
                        
                        <div className="text-right">
                          <div className="text-2xl font-bold text-gray-900">{Math.round(concept.accuracy)}%</div>
                          <div className="text-xs text-gray-500">accuracy</div>
                        </div>
                      </div>
                      
                      {/* Accuracy Bar */}
                      <div className="mt-2">
                        <Progress 
                          value={concept.accuracy} 
                          className={cn(
                            'h-1.5',
                            concept.accuracy < 40 ? '[&>div]:bg-red-500' :
                            concept.accuracy < 70 ? '[&>div]:bg-amber-500' :
                            '[&>div]:bg-emerald-500'
                          )}
                        />
                      </div>
                      
                      {/* Recommended Action */}
                      <div className="mt-3 p-2 bg-blue-50 rounded-lg">
                        <div className="flex items-start gap-2">
                          <Lightbulb className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                          <p className="text-sm text-blue-700">{concept.recommendedAction}</p>
                        </div>
                      </div>
                      
                      {/* Linked Resources */}
                      {concept.linkedResources.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mt-3">
                          {concept.linkedResources.slice(0, 3).map((resource) => (
                            <Button
                              key={resource.id}
                              variant="outline"
                              size="sm"
                              onClick={() => onResourceClick?.(resource.id)}
                              className="h-7 text-xs"
                            >
                              {resource.type === 'video' && <Layers className="h-3 w-3 mr-1" />}
                              {resource.type === 'notes' && <BookOpen className="h-3 w-3 mr-1" />}
                              {resource.title}
                            </Button>
                          ))}
                        </div>
                      )}
                    </motion.div>
                  )
                })
              )}
            </motion.div>
          )}
          
          {/* Clusters Tab */}
          {activeTab === 'clusters' && (
            <motion.div
              key="clusters"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-3"
            >
              {clusters.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Layers className="h-10 w-10 mx-auto mb-2 opacity-30" />
                  <p>Topic clusters will appear here</p>
                </div>
              ) : (
                clusters.map((cluster, index) => {
                  const isExpanded = expandedCluster === cluster.id
                  
                  return (
                    <motion.div
                      key={cluster.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="border border-gray-100 rounded-xl overflow-hidden"
                    >
                      <button
                        onClick={() => setExpandedCluster(isExpanded ? null : cluster.id)}
                        className="w-full p-3 flex items-center justify-between hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-violet-500 flex items-center justify-center">
                            <Layers className="h-4 w-4 text-white" />
                          </div>
                          <div className="text-left">
                            <h4 className="font-medium text-gray-900">{cluster.name}</h4>
                            <p className="text-xs text-gray-500">
                              {cluster.items.length} topics • ~{cluster.estimatedTotalTime}min
                            </p>
                          </div>
                        </div>
                        <motion.div
                          animate={{ rotate: isExpanded ? 180 : 0 }}
                          transition={{ duration: 0.2 }}
                        >
                          <ChevronRight className="h-5 w-5 text-gray-400 rotate-90" />
                        </motion.div>
                      </button>
                      
                      <AnimatePresence>
                        {isExpanded && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="border-t border-gray-100"
                          >
                            <div className="p-3 space-y-2">
                              {cluster.items.map((item, idx) => (
                                <motion.div
                                  key={item.id}
                                  initial={{ opacity: 0, x: -10 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  transition={{ delay: idx * 0.03 }}
                                  onClick={() => onResourceClick?.(item.id)}
                                  className="flex items-center gap-3 p-2 rounded-lg hover:bg-blue-50 cursor-pointer"
                                >
                                  <div className={cn(
                                    'w-2 h-2 rounded-full',
                                    item.priority === 'high' ? 'bg-red-500' :
                                    item.priority === 'medium' ? 'bg-amber-500' : 'bg-gray-400'
                                  )} />
                                  <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-gray-900 truncate">{item.title}</p>
                                    <p className="text-xs text-gray-500">{item.reason}</p>
                                  </div>
                                  <ArrowRight className="h-4 w-4 text-gray-300" />
                                </motion.div>
                              ))}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  )
                })
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </Card>
  )
}

export default PersonalizedRecommendations
