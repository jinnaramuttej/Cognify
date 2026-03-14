'use client'

import { motion } from 'framer-motion'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import {
  BookOpen,
  Clock,
  ArrowRight,
  Zap,
  AlertTriangle,
  TrendingUp,
  Target,
  Sparkles,
  CheckCircle2,
  Play,
  RefreshCw,
  Bookmark,
  Flame,
  RotateCcw,
} from 'lucide-react'
import type { LibraryResource, Subject, WeakTopicRecommendation, ContinueLearningItem } from '../types'

interface OverviewPageProps {
  resources: LibraryResource[]
  subjects: Subject[]
  recentlyViewed: LibraryResource[]
  continueStudying: LibraryResource | null
  dueForRevision: number
  gamificationData: any
  grade: string | null
  exam: string | null
  isLoading: boolean
  onResourceClick: (resource: LibraryResource) => void
  onSubjectClick: (subject: Subject) => void
  onBookmark: (resourceId: string) => void
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.05, delayChildren: 0.1 },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] },
  },
}

export function OverviewPage({
  resources,
  subjects,
  recentlyViewed,
  continueStudying,
  dueForRevision,
  gamificationData,
  grade,
  exam,
  isLoading,
  onResourceClick,
  onSubjectClick,
  onBookmark,
}: OverviewPageProps) {
  if (isLoading) {
    return <LoadingState />
  }

  // Get bookmarked resources
  const bookmarkedResources = resources.filter(r => r.isBookmarked).slice(0, 3)
  
  // Get weak topics (mock for now, would come from API in production)
  const weakTopics = [
    { id: 'w1', topic: 'Electrostatics', subject: 'Physics', accuracy: 35, urgency: 'high' },
    { id: 'w2', topic: 'Organic Mechanisms', subject: 'Chemistry', accuracy: 45, urgency: 'medium' },
  ]

  // Get continue learning items
  const continueItems = recentlyViewed.filter(r => !r.isBookmarked).slice(0, 3)

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="p-4 md:p-6 max-w-6xl mx-auto space-y-6"
    >
      {/* Personalized Hero Section */}
      <motion.div variants={itemVariants}>
        <HeroSection
          exam={exam}
          grade={grade}
          continueStudying={continueStudying}
          onContinue={() => continueStudying && onResourceClick(continueStudying)}
          streak={gamificationData?.streak?.currentStreak || 0}
        />
      </motion.div>

      {/* Weak Topics Alert - Only show if there are weak areas */}
      {weakTopics.length > 0 && (
        <motion.div variants={itemVariants}>
          <WeakTopicsAlert weakTopics={weakTopics} />
        </motion.div>
      )}

      {/* Continue Learning Section */}
      {continueItems.length > 0 && (
        <motion.div variants={itemVariants}>
          <ContinueLearningSection
            items={continueItems}
            onResourceClick={onResourceClick}
          />
        </motion.div>
      )}

      {/* Due for Revision */}
      {dueForRevision > 0 && (
        <motion.div variants={itemVariants}>
          <RevisionAlert count={dueForRevision} />
        </motion.div>
      )}

      {/* Bookmarked Resources */}
      {bookmarkedResources.length > 0 && (
        <motion.div variants={itemVariants}>
          <BookmarkedSection
            resources={bookmarkedResources}
            onResourceClick={onResourceClick}
            onBookmark={onBookmark}
          />
        </motion.div>
      )}

      {/* Subjects Quick Access */}
      <motion.div variants={itemVariants}>
        <SubjectsSection
          subjects={subjects}
          onSubjectClick={onSubjectClick}
        />
      </motion.div>

      {/* Quick Stats - Minimal */}
      <motion.div variants={itemVariants}>
        <MinimalStats
          totalResources={resources.length}
          streak={gamificationData?.streak?.currentStreak || 0}
          xp={gamificationData?.streak?.totalXP || 0}
          level={gamificationData?.streak?.level || 1}
        />
      </motion.div>
    </motion.div>
  )
}

// Hero Section - Personalized greeting
function HeroSection({
  exam,
  grade,
  continueStudying,
  onContinue,
  streak,
}: {
  exam: string | null
  grade: string | null
  continueStudying: LibraryResource | null
  onContinue: () => void
  streak: number
}) {
  const greeting = getGreeting()
  const examLabel = exam || 'JEE'
  const gradeLabel = grade || '12'

  return (
    <Card className="p-6 bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0 shadow-xl shadow-blue-500/10 overflow-hidden relative">
      {/* Decorative elements */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full blur-2xl translate-y-1/2 -translate-x-1/4" />
      
      <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <p className="text-blue-100 text-sm mb-1">{greeting}</p>
          <h1 className="text-2xl md:text-3xl font-bold mb-2">
            Continue Your {examLabel} Preparation
          </h1>
          <p className="text-blue-100 flex items-center gap-3">
            <span>Class {gradeLabel}</span>
            <span className="w-1 h-1 rounded-full bg-blue-300" />
            <span>{streak > 0 ? `${streak} day streak 🔥` : 'Start your streak today'}</span>
          </p>
        </div>

        {continueStudying ? (
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Button
              size="lg"
              onClick={onContinue}
              className="bg-white text-blue-600 hover:bg-blue-50 shadow-lg px-8"
            >
              <Play className="h-5 w-5 mr-2" />
              Resume Studying
            </Button>
          </motion.div>
        ) : (
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Button
              size="lg"
              className="bg-white text-blue-600 hover:bg-blue-50 shadow-lg px-8"
            >
              <BookOpen className="h-5 w-5 mr-2" />
              Start Learning
            </Button>
          </motion.div>
        )}
      </div>
    </Card>
  )
}

// Weak Topics Alert
function WeakTopicsAlert({ weakTopics }: { weakTopics: any[] }) {
  return (
    <Card className="p-4 bg-gradient-to-r from-amber-50 to-orange-50 border-amber-200">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center flex-shrink-0">
          <AlertTriangle className="h-5 w-5 text-amber-600" />
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900 mb-1">Focus Areas Detected</h3>
          <p className="text-sm text-gray-600 mb-3">
            Based on your recent tests, these topics need attention:
          </p>
          <div className="flex flex-wrap gap-2">
            {weakTopics.map((topic) => (
              <Badge
                key={topic.id}
                variant="outline"
                className={cn(
                  'cursor-pointer hover:bg-white transition-colors',
                  topic.urgency === 'high' 
                    ? 'bg-red-50 text-red-700 border-red-200' 
                    : 'bg-amber-50 text-amber-700 border-amber-200'
                )}
              >
                {topic.topic}
                <span className="ml-1.5 text-xs opacity-70">({topic.accuracy}%)</span>
              </Badge>
            ))}
          </div>
        </div>
      </div>
    </Card>
  )
}

// Continue Learning Section
function ContinueLearningSection({
  items,
  onResourceClick,
}: {
  items: LibraryResource[]
  onResourceClick: (r: LibraryResource) => void
}) {
  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <Clock className="h-5 w-5 text-gray-400" />
          Continue Learning
        </h2>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {items.map((resource, index) => (
          <motion.div
            key={resource.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <Card
              onClick={() => onResourceClick(resource)}
              className="p-4 bg-white border-gray-100 hover:border-blue-200 hover:shadow-md transition-all cursor-pointer group"
            >
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center group-hover:bg-blue-100 transition-colors">
                  <BookOpen className="h-5 w-5 text-blue-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-gray-900 truncate group-hover:text-blue-600 transition-colors">
                    {resource.title}
                  </h3>
                  <p className="text-sm text-gray-500 truncate">
                    {resource.subject} • {resource.chapter}
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge variant="outline" className="text-xs">
                      {resource.resourceType}
                    </Badge>
                    <span className="text-xs text-gray-400">{resource.readingTime}m</span>
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  )
}

// Revision Alert
function RevisionAlert({ count }: { count: number }) {
  return (
    <Card className="p-4 bg-gradient-to-r from-purple-50 to-indigo-50 border-purple-200">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center">
            <RotateCcw className="h-5 w-5 text-purple-600" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">Revision Due</h3>
            <p className="text-sm text-gray-600">{count} resources need review today</p>
          </div>
        </div>
        <Button variant="outline" size="sm" className="border-purple-200 text-purple-700 hover:bg-purple-100">
          Start Revision
          <ArrowRight className="h-4 w-4 ml-1" />
        </Button>
      </div>
    </Card>
  )
}

// Bookmarked Section
function BookmarkedSection({
  resources,
  onResourceClick,
  onBookmark,
}: {
  resources: LibraryResource[]
  onResourceClick: (r: LibraryResource) => void
  onBookmark: (id: string) => void
}) {
  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <Bookmark className="h-5 w-5 text-blue-500 fill-blue-500" />
          Saved Resources
        </h2>
        <Button variant="ghost" size="sm" className="text-gray-500 hover:text-gray-700">
          View All
        </Button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {resources.map((resource, index) => (
          <motion.div
            key={resource.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <Card
              onClick={() => onResourceClick(resource)}
              className="p-4 bg-white border-gray-100 hover:border-blue-200 hover:shadow-md transition-all cursor-pointer group"
            >
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
                  <BookOpen className="h-5 w-5 text-blue-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-gray-900 truncate">{resource.title}</h3>
                  <p className="text-sm text-gray-500 truncate">{resource.subject}</p>
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  )
}

// Subjects Section
function SubjectsSection({
  subjects,
  onSubjectClick,
}: {
  subjects: Subject[]
  onSubjectClick: (s: Subject) => void
}) {
  return (
    <div>
      <h2 className="text-lg font-semibold text-gray-900 mb-3">Browse by Subject</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {subjects.map((subject, index) => (
          <motion.div
            key={subject.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.05 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Card
              onClick={() => onSubjectClick(subject)}
              className="p-4 bg-white border-gray-100 hover:border-blue-200 hover:shadow-md transition-all cursor-pointer text-center"
            >
              <div
                className="w-12 h-12 rounded-xl mx-auto mb-2 flex items-center justify-center text-white text-xl font-bold"
                style={{ backgroundColor: subject.color || '#3B82F6' }}
              >
                {subject.name.charAt(0)}
              </div>
              <h3 className="font-medium text-gray-900">{subject.name}</h3>
              <p className="text-xs text-gray-500 mt-0.5">{subject.totalResources} resources</p>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  )
}

// Minimal Stats
function MinimalStats({
  totalResources,
  streak,
  xp,
  level,
}: {
  totalResources: number
  streak: number
  xp: number
  level: number
}) {
  return (
    <div className="flex items-center justify-center gap-6 py-4">
      <div className="text-center">
        <p className="text-2xl font-bold text-gray-900">{totalResources}</p>
        <p className="text-xs text-gray-500">Resources</p>
      </div>
      <div className="w-px h-8 bg-gray-200" />
      <div className="text-center">
        <p className="text-2xl font-bold text-gray-900 flex items-center gap-1">
          {streak}
          {streak > 0 && <Flame className="h-5 w-5 text-orange-500" />}
        </p>
        <p className="text-xs text-gray-500">Day Streak</p>
      </div>
      <div className="w-px h-8 bg-gray-200" />
      <div className="text-center">
        <p className="text-2xl font-bold text-gray-900">{xp.toLocaleString()}</p>
        <p className="text-xs text-gray-500">XP • Level {level}</p>
      </div>
    </div>
  )
}

// Loading State
function LoadingState() {
  return (
    <div className="p-4 md:p-6 max-w-6xl mx-auto space-y-6">
      <Skeleton className="h-40 rounded-2xl" />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Skeleton className="h-32 rounded-xl" />
        <Skeleton className="h-32 rounded-xl" />
        <Skeleton className="h-32 rounded-xl" />
      </div>
      <Skeleton className="h-24 rounded-xl" />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-28 rounded-xl" />
        ))}
      </div>
    </div>
  )
}

// Helper
function getGreeting(): string {
  const hour = new Date().getHours()
  if (hour < 12) return 'Good morning'
  if (hour < 18) return 'Good afternoon'
  return 'Good evening'
}

export default OverviewPage
