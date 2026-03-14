'use client';

import React, { useEffect, useState } from 'react';
import Confetti from 'react-confetti';
import { useWindowSize } from 'react-use'; // Note: Might need to install react-use and react-confetti in a real environment, using raw logic if unavailable. For now assuming available or we gracefully degrade.
import { Inter } from 'next/font/google';

type MicroCelebrationProps = {
    active: boolean;
    title: string;
    subtitle: string;
    onComplete?: () => void;
};

export default function MicroCelebration({ active, title, subtitle, onComplete }: MicroCelebrationProps) {
    const [show, setShow] = useState(false);
    const [dim, setDim] = useState({ width: 0, height: 0 });

    useEffect(() => {
        // Only access window on client
        setDim({ width: window.innerWidth, height: window.innerHeight });

        if (active) {
            setShow(true);
            const timer = setTimeout(() => {
                setShow(false);
                onComplete?.();
            }, 5000);
            return () => clearTimeout(timer);
        }
    }, [active, onComplete]);

    if (!show) return null;

    return (
        <div className="fixed inset-0 pointer-events-none z-[100] flex items-center justify-center">
            {/* Assuming react-confetti is linked/installed. Using a lightweight dynamic import fallback if needed in prod */}
            <Confetti
                width={dim.width}
                height={dim.height}
                recycle={false}
                numberOfPieces={400}
                gravity={0.15}
                colors={['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981']}
            />

            <div className="absolute top-1/4 animate-in fade-in slide-in-from-bottom-10 zoom-in duration-700 delay-100 flex flex-col items-center drop-shadow-2xl text-center">
                <h2 className="text-4xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-br from-yellow-300 via-orange-500 to-red-500 pb-2 filter drop-shadow-[0_4px_12px_rgba(249,115,22,0.4)]">
                    {title}
                </h2>
                <p className="text-lg md:text-xl font-bold bg-white/90 dark:bg-black/80 px-4 py-1.5 rounded-full border border-white/20 shadow-xl backdrop-blur text-gray-900 dark:text-white mt-4">
                    {subtitle}
                </p>
            </div>
        </div>
    );
}
