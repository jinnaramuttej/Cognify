'use client'

import React, { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Trophy,
  Star,
  Zap,
  Flame,
  BookOpen,
  Target,
  Award,
  Lock,
  CheckCircle2,
  Filter,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

// XP Gold color
const XP_GOLD = '#F59E0B'

// Types
export type AchievementCategory = 'streak' | 'content' | 'quiz' | 'flashcard'

export interface Achievement {
  id: string
  name: string
  description: string
  icon: string
  category: AchievementCategory
  xpReward: number
  isUnlocked: boolean
  unlockedAt?: string
  progress?: {
    current: number
    target: number
  }
}

export interface AchievementsPanelProps {
  achievements: Achievement[]
  totalXpEarned: number
  onAchievementClick?: (achievement: Achievement) => void
  className?: string
}

// Category icons and colors
const CATEGORY_CONFIG: Record<
  AchievementCategory,
  { icon: React.ElementType; color: string; bgColor: string; label: string }
> = {
  streak: {
    icon: Flame,
    color: 'text-orange-500',
    bgColor: 'bg-orange-500/10',
    label: 'Streak',
  },
  content: {
    icon: BookOpen,
    color: 'text-blue-500',
    bgColor: 'bg-blue-500/10',
    label: 'Content',
  },
  quiz: {
    icon: Target,
    color: 'text-green-500',
    bgColor: 'bg-green-500/10',
    label: 'Quiz',
  },
  flashcard: {
    icon: Star,
    color: 'text-purple-500',
    bgColor: 'bg-purple-500/10',
    label: 'Flashcard',
  },
}

// Achievement icon mapping
const ICON_MAP: Record<string, React.ElementType> = {
  trophy: Trophy,
  star: Star,
  flame: Flame,
  book: BookOpen,
  target: Target,
  award: Award,
  zap: Zap,
}

// Achievement badge component
const AchievementBadge: React.FC<{
  achievement: Achievement
  onClick?: () => void
  index: number
}> = ({ achievement, onClick, index }) => {
  const [showUnlockAnimation, setShowUnlockAnimation] = useState(false)
  const Icon = ICON_MAP[achievement.icon] || Trophy
  const categoryConfig = CATEGORY_CONFIG[achievement.category]
  const progressPercent = achievement.progress
    ? (achievement.progress.current / achievement.progress.target) * 100
    : 0

  const handleClick = () => {
    if (achievement.isUnlocked && !achievement.unlockedAt) {
      // Show unlock animation for newly unlocked achievements
      setShowUnlockAnimation(true)
      setTimeout(() => setShowUnlockAnimation(false), 2000)
    }
    onClick?.()
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.05, type: 'spring', stiffness: 300, damping: 25 }}
      whileHover={{ scale: 1.05, y: -5 }}
      whileTap={{ scale: 0.95 }}
      onClick={handleClick}
      className={`relative cursor-pointer rounded-xl border p-4 transition-all ${
        achievement.isUnlocked
          ? 'border-primary/30 bg-card hover:border-primary/50 hover:shadow-lg'
          : 'border-muted bg-muted/30 opacity-60 grayscale hover:opacity-80 hover:grayscale-[50%]'
      }`}
    >
      {/* XP badge */}
      <div className="absolute -right-2 -top-2 z-10">
        <Badge
          className="border-2 border-background shadow-sm"
          style={{ backgroundColor: XP_GOLD, color: 'white' }}
        >
          <Zap className="mr-0.5 h-3 w-3" />
          {achievement.xpReward}
        </Badge>
      </div>

      {/* Locked overlay */}
      {!achievement.isUnlocked && (
        <div className="absolute inset-0 z-10 flex items-center justify-center rounded-xl bg-background/50">
          <Lock className="h-8 w-8 text-muted-foreground" />
        </div>
      )}

      {/* Unlock animation */}
      <AnimatePresence>
        {showUnlockAnimation && (
          <motion.div
            className="absolute inset-0 z-20 flex items-center justify-center rounded-xl bg-primary/90"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.2 }}
          >
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring', stiffness: 500, damping: 20 }}
            >
              <CheckCircle2 className="h-12 w-12 text-white" />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Badge content */}
      <div className="flex flex-col items-center text-center">
        <motion.div
          className={`mb-3 flex h-14 w-14 items-center justify-center rounded-xl ${categoryConfig.bgColor}`}
          animate={
            achievement.isUnlocked
              ? {
                  boxShadow: [
                    `0 0 0px ${categoryConfig.color.replace('text-', 'rgba(').replace('-500', ', 0)')}`,
                    `0 0 15px ${categoryConfig.color.replace('text-', 'rgba(').replace('-500', ', 0.3)')}`,
                    `0 0 0px ${categoryConfig.color.replace('text-', 'rgba(').replace('-500', ', 0)')}`,
                  ],
                }
              : {}
          }
          transition={{ duration: 2, repeat: Infinity }}
        >
          <Icon className={`h-7 w-7 ${categoryConfig.color}`} />
        </motion.div>

        <h4 className="mb-1 text-sm font-semibold">{achievement.name}</h4>
        <p className="text-xs text-muted-foreground line-clamp-2">{achievement.description}</p>

        {/* Progress bar for incomplete achievements */}
        {achievement.progress && !achievement.isUnlocked && (
          <div className="mt-3 w-full space-y-1">
            <Progress value={progressPercent} className="h-1.5" />
            <div className="flex justify-center text-[10px] text-muted-foreground">
              {achievement.progress.current}/{achievement.progress.target}
            </div>
          </div>
        )}

        {/* Unlocked indicator */}
        {achievement.isUnlocked && (
          <motion.div
            className="mt-2 flex items-center gap-1 text-xs text-green-600 dark:text-green-400"
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <CheckCircle2 className="h-3 w-3" />
            <span>Unlocked</span>
          </motion.div>
        )}
      </div>
    </motion.div>
  )
}

// Category filter button
const CategoryFilterButton: React.FC<{
  category: AchievementCategory | 'all'
  isActive: boolean
  count: number
  onClick: () => void
}> = ({ category, isActive, count, onClick }) => {
  const config =
    category === 'all'
      ? { icon: Trophy, color: 'text-foreground', bgColor: 'bg-muted', label: 'All' }
      : CATEGORY_CONFIG[category]
  const Icon = config.icon

  return (
    <Button
      variant={isActive ? 'default' : 'outline'}
      size="sm"
      onClick={onClick}
      className="relative"
    >
      <Icon className={`mr-1.5 h-4 w-4 ${isActive ? '' : config.color}`} />
      {config.label}
      <Badge
        variant={isActive ? 'secondary' : 'outline'}
        className="ml-1.5 h-5 px-1.5 text-[10px]"
      >
        {count}
      </Badge>
    </Button>
  )
}

export const AchievementsPanel: React.FC<AchievementsPanelProps> = ({
  achievements,
  totalXpEarned,
  onAchievementClick,
  className,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<AchievementCategory | 'all'>('all')
  const [sortBy, setSortBy] = useState<'recent' | 'xp' | 'name'>('recent')

  // Calculate stats
  const stats = useMemo(() => {
    const unlocked = achievements.filter((a) => a.isUnlocked)
    const byCategory = Object.keys(CATEGORY_CONFIG).reduce(
      (acc, cat) => {
        acc[cat as AchievementCategory] = achievements.filter((a) => a.category === cat).length
        return acc
      },
      {} as Record<AchievementCategory, number>
    )

    return {
      total: achievements.length,
      unlocked: unlocked.length,
      byCategory,
      unlockedByCategory: Object.keys(CATEGORY_CONFIG).reduce(
        (acc, cat) => {
          acc[cat as AchievementCategory] = achievements.filter(
            (a) => a.category === cat && a.isUnlocked
          ).length
          return acc
        },
        {} as Record<AchievementCategory, number>
      ),
    }
  }, [achievements])

  // Filter and sort achievements
  const filteredAchievements = useMemo(() => {
    let filtered =
      selectedCategory === 'all'
        ? achievements
        : achievements.filter((a) => a.category === selectedCategory)

    // Sort
    switch (sortBy) {
      case 'recent':
        filtered = filtered.sort((a, b) => {
          if (a.isUnlocked && !b.isUnlocked) return -1
          if (!a.isUnlocked && b.isUnlocked) return 1
          if (a.unlockedAt && b.unlockedAt) {
            return new Date(b.unlockedAt!).getTime() - new Date(a.unlockedAt!).getTime()
          }
          return 0
        })
        break
      case 'xp':
        filtered = filtered.sort((a, b) => b.xpReward - a.xpReward)
        break
      case 'name':
        filtered = filtered.sort((a, b) => a.name.localeCompare(b.name))
        break
    }

    return filtered
  }, [achievements, selectedCategory, sortBy])

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Trophy className="h-5 w-5 text-yellow-500" />
            Achievements
          </CardTitle>
          <div className="flex items-center gap-1">
            <Zap className="h-4 w-4" style={{ color: XP_GOLD }} />
            <span className="font-mono text-sm font-semibold">{totalXpEarned} XP</span>
          </div>
        </div>

        {/* Progress summary */}
        <div className="mt-2 flex items-center gap-2">
          <Progress value={(stats.unlocked / stats.total) * 100} className="h-2 flex-1" />
          <span className="text-xs text-muted-foreground">
            {stats.unlocked}/{stats.total}
          </span>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Category filters */}
        <div className="flex flex-wrap gap-2">
          <CategoryFilterButton
            category="all"
            isActive={selectedCategory === 'all'}
            count={achievements.length}
            onClick={() => setSelectedCategory('all')}
          />
          {(Object.keys(CATEGORY_CONFIG) as AchievementCategory[]).map((cat) => (
            <CategoryFilterButton
              key={cat}
              category={cat}
              isActive={selectedCategory === cat}
              count={stats.byCategory[cat]}
              onClick={() => setSelectedCategory(cat)}
            />
          ))}
        </div>

        <Separator />

        {/* Sort options */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Sort by:</span>
          <Select value={sortBy} onValueChange={(v) => setSortBy(v as typeof sortBy)}>
            <SelectTrigger className="h-8 w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="recent">Recent</SelectItem>
              <SelectItem value="xp">XP Reward</SelectItem>
              <SelectItem value="name">Name</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Achievements grid */}
        <ScrollArea className="h-[400px] pr-2">
          <div className="grid grid-cols-2 gap-3">
            <AnimatePresence mode="popLayout">
              {filteredAchievements.map((achievement, index) => (
                <AchievementBadge
                  key={achievement.id}
                  achievement={achievement}
                  onClick={() => onAchievementClick?.(achievement)}
                  index={index}
                />
              ))}
            </AnimatePresence>
          </div>

          {filteredAchievements.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center py-8 text-muted-foreground"
            >
              <Filter className="mb-2 h-8 w-8 opacity-50" />
              <p className="text-sm">No achievements in this category</p>
            </motion.div>
          )}
        </ScrollArea>

        <Separator />

        {/* Category progress breakdown */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium">Progress by Category</h4>
          <div className="space-y-2">
            {(Object.keys(CATEGORY_CONFIG) as AchievementCategory[]).map((cat) => {
              const config = CATEGORY_CONFIG[cat]
              const Icon = config.icon
              const progress =
                stats.byCategory[cat] > 0
                  ? (stats.unlockedByCategory[cat] / stats.byCategory[cat]) * 100
                  : 0

              return (
                <div key={cat} className="flex items-center gap-2">
                  <Icon className={`h-4 w-4 ${config.color}`} />
                  <span className="w-20 text-xs">{config.label}</span>
                  <Progress value={progress} className="h-1.5 flex-1" />
                  <span className="w-12 text-right text-xs text-muted-foreground">
                    {stats.unlockedByCategory[cat]}/{stats.byCategory[cat]}
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default AchievementsPanel
