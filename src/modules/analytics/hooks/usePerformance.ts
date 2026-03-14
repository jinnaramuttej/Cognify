'use client';

/**
 * usePerformance — Hook for loading student performance data
 */

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabaseClient';
import type { PerformanceSnapshot, WeakTopic } from '../types';

export function usePerformance() {
    const { user } = useAuth();
    const [performance, setPerformance] = useState<PerformanceSnapshot | null>(null);
    const [weakTopics, setWeakTopics] = useState<WeakTopic[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) return;
        loadPerformance();
    }, [user]);

    const loadPerformance = async () => {
        try {
            // Fetch completed tests
            const { data: tests } = await supabase
                .from('tests')
                .select('id, score, total_questions, time_spent_seconds, created_at, config')
                .eq('user_id', user?.id)
                .eq('status', 'completed')
                .order('created_at', { ascending: false })
                .limit(50);

            if (!tests || tests.length === 0) {
                setPerformance({
                    overall_accuracy: 0,
                    tests_completed: 0,
                    current_streak: 0,
                    total_study_time: 0,
                    subject_breakdown: [],
                    weekly_trend: [],
                });
                setLoading(false);
                return;
            }

            // Compute stats
            const scores = tests.map(t => t.score || 0);
            const totalTime = tests.reduce((sum, t) => sum + (t.time_spent_seconds || 0), 0);

            // Weekly trend (last 7 tests)
            const weeklyTrend = tests.slice(0, 7).map(t => t.score || 0).reverse();

            setPerformance({
                overall_accuracy: Math.round(scores.reduce((a, b) => a + b, 0) / scores.length),
                tests_completed: tests.length,
                current_streak: 0, // Would come from streaks table
                total_study_time: totalTime,
                subject_breakdown: [],
                weekly_trend: weeklyTrend,
            });

            // Find weak topics from attempt questions
            const testIds = tests.slice(0, 20).map(t => t.id);
            const { data: attempts } = await supabase
                .from('test_attempt_questions')
                .select(`
          is_correct,
          question:questions(topic_id)
        `)
                .in('test_id', testIds);

            if (attempts) {
                const topicStats = new Map<string, { correct: number; total: number }>();
                for (const a of attempts) {
                    const tid = (a.question as any)?.topic_id;
                    if (!tid) continue;
                    const stat = topicStats.get(tid) || { correct: 0, total: 0 };
                    stat.total++;
                    if (a.is_correct) stat.correct++;
                    topicStats.set(tid, stat);
                }

                // Find topics with low accuracy
                const weak: WeakTopic[] = [];
                for (const [topicId, stat] of topicStats) {
                    if (stat.total >= 3 && (stat.correct / stat.total) < 0.5) {
                        weak.push({
                            topic_name: topicId, // Would need topic name lookup
                            chapter_name: '',
                            accuracy: Math.round((stat.correct / stat.total) * 100),
                            attempts: stat.total,
                        });
                    }
                }
                setWeakTopics(weak.slice(0, 5));
            }
        } catch (err) {
            console.error('Failed to load performance:', err);
        } finally {
            setLoading(false);
        }
    };

    return { performance, weakTopics, loading, refresh: loadPerformance };
}
