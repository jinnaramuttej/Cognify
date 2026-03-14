'use client';

import {
    Link2, CheckCircle2, PlusCircle, Server,
    KeyRound, Copy, Eye, CopyCheck
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState } from 'react';

// Simple mock icons for external services
const GoogleDriveIcon = () => (
    <svg className="w-6 h-6" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M16 10L6 28L11 36L26 10H16Z" fill="#119e60" />
        <path d="M26 10L16 28L21 36L36 10H26Z" fill="#0066da" />
        <path d="M36 10L26 28L31 36L46 10H36Z" fill="#e8ab00" />
    </svg>
);

const NotionIcon = () => (
    <svg className="w-5 h-5 text-gray-900 dark:text-white" viewBox="0 0 24 24" fill="currentColor">
        <path d="M4.459 4.208c.746.06.906.27.906.843v13.52c0 .542-.16.782-.906.843v2.883h6.632v-2.883c-.745-.06-.905-.27-.905-.843V7.228l8.324 10.957h2.08V5.308c0-.573.16-.783.906-.843V1.583h-6.435v2.882c.746.06.906.27.906.844v10.134L6.96 4.043H4.46v.165z" />
    </svg>
);

export default function ConnectedServicesSection() {
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <Link2 className="text-purple-500" size={24} /> Connected Services
                </h2>
                <p className="text-sm text-gray-500">Manage external integrations and developer API keys.</p>
            </div>

            <div className="space-y-6">
                {/* Integrations */}
                <div className="bg-white dark:bg-gray-900 backdrop-blur-md border border-gray-200 dark:border-gray-700 rounded-3xl overflow-hidden shadow-sm">
                    <div className="p-6">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                            <Server className="text-purple-500" size={20} /> App Integrations
                        </h3>

                        <div className="space-y-4">
                            {/* Google Drive */}
                            <div className="flex flex-col md:flex-row md:items-center justify-between p-5 rounded-2xl border border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800 gap-4">
                                <div className="flex items-start gap-4">
                                    <div className="p-3 bg-white dark:bg-white/10 rounded-xl shadow-sm flex items-center justify-center shrink-0">
                                        <GoogleDriveIcon />
                                    </div>
                                    <div>
                                        <span className="flex items-center gap-2 font-semibold text-gray-900 dark:text-white text-sm">
                                            Google Drive
                                            <span className="bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400 text-[10px] px-2 py-0.5 rounded-full flex items-center gap-1">
                                                <CheckCircle2 size={10} /> Connected
                                            </span>
                                        </span>
                                        <span className="text-xs text-gray-500 mt-1 block max-w-sm">Automatically syncs downloaded test reports and study plans to your designated Cognify folder.</span>
                                    </div>
                                </div>
                                <Button variant="outline" size="sm" className="shrink-0 text-gray-500">Disconnect</Button>
                            </div>

                            {/* Notion */}
                            <div className="flex flex-col md:flex-row md:items-center justify-between p-5 rounded-2xl border border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800 gap-4">
                                <div className="flex items-start gap-4">
                                    <div className="p-3 bg-white dark:bg-white/10 rounded-xl shadow-sm flex items-center justify-center shrink-0">
                                        <NotionIcon />
                                    </div>
                                    <div>
                                        <span className="block font-semibold text-gray-900 dark:text-white text-sm">
                                            Notion Workspace
                                        </span>
                                        <span className="text-xs text-gray-500 mt-1 block max-w-sm">Export flagged questions and AI explanations directly to Notion databases.</span>
                                    </div>
                                </div>
                                <Button variant="default" size="sm" className="shrink-0 bg-gray-900 hover:bg-gray-800 dark:bg-white dark:text-gray-900 dark:hover:bg-gray-200">
                                    <PlusCircle size={16} className="mr-1.5" /> Connect Notion
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Developer API */}
                <div className="bg-white dark:bg-gray-900 backdrop-blur-md border border-gray-200 dark:border-gray-700 rounded-3xl overflow-hidden shadow-sm">
                    <div className="p-6">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                            <KeyRound className="text-purple-500" size={20} /> Developer API
                        </h3>
                        <p className="text-sm text-gray-500 mb-6">Use these keys to access your Cognify data via our REST API. Keep them secret.</p>

                        <div className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-xs font-semibold text-gray-600 dark:text-gray-400">Personal Access Token</label>
                                <div className="flex gap-2">
                                    <div className="relative flex-1">
                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"><KeyRound size={16} /></span>
                                        <input
                                            type="password"
                                            readOnly
                                            value="cg_live_8f92bd98a12c4e56b..."
                                            className="w-full bg-gray-50 dark:bg-[#15171c] border border-gray-200 dark:border-gray-700 rounded-xl pl-10 pr-10 py-2.5 text-sm font-mono text-gray-900 dark:text-gray-300 outline-none"
                                        />
                                        <button className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:hover:text-white">
                                            <Eye size={16} />
                                        </button>
                                    </div>
                                    <Button onClick={handleCopy} variant="outline" className="shrink-0 px-3 rounded-xl border-gray-200 dark:border-gray-700">
                                        {copied ? <CopyCheck size={18} className="text-green-500" /> : <Copy size={18} />}
                                    </Button>
                                </div>
                            </div>

                            <div className="pt-2">
                                <Button variant="outline" className="text-red-500 hover:text-red-600 hover:bg-red-50 border-red-200 dark:border-red-500/20 dark:hover:bg-red-500/10 rounded-xl">
                                    Revoke Token
                                </Button>
                                <p className="text-xs text-gray-500 mt-2">Revoking this token will immediately break any apps using it.</p>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}

