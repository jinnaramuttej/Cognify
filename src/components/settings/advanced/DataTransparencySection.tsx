'use client';

import React from 'react';
import { useAdvancedSettings } from './SettingsContext';
import SettingsToggle from './SettingsToggle';
import { Activity, Download, ShieldOutline, ServerCrash, Key } from 'lucide-react';

export default function DataTransparencySection() {
    const { settings, updateSetting } = useAdvancedSettings();
    const data = settings.transparency;

    const handleExport = () => {
        // Stub for export functionality
        const anchor = document.createElement('a');
        anchor.href = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(settings, null, 2));
        anchor.download = 'cognify_learning_data.json';
        anchor.click();
    };

    return (
        <div className="space-y-6 animate-in fade-in zoom-in-95 duration-500">

            {/* Privacy Controls */}
            <div className="bg-gray-50/50 dark:bg-gray-900/50 p-6 rounded-2xl border border-gray-200 dark:border-gray-700 space-y-6">
                <h3 className="text-base font-semibold text-gray-900 dark:text-white flex items-center gap-2 mb-2">
                    <Key className="w-5 h-5 text-teal-500" />
                    Privacy & Data Controls
                </h3>

                <div className="flex items-center justify-between">
                    <div>
                        <h4 className="font-medium text-gray-900 dark:text-gray-200">Save Chat History</h4>
                        <p className="text-xs text-gray-500 mt-1 max-w-sm">Keep a log of your conversations with Cogni for future reference and revision.</p>
                    </div>
                    <SettingsToggle
                        checked={data.save_chat_history}
                        onChange={(v) => updateSetting('transparency', 'save_chat_history', v)}
                    />
                </div>

                <div className="w-full h-px bg-gray-50 dark:bg-gray-800" />

                <div className="flex items-center justify-between">
                    <div>
                        <h4 className="font-medium text-gray-900 dark:text-gray-200">Allow Data for Adaptive Modeling</h4>
                        <p className="text-xs text-gray-500 mt-1 max-w-sm">Allow Cognify to anonymously use your performance stats to improve the adaptive engine for everyone.</p>
                    </div>
                    <SettingsToggle
                        checked={data.allow_data_training}
                        onChange={(v) => updateSetting('transparency', 'allow_data_training', v)}
                    />
                </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
                {/* Export Data */}
                <div className="bg-gray-50/50 dark:bg-gray-900/50 p-6 rounded-2xl border border-gray-200 dark:border-gray-700 flex flex-col justify-between">
                    <div>
                        <h3 className="text-base font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                            <Download className="w-5 h-5 text-blue-500" />
                            Export Learning Data
                        </h3>
                        <p className="text-xs text-gray-500 mt-2 mb-6">Download your mastery graphs, test scores, and full history in JSON format.</p>
                    </div>
                    <button
                        onClick={handleExport}
                        className="w-full py-2.5 px-4 bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 font-medium text-sm rounded-xl hover:bg-blue-100 dark:hover:bg-blue-500/20 transition-colors"
                    >
                        Download Data.json
                    </button>
                </div>

                {/* Algorithm Transparency */}
                <div className="bg-gray-50/50 dark:bg-gray-900/50 p-6 rounded-2xl border border-gray-200 dark:border-gray-700">
                    <h3 className="text-base font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                        <Activity className="w-5 h-5 text-indigo-500" />
                        Current Engine Weights
                    </h3>
                    <div className="mt-4 space-y-3">
                        <div className="flex items-center justify-between text-xs">
                            <span className="text-gray-500">Speed vs Accuracy Bias</span>
                            <span className="font-mono bg-gray-50 dark:bg-white/10 px-2 py-1 rounded text-gray-900 dark:text-gray-300">{(settings.learning_intelligence.difficulty_bias / 100).toFixed(2)}</span>
                        </div>
                        <div className="flex items-center justify-between text-xs">
                            <span className="text-gray-500">Hint Assistance Rate</span>
                            <span className="font-mono bg-gray-50 dark:bg-white/10 px-2 py-1 rounded text-gray-900 dark:text-gray-300">0.85</span>
                        </div>
                        <div className="flex items-center justify-between text-xs">
                            <span className="text-gray-500">Forgetting Curve Factor</span>
                            <span className="font-mono bg-gray-50 dark:bg-white/10 px-2 py-1 rounded text-gray-900 dark:text-gray-300">1.02</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Danger Zone */}
            <div className="bg-red-50/50 dark:bg-red-900/10 p-6 rounded-2xl border border-red-100 dark:border-red-900/30">
                <h3 className="text-base font-semibold text-red-600 dark:text-red-400 flex items-center gap-2">
                    <ServerCrash className="w-5 h-5" />
                    Reset Learning Model
                </h3>
                <p className="text-xs text-red-500/70 dark:text-red-400/70 mt-2 mb-4">
                    This will wipe your current difficulty thresholds and Cogni's understanding of your weak areas. This action is irreversible.
                </p>
                <button className="py-2.5 px-5 bg-red-100 dark:bg-red-500/20 text-red-700 dark:text-red-400 font-medium text-sm rounded-xl hover:bg-red-200 dark:hover:bg-red-500/30 transition-colors">
                    Reset AI Engine
                </button>
            </div>

        </div>
    );
}

