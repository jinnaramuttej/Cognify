'use client';

import { useState } from 'react';
import {
    Bell, Mail, Smartphone, CalendarClock,
    BarChart, Sparkles, CreditCard, Clock
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';

export default function NotificationsSection() {
    const [channels, setChannels] = useState({
        email: true,
        push: true,
    });

    const [alerts, setAlerts] = useState({
        reminders: true,
        weeklyReport: true,
        aiInsights: true,
        subscription: true,
    });

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Notifications</h2>
                <p className="text-sm text-gray-500">Manage email, push, and platform alerts.</p>
            </div>

            <div className="space-y-6">
                {/* Delivery Channels */}
                <div className="bg-white dark:bg-gray-900 backdrop-blur-md border border-gray-200 dark:border-gray-700 rounded-3xl overflow-hidden shadow-sm">
                    <div className="p-6">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">Delivery Channels</h3>
                        <p className="text-sm text-gray-500 mb-6">Where should we securely send your notifications?</p>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Email */}
                            <div className={`p-5 rounded-2xl border transition-all ${channels.email ? 'border-blue-200 bg-blue-50/50 dark:border-blue-500/20 dark:bg-blue-500/5' : 'border-gray-100 bg-gray-50 dark:border-gray-700 dark:bg-gray-800'}`}>
                                <div className="flex justify-between items-start mb-4">
                                    <div className={`p-2.5 rounded-xl ${channels.email ? 'bg-blue-100 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400' : 'bg-gray-100 text-gray-500 dark:bg-white/10 dark:text-gray-400'}`}>
                                        <Mail size={20} />
                                    </div>
                                    <Switch
                                        checked={channels.email}
                                        onCheckedChange={() => setChannels(p => ({ ...p, email: !p.email }))}
                                        className="data-[state=checked]:bg-blue-600"
                                    />
                                </div>
                                <h4 className="font-semibold text-gray-900 dark:text-white text-sm mb-1">Email</h4>
                                <p className="text-xs text-gray-500">Alerts sent directly to your registered inbox.</p>
                            </div>

                            {/* Push */}
                            <div className={`p-5 rounded-2xl border transition-all ${channels.push ? 'border-blue-200 bg-blue-50/50 dark:border-blue-500/20 dark:bg-blue-500/5' : 'border-gray-100 bg-gray-50 dark:border-gray-700 dark:bg-gray-800'}`}>
                                <div className="flex justify-between items-start mb-4">
                                    <div className={`p-2.5 rounded-xl ${channels.push ? 'bg-blue-100 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400' : 'bg-gray-100 text-gray-500 dark:bg-white/10 dark:text-gray-400'}`}>
                                        <Smartphone size={20} />
                                    </div>
                                    <Switch
                                        checked={channels.push}
                                        onCheckedChange={() => setChannels(p => ({ ...p, push: !p.push }))}
                                        className="data-[state=checked]:bg-blue-600"
                                    />
                                </div>
                                <h4 className="font-semibold text-gray-900 dark:text-white text-sm mb-1">Push Notifications</h4>
                                <p className="text-xs text-gray-500">Real-time alerts sent to your browser or device app.</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Categories */}
                <div className="bg-white dark:bg-gray-900 backdrop-blur-md border border-gray-200 dark:border-gray-700 rounded-3xl overflow-hidden shadow-sm">
                    <div className="p-6">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">Notification Categories</h3>
                        <p className="text-sm text-gray-500 mb-6">Choose exactly what types of updates you want to receive.</p>

                        <div className="space-y-5">
                            {/* Reminders */}
                            <div className="flex items-center justify-between">
                                <div className="flex items-start gap-4 pr-4">
                                    <div className="p-2.5 bg-gray-50 dark:bg-gray-800 rounded-xl text-gray-600 dark:text-gray-300">
                                        <CalendarClock size={20} />
                                    </div>
                                    <div>
                                        <span className="block font-semibold text-gray-900 dark:text-white text-sm">Study Reminders</span>
                                        <span className="text-xs text-gray-500 mt-1 block">Get notified when it's time to take a mock test or revise flagged topics.</span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <select className="hidden md:block bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-2 py-1 text-xs outline-none focus:ring-1 focus:ring-blue-500 text-gray-600 dark:text-gray-300 transition-shadow">
                                        <option>Daily</option>
                                        <option>Weekly</option>
                                    </select>
                                    <Switch
                                        checked={alerts.reminders}
                                        onCheckedChange={() => setAlerts(p => ({ ...p, reminders: !p.reminders }))}
                                        className="data-[state=checked]:bg-blue-600"
                                    />
                                </div>
                            </div>

                            {/* Weekly Report */}
                            <div className="flex items-center justify-between">
                                <div className="flex items-start gap-4 pr-4">
                                    <div className="p-2.5 bg-gray-50 dark:bg-gray-800 rounded-xl text-gray-600 dark:text-gray-300">
                                        <BarChart size={20} />
                                    </div>
                                    <div>
                                        <span className="block font-semibold text-gray-900 dark:text-white text-sm">Weekly Performance Report</span>
                                        <span className="text-xs text-gray-500 mt-1 block">A comprehensive summary of your accuracy, speed, and syllabus coverage.</span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <select className="hidden md:block bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-2 py-1 text-xs outline-none text-gray-600 dark:text-gray-300 transition-shadow">
                                        <option>Sundays</option>
                                        <option>Mondays</option>
                                    </select>
                                    <Switch
                                        checked={alerts.weeklyReport}
                                        onCheckedChange={() => setAlerts(p => ({ ...p, weeklyReport: !p.weeklyReport }))}
                                        className="data-[state=checked]:bg-blue-600"
                                    />
                                </div>
                            </div>

                            {/* AI Insight Alerts */}
                            <div className="flex items-center justify-between">
                                <div className="flex items-start gap-4 pr-4">
                                    <div className="p-2.5 bg-blue-50 dark:bg-blue-500/10 rounded-xl text-blue-600 dark:text-blue-400">
                                        <Sparkles size={20} />
                                    </div>
                                    <div>
                                        <span className="block font-semibold text-gray-900 dark:text-white text-sm">AI Insight Alerts</span>
                                        <span className="text-xs text-gray-500 mt-1 block">The AI Tutor notices a repeated mistake pattern and proactively alerts you.</span>
                                    </div>
                                </div>
                                <Switch
                                    checked={alerts.aiInsights}
                                    onCheckedChange={() => setAlerts(p => ({ ...p, aiInsights: !p.aiInsights }))}
                                    className="data-[state=checked]:bg-blue-600"
                                />
                            </div>

                            {/* Subscription Alerts */}
                            <div className="flex items-center justify-between">
                                <div className="flex items-start gap-4 pr-4">
                                    <div className="p-2.5 bg-gray-50 dark:bg-gray-800 rounded-xl text-gray-600 dark:text-gray-300">
                                        <CreditCard size={20} />
                                    </div>
                                    <div>
                                        <span className="block font-semibold text-gray-900 dark:text-white text-sm">Billing & Plan Updates</span>
                                        <span className="text-xs text-gray-500 mt-1 block">Invoices, payment failures, and plan changes. (Critical alerts always sent).</span>
                                    </div>
                                </div>
                                <Switch
                                    checked={alerts.subscription}
                                    onCheckedChange={() => setAlerts(p => ({ ...p, subscription: !p.subscription }))}
                                    className="data-[state=checked]:bg-blue-600"
                                />
                            </div>
                        </div>

                        <div className="mt-8 pt-6 border-t border-gray-100 dark:border-gray-700 flex justify-end">
                            <Button className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl px-6 min-w-[140px] shadow-md shadow-blue-500/20">
                                Save Preferences
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

