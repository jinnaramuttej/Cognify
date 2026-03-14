'use client';

import React from 'react';
import { useAdvancedSettings } from './SettingsContext';
import PremiumSlider from './PremiumSlider';
import LivePreviewBox from './LivePreviewBox';
import SettingsSelect from './SettingsSelect';
import { Smile, Mic, Sparkles, MessageSquare } from 'lucide-react';
import { motion } from 'framer-motion';

export default function AIPersonalitySection() {
    const { settings, updateSetting } = useAdvancedSettings();
    const data = settings.ai_personality;

    const personalities = [
        { id: 'calm', name: 'Calm Mentor', desc: 'Patient, encouraging, takes time.' },
        { id: 'strict', name: 'Strict Coach', desc: 'Direct, pushes you to limits.' },
        { id: 'friendly', name: 'Friendly Senior', desc: 'Relatable, uses slang, peer-to-peer.' },
        { id: 'competitive', name: 'Rival', desc: 'Challenges you, gamified tone.' }
    ];

    const getPreviewMessage = () => {
        switch (data.personality) {
            case 'calm': return "Take a deep breath. You're doing great. Let's look at this step-by-step.";
            case 'strict': return "Incorrect! Focus on the fundamentals. Try again and don't rush it.";
            case 'friendly': return "No worries, dude! That one was tricky. Wanna try another approach?";
            case 'competitive': return "Is that the best you can do? I bet you can solve it faster next time!";
            default: return "";
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in zoom-in-95 duration-500">
            <div className="grid md:grid-cols-[1fr_300px] gap-8">
                <div className="space-y-8">

                    {/* Personality Cards */}
                    <div className="space-y-4">
                        <div>
                            <h3 className="text-base font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                                <Smile className="w-5 h-5 text-purple-500" />
                                Cogni Personality Mode
                            </h3>
                            <p className="text-sm text-gray-500 mt-1">Choose the tone that motivates you most.</p>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {personalities.map((p) => {
                                const isActive = data.personality === p.id;
                                return (
                                    <motion.div
                                        key={p.id}
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={() => updateSetting('ai_personality', 'personality', p.id as any)}
                                        className={`cursor-pointer group relative p-5 rounded-2xl border transition-all duration-300 ${isActive
                                                ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-500 shadow-sm shadow-blue-500/20'
                                                : 'bg-gray-50/50 dark:bg-gray-900/50 border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-500/50'
                                            }`}
                                    >
                                        <div className="flex justify-between items-start mb-2">
                                            <h4 className={`font-medium ${isActive ? 'text-blue-700 dark:text-blue-300' : 'text-gray-900 dark:text-gray-200'}`}>
                                                {p.name}
                                            </h4>
                                            <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${isActive ? 'border-blue-500' : 'border-gray-300 dark:border-gray-600'}`}>
                                                {isActive && <div className="w-2 h-2 rounded-full bg-blue-500" />}
                                            </div>
                                        </div>
                                        <p className="text-xs text-gray-500 leading-relaxed">{p.desc}</p>
                                    </motion.div>
                                );
                            })}
                        </div>
                    </div>

                    <div className="grid sm:grid-cols-2 gap-6">
                        {/* Voice Settings */}
                        <div className="space-y-3 bg-gray-50/50 dark:bg-gray-900/50 p-5 rounded-2xl border border-gray-200 dark:border-gray-700">
                            <h3 className="text-base font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                                <Mic className="w-5 h-5 text-lime-500" />
                                Voice Mode
                            </h3>
                            <p className="text-xs text-gray-500 mb-2">Text-to-speech for lessons.</p>
                            <SettingsSelect
                                value={data.voice_style || 'disabled'}
                                onChange={(v) => updateSetting('ai_personality', 'voice_style', v === 'disabled' ? null : v)}
                                options={[
                                    { label: 'Disabled', value: 'disabled' },
                                    { label: 'Nova (Warm)', value: 'nova' },
                                    { label: 'Onyx (Deep)', value: 'onyx' },
                                    { label: 'Shimmer (Bright)', value: 'shimmer' }
                                ]}
                            />
                        </div>

                        {/* Explanation Depth */}
                        <div className="space-y-3 bg-gray-50/50 dark:bg-gray-900/50 p-5 rounded-2xl border border-gray-200 dark:border-gray-700 flex flex-col justify-between">
                            <div>
                                <h3 className="text-base font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                                    <MessageSquare className="w-5 h-5 text-indigo-500" />
                                    Explanation Depth
                                </h3>
                                <p className="text-xs text-gray-500 mb-4">Concise points vs highly detailed thesis.</p>
                            </div>
                            <PremiumSlider
                                value={data.explanation_depth}
                                onChange={(v) => updateSetting('ai_personality', 'explanation_depth', v)}
                                labelLeft="Concise"
                                labelRight="Detailed"
                            />
                        </div>
                    </div>

                    {/* Avatar Animation */}
                    <div className="space-y-3 bg-gray-50/50 dark:bg-gray-900/50 p-5 rounded-2xl border border-gray-200 dark:border-gray-700">
                        <h3 className="text-base font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                            <Sparkles className="w-5 h-5 text-amber-500" />
                            Avatar Expressiveness
                        </h3>
                        <p className="text-xs text-gray-500 mb-4">How animated the Cogni agent is onscreen.</p>
                        <PremiumSlider
                            value={data.animation_intensity}
                            onChange={(v) => updateSetting('ai_personality', 'animation_intensity', v)}
                            labelLeft="Static"
                            labelRight="Highly Animated"
                        />
                    </div>

                </div>

                {/* Live Preview Side */}
                <div className="relative">
                    <div className="sticky top-24 pt-2">
                        <LivePreviewBox
                            title="Personality Preview"
                            message={getPreviewMessage()}
                            animationKey={data.personality}
                            avatarIcon={<Smile size={18} className="animate-pulse" />}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}

