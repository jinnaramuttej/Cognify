'use client';

import React from 'react';
import { motion } from 'framer-motion';

type SegmentedControlProps = {
    options: { label: string; value: string; icon?: React.ReactNode }[];
    value: string;
    onChange: (val: string) => void;
    className?: string;
};

export default function SegmentedControl({ options, value, onChange, className = '' }: SegmentedControlProps) {
    return (
        <div className={`relative flex items-center bg-gray-100 dark:bg-gray-800 p-1 rounded-2xl backdrop-blur-md border border-gray-700 ${className}`}>
            {options.map((option) => {
                const isActive = value === option.value;
                return (
                    <button
                        key={option.value}
                        onClick={() => onChange(option.value)}
                        className={`relative flex-1 flex items-center justify-center gap-2 py-3 px-4 text-sm font-medium rounded-xl transition-colors duration-300 z-10 ${isActive ? 'text-blue-600 dark:text-blue-400' : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                            }`}
                    >
                        {isActive && (
                            <motion.div
                                layoutId={`segmented-bg-${options.map(o => o.value).join('-')}`} // unique per group
                                className="absolute inset-0 bg-white dark:bg-gray-900 border border-blue-500/20 shadow-sm rounded-xl -z-10"
                                transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                            />
                        )}
                        {option.icon}
                        {option.label}
                    </button>
                );
            })}
        </div>
    );
}

