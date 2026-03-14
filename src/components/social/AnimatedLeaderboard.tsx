'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, TrendingUp, Minus, TrendingDown, Users } from 'lucide-react';
import RankBadge, { RankTier } from './RankBadge';

type LeaderboardEntry = {
    id: string;
    name: string;
    score: number;
    rank: number;
    previousRank: number;
    avatarUrl?: string;
    tier: RankTier;
    isCurrentUser?: boolean;
};

type AnimatedLeaderboardProps = {
    data: LeaderboardEntry[];
    title?: string;
    subtitle?: string;
    maxDisplay?: number;
};

// Map score to tier for UI Demo purposes (backend usually provides this)
export const scoreToTier = (score: number): RankTier => {
    if (score >= 2000) return 'grandmaster';
    if (score >= 1200) return 'diamond';
    if (score >= 800) return 'gold';
    if (score >= 400) return 'silver';
    return 'bronze';
};

export default function AnimatedLeaderboard({ data, title = "Live Rankings", subtitle, maxDisplay = 10 }: AnimatedLeaderboardProps) {
    const displayData = data.slice(0, maxDisplay);

    return (
        <div className="w-full bg-white dark:bg-[#1a1c23] rounded-3xl p-6 border border-gray-100 dark:border-white/5 shadow-xl shadow-blue-500/5 relative overflow-hidden">
            {/* Background Decor */}
            <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

            <div className="flex items-center justify-between mb-8 relative z-10">
                <div>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        <Trophy className="w-5 h-5 text-yellow-500" />
                        {title}
                    </h2>
                    {subtitle && <p className="text-sm text-gray-500 mt-1">{subtitle}</p>}
                </div>
                <div className="bg-gray-100 dark:bg-white/5 px-3 py-1.5 rounded-lg flex items-center gap-2 text-xs font-medium text-gray-600 dark:text-gray-300">
                    <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                    LIVE
                </div>
            </div>

            <div className="flex text-xs font-semibold text-gray-400 dark:text-gray-500 px-4 pb-2 border-b border-gray-100 dark:border-white/5 uppercase tracking-wider">
                <div className="w-16">Rank</div>
                <div className="flex-1">Student</div>
                <div className="w-20 text-right">Score</div>
            </div>

            <div className="mt-4 relative z-10">
                <AnimatePresence mode="popLayout">
                    {displayData.map((entry) => {
                        const rankDiff = entry.previousRank - entry.rank; // Positive = went up

                        return (
                            <motion.div
                                layout
                                key={entry.id}
                                initial={{ opacity: 0, scale: 0.9, x: -20 }}
                                animate={{ opacity: 1, scale: 1, x: 0 }}
                                exit={{ opacity: 0, scale: 0.9, x: 20 }}
                                transition={{
                                    duration: 0.4,
                                    type: 'spring',
                                    bounce: 0.3
                                }}
                                className={`relative flex items-center px-4 py-3 mb-2 rounded-2xl group transition-colors duration-300 ${entry.isCurrentUser
                                        ? 'bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200 dark:border-blue-500/30'
                                        : 'hover:bg-gray-50 dark:hover:bg-white/5 border border-transparent'
                                    }`}
                            >
                                {/* Current User Marker */}
                                {entry.isCurrentUser && (
                                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-10 bg-blue-500 rounded-r-md" />
                                )}

                                {/* Rank & Trend */}
                                <div className="w-16 flex items-center pr-2">
                                    <div className={`w-8 h-8 flex items-center justify-center font-bold text-lg ${entry.rank === 1 ? 'text-yellow-500 mix-blend-multiply dark:mix-blend-normal' :
                                            entry.rank === 2 ? 'text-gray-400' :
                                                entry.rank === 3 ? 'text-orange-400' :
                                                    'text-gray-500'
                                        }`}>
                                        {entry.rank}
                                    </div>
                                    <div className="w-4 flex justify-center ml-1">
                                        {rankDiff > 0 ? (
                                            <TrendingUp size={12} className="text-green-500" strokeWidth={3} />
                                        ) : rankDiff < 0 ? (
                                            <TrendingDown size={12} className="text-red-500" strokeWidth={3} />
                                        ) : (
                                            <Minus size={12} className="text-gray-300 dark:text-gray-600" />
                                        )}
                                    </div>
                                </div>

                                {/* Profile Info */}
                                <div className="flex-1 flex items-center gap-3 min-w-0">
                                    <div className="hidden sm:block">
                                        <RankBadge tier={entry.tier} size="sm" />
                                    </div>
                                    <div className="truncate">
                                        <p className={`font-bold truncate ${entry.isCurrentUser ? 'text-blue-900 dark:text-blue-100' : 'text-gray-900 dark:text-gray-200'}`}>
                                            {entry.name}
                                            {entry.isCurrentUser && <span className="ml-2 text-xs font-normal text-blue-500 bg-blue-100 dark:bg-blue-500/20 px-2 py-0.5 rounded-full">You</span>}
                                        </p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate hidden sm:block">
                                            Tier: <span className="capitalize">{entry.tier}</span>
                                        </p>
                                    </div>
                                </div>

                                {/* Score */}
                                <div className="w-20 text-right">
                                    <motion.div
                                        key={entry.score}
                                        initial={{ y: -10, opacity: 0 }}
                                        animate={{ y: 0, opacity: 1 }}
                                        className={`font-black tracking-tight ${entry.isCurrentUser ? 'text-blue-600 dark:text-blue-400 text-lg' : 'text-gray-700 dark:text-gray-300'}`}
                                    >
                                        {entry.score.toLocaleString()}
                                    </motion.div>
                                </div>
                            </motion.div>
                        );
                    })}
                </AnimatePresence>
            </div>

            {data.length === 0 && (
                <div className="flex flex-col items-center justify-center py-12 text-center text-gray-500">
                    <Users className="w-12 h-12 mb-3 text-gray-300 dark:text-gray-600" />
                    <p className="font-medium">No challengers yet.</p>
                    <p className="text-xs mt-1">Be the first to set a score!</p>
                </div>
            )}
        </div>
    );
}
