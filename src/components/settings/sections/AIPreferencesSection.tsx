'use client';

import { useState } from 'react';
import {
    Sparkles, MessageSquare, Lightbulb,
    Settings2, Bot, PlayCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function AIPreferencesSection() {
    const [activePersonality, setActivePersonality] = useState('socratic');
    const [activeHintStyle, setActiveHintStyle] = useState('step-by-step');

    const getPreviewText = () => {
        if (activePersonality === 'socratic') {
            return "That's an interesting approach! But what happens to the velocity when the object reaches its maximum height? Think about the definition of acceleration.";
        } else if (activePersonality === 'direct') {
            return "Incorrect. At max height, velocity is 0 m/s because it momentarily stops before falling. Use v = u + at to verify.";
        } else {
            return "Oops! Almost there! ✨ Let's pause and look at the peak of the throw—if it's not moving up anymore, what must its speed be? You've got this! 🚀";
        }
    };

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <Sparkles className="text-blue-500" size={24} /> AI Tutor Preferences
                </h2>
                <p className="text-sm text-gray-500">Customize how Cogni interacts with you during study sessions.</p>
            </div>

            <div className="space-y-6">
                {/* Tutor Personality */}
                <div className="bg-white dark:bg-gray-900 backdrop-blur-md border border-gray-200 dark:border-gray-700 rounded-3xl overflow-hidden shadow-sm">
                    <div className="p-6">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                            <Bot className="text-blue-500" size={20} /> AI Personality
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div
                                onClick={() => setActivePersonality('socratic')}
                                className={`p-4 rounded-2xl border-2 cursor-pointer transition-all text-center ${activePersonality === 'socratic' ? 'border-blue-500 bg-blue-50 dark:bg-blue-500/10' : 'border-gray-100 dark:border-gray-700 hover:border-blue-200'}`}
                            >
                                <div className="text-2xl mb-2">🤔</div>
                                <h4 className={`font-bold text-sm ${activePersonality === 'socratic' ? 'text-blue-700 dark:text-blue-300' : 'text-gray-900 dark:text-white'}`}>Socratic Guide</h4>
                                <p className="text-xs text-gray-500 mt-1">Asks leading questions so you find the answer yourself.</p>
                            </div>

                            <div
                                onClick={() => setActivePersonality('direct')}
                                className={`p-4 rounded-2xl border-2 cursor-pointer transition-all text-center ${activePersonality === 'direct' ? 'border-blue-500 bg-blue-50 dark:bg-blue-500/10' : 'border-gray-100 dark:border-gray-700 hover:border-blue-200'}`}
                            >
                                <div className="text-2xl mb-2">⚡</div>
                                <h4 className={`font-bold text-sm ${activePersonality === 'direct' ? 'text-blue-700 dark:text-blue-300' : 'text-gray-900 dark:text-white'}`}>Direct & Concise</h4>
                                <p className="text-xs text-gray-500 mt-1">No fluff. Straight to the facts and formula corrections.</p>
                            </div>

                            <div
                                onClick={() => setActivePersonality('cheerleader')}
                                className={`p-4 rounded-2xl border-2 cursor-pointer transition-all text-center ${activePersonality === 'cheerleader' ? 'border-blue-500 bg-blue-50 dark:bg-blue-500/10' : 'border-gray-100 dark:border-gray-700 hover:border-blue-200'}`}
                            >
                                <div className="text-2xl mb-2">🙌</div>
                                <h4 className={`font-bold text-sm ${activePersonality === 'cheerleader' ? 'text-blue-700 dark:text-blue-300' : 'text-gray-900 dark:text-white'}`}>Cheerleader</h4>
                                <p className="text-xs text-gray-500 mt-1">Highly encouraging, uses emojis, and celebrates wins.</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Live Preview */}
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/10 dark:to-indigo-900/10 border border-blue-100 dark:border-blue-500/20 rounded-3xl overflow-hidden shadow-sm relative">
                    <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-blue-400 to-indigo-500"></div>
                    <div className="p-6 pl-8">
                        <div className="flex items-center gap-2 mb-4">
                            <PlayCircle className="text-blue-500" size={16} />
                            <span className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">Live Preview Simulation</span>
                        </div>

                        {/* Chat Bubble */}
                        <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-700 rounded-2xl rounded-tl-sm p-4 shadow-sm inline-block max-w-[90%] md:max-w-[70%] relative">
                            <div className="absolute -left-3 top-0 text-white dark:text-[#1a1c23] drop-shadow-sm">
                                <svg width="12" height="16" viewBox="0 0 12 16" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M12 0H0L12 16V0Z" />
                                </svg>
                            </div>
                            <p className="text-sm text-gray-800 dark:text-gray-200 leading-relaxed font-medium">
                                {getPreviewText()}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Hint System */}
                <div className="bg-white dark:bg-gray-900 backdrop-blur-md border border-gray-200 dark:border-gray-700 rounded-3xl overflow-hidden shadow-sm">
                    <div className="p-6">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                            <Lightbulb className="text-amber-500" size={20} /> Hint Style Configuration
                        </h3>

                        <div className="space-y-3">
                            {[
                                { id: 'minimal', label: 'Minimal Nudges', desc: 'Provides only a tiny clue or concept name instead of the approach.' },
                                { id: 'step-by-step', label: 'Step-by-Step Breakdown', desc: 'Breaks the problem into steps and guides you through one at a time.' },
                                { id: 'full-solution', label: 'Full Solution Allowed', desc: 'Allows the AI to show you the entire working process if you get stuck.' }
                            ].map(style => (
                                <label
                                    key={style.id}
                                    onClick={() => setActiveHintStyle(style.id)}
                                    className={`flex items-center justify-between p-4 rounded-2xl border border-gray-100 dark:border-gray-700 cursor-pointer transition-all ${activeHintStyle === style.id ? 'bg-amber-50 dark:bg-amber-500/10 border-amber-200 dark:border-amber-500/20' : 'hover:bg-gray-50 dark:hover:bg-white/5'}`}
                                >
                                    <div>
                                        <span className={`block font-semibold text-sm ${activeHintStyle === style.id ? 'text-amber-700 dark:text-amber-400' : 'text-gray-900 dark:text-white'}`}>{style.label}</span>
                                        <span className="text-xs text-gray-500 mt-1 block">{style.desc}</span>
                                    </div>
                                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${activeHintStyle === style.id ? 'border-amber-500' : 'border-gray-300 dark:border-gray-600'}`}>
                                        {activeHintStyle === style.id && <div className="w-2.5 h-2.5 rounded-full bg-amber-500"></div>}
                                    </div>
                                </label>
                            ))}
                        </div>

                        <div className="mt-8 pt-6 border-t border-gray-100 dark:border-gray-700 flex justify-end">
                            <Button className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl px-6 min-w-[140px] shadow-md shadow-blue-500/20">
                                Save AI Settings
                            </Button>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}

