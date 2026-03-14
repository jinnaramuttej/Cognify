'use client';

import {
    Database, HardDrive, Download, AlertOctagon,
    Trash2, RefreshCcw, Activity
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';

export default function DataTransparencySection() {
    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <Database className="text-emerald-500" size={24} /> Data & Transparency
                </h2>
                <p className="text-sm text-gray-500">View what data Cognify holds, manage logs, and control your footprint.</p>
            </div>

            <div className="space-y-6">
                {/* Storage Overview */}
                <div className="bg-white dark:bg-gray-900 backdrop-blur-md border border-gray-200 dark:border-gray-700 rounded-3xl overflow-hidden shadow-sm">
                    <div className="p-6">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                            <HardDrive className="text-emerald-500" size={20} /> Storage Footprint
                        </h3>

                        <div className="space-y-6">
                            <div>
                                <div className="flex justify-between items-end mb-2">
                                    <span className="text-sm font-semibold text-gray-900 dark:text-white">Total Account Data</span>
                                    <span className="text-xs font-medium text-gray-500">42.5 MB / 1 GB</span>
                                </div>
                                <Progress value={4.25} className="h-2 bg-gray-100 dark:bg-white/10 [&>div]:bg-emerald-500" />
                            </div>

                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-2">
                                <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700">
                                    <p className="text-xs text-gray-500 mb-1">Test History</p>
                                    <p className="text-lg font-bold text-gray-900 dark:text-white">12.4 MB</p>
                                </div>
                                <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700">
                                    <p className="text-xs text-gray-500 mb-1">AI Chat Logs</p>
                                    <p className="text-lg font-bold text-gray-900 dark:text-white">28.1 MB</p>
                                </div>
                                <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700">
                                    <p className="text-xs text-gray-500 mb-1">Profile Media</p>
                                    <p className="text-lg font-bold text-gray-900 dark:text-white">1.8 MB</p>
                                </div>
                                <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700">
                                    <p className="text-xs text-gray-500 mb-1">Analytics</p>
                                    <p className="text-lg font-bold text-gray-900 dark:text-white">0.2 MB</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* System Logs */}
                <div className="bg-white dark:bg-gray-900 backdrop-blur-md border border-gray-200 dark:border-gray-700 rounded-3xl overflow-hidden shadow-sm">
                    <div className="p-6">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                            <Activity className="text-emerald-500" size={20} /> AI Explanation Logs
                        </h3>
                        <p className="text-sm text-gray-500 mb-6">Review every interaction where the AI Tutor assisted you.</p>

                        <div className="space-y-3">
                            {[
                                { date: 'Today, 10:42 AM', query: 'Kinematics: Max height velocity explanation', tokens: '245 tokens' },
                                { date: 'Yesterday, 8:15 PM', query: 'Organic Chemistry: SN1 vs SN2 mechanism', tokens: '412 tokens' },
                                { date: 'Mar 01, 2026', query: 'Calculus: Integration by parts walkthrough', tokens: '389 tokens' }
                            ].map((log, i) => (
                                <div key={i} className="flex flex-col md:flex-row md:items-center justify-between p-4 rounded-2xl border border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800">
                                    <div>
                                        <p className="text-sm font-semibold text-gray-900 dark:text-white">{log.query}</p>
                                        <p className="text-xs text-gray-500 mt-1">{log.date}</p>
                                    </div>
                                    <div className="mt-2 md:mt-0 flex items-center gap-4">
                                        <span className="text-xs text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 px-2 py-1 rounded-md">
                                            {log.tokens}
                                        </span>
                                        <Button variant="ghost" size="sm" className="text-gray-500">View</Button>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="mt-4">
                            <Button variant="link" className="text-emerald-600 dark:text-emerald-400 p-0 h-auto font-semibold text-sm">
                                Download full log history (CSV)
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Reset / Delete Actions */}
                <div className="bg-white dark:bg-gray-900 backdrop-blur-md border border-red-200 dark:border-red-500/20 rounded-3xl overflow-hidden shadow-sm">
                    <div className="p-6">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                            <AlertOctagon className="text-red-500" size={20} /> Data Management
                        </h3>

                        <div className="space-y-4">
                            <div className="flex flex-col md:flex-row md:items-center justify-between p-5 bg-orange-50/50 dark:bg-orange-500/5 rounded-2xl border border-orange-100 dark:border-orange-500/10 gap-4">
                                <div>
                                    <span className="block font-semibold text-gray-900 dark:text-white text-sm">Reset Learning Model</span>
                                    <span className="text-xs text-gray-500 mt-1 block max-w-lg">Erases all AI personalization data. The AI will forget your past mistakes and performance bias, acting like a brand new tutor. Does not delete tests.</span>
                                </div>
                                <Button variant="outline" className="text-orange-600 border-orange-200 hover:bg-orange-50 dark:border-orange-500/30 dark:hover:bg-orange-500/10 shrink-0">
                                    <RefreshCcw size={16} className="mr-2" /> Reset AI
                                </Button>
                            </div>

                            <div className="flex flex-col md:flex-row md:items-center justify-between p-5 bg-red-50/50 dark:bg-red-500/5 rounded-2xl border border-red-100 dark:border-red-500/10 gap-4">
                                <div>
                                    <span className="block font-semibold text-gray-900 dark:text-white text-sm">Wipe Test History</span>
                                    <span className="text-xs text-gray-500 mt-1 block max-w-lg">Permanently deletes all attempted mock tests, scores, and analytics. Highly destructive.</span>
                                </div>
                                <Button variant="destructive" className="bg-red-500 hover:bg-red-600 shrink-0">
                                    <Trash2 size={16} className="mr-2" /> Wipe Data
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}

