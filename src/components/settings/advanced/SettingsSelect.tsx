'use client';

import React from 'react';
import { ChevronDown } from 'lucide-react';

type SettingsSelectProps = {
    value: string;
    options: { label: string; value: string }[];
    onChange: (val: string) => void;
};

export default function SettingsSelect({ value, options, onChange }: SettingsSelectProps) {
    return (
        <div className="relative">
            <select
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="w-full appearance-none bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 pr-10 text-sm font-medium text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-shadow transition-colors"
            >
                {options.map((opt) => (
                    <option key={opt.value} value={opt.value} className="text-gray-900 bg-white dark:bg-gray-800">
                        {opt.label}
                    </option>
                ))}
            </select>
            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500">
                <ChevronDown size={18} />
            </div>
        </div>
    );
}

