'use client';

import {
    CreditCard, Zap, BookOpen, Clock, FileText,
    CheckCircle2, ArrowRight, ShieldCheck
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';

export default function BillingSection() {
    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Subscription & Billing</h2>
                <p className="text-sm text-gray-500">Manage your active plan, view usage stats, and download invoices.</p>
            </div>

            <div className="space-y-6">
                {/* Current Plan Overview */}
                <div className="bg-gradient-to-br from-blue-600 to-blue-800 rounded-3xl overflow-hidden shadow-lg p-1 relative">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-20 -mt-20"></div>

                    <div className="bg-white/10 backdrop-blur-md rounded-[20px] p-6 relative z-10 text-white">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                            <div>
                                <div className="flex items-center gap-2 mb-2">
                                    <span className="bg-white/20 px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wider">Current Plan</span>
                                    <span className="bg-green-400 text-green-950 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
                                        <CheckCircle2 size={12} /> Active
                                    </span>
                                </div>
                                <h3 className="text-3xl font-black mb-1">Scholar Tier</h3>
                                <p className="text-blue-100 text-sm">₹1,299/month • Renews on April 12, 2026</p>
                            </div>

                            <div className="flex flex-col gap-3 shrink-0 w-full md:w-auto">
                                <Button className="bg-white text-blue-700 hover:bg-gray-50 rounded-xl px-8 shadow-sm font-semibold">
                                    Upgrade to Pro
                                </Button>
                                <Button variant="ghost" className="text-blue-100 hover:text-white hover:bg-white/10 rounded-xl">
                                    Cancel Subscription
                                </Button>
                            </div>
                        </div>

                        <div className="mt-8 pt-6 border-t border-white/20 grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Usage 1: AI Tokens */}
                            <div>
                                <div className="flex justify-between items-end mb-2">
                                    <div className="flex items-center gap-2">
                                        <Zap size={16} className="text-blue-300" />
                                        <span className="text-sm font-semibold">AI Explanations</span>
                                    </div>
                                    <span className="text-xs font-medium text-blue-200">2,450 / 5,000 used</span>
                                </div>
                                <Progress value={49} className="h-2 bg-white/20 [&>div]:bg-white" />
                                <p className="text-[10px] text-blue-200 mt-2">Resets in 11 days</p>
                            </div>

                            {/* Usage 2: Mock Tests */}
                            <div>
                                <div className="flex justify-between items-end mb-2">
                                    <div className="flex items-center gap-2">
                                        <BookOpen size={16} className="text-blue-300" />
                                        <span className="text-sm font-semibold">Premium Mock Tests</span>
                                    </div>
                                    <span className="text-xs font-medium text-blue-200">12 / 15 used</span>
                                </div>
                                <Progress value={80} className="h-2 bg-white/20 [&>div]:bg-amber-400" />
                                <p className="text-[10px] text-blue-200 mt-2">Nearing your monthly limit</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Payment Methods */}
                <div className="bg-white dark:bg-gray-900 backdrop-blur-md border border-gray-200 dark:border-gray-700 rounded-3xl overflow-hidden shadow-sm">
                    <div className="p-6">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">Payment Method</h3>
                        <p className="text-sm text-gray-500 mb-6">Securely manage your billing details.</p>

                        <div className="space-y-4">
                            <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700">
                                <div className="flex items-center gap-4">
                                    <div className="p-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm text-gray-900 dark:text-white flex items-center justify-center">
                                        <CreditCard size={24} />
                                    </div>
                                    <div>
                                        <span className="flex items-center gap-2 font-semibold text-gray-900 dark:text-white text-sm">
                                            HDFC Visa ending in 4242
                                            <span className="bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400 text-[10px] px-2 py-0.5 rounded-full">Default</span>
                                        </span>
                                        <span className="text-xs text-gray-500 mt-0.5 block">Expires 09/27</span>
                                    </div>
                                </div>
                                <Button variant="ghost" className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-500/10 rounded-xl text-sm">
                                    Edit
                                </Button>
                            </div>

                            <Button variant="outline" className="w-full rounded-xl border-dashed border-2 py-6 text-gray-500 hover:text-gray-900 dark:hover:text-white">
                                + Add new payment method
                            </Button>
                        </div>

                        <div className="mt-4 flex items-center gap-2 text-xs text-gray-500">
                            <ShieldCheck size={14} /> Payments are secure and encrypted.
                        </div>
                    </div>
                </div>

                {/* Billing History */}
                <div className="bg-white dark:bg-gray-900 backdrop-blur-md border border-gray-200 dark:border-gray-700 rounded-3xl overflow-hidden shadow-sm">
                    <div className="p-6">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Billing History</h3>

                        <div className="space-y-1">
                            {[
                                { date: 'Mar 12, 2026', amount: '₹1,299', status: 'Paid', invoice: '#INV-2026-03' },
                                { date: 'Feb 12, 2026', amount: '₹1,299', status: 'Paid', invoice: '#INV-2026-02' },
                                { date: 'Jan 12, 2026', amount: '₹1,299', status: 'Paid', invoice: '#INV-2026-01' },
                            ].map((item, i) => (
                                <div key={i} className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-white/5 transition-colors group">
                                    <div className="flex items-center gap-4">
                                        <div className="p-2 bg-gray-100 dark:bg-white/10 rounded-lg text-gray-500">
                                            <FileText size={16} />
                                        </div>
                                        <div>
                                            <p className="text-sm font-semibold text-gray-900 dark:text-white">{item.date}</p>
                                            <p className="text-xs text-gray-500">{item.amount} • {item.invoice}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <span className="text-xs font-semibold text-green-600 bg-green-50 dark:bg-green-500/10 px-2 py-1 rounded-md">
                                            {item.status}
                                        </span>
                                        <Button variant="ghost" size="icon" className="group-hover:text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <ArrowRight size={16} />
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}

