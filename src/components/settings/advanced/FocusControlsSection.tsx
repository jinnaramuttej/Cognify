'use client';

import React from 'react';
import { useAdvancedSettings } from './SettingsContext';
import SettingsToggle from './SettingsToggle';
import SettingsSelect from './SettingsSelect';
import { EyeOff, Timer, Palette, Volume2 } from 'lucide-react';

export default function FocusControlsSection() {
    const { settings, updateSetting } = useAdvancedSettings();
    const data = settings.focus_controls;

    return (
        <div className="space-y-6 animate-in fade-in zoom-in-95 duration-500 max-w-2xl">

            {/* Focus Mode Master */}
            <div className="bg-gradient-to-br from-indigo-50 to-blue-50 dark:from-indigo-900/20 dark:to-blue-900/20 p-6 rounded-2xl border border-indigo-100 dark:border-indigo-500/20 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 transform translate-x-1/2 -translate-y-1/2">
                    <div className="w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl"></div>
                </div>

                <div className="flex items-start justify-between relative z-10">
                    <div>
                        <h3 className="text-lg font-bold text-indigo-900 dark:text-indigo-300 flex items-center gap-2 mb-2">
                            <EyeOff className="w-5 h-5 text-indigo-500" />
                            Deep Focus Mode
                        </h3>
                        <p className="text-sm text-indigo-700/70 dark:text-indigo-300/70 max-w-sm">
                            Instantly hide the sidebar, block notifications, and switch to a minimal UI to maximize concentration.
                        </p>
                    </div>
                    <div className="mt-1">
                        <SettingsToggle
                            size="lg"
                            checked={data.focus_mode_on}
                            onChange={(v) => updateSetting('focus_controls', 'focus_mode_on', v)}
                        />
                    </div>
                </div>
            </div>

            <div className="space-y-4">
                {/* Timer Auto-Start */}
                <div className="flex items-center justify-between bg-gray-50/50 dark:bg-gray-900/50 p-5 rounded-2xl border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-orange-50 dark:bg-orange-500/10 flex items-center justify-center text-orange-500">
                            <Timer size={18} />
                        </div>
                        <div>
                            <h4 className="font-medium text-gray-900 dark:text-gray-200">Auto-start Session Timer</h4>
                            <p className="text-xs text-gray-500 mt-1">Begin tracking study time as soon as you open a chat.</p>
                        </div>
                    </div>
                    <SettingsToggle
                        checked={data.auto_start_timer}
                        onChange={(v) => updateSetting('focus_controls', 'auto_start_timer', v)}
                    />
                </div>

                {/* Background Theme */}
                <div className="flex items-center justify-between bg-gray-50/50 dark:bg-gray-900/50 p-5 rounded-2xl border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-pink-50 dark:bg-pink-500/10 flex items-center justify-center text-pink-500">
                            <Palette size={18} />
                        </div>
                        <div>
                            <h4 className="font-medium text-gray-900 dark:text-gray-200">Environment Theme</h4>
                            <p className="text-xs text-gray-500 mt-1">Choose the visual background during study sessions.</p>
                        </div>
                    </div>
                    <div className="w-48">
                        <SettingsSelect
                            value={data.background_theme}
                            onChange={(v) => updateSetting('focus_controls', 'background_theme', v as any)}
                            options={[
                                { label: 'Animated Gradient', value: 'animated_gradient' },
                                { label: 'Minimal Clean', value: 'minimal' },
                                { label: 'Solid Dark/Light', value: 'solid' }
                            ]}
                        />
                    </div>
                </div>

                {/* Sound Effects */}
                <div className="flex items-center justify-between bg-gray-50/50 dark:bg-gray-900/50 p-5 rounded-2xl border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-cyan-50 dark:bg-cyan-500/10 flex items-center justify-center text-cyan-500">
                            <Volume2 size={18} />
                        </div>
                        <div>
                            <h4 className="font-medium text-gray-900 dark:text-gray-200">Session Sound Effects</h4>
                            <p className="text-xs text-gray-500 mt-1">Play soft chimes for correct answers and streaks.</p>
                        </div>
                    </div>
                    <SettingsToggle
                        checked={data.sound_effects}
                        onChange={(v) => updateSetting('focus_controls', 'sound_effects', v)}
                    />
                </div>
            </div>

        </div>
    );
}

