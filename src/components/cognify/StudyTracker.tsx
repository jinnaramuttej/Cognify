'use client';

import { useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabaseClient';

// Codes we can silently ignore — table missing, RLS denied, or permission error
const SILENT_CODES = new Set(['PGRST205', '42P01', '42501', 'PGRST301']);

export default function StudyTracker() {
    const { user, isAuthenticated } = useAuth();
    const startTimeRef = useRef<number>(Date.now());
    const lastSyncRef = useRef<number>(Date.now());
    const networkDisabledRef = useRef<boolean>(false);

    useEffect(() => {
        if (!isAuthenticated || !user) return;

        // Reset start time on mount/auth
        startTimeRef.current = Date.now();
        lastSyncRef.current = Date.now();

        const syncStudyTime = async (durationSeconds: number) => {
            if (durationSeconds < 10) return; // Don't sync tiny increments
            if (networkDisabledRef.current) return;

            try {
                // 1. Log the study session
                const { error: sessionError } = await supabase
                    .from('study_sessions')
                    .insert({
                        user_id: user.id,
                        duration: durationSeconds
                    });

                if (sessionError) {
                    if (SILENT_CODES.has(sessionError.code)) {
                        // Table doesn't exist or RLS blocks — not a problem we can fix at runtime
                        return;
                    }
                    throw sessionError;
                }

                // 2. Update total XP and streak in profile
                const xpGained = Math.floor(durationSeconds / 6); // 10 XP per minute
                const today = new Date().toISOString().split('T')[0];

                // Fetch current streak info to handle increment
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('streak, last_study_date, total_xp')
                    .eq('id', user.id)
                    .single();

                if (profile) {
                    let newStreak = profile.streak || 0;
                    const lastDate = profile.last_study_date;

                    if (lastDate !== today) {
                        const yesterday = new Date();
                        yesterday.setDate(yesterday.getDate() - 1);
                        const yesterdayStr = yesterday.toISOString().split('T')[0];

                        if (lastDate === yesterdayStr) {
                            newStreak += 1;
                        } else {
                            newStreak = 1; // Reset streak if missed days (or first time)
                        }
                    }

                    const { error: profileError } = await supabase
                        .from('profiles')
                        .update({
                            total_xp: (profile.total_xp || 0) + xpGained,
                            streak: newStreak,
                            last_study_date: today
                        })
                        .eq('id', user.id);

                    if (profileError && !SILENT_CODES.has(profileError.code)) {
                        throw profileError;
                    }
                }
            } catch (err: any) {
                // Log a human-readable message instead of an empty object
                const msg = err?.message ?? String(err);
                const code = err?.code ?? 'unknown';
                console.warn(`StudyTracker Sync skipped [${code}]: ${msg}`);

                if (msg.toLowerCase().includes('failed to fetch')) {
                    // Stop retrying for the rest of this tab session when network/DNS is down.
                    networkDisabledRef.current = true;
                }
            }
        };

        // Interval syncing (every 5 minutes)
        const interval = setInterval(() => {
            const now = Date.now();
            const elapsed = Math.floor((now - lastSyncRef.current) / 1000);
            syncStudyTime(elapsed);
            lastSyncRef.current = now;
        }, 5 * 60 * 1000);

        // Sync on tab hide/navigate away
        const handleVisibilityChange = () => {
            if (document.visibilityState === 'hidden') {
                const now = Date.now();
                const elapsed = Math.floor((now - lastSyncRef.current) / 1000);
                syncStudyTime(elapsed);
                lastSyncRef.current = now;
            }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);

        return () => {
            clearInterval(interval);
            document.removeEventListener('visibilitychange', handleVisibilityChange);

            // Final sync on unmount
            const now = Date.now();
            const elapsed = Math.floor((now - lastSyncRef.current) / 1000);
            syncStudyTime(elapsed);
        };
    }, [isAuthenticated, user]);

    return null; // Invisible component
}
