'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Trophy, 
  Medal, 
  Crown, 
  Flame, 
  Users, 
  TrendingUp, 
  TrendingDown,
  Minus,
  Zap,
  Target,
  Calendar,
  Clock,
  Star,
  Crown as CrownIcon,
  ChevronRight,
  RefreshCw,
  Share2,
  UserPlus,
  Challenge,
  PartyPopper,
  Sparkles,
  Award,
  BarChart3,
  Timer,
  Swords,
  Shield
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
  reward: number
  progress: number
  target: number
  endsAt: Date
  participants: number
  icon: React.ReactNode
}

interface StreakData {
  currentStreak: number
  longestStreak: number
  lastActivityDate: Date | null
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

// ============================================
// DESIGN TOKENS
// ============================================

const SOCIAL_TOKENS = {
  ranks: {
    1: { color: '#FFD700', bg: 'bg-amber-400', text: 'text-amber-900', label: 'Gold' },
    2: { color: '#C0C0C0', bg: 'bg-gray-300', text: 'text-gray-700', label: 'Silver' },
    3: { color: '#CD7F32', bg: 'bg-orange-400', text: 'text-orange-900', label: 'Bronze' },
    default: { color: '#6B7280', bg: 'bg-gray-100', text: 'text-gray-600', label: '' }
  },
  badges: {
    speedster: { icon: '⚡', label: 'Speed Demon', color: 'text-cyan-500' },
    perfectionist: { icon: '✨', label: 'Perfect Score', color: 'text-purple-500' },
    streaker: { icon: '🔥', label: 'Streak Master', color: 'text-orange-500' },
    genius: { icon: '🧠', label: 'Genius', color: 'text-pink-500' },
    champion: { icon: '👑', label: 'Champion', color: 'text-amber-500' },
    warrior: { icon: '⚔️', label: 'Warrior', color: 'text-red-500' }
  }
}

// ============================================
// MOCK DATA GENERATOR
// ============================================

function generateMockData() {
  const leaderboard: LeaderboardEntry[] = [
    { rank: 1, previousRank: 2, userId: 'u1', userName: 'Rahul Sharma', score: 2450, accuracy: 94.5, timeSpent: 45, streak: 15, badges: ['champion', 'genius'] },
    { rank: 2, previousRank: 1, userId: 'u2', userName: 'Priya Patel', score: 2380, accuracy: 92.3, timeSpent: 48, streak: 12, badges: ['perfectionist'] },
    { rank: 3, previousRank: 3, userId: 'u3', userName: 'Amit Kumar', score: 2290, accuracy: 91.0, timeSpent: 52, streak: 8, badges: ['speedster'] },
    { rank: 4, previousRank: 5, userId: 'u4', userName: 'Sneha Gupta', score: 2180, accuracy: 89.2, timeSpent: 50, streak: 10, badges: ['streaker'] },
    { rank: 5, previousRank: 4, userId: 'u5', userName: 'Vikram Singh', score: 2150, accuracy: 88.5, timeSpent: 55, streak: 5, badges: [] },
    { rank: 6, previousRank: 7, userId: 'current', userName: 'You', score: 2100, accuracy: 87.0, timeSpent: 47, streak: 7, isCurrentUser: true, badges: ['warrior'] },
    { rank: 7, previousRank: 6, userId: 'u6', userName: 'Ananya Roy', score: 2050, accuracy: 86.5, timeSpent: 51, streak: 4, isFriend: true, badges: [] },
    { rank: 8, previousRank: 8, userId: 'u7', userName: 'Karthik Nair', score: 1990, accuracy: 85.0, timeSpent: 58, streak: 3, badges: [] },
    { rank: 9, previousRank: 10, userId: 'u8', userName: 'Meera Iyer', score: 1950, accuracy: 84.2, timeSpent: 53, streak: 6, isFriend: true, badges: [] },
    { rank: 10, previousRank: 9, userId: 'u9', userName: 'Arjun Reddy', score: 1920, accuracy: 83.8, timeSpent: 56, streak: 2, badges: [] },
  ]

  const squads: Squad[] = [
    { id: 's1', name: 'Physics Phenoms', members: [
      { id: 'm1', name: 'Rahul S.', score: 850, contribution: 35 },
      { id: 'm2', name: 'Priya M.', score: 780, contribution: 32 },
      { id: 'm3', name: 'You', score: 820, contribution: 33 },
    ], totalScore: 2450, rank: 1, badge: 'champion' },
    { id: 's2', name: 'Chemistry Kings', members: [
      { id: 'm4', name: 'Amit K.', score: 800, contribution: 34 },
      { id: 'm5', name: 'Sneha G.', score: 750, contribution: 32 },
      { id: 'm6', name: 'Vikram S.', score: 790, contribution: 34 },
    ], totalScore: 2340, rank: 2, badge: 'genius' },
    { id: 's3', name: 'Math Mavericks', members: [
      { id: 'm7', name: 'Ananya R.', score: 720, contribution: 31 },
      { id: 'm8', name: 'Karthik N.', score: 680, contribution: 29 },
      { id: 'm9', name: 'Meera I.', score: 710, contribution: 40 },
    ], totalScore: 2110, rank: 3, badge: 'speedster' },
  ]

  const challenges: Challenge[] = [
    { id: 'c1', title: 'Daily Sprint', description: 'Complete 50 questions today', type: 'daily', reward: 100, progress: 35, target: 50, endsAt: new Date(Date.now() + 8 * 60 * 60 * 1000), participants: 1250, icon: <Zap className="h-4 w-4" /> },
    { id: 'c2', title: 'Weekly Warrior', description: 'Achieve 90% accuracy this week', type: 'weekly', reward: 500, progress: 85, target: 90, endsAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), participants: 890, icon: <Swords className="h-4 w-4" /> },
    { id: 'c3', title: 'Streak Master', description: 'Maintain a 7-day streak', type: 'weekly', reward: 300, progress: 5, target: 7, endsAt: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), participants: 2100, icon: <Flame className="h-4 w-4" /> },
    { id: 'c4', title: 'JEE Main Special', description: 'Complete 5 JEE mock tests', type: 'special', reward: 1000, progress: 3, target: 5, endsAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), participants: 3500, icon: <Trophy className="h-4 w-4" /> },
  ]

  const streak: StreakData = {
    currentStreak: 7,
    longestStreak: 15,
    lastActivityDate: new Date(),
    weeklyActivity: [
      { day: 'Mon', completed: true },
      { day: 'Tue', completed: true },
      { day: 'Wed', completed: true },
      { day: 'Thu', completed: true },
      { day: 'Fri', completed: true },
      { day: 'Sat', completed: true },
      { day: 'Sun', completed: false },
    ]
  }

  const percentile: PercentileData = {
    percentile: 87,
    rank: 1250,
    totalParticipants: 10000,
    topPercentage: 13,
    comparison: {
      aboveYou: 1249,
      belowYou: 8750
    }
  }

  const friendComparisons: FriendComparison[] = [
    { friendId: 'f1', friendName: 'Ananya Roy', yourScore: 87, friendScore: 86.5, difference: 0.5, subject: 'Physics', comparison: 'ahead' },
    { friendId: 'f2', friendName: 'Meera Iyer', yourScore: 78, friendScore: 84.2, difference: -6.2, subject: 'Chemistry', comparison: 'behind' },
    { friendId: 'f3', friendName: 'Karthik Nair', yourScore: 92, friendScore: 85, difference: 7, subject: 'Mathematics', comparison: 'ahead' },
  ]

  return { leaderboard, squads, challenges, streak, percentile, friendComparisons }
}

// ============================================
// MAIN COMPONENT
// ============================================

export function SocialCompetitionHub() {
  const [activeTab, setActiveTab] = useState('leaderboard')
  const [isLive, setIsLive] = useState(true)
  const [showCelebration, setShowCelebration] = useState(false)
  const data = useMemo(() => generateMockData(), [])

  // Simulate live updates
  useEffect(() => {
    if (!isLive) return
    
    const interval = setInterval(() => {
      // In real implementation, would fetch from API
      console.log('Live update tick')
    }, 30000)

    return () => clearInterval(interval)
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
        <StreakCard streak={data.streak} />
        <PercentileCard percentile={data.percentile} />
        <RankCard rank={6} previousRank={7} />
        <SquadCard squad={data.squads[0]} isMember />
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
          <LiveLeaderboard 
            entries={data.leaderboard} 
            onUserClick={(userId) => console.log('User clicked:', userId)}
          />
        </TabsContent>

        <TabsContent value="squads" className="mt-6">
          <SquadCompetitions squads={data.squads} />
        </TabsContent>

        <TabsContent value="challenges" className="mt-6">
          <WeeklyChallenges challenges={data.challenges} />
        </TabsContent>

        <TabsContent value="friends" className="mt-6">
          <FriendComparisonView comparisons={data.friendComparisons} />
        </TabsContent>
      </Tabs>

      {/* Celebration Overlay */}
      <AnimatePresence>
        {showCelebration && (
          <CelebrationOverlay onClose={() => setShowCelebration(false)} />
        )}
      </AnimatePresence>
    </div>
  )
}

// ============================================
// LIVE LEADERBOARD
// ============================================

interface LiveLeaderboardProps {
  entries: LeaderboardEntry[]
  onUserClick?: (userId: string) => void
}

function LiveLeaderboard({ entries, onUserClick }: LiveLeaderboardProps) {
  // Detect rank changes using useMemo - compute which entries changed position
  const animatingRanks = useMemo(() => {
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

  return (
    <Card className="border border-gray-200 shadow-sm overflow-hidden">
      <CardHeader className="border-b border-gray-100 bg-gradient-to-r from-amber-50 to-white pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold text-gray-900 flex items-center gap-2">
            <Trophy className="h-4 w-4 text-amber-600" />
            Live Leaderboard
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="border-amber-200 text-amber-700">
              <Clock className="h-3 w-3 mr-1" />
              Updates every 30s
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="divide-y divide-gray-100">
          {entries.map((entry, index) => {
            const rankChange = getRankChange(entry)
            const isAnimating = animatingRanks.has(entry.userId)
            const rankToken = entry.rank <= 3 ? SOCIAL_TOKENS.ranks[entry.rank as 1|2|3] : SOCIAL_TOKENS.ranks.default

            return (
              <motion.div
                key={entry.userId}
                initial={{ opacity: 0, x: -20 }}
                animate={{ 
                  opacity: 1, 
                  x: 0,
                  backgroundColor: isAnimating 
                    ? entry.rank < entry.previousRank 
                      ? 'rgba(16, 185, 129, 0.1)' 
                      : 'rgba(239, 68, 68, 0.1)'
                    : 'transparent'
                }}
                transition={{ delay: index * 0.03, duration: 0.3 }}
                onClick={() => onUserClick?.(entry.userId)}
                className={cn(
                  "flex items-center gap-4 p-4 transition-colors cursor-pointer hover:bg-gray-50",
                  entry.isCurrentUser && "bg-blue-50/50"
                )}
              >
                {/* Rank */}
                <div className="w-12 flex flex-col items-center">
                  <RankBadge rank={entry.rank} size="md" />
                  <RankChangeIndicator change={rankChange} isAnimating={isAnimating} />
                </div>

                {/* User Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <div className={cn(
                      "w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold",
                      entry.isCurrentUser ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-600"
                    )}>
                      {entry.userName.charAt(0)}
                    </div>
                    <div>
                      <div className="font-medium text-gray-900 flex items-center gap-2">
                        {entry.userName}
                        {entry.isCurrentUser && (
                          <Badge className="bg-blue-100 text-blue-700 border-0 text-xs">You</Badge>
                        )}
                        {entry.isFriend && (
                          <Badge variant="outline" className="border-purple-200 text-purple-600 text-xs">
                            Friend
                          </Badge>
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
                    <div className="flex gap-1 mt-1">
                      {entry.badges.map(badge => {
                        const badgeToken = SOCIAL_TOKENS.badges[badge as keyof typeof SOCIAL_TOKENS.badges]
                        return (
                          <span key={badge} className="text-sm" title={badgeToken?.label}>
                            {badgeToken?.icon}
                          </span>
                        )
                      })}
                    </div>
                  )}
                </div>

                {/* Score */}
                <div className="text-right">
                  <div className="text-xl font-bold text-gray-900">
                    <AnimatedCounter value={entry.score} />
                  </div>
                  <div className="text-xs text-gray-500">points</div>
                </div>

                {/* Streak */}
                <div className="w-16 text-center">
                  <div className="flex items-center justify-center gap-1">
                    <Flame className="h-4 w-4 text-orange-500" />
                    <span className="font-semibold text-gray-900">{entry.streak}</span>
                  </div>
                  <div className="text-xs text-gray-500">streak</div>
                </div>
              </motion.div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}

// ============================================
// RANK BADGE
// ============================================

interface RankBadgeProps {
  rank: number
  size?: 'sm' | 'md' | 'lg'
  showLabel?: boolean
}

export function RankBadge({ rank, size = 'md', showLabel = false }: RankBadgeProps) {
  const sizeClasses = {
    sm: 'w-6 h-6 text-xs',
    md: 'w-8 h-8 text-sm',
    lg: 'w-12 h-12 text-lg'
  }

  if (rank <= 3) {
    const icons = { 1: <Crown className="h-full w-full p-1" />, 2: <Medal className="h-full w-full p-1" />, 3: <Medal className="h-full w-full p-1" /> }
    const colors = { 
      1: 'bg-gradient-to-br from-amber-400 to-amber-600 text-white shadow-lg shadow-amber-500/30', 
      2: 'bg-gradient-to-br from-gray-300 to-gray-400 text-white shadow-lg shadow-gray-400/30', 
      3: 'bg-gradient-to-br from-orange-400 to-orange-600 text-white shadow-lg shadow-orange-500/30' 
    }
    
    return (
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        className={cn(
          "rounded-full flex items-center justify-center",
          sizeClasses[size],
          colors[rank as 1|2|3]
        )}
        whileHover={{ scale: 1.1 }}
      >
        {icons[rank as 1|2|3]}
      </motion.div>
    )
  }

  return (
    <div className={cn(
      "rounded-full bg-gray-100 flex items-center justify-center font-bold text-gray-600",
      sizeClasses[size]
    )}>
      {rank}
    </div>
  )
}

// ============================================
// RANK CHANGE INDICATOR
// ============================================

interface RankChangeIndicatorProps {
  change: { direction: string; amount: number }
  isAnimating: boolean
}

function RankChangeIndicator({ change, isAnimating }: RankChangeIndicatorProps) {
  if (change.amount === 0) {
    return <Minus className="h-3 w-3 text-gray-400 mt-1" />
  }

  return (
    <motion.div
      initial={{ scale: 0 }}
      animate={{ scale: isAnimating ? [1, 1.3, 1] : 1 }}
      transition={{ duration: 0.3 }}
      className={cn(
        "flex items-center gap-0.5 mt-1 text-xs font-medium",
        change.direction === 'up' ? 'text-emerald-600' : 'text-red-600'
      )}
    >
      {change.direction === 'up' ? (
        <TrendingUp className="h-3 w-3" />
      ) : (
        <TrendingDown className="h-3 w-3" />
      )}
      {change.amount}
    </motion.div>
  )
}

// ============================================
// SQUAD COMPETITIONS
// ============================================

interface SquadCompetitionsProps {
  squads: Squad[]
}

function SquadCompetitions({ squads }: SquadCompetitionsProps) {
  return (
    <div className="space-y-6">
      {/* Squad Rankings */}
      <Card className="border border-gray-200 shadow-sm">
        <CardHeader className="border-b border-gray-100 pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-semibold text-gray-900 flex items-center gap-2">
              <Shield className="h-4 w-4 text-purple-600" />
              Squad Rankings
            </CardTitle>
            <Button size="sm" className="bg-purple-600 hover:bg-purple-700">
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
                className="p-4 rounded-xl border-2 border-gray-100 hover:border-purple-200 transition-colors"
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
                    <div className="text-2xl font-bold text-purple-600">{squad.totalScore}</div>
                    <div className="text-xs text-gray-500">total points</div>
                  </div>
                </div>

                {/* Member Contributions */}
                <div className="flex gap-2">
                  {squad.members.map((member) => (
                    <div
                      key={member.id}
                      className="flex-1 bg-gray-50 rounded-lg p-2 text-center"
                    >
                      <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-sm font-bold mx-auto mb-1">
                        {member.name.charAt(0)}
                      </div>
                      <div className="text-xs font-medium text-gray-900 truncate">{member.name}</div>
                      <div className="text-xs text-gray-500">{member.score} pts</div>
                      <div className="text-xs text-purple-600">{member.contribution}%</div>
                    </div>
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
            <Button className="bg-white text-purple-600 hover:bg-purple-50">
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
// WEEKLY CHALLENGES
// ============================================

interface WeeklyChallengesProps {
  challenges: Challenge[]
}

function WeeklyChallenges({ challenges }: WeeklyChallengesProps) {
  const getTimeRemaining = (endDate: Date) => {
    const now = new Date()
    const diff = endDate.getTime() - now.getTime()
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const days = Math.floor(hours / 24)
    
    if (days > 0) return `${days}d ${hours % 24}h`
    return `${hours}h remaining`
  }

  return (
    <div className="space-y-4">
      {challenges.map((challenge, index) => {
        const progressPercent = (challenge.progress / challenge.target) * 100
        
        return (
          <motion.div
            key={challenge.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className={cn(
              "border shadow-sm overflow-hidden",
              challenge.type === 'daily' && "border-cyan-200",
              challenge.type === 'weekly' && "border-purple-200",
              challenge.type === 'special' && "border-amber-200"
            )}>
              <div className={cn(
                "h-1",
                challenge.type === 'daily' && "bg-gradient-to-r from-cyan-400 to-cyan-600",
                challenge.type === 'weekly' && "bg-gradient-to-r from-purple-400 to-purple-600",
                challenge.type === 'special' && "bg-gradient-to-r from-amber-400 to-amber-600"
              )} />
              <CardContent className="p-4">
                <div className="flex items-start gap-4">
                  <div className={cn(
                    "p-3 rounded-xl",
                    challenge.type === 'daily' && "bg-cyan-100 text-cyan-600",
                    challenge.type === 'weekly' && "bg-purple-100 text-purple-600",
                    challenge.type === 'special' && "bg-amber-100 text-amber-600"
                  )}>
                    {challenge.icon}
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="font-semibold text-gray-900">{challenge.title}</h3>
                      <Badge variant="outline" className="text-xs">
                        {challenge.type === 'daily' ? 'Daily' : challenge.type === 'weekly' ? 'Weekly' : 'Special'}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-500 mb-3">{challenge.description}</p>
                    
                    <div className="flex items-center gap-4 mb-2">
                      <div className="flex-1">
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-gray-500">Progress</span>
                          <span className="font-medium">{challenge.progress}/{challenge.target}</span>
                        </div>
                        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                          <motion.div
                            className={cn(
                              "h-full rounded-full",
                              challenge.type === 'daily' && "bg-cyan-500",
                              challenge.type === 'weekly' && "bg-purple-500",
                              challenge.type === 'special' && "bg-amber-500"
                            )}
                            initial={{ width: 0 }}
                            animate={{ width: `${progressPercent}%` }}
                            transition={{ duration: 0.5, delay: index * 0.1 }}
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
// FRIEND COMPARISON
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
          <CardDescription>See how you stack up against your friends</CardDescription>
        </CardHeader>
        <CardContent className="p-4">
          <div className="space-y-4">
            {comparisons.map((comparison, index) => (
              <motion.div
                key={comparison.friendId}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="p-4 rounded-xl bg-gray-50 border border-gray-100"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-sm font-bold">
                      {comparison.friendName.charAt(0)}
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">{comparison.friendName}</div>
                      <div className="text-xs text-gray-500">{comparison.subject}</div>
                    </div>
                  </div>
                  
                  <Badge 
                    variant="outline"
                    className={cn(
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
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-2 bg-blue-50 rounded-lg">
                    <div className="text-xs text-gray-500 mb-1">Your Score</div>
                    <div className="text-xl font-bold text-blue-600">{comparison.yourScore}%</div>
                  </div>
                  <div className="text-center p-2 bg-gray-100 rounded-lg">
                    <div className="text-xs text-gray-500 mb-1">{comparison.friendName}</div>
                    <div className="text-xl font-bold text-gray-700">{comparison.friendScore}%</div>
                  </div>
                </div>
                
                {comparison.comparison !== 'tied' && (
                  <div className={cn(
                    "mt-2 text-center text-sm font-medium",
                    comparison.comparison === 'ahead' ? 'text-emerald-600' : 'text-red-600'
                  )}>
                    {comparison.comparison === 'ahead' 
                      ? `${Math.abs(comparison.difference).toFixed(1)}% ahead` 
                      : `${Math.abs(comparison.difference).toFixed(1)}% behind`
                    }
                  </div>
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
            <Button className="bg-white text-blue-600 hover:bg-blue-50">
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
// STATS CARDS
// ============================================

interface StreakCardProps {
  streak: StreakData
}

function StreakCard({ streak }: StreakCardProps) {
  return (
    <Card className="border border-gray-200 shadow-sm">
      <CardContent className="p-4">
        <div className="flex items-center gap-2 mb-2">
          <Flame className="h-4 w-4 text-orange-500" />
          <span className="text-xs text-gray-500">Current Streak</span>
        </div>
        <div className="flex items-end gap-1">
          <span className="text-3xl font-bold text-gray-900">{streak.currentStreak}</span>
          <span className="text-sm text-gray-500 mb-1">days</span>
        </div>
        
        {/* Weekly Activity */}
        <div className="flex gap-1 mt-3">
          {streak.weeklyActivity.map((day, i) => (
            <div
              key={i}
              className={cn(
                "flex-1 h-2 rounded-full",
                day.completed ? "bg-orange-500" : "bg-gray-200"
              )}
              title={day.day}
            />
          ))}
        </div>
        <div className="flex justify-between text-xs text-gray-400 mt-1">
          {streak.weeklyActivity.map(day => (
            <span key={day.day} className="flex-1 text-center">{day.day.charAt(0)}</span>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

interface PercentileCardProps {
  percentile: PercentileData
}

function PercentileCard({ percentile }: PercentileCardProps) {
  return (
    <Card className="border border-gray-200 shadow-sm">
      <CardContent className="p-4">
        <div className="flex items-center gap-2 mb-2">
          <BarChart3 className="h-4 w-4 text-purple-500" />
          <span className="text-xs text-gray-500">Percentile</span>
        </div>
        <div className="flex items-end gap-1">
          <span className="text-3xl font-bold text-gray-900">{percentile.percentile}</span>
          <span className="text-sm text-gray-500 mb-1">th</span>
        </div>
        <div className="text-xs text-purple-600 mt-1">
          Top {percentile.topPercentage}%
        </div>
      </CardContent>
    </Card>
  )
}

interface RankCardProps {
  rank: number
  previousRank: number
}

function RankCard({ rank, previousRank }: RankCardProps) {
  const improved = rank < previousRank
  
  return (
    <Card className="border border-gray-200 shadow-sm">
      <CardContent className="p-4">
        <div className="flex items-center gap-2 mb-2">
          <Trophy className="h-4 w-4 text-amber-500" />
          <span className="text-xs text-gray-500">Global Rank</span>
        </div>
        <div className="flex items-end gap-2">
          <span className="text-3xl font-bold text-gray-900">#{rank}</span>
          {improved && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="flex items-center text-emerald-600 text-sm mb-1"
            >
              <TrendingUp className="h-3 w-3 mr-1" />
              {previousRank - rank}
            </motion.div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

interface SquadCardProps {
  squad: Squad
  isMember?: boolean
}

function SquadCard({ squad, isMember }: SquadCardProps) {
  return (
    <Card className="border border-gray-200 shadow-sm">
      <CardContent className="p-4">
        <div className="flex items-center gap-2 mb-2">
          <Shield className="h-4 w-4 text-purple-500" />
          <span className="text-xs text-gray-500">{isMember ? 'Your Squad' : 'Squad'}</span>
        </div>
        <div className="flex items-center gap-2">
          <RankBadge rank={squad.rank} size="sm" />
          <span className="font-semibold text-gray-900 truncate">{squad.name}</span>
        </div>
        <div className="text-xs text-gray-500 mt-1">
          {squad.totalScore.toLocaleString()} points
        </div>
      </CardContent>
    </Card>
  )
}

// ============================================
// CELEBRATION OVERLAY
// ============================================

interface CelebrationOverlayProps {
  onClose: () => void
}

function CelebrationOverlay({ onClose }: CelebrationOverlayProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.5, opacity: 0 }}
        onClick={e => e.stopPropagation()}
        className="bg-white rounded-2xl p-8 text-center max-w-sm mx-4 shadow-2xl"
      >
        <motion.div
          animate={{ rotate: [0, 15, -15, 0] }}
          transition={{ duration: 0.5, repeat: 2 }}
          className="text-6xl mb-4"
        >
          🎉
        </motion.div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Congratulations!</h2>
        <p className="text-gray-500 mb-6">You've moved up in the leaderboard!</p>
        <Button onClick={onClose} className="bg-amber-500 hover:bg-amber-600">
          <Sparkles className="h-4 w-4 mr-2" />
          Keep Going!
        </Button>
      </motion.div>
    </motion.div>
  )
}

// ============================================
// EXPORTS
// ============================================

export { RankBadge }
export type { LeaderboardEntry, Squad, Challenge, StreakData, PercentileData, FriendComparison }
