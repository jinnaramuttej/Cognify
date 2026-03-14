'use client';

import React from 'react';
import { useAdvancedSettings } from './SettingsContext';
import SegmentedControl from './SegmentedControl';
import PremiumSlider from './PremiumSlider';
import LivePreviewBox from './LivePreviewBox';
import { Brain, Zap, Target, Gauge, Stethoscope } from 'lucide-react';

export default function LearningIntelligenceSection() {
    const { settings, updateSetting } = useAdvancedSettings();
    const data = settings.learning_intelligence;

    // Derive preview message based on current selections
    const getPreviewMessage = () => {
        if (data.hint_style === 'full') return "Here is the complete solution for your reference. Let's walk through it together!";
        if (data.hint_style === 'minimal') return "You're close! Check the signs in your last step.";
        if (data.hint_style === 'socratic') return "What happens if you isolate 'x' on one side first? Try that and tell me what you get.";
        return "Step 1: Move the constant. Step 2: Divide by the coefficient. What's step 1 for this equation?";
    };

    return (
        <div className="space-y-8 animate-in fade-in zoom-in-95 duration-500">
            <div className="grid md:grid-cols-[1fr_300px] gap-8">
                <div className="space-y-8">

                    {/* Adaptive Mode */}
                    <div className="space-y-3 bg-gray-50/50 dark:bg-gray-900/50 p-5 rounded-2xl border border-gray-200 dark:border-gray-700">
                        <div className="flex justify-between items-start">
                            <div>
                                <h3 className="text-base font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                                    <Brain className="w-5 h-5 text-blue-500" />
                                    Adaptive Mode
                                </h3>
                                <p className="text-sm text-gray-500 mt-1">How strictly should the curriculum adjust to your performance?</p>
                            </div>
                        </div>
                        <SegmentedControl
                            className="mt-4"
                            value={data.adaptive_mode}
                            onChange={(v) => updateSetting('learning_intelligence', 'adaptive_mode', v as any)}
                            options={[
                                { label: 'Strictly Adaptive', value: 'strict' },
                                { label: 'Balanced', value: 'balanced' },
                                { label: 'Manual Path', value: 'manual' }
                            ]}
                        />
                    </div>

                    {/* Difficulty Bias */}
                    <div className="space-y-3 bg-gray-50/50 dark:bg-gray-900/50 p-5 rounded-2xl border border-gray-200 dark:border-gray-700">
                        <h3 className="text-base font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                            <Target className="w-5 h-5 text-orange-500" />
                            Difficulty Bias
                        </h3>
                        <p className="text-sm text-gray-500 mt-1">Push yourself harder or take it easy.</p>
                        <div className="pt-4">
                            <PremiumSlider
                                value={data.difficulty_bias}
                                onChange={(v) => updateSetting('learning_intelligence', 'difficulty_bias', v)}
                                labelLeft="Comfort Zone"
                                labelRight="Maximum Challenge"
                            />
                        </div>
                    </div>

                    {/* Hint Style */}
                    <div className="space-y-3 bg-gray-50/50 dark:bg-gray-900/50 p-5 rounded-2xl border border-gray-200 dark:border-gray-700">
                        <h3 className="text-base font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                            <Zap className="w-5 h-5 text-yellow-500" />
                            Hint Style
                        </h3>
                        <p className="text-sm text-gray-500 mt-1">How Cogni guides you when you're stuck.</p>
                        <SegmentedControl
                            className="mt-4 grid grid-cols-2 md:flex overflow-hidden text-xs md:text-sm"
                            value={data.hint_style}
                            onChange={(v) => updateSetting('learning_intelligence', 'hint_style', v as any)}
                            options={[
                                { label: 'Minimal', value: 'minimal' },
                                { label: 'Socratic', value: 'socratic' },
                                { label: 'Step-by-step', value: 'step_by_step' },
                                { label: 'Full Solutions', value: 'full' }
                            ]}
                        />
                    </div>

                    {/* Error Tolerance & Pace */}
                    <div className="grid md:grid-cols-2 gap-4">
                        <div className="space-y-3 bg-gray-50/50 dark:bg-gray-900/50 p-5 rounded-2xl border border-gray-200 dark:border-gray-700">
                            <h3 className="text-base font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                                <Stethoscope className="w-5 h-5 text-red-400" />
                                Error Tolerance
                            </h3>
                            <p className="text-sm text-gray-500 mt-1 mb-4">Retries allowed before intervention.</p>
                            <PremiumSlider
                                min={1} max={5} step={1}
                                value={data.error_tolerance}
                                onChange={(v) => updateSetting('learning_intelligence', 'error_tolerance', v)}
                                labelLeft="1 Try"
                                labelRight="5 Tries"
                            />
                        </div>

                        <div className="space-y-3 bg-gray-50/50 dark:bg-gray-900/50 p-5 rounded-2xl border border-gray-200 dark:border-gray-700">
                            <h3 className="text-base font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                                <Gauge className="w-5 h-5 text-green-500" />
                                Pace Preference
                            </h3>
                            <p className="text-sm text-gray-500 mt-1 mb-4">Focus on speed or deep understanding.</p>
                            <SegmentedControl
                                value={data.pace_preference}
                                onChange={(v) => updateSetting('learning_intelligence', 'pace_preference', v as any)}
                                options={[
                                    { label: 'Quick', value: 'quick' },
                                    { label: 'Deep', value: 'deep' }
                                ]}
                            />
                        </div>
                    </div>

                </div>

                {/* Live Preview Side */}
                <div className="relative">
                    <div className="sticky top-24 pt-2">
                        <LivePreviewBox
                            title="How Cogni Responds"
                            message={getPreviewMessage()}
                            animationKey={data.hint_style}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}

