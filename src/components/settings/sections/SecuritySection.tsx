'use client';

import {
    KeyRound, Smartphone, Monitor, History,
    Trash2, Mail, ShieldAlert, CheckCircle2
} from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function SecuritySection() {
    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Security</h2>
                <p className="text-sm text-gray-500">Protect your account and review active sessions.</p>
            </div>

            <div className="space-y-6">
                {/* Authentication Box */}
                <div className="bg-white dark:bg-gray-900 backdrop-blur-md border border-gray-200 dark:border-gray-700 rounded-3xl overflow-hidden shadow-sm">
                    <div className="p-6">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">Authentication</h3>
                        <p className="text-sm text-gray-500 mb-6">Manage how you sign in to Cognify.</p>

                        <div className="space-y-4">
                            {/* Password */}
                            <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700">
                                <div className="flex items-start gap-4">
                                    <div className="p-2.5 bg-gray-100 dark:bg-white/10 rounded-xl shadow-sm text-gray-600 dark:text-gray-300">
                                        <KeyRound size={20} />
                                    </div>
                                    <div>
                                        <span className="block font-semibold text-gray-900 dark:text-white text-sm">Password</span>
                                        <span className="text-xs text-gray-500 mt-0.5 block">Last changed 3 months ago</span>
                                    </div>
                                </div>
                                <Button variant="outline" size="sm" className="rounded-xl">Update</Button>
                            </div>

                            {/* 2FA */}
                            <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700">
                                <div className="flex items-start gap-4">
                                    <div className="p-2.5 bg-gray-100 dark:bg-white/10 rounded-xl shadow-sm text-gray-600 dark:text-gray-300">
                                        <Smartphone size={20} />
                                    </div>
                                    <div>
                                        <span className="flex items-center gap-2 font-semibold text-gray-900 dark:text-white text-sm">
                                            Two-Factor Authentication
                                            <span className="bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400 text-[10px] px-2 py-0.5 rounded-full flex items-center gap-1">
                                                <CheckCircle2 size={10} /> Enabled
                                            </span>
                                        </span>
                                        <span className="text-xs text-gray-500 mt-0.5 block">Authenticator App configured</span>
                                    </div>
                                </div>
                                <Button variant="outline" size="sm" className="rounded-xl">Manage</Button>
                            </div>

                            {/* Recovery Email */}
                            <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700">
                                <div className="flex items-start gap-4">
                                    <div className="p-2.5 bg-gray-100 dark:bg-white/10 rounded-xl shadow-sm text-gray-600 dark:text-gray-300">
                                        <Mail size={20} />
                                    </div>
                                    <div>
                                        <span className="block font-semibold text-gray-900 dark:text-white text-sm">Recovery Email</span>
                                        <span className="text-xs text-gray-500 mt-0.5 block">ut***@gmail.com</span>
                                    </div>
                                </div>
                                <Button variant="outline" size="sm" className="rounded-xl">Review</Button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Sessions Box */}
                <div className="bg-white dark:bg-gray-900 backdrop-blur-md border border-gray-200 dark:border-gray-700 rounded-3xl overflow-hidden shadow-sm">
                    <div className="p-6">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">Active Sessions</h3>
                        <p className="text-sm text-gray-500 mb-6">You're currently logged in on these devices. If you don't recognize a device, log out immediately.</p>

                        <div className="space-y-4">
                            {/* Current Device */}
                            <div className="flex items-center justify-between p-4 bg-blue-50/50 dark:bg-blue-500/5 rounded-2xl border border-blue-100 dark:border-blue-500/10">
                                <div className="flex items-start gap-4">
                                    <div className="p-2.5 bg-blue-100 dark:bg-blue-500/20 rounded-xl text-blue-600 dark:text-blue-400">
                                        <Monitor size={20} />
                                    </div>
                                    <div>
                                        <span className="flex items-center gap-2 font-semibold text-gray-900 dark:text-white text-sm">
                                            Windows PC - Chrome
                                            <span className="bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400 text-[10px] px-2 py-0.5 rounded-full">Current</span>
                                        </span>
                                        <span className="text-xs text-gray-500 mt-0.5 block">Hyderabad, India • Active now</span>
                                    </div>
                                </div>
                            </div>

                            {/* Other Device */}
                            <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700">
                                <div className="flex items-start gap-4">
                                    <div className="p-2.5 bg-gray-100 dark:bg-white/10 rounded-xl shadow-sm text-gray-600 dark:text-gray-300">
                                        <Smartphone size={20} />
                                    </div>
                                    <div>
                                        <span className="font-semibold text-gray-900 dark:text-white text-sm block">iPhone 14 Pro - Safari</span>
                                        <span className="text-xs text-gray-500 mt-0.5 block">Hyderabad, India • Active 2 days ago</span>
                                    </div>
                                </div>
                                <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-xl text-xs">
                                    Log Out
                                </Button>
                            </div>
                        </div>

                        <div className="mt-4 flex justify-end">
                            <Button variant="ghost" size="sm" className="text-gray-500 text-xs flex items-center gap-1.5 hover:text-gray-900 dark:hover:text-white">
                                <History size={14} /> View Login History
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Danger Zone */}
                <div className="bg-white dark:bg-gray-900 backdrop-blur-md border border-red-200 dark:border-red-500/20 rounded-3xl overflow-hidden shadow-sm relative">
                    <div className="absolute top-0 left-0 w-1 h-full bg-red-500"></div>
                    <div className="p-6 pl-8">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                            <ShieldAlert className="text-red-500 w-5 h-5" /> Danger Zone
                        </h3>

                        <div className="flex flex-col md:flex-row md:items-center justify-between mt-6 gap-4">
                            <div>
                                <span className="block font-semibold text-gray-900 dark:text-white text-sm">Delete Account</span>
                                <span className="text-sm text-gray-500 mt-1 block max-w-md">Once you delete your account, there is no going back. Please be certain.</span>
                            </div>
                            <Button variant="destructive" className="rounded-xl px-6 bg-red-500 hover:bg-red-600 shadow-sm shrink-0">
                                <Trash2 size={16} className="mr-2" /> Delete Account
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

