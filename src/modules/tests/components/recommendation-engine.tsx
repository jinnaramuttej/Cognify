'use client'

import { useState, useMemo, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Sparkles, 
  TrendingUp, 
  Target, 
  Clock, 
  ChevronRight, 
  Zap,
  Brain,
  Lightbulb,
  ArrowRight,
  Star,
  RefreshCw,
  BookOpen,
  Layers,
  CheckCircle2,
  AlertCircle,
  Flame
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
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

interface RecommendationItem {
  id: string
  type: 'chapter' | 'concept' | 'practice' | 'pyq' | 'video' | 'notes'
  title: string
  subject: string
  reason: string
  priority: 'high' | 'medium' | 'low'
  estimatedTime: number
  masteryGap: number
  relatedWeaknesses: string[]
  trend: 'up' | 'down' | 'stable'
}

interface StudyBoost {
  id: string
  title: string
  description: string
  itemCount: number
  estimatedTime: number
  difficulty: 'easy' | 'medium' | 'hard'
  boostType: 'quick_review' | 'weak_spots' | 'challenge' | 'pyq_practice'
}

interface WeakConcept {
  id: string
  name: string
  subject: string
  mastery: number
  attempts: number
  lastAttempt: Date
  relatedChapters: string[]
}

// ============================================
// PERSONALIZED RECOMMENDATION ENGINE
// ============================================

export function RecommendationEngine() {
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [activeTab, setActiveTab] = useState<'recommendations' | 'boost' | 'weakness'>('recommendations')

  // Simulated AI-driven recommendations
  const recommendations = useMemo<RecommendationItem[]>(() => [
    {
      id: 'rec-1',
      type: 'concept',
      title: 'Integration by Parts',
      subject: 'Mathematics',
      reason: 'Based on your recent test, you struggled with integration applications',
      priority: 'high',
      estimatedTime: 25,
      masteryGap: 35,
      relatedWeaknesses: ['Calculus', 'Definite Integrals'],
      trend: 'down'
    },
    {
      id: 'rec-2',
      type: 'practice',
      title: 'Thermodynamics Practice Set',
      subject: 'Physics',
      reason: 'Strengthen your strong area for maximum score gain',
      priority: 'medium',
      estimatedTime: 40,
      masteryGap: 15,
      relatedWeaknesses: [],
      trend: 'up'
    },
    {
      id: 'rec-3',
      type: 'pyq',
      title: 'JEE 2023 Organic Chemistry',
      subject: 'Chemistry',
      reason: 'Similar questions appeared in recent tests you took',
      priority: 'high',
      estimatedTime: 30,
      masteryGap: 45,
      relatedWeaknesses: ['Reaction Mechanisms', 'Named Reactions'],
      trend: 'stable'
    },
    {
      id: 'rec-4',
      type: 'chapter',
      title: 'Rotational Motion Revision',
      subject: 'Physics',
      reason: 'Your accuracy dropped 12% in recent attempts',
      priority: 'high',
      estimatedTime: 35,
      masteryGap: 28,
      relatedWeaknesses: ['Torque', 'Angular Momentum'],
      trend: 'down'
    },
    {
      id: 'rec-5',
      type: 'video',
      title: 'Electrochemistry Concepts',
      subject: 'Chemistry',
      reason: 'Visual learning recommended based on your learning pattern',
      priority: 'low',
      estimatedTime: 20,
      masteryGap: 20,
      relatedWeaknesses: ['Nernst Equation'],
      trend: 'up'
    }
  ], [])

  // Daily Study Boost items
  const studyBoosts = useMemo<StudyBoost[]>(() => [
    {
      id: 'boost-1',
      title: 'Quick Concept Review',
      description: '5 essential formulas you need today',
      itemCount: 5,
      estimatedTime: 10,
      difficulty: 'easy',
      boostType: 'quick_review'
    },
    {
      id: 'boost-2',
      title: 'Attack Weak Spots',
      description: 'Target your 3 weakest concepts',
      itemCount: 15,
      estimatedTime: 25,
      difficulty: 'medium',
      boostType: 'weak_spots'
    },
    {
      id: 'boost-3',
      title: 'Challenge Mode',
      description: 'Hard problems to push your limits',
      itemCount: 10,
      estimatedTime: 30,
      difficulty: 'hard',
      boostType: 'challenge'
    },
    {
      id: 'boost-4',
      title: 'PYQ Sprint',
      description: 'Previous year questions practice',
      itemCount: 20,
      estimatedTime: 35,
      difficulty: 'medium',
      boostType: 'pyq_practice'
    }
  ], [])

  // Weak concepts cluster
  const weakConcepts = useMemo<WeakConcept[]>(() => [
    { id: 'wc-1', name: 'Integration by Parts', subject: 'Mathematics', mastery: 42, attempts: 8, lastAttempt: new Date(Date.now() - 86400000), relatedChapters: ['Calculus'] },
    { id: 'wc-2', name: 'Electrochemistry', subject: 'Chemistry', mastery: 38, attempts: 5, lastAttempt: new Date(Date.now() - 172800000), relatedChapters: ['Physical Chemistry'] },
    { id: 'wc-3', name: 'Rotational Motion', subject: 'Physics', mastery: 55, attempts: 12, lastAttempt: new Date(Date.now() - 43200000), relatedChapters: ['Mechanics'] },
    { id: 'wc-4', name: 'Organic Reactions', subject: 'Chemistry', mastery: 48, attempts: 6, lastAttempt: new Date(Date.now() - 259200000), relatedChapters: ['Organic Chemistry'] },
    { id: 'wc-5', name: 'Complex Numbers', subject: 'Mathematics', mastery: 62, attempts: 9, lastAttempt: new Date(Date.now() - 86400000), relatedChapters: ['Algebra'] }
  ], [])

  // Handle refresh
  const handleRefresh = async () => {
    setIsRefreshing(true)
    await new Promise(resolve => setTimeout(resolve, 1500))
    setIsRefreshing(false)
  }

  // Get type icon
  const getTypeIcon = (type: RecommendationItem['type']) => {
    const icons = {
      chapter: <BookOpen className="h-4 w-4" />,
      concept: <Lightbulb className="h-4 w-4" />,
      practice: <Target className="h-4 w-4" />,
      pyq: <Star className="h-4 w-4" />,
      video: <Layers className="h-4 w-4" />,
      notes: <BookOpen className="h-4 w-4" />
    }
    return icons[type]
  }

  // Get boost type icon
  const getBoostIcon = (type: StudyBoost['boostType']) => {
    const icons = {
      quick_review: <Zap className="h-5 w-5" />,
      weak_spots: <Target className="h-5 w-5" />,
      challenge: <Flame className="h-5 w-5" />,
      pyq_practice: <Star className="h-5 w-5" />
    }
    return icons[type]
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <motion.div 
            className="flex items-center gap-2"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <div className="p-2 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 shadow-lg shadow-purple-500/20">
              <Brain className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">AI Recommendations</h2>
              <p className="text-sm text-gray-500">Personalized learning path based on your performance</p>
            </div>
          </motion.div>
        </div>
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <Button 
            variant="outline" 
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="border-purple-200 hover:bg-purple-50"
          >
            <RefreshCw className={cn("h-4 w-4 mr-2", isRefreshing && "animate-spin")} />
            Refresh Insights
          </Button>
        </motion.div>
      </div>

      {/* AI Insight Banner */}
      <FadeIn>
        <Card className="bg-gradient-to-r from-purple-600 via-purple-500 to-indigo-600 text-white border-0 shadow-lg shadow-purple-500/20 overflow-hidden">
          <CardContent className="p-5">
            <div className="flex items-start gap-4">
              <motion.div
                animate={{ scale: [1, 1.1, 1], rotate: [0, 5, -5, 0] }}
                transition={{ duration: 3, repeat: Infinity }}
                className="p-3 rounded-xl bg-white/20 backdrop-blur-sm"
              >
                <Sparkles className="h-6 w-6" />
              </motion.div>
              <div className="flex-1">
                <h3 className="font-semibold text-lg mb-1">Today's AI Insight</h3>
                <p className="text-purple-100 text-sm leading-relaxed">
                  Based on your recent test performance, you're showing strong progress in <strong>Thermodynamics</strong> (+12%). 
                  Focus today on <strong>Integration by Parts</strong> and <strong>Electrochemistry</strong> to maximize your score improvement potential.
                </p>
                <div className="flex items-center gap-4 mt-3">
                  <div className="flex items-center gap-1.5 text-sm">
                    <TrendingUp className="h-4 w-4 text-emerald-300" />
                    <span>Overall: +8% this week</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-sm">
                    <Target className="h-4 w-4 text-amber-300" />
                    <span>2 weak spots identified</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </FadeIn>

      {/* Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {[
          { id: 'recommendations', label: 'For You', icon: <Sparkles className="h-4 w-4" /> },
          { id: 'boost', label: 'Study Boost', icon: <Zap className="h-4 w-4" /> },
          { id: 'weakness', label: 'Weak Concepts', icon: <AlertCircle className="h-4 w-4" /> }
        ].map((tab) => (
          <motion.button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as typeof activeTab)}
            className={cn(
              "flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all whitespace-nowrap",
              activeTab === tab.id
                ? "bg-purple-600 text-white shadow-lg shadow-purple-500/20"
                : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
            )}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {tab.icon}
            {tab.label}
          </motion.button>
        ))}
      </div>

      {/* Content */}
      <AnimatePresence mode="wait">
        {activeTab === 'recommendations' && (
          <motion.div
            key="recommendations"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="space-y-4"
          >
            {recommendations.map((rec, idx) => (
              <RecommendationCard 
                key={rec.id} 
                recommendation={rec} 
                index={idx}
                typeIcon={getTypeIcon(rec.type)}
              />
            ))}
          </motion.div>
        )}

        {activeTab === 'boost' && (
          <motion.div
            key="boost"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-4"
          >
            {studyBoosts.map((boost, idx) => (
              <StudyBoostCard 
                key={boost.id} 
                boost={boost} 
                index={idx}
                icon={getBoostIcon(boost.boostType)}
              />
            ))}
          </motion.div>
        )}

        {activeTab === 'weakness' && (
          <motion.div
            key="weakness"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <WeakConceptsPanel concepts={weakConcepts} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ============================================
// RECOMMENDATION CARD
// ============================================

interface RecommendationCardProps {
  recommendation: RecommendationItem
  index: number
  typeIcon: React.ReactNode
}

function RecommendationCard({ recommendation: rec, index, typeIcon }: RecommendationCardProps) {
  const priorityColors = {
    high: 'border-red-200 bg-red-50',
    medium: 'border-amber-200 bg-amber-50',
    low: 'border-blue-200 bg-blue-50'
  }

  const trendIcons = {
    up: <TrendingUp className="h-3 w-3 text-emerald-500" />,
    down: <TrendingUp className="h-3 w-3 text-red-500 rotate-180" />,
    stable: <div className="h-3 w-0.5 bg-gray-400 rounded" />
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05 }}
    >
      <Card className="border border-gray-200 shadow-sm hover:shadow-md hover:border-purple-200 transition-all duration-200 cursor-pointer group">
        <CardContent className="p-4">
          <div className="flex items-start gap-4">
            {/* Type Icon */}
            <div className={cn(
              "p-2.5 rounded-xl",
              rec.priority === 'high' ? 'bg-red-100 text-red-600' :
              rec.priority === 'medium' ? 'bg-amber-100 text-amber-600' :
              'bg-blue-100 text-blue-600'
            )}>
              {typeIcon}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-semibold text-gray-900 truncate">{rec.title}</h3>
                {trendIcons[rec.trend]}
              </div>
              <p className="text-sm text-gray-500 mb-2">{rec.reason}</p>
              
              {/* Tags */}
              <div className="flex flex-wrap gap-1.5 mb-3">
                <Badge variant="outline" className="text-xs">
                  {rec.subject}
                </Badge>
                {rec.relatedWeaknesses.slice(0, 2).map(weak => (
                  <Badge key={weak} variant="outline" className="text-xs border-red-200 text-red-600">
                    {weak}
                  </Badge>
                ))}
              </div>

              {/* Progress bar for mastery gap */}
              <div className="flex items-center gap-3">
                <div className="flex-1">
                  <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-gradient-to-r from-purple-500 to-purple-600 rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${rec.masteryGap}%` }}
                      transition={{ delay: index * 0.05 + 0.2, duration: 0.5 }}
                    />
                  </div>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Clock className="h-3.5 w-3.5" />
                  <span>{rec.estimatedTime} min</span>
                </div>
              </div>
            </div>

            {/* Action */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: index * 0.05 + 0.1 }}
            >
              <Button 
                size="sm" 
                className="bg-purple-600 hover:bg-purple-700 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                Start
                <ArrowRight className="h-3.5 w-3.5 ml-1" />
              </Button>
            </motion.div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

// ============================================
// STUDY BOOST CARD
// ============================================

interface StudyBoostCardProps {
  boost: StudyBoost
  index: number
  icon: React.ReactNode
}

function StudyBoostCard({ boost, index, icon }: StudyBoostCardProps) {
  const difficultyColors = {
    easy: 'from-emerald-500 to-emerald-600',
    medium: 'from-amber-500 to-amber-600',
    hard: 'from-red-500 to-red-600'
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.05 }}
      whileHover={{ y: -4 }}
    >
      <Card className="border border-gray-200 shadow-sm hover:shadow-lg transition-all duration-200 overflow-hidden group cursor-pointer">
        <CardContent className="p-0">
          {/* Header */}
          <div className={cn("p-4 bg-gradient-to-r text-white", difficultyColors[boost.difficulty])}>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-white/20">
                {icon}
              </div>
              <div>
                <h3 className="font-semibold">{boost.title}</h3>
                <p className="text-sm text-white/80">{boost.description}</p>
              </div>
            </div>
          </div>
          
          {/* Stats */}
          <div className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-4 text-sm text-gray-500">
              <div className="flex items-center gap-1">
                <Target className="h-4 w-4" />
                <span>{boost.itemCount} items</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                <span>{boost.estimatedTime} min</span>
              </div>
            </div>
            <Button size="sm" variant="outline" className="opacity-0 group-hover:opacity-100 transition-opacity">
              Start Now
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

// ============================================
// WEAK CONCEPTS PANEL
// ============================================

interface WeakConceptsPanelProps {
  concepts: WeakConcept[]
}

function WeakConceptsPanel({ concepts }: WeakConceptsPanelProps) {
  return (
    <Card className="border border-gray-200 shadow-sm overflow-hidden">
      <CardHeader className="border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white pb-4">
        <CardTitle className="text-base font-semibold text-gray-900 flex items-center gap-2">
          <AlertCircle className="h-4 w-4 text-amber-500" />
          Concepts Needing Attention
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="divide-y divide-gray-100">
          {concepts.map((concept, idx) => (
            <motion.div
              key={concept.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="p-4 hover:bg-gray-50 transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-4">
                {/* Mastery Ring */}
                <RingProgress
                  progress={concept.mastery}
                  size={56}
                  strokeWidth={5}
                  color={concept.mastery < 50 ? '#EF4444' : concept.mastery < 70 ? '#F59E0B' : '#10B981'}
                >
                  <span className="text-sm font-bold text-gray-700">{concept.mastery}%</span>
                </RingProgress>
                
                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h4 className="font-medium text-gray-900">{concept.name}</h4>
                    <Badge variant="outline" className="text-xs">
                      {concept.subject}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-3 mt-1 text-sm text-gray-500">
                    <span>{concept.attempts} attempts</span>
                    <span>•</span>
                    <span>Last: {formatTimeAgo(concept.lastAttempt)}</span>
                  </div>
                </div>

                {/* Action */}
                <Button size="sm" className="bg-purple-600 hover:bg-purple-700">
                  Practice
                </Button>
              </div>
            </motion.div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

// ============================================
// HELPERS
// ============================================

function formatTimeAgo(date: Date): string {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000)
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`
  return `${Math.floor(seconds / 86400)}d ago`
}
