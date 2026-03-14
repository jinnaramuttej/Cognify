'use client';

import { Trophy, Medal, Crown, Star } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';

export default function LeaderboardPage() {
  const { user } = useAuth();
  const [topUsers, setTopUsers] = useState<any[]>([]);
  const [userRank, setUserRank] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchLeaderboard() {
      if (!user) return;

      setLoading(true);

      // Fetch top 50 users ranked by XP
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, avatar_url, total_xp, streak')
        .gte('total_xp', 0)
        .order('total_xp', { ascending: false })
        .limit(50);

      if (!error && data) {
        setTopUsers(data);
        const rank = data.findIndex(u => u.id === user.id);
        if (rank !== -1) setUserRank(rank + 1);
      }
      setLoading(false);
    }

    fetchLeaderboard();
  }, [user]);

  if (loading) return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-center">
      <div className="w-12 h-12 border-4 border-[var(--primary)] border-t-transparent rounded-full animate-spin mb-4" />
      <p className="text-[var(--muted-foreground)]">Fetching global rankings...</p>
    </div>
  );


  return (
    <main className="min-h-screen bg-[var(--background)] px-4 py-8 pb-32 max-w-2xl mx-auto">
      <header className="mb-8">
        <h1 className="text-2xl font-bold flex items-center gap-3 text-[var(--foreground)]">
          <Trophy className="text-blue-500" size={28} />
          Global Leaderboard
        </h1>
        <p className="text-sm text-[var(--muted-foreground)] mt-1">Top learners based on study reputation</p>
      </header>

      {/* Your Rank Sticky (Mobile Special) */}
      {userRank && (
        <Card className="mb-8 bg-blue-500/10 border-blue-500/30 sticky top-20 z-10 backdrop-blur-md">
          <CardContent className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold">
                #{userRank}
              </div>
              <div>
                <p className="text-xs font-medium text-blue-600 dark:text-blue-400">YOUR CURRENT RANK</p>
                <p className="font-bold text-[var(--foreground)]">{user?.full_name}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-lg font-bold text-blue-600 dark:text-blue-400">{user?.total_xp?.toLocaleString()} Rep</p>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="space-y-3">
        {topUsers.map((u, i) => (
          <div
            key={u.id}
            className={`flex items-center gap-4 p-4 rounded-2xl border transition-all ${u.id === user?.id
              ? 'bg-[var(--primary)]/10 border-[var(--primary)]/40 scale-[1.02]'
              : 'bg-[var(--card)] border-[var(--border)]'
              }`}
          >
            {/* Rank Indicator */}
            <div className="w-8 flex justify-center shrink-0">
              {i === 0 ? <Crown size={24} className="text-blue-500" /> :
                i === 1 ? <Medal size={24} className="text-blue-400/70" /> :
                  i === 2 ? <Medal size={24} className="text-blue-300/70" /> :
                    <span className="font-bold text-[var(--muted-foreground)]">#{(i + 1)}</span>}
            </div>

            {/* Avatar */}
            <Avatar className="w-12 h-12 border-2 border-[var(--border)]">
              <AvatarImage src={u.avatar_url} />
              <AvatarFallback className="font-bold">{u.full_name?.[0]}</AvatarFallback>
            </Avatar>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <p className="font-bold text-[var(--foreground)] truncate pr-2">{u.full_name}</p>
                <p className="font-bold text-blue-600 dark:text-blue-400 shrink-0">{u.total_xp?.toLocaleString()}</p>
              </div>
              <div className="flex items-center justify-between mt-0.5">
                <p className="text-[10px] uppercase tracking-wider text-[var(--muted-foreground)]">Study Legend</p>
                <div className="flex items-center gap-1 text-[10px] font-bold text-blue-500">
                  <Star size={10} fill="currentColor" />
                  🔥 {u.streak}d
                </div>
              </div>
            </div>
          </div>
        ))}

        {topUsers.length === 0 && (
          <div className="text-center py-20 bg-[var(--card)] rounded-3xl border border-dashed border-[var(--border)]">
            <Star size={48} className="mx-auto text-[var(--muted-foreground)]/30 mb-4" />
            <h3 className="text-xl font-medium">No qualifiers yet</h3>
            <p className="text-[var(--muted-foreground)] text-sm px-8">Be the first to claim the top spot by starting your learning journey!</p>
          </div>
        )}
      </div>
    </main>
  );
}
