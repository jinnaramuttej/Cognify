'use client';

import { useState } from 'react';
import { Camera, Save, X, User as UserIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';

export default function ProfileSection() {
    const [isSaving, setIsSaving] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);

    const handleSave = () => {
        setIsSaving(true);
        setTimeout(() => {
            setIsSaving(false);
            setShowSuccess(true);
            setTimeout(() => setShowSuccess(false), 3000);
        }, 800);
    };

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Profile</h2>
                <p className="text-sm text-gray-500">Manage your public identity and personal details.</p>
            </div>

            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-3xl p-6 shadow-sm">
                <div className="flex flex-col md:flex-row gap-8">
                    {/* Left: Avatar Upload */}
                    <div className="flex flex-col items-center gap-4">
                        <div className="relative group cursor-pointer transition-transform hover:scale-105 active:scale-95 duration-200">
                            <div className="w-28 h-28 rounded-full border-[6px] border-gray-50 dark:border-gray-700 bg-gray-100 dark:bg-gray-800 flex items-center justify-center overflow-hidden shadow-inner">
                                <UserIcon size={48} className="text-gray-400 dark:text-gray-500" />
                            </div>
                            <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                <Camera className="text-white w-6 h-6" />
                            </div>
                        </div>
                        <Button variant="outline" size="sm" className="w-full text-xs rounded-xl h-8 border-gray-200 dark:border-gray-700 shadow-sm mb-2">
                            Upload new photo
                        </Button>
                        <p className="text-[10px] text-gray-400 text-center px-2">
                            Square image, at least 400x400px recommended.
                        </p>
                    </div>

                    {/* Right: Form Fields */}
                    <div className="flex-1 space-y-5">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div className="space-y-1.5">
                                <label className="text-xs font-semibold tracking-wide text-gray-600 dark:text-gray-400 uppercase">Full Name</label>
                                <input type="text" defaultValue="Jinnaram Uttej" className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-2.5 text-sm text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all" />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-xs font-semibold tracking-wide text-gray-600 dark:text-gray-400 uppercase">Username</label>
                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">@</span>
                                    <input type="text" defaultValue="uttej_j" className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl pl-7 pr-4 py-2.5 text-sm text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all" />
                                </div>
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-xs font-semibold tracking-wide text-gray-600 dark:text-gray-400 uppercase">Email</label>
                                <input type="email" defaultValue="uttej@cognify.com" disabled className="w-full bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-2.5 text-sm text-gray-500 dark:text-gray-400 cursor-not-allowed" />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-xs font-semibold tracking-wide text-gray-600 dark:text-gray-400 uppercase">Phone (Optional)</label>
                                <input type="tel" placeholder="+91" className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-2.5 text-sm text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all" />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-xs font-semibold tracking-wide text-gray-600 dark:text-gray-400 uppercase">Institution</label>
                                <input type="text" placeholder="School or College" className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-2.5 text-sm text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all" />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-xs font-semibold tracking-wide text-gray-600 dark:text-gray-400 uppercase">Grade Level</label>
                                <select className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-2.5 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none appearance-none cursor-pointer">
                                    <option>Class 11</option>
                                    <option>Class 12</option>
                                    <option>Dropper</option>
                                </select>
                            </div>
                        </div>

                        <div className="space-y-1.5 mt-2">
                            <label className="text-xs font-semibold tracking-wide text-gray-600 dark:text-gray-400 uppercase">Bio</label>
                            <textarea rows={3} placeholder="Write a short introduction..." className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-sm text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none transition-all"></textarea>
                        </div>
                    </div>
                </div>

                <div className="mt-8 pt-6 border-t border-gray-100 dark:border-gray-700 flex items-center justify-end gap-3">
                    <AnimatePresence>
                        {showSuccess && (
                            <motion.span
                                initial={{ opacity: 0, x: 10 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -10 }}
                                className="text-sm text-green-600 dark:text-green-400 font-medium mr-2"
                            >
                                Profile updated!
                            </motion.span>
                        )}
                    </AnimatePresence>
                    <Button variant="ghost" className="text-gray-500 rounded-xl hover:bg-gray-100 dark:hover:bg-white/5">
                        <X className="w-4 h-4 mr-2" /> Discard
                    </Button>
                    <Button
                        onClick={handleSave}
                        disabled={isSaving}
                        className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl px-6 min-w-[140px] shadow-md shadow-blue-500/20 transition-all"
                    >
                        {isSaving ? (
                            <span className="flex items-center gap-2">
                                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                                Saving...
                            </span>
                        ) : (
                            <><Save className="w-4 h-4 mr-2" /> Save Changes</>
                        )}
                    </Button>
                </div>
            </div>
        </div>
    );
}

