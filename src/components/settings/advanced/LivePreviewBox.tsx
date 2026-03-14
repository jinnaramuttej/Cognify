'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

type LivePreviewBoxProps = {
    title: string;
    message: string;
    avatarIcon?: React.ReactNode;
    animationKey: string;
};

export default function LivePreviewBox({ title, message, avatarIcon, animationKey }: LivePreviewBoxProps) {
    return (
        <div className="bg-blue-50/50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/30 rounded-2xl p-5 overflow-hidden">
            <h4 className="text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wider mb-4">
                {title}
            </h4>

            <div className="flex gap-4">
                <div className="shrink-0 w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center text-blue-600 dark:text-blue-400 shadow-sm relative">
                    {avatarIcon || <span className="text-sm font-bold">C</span>}
                    {/* Pulsing presence indicator */}
                    <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-white dark:border-[#0f1117] rounded-full"></span>
                </div>

                <div className="flex-1 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-700 rounded-2xl p-4 shadow-sm relative">
                    {/* Magic tail */}
                    <div className="absolute top-3 -left-2 w-4 h-4 bg-white dark:bg-gray-900 border-l border-b border-gray-100 dark:border-gray-700 transform rotate-45"></div>

                    <AnimatePresence mode="popLayout">
                        <motion.p
                            key={animationKey}
                            initial={{ opacity: 0, y: 10, scale: 0.98 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: -10, scale: 0.98 }}
                            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                            className="text-sm text-gray-700 dark:text-gray-300 relative z-10 font-medium leading-relaxed"
                        >
                            {message}
                        </motion.p>
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
}

