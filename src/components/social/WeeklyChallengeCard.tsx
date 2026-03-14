'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Swords, Timer, ArrowRight, Zap } from 'lucide-react';

type ChallengeConfig = {
    id: string;
    title: string;
    endDate: string; // ISO String
    participantsCount: number;
    isRegistered: boolean;
};

// Simple countdown helper
const useCountdown = (targetDate: string) => {
    const [timeLeft, setTimeLeft] = useState<{ d: number; h: number; m: number; s: number } | null>(null);

    useEffect(() => {
        const target = new Date(targetDate).getTime();
        const interval = setInterval(() => {
            const now = new Date().getTime();
            const difference = target - now;

            if (difference <= 0) {
                clearInterval(interval);
                setTimeLeft({ d: 0, h: 0, m: 0, s: 0 });
            } else {
                setTimeLeft({
                    d: Math.floor(difference / (1000 * 60 * 60 * 24)),
                    h: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
                    m: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
                    s: Math.floor((difference % (1000 * 60)) / 1000),
                });
            }
        }, 1000);

        return () => clearInterval(interval);
    }, [targetDate]);

    return timeLeft;
};

export default function WeeklyChallengeCard({ challenge }: { challenge?: ChallengeConfig }) {
    // Using some mock data if no challenge is passed (for demonstration)
    const data = challenge || {
        id: 'mock-1',
        title: 'The Calculus Crucible',
        endDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 3).toISOString(), // 3 days from now
        participantsCount: 1420,
        isRegistered: false
    };

    const time = useCountdown(data.endDate);

    return (
        <div className="relative overflow-hidden bg-gradient-to-br from-[#1a1c23] to-[#2d1b2e] dark:from-black dark:to-[#1a0f1b] rounded-3xl p-6 sm:p-8 border border-white/10 shadow-2xl">
            {/* Glow Effects */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-fuchsia-500/20 rounded-full blur-[80px] -mr-20 -mt-20 pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-blue-500/20 rounded-full blur-[60px] -ml-10 -mb-10 pointer-events-none" />

            <div className="relative z-10 flex flex-col sm:flex-row justify-between gap-6 sm:items-center">

                {/* Info Side */}
                <div className="space-y-4">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/5 backdrop-blur-md">
                        <Zap size={14} className="text-yellow-400 fill-yellow-400" />
                        <span className="text-xs font-bold text-white uppercase tracking-wider">Weekly Global Challenge</span>
                    </div>

                    <div>
                        <h2 className="text-2xl sm:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400">
                            {data.title}
                        </h2>
                        <p className="text-gray-400 mt-2 text-sm max-w-sm leading-relaxed">
                            Compete globally against {data.participantsCount.toLocaleString()}+ students. The highest score in a single 30-minute attempt takes the Grandmaster title.
                        </p>
                    </div>
                </div>

                {/* Action / Countdown Side */}
                <div className="flex flex-col items-start sm:items-end gap-4 min-w-[200px]">
                    {/* Countdown timer */}
                    {time && (
                        <div className="flex gap-2 text-center">
                            {[
                                { label: 'Days', val: time.d },
                                { label: 'Hrs', val: time.h },
                                { label: 'Min', val: time.m },
                                { label: 'Sec', val: time.s }
                            ].map(unit => (
                                <div key={unit.label} className="flex flex-col items-center justify-center bg-white/5 border border-white/10 rounded-xl w-12 h-14 backdrop-blur-sm">
                                    <span className="text-lg font-black text-white leading-none">{unit.val.toString().padStart(2, '0')}</span>
                                    <span className="text-[9px] text-gray-400 uppercase font-bold mt-1 tracking-wider">{unit.label}</span>
                                </div>
                            ))}
                        </div>
                    )}

                    {data.isRegistered ? (
                        <button className="w-full sm:w-auto px-6 py-3 bg-white text-black font-extrabold rounded-xl hover:bg-gray-200 transition-colors flex items-center justify-center gap-2 group">
                            <Swords size={18} />
                            Enter Arena
                            <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
                        </button>
                    ) : (
                        <button className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-fuchsia-600 to-purple-600 text-white font-extrabold rounded-xl hover:from-fuchsia-500 hover:to-purple-500 transition-colors shadow-[0_0_20px_rgba(192,38,211,0.3)] flex items-center justify-center gap-2">
                            <Swords size={18} />
                            Join Challenge
                        </button>
                    )}
                </div>

            </div>
        </div>
    );
}
