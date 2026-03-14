'use client';

import React from 'react';
import { useAdvancedSettings } from './SettingsContext';
import SettingsSelect from './SettingsSelect';
import PremiumSlider from './PremiumSlider';
import { Trophy, CalendarClock, Target, Flame } from 'lucide-react';

export default function ExamTargetSection() {
    const { settings, updateSetting } = useAdvancedSettings();
    const data = settings.exam_target;

    return (
        <div className="space-y-6 animate-in fade-in zoom-in-95 duration-500 max-w-3xl">

            {/* Target Exam Banner */}
            <div className="bg-gradient-to-r from-emerald-500 to-teal-600 rounded-2xl border border-emerald-400 p-6 flex items-center justify-between shadow-lg shadow-emerald-500/20">
                <div className="text-white">
                    <h3 className="text-xl font-bold flex items-center gap-2 mb-1">
                        <Trophy className="w-6 h-6 text-emerald-200" />
                        Current Goal
                    </h3>
                    <p className="text-emerald-100 text-sm">Your dashboard and AI paths will optimize for this exam.</p>
                </div>

                {/* We would typically load this from `profiles.target_exam` rather than JSONB, but for the settings demo we will reuse JSONB or mock it. Assuming we sync it: */}
                <div className="w-48">
                    <select className="w-full appearance-none bg-white/20 backdrop-blur border border-white/30 rounded-xl px-4 py-3 text-white font-bold placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/50 cursor-pointer">
                        <option className="text-gray-900">JEE Main</option>
                        <option className="text-gray-900">NEET UG</option>
                        <option className="text-gray-900">CBSE Boards</option>
                    </select>
                </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">

                {/* Target Score */}
                <div className="bg-gray-50/50 dark:bg-gray-900/50 p-6 rounded-2xl border border-gray-200 dark:border-gray-700 space-y-4">
                    <h4 className="font-semibold text-gray-900 dark:text-gray-200 flex items-center gap-2">
                        <Target className="w-4 h-4 text-blue-500" />
                        Target Score
                    </h4>
                    <div className="flex items-end gap-2">
                        <input
                            type="number"
                            value={data.target_score}
                            onChange={(e) => updateSetting('exam_target', 'target_score', Number(e.target.value))}
                            className="text-4xl font-black text-gray-900 dark:text-white bg-transparent border-b-2 border-dashed border-gray-300 dark:border-gray-600 focus:border-blue-500 focus:outline-none w-24 text-center pb-1"
                        />
                        <span className="text-gray-500 text-sm pb-2 uppercase tracking-wide">Points</span>
                    </div>
                    <p className="text-xs text-gray-500">Sets the threshold for test recommendations.</p>
                </div>

                {/* Timeline */}
                <div className="bg-gray-50/50 dark:bg-gray-900/50 p-6 rounded-2xl border border-gray-200 dark:border-gray-700 space-y-4">
                    <h4 className="font-semibold text-gray-900 dark:text-gray-200 flex items-center gap-2">
                        <CalendarClock className="w-4 h-4 text-purple-500" />
                        Exam Timeline
                    </h4>
                    <input
                        type="date"
                        value={data.timeline_date.split('T')[0]} // Naive date extraction for demo
                        onChange={(e) => updateSetting('exam_target', 'timeline_date', new Date(e.target.value).toISOString())}
                        className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-sm font-medium text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <p className="text-xs text-gray-500">Adjusts the pace of spaced repetition.</p>
                </div>

            </div>

            {/* Weak Subject Emphasis */}
            <div className="bg-gray-50/50 dark:bg-gray-900/50 p-6 rounded-2xl border border-gray-200 dark:border-gray-700 space-y-4">
                <h4 className="font-semibold text-gray-900 dark:text-gray-200 flex items-center gap-2">
                    <Flame className="w-4 h-4 text-orange-500" />
                    Weak Subject Emphasis
                </h4>
                <p className="text-xs text-gray-500 mb-6 max-w-xl">
                    Higher emphasis means Cogni will force you to practice topics where your mastery is below 60% before allowing you to progress in stronger areas.
                </p>
                <PremiumSlider
                    value={data.weak_subjects_emphasis}
                    onChange={(v) => updateSetting('exam_target', 'weak_subjects_emphasis', v)}
                    labelLeft="Balanced Practice"
                    labelRight="Aggressive Weakness Targeting"
                />
            </div>

        </div>
    );
}

