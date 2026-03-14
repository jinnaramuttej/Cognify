'use client';

import React, { useState } from 'react';
import { Users, Code, Plus, Share2, Sparkles, CheckCircle2 } from 'lucide-react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { motion, AnimatePresence } from 'framer-motion';

// Note: Requires react-toastify or similar in real app, simulating here.
export default function SquadManagement() {
    const [activeTab, setActiveTab] = useState<'my_squads' | 'join' | 'create'>('my_squads');
    const [joinCode, setJoinCode] = useState('');
    const [newSquadName, setNewSquadName] = useState('');
    const [newSquadDesc, setNewSquadDesc] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    const supabase = createClientComponentClient();

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setMessage(null);
        try {
            const res = await fetch('/api/squads/create', {
                method: 'POST',
                body: JSON.stringify({ name: newSquadName, description: newSquadDesc })
            });
            const data = await res.json();
            if (res.ok) {
                setMessage({ type: 'success', text: `Created! Invite Code: ${data.invite_code}` });
                setNewSquadName('');
                setNewSquadDesc('');
            } else {
                setMessage({ type: 'error', text: data.error });
            }
        } catch (err) {
            setMessage({ type: 'error', text: 'Network error.' });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleJoin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setMessage(null);
        try {
            const res = await fetch('/api/squads/join', {
                method: 'POST',
                body: JSON.stringify({ inviteCode: joinCode.toUpperCase() })
            });
            const data = await res.json();
            if (res.ok) {
                setMessage({ type: 'success', text: 'Successfully joined squad!' });
                setJoinCode('');
            } else {
                setMessage({ type: 'error', text: data.error || data.message });
            }
        } catch (err) {
            setMessage({ type: 'error', text: 'Network error.' });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="w-full bg-white dark:bg-[#1a1c23] border border-gray-100 dark:border-white/5 rounded-3xl overflow-hidden shadow-xl shadow-blue-500/5">
            {/* Header Tabs */}
            <div className="flex border-b border-gray-100 dark:border-white/5">
                {[
                    { id: 'my_squads', icon: Users, label: 'My Squads' },
                    { id: 'join', icon: Code, label: 'Join via Code' },
                    { id: 'create', icon: Plus, label: 'Create Squad' }
                ].map(tab => {
                    const isActive = activeTab === tab.id;
                    return (
                        <button
                            key={tab.id}
                            onClick={() => { setActiveTab(tab.id as any); setMessage(null); }}
                            className={`flex-1 py-4 px-2 flex items-center justify-center gap-2 text-sm font-semibold transition-colors relative ${isActive ? 'text-blue-600 dark:text-blue-400' : 'text-gray-500 hover:text-gray-800 dark:hover:text-gray-200'
                                }`}
                        >
                            <tab.icon size={16} />
                            <span className="hidden sm:inline">{tab.label}</span>
                            {isActive && (
                                <motion.div layoutId="squadTabUnderline" className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500" />
                            )}
                        </button>
                    )
                })}
            </div>

            {/* Content Area */}
            <div className="p-6 md:p-8 min-h-[300px] relative">
                <AnimatePresence mode="wait">

                    {/* Messages */}
                    {message && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                            className={`mb-6 p-4 rounded-xl flex items-start gap-3 text-sm font-medium ${message.type === 'success' ? 'bg-green-50 text-green-800 dark:bg-green-500/10 dark:text-green-400' : 'bg-red-50 text-red-800 dark:bg-red-500/10 dark:text-red-400'
                                }`}
                        >
                            {message.type === 'success' ? <CheckCircle2 size={18} className="mt-0.5" /> : null}
                            {message.text}
                        </motion.div>
                    )}

                    {activeTab === 'my_squads' && (
                        <motion.div key="my_squads" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center justify-center py-10 text-center space-y-4">
                            <div className="w-16 h-16 bg-blue-50 dark:bg-blue-900/20 rounded-full flex items-center justify-center text-blue-500">
                                <Users size={32} />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-gray-900 dark:text-white">Your Squads</h3>
                                <p className="text-sm text-gray-500 max-w-sm mt-1">You aren't part of any squads yet. Join a friend's squad or create your own to start competing!</p>
                            </div>
                            <div className="flex gap-4 pt-4">
                                <button onClick={() => setActiveTab('join')} className="px-5 py-2 rounded-full border border-gray-200 dark:border-white/10 text-sm font-bold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                                    Join Squad
                                </button>
                                <button onClick={() => setActiveTab('create')} className="px-5 py-2 rounded-full bg-blue-600 text-white text-sm font-bold shadow-md shadow-blue-500/30 hover:bg-blue-700 transition-colors">
                                    Create Squad
                                </button>
                            </div>
                        </motion.div>
                    )}

                    {activeTab === 'join' && (
                        <motion.form key="join" onSubmit={handleJoin} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="max-w-sm mx-auto space-y-6">
                            <div className="text-center mb-8">
                                <h3 className="text-xl font-black text-gray-900 dark:text-white">Join the Arena</h3>
                                <p className="text-sm text-gray-500 mt-1">Enter a 6-character invite code.</p>
                            </div>
                            <div>
                                <input
                                    type="text"
                                    maxLength={6}
                                    value={joinCode}
                                    onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                                    placeholder="e.g. X7B9K2"
                                    className="w-full text-center text-3xl font-black tracking-[0.5em] uppercase bg-gray-50 dark:bg-black/20 border-2 border-gray-200 dark:border-white/10 rounded-2xl py-6 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 transition-all text-gray-900 dark:text-white"
                                />
                            </div>
                            <button
                                disabled={isSubmitting || joinCode.length < 6}
                                type="submit"
                                className="w-full flex items-center justify-center gap-2 py-4 rounded-xl font-bold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                {isSubmitting ? 'Joining...' : 'Admit Me'}
                            </button>
                        </motion.form>
                    )}

                    {activeTab === 'create' && (
                        <motion.form key="create" onSubmit={handleCreate} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="max-w-md mx-auto space-y-6">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Squad Name</label>
                                <input
                                    type="text"
                                    required
                                    value={newSquadName}
                                    onChange={(e) => setNewSquadName(e.target.value)}
                                    placeholder="e.g. JEE Toppers 2025"
                                    className="w-full bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 text-gray-900 dark:text-white font-medium"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Motto / Description (Optional)</label>
                                <textarea
                                    rows={3}
                                    value={newSquadDesc}
                                    onChange={(e) => setNewSquadDesc(e.target.value)}
                                    placeholder="What unites your squad?"
                                    className="w-full bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 text-gray-900 dark:text-white text-sm"
                                />
                            </div>
                            <button
                                disabled={isSubmitting || !newSquadName.trim()}
                                type="submit"
                                className="w-full flex items-center justify-center gap-2 py-4 rounded-xl font-bold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 transition-all shadow-lg shadow-blue-500/25"
                            >
                                <Sparkles size={18} />
                                {isSubmitting ? 'Forging Squad...' : 'Forge Squad'}
                            </button>
                        </motion.form>
                    )}

                </AnimatePresence>
            </div>
        </div>
    );
}
