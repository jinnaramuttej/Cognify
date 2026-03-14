'use client';

import { useState } from 'react';
import {
    Eye, Lock, Download, Globe, Trophy,
    Brain, FileText, BarChart2, Share2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';

export default function PrivacySection() {
    const [privacySettings, setPrivacySettings] = useState({
        publicProfile: true,
        leaderboard: true,
        anonymizedData: true,
        aiPersonalization: true,
        achievements: false,
        emailMarketing: false,
    });

    const toggleSetting = (key: keyof typeof privacySettings) => {
        setPrivacySettings(prev => ({ ...prev, [key]: !prev[key] }));
    };

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Privacy</h2>
                <p className="text-sm text-gray-500">Control who sees your data and what is shared.</p>
            </div>

            <div className="space-y-6">
                {/* Visibility Box */}
                <div className="bg-white dark:bg-gray-900 backdrop-blur-md border border-gray-200 dark:border-gray-700 rounded-3xl overflow-hidden shadow-sm">
                    <div className="p-6">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">Profile Visibility</h3>
                        <p className="text-sm text-gray-500 mb-6">Manage how others view your account.</p>

                        <div className="space-y-5">
                            {/* Public Profile */}
                            <div className="flex items-center justify-between">
                                <div className="flex items-start gap-4 pr-4">
                                    <div className="p-2.5 bg-gray-50 dark:bg-gray-800 rounded-xl text-gray-600 dark:text-gray-300">
                                        <Globe size={20} />
                                    </div>
                                    <div>
                                        <span className="block font-semibold text-gray-900 dark:text-white text-sm">Public Profile</span>
                                        <span className="text-xs text-gray-500 mt-1 block">Allow anyone to view your profile and enrolled courses.</span>
                                    </div>
                                </div>
                                <Switch
                                    checked={privacySettings.publicProfile}
                                    onCheckedChange={() => toggleSetting('publicProfile')}
                                    className="data-[state=checked]:bg-blue-600"
                                />
                            </div>

                            {/* Leaderboard */}
                            <div className="flex items-center justify-between">
                                <div className="flex items-start gap-4 pr-4">
                                    <div className="p-2.5 bg-gray-50 dark:bg-gray-800 rounded-xl text-gray-600 dark:text-gray-300">
                                        <Trophy size={20} />
                                    </div>
                                    <div>
                                        <span className="block font-semibold text-gray-900 dark:text-white text-sm">Leaderboard Appearance</span>
                                        <span className="text-xs text-gray-500 mt-1 block">Show your name and rank on global competitive leaderboards.</span>
                                    </div>
                                </div>
                                <Switch
                                    checked={privacySettings.leaderboard}
                                    onCheckedChange={() => toggleSetting('leaderboard')}
                                    className="data-[state=checked]:bg-blue-600"
                                />
                            </div>

                            {/* Share achievements */}
                            <div className="flex items-center justify-between">
                                <div className="flex items-start gap-4 pr-4">
                                    <div className="p-2.5 bg-gray-50 dark:bg-gray-800 rounded-xl text-gray-600 dark:text-gray-300">
                                        <Share2 size={20} />
                                    </div>
                                    <div>
                                        <span className="block font-semibold text-gray-900 dark:text-white text-sm">Share Achievements</span>
                                        <span className="text-xs text-gray-500 mt-1 block">Automatically display unlocked achievements on your profile.</span>
                                    </div>
                                </div>
                                <Switch
                                    checked={privacySettings.achievements}
                                    onCheckedChange={() => toggleSetting('achievements')}
                                    className="data-[state=checked]:bg-blue-600"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Data Usage Box */}
                <div className="bg-white dark:bg-gray-900 backdrop-blur-md border border-gray-200 dark:border-gray-700 rounded-3xl overflow-hidden shadow-sm">
                    <div className="p-6">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">Data Usage</h3>
                        <p className="text-sm text-gray-500 mb-6">Control how Cognify uses your learning data to improve algorithms.</p>

                        <div className="space-y-5">
                            {/* AI Personalization */}
                            <div className="flex items-center justify-between">
                                <div className="flex items-start gap-4 pr-4">
                                    <div className="p-2.5 bg-blue-50 dark:bg-blue-500/10 rounded-xl text-blue-600 dark:text-blue-400">
                                        <Brain size={20} />
                                    </div>
                                    <div>
                                        <span className="block font-semibold text-gray-900 dark:text-white text-sm">AI Personalization</span>
                                        <span className="text-xs text-gray-500 mt-1 block">Allow the AI Tutor to read your chat history and test analytics to provide personalized hints.</span>
                                    </div>
                                </div>
                                <Switch
                                    checked={privacySettings.aiPersonalization}
                                    onCheckedChange={() => toggleSetting('aiPersonalization')}
                                    className="data-[state=checked]:bg-blue-600"
                                />
                            </div>

                            {/* Anonymized Data */}
                            <div className="flex items-center justify-between">
                                <div className="flex items-start gap-4 pr-4">
                                    <div className="p-2.5 bg-gray-50 dark:bg-gray-800 rounded-xl text-gray-600 dark:text-gray-300">
                                        <BarChart2 size={20} />
                                    </div>
                                    <div>
                                        <span className="block font-semibold text-gray-900 dark:text-white text-sm">Contribute Anonymized Data</span>
                                        <span className="text-xs text-gray-500 mt-1 block">Share anonymized metrics to help improve global question difficulty calibration.</span>
                                    </div>
                                </div>
                                <Switch
                                    checked={privacySettings.anonymizedData}
                                    onCheckedChange={() => toggleSetting('anonymizedData')}
                                    className="data-[state=checked]:bg-blue-600"
                                />
                            </div>

                            {/* Email Marketing */}
                            <div className="flex items-center justify-between">
                                <div className="flex items-start gap-4 pr-4">
                                    <div className="p-2.5 bg-gray-50 dark:bg-gray-800 rounded-xl text-gray-600 dark:text-gray-300">
                                        <FileText size={20} />
                                    </div>
                                    <div>
                                        <span className="block font-semibold text-gray-900 dark:text-white text-sm">Marketing Emails</span>
                                        <span className="text-xs text-gray-500 mt-1 block">Receive feature updates, offers, and newsletters from Cognify.</span>
                                    </div>
                                </div>
                                <Switch
                                    checked={privacySettings.emailMarketing}
                                    onCheckedChange={() => toggleSetting('emailMarketing')}
                                    className="data-[state=checked]:bg-blue-600"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Data Export Box */}
                <div className="bg-white dark:bg-gray-900 backdrop-blur-md border border-gray-200 dark:border-gray-700 rounded-3xl overflow-hidden shadow-sm">
                    <div className="p-6">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Export Your Data</h3>
                        <p className="text-sm text-gray-500 mb-6">Download a copy of your personal data, chat history, and exam analytics used by Cognify.</p>

                        <Button variant="outline" className="rounded-xl border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-white/5 font-medium shadow-sm">
                            <Download size={16} className="mr-2" /> Request Data Export
                        </Button>
                        <p className="text-xs text-gray-500 mt-4 max-w-lg">
                            It may take up to 24 hours to compile your data. We will email you a secure link when it's ready to download.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

