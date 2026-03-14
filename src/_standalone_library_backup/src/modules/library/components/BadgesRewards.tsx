'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  BookOpen,
  Video,
  Headphones,
  Brain,
  Target,
  Trophy,
  Star,
  Zap,
  Flame,
  Clock,
  Award,
  Medal,
  Crown,
  Sparkles,
  CheckCircle2,
  Lock,
  ChevronRight,
  X,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

// Types
export interface BadgeData {
  id: string
  name: string
  description: string
  icon: string
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary'
  category: 'reading' | 'video' | 'interactive' | 'streak' | 'achievement' | 'mastery'
  unlockedAt?: string
  progress: number // 0-100
  requirement: number
  requirementLabel: string
  xpReward: number
  isNew?: boolean
}

export interface BadgesRewardsProps {
  badges?: BadgeData[]
  onBadgeClick?: (badge: BadgeData) => void
  showUnlockAnimation?: boolean
  className?: string
}

// Rarity colors
const rarityColors: Record<string, { bg: string; border: string; text: string; glow: string; gradient: string }> = {
  common: { 
    bg: 'bg-gray-100', 
    border: 'border-gray-300', 
    text: 'text-gray-700',
    glow: 'shadow-gray-200',
    gradient: 'from-gray-400 to-gray-500'
  },
  uncommon: { 
    bg: 'bg-green-50', 
    border: 'border-green-300', 
    text: 'text-green-700',
    glow: 'shadow-green-200',
    gradient: 'from-green-400 to-emerald-500'
  },
  rare: { 
    bg: 'bg-blue-50', 
    border: 'border-blue-300', 
    text: 'text-blue-700',
    glow: 'shadow-blue-200',
    gradient: 'from-blue-400 to-cyan-500'
  },
  epic: { 
    bg: 'bg-purple-50', 
    border: 'border-purple-300', 
    text: 'text-purple-700',
    glow: 'shadow-purple-200',
    gradient: 'from-purple-400 to-violet-500'
  },
  legendary: { 
    bg: 'bg-amber-50', 
    border: 'border-amber-300', 
    text: 'text-amber-700',
    glow: 'shadow-amber-200',
    gradient: 'from-amber-400 to-orange-500'
  },
}

// Category icons
const categoryIcons: Record<string, React.ElementType> = {
  reading: BookOpen,
  video: Video,
  interactive: Brain,
  streak: Flame,
  achievement: Trophy,
  mastery: Crown,
}

// Badge icon mapping
const badgeIcons: Record<string, React.ElementType> = {
  bookworm: BookOpen,
  video_master: Video,
  audio_listener: Headphones,
  quiz_champion: Target,
  streak_master: Flame,
  early_bird: Clock,
  night_owl: Star,
  perfectionist: Medal,
  speed_reader: Zap,
  knowledge_seeker: Brain,
  top_learner: Crown,
  dedicated: Award,
}

// Badge Card Component
function BadgeCard({ badge, onClick }: { badge: BadgeData; onClick?: () => void }) {
  const [isHovered, setIsHovered] = useState(false)
  const isUnlocked = badge.progress >= 100
  const colors = rarityColors[badge.rarity]
  const Icon = badgeIcons[badge.icon] || Trophy
  
  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.05, y: -4 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      onClick={onClick}
      className="cursor-pointer"
    >
      <Card className={cn(
        'relative p-4 border-2 rounded-2xl transition-all duration-300',
        isUnlocked 
          ? `${colors.bg} ${colors.border} ${colors.glow} shadow-lg`
          : 'bg-gray-50 border-gray-200 opacity-60',
        badge.isNew && isUnlocked && 'ring-2 ring-amber-400 ring-offset-2'
      )}>
        {/* New Badge Indicator */}
        {badge.isNew && isUnlocked && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-2 -right-2"
          >
            <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white border-0">
              NEW
            </Badge>
          </motion.div>
        )}
        
        {/* Icon */}
        <div className="flex justify-center mb-3">
          <motion.div
            animate={isUnlocked ? {
              rotate: isHovered ? [0, -10, 10, -10, 0] : 0,
              scale: isHovered ? 1.1 : 1,
            } : {}}
            transition={{ duration: 0.5 }}
            className={cn(
              'w-16 h-16 rounded-2xl flex items-center justify-center',
              isUnlocked 
                ? `bg-gradient-to-br ${colors.gradient} shadow-lg`
                : 'bg-gray-200'
            )}
          >
            {isUnlocked ? (
              <Icon className="h-8 w-8 text-white" />
            ) : (
              <Lock className="h-6 w-6 text-gray-400" />
            )}
          </motion.div>
        </div>
        
        {/* Name */}
        <div className="text-center mb-2">
          <h4 className={cn(
            'font-semibold text-sm',
            isUnlocked ? 'text-gray-900' : 'text-gray-500'
          )}>
            {badge.name}
          </h4>
          <p className="text-xs text-gray-500 mt-0.5">{badge.description}</p>
        </div>
        
        {/* Progress */}
        {!isUnlocked && (
          <div className="space-y-1">
            <Progress value={badge.progress} className="h-1.5" />
            <p className="text-xs text-center text-gray-500">
              {badge.progress}% • {badge.requirementLabel}
            </p>
          </div>
        )}
        
        {/* Unlocked Info */}
        {isUnlocked && (
          <div className="flex items-center justify-center gap-1 text-xs text-gray-500">
            <CheckCircle2 className="h-3 w-3 text-green-500" />
            Unlocked {badge.unlockedAt}
          </div>
        )}
        
        {/* XP Reward */}
        <div className="absolute top-2 left-2">
          <Badge variant="secondary" className={cn(
            'text-xs border-0',
            isUnlocked ? 'bg-white/80' : 'bg-gray-100'
          )}>
            <Zap className="h-3 w-3 mr-0.5 text-amber-500" />
            +{badge.xpReward} XP
          </Badge>
        </div>
        
        {/* Rarity */}
        <div className="absolute bottom-2 right-2">
          <Badge className={cn(
            'text-xs capitalize border-0',
            colors.bg,
            colors.text
          )}>
            {badge.rarity}
          </Badge>
        </div>
      </Card>
    </motion.div>
  )
}

// Badge Unlock Animation Modal
function BadgeUnlockModal({ 
  badge, 
  isOpen, 
  onClose 
}: { 
  badge: BadgeData | null
  isOpen: boolean
  onClose: () => void
}) {
  if (!badge) return null
  
  const colors = rarityColors[badge.rarity]
  const Icon = badgeIcons[badge.icon] || Trophy
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center">🎉 Badge Unlocked!</DialogTitle>
        </DialogHeader>
        
        <div className="py-6 text-center">
          {/* Animated Badge */}
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', stiffness: 200, damping: 15 }}
            className="relative inline-block"
          >
            {/* Glow Effect */}
            <motion.div
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.5, 0.8, 0.5],
              }}
              transition={{ duration: 2, repeat: Infinity }}
              className={cn(
                'absolute inset-0 rounded-full blur-xl',
                `bg-gradient-to-r ${colors.gradient}`
              )}
            />
            
            {/* Badge Icon */}
            <div className={cn(
              'relative w-28 h-28 rounded-full flex items-center justify-center',
              `bg-gradient-to-br ${colors.gradient}`,
              'shadow-2xl'
            )}>
              <Icon className="h-14 w-14 text-white" />
            </div>
            
            {/* Sparkles */}
            {[...Array(8)].map((_, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0 }}
                animate={{ 
                  opacity: [0, 1, 0],
                  scale: [0, 1, 0],
                }}
                transition={{ 
                  duration: 1.5,
                  delay: i * 0.1,
                  repeat: Infinity,
                  repeatDelay: 1
                }}
                className="absolute"
                style={{
                  top: `${50 + 40 * Math.sin(i * Math.PI / 4)}%`,
                  left: `${50 + 40 * Math.cos(i * Math.PI / 4)}%`,
                  transform: 'translate(-50%, -50%)'
                }}
              >
                <Sparkles className="h-4 w-4 text-amber-400" />
              </motion.div>
            ))}
          </motion.div>
          
          {/* Badge Name */}
          <motion.h3
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-2xl font-bold text-gray-900 mt-6"
          >
            {badge.name}
          </motion.h3>
          
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-gray-500 mt-2"
          >
            {badge.description}
          </motion.p>
          
          {/* XP Reward */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.7 }}
            className="mt-4"
          >
            <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white border-0 text-lg px-4 py-2">
              <Zap className="h-5 w-5 mr-2" />
              +{badge.xpReward} XP Earned!
            </Badge>
          </motion.div>
        </div>
        
        <Button
          onClick={onClose}
          className="w-full bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700"
        >
          Continue Learning
        </Button>
      </DialogContent>
    </Dialog>
  )
}

// Badge Showcase Component
function BadgeShowcase({ badges }: { badges: BadgeData[] }) {
  const unlockedBadges = badges.filter(b => b.progress >= 100)
  
  return (
    <Card className="p-4 bg-gradient-to-br from-violet-50 to-purple-50 border-violet-100 rounded-2xl">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Trophy className="h-5 w-5 text-violet-600" />
          <h3 className="font-semibold text-gray-900">Badge Showcase</h3>
        </div>
        <Badge variant="secondary" className="bg-white text-violet-700 border-violet-200">
          {unlockedBadges.length}/{badges.length}
        </Badge>
      </div>
      
      {/* Unlocked Badges Grid */}
      <div className="flex flex-wrap gap-2">
        {unlockedBadges.slice(0, 8).map((badge, index) => {
          const colors = rarityColors[badge.rarity]
          const Icon = badgeIcons[badge.icon] || Trophy
          
          return (
            <motion.div
              key={badge.id}
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05 }}
              whileHover={{ scale: 1.1, rotate: 5 }}
              className={cn(
                'w-10 h-10 rounded-lg flex items-center justify-center',
                `bg-gradient-to-br ${colors.gradient}`,
                'shadow-md cursor-pointer'
              )}
              title={badge.name}
            >
              <Icon className="h-5 w-5 text-white" />
            </motion.div>
          )
        })}
        
        {unlockedBadges.length > 8 && (
          <div className="w-10 h-10 rounded-lg bg-gray-200 flex items-center justify-center text-xs font-medium text-gray-600">
            +{unlockedBadges.length - 8}
          </div>
        )}
        
        {/* Locked placeholders */}
        {badges.filter(b => b.progress < 100).slice(0, 4).map((badge) => (
          <div
            key={badge.id}
            className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center border border-dashed border-gray-300"
          >
            <Lock className="h-4 w-4 text-gray-300" />
          </div>
        ))}
      </div>
    </Card>
  )
}

// Generate demo badges
function generateDemoBadges(): BadgeData[] {
  return [
    {
      id: 'bookworm',
      name: 'Bookworm',
      description: 'Read for 10 hours total',
      icon: 'bookworm',
      rarity: 'common',
      category: 'reading',
      progress: 100,
      requirement: 600,
      requirementLabel: '10h reading',
      xpReward: 100,
      unlockedAt: '2 days ago',
      isNew: true,
    },
    {
      id: 'video_master',
      name: 'Video Master',
      description: 'Watch 50 video lessons',
      icon: 'video_master',
      rarity: 'rare',
      category: 'video',
      progress: 72,
      requirement: 50,
      requirementLabel: '36/50 videos',
      xpReward: 250,
    },
    {
      id: 'streak_master',
      name: 'Streak Master',
      description: 'Maintain a 30-day streak',
      icon: 'streak_master',
      rarity: 'epic',
      category: 'streak',
      progress: 40,
      requirement: 30,
      requirementLabel: '12/30 days',
      xpReward: 500,
    },
    {
      id: 'quiz_champion',
      name: 'Quiz Champion',
      description: 'Score 100% on 10 quizzes',
      icon: 'quiz_champion',
      rarity: 'uncommon',
      category: 'achievement',
      progress: 100,
      requirement: 10,
      requirementLabel: '10 perfect scores',
      xpReward: 200,
      unlockedAt: '1 week ago',
    },
    {
      id: 'early_bird',
      name: 'Early Bird',
      description: 'Study before 7 AM for 5 days',
      icon: 'early_bird',
      rarity: 'rare',
      category: 'achievement',
      progress: 60,
      requirement: 5,
      requirementLabel: '3/5 days',
      xpReward: 150,
    },
    {
      id: 'perfectionist',
      name: 'Perfectionist',
      description: 'Complete 20 resources with 100% accuracy',
      icon: 'perfectionist',
      rarity: 'epic',
      category: 'mastery',
      progress: 35,
      requirement: 20,
      requirementLabel: '7/20 resources',
      xpReward: 400,
    },
    {
      id: 'speed_reader',
      name: 'Speed Reader',
      description: 'Read 500 pages in a week',
      icon: 'speed_reader',
      rarity: 'uncommon',
      category: 'reading',
      progress: 100,
      requirement: 500,
      requirementLabel: '500 pages',
      xpReward: 150,
      unlockedAt: '3 days ago',
    },
    {
      id: 'top_learner',
      name: 'Top Learner',
      description: 'Reach #1 on the leaderboard',
      icon: 'top_learner',
      rarity: 'legendary',
      category: 'achievement',
      progress: 0,
      requirement: 1,
      requirementLabel: 'Reach #1',
      xpReward: 1000,
    },
  ]
}

export function BadgesRewards({
  badges: providedBadges,
  onBadgeClick,
  showUnlockAnimation = false,
  className,
}: BadgesRewardsProps) {
  const [badges, setBadges] = useState(providedBadges || generateDemoBadges())
  const [selectedBadge, setSelectedBadge] = useState<BadgeData | null>(null)
  const [showUnlockModal, setShowUnlockModal] = useState(false)
  const [filter, setFilter] = useState<'all' | 'unlocked' | 'locked'>('all')
  
  // Simulate unlock animation on mount
  useEffect(() => {
    if (showUnlockAnimation) {
      const newBadge = badges.find(b => b.isNew && b.progress >= 100)
      if (newBadge) {
        setTimeout(() => {
          setSelectedBadge(newBadge)
          setShowUnlockModal(true)
          toast.success(`🎉 Badge Unlocked: ${newBadge.name}!`)
        }, 1000)
      }
    }
  }, [showUnlockAnimation, badges])
  
  // Filter badges
  const filteredBadges = badges.filter(badge => {
    if (filter === 'unlocked') return badge.progress >= 100
    if (filter === 'locked') return badge.progress < 100
    return true
  })
  
  // Stats
  const unlockedCount = badges.filter(b => b.progress >= 100).length
  const totalXP = badges.filter(b => b.progress >= 100).reduce((sum, b) => sum + b.xpReward, 0)
  
  return (
    <div className={cn('space-y-6', className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center">
            <Award className="h-5 w-5 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Badges & Rewards</h2>
            <p className="text-sm text-gray-500">{unlockedCount} of {badges.length} unlocked • {totalXP} XP earned</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant={filter === 'all' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setFilter('all')}
            className={cn(
              'rounded-lg',
              filter === 'all' && 'bg-violet-100 text-violet-700 hover:bg-violet-100'
            )}
          >
            All
          </Button>
          <Button
            variant={filter === 'unlocked' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setFilter('unlocked')}
            className={cn(
              'rounded-lg',
              filter === 'unlocked' && 'bg-violet-100 text-violet-700 hover:bg-violet-100'
            )}
          >
            Unlocked
          </Button>
          <Button
            variant={filter === 'locked' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setFilter('locked')}
            className={cn(
              'rounded-lg',
              filter === 'locked' && 'bg-violet-100 text-violet-700 hover:bg-violet-100'
            )}
          >
            Locked
          </Button>
        </div>
      </div>
      
      {/* Badge Showcase */}
      <BadgeShowcase badges={badges} />
      
      {/* Progress to Next Badge */}
      <Card className="p-4 border-gray-100 rounded-2xl">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-medium text-gray-900">Next Badge Progress</h3>
          <Sparkles className="h-4 w-4 text-amber-500" />
        </div>
        
        {badges.filter(b => b.progress < 100).slice(0, 3).map((badge) => {
          const colors = rarityColors[badge.rarity]
          const Icon = badgeIcons[badge.icon] || Trophy
          
          return (
            <motion.div
              key={badge.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg transition-colors"
            >
              <div className={cn(
                'w-10 h-10 rounded-lg flex items-center justify-center',
                'bg-gray-100'
              )}>
                <Icon className="h-5 w-5 text-gray-400" />
              </div>
              
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-sm text-gray-900">{badge.name}</span>
                  <span className="text-xs text-gray-500">{badge.progress}%</span>
                </div>
                <Progress value={badge.progress} className="h-1.5 mt-1" />
              </div>
              
              <Badge className={cn('border-0', colors.bg, colors.text)}>
                +{badge.xpReward} XP
              </Badge>
            </motion.div>
          )
        })}
      </Card>
      
      {/* Badges Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        <AnimatePresence mode="popLayout">
          {filteredBadges.map((badge) => (
            <BadgeCard
              key={badge.id}
              badge={badge}
              onClick={() => {
                setSelectedBadge(badge)
                onBadgeClick?.(badge)
              }}
            />
          ))}
        </AnimatePresence>
      </div>
      
      {/* Badge Detail Modal */}
      <BadgeUnlockModal
        badge={selectedBadge}
        isOpen={showUnlockModal}
        onClose={() => {
          setShowUnlockModal(false)
          setSelectedBadge(null)
        }}
      />
    </div>
  )
}

export default BadgesRewards
