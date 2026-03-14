'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Flame } from 'lucide-react';

type StreakCounterProps = {
    streak: number;
    isActiveToday: boolean;
    size?: 'sm' | 'md' | 'lg';
};

const sizes = {
    sm: { icon: 16, text: 'text-sm' },
    md: { icon: 20, text: 'text-base' },
    lg: { icon: 28, text: 'text-2xl' }
};

export default function StreakCounter({ streak, isActiveToday, size = 'md' }: StreakCounterProps) {
    const s = sizes[size];

    // If not active today, we pulse the flame to remind them
    const pulseAnimation = !isActiveToday && streak > 0 ? {
        scale: [1, 1.1, 1],
        opacity: [0.7, 1, 0.7],
        transition: { repeat: Infinity, duration: 2 }
    } : {};

    return (
        <div className={`inline-flex items-center gap-1.5 font-bold ${isActiveToday ? 'text-orange-500' : 'text-gray-400 dark:text-gray-500'}`}>
            <motion.div animate={pulseAnimation} className="relative">
                <Flame
                    size={s.icon}
                    className={isActiveToday ? 'fill-orange-500 drop-shadow-[0_0_8px_rgba(249,115,22,0.5)]' : ''}
                />
                {isActiveToday && (
                    <motion.div
                        className="absolute inset-0 bg-orange-500 rounded-full blur-md -z-10"
                        animate={{ opacity: [0.2, 0.5, 0.2] }}
                        transition={{ repeat: Infinity, duration: 1.5 }}
                    />
                )}
            </motion.div>
            <span className={s.text}>{streak}</span>
        </div>
    );
}
