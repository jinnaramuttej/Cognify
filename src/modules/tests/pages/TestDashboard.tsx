'use client';

/**
 * TestDashboard — Main page container for the Tests module
 * 
 * This is the entry point rendered by src/app/tests/page.tsx
 * Contains the test listing, creation, and management UI.
 */

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabaseClient';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
    Plus,
    Clock,
    Target,
    TrendingUp,
    BookOpen,
    ChevronRight,
    Zap,
    History,
    BarChart3,
} from 'lucide-react';

interface TestRecord {
    id: string;
    title: string;
    status: 'in_progress' | 'completed' | 'abandoned';
    score: number | null;
    total_questions: number;
    time_spent_seconds: number | null;
    created_at: string;
    config: any;
}

export default function TestDashboard() {
    const router = useRouter();
    const { user } = useAuth();
    const [tests, setTests] = useState<TestRecord[]>([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        totalTests: 0,
        avgScore: 0,
        totalTime: 0,
        bestScore: 0,
    });

    useEffect(() => {
        if (!user) return;
        loadTests();
    }, [user]);

    const loadTests = async () => {
        try {
            const { data, error } = await supabase
                .from('tests')
                .select('*')
                .eq('user_id', user?.id)
                .order('created_at', { ascending: false })
                .limit(20);

            if (data) {
                setTests(data);
                const completed = data.filter(t => t.status === 'completed');
                const scores = completed.map(t => t.score || 0);
                setStats({
                    totalTests: completed.length,
                    avgScore: scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0,
                    totalTime: data.reduce((sum, t) => sum + (t.time_spent_seconds || 0), 0),
                    bestScore: scores.length > 0 ? Math.max(...scores) : 0,
                });
            }
        } catch (err) {
            console.error('Failed to load tests:', err);
        } finally {
            setLoading(false);
        }
    };

    const formatTime = (seconds: number) => {
        const hrs = Math.floor(seconds / 3600);
        const mins = Math.floor((seconds % 3600) / 60);
        if (hrs > 0) return `${hrs}h ${mins}m`;
        return `${mins}m`;
    };

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-foreground">Tests</h1>
                    <p className="text-muted-foreground mt-1">Practice, mock exams, and PYQs</p>
                </div>
                <Button
                    onClick={() => router.push('/tests/create')}
                    className="bg-primary hover:bg-primary/90 gap-2"
                >
                    <Plus size={18} />
                    New Test
                </Button>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                    { label: 'Tests Taken', value: stats.totalTests, icon: Target, color: 'text-blue-500' },
                    { label: 'Avg Score', value: `${stats.avgScore}%`, icon: TrendingUp, color: 'text-green-500' },
                    { label: 'Study Time', value: formatTime(stats.totalTime), icon: Clock, color: 'text-purple-500' },
                    { label: 'Best Score', value: `${stats.bestScore}%`, icon: Zap, color: 'text-amber-500' },
                ].map((stat) => (
                    <Card key={stat.label} className="bg-card border hover-lift">
                        <CardContent className="p-4">
                            <div className="flex items-center gap-3">
                                <div className={`p-2 rounded-lg bg-muted ${stat.color}`}>
                                    <stat.icon size={20} />
                                </div>
                                <div>
                                    <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                                    <p className="text-xs text-muted-foreground">{stat.label}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                    { label: 'Practice Test', desc: 'Custom topic-wise practice', icon: BookOpen, href: '/tests/create' },
                    { label: 'Full Mock', desc: 'Simulate real exam', icon: BarChart3, href: '/tests/create?type=mock' },
                    { label: 'PYQ Practice', desc: 'Previous year questions', icon: History, href: '/tests/create?type=pyq' },
                ].map((action) => (
                    <motion.div
                        key={action.label}
                        whileHover={{ y: -2 }}
                        whileTap={{ scale: 0.98 }}
                    >
                        <Card
                            className="bg-card border cursor-pointer hover:border-primary/50 transition-colors"
                            onClick={() => router.push(action.href)}
                        >
                            <CardContent className="p-5 flex items-center gap-4">
                                <div className="p-3 rounded-xl bg-primary/10">
                                    <action.icon size={24} className="text-primary" />
                                </div>
                                <div className="flex-1">
                                    <h3 className="font-semibold text-foreground">{action.label}</h3>
                                    <p className="text-sm text-muted-foreground">{action.desc}</p>
                                </div>
                                <ChevronRight size={18} className="text-muted-foreground" />
                            </CardContent>
                        </Card>
                    </motion.div>
                ))}
            </div>

            {/* Recent Tests */}
            <Card className="bg-card border">
                <CardHeader>
                    <CardTitle className="text-foreground flex items-center gap-2">
                        <History size={20} />
                        Recent Tests
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="flex justify-center py-8">
                            <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent" />
                        </div>
                    ) : tests.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                            <BookOpen size={48} className="mx-auto mb-3 opacity-40" />
                            <p>No tests taken yet. Start your first practice test!</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {tests.slice(0, 10).map((test) => (
                                <motion.div
                                    key={test.id}
                                    whileHover={{ x: 4 }}
                                    className="flex items-center justify-between p-4 rounded-lg bg-muted/30 hover:bg-muted/50 cursor-pointer transition-colors"
                                    onClick={() => router.push(`/tests/${test.id}`)}
                                >
                                    <div className="flex-1">
                                        <h4 className="font-medium text-foreground">{test.title || 'Practice Test'}</h4>
                                        <p className="text-sm text-muted-foreground">
                                            {test.total_questions} questions • {new Date(test.created_at).toLocaleDateString()}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        {test.score !== null && (
                                            <span className="text-lg font-bold text-foreground">{test.score}%</span>
                                        )}
                                        <Badge variant={test.status === 'completed' ? 'default' : 'secondary'}>
                                            {test.status === 'completed' ? 'Done' : test.status === 'in_progress' ? 'In Progress' : 'Abandoned'}
                                        </Badge>
                                        <ChevronRight size={16} className="text-muted-foreground" />
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
