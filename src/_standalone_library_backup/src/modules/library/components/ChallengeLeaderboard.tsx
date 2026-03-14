'use client'

import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  Trophy,
  Medal,
  Crown,
  Flame,
  Target,
  Users,
  Clock,
  TrendingUp,
  Sparkles,
  ChevronRight,
  Star,
  Zap,
  Award,
  Gift,
  Calendar,
  BarChart3,
} from 'lucide-react'
import { cn } from '@/lib/utils'

// Types
export interface LeaderboardEntry {
  rank: number
  userId: string
  name: string
  avatar?: string
  hours: number
  xp: number
  streak: number
  badges: number
  isCurrentUser?: boolean
  trend: 'up' | 'down' | 'same'
  trendValue?: number
}

export interface Challenge {
  id: string
  title: string
  description: string
  type: 'reading' | 'quizzes' | 'streak' | 'xp' | 'badges'
  target: number
  unit: string
  startDate: string
  endDate: string
  participants: number
  reward: string
  progress: number // 0-100
  current?: number
  status: 'active' | 'completed' | 'upcoming'
  daysLeft?: number
  icon: React.ElementType
}

export interface UserBadgeShowcase {
  id: string
  name: string
  icon: string
  rarity: string
  unlockedAt: string
}

export interface ChallengeLeaderboardProps {
  leaderboard?: LeaderboardEntry[]
  challenges?: Challenge[]
  userBadges?: UserBadgeShowcase[]
  currentUserRank?: number
  onChallengeJoin?: (challengeId: string) => void
  onChallengeView?: (challengeId: string) => void
  className?: string
}

// Rank colors and icons
const rankStyles: Record<number, { bg: string; border: string; icon?: React.ElementType }> = {
  1: { bg: 'bg-gradient-to-r from-amber-400 to-yellow-500', border: 'border-amber-300', icon: Crown },
  2: { bg: 'bg-gradient-to-r from-gray-300 to-gray-400', border: 'border-gray-300', icon: Medal },
  3: { bg: 'bg-gradient-to-r from-orange-400 to-amber-600', border: 'border-orange-300', icon: Medal },
}

// Leaderboard Entry Component
function LeaderboardEntryCard({ entry, index }: { entry: LeaderboardEntry; index: number }) {
  const rankStyle = rankStyles[entry.rank]
  const RankIcon = rankStyle?.icon
  
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05 }}
      className={cn(
        'flex items-center gap-3 p-3 rounded-xl transition-all',
        entry.isCurrentUser 
          ? 'bg-violet-50 border-2 border-violet-200' 
          : 'bg-white hover:bg-gray-50 border border-gray-100'
      )}
    >
      {/* Rank */}
      <div className={cn(
        'w-10 h-10 rounded-lg flex items-center justify-center font-bold text-lg flex-shrink-0',
        rankStyle?.bg || 'bg-gray-100',
        entry.rank <= 3 ? 'text-white shadow-lg' : 'text-gray-600'
      )}>
        {RankIcon ? <RankIcon className="h-5 w-5" /> : entry.rank}
      </div>
      
      {/* Avatar & Name */}
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <Avatar className="h-10 w-10 border-2 border-white shadow-sm">
          <AvatarImage src={entry.avatar} />
          <AvatarFallback className="bg-gradient-to-br from-violet-500 to-purple-500 text-white text-sm">
            {entry.name.split(' ').map(n => n[0]).join('')}
          </AvatarFallback>
        </Avatar>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-medium text-gray-900 truncate">{entry.name}</span>
            {entry.isCurrentUser && (
              <Badge className="bg-violet-100 text-violet-700 border-0 text-xs">You</Badge>
            )}
          </div>
          <div className="flex items-center gap-3 text-xs text-gray-500">
            <span className="flex items-center gap-1">
              <Flame className="h-3 w-3 text-orange-500" />
              {entry.streak}d
            </span>
            <span className="flex items-center gap-1">
              <Award className="h-3 w-3 text-amber-500" />
              {entry.badges}
            </span>
          </div>
        </div>
      </div>
      
      {/* Stats */}
      <div className="text-right">
        <div className="font-bold text-gray-900">{entry.hours.toFixed(1)}h</div>
        <div className="flex items-center justify-end gap-1 text-xs">
          <Zap className="h-3 w-3 text-amber-500" />
          {entry.xp.toLocaleString()} XP
        </div>
      </div>
      
      {/* Trend */}
      {entry.trend !== 'same' && (
        <div className={cn(
          'flex items-center gap-0.5 text-xs font-medium',
          entry.trend === 'up' ? 'text-green-600' : 'text-red-500'
        )}>
          <TrendingUp className={cn('h-3 w-3', entry.trend === 'down' && 'rotate-180')} />
          {entry.trendValue}
        </div>
      )}
    </motion.div>
  )
}

// Challenge Card Component
function ChallengeCard({ 
  challenge, 
  onJoin,
  onView,
}: { 
  challenge: Challenge
  onJoin?: () => void
  onView?: () => void
}) {
  const Icon = challenge.icon
  const isActive = challenge.status === 'active'
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      className="h-full"
    >
      <Card className={cn(
        'p-4 rounded-2xl border-2 h-full flex flex-col transition-all',
        isActive ? 'border-violet-200 bg-gradient-to-br from-violet-50 to-purple-50' :
        challenge.status === 'completed' ? 'border-green-200 bg-green-50/50' :
        'border-gray-100 bg-white'
      )}>
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className={cn(
            'w-12 h-12 rounded-xl flex items-center justify-center',
            isActive ? 'bg-gradient-to-br from-violet-500 to-purple-500' : 'bg-gray-100'
          )}>
            <Icon className={cn('h-6 w-6', isActive ? 'text-white' : 'text-gray-500')} />
          </div>
          
          <div className="flex flex-col items-end gap-1">
            <Badge className={cn(
              'border-0',
              isActive ? 'bg-green-100 text-green-700' :
              challenge.status === 'completed' ? 'bg-blue-100 text-blue-700' :
              'bg-gray-100 text-gray-600'
            )}>
              {isActive ? `${challenge.daysLeft}d left` : challenge.status}
            </Badge>
            <span className="text-xs text-gray-500">{challenge.participants} joined</span>
          </div>
        </div>
        
        {/* Title & Description */}
        <div className="mb-3">
          <h4 className="font-semibold text-gray-900">{challenge.title}</h4>
          <p className="text-sm text-gray-500 mt-1">{challenge.description}</p>
        </div>
        
        {/* Progress */}
        {isActive && (
          <div className="mb-3">
            <div className="flex items-center justify-between text-sm mb-1">
              <span className="text-gray-600">Progress</span>
              <span className="font-medium text-violet-700">
                {challenge.current || 0}/{challenge.target} {challenge.unit}
              </span>
            </div>
            <Progress value={challenge.progress} className="h-2" />
          </div>
        )}
        
        {/* Reward */}
        <div className="flex items-center gap-2 p-2 bg-white/60 rounded-lg mb-3">
          <Gift className="h-4 w-4 text-amber-500" />
          <span className="text-sm text-gray-600">{challenge.reward}</span>
        </div>
        
        {/* Actions */}
        <div className="mt-auto">
          {challenge.status === 'upcoming' ? (
            <Button 
              onClick={onJoin}
              className="w-full bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700"
            >
              <Sparkles className="h-4 w-4 mr-2" />
              Join Challenge
            </Button>
          ) : (
            <Button 
              variant="outline" 
              onClick={onView}
              className="w-full border-gray-200 hover:border-violet-300"
            >
              View Details
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          )}
        </div>
      </Card>
    </motion.div>
  )
}

// Badge Showcase Component
function BadgeShowcase({ badges }: { badges: UserBadgeShowcase[] }) {
  return (
    <Card className="p-4 border-gray-100 rounded-2xl">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-gray-900 flex items-center gap-2">
          <Award className="h-5 w-5 text-amber-500" />
          Badge Showcase
        </h3>
        <Badge variant="secondary" className="bg-violet-100 text-violet-700 border-0">
          {badges.length} earned
        </Badge>
      </div>
      
      <div className="flex flex-wrap gap-2">
        {badges.map((badge, index) => (
          <motion.div
            key={badge.id}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.05 }}
            whileHover={{ scale: 1.1, rotate: 5 }}
            className="relative group"
          >
            <div className={cn(
              'w-12 h-12 rounded-xl flex items-center justify-center',
              badge.rarity === 'legendary' ? 'bg-gradient-to-br from-amber-400 to-orange-500' :
              badge.rarity === 'epic' ? 'bg-gradient-to-br from-purple-400 to-violet-500' :
              badge.rarity === 'rare' ? 'bg-gradient-to-br from-blue-400 to-cyan-500' :
              'bg-gradient-to-br from-green-400 to-emerald-500',
              'shadow-lg cursor-pointer'
            )}>
              <Trophy className="h-6 w-6 text-white" />
            </div>
            
            {/* Tooltip */}
            <div className="absolute -top-10 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-gray-900 text-white text-xs px-2 py-1 rounded whitespace-nowrap z-10">
              {badge.name}
            </div>
          </motion.div>
        ))}
      </div>
    </Card>
  )
}

// Generate demo data
function generateLeaderboard(): LeaderboardEntry[] {
  const names = ['Alex Chen', 'Sarah Kim', 'Rahul Kumar', 'Emma Wilson', 'David Park', 'You', 'Maria Garcia', 'James Lee', 'Priya Sharma', 'John Smith']
  
  return names.map((name, index) => ({
    rank: index + 1,
    userId: `user-${index}`,
    name,
    avatar: index < 5 ? `https://api.dicebear.com/7.x/avataaars/svg?seed=${name}` : undefined,
    hours: Math.max(0, 45 - index * 3 + Math.random() * 5),
    xp: Math.max(0, 5000 - index * 400 + Math.floor(Math.random() * 200)),
    streak: Math.max(1, 20 - index),
    badges: Math.max(1, 15 - index),
    isCurrentUser: name === 'You',
    trend: index < 3 ? 'up' : index > 7 ? 'down' : 'same',
    trendValue: Math.floor(Math.random() * 3) + 1,
  })).sort((a, b) => b.hours - a.hours).map((entry, i) => ({ ...entry, rank: i + 1 }))
}

function generateChallenges(): Challenge[] {
  return [
    {
      id: '1',
      title: 'Reading Marathon',
      description: 'Read for 10 hours this week to earn bonus XP!',
      type: 'reading',
      target: 10,
      unit: 'hours',
      startDate: 'Jan 20',
      endDate: 'Jan 26',
      participants: 1247,
      reward: '500 XP + Reading Master Badge',
      progress: 65,
      current: 6.5,
      status: 'active',
      daysLeft: 3,
      icon: BarChart3,
    },
    {
      id: '2',
      title: 'Quiz Champion',
      description: 'Complete 20 quizzes with 80%+ accuracy',
      type: 'quizzes',
      target: 20,
      unit: 'quizzes',
      startDate: 'Jan 18',
      endDate: 'Jan 25',
      participants: 856,
      reward: '750 XP + Quiz Master Badge',
      progress: 40,
      current: 8,
      status: 'active',
      daysLeft: 2,
      icon: Target,
    },
    {
      id: '3',
      title: '30-Day Streak Challenge',
      description: 'Maintain a learning streak for 30 consecutive days',
      type: 'streak',
      target: 30,
      unit: 'days',
      startDate: 'Jan 1',
      endDate: 'Jan 30',
      participants: 2341,
      reward: '2000 XP + Streak Legend Badge',
      progress: 0,
      status: 'upcoming',
      icon: Flame,
    },
  ]
}

function generateUserBadges(): UserBadgeShowcase[] {
  return [
    { id: '1', name: 'Bookworm', icon: 'book', rarity: 'common', unlockedAt: '2 days ago' },
    { id: '2', name: 'Quiz Champion', icon: 'target', rarity: 'rare', unlockedAt: '1 week ago' },
    { id: '3', name: 'Early Bird', icon: 'sun', rarity: 'epic', unlockedAt: '3 days ago' },
    { id: '4', name: 'Speed Reader', icon: 'zap', rarity: 'uncommon', unlockedAt: '5 days ago' },
    { id: '5', name: 'Knowledge Seeker', icon: 'brain', rarity: 'legendary', unlockedAt: 'Yesterday' },
  ]
}

export function ChallengeLeaderboard({
  leaderboard: providedLeaderboard,
  challenges: providedChallenges,
  userBadges: providedBadges,
  currentUserRank = 6,
  onChallengeJoin,
  onChallengeView,
  className,
}: ChallengeLeaderboardProps) {
  const [activeTab, setActiveTab] = useState<'leaderboard' | 'challenges'>('leaderboard')
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'all'>('week')
  
  const leaderboard = providedLeaderboard || generateLeaderboard()
  const challenges = providedChallenges || generateChallenges()
  const userBadges = providedBadges || generateUserBadges()
  
  const userEntry = leaderboard.find(e => e.isCurrentUser)
  const activeChallenges = challenges.filter(c => c.status === 'active')
  
  return (
    <div className={cn('space-y-6', className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center">
            <Trophy className="h-5 w-5 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Challenges & Leaderboard</h2>
            <p className="text-sm text-gray-500">Compete and earn rewards</p>
          </div>
        </div>
        
        {/* Tab Switcher */}
        <div className="flex items-center gap-1 p-1 bg-gray-100 rounded-lg">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setActiveTab('leaderboard')}
            className={cn(
              'h-8 px-3 rounded-md',
              activeTab === 'leaderboard' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500'
            )}
          >
            <Users className="h-4 w-4 mr-1.5" />
            Leaderboard
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setActiveTab('challenges')}
            className={cn(
              'h-8 px-3 rounded-md',
              activeTab === 'challenges' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500'
            )}
          >
            <Target className="h-4 w-4 mr-1.5" />
            Challenges
          </Button>
        </div>
      </div>
      
      {/* User Stats Banner */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Card className="p-4 bg-gradient-to-r from-violet-500 to-purple-600 text-white border-0 rounded-2xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="relative">
                <Avatar className="h-14 w-14 border-2 border-white/30">
                  <AvatarFallback className="bg-white/20 text-white text-lg">
                    YO
                  </AvatarFallback>
                </Avatar>
                <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-white flex items-center justify-center shadow-lg">
                  <span className="text-xs font-bold text-violet-600">#{currentUserRank}</span>
                </div>
              </div>
              
              <div>
                <div className="font-semibold text-lg">Your Position</div>
                <div className="flex items-center gap-4 text-violet-100 text-sm">
                  <span className="flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5" />
                    {userEntry?.hours.toFixed(1)}h this week
                  </span>
                  <span className="flex items-center gap-1">
                    <Zap className="h-3.5 w-3.5" />
                    {userEntry?.xp.toLocaleString()} XP
                  </span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="text-right">
                <div className="text-2xl font-bold">{userEntry?.streak}</div>
                <div className="text-violet-100 text-xs">Day Streak</div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold">{userEntry?.badges}</div>
                <div className="text-violet-100 text-xs">Badges</div>
              </div>
            </div>
          </div>
        </Card>
      </motion.div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2">
          <AnimatePresence mode="wait">
            {activeTab === 'leaderboard' ? (
              <motion.div
                key="leaderboard"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                {/* Time Range Filter */}
                <div className="flex items-center gap-2 mb-4">
                  {(['week', 'month', 'all'] as const).map((range) => (
                    <Button
                      key={range}
                      variant={timeRange === range ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setTimeRange(range)}
                      className={cn(
                        'rounded-lg capitalize',
                        timeRange === range && 'bg-violet-100 text-violet-700 hover:bg-violet-100 border-violet-200'
                      )}
                    >
                      This {range === 'all' ? 'All Time' : range}
                    </Button>
                  ))}
                </div>
                
                {/* Leaderboard */}
                <Card className="border-gray-100 rounded-2xl overflow-hidden">
                  <ScrollArea className="h-[500px]">
                    <div className="p-4 space-y-2">
                      {leaderboard.map((entry, index) => (
                        <LeaderboardEntryCard key={entry.userId} entry={entry} index={index} />
                      ))}
                    </div>
                  </ScrollArea>
                </Card>
              </motion.div>
            ) : (
              <motion.div
                key="challenges"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="grid grid-cols-1 md:grid-cols-2 gap-4"
              >
                {challenges.map((challenge) => (
                  <ChallengeCard
                    key={challenge.id}
                    challenge={challenge}
                    onJoin={() => onChallengeJoin?.(challenge.id)}
                    onView={() => onChallengeView?.(challenge.id)}
                  />
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        
        {/* Sidebar */}
        <div className="space-y-4">
          {/* Badge Showcase */}
          <BadgeShowcase badges={userBadges} />
          
          {/* Active Challenges Summary */}
          <Card className="p-4 border-gray-100 rounded-2xl">
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <Flame className="h-5 w-5 text-orange-500" />
              Active Challenges
            </h3>
            
            <div className="space-y-3">
              {activeChallenges.map((challenge) => (
                <div key={challenge.id} className="p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-sm text-gray-900">{challenge.title}</span>
                    <Badge className="bg-violet-100 text-violet-700 border-0 text-xs">
                      {challenge.daysLeft}d
                    </Badge>
                  </div>
                  <Progress value={challenge.progress} className="h-1.5" />
                  <div className="text-xs text-gray-500 mt-1">
                    {challenge.current}/{challenge.target} {challenge.unit}
                  </div>
                </div>
              ))}
            </div>
          </Card>
          
          {/* Top Earners This Week */}
          <Card className="p-4 border-gray-100 rounded-2xl">
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <Star className="h-5 w-5 text-amber-500" />
              Top XP Earners
            </h3>
            
            <div className="space-y-2">
              {leaderboard.slice(0, 5).map((entry, index) => (
                <div key={entry.userId} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-gray-100 flex items-center justify-center text-xs font-medium text-gray-600">
                      {index + 1}
                    </span>
                    <span className="text-sm text-gray-700">{entry.name}</span>
                  </div>
                  <span className="text-sm font-medium text-amber-600">+{entry.xp} XP</span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default ChallengeLeaderboard
