'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    LayoutDashboard,
    Bot,
    Plus,
    Trophy,
    User,
    BookOpen,
    FileText,
    Zap,
    MessageSquare,
    X
} from 'lucide-react';
import { Drawer, DrawerContent, DrawerTrigger, DrawerClose } from '@/components/ui/drawer';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';

const navItems = [
    { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },

    { label: 'Quick Action', href: '#', icon: Plus, isAction: true },
    { label: 'Leaderboard', href: '/leaderboard', icon: Trophy },
    { label: 'Profile', href: '/settings', icon: User },
];

export function BottomNav() {
    const pathname = usePathname();
    const { isAuthenticated } = useAuth();

    if (!isAuthenticated) return null;

    return (
        <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-[var(--background)]/95 backdrop-blur-lg border-t border-[var(--border)] pb-safe shadow-[0_-4px_16px_rgba(0,0,0,0.1)]">
            <div className="flex justify-around items-end h-16 px-2">
                {navItems.map((item, index) => {
                    const isActive = pathname === item.href;
                    const Icon = item.icon;

                    if (item.isAction) {
                        return (
                            <Drawer key={index}>
                                <DrawerTrigger asChild>
                                    <button
                                        className="relative -top-4 flex flex-col items-center justify-center"
                                        aria-label="Quick Actions"
                                    >
                                        <div className="w-14 h-14 bg-[var(--primary)] text-black rounded-full flex items-center justify-center shadow-lg active:scale-95 transition-transform border-4 border-[var(--background)]">
                                            <Plus size={28} strokeWidth={3} />
                                        </div>
                                        <span className="text-[10px] font-medium text-[var(--muted-foreground)] mt-1">Actions</span>
                                    </button>
                                </DrawerTrigger>
                                <DrawerContent className="bg-[var(--card)] border-[var(--border)] text-[var(--foreground)]">
                                    <div className="mx-auto w-12 h-1.5 rounded-full bg-[var(--muted)] my-4" />
                                    <div className="px-6 pb-12 pt-4 space-y-4">
                                        <h2 className="text-xl font-bold mb-6 text-center">Quick Actions</h2>
                                        <div className="grid grid-cols-2 gap-4">
                                            <QuickActionItem
                                                icon={BookOpen}
                                                label="Start Studying"
                                                href="/dashboard"
                                                color="bg-blue-500/10 text-blue-500"
                                            />
                                            <QuickActionItem
                                                icon={FileText}
                                                label="Convert Notes"
                                                href="/dashboard"
                                                color="bg-amber-500/10 text-amber-500"
                                            />
                                            <QuickActionItem
                                                icon={Zap}
                                                label="Take Test"
                                                href="/tests"
                                                color="bg-purple-500/10 text-purple-500"
                                            />

                                        </div>
                                        <DrawerClose asChild>
                                            <Button variant="ghost" className="w-full mt-6 text-[var(--muted-foreground)]">
                                                Cancel
                                            </Button>
                                        </DrawerClose>
                                    </div>
                                </DrawerContent>
                            </Drawer>
                        );
                    }

                    return (
                        <Link
                            key={index}
                            href={item.href}
                            className={`flex flex-col items-center justify-center w-full py-2 transition-colors ${isActive ? 'text-[var(--primary)]' : 'text-[var(--muted-foreground)]'
                                }`}
                        >
                            <Icon
                                size={22}
                                strokeWidth={isActive ? 2.5 : 2}
                                className={isActive ? 'drop-shadow-[0_0_8px_rgba(59,130,246,0.4)]' : ''}
                            />
                            <span className={`text-[10px] mt-1 font-medium ${isActive ? 'opacity-100' : 'opacity-70'}`}>
                                {item.label}
                            </span>
                        </Link>
                    );
                })}
            </div>
        </div>
    );
}

function QuickActionItem({ icon: Icon, label, href, color }: { icon: any, label: string, href: string, color: string }) {
    return (
        <Link
            href={href}
            className={`flex flex-col items-center justify-center p-6 rounded-2xl border border-[var(--border)] active:scale-95 transition-all hover:border-[var(--primary)]/40 ${color.split(' ')[0]}`}
        >
            <div className={`p-3 rounded-full mb-3 ${color}`}>
                <Icon size={24} />
            </div>
            <span className="text-xs font-bold text-center leading-tight">{label}</span>
        </Link>
    );
}
