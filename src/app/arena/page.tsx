'use client';

/**
 * Arena Page - Competitive Features
 * 
 * Social learning, challenges, and squad competitions
 */

import React, { useEffect, useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import AnimatedLeaderboard, { scoreToTier } from '@/components/social/AnimatedLeaderboard';
import WeeklyChallengeCard from '@/components/social/WeeklyChallengeCard';
import SquadManagement from '@/components/social/SquadManagement';
import StreakCounter from '@/components/social/StreakCounter';
import {
  Trophy,
  Swords,
  Users,
  TrendingUp,
  Zap,
  Target,
  Award,
} from 'lucide-react';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { type: 'spring', stiffness: 300, damping: 24 } },
};

export default function ArenaDashboard() {
  const supabase = createClientComponentClient();
  const [leaderboardData, setLeaderboardData] = useState<any[]>([]);
  const [streak, setStreak] = useState(0);
  const [isActiveToday, setIsActiveToday] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchArenaData = async () => {
      setLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setLoading(false);
        return;
      }
      setUserId(session.user.id);

      // 1. Fetch user streak info
      const { data: streakData } = await supabase
        .from('streaks')
        .select('*')
        .eq('user_id', session.user.id)
        .single();

      if (streakData) {
        setStreak(streakData.current_streak || 0);
        // Check if last_study_date is today
        if (streakData.last_study_date) {
          const lastDate = new Date(streakData.last_study_date).toISOString().split('T')[0];
          const today = new Date().toISOString().split('T')[0];
          setIsActiveToday(lastDate === today);
        }
      }

      // 2. Fetch leaderboard
      await fetchLeaderboard(session.user.id);
      setLoading(false);
    };

    fetchArenaData();
  }, [supabase]);

  const fetchLeaderboard = async (uid: string) => {
    // Fetch top participants from challenges
    const { data: participants } = await supabase
      .from('challenge_participants')
      .select(`
        *,
        profiles:user_id (full_name, avatar_url)
      `)
      .order('highest_score', { ascending: false })
      .limit(10);

    if (participants) {
      const formatted = participants.map((p: any, idx: number) => ({
        rank: idx + 1,
        name: p.profiles?.full_name || 'Anonymous',
        score: p.highest_score || 0,
        avatar: p.profiles?.avatar_url,
        tier: scoreToTier(p.highest_score || 0),
        isCurrentUser: p.user_id === uid,
      }));
      setLeaderboardData(formatted);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-muted-foreground">Loading Arena...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6 space-y-6 pb-32">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="max-w-7xl mx-auto space-y-6"
      >
        {/* Header */}
        <motion.div variants={itemVariants} className="text-center space-y-2">
          <h1 className="text-4xl font-bold text-foreground flex items-center justify-center gap-3">
            <Swords size={36} className="text-primary" />
            Arena
          </h1>
          <p className="text-muted-foreground">
            Compete with peers, join squads, and climb the leaderboard
          </p>
        </motion.div>

        {/* Stats Overview */}
        <motion.div variants={itemVariants} className="grid gap-4 md:grid-cols-3">
          <Card className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 border-blue-500/20">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Trophy size={20} className="text-blue-500" />
                Your Rank
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-blue-500">
                {leaderboardData.find(l => l.isCurrentUser)?.rank || '-'}
              </p>
              <p className="text-sm text-muted-foreground mt-1">Global Position</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-amber-500/10 to-amber-600/5 border-amber-500/20">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Zap size={20} className="text-amber-500" />
                Study Streak
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-amber-500">{streak} Days</p>
              <p className="text-sm text-muted-foreground mt-1">
                {isActiveToday ? '✅ Active Today' : '⚠️ Study to continue'}
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-500/10 to-green-600/5 border-green-500/20">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Target size={20} className="text-green-500" />
                Challenges
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-green-500">0</p>
              <p className="text-sm text-muted-foreground mt-1">Active Challenges</p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Main Content Grid */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Leaderboard */}
          <motion.div variants={itemVariants}>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy size={24} className="text-amber-500" />
                  Global Leaderboard
                </CardTitle>
                <CardDescription>Top performers this week</CardDescription>
              </CardHeader>
              <CardContent>
                {leaderboardData.length > 0 ? (
                  <AnimatedLeaderboard data={leaderboardData} />
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Trophy size={48} className="mx-auto mb-4 opacity-30" />
                    <p>No leaderboard data yet</p>
                    <p className="text-sm mt-2">Complete tests to appear on the leaderboard</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Squad Management */}
          <motion.div variants={itemVariants}>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users size={24} className="text-blue-500" />
                  Your Squad
                </CardTitle>
                <CardDescription>Join or create a study group</CardDescription>
              </CardHeader>
              <CardContent>
                <SquadManagement />
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Weekly Challenge */}
        <motion.div variants={itemVariants}>
          <WeeklyChallengeCard />
        </motion.div>

        {/* Coming Soon Features */}
        <motion.div variants={itemVariants}>
          <Card className="border-dashed">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award size={24} className="text-purple-500" />
                Coming Soon
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                <FeatureCard
                  title="1v1 Battles"
                  description="Challenge your friends to head-to-head tests"
                  icon={<Swords className="text-red-500" />}
                />
                <FeatureCard
                  title="Squad Tournaments"
                  description="Compete as a team against other squads"
                  icon={<Users className="text-blue-500" />}
                />
                <FeatureCard
                  title="Achievement Badges"
                  description="Unlock badges for milestones and challenges"
                  icon={<Award className="text-amber-500" />}
                />
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </div>
  );
}

function FeatureCard({ title, description, icon }: { title: string; description: string; icon: React.ReactNode }) {
  return (
    <div className="p-4 bg-muted/50 rounded-lg space-y-2">
      <div className="flex items-center gap-2">
        {icon}
        <h3 className="font-semibold">{title}</h3>
      </div>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  );
}
