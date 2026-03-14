'use client';

import {
    Target, GraduationCap, TrendingUp, Calendar,
    MapPin, Clock, Award
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';

export default function ExamTargetsSection() {
    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Exam Targets</h2>
                <p className="text-sm text-gray-500">Define your goals to calibrate your personalized learning path.</p>
            </div>

            <div className="space-y-6">
                {/* Readiness Meter */}
                <div className="bg-gradient-to-br from-indigo-600 to-indigo-800 rounded-3xl overflow-hidden shadow-lg p-1 relative">
                    <div className="absolute -top-24 -right-24 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>

                    <div className="bg-white/10 backdrop-blur-md rounded-[20px] p-6 relative z-10 text-white flex flex-col md:flex-row items-center gap-8">
                        <div className="shrink-0 relative flex items-center justify-center">
                            <svg className="w-32 h-32 transform -rotate-90">
                                <circle cx="64" cy="64" r="56" fill="transparent" stroke="rgba(255,255,255,0.2)" strokeWidth="12" />
                                <circle cx="64" cy="64" r="56" fill="transparent" stroke="white" strokeWidth="12" strokeDasharray="351.85" strokeDashoffset="123" strokeLinecap="round" className="drop-shadow-md" />
                            </svg>
                            <div className="absolute text-center">
                                <span className="block text-3xl font-black">65%</span>
                                <span className="block text-[10px] font-bold uppercase tracking-widest text-indigo-200">Ready</span>
                            </div>
                        </div>

                        <div className="flex-1 text-center md:text-left">
                            <h3 className="text-2xl font-bold mb-2">Projected Readiness</h3>
                            <p className="text-indigo-100 text-sm mb-4 leading-relaxed">
                                Based on your recent mock tests and syllabus coverage, you are tracking towards a <strong className="text-white">99.1 Percentile</strong> in JEE Main. Keep pushing!
                            </p>
                            <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                                <span className="bg-white/20 px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5 backdrop-blur-md">
                                    <TrendingUp size={12} /> +2.4% this week
                                </span>
                                <span className="bg-white/20 px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5 backdrop-blur-md">
                                    <Target size={12} /> Target: 99.5%
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Goals Form */}
                <div className="bg-white dark:bg-gray-900 backdrop-blur-md border border-gray-200 dark:border-gray-700 rounded-3xl overflow-hidden shadow-sm">
                    <div className="p-6">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                            <Award className="text-indigo-500" size={20} /> Target Specifics
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-1.5">
                                <label className="text-xs font-semibold tracking-wide text-gray-600 dark:text-gray-400 uppercase">Target Exam</label>
                                <select className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-2.5 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none transition-shadow">
                                    <option selected>JEE Main + Advanced</option>
                                    <option>NEET UG</option>
                                    <option>BITSAT</option>
                                </select>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-xs font-semibold tracking-wide text-gray-600 dark:text-gray-400 uppercase">Attempt Year</label>
                                <select className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-2.5 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none transition-shadow">
                                    <option>2025</option>
                                    <option selected>2026</option>
                                    <option>2027</option>
                                </select>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-xs font-semibold tracking-wide text-gray-600 dark:text-gray-400 uppercase">Target Score / Percentile</label>
                                <input type="text" defaultValue="99.5 %ile" className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-2.5 text-sm text-gray-900 dark:text-white placeholder:text-gray-400 focus:ring-2 focus:ring-indigo-500 outline-none" />
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-xs font-semibold tracking-wide text-gray-600 dark:text-gray-400 uppercase">Target College (Dream)</label>
                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"><MapPin size={16} /></span>
                                    <input type="text" defaultValue="IIT Bombay - Computer Science" className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl pl-9 pr-4 py-2.5 text-sm text-gray-900 dark:text-white placeholder:text-gray-400 focus:ring-2 focus:ring-indigo-500 outline-none" />
                                </div>
                            </div>
                        </div>

                        <div className="mt-8 pt-6 border-t border-gray-100 dark:border-gray-700 flex justify-end">
                            <Button className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl px-6 min-w-[140px] shadow-md shadow-indigo-500/20">
                                Update Targets
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

