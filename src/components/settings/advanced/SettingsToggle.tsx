'use client';

import React from 'react';
import { motion } from 'framer-motion';

type SettingsToggleProps = {
    checked: boolean;
    onChange: (checked: boolean) => void;
    size?: 'sm' | 'md' | 'lg';
};

export default function SettingsToggle({ checked, onChange, size = 'md' }: SettingsToggleProps) {
    const sizes = {
        sm: { width: 36, height: 20, circle: 16, offset: 16 },
        md: { width: 44, height: 24, circle: 20, offset: 20 },
        lg: { width: 56, height: 32, circle: 28, offset: 24 },
    };

    const { width, height, circle, offset } = sizes[size];

    return (
        <button
            type="button"
            role="switch"
            aria-checked={checked}
            onClick={() => onChange(!checked)}
            style={{ width, height }}
            className={`relative inline-flex items-center rounded-full transition-colors duration-300 ease-in-out cursor-pointer ${checked ? 'bg-blue-600' : 'bg-gray-300 dark:bg-white/10'
                }`}
        >
            <motion.div
                className="bg-white rounded-full shadow-md"
                style={{ width: circle, height: circle }}
                initial={false}
                animate={{
                    x: checked ? offset : 2,
                }}
                transition={{
                    type: "spring",
                    stiffness: 500,
                    damping: 30
                }}
            />
        </button>
    );
}

