'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  BookOpen,
  FileText,
  Users,
  BarChart3,
  Upload,
  X,
  GraduationCap,
} from 'lucide-react';
import { useUiStore } from '@/lib/ui-store';

const navItems = [
  { href: '/teacher', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/teacher/questions', label: 'Question Bank', icon: BookOpen },
  { href: '/teacher/tests', label: 'Test Builder', icon: FileText },
  { href: '/teacher/batches', label: 'Batches', icon: Users },
  { href: '/teacher/analytics', label: 'Analytics', icon: BarChart3 },
  { href: '/teacher/upload', label: 'Upload Questions', icon: Upload },
];

export default function TeacherSidebar() {
  const pathname = usePathname();
  const mobileSidebarOpen = useUiStore((state) => state.mobileSidebarOpen);
  const setMobileSidebarOpen = useUiStore((state) => state.setMobileSidebarOpen);
  const [isHovered, setIsHovered] = useState(false);

  const effectiveCollapsed = !isHovered;

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

      {/* Sidebar */}
      <aside
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={`fixed md:sticky top-0 left-0 h-screen bg-[var(--sidebar)] text-[var(--sidebar-foreground)] border-r border-[var(--sidebar-border)] flex flex-col transition-all duration-500 ease-in-out z-[110]
          ${mobileSidebarOpen ? 'translate-x-0 w-72' : '-translate-x-full md:translate-x-0'}
          ${effectiveCollapsed ? 'md:w-20' : 'md:w-72'}
        `}
      >
        {/* Mobile Close */}
        <div className="flex items-center justify-between p-4 md:hidden">
          <span className="font-bold text-xl text-[var(--primary)]">Teacher</span>
          <button
            onClick={() => setMobileSidebarOpen(false)}
            className="p-2 hover:bg-[var(--sidebar-accent)] rounded-full transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Desktop Header */}
        <div className="hidden md:flex items-center gap-3 p-4 pt-6">
          <div className="flex items-center justify-center min-w-[24px]">
            <GraduationCap size={22} className="text-[var(--primary)]" />
          </div>
          <span
            className={`font-bold text-lg text-[var(--primary)] whitespace-nowrap transition-all duration-300 ${
              effectiveCollapsed
                ? 'opacity-0 translate-x-[-10px] pointer-events-none'
                : 'opacity-100 translate-x-0'
            }`}
          >
            Teacher Panel
          </span>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto px-3 py-2 space-y-1">
          {navItems.map((item) => {
            const isActive =
              item.href === '/teacher'
                ? pathname === '/teacher'
                : pathname.startsWith(item.href);
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileSidebarOpen(false)}
                className={`group relative flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-300 transform active:scale-95
                  ${
                    isActive
                      ? 'bg-[var(--sidebar-accent)] text-[var(--primary)] shadow-sm shadow-blue-500/10'
                      : 'text-[var(--sidebar-foreground)] hover:bg-[var(--sidebar-accent)] hover:text-[var(--primary)]'
                  }
                `}
              >
                <div
                  className={`flex items-center justify-center min-w-[24px] transition-transform duration-300 group-hover:scale-110 ${
                    isActive ? 'text-[var(--primary)]' : 'opacity-70 group-hover:opacity-100'
                  }`}
                >
                  <Icon size={22} strokeWidth={isActive ? 2.5 : 2} />
                </div>

                <span
                  className={`font-medium whitespace-nowrap transition-all duration-300 ease-in-out
                    ${
                      effectiveCollapsed
                        ? 'md:opacity-0 md:translate-x-[-10px] md:pointer-events-none'
                        : 'opacity-100 translate-x-0'
                    }
                    ${mobileSidebarOpen ? 'opacity-100 translate-x-0' : ''}
                  `}
                >
                  {item.label}
                </span>

                {/* Tooltip on collapsed */}
                {effectiveCollapsed && (
                  <div className="absolute left-full ml-6 px-3 py-1.5 bg-slate-900 text-white text-xs font-bold rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-all duration-200 hidden md:block whitespace-nowrap shadow-xl z-[120]">
                    {item.label}
                  </div>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Back to Student Dashboard link */}
        {!effectiveCollapsed && (
          <div className="p-4 border-t border-[var(--sidebar-border)] hidden md:block">
            <Link
              href="/dashboard"
              className="text-xs text-[var(--muted-foreground)] hover:text-[var(--primary)] transition-colors block text-center"
            >
              ← Back to Student View
            </Link>
          </div>
        )}
      </aside>
    </>
  );
}
