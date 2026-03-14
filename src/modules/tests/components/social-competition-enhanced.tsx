'use client'

import { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import { motion, AnimatePresence, useAnimation } from 'framer-motion'
import { io, Socket } from 'socket.io-client'
import { 
  Trophy, Medal, Crown, Flame, Users, TrendingUp, TrendingDown,
  Minus, Zap, Target, Calendar, Clock, Star, ChevronRight,
  RefreshCw, Share2, UserPlus, Award, BarChart3, Timer, Swords,
  Shield, Sparkles, PartyPopper, X, Check, Bell, BellOff
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { cn } from '@/modules/tests/utils'
import { AnimatedCounter } from './motion'

// ============================================
// TYPES
// ============================================

interface LeaderboardEntry {
  rank: number
  previousRank: number
  userId: string
  userName: string
  avatar?: string
  score: number
  accuracy: number
  timeSpent: number
  streak: number
  isCurrentUser?: boolean
  isFriend?: boolean
  badges: string[]
}

interface Squad {
  id: string
  name: string
  members: SquadMember[]
  totalScore: number
  rank: number
  badge: string
}

interface SquadMember {
  id: string
  name: string
  avatar?: string
  score: number
  contribution: number
}

interface Challenge {
  id: string
  title: string
  description: string
  type: 'daily' | 'weekly' | 'special'
  category?: string
  reward: number
  progress: number
  target: number
  endsAt: string
  participants: number
  completed: boolean
  badgeReward?: string
}

interface StreakData {
  currentStreak: number
  longestStreak: number
  lastActivityDate: string | null
  weeklyActivity: { day: string; completed: boolean }[]
}

interface PercentileData {
  percentile: number
  rank: number
  totalParticipants: number
  topPercentage: number
  comparison: {
    aboveYou: number
    belowYou: number
  }
}

interface FriendComparison {
  friendId: string
  friendName: string
  friendAvatar?: string
  yourScore: number
  friendScore: number
  difference: number
  subject: string
  comparison: 'ahead' | 'behind' | 'tied'
}

interface Notification {
  type: string
  title: string
  message: string
  data: Record<string, any>
}

interface LiveTick {
  updatedUserId: string
  updatedUserName: string
  newScore: number
  rank: number
  previousRank: number
}

// ============================================
// DESIGN TOKENS
// ============================================

const SOCIAL_TOKENS = {
  ranks: {
    1: { color: '#FFD700', bg: 'bg-amber-400', text: 'text-amber-900', label: 'Gold', gradient: 'from-amber-400 to-amber-600' },
    2: { color: '#C0C0C0', bg: 'bg-gray-300', text: 'text-gray-700', label: 'Silver', gradient: 'from-gray-300 to-gray-500' },
    3: { color: '#CD7F32', bg: 'bg-orange-400', text: 'text-orange-900', label: 'Bronze', gradient: 'from-orange-400 to-orange-600' },
    default: { color: '#6B7280', bg: 'bg-gray-100', text: 'text-gray-600', label: '', gradient: 'from-gray-400 to-gray-500' }
  },
  badges: {
    speedster: { icon: '⚡', label: 'Speed Demon', color: 'text-cyan-500', bg: 'bg-cyan-100' },
    perfectionist: { icon: '✨', label: 'Perfect Score', color: 'text-purple-500', bg: 'bg-purple-100' },
    streaker: { icon: '🔥', label: 'Streak Master', color: 'text-orange-500', bg: 'bg-orange-100' },
    genius: { icon: '🧠', label: 'Genius', color: 'text-pink-500', bg: 'bg-pink-100' },
    champion: { icon: '👑', label: 'Champion', color: 'text-amber-500', bg: 'bg-amber-100' },
    warrior: { icon: '⚔️', label: 'Warrior', color: 'text-red-500', bg: 'bg-red-100' }
  },
  rarities: {
    common: { border: 'border-gray-300', glow: '' },
    rare: { border: 'border-blue-400', glow: 'shadow-blue-400/30' },
    epic: { border: 'border-purple-400', glow: 'shadow-purple-400/30' },
    legendary: { border: 'border-amber-400', glow: 'shadow-amber-400/30' }
  }
}

// ============================================
// CELEBRATION COMPONENT
// ============================================

interface CelebrationProps {
  type: 'rank_up' | 'badge_earned' | 'streak_milestone' | 'challenge_complete'
  data: {
    title: string
    message: string
    icon?: string
    badge?: { icon: string; color: string; name: string }
  }
  onClose: () => void
}

function CelebrationOverlay({ type, data, onClose }: CelebrationProps) {
  const confettiRef = useRef<HTMLDivElement>(null)
  
  useEffect(() => {
    // Generate confetti particles
    if (confettiRef.current) {
      const particles = Array.from({ length: 50 }, (_, i) => {
        const particle = document.createElement('div')
        particle.className = 'absolute w-2 h-2 rounded-full'
        particle.style.backgroundColor = ['#FFD700', '#FF6B6B', '#4ECDC4', '#A855F7', '#10B981'][i % 5]
        particle.style.left = `${Math.random() * 100}%`
        particle.style.animationDelay = `${Math.random() * 0.5}s`
        particle.style.animation = 'confetti-fall 3s ease-out forwards'
        return particle
      })
      
      particles.forEach(p => confettiRef.current?.appendChild(p))
      
      return () => {
        particles.forEach(p => p.remove())
      }
    }
  }, [])

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50"
      onClick={onClose}
    >
      {/* Confetti container */}
      <div ref={confettiRef} className="absolute inset-0 pointer-events-none overflow-hidden" />
      
      <motion.div
        initial={{ scale: 0.5, opacity: 0, y: 50 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.5, opacity: 0, y: 50 }}
        transition={{ type: 'spring', damping: 15 }}
        onClick={e => e.stopPropagation()}
        className="bg-white rounded-3xl p-8 text-center max-w-md mx-4 shadow-2xl relative overflow-hidden"
      >
        {/* Animated background */}
        <div className="absolute inset-0 bg-gradient-to-br from-amber-50 via-purple-50 to-cyan-50" />
        
        <div className="relative z-10">
          <motion.div
            animate={{ 
              scale: [1, 1.2, 1],
              rotate: [0, 10, -10, 0]
            }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-7xl mb-4"
          >
            {data.badge ? (
              <span className="text-7xl">{data.badge.icon}</span>
            ) : (
              <span>🎉</span>
            )}
          </motion.div>
          
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-2xl font-bold text-gray-900 mb-2"
          >
            {data.title}
          </motion.h2>
          
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-gray-600 mb-6"
          >
            {data.message}
          </motion.p>
          
          {data.badge && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-amber-100 to-amber-200 border border-amber-300 mb-6"
            >
              <span className="text-2xl">{data.badge.icon}</span>
              <span className="font-semibold text-amber-800">{data.badge.name}</span>
            </motion.div>
          )}
          
          <Button
            onClick={onClose}
            className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white"
          >
            <Sparkles className="h-4 w-4 mr-2" />
            Awesome!
          </Button>
        </div>
      </motion.div>
    </motion.div>
  )
}

// ============================================
// RANK BADGE COMPONENT
// ============================================

interface RankBadgeProps {
  rank: number
  size?: 'sm' | 'md' | 'lg'
  showLabel?: boolean
  animated?: boolean
}

export function RankBadge({ rank, size = 'md', showLabel = false, animated = true }: RankBadgeProps) {
  const sizeClasses = {
    sm: 'w-6 h-6 text-xs',
    md: 'w-8 h-8 text-sm',
    lg: 'w-12 h-12 text-lg'
  }

  if (rank <= 3) {
    const icons = { 
      1: <Crown className="h-full w-full p-1.5" />, 
      2: <Medal className="h-full w-full p-1.5" />, 
      3: <Medal className="h-full w-full p-1.5" /> 
    }
    const token = SOCIAL_TOKENS.ranks[rank as 1|2|3]
    
    return (
      <motion.div
        initial={animated ? { scale: 0, rotate: -180 } : false}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: 'spring', damping: 10 }}
        className={cn(
          "rounded-full flex items-center justify-center shadow-lg",
          sizeClasses[size],
          `bg-gradient-to-br ${token.gradient} text-white`,
          rank === 1 && "shadow-amber-500/40",
          rank === 2 && "shadow-gray-400/40",
          rank === 3 && "shadow-orange-500/40"
        )}
        whileHover={{ scale: 1.15, rotate: [0, -10, 10, 0] }}
      >
        {icons[rank as 1|2|3]}
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={animated ? { scale: 0 } : false}
      animate={{ scale: 1 }}
      className={cn(
        "rounded-full bg-gray-100 flex items-center justify-center font-bold text-gray-600 border-2 border-gray-200",
        sizeClasses[size]
      )}
    >
      {rank}
    </motion.div>
  )
}

// ============================================
// MICRO CELEBRATION COMPONENT
// ============================================

interface MicroCelebrationProps {
  type: 'rank_change' | 'streak' | 'points' | 'badge'
  value: number
  positive?: boolean
}

function MicroCelebration({ type, value, positive = true }: MicroCelebrationProps) {
  const icons = {
    rank_change: positive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />,
    streak: <Flame className="h-3 w-3" />,
    points: <Star className="h-3 w-3" />,
    badge: <Award className="h-3 w-3" />
  }

  return (
    <motion.div
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0, opacity: 0 }}
      className={cn(
        "flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold",
        positive 
          ? "bg-emerald-100 text-emerald-700 border border-emerald-200" 
          : "bg-red-100 text-red-700 border border-red-200"
      )}
    >
      {icons[type]}
      <span>{positive ? '+' : ''}{value}{type === 'rank_change' ? '' : type === 'streak' ? '🔥' : 'pts'}</span>
    </motion.div>
  )
}

// ============================================
// ANIMATED LEADERBOARD
// ============================================

interface AnimatedLeaderboardProps {
  entries: LeaderboardEntry[]
  onUserClick?: (userId: string) => void
  liveUpdates?: boolean
}

function AnimatedLeaderboard({ entries, onUserClick, liveUpdates = true }: AnimatedLeaderboardProps) {
  const [animatingEntries, setAnimatingEntries] = useState<Set<string>>(new Set())
  const [microCelebrations, setMicroCelebrations] = useState<Map<string, { type: string; value: number; positive: boolean }>>(new Map())

  // Detect rank changes
  const rankChanges = useMemo(() => {
    const changed = new Set<string>()
    entries.forEach(entry => {
      if (entry.rank !== entry.previousRank) {
        changed.add(entry.userId)
      }
    })
    return changed
  }, [entries])

  const getRankChange = (entry: LeaderboardEntry) => {
    const diff = entry.previousRank - entry.rank
    if (diff > 0) return { direction: 'up', amount: diff }
    if (diff < 0) return { direction: 'down', amount: Math.abs(diff) }
    return { direction: 'same', amount: 0 }
  }

  // Show micro celebration on rank change
  useEffect(() => {
    entries.forEach(entry => {
      const change = getRankChange(entry)
      if (change.amount > 0 && entry.isCurrentUser) {
        setMicroCelebrations(prev => {
          const next = new Map(prev)
          next.set(entry.userId, { 
            type: 'rank_change', 
            value: change.amount, 
            positive: change.direction === 'up' 
          })
          return next
        })
        
        setTimeout(() => {
          setMicroCelebrations(prev => {
            const next = new Map(prev)
            next.delete(entry.userId)
            return next
          })
        }, 3000)
      }
    })
  }, [entries])

  return (
    <Card className="border border-gray-200 shadow-sm overflow-hidden">
      <CardHeader className="border-b border-gray-100 bg-gradient-to-r from-amber-50 to-white pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold text-gray-900 flex items-center gap-2">
            <Trophy className="h-4 w-4 text-amber-600" />
            Live Leaderboard
          </CardTitle>
          <div className="flex items-center gap-2">
            {liveUpdates && (
              <Badge variant="outline" className="border-emerald-200 text-emerald-700 bg-emerald-50">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse mr-1.5" />
                Live
              </Badge>
            )}
            <Badge variant="outline" className="border-amber-200 text-amber-700">
              <Clock className="h-3 w-3 mr-1" />
              Real-time
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="divide-y divide-gray-100">
          <AnimatePresence>
            {entries.map((entry, index) => {
              const rankChange = getRankChange(entry)
              const isAnimating = rankChanges.has(entry.userId)
              const celebration = microCelebrations.get(entry.userId)

              return (
                <motion.div
                  key={entry.userId}
                  layout
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ 
                    opacity: 1, 
                    x: 0,
                    backgroundColor: isAnimating 
                      ? entry.rank < entry.previousRank 
                        ? 'rgba(16, 185, 129, 0.08)' 
                        : 'rgba(239, 68, 68, 0.08)'
                      : 'transparent'
                  }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ 
                    layout: { type: 'spring', stiffness: 300, damping: 30 },
                    opacity: { duration: 0.2 },
                    x: { duration: 0.2 }
                  }}
                  onClick={() => onUserClick?.(entry.userId)}
                  className={cn(
                    "flex items-center gap-4 p-4 transition-colors cursor-pointer hover:bg-gray-50",
                    entry.isCurrentUser && "bg-blue-50/50"
                  )}
                >
                  {/* Rank */}
                  <div className="w-12 flex flex-col items-center">
                    <RankBadge rank={entry.rank} size="md" animated={isAnimating} />
                    {rankChange.amount > 0 && (
                      <motion.div
                        initial={{ scale: 0, y: -5 }}
                        animate={{ scale: 1, y: 0 }}
                        className={cn(
                          "flex items-center gap-0.5 mt-1 text-xs font-medium",
                          rankChange.direction === 'up' ? 'text-emerald-600' : 'text-red-600'
                        )}
                      >
                        {rankChange.direction === 'up' ? (
                          <TrendingUp className="h-3 w-3" />
                        ) : (
                          <TrendingDown className="h-3 w-3" />
                        )}
                        {rankChange.amount}
                      </motion.div>
                    )}
                    {rankChange.amount === 0 && (
                      <Minus className="h-3 w-3 text-gray-400 mt-1" />
                    )}
                  </div>

                  {/* User Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <motion.div
                        className={cn(
                          "w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold shadow-sm",
                          entry.isCurrentUser 
                            ? "bg-gradient-to-br from-blue-500 to-blue-600 text-white" 
                            : "bg-gray-100 text-gray-600"
                        )}
                        whileHover={{ scale: 1.1 }}
                      >
                        {entry.userName.charAt(0)}
                      </motion.div>
                      <div>
                        <div className="font-medium text-gray-900 flex items-center gap-2">
                          {entry.userName}
                          {entry.isCurrentUser && (
                            <Badge className="bg-blue-100 text-blue-700 border-0 text-xs">You</Badge>
                          )}
                          {entry.isFriend && (
                            <Badge variant="outline" className="border-purple-200 text-purple-600 text-xs">
                              <UserPlus className="h-2.5 w-2.5 mr-1" />
                              Friend
                            </Badge>
                          )}
                          {celebration && (
                            <MicroCelebration 
                              type={celebration.type as any}
                              value={celebration.value}
                              positive={celebration.positive}
                            />
                          )}
                        </div>
                        <div className="text-xs text-gray-500 flex items-center gap-2">
                          <span>{entry.accuracy}% accuracy</span>
                          <span>•</span>
                          <span>{entry.timeSpent}m avg</span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Badges */}
                    {entry.badges.length > 0 && (
                      <div className="flex gap-1 mt-1.5">
                        {entry.badges.map(badge => {
                          const badgeToken = SOCIAL_TOKENS.badges[badge as keyof typeof SOCIAL_TOKENS.badges]
                          return badgeToken ? (
                            <motion.span
                              key={badge}
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              whileHover={{ scale: 1.2 }}
                              className={cn("text-base cursor-help px-1.5 py-0.5 rounded-md", badgeToken.bg)}
                              title={badgeToken.label}
                            >
                              {badgeToken.icon}
                            </motion.span>
                          ) : null
                        })}
                      </div>
                    )}
                  </div>

                  {/* Score */}
                  <div className="text-right">
                    <motion.div
                      key={entry.score}
                      initial={{ scale: 1.2, color: '#10B981' }}
                      animate={{ scale: 1, color: '#111827' }}
                      className="text-xl font-bold text-gray-900"
                    >
                      <AnimatedCounter value={entry.score} />
                    </motion.div>
                    <div className="text-xs text-gray-500">points</div>
                  </div>

                  {/* Streak */}
                  <div className="w-16 text-center">
                    <motion.div 
                      className="flex items-center justify-center gap-1"
                      whileHover={{ scale: 1.1 }}
                    >
                      <motion.div
                        animate={{ scale: [1, 1.1, 1] }}
                        transition={{ duration: 1, repeat: Infinity }}
                      >
                        <Flame className={cn(
                          "h-4 w-4",
                          entry.streak >= 7 ? "text-orange-500" : 
                          entry.streak >= 3 ? "text-orange-400" : "text-gray-400"
                        )} />
                      </motion.div>
                      <span className="font-semibold text-gray-900">{entry.streak}</span>
                    </motion.div>
                    <div className="text-xs text-gray-500">streak</div>
                  </div>
                </motion.div>
              )
            })}
          </AnimatePresence>
        </div>
      </CardContent>
    </Card>
  )
}

// ============================================
// STREAK CARD COMPONENT
// ============================================

interface StreakCardProps {
  streak: StreakData
  compact?: boolean
}

function StreakCard({ streak, compact = false }: StreakCardProps) {
  const controls = useAnimation()
  
  useEffect(() => {
    if (streak.currentStreak > 0) {
      controls.start({
        scale: [1, 1.05, 1],
        transition: { duration: 0.5 }
      })
    }
  }, [streak.currentStreak, controls])

  return (
    <Card className="border border-gray-200 shadow-sm overflow-hidden">
      <CardContent className={cn("p-4", compact && "p-3")}>
        <div className="flex items-center gap-2 mb-3">
          <motion.div
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <Flame className="h-5 w-5 text-orange-500" />
          </motion.div>
          <span className="text-sm font-medium text-gray-600">Current Streak</span>
        </div>
        
        <motion.div 
          animate={controls}
          className="flex items-end gap-1 mb-3"
        >
          <span className="text-4xl font-bold text-gray-900">{streak.currentStreak}</span>
          <span className="text-lg text-gray-500 mb-1">days</span>
          {streak.currentStreak >= 7 && (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="ml-2 text-2xl"
            >
              🔥
            </motion.span>
          )}
        </motion.div>
        
        {/* Weekly Activity */}
        <div className="space-y-2">
          <div className="flex gap-1">
            {streak.weeklyActivity.map((day, i) => (
              <motion.div
                key={i}
                initial={{ scaleY: 0 }}
                animate={{ scaleY: 1 }}
                transition={{ delay: i * 0.05 }}
                className={cn(
                  "flex-1 h-8 rounded-md transition-all duration-200",
                  day.completed 
                    ? "bg-gradient-to-t from-orange-400 to-orange-500 shadow-sm shadow-orange-200" 
                    : "bg-gray-100"
                )}
                title={day.day}
              />
            ))}
          </div>
          <div className="flex justify-between text-xs text-gray-400">
            {streak.weeklyActivity.map(day => (
              <span key={day.day} className="flex-1 text-center font-medium">{day.day.charAt(0)}</span>
            ))}
          </div>
        </div>
        
        {/* Longest streak */}
        <div className="mt-3 pt-3 border-t border-gray-100 flex justify-between text-xs">
          <span className="text-gray-500">Longest streak</span>
          <span className="font-semibold text-gray-700">{streak.longestStreak} days</span>
        </div>
      </CardContent>
    </Card>
  )
}

// ============================================
// PERCENTILE CARD COMPONENT
// ============================================

interface PercentileCardProps {
  percentile: PercentileData
}

function PercentileCard({ percentile }: PercentileCardProps) {
  const radius = 45
  const circumference = 2 * Math.PI * radius
  const strokeDashoffset = circumference - (percentile.percentile / 100) * circumference

  return (
    <Card className="border border-gray-200 shadow-sm overflow-hidden">
      <CardContent className="p-4">
        <div className="flex items-center gap-2 mb-3">
          <BarChart3 className="h-5 w-5 text-purple-500" />
          <span className="text-sm font-medium text-gray-600">Percentile Rank</span>
        </div>
        
        <div className="flex items-center justify-center">
          <div className="relative">
            <svg width="120" height="120" viewBox="0 0 120 120">
              <circle
                cx="60"
                cy="60"
                r={radius}
                fill="none"
                stroke="#E5E7EB"
                strokeWidth="10"
              />
              <motion.circle
                cx="60"
                cy="60"
                r={radius}
                fill="none"
                stroke="url(#percentileGradient)"
                strokeWidth="10"
                strokeLinecap="round"
                initial={{ strokeDashoffset: circumference }}
                animate={{ strokeDashoffset }}
                transition={{ duration: 1, ease: 'easeOut' }}
                style={{ transform: 'rotate(-90deg)', transformOrigin: 'center' }}
              />
              <defs>
                <linearGradient id="percentileGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#8B5CF6" />
                  <stop offset="100%" stopColor="#A855F7" />
                </linearGradient>
              </defs>
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-3xl font-bold text-gray-900">{percentile.percentile}</span>
              <span className="text-xs text-gray-500">percentile</span>
            </div>
          </div>
        </div>
        
        <div className="mt-4 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-purple-50 border border-purple-200">
            <Trophy className="h-4 w-4 text-purple-600" />
            <span className="text-sm font-semibold text-purple-700">
              Top {percentile.topPercentage}%
            </span>
          </div>
        </div>
        
        <div className="mt-4 grid grid-cols-2 gap-2 text-center">
          <div className="p-2 bg-gray-50 rounded-lg">
            <div className="text-lg font-bold text-gray-900">#{percentile.rank}</div>
            <div className="text-xs text-gray-500">Your Rank</div>
          </div>
          <div className="p-2 bg-gray-50 rounded-lg">
            <div className="text-lg font-bold text-gray-900">{percentile.totalParticipants.toLocaleString()}</div>
            <div className="text-xs text-gray-500">Total Users</div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// ============================================
// WEEKLY CHALLENGES COMPONENT
// ============================================

interface WeeklyChallengesProps {
  challenges: Challenge[]
  onJoinChallenge?: (challengeId: string) => void
}

function WeeklyChallenges({ challenges, onJoinChallenge }: WeeklyChallengesProps) {
  const getTimeRemaining = (endDate: string) => {
    const now = new Date()
    const end = new Date(endDate)
    const diff = end.getTime() - now.getTime()
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const days = Math.floor(hours / 24)
    
    if (days > 0) return `${days}d ${hours % 24}h`
    if (hours > 0) return `${hours}h remaining`
    return 'Ending soon!'
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'daily': return { border: 'border-cyan-200', gradient: 'from-cyan-400 to-cyan-600', bg: 'bg-cyan-100', text: 'text-cyan-600' }
      case 'weekly': return { border: 'border-purple-200', gradient: 'from-purple-400 to-purple-600', bg: 'bg-purple-100', text: 'text-purple-600' }
      case 'special': return { border: 'border-amber-200', gradient: 'from-amber-400 to-amber-600', bg: 'bg-amber-100', text: 'text-amber-600' }
      default: return { border: 'border-gray-200', gradient: 'from-gray-400 to-gray-600', bg: 'bg-gray-100', text: 'text-gray-600' }
    }
  }

  return (
    <div className="space-y-4">
      {challenges.map((challenge, index) => {
        const progressPercent = Math.min(100, (challenge.progress / challenge.target) * 100)
        const colors = getTypeColor(challenge.type)
        const isComplete = challenge.completed || progressPercent >= 100
        
        return (
          <motion.div
            key={challenge.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className={cn(
              "border shadow-sm overflow-hidden transition-all duration-200",
              colors.border,
              isComplete && "ring-2 ring-emerald-400 ring-offset-2"
            )}>
              {/* Progress bar at top */}
              <div className={cn("h-1.5 bg-gradient-to-r", colors.gradient)}>
                <motion.div
                  className="h-full bg-white/30"
                  initial={{ width: 0 }}
                  animate={{ width: `${progressPercent}%` }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                />
              </div>
              
              <CardContent className="p-4">
                <div className="flex items-start gap-4">
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    className={cn("p-3 rounded-xl", colors.bg, colors.text)}
                  >
                    {challenge.type === 'daily' ? <Zap className="h-5 w-5" /> : 
                     challenge.type === 'weekly' ? <Swords className="h-5 w-5" /> : 
                     <Trophy className="h-5 w-5" />}
                  </motion.div>
                  
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                        {challenge.title}
                        {isComplete && (
                          <motion.span
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="text-emerald-500"
                          >
                            <Check className="h-4 w-4" />
                          </motion.span>
                        )}
                      </h3>
                      <Badge 
                        variant="outline"
                        className={cn("text-xs", colors.border, colors.text)}
                      >
                        {challenge.type.charAt(0).toUpperCase() + challenge.type.slice(1)}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-500 mb-3">{challenge.description}</p>
                    
                    <div className="flex items-center gap-4 mb-2">
                      <div className="flex-1">
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-gray-500">Progress</span>
                          <span className="font-medium text-gray-700">
                            {challenge.progress}/{challenge.target}
                          </span>
                        </div>
                        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                          <motion.div
                            className={cn("h-full rounded-full bg-gradient-to-r", colors.gradient)}
                            initial={{ width: 0 }}
                            animate={{ width: `${progressPercent}%` }}
                            transition={{ duration: 0.5, delay: index * 0.1 + 0.2 }}
                          />
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <div className="text-lg font-bold text-gray-900">+{challenge.reward}</div>
                        <div className="text-xs text-gray-500">points</div>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        {challenge.participants.toLocaleString()} participating
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {getTimeRemaining(challenge.endsAt)}
                      </span>
                    </div>
                    
                    {challenge.badgeReward && !isComplete && (
                      <div className="mt-3 flex items-center gap-2 px-3 py-2 bg-amber-50 rounded-lg border border-amber-200">
                        <Award className="h-4 w-4 text-amber-600" />
                        <span className="text-xs font-medium text-amber-700">
                          Complete to earn: <span className="font-bold">{SOCIAL_TOKENS.badges[challenge.badgeReward as keyof typeof SOCIAL_TOKENS.badges]?.label || 'Badge'}</span>
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )
      })}
    </div>
  )
}

// ============================================
// FRIEND COMPARISON COMPONENT
// ============================================

interface FriendComparisonViewProps {
  comparisons: FriendComparison[]
}

function FriendComparisonView({ comparisons }: FriendComparisonViewProps) {
  return (
    <div className="space-y-4">
      <Card className="border border-gray-200 shadow-sm">
        <CardHeader className="border-b border-gray-100 pb-4">
          <CardTitle className="text-base font-semibold text-gray-900 flex items-center gap-2">
            <UserPlus className="h-4 w-4 text-blue-600" />
            Compare with Friends
          </CardTitle>
          <p className="text-sm text-gray-500 mt-1">See how you stack up against your friends</p>
        </CardHeader>
        <CardContent className="p-4">
          <div className="space-y-4">
            {comparisons.map((comparison, index) => (
              <motion.div
                key={comparison.friendId}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="p-4 rounded-xl bg-gray-50 border border-gray-100 hover:border-gray-200 transition-colors"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <motion.div
                      whileHover={{ scale: 1.1 }}
                      className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-sm font-bold text-gray-600"
                    >
                      {comparison.friendName.charAt(0)}
                    </motion.div>
                    <div>
                      <div className="font-medium text-gray-900">{comparison.friendName}</div>
                      <div className="text-xs text-gray-500">{comparison.subject}</div>
                    </div>
                  </div>
                  
                  <Badge 
                    variant="outline"
                    className={cn(
                      "font-medium",
                      comparison.comparison === 'ahead' && 'border-emerald-300 text-emerald-600 bg-emerald-50',
                      comparison.comparison === 'behind' && 'border-red-300 text-red-600 bg-red-50',
                      comparison.comparison === 'tied' && 'border-gray-300 text-gray-600 bg-gray-50'
                    )}
                  >
                    {comparison.comparison === 'ahead' && 'You\'re ahead'}
                    {comparison.comparison === 'behind' && 'You\'re behind'}
                    {comparison.comparison === 'tied' && 'Tied'}
                  </Badge>
                </div>
                
                {/* Score Comparison Bar */}
                <div className="relative h-8 rounded-lg overflow-hidden bg-gray-200">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.max(comparison.yourScore, comparison.friendScore)}%` }}
                    transition={{ duration: 0.5 }}
                    className={cn(
                      "absolute top-0 left-0 h-1/2",
                      comparison.comparison === 'ahead' ? "bg-blue-500" : "bg-gray-400"
                    )}
                  />
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(comparison.yourScore, comparison.friendScore)}%` }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                    className={cn(
                      "absolute bottom-0 left-0 h-1/2",
                      comparison.comparison === 'behind' ? "bg-blue-500" : "bg-gray-400"
                    )}
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4 mt-3">
                  <div className="text-center p-2 bg-blue-50 rounded-lg border border-blue-100">
                    <div className="text-xs text-gray-500 mb-1">Your Score</div>
                    <div className="text-xl font-bold text-blue-600">{comparison.yourScore}%</div>
                  </div>
                  <div className="text-center p-2 bg-gray-100 rounded-lg">
                    <div className="text-xs text-gray-500 mb-1">{comparison.friendName}</div>
                    <div className="text-xl font-bold text-gray-700">{comparison.friendScore}%</div>
                  </div>
                </div>
                
                {comparison.comparison !== 'tied' && (
                  <motion.div
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 + 0.3 }}
                    className={cn(
                      "mt-2 text-center text-sm font-medium py-1 rounded-full",
                      comparison.comparison === 'ahead' 
                        ? 'text-emerald-600 bg-emerald-50' 
                        : 'text-red-600 bg-red-50'
                    )}
                  >
                    {comparison.comparison === 'ahead' 
                      ? `🎉 ${Math.abs(comparison.difference).toFixed(1)}% ahead` 
                      : `📈 ${Math.abs(comparison.difference).toFixed(1)}% to catch up`
                    }
                  </motion.div>
                )}
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>
      
      {/* Add Friends CTA */}
      <Card className="bg-gradient-to-br from-blue-600 to-blue-700 text-white border-0 shadow-lg shadow-blue-500/20">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold mb-1">Invite Friends</h3>
              <p className="text-blue-100 text-sm">Challenge your friends and compare scores</p>
            </div>
            <Button className="bg-white text-blue-600 hover:bg-blue-50 shadow-md">
              <Share2 className="h-4 w-4 mr-2" />
              Share Link
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// ============================================
// SQUAD COMPETITIONS COMPONENT
// ============================================

interface SquadCompetitionsProps {
  squads: Squad[]
  onCreateSquad?: () => void
}

function SquadCompetitions({ squads, onCreateSquad }: SquadCompetitionsProps) {
  return (
    <div className="space-y-6">
      <Card className="border border-gray-200 shadow-sm">
        <CardHeader className="border-b border-gray-100 pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-semibold text-gray-900 flex items-center gap-2">
              <Shield className="h-4 w-4 text-purple-600" />
              Squad Competitions
            </CardTitle>
            <Button size="sm" className="bg-purple-600 hover:bg-purple-700" onClick={onCreateSquad}>
              <UserPlus className="h-4 w-4 mr-2" />
              Create Squad
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-4">
          <div className="space-y-4">
            {squads.map((squad, index) => (
              <motion.div
                key={squad.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="p-4 rounded-xl border-2 border-gray-100 hover:border-purple-200 transition-all duration-200"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <RankBadge rank={squad.rank} size="md" />
                    <div>
                      <h3 className="font-semibold text-gray-900">{squad.name}</h3>
                      <div className="text-sm text-gray-500">{squad.members.length} members</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-purple-600">{squad.totalScore.toLocaleString()}</div>
                    <div className="text-xs text-gray-500">total points</div>
                  </div>
                </div>

                {/* Member Contributions */}
                <div className="flex gap-2">
                  {squad.members.map((member) => (
                    <motion.div
                      key={member.id}
                      whileHover={{ scale: 1.05 }}
                      className="flex-1 bg-gray-50 rounded-lg p-3 text-center hover:bg-purple-50 transition-colors"
                    >
                      <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-sm font-bold mx-auto mb-2">
                        {member.name.charAt(0)}
                      </div>
                      <div className="text-xs font-medium text-gray-900 truncate">{member.name}</div>
                      <div className="text-xs text-gray-500">{member.score.toLocaleString()} pts</div>
                      <div className="text-xs text-purple-600 font-semibold mt-1">{member.contribution}%</div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Join Squad CTA */}
      <Card className="bg-gradient-to-br from-purple-600 to-purple-700 text-white border-0 shadow-lg shadow-purple-500/20">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold mb-1">Join a Squad</h3>
              <p className="text-purple-100 text-sm">Team up with friends and compete together</p>
            </div>
            <Button className="bg-white text-purple-600 hover:bg-purple-50 shadow-md">
              Browse Squads
              <ChevronRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// ============================================
// MAIN COMPONENT
// ============================================

export function SocialCompetitionHub() {
  const [activeTab, setActiveTab] = useState('leaderboard')
  const [isLive, setIsLive] = useState(true)
  const [showCelebration, setShowCelebration] = useState(false)
  const [celebrationData, setCelebrationData] = useState<any>(null)
  const [notifications, setNotifications] = useState<Notification[]>([])
  
  // Socket ref for WebSocket connection
  const socketRef = useRef<Socket | null>(null)
  
  // Mock data generator
  const generateMockData = useCallback(() => {
    const names = [
      'Rahul Sharma', 'Priya Patel', 'Amit Kumar', 'Sneha Gupta', 'Vikram Singh',
      'Ananya Roy', 'Karthik Nair', 'Meera Iyer', 'Arjun Reddy', 'Divya Nair',
      'Rohan Verma', 'Kavita Singh', 'Saurabh Jain', 'Nisha Agarwal', 'Manish Yadav'
    ]
    const badgeOptions = ['speedster', 'perfectionist', 'streaker', 'genius', 'champion', 'warrior']

    const lb: LeaderboardEntry[] = names.slice(0, 15).map((name, index) => ({
      rank: index + 1,
      previousRank: Math.max(1, index + 1 + Math.floor(Math.random() * 3) - 1),
      userId: index === 5 ? 'current' : `user-${index}`,
      userName: index === 5 ? 'You' : name,
      score: Math.round(2500 - index * 80 + Math.random() * 50),
      accuracy: Math.round(95 - index * 2 + Math.random() * 3),
      timeSpent: Math.round(45 + Math.random() * 15),
      streak: Math.round(Math.random() * 20),
      isCurrentUser: index === 5,
      isFriend: Math.random() > 0.7,
      badges: Math.random() > 0.5 ? [badgeOptions[Math.floor(Math.random() * badgeOptions.length)]] : []
    }))

    const sq: Squad[] = [
      {
        id: 's1',
        name: 'Physics Phenoms',
        members: [
          { id: 'm1', name: 'Rahul S.', score: 850, contribution: 35 },
          { id: 'm2', name: 'Priya M.', score: 780, contribution: 32 },
          { id: 'current', name: 'You', score: 820, contribution: 33 },
        ],
        totalScore: 2450,
        rank: 1,
        badge: 'champion'
      },
      {
        id: 's2',
        name: 'Chemistry Kings',
        members: [
          { id: 'm4', name: 'Amit K.', score: 800, contribution: 34 },
          { id: 'm5', name: 'Sneha G.', score: 750, contribution: 32 },
          { id: 'm6', name: 'Vikram S.', score: 790, contribution: 34 },
        ],
        totalScore: 2340,
        rank: 2,
        badge: 'genius'
      },
      {
        id: 's3',
        name: 'Math Mavericks',
        members: [
          { id: 'm7', name: 'Ananya R.', score: 720, contribution: 31 },
          { id: 'm8', name: 'Karthik N.', score: 680, contribution: 29 },
          { id: 'm9', name: 'Meera I.', score: 710, contribution: 40 },
        ],
        totalScore: 2110,
        rank: 3,
        badge: 'speedster'
      },
    ]

    const ch: Challenge[] = [
      {
        id: 'c1',
        title: 'Daily Sprint',
        description: 'Complete 20 questions today',
        type: 'daily',
        category: 'Practice',
        reward: 50,
        progress: 14,
        target: 20,
        endsAt: new Date(Date.now() + 8 * 60 * 60 * 1000).toISOString(),
        participants: 2450,
        completed: false,
        badgeReward: 'speedster'
      },
      {
        id: 'c2',
        title: 'Physics Master',
        description: 'Score 90%+ in 3 Physics tests',
        type: 'weekly',
        category: 'Physics',
        reward: 200,
        progress: 2,
        target: 3,
        endsAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
        participants: 890,
        completed: false,
      },
      {
        id: 'c3',
        title: 'Streak Champion',
        description: 'Maintain a 7-day streak',
        type: 'weekly',
        category: 'Consistency',
        reward: 150,
        progress: 5,
        target: 7,
        endsAt: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
        participants: 1200,
        completed: false,
        badgeReward: 'streaker'
      },
      {
        id: 'c4',
        title: 'Weekend Warrior',
        description: 'Complete the weekend marathon',
        type: 'special',
        category: 'Event',
        reward: 500,
        progress: 35,
        target: 50,
        endsAt: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(),
        participants: 4500,
        completed: false,
      },
      {
        id: 'c5',
        title: 'Perfect Scorer',
        description: 'Get 100% in any test',
        type: 'special',
        category: 'Achievement',
        reward: 300,
        progress: 4,
        target: 5,
        endsAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        participants: 3500,
        completed: false,
        badgeReward: 'champion'
      },
    ]

    const fc: FriendComparison[] = [
      { friendId: 'f1', friendName: 'Ananya Roy', yourScore: 87, friendScore: 86.5, difference: 0.5, subject: 'Physics', comparison: 'ahead' },
      { friendId: 'f2', friendName: 'Meera Iyer', yourScore: 78, friendScore: 84.2, difference: -6.2, subject: 'Chemistry', comparison: 'behind' },
      { friendId: 'f3', friendName: 'Karthik Nair', yourScore: 92, friendScore: 85, difference: 7, subject: 'Mathematics', comparison: 'ahead' },
    ]

    return { leaderboard: lb, squads: sq, challenges: ch, friendComparisons: fc }
  }, [])

  // Initialize data with useMemo
  const initialData = useMemo(() => generateMockData(), [generateMockData])

  // Data states - initialized with mock data
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>(initialData.leaderboard)
  const [squads, setSquads] = useState<Squad[]>(initialData.squads)
  const [challenges, setChallenges] = useState<Challenge[]>(initialData.challenges)
  const [streak, setStreak] = useState<StreakData>({
    currentStreak: 7,
    longestStreak: 15,
    lastActivityDate: null,
    weeklyActivity: [
      { day: 'Mon', completed: true },
      { day: 'Tue', completed: true },
      { day: 'Wed', completed: true },
      { day: 'Thu', completed: true },
      { day: 'Fri', completed: true },
      { day: 'Sat', completed: true },
      { day: 'Sun', completed: false },
    ]
  })
  const [percentile, setPercentile] = useState<PercentileData>({
    percentile: 87,
    rank: 1250,
    totalParticipants: 10000,
    topPercentage: 13,
    comparison: { aboveYou: 1249, belowYou: 8750 }
  })
  const [friendComparisons, setFriendComparisons] = useState<FriendComparison[]>(initialData.friendComparisons)

  // WebSocket connection
  useEffect(() => {
    if (!isLive) return

    const newSocket = io('/?XTransformPort=3004', {
      transports: ['websocket'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000
    })

    newSocket.on('connect', () => {
      console.log('Connected to social leaderboard service')
      newSocket.emit('authenticate', { userId: 'current' })
    })

    newSocket.on('leaderboard-init', (data: { entries: LeaderboardEntry[] }) => {
      setLeaderboard(data.entries)
    })

    newSocket.on('leaderboard-update', (update: { data: { entries?: LeaderboardEntry[] } }) => {
      if (update.data.entries) {
        setLeaderboard(update.data.entries)
      }
    })

    newSocket.on('leaderboard-live-tick', (tick: { data: LiveTick }) => {
      setLeaderboard(prev => {
        const updated = prev.map(entry => {
          if (entry.userId === tick.data.updatedUserId) {
            return {
              ...entry,
              score: tick.data.newScore,
              rank: tick.data.rank,
              previousRank: tick.data.previousRank
            }
          }
          return entry
        })
        // Re-sort if needed
        return updated.sort((a, b) => b.score - a.score)
      })
    })

    newSocket.on('notification', (notification: Notification) => {
      setNotifications(prev => [notification, ...prev])
      
      // Show celebration for certain notifications
      if (notification.type === 'rank_up' || notification.type === 'badge_earned') {
        setCelebrationData({
          type: notification.type,
          data: {
            title: notification.title,
            message: notification.message,
            badge: notification.data.badge
          }
        })
        setShowCelebration(true)
      }
    })

    newSocket.on('disconnect', () => {
      console.log('Disconnected from social leaderboard service')
    })

    // Store socket in ref to avoid synchronous setState
    socketRef.current = newSocket

    return () => {
      newSocket.disconnect()
    }
  }, [isLive])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <motion.h2 
            className="text-xl font-bold text-gray-900 flex items-center gap-2"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="p-2 rounded-lg bg-gradient-to-br from-amber-500 to-orange-600 shadow-lg shadow-amber-500/20">
              <Trophy className="h-5 w-5 text-white" />
            </div>
            Social & Competitions
          </motion.h2>
          <motion.p 
            className="text-gray-500 text-sm mt-1 ml-12"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            Compete with friends and climb the ranks
          </motion.p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200">
            <span className={cn(
              "w-2 h-2 rounded-full",
              isLive ? "bg-emerald-500 animate-pulse" : "bg-gray-400"
            )} />
            <span className="text-sm font-medium text-emerald-700">
              {isLive ? 'Live' : 'Offline'}
            </span>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsLive(!isLive)}
            className="border-gray-200"
          >
            <RefreshCw className={cn("h-4 w-4 mr-2", isLive && "animate-spin")} />
            {isLive ? 'Stop' : 'Start'} Updates
          </Button>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StreakCard streak={streak} />
        <PercentileCard percentile={percentile} />
        <Card className="border border-gray-200 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Trophy className="h-5 w-5 text-amber-500" />
              <span className="text-sm font-medium text-gray-600">Global Rank</span>
            </div>
            <div className="flex items-end gap-2">
              <span className="text-4xl font-bold text-gray-900">#{leaderboard.find(e => e.isCurrentUser)?.rank || 6}</span>
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="flex items-center text-emerald-600 text-sm mb-1"
              >
                <TrendingUp className="h-3 w-3 mr-1" />
                {1}
              </motion.div>
            </div>
          </CardContent>
        </Card>
        <Card className="border border-gray-200 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Shield className="h-5 w-5 text-purple-500" />
              <span className="text-sm font-medium text-gray-600">Your Squad</span>
            </div>
            <div className="flex items-center gap-2">
              <RankBadge rank={squads[0]?.rank || 1} size="sm" />
              <span className="font-semibold text-gray-900 truncate">{squads[0]?.name || 'No Squad'}</span>
            </div>
            <div className="text-xs text-gray-500 mt-1">
              {squads[0]?.totalScore.toLocaleString() || 0} points
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-white border border-gray-200 p-1 h-auto flex-wrap">
          <TabsTrigger value="leaderboard" className="text-sm px-4 py-2 data-[state=active]:bg-amber-500 data-[state=active]:text-white">
            <Trophy className="h-4 w-4 mr-2" />
            Leaderboard
          </TabsTrigger>
          <TabsTrigger value="squads" className="text-sm px-4 py-2 data-[state=active]:bg-amber-500 data-[state=active]:text-white">
            <Users className="h-4 w-4 mr-2" />
            Squads
          </TabsTrigger>
          <TabsTrigger value="challenges" className="text-sm px-4 py-2 data-[state=active]:bg-amber-500 data-[state=active]:text-white">
            <Target className="h-4 w-4 mr-2" />
            Challenges
          </TabsTrigger>
          <TabsTrigger value="friends" className="text-sm px-4 py-2 data-[state=active]:bg-amber-500 data-[state=active]:text-white">
            <UserPlus className="h-4 w-4 mr-2" />
            Friends
          </TabsTrigger>
        </TabsList>

        <TabsContent value="leaderboard" className="mt-6">
          <AnimatedLeaderboard 
            entries={leaderboard} 
            onUserClick={(userId) => console.log('User clicked:', userId)}
            liveUpdates={isLive}
          />
        </TabsContent>

        <TabsContent value="squads" className="mt-6">
          <SquadCompetitions 
            squads={squads}
            onCreateSquad={() => console.log('Create squad')}
          />
        </TabsContent>

        <TabsContent value="challenges" className="mt-6">
          <WeeklyChallenges 
            challenges={challenges}
            onJoinChallenge={(id) => console.log('Join challenge:', id)}
          />
        </TabsContent>

        <TabsContent value="friends" className="mt-6">
          <FriendComparisonView comparisons={friendComparisons} />
        </TabsContent>
      </Tabs>

      {/* Celebration Overlay */}
      <AnimatePresence>
        {showCelebration && celebrationData && (
          <CelebrationOverlay
            type={celebrationData.type}
            data={celebrationData.data}
            onClose={() => {
              setShowCelebration(false)
              setCelebrationData(null)
            }}
          />
        )}
      </AnimatePresence>
    </div>
  )
}

// ============================================
// EXPORTS
// ============================================

export { RankBadge, AnimatedLeaderboard, StreakCard, PercentileCard, WeeklyChallenges, FriendComparisonView, SquadCompetitions, CelebrationOverlay }
export type { LeaderboardEntry, Squad, Challenge, StreakData, PercentileData, FriendComparison }
