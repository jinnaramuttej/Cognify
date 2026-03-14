'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Shield, Medal, Award, Crown, Zap } from 'lucide-react';

export type RankTier = 'bronze' | 'silver' | 'gold' | 'diamond' | 'grandmaster';

type RankBadgeProps = {
    tier: RankTier;
    size?: 'sm' | 'md' | 'lg';
    showLabel?: boolean;
};

const tierStyles = {
    bronze: {
        bg: 'bg-gradient-to-br from-[#cd7f32]/20 to-[#a0522d]/20',
        border: 'border-[#cd7f32]/50',
        text: 'text-[#cd7f32] dark:text-[#f4a460]',
        glow: 'shadow-[#cd7f32]/20',
        icon: Shield,
        label: 'Bronze'
    },
    silver: {
        bg: 'bg-gradient-to-br from-gray-300/20 to-gray-500/20',
        border: 'border-gray-400/50',
        text: 'text-gray-600 dark:text-gray-300',
        glow: 'shadow-gray-400/20',
        icon: Medal,
        label: 'Silver'
    },
    gold: {
        bg: 'bg-gradient-to-br from-yellow-300/20 to-yellow-600/20',
        border: 'border-yellow-500/50',
        text: 'text-yellow-600 dark:text-yellow-400',
        glow: 'shadow-yellow-500/30',
        icon: Award,
        label: 'Gold'
    },
    diamond: {
        bg: 'bg-gradient-to-br from-cyan-300/20 to-blue-600/20',
        border: 'border-cyan-400/50',
        text: 'text-cyan-600 dark:text-cyan-400',
        glow: 'shadow-cyan-400/40',
        icon: Zap,
        label: 'Diamond'
    },
    grandmaster: {
        bg: 'bg-gradient-to-br from-purple-400/20 via-pink-500/20 to-red-500/20',
        border: 'border-purple-500/50',
        text: 'text-purple-600 dark:text-purple-400',
        glow: 'shadow-purple-500/50',
        icon: Crown,
        label: 'Grandmaster'
    }
};

const sizeClasses = {
    sm: 'w-8 h-8 rounded-lg outline-2',
    md: 'w-12 h-12 rounded-xl border-2',
    lg: 'w-16 h-16 rounded-2xl border-2'
};

const iconSizes = {
    sm: 14,
    md: 20,
    lg: 28
};

export default function RankBadge({ tier, size = 'md', showLabel = false }: RankBadgeProps) {
    const t = tierStyles[tier];
    const Icon = t.icon;

    return (
        <div className="inline-flex flex-col items-center gap-2 group cursor-default">
            <motion.div
                whileHover={{ scale: 1.1, rotate: tier === 'grandmaster' ? [0, -5, 5, -5, 0] : 0 }}
                className={`
          flex items-center justify-center 
          ${t.bg} ${t.border} ${t.text} ${sizeClasses[size]} 
          backdrop-blur-sm transition-all duration-300 shadow-lg ${t.glow}
        `}
            >
                <Icon size={iconSizes[size]} weight="bold" />
            </motion.div>
            {showLabel && (
                <span className={`text-xs font-bold uppercase tracking-wider ${t.text}`}>
                    {t.label}
                </span>
            )}
        </div>
    );
}
