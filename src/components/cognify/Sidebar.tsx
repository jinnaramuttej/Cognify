'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useUiStore } from '../../lib/ui-store';
import { useAuth } from '@/contexts/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Trophy,
  LayoutDashboard,
  FileText,
  Bot,
  X,
  CreditCard,
  BarChart,
  BookOpen,
  Swords,
  GraduationCap,
  TrendingUp,
} from 'lucide-react';

export default function Sidebar() {
  const pathname = usePathname();
  const { user } = useAuth();
  const sidebarCollapsed = useUiStore(state => state.sidebarCollapsed);
  const mobileSidebarOpen = useUiStore(state => state.mobileSidebarOpen);
  const setMobileSidebarOpen = useUiStore(state => state.setMobileSidebarOpen);
  const [isHovered, setIsHovered] = useState(false);

  const isTeacher = user?.role === 'teacher';
  const isAdmin = user?.role === 'admin' || user?.isAdmin === true;

  // Desktop logic: expands on hover
  const effectiveCollapsed = !isHovered;

  const studentItems = [
    { href: '/dashboard', label: 'Home Dashboard', icon: LayoutDashboard },
    { href: '/tests', label: 'Tests & Mocks', icon: BarChart },
    { href: '/analytics', label: 'Analytics & Progress', icon: TrendingUp },
    { href: '/library', label: 'Syllabus Library', icon: BookOpen },
    { href: '/cogni', label: 'Cogni AI Tutor', icon: Bot },
    { href: '/notes-converter', label: 'Notes → Flashcards', icon: FileText },
    { href: '/arena', label: 'Arena & Leaderboard', icon: Swords },
  ];

  const teacherItems = [
    { href: '/teacher', label: 'Teacher Panel', icon: GraduationCap },
    { href: '/tests', label: 'Tests', icon: BarChart },
    { href: '/library', label: 'Library', icon: BookOpen },
  ];

  // Admins see everything, teachers see teacher items only, students see student items only
  const navItems = isAdmin
    ? [...studentItems, { href: '/teacher', label: 'Teacher Panel', icon: GraduationCap }]
    : isTeacher
      ? teacherItems
      : studentItems;

  return (
    <>
      {/* Mobile Overlay */}
      <AnimatePresence>
        {mobileSidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setMobileSidebarOpen(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] md:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar Container */}
      <aside
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={`fixed top-0 left-0 h-screen bg-[var(--sidebar)] text-[var(--sidebar-foreground)] border-r border-[var(--sidebar-border)] flex flex-col transition-all duration-500 ease-in-out z-[110]
          ${mobileSidebarOpen ? 'translate-x-0 w-72' : '-translate-x-full md:translate-x-0'}
          ${effectiveCollapsed ? 'md:w-20' : 'md:w-72'}
        `}
      >
        {/* Header - Mobile Only Close Button */}
        <div className="flex items-center justify-between p-4 md:hidden">
          <span className="font-bold text-xl text-[var(--primary)]">Menu</span>
          <button onClick={() => setMobileSidebarOpen(false)} className="p-2 hover:bg-[var(--sidebar-accent)] rounded-full transition-colors">
            <X size={24} />
          </button>
        </div>

        {/* Navigation Space (Desktop) — must clear fixed navbar (~64px) */}
        <div className="h-[66px] hidden md:block" />

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-3 py-2 space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileSidebarOpen(false)}
                className={`group relative flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-300 transform active:scale-95
                  ${isActive
                    ? 'bg-[var(--sidebar-accent)] text-[var(--primary)] shadow-sm shadow-blue-500/10'
                    : 'text-[var(--sidebar-foreground)] hover:bg-[var(--sidebar-accent)] hover:text-[var(--primary)]'
                  }
                `}
              >
                <div className={`flex items-center justify-center min-w-[24px] transition-transform duration-300 group-hover:scale-110 ${isActive ? 'text-[var(--primary)]' : 'opacity-70 group-hover:opacity-100'}`}>
                  <Icon size={22} strokeWidth={isActive ? 2.5 : 2} />
                </div>

                <span className={`font-medium whitespace-nowrap transition-all duration-300 ease-in-out
                  ${effectiveCollapsed ? 'md:opacity-0 md:translate-x-[-10px] md:pointer-events-none' : 'opacity-100 translate-x-0'}
                  ${mobileSidebarOpen ? 'opacity-100 translate-x-0' : ''}
                `}>
                  {item.label}
                </span>

                {/* Tooltip for collapsed state on desktop */}
                {effectiveCollapsed && (
                  <div className="absolute left-full ml-6 px-3 py-1.5 bg-slate-900 text-white text-xs font-bold rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-all duration-200 hidden md:block whitespace-nowrap shadow-xl z-[120]">
                    {item.label}
                  </div>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Footer (Optional branding/settings) */}
        {!effectiveCollapsed && (
          <div className="p-4 border-t border-[var(--sidebar-border)] hidden md:block">
            <div className="text-[10px] uppercase tracking-widest text-[var(--muted-foreground)] font-bold text-center">
              Powered by Cognify AI
            </div>
          </div>
        )}
      </aside>
    </>
  );
}
