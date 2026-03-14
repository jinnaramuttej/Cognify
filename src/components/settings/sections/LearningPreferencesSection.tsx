'use client';

import {
    BookOpen, Brain, Target, CalendarDays,
    RotateCw, LineChart, ToggleRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';

export default function LearningPreferencesSection() {
    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Learning Preferences</h2>
                <p className="text-sm text-gray-500">Customize how Cognify structures your study plans and tests.</p>
            </div>

            <div className="space-y-6">
                {/* Course Core */}
                <div className="bg-white dark:bg-gray-900 backdrop-blur-md border border-gray-200 dark:border-gray-700 rounded-3xl overflow-hidden shadow-sm">
                    <div className="p-6">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                            <BookOpen className="text-blue-500" size={20} /> Core Syllabus
                        </h3>

                        <div className="space-y-6">
                            <div className="space-y-3">
                                <label className="text-sm font-semibold text-gray-900 dark:text-white block">Active Exam Track</label>
                                <div className="grid grid-cols-3 gap-3">
                                    <div className="border border-gray-200 dark:border-gray-700 rounded-xl p-4 text-center cursor-pointer hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-500/10 transition-colors">
                                        <div className="font-bold text-gray-900 dark:text-white">JEE Main</div>
                                    </div>
                                    <div className="border-2 border-blue-500 bg-blue-50 dark:bg-blue-500/10 rounded-xl p-4 text-center cursor-pointer relative shadow-sm">
                                        <div className="absolute -top-2 -right-2 bg-blue-500 w-5 h-5 rounded-full flex items-center justify-center text-white">
                                            ✓
                                        </div>
                                        <div className="font-bold text-blue-700 dark:text-blue-300">NEET</div>
                                    </div>
                                    <div className="border border-gray-200 dark:border-gray-700 rounded-xl p-4 text-center cursor-pointer hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-500/10 transition-colors">
                                        <div className="font-bold text-gray-900 dark:text-white">Both</div>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700">
                                <div>
                                    <span className="block font-semibold text-gray-900 dark:text-white text-sm">Strict Path Mode</span>
                                    <span className="text-xs text-gray-500 mt-1 block">Only show questions and topics relevant to your active track.</span>
                                </div>
                                <Switch defaultChecked className="data-[state=checked]:bg-blue-600" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Study Goals */}
                <div className="bg-white dark:bg-gray-900 backdrop-blur-md border border-gray-200 dark:border-gray-700 rounded-3xl overflow-hidden shadow-sm">
                    <div className="p-6">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                            <Target className="text-blue-500" size={20} /> Personal Goals
                        </h3>

                        <div className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-gray-900 dark:text-white block">Daily Study Goal</label>
                                    <select className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none">
                                        <option>Casual (30 mins / day)</option>
                                        <option>Regular (2 hours / day)</option>
                                        <option selected>Serious (4 hours / day)</option>
                                        <option>Intense (6+ hours / day)</option>
                                    </select>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-gray-900 dark:text-white block">Weekly Mock Tests</label>
                                    <select className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none">
                                        <option>1 Test / week</option>
                                        <option selected>2 Tests / week</option>
                                        <option>3+ Tests / week</option>
                                    </select>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <div className="flex justify-between items-center mb-1">
                                    <label className="text-sm font-semibold text-gray-900 dark:text-white">Default Difficulty Bias</label>
                                    <span className="text-xs font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-500/20 px-2 py-0.5 rounded">Slightly Challenging (65%)</span>
                                </div>
                                <p className="text-xs text-gray-500 mb-4">Adjust how hard the generated tests and practices are relative to your current skill level.</p>
                                <Slider defaultValue={[65]} max={100} step={5} className="py-4" />
                                <div className="flex justify-between text-xs text-gray-500 font-medium">
                                    <span>Easier</span>
                                    <span>Balanced</span>
                                    <span>Challenging</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Revision Algorithm */}
                <div className="bg-white dark:bg-gray-900 backdrop-blur-md border border-gray-200 dark:border-gray-700 rounded-3xl overflow-hidden shadow-sm">
                    <div className="p-6">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                            <RotateCw className="text-blue-500" size={20} /> Spaced Repetition Array
                        </h3>

                        <div className="space-y-5">
                            <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700">
                                <div>
                                    <span className="block font-semibold text-gray-900 dark:text-white text-sm">Force Weak Topic Revisions</span>
                                    <span className="text-xs text-gray-500 mt-1 block">Prioritize topics with &lt; 50% accuracy in your daily practice queue.</span>
                                </div>
                                <Switch defaultChecked className="data-[state=checked]:bg-blue-600" />
                            </div>

                            <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700">
                                <div>
                                    <span className="block font-semibold text-gray-900 dark:text-white text-sm">Auto-schedule Mistake Reviews</span>
                                    <span className="text-xs text-gray-500 mt-1 block">Mistakes from tests will reappear as practice queries 3 days later.</span>
                                </div>
                                <Switch defaultChecked className="data-[state=checked]:bg-blue-600" />
                            </div>
                        </div>

                        <div className="mt-8 pt-6 border-t border-gray-100 dark:border-gray-700 flex justify-end">
                            <Button className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl px-6 min-w-[140px] shadow-md shadow-blue-500/20">
                                Update Preferences
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

