'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabaseClient';
import { Calendar, Clock, TrendingUp, Brain, Info } from 'lucide-react';

export default function AnalyticsTab() {
    const { user } = useAuth();
    const [sessions, setSessions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchStats() {
            if (!user) return;

            const { data, error } = await supabase
                .from('study_sessions')
                .select('*')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false })
                .limit(30);

            if (!error && data) {
                setSessions(data);
            }
            setLoading(false);
        }

        fetchStats();
    }, [user]);

    // Aggregate stats
    const getStats = () => {
        const now = new Date();
        const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

        const last7Days = [...Array(7)].map((_, i) => {
            const d = new Date();
            d.setDate(d.getDate() - i);
            const dayName = d.toLocaleDateString('en-US', { weekday: 'short' });
            const longDayName = d.toLocaleDateString('en-US', { weekday: 'long' });
            const iso = d.toISOString().split('T')[0];
            const secs = sessions
                .filter(s => s.created_at.startsWith(iso))
                .reduce((acc, curr) => acc + (curr.duration || 0), 0);
            return {
                day: dayName[0],
                hours: parseFloat((secs / 3600).toFixed(1)),
                mins: Math.floor(secs / 60),
                fullDay: dayName,
                longDay: longDayName,
                secs
            };
        }).reverse();

        const weeklyTotalSecs = sessions
            .filter(s => new Date(s.created_at) >= startOfWeek)
            .reduce((acc, curr) => acc + (curr.duration || 0), 0);

        const monthlyTotalSecs = sessions
            .filter(s => new Date(s.created_at) >= startOfMonth)
            .reduce((acc, curr) => acc + (curr.duration || 0), 0);

        const lifetimeTotalSecs = sessions.reduce((acc, curr) => acc + (curr.duration || 0), 0);

        return {
            heatmap: last7Days,
            weeklyTotal: formatTime(weeklyTotalSecs),
            monthlyTotal: formatTime(monthlyTotalSecs),
            lifetimeTotal: formatTime(lifetimeTotalSecs)
        };
    };

    const formatTime = (seconds: number) => {
        const hrs = Math.floor(seconds / 3600);
        const mins = Math.floor((seconds % 3600) / 60);
        if (hrs > 0) return `${hrs}h ${mins}m`;
        return `${mins}m`;
    };

    const { heatmap, weeklyTotal, monthlyTotal, lifetimeTotal } = getStats();

    if (loading) return <div>Loading detailed insights...</div>;

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400 bg-blue-500/5 px-4 py-3 rounded-lg border border-blue-500/20">
                <Info size={16} />
                Detailed analytics were moved here to keep your Dashboard distraction-free.
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="bg-card border-border">
                    <CardHeader>
                        <CardTitle className="text-foreground flex items-center gap-2">
                            <Calendar size={20} className="text-primary" />
                            Weekly Study Load
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-end justify-between gap-2 h-40 mb-4">
                            {heatmap.map((day, index) => (
                                <div key={index} className="flex flex-col items-center gap-1 w-full group">
                                    <div className="w-full bg-secondary rounded-sm relative h-32 flex items-end overflow-hidden">
                                        <div
                                            className="w-full bg-blue-500/40 group-hover:bg-blue-600 transition-colors"
                                            style={{ height: `${Math.min(100, (day.hours / 6) * 100)}%` }}
                                        />
                                    </div>
                                    <span className="text-[10px] uppercase font-bold text-muted-foreground">{day.day}</span>
                                </div>
                            ))}
                        </div>
                        <p className="text-xs text-center text-muted-foreground italic">Target: 4-6 hours daily for peak performance</p>
                    </CardContent>
                </Card>

                <Card className="bg-card border-border">
                    <CardHeader>
                        <CardTitle className="text-foreground flex items-center gap-2">
                            <TrendingUp size={20} className="text-blue-500" />
                            Performance Summary
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="p-3 bg-secondary/30 rounded-lg">
                                <span className="text-[10px] uppercase font-bold text-muted-foreground block mb-1">Weekly Total</span>
                                <span className="text-xl font-bold">{weeklyTotal}</span>
                            </div>
                            <div className="p-3 bg-secondary/30 rounded-lg">
                                <span className="text-[10px] uppercase font-bold text-muted-foreground block mb-1">Monthly Total</span>
                                <span className="text-xl font-bold">{monthlyTotal}</span>
                            </div>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-secondary/30 rounded-lg">
                            <span className="text-sm font-medium">Current Streak</span>
                            <span className="font-bold">{user?.streak || 0} Days</span>
                        </div>
                        <div className="p-4 bg-purple-500/10 rounded-lg border border-purple-500/20">
                            <h4 className="text-xs font-bold text-purple-400 uppercase tracking-widest mb-2">Total Reputation</h4>
                            <p className="text-2xl font-bold flex items-center gap-2 text-purple-500">
                                {user?.total_xp || 0}
                                <span className="text-xs text-muted-foreground font-normal">XP</span>
                            </p>
                            <p className="text-[10px] text-muted-foreground mt-1">Lifetime Study Time: {lifetimeTotal}</p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Card className="bg-card border-border">
                <CardHeader>
                    <CardTitle className="text-foreground flex items-center gap-2">
                        <Info size={20} className="text-blue-500" />
                        Day-wise Breakdown
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                        {heatmap.map((d, i) => (
                            <div key={i} className="flex justify-between items-center p-3 bg-secondary/20 rounded-lg border border-border">
                                <span className="text-sm font-medium">{d.longDay}</span>
                                <span className="text-sm font-bold text-blue-600 dark:text-blue-400">{d.hours > 0 ? formatTime(d.secs) : '-'}</span>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            <Card className="bg-card border-border">
                <CardHeader>
                    <CardTitle className="text-foreground flex items-center gap-2">
                        <Clock size={20} className="text-primary" />
                        Recent Sessions
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-3">
                        {sessions.length === 0 ? (
                            <p className="text-center py-6 text-muted-foreground">No sessions recorded yet.</p>
                        ) : (
                            sessions.map((s, i) => (
                                <div key={i} className="flex justify-between items-center p-3 border-b border-border last:border-0">
                                    <div>
                                        <p className="text-sm font-medium">{new Date(s.created_at).toLocaleDateString()}</p>
                                        <p className="text-xs text-muted-foreground">{new Date(s.created_at).toLocaleTimeString()}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-bold">{Math.floor(s.duration / 60)} mins</p>
                                        <p className="text-[10px] text-muted-foreground font-mono">ID: {s.id.slice(0, 8)}</p>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

