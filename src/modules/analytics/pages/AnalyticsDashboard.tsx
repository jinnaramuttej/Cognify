/**
 * Analytics Module — Analytics Dashboard Page
 *
 * Entry point rendered by a future src/app/analytics/page.tsx,
 * or consumed by the dashboard module.
 */

'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
    TrendingUp,
    Target,
    Clock,
    BarChart3,
    AlertTriangle,
    BookOpen,
} from 'lucide-react';
import { usePerformance } from '../hooks/usePerformance';

export default function AnalyticsDashboard() {
    const { performance, weakTopics, loading } = usePerformance();

    if (loading) {
        return (
            <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent" />
            </div>
        );
    }

    if (!performance) {
        return (
            <div className="text-center py-12 text-muted-foreground">
                <BarChart3 size={48} className="mx-auto mb-3 opacity-40" />
                <p>No performance data yet. Complete some tests first!</p>
            </div>
        );
    }

    const formatTime = (seconds: number) => {
        const hrs = Math.floor(seconds / 3600);
        const mins = Math.floor((seconds % 3600) / 60);
        if (hrs > 0) return `${hrs}h ${mins}m`;
        return `${mins}m`;
    };

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
                    <BarChart3 size={32} className="text-primary" />
                    Analytics
                </h1>
                <p className="text-muted-foreground mt-1">Your learning performance at a glance</p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                    { label: 'Accuracy', value: `${performance.overall_accuracy}%`, icon: Target, color: 'text-green-500' },
                    { label: 'Tests Done', value: performance.tests_completed, icon: TrendingUp, color: 'text-blue-500' },
                    { label: 'Study Time', value: formatTime(performance.total_study_time), icon: Clock, color: 'text-purple-500' },
                    { label: 'Streak', value: `${performance.current_streak} days`, icon: TrendingUp, color: 'text-amber-500' },
                ].map((stat) => (
                    <Card key={stat.label} className="bg-card border">
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

            {/* Weak Topics */}
            {weakTopics.length > 0 && (
                <Card className="bg-card border">
                    <CardHeader>
                        <CardTitle className="text-foreground flex items-center gap-2">
                            <AlertTriangle size={20} className="text-amber-500" />
                            Weak Topics — Focus Here
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {weakTopics.map((topic, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: i * 0.1 }}
                                    className="flex items-center justify-between p-3 rounded-lg bg-muted/30"
                                >
                                    <div className="flex items-center gap-3">
                                        <BookOpen size={16} className="text-muted-foreground" />
                                        <span className="text-foreground font-medium">{topic.topic_name}</span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <Badge variant="destructive">{topic.accuracy}%</Badge>
                                        <span className="text-xs text-muted-foreground">{topic.attempts} attempts</span>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
