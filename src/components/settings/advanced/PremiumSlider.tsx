'use client';

import React from 'react';

type PremiumSliderProps = {
    value: number;
    min?: number;
    max?: number;
    step?: number;
    onChange: (val: number) => void;
    labelLeft?: string;
    labelRight?: string;
};

export default function PremiumSlider({
    value,
    min = 0,
    max = 100,
    step = 1,
    onChange,
    labelLeft,
    labelRight
}: PremiumSliderProps) {
    const percentage = ((value - min) / (max - min)) * 100;

    return (
        <div className="w-full flex flex-col gap-2">
            <div className="relative h-2 bg-gray-100 dark:bg-white/10 rounded-full w-full outline-none">
                {/* Track Highlight */}
                <div
                    className="absolute top-0 left-0 h-full bg-blue-500 rounded-full"
                    style={{ width: `${percentage}%` }}
                />
                {/* Input Overlap */}
                <input
                    type="range"
                    min={min}
                    max={max}
                    step={step}
                    value={value}
                    onChange={(e) => onChange(Number(e.target.value))}
                    className="absolute top-0 left-0 w-full h-full opacity-0 cursor-pointer"
                />
                {/* Thumb */}
                <div
                    className="absolute top-1/2 -ml-2 -mt-2 w-4 h-4 bg-white border border-gray-300 dark:border-white/20 rounded-full shadow-sm shadow-blue-500/50 pointer-events-none transition-transform group-hover:scale-125"
                    style={{ left: `${percentage}%` }}
                />
            </div>
            <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 font-medium px-1">
                <span>{labelLeft}</span>
                <span>{labelRight}</span>
            </div>
        </div>
    );
}

