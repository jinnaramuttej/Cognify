'use client'

import { motion } from 'framer-motion'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Skeleton } from '@/components/ui/skeleton'
import { ScrollArea } from '@/components/ui/scroll-area'
import { cn } from '@/lib/utils'
import {
  Trophy,
  Medal,
  Star,
  Flame,
  Target,
  Zap,
  Calendar,
  Award,
  Lock,
  CheckCircle2,
  TrendingUp,
} from 'lucide-react'

interface AchievementsPageProps {
  gamificationData: any
  isLoading: boolean
}

export function AchievementsPage({
  gamificationData,
  isLoading,
}: AchievementsPageProps) {
  // Mock achievements data
  const achievements = [
    { id: 'a1', name: 'First Steps', description: 'Complete your first resource', icon: '🎯', xp: 50, unlocked: true, unlockedAt: '2024-01-15' },
    { id: 'a2', name: 'Week Warrior', description: 'Maintain a 7-day streak', icon: '🔥', xp: 200, unlocked: true, unlockedAt: '2024-01-20' },
    { id: 'a3', name: 'Bookworm', description: 'Read 50 resources', icon: '📚', xp: 500, unlocked: false, progress: 35, target: 50 },
    { id: 'a4', name: 'Quiz Master', description: 'Complete 100 quizzes', icon: '🧠', xp: 300, unlocked: false, progress: 42, target: 100 },
    { id: 'a5', name: 'Speed Reader', description: 'Read 10 resources in one day', icon: '⚡', xp: 150, unlocked: true, unlockedAt: '2024-01-18' },
    { id: 'a6', name: 'Revision Pro', description: 'Review 100 flashcards', icon: '🔄', xp: 250, unlocked: false, progress: 67, target: 100 },
  ]

  // Stats from gamification
  const streak = gamificationData?.streak?.currentStreak || 0
  const longestStreak = gamificationData?.streak?.longestStreak || 0
  const xp = gamificationData?.streak?.totalXP || 0
  const level = gamificationData?.streak?.level || 1
  const unlockedCount = achievements.filter(a => a.unlocked).length

  if (isLoading) {
    return <LoadingState />
  }

  return (
    <ScrollArea className="h-full">
      <div className="p-4 md:p-6 max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-1">Achievements</h1>
          <p className="text-gray-500">Track your progress and earn rewards</p>
        </div>

        {/* Level & XP Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="p-6 bg-gradient-to-br from-amber-500 to-orange-500 text-white border-0 shadow-lg mb-6 overflow-hidden relative">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4" />
            <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                  <Star className="h-8 w-8" />
                </div>
                <div>
                  <p className="text-amber-100 text-sm">Current Level</p>
                  <h2 className="text-3xl font-bold">Level {level}</h2>
                  <p className="text-amber-100 text-sm mt-1">{xp.toLocaleString()} XP earned</p>
                </div>
              </div>
              <div className="flex-1 max-w-xs">
                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="text-amber-100">Next Level</span>
                  <span className="font-medium">{(level * 500 - xp)} XP to go</span>
                </div>
                <Progress
                  value={(xp % 500) / 5}
                  className="h-2 bg-white/20"
                />
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <StatCard
            icon={Flame}
            label="Current Streak"
            value={streak}
            suffix={streak > 0 ? '🔥' : ''}
            color="orange"
          />
          <StatCard
            icon={TrendingUp}
            label="Best Streak"
            value={longestStreak}
            suffix="days"
            color="blue"
          />
          <StatCard
            icon={Trophy}
            label="Badges Earned"
            value={unlockedCount}
            suffix={`of ${achievements.length}`}
            color="amber"
          />
          <StatCard
            icon={Zap}
            label="Total XP"
            value={xp}
            color="purple"
          />
        </div>

        {/* Achievements Grid */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Badges</h2>
            <Badge variant="outline" className="text-gray-500">
              {unlockedCount}/{achievements.length} unlocked
            </Badge>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {achievements.map((achievement, index) => (
              <AchievementCard
                key={achievement.id}
                achievement={achievement}
                index={index}
              />
            ))}
          </div>
        </div>

        {/* Milestones */}
        <div className="mt-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Milestones</h2>
          <div className="space-y-3">
            <MilestoneItem
              title="Read 100 Resources"
              description="You're making great progress!"
              current={67}
              target={100}
              reward={1000}
            />
            <MilestoneItem
              title="30-Day Streak"
              description="Consistency is key to success"
              current={streak}
              target={30}
              reward={2000}
            />
            <MilestoneItem
              title="Complete All Physics Chapters"
              description="Master the fundamentals"
              current={12}
              target={20}
              reward={500}
            />
          </div>
        </div>
      </div>
    </ScrollArea>
  )
}

// Stat Card
function StatCard({
  icon: Icon,
  label,
  value,
  suffix,
  color,
}: {
  icon: any
  label: string
  value: number
  suffix?: string
  color: string
}) {
  const colorClasses: Record<string, string> = {
    orange: 'bg-orange-50 text-orange-500',
    blue: 'bg-blue-50 text-blue-500',
    amber: 'bg-amber-50 text-amber-500',
    purple: 'bg-purple-50 text-purple-500',
  }

  return (
    <Card className="p-4 bg-white border-gray-100">
      <div className="flex items-center gap-3">
        <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center', colorClasses[color])}>
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <p className="text-xl font-bold text-gray-900">
            {value}
            {suffix && <span className="text-sm font-normal text-gray-400 ml-1">{suffix}</span>}
          </p>
          <p className="text-xs text-gray-500">{label}</p>
        </div>
      </div>
    </Card>
  )
}

// Achievement Card
function AchievementCard({
  achievement,
  index,
}: {
  achievement: any
  index: number
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.05 }}
    >
      <Card
        className={cn(
          'p-4 transition-all',
          achievement.unlocked
            ? 'bg-white border-gray-100'
            : 'bg-gray-50 border-gray-100'
        )}
      >
        <div className="flex items-start gap-4">
          <div className={cn(
            'w-12 h-12 rounded-xl flex items-center justify-center text-2xl',
            achievement.unlocked ? 'bg-amber-50' : 'bg-gray-100 grayscale'
          )}>
            {achievement.icon}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className={cn(
                'font-medium',
                achievement.unlocked ? 'text-gray-900' : 'text-gray-500'
              )}>
                {achievement.name}
              </h3>
              {achievement.unlocked && (
                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
              )}
            </div>
            <p className={cn(
              'text-sm',
              achievement.unlocked ? 'text-gray-500' : 'text-gray-400'
            )}>
              {achievement.description}
            </p>
            {!achievement.unlocked && achievement.progress !== undefined && (
              <div className="mt-2">
                <Progress
                  value={(achievement.progress / achievement.target) * 100}
                  className="h-1.5"
                />
                <p className="text-xs text-gray-400 mt-1">
                  {achievement.progress}/{achievement.target}
                </p>
              </div>
            )}
            <div className="flex items-center gap-2 mt-2">
              <Badge variant="outline" className={cn(
                'text-xs',
                achievement.unlocked ? 'border-amber-200 text-amber-700' : 'text-gray-400'
              )}>
                <Zap className="h-3 w-3 mr-1" />
                {achievement.xp} XP
              </Badge>
              {achievement.unlocked && (
                <span className="text-xs text-gray-400">
                  Unlocked {new Date(achievement.unlockedAt).toLocaleDateString()}
                </span>
              )}
            </div>
          </div>
          {!achievement.unlocked && (
            <Lock className="h-5 w-5 text-gray-300" />
          )}
        </div>
      </Card>
    </motion.div>
  )
}

// Milestone Item
function MilestoneItem({
  title,
  description,
  current,
  target,
  reward,
}: {
  title: string
  description: string
  current: number
  target: number
  reward: number
}) {
  const progress = Math.min((current / target) * 100, 100)
  const isComplete = current >= target

  return (
    <Card className={cn(
      'p-4',
      isComplete ? 'bg-emerald-50 border-emerald-200' : 'bg-white border-gray-100'
    )}>
      <div className="flex items-center gap-4">
        <div className={cn(
          'w-12 h-12 rounded-xl flex items-center justify-center',
          isComplete ? 'bg-emerald-100' : 'bg-gray-100'
        )}>
          {isComplete ? (
            <CheckCircle2 className="h-6 w-6 text-emerald-500" />
          ) : (
            <Target className="h-6 w-6 text-gray-400" />
          )}
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between mb-1">
            <h3 className={cn(
              'font-medium',
              isComplete ? 'text-emerald-700' : 'text-gray-900'
            )}>
              {title}
            </h3>
            <Badge variant="outline" className={cn(
              isComplete ? 'border-emerald-200 text-emerald-700' : 'text-gray-500'
            )}>
              <Zap className="h-3 w-3 mr-1" />
              {reward} XP
            </Badge>
          </div>
          <p className="text-sm text-gray-500 mb-2">{description}</p>
          <div className="flex items-center gap-3">
            <Progress value={progress} className="h-2 flex-1" />
            <span className="text-sm font-medium text-gray-700">
              {current}/{target}
            </span>
          </div>
        </div>
      </div>
    </Card>
  )
}

// Loading State
function LoadingState() {
  return (
    <div className="p-4 md:p-6 max-w-4xl mx-auto">
      <Skeleton className="h-8 w-48 mb-2" />
      <Skeleton className="h-5 w-64 mb-6" />
      <Skeleton className="h-32 rounded-2xl mb-6" />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-20 rounded-xl" />
        ))}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-24 rounded-xl" />
        ))}
      </div>
    </div>
  )
}

export default AchievementsPage
