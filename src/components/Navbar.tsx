'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  User,
  LogOut,
  Settings,
  Shield,
  Layers as LayersIcon,
  TrendingUp,
  Moon,
  Sun,
  Home,
  Menu,
  GraduationCap,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useAppStore } from '@/lib/store';
import { useThemeStore } from '@/lib/theme-store';
import { useUiStore } from '@/lib/ui-store';

interface NavbarProps {
  currentPath?: string;
}

export default function Navbar({ currentPath = '/' }: NavbarProps) {
  const router = useRouter();
  const { user, isAuthenticated, logout } = useAuth();
  const { streak } = useAppStore();
  const { mode, toggleTheme } = useThemeStore();
  const setMobileSidebarOpen = useUiStore(state => state.setMobileSidebarOpen);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleLogout = async () => {
    await logout();
  };

  // Determine user role
  const userRole = user?.role || 'student';
  const isTeacher = userRole === 'teacher';
  const isAdmin = userRole === 'admin' || user?.isAdmin === true;
  const isStudent = userRole === 'student' && !isAdmin;

  // Show dashboard link only for students and admins (but not pure teachers)
  const showDashboard = isAuthenticated && !isTeacher;
  // Show teacher panel link for teachers and admins
  const showTeacherPanel = isAuthenticated && (isTeacher || isAdmin);

  return (
    <nav className="sticky top-0 z-[120] bg-background/95 backdrop-blur-sm border-b border-blue-500/20">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {/* Mobile Menu Toggle */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden text-foreground hover:bg-blue-500/10 rounded-full"
              onClick={() => setMobileSidebarOpen(true)}
              aria-label="Open menu"
            >
              <Menu size={24} />
            </Button>

            {/* Logo */}
            <Link
              href="/"
              className="flex items-center gap-2 hover:opacity-80 transition-opacity"
            >
              <span className="text-lg font-bold text-foreground">Cognify</span>
            </Link>
          </div>

          {/* Right Section */}
          <div className="flex items-center gap-2 md:gap-4">
            {/* 1. Home Link */}
            <Link
              href="/"
              className={`p-2 rounded-full transition-colors flex ${currentPath === '/' ? 'bg-blue-500/20 text-blue-600 dark:text-blue-400' : 'text-muted-foreground hover:text-blue-500 hover:bg-blue-500/10'
                }`}
              title="Home"
            >
              <Home size={20} />
            </Link>

            {/* 2. Dashboard Link (Students & Admins Only) */}
            {showDashboard && (
              <Link
                href="/dashboard"
                className={`p-2 rounded-full transition-colors flex ${currentPath === '/dashboard' ? 'bg-blue-500/20 text-blue-600 dark:text-blue-400' : 'text-muted-foreground hover:text-blue-500 hover:bg-blue-500/10'
                  }`}
                title="Dashboard"
              >
                <LayersIcon size={20} />
              </Link>
            )}

            {/* 2b. Teacher Panel Link (Teachers & Admins Only) */}
            {showTeacherPanel && (
              <Link
                href="/teacher"
                className={`p-2 rounded-full transition-colors flex ${currentPath === '/teacher' || currentPath?.startsWith('/teacher/') ? 'bg-blue-500/20 text-blue-600 dark:text-blue-400' : 'text-muted-foreground hover:text-blue-500 hover:bg-blue-500/10'
                  }`}
                title="Teacher Panel"
              >
                <GraduationCap size={20} />
              </Link>
            )}

            {/* 3. Streak Indicator (Students Only) */}
            {isAuthenticated && isStudent && (
              <Dialog>
                <DialogTrigger asChild>
                  <Button
                    variant="ghost"
                    className="relative flex items-center gap-1.5 px-3 bg-blue-500/10 border border-blue-500/20 rounded-full hover:bg-blue-500/20 transition-all group shrink-0 h-10"
                    title={streak === 0 ? 'Start your streak' : `Current streak: ${streak} days`}
                  >
                    <span className="text-xl group-hover:scale-125 transition-transform">🔥</span>
                    <span className="font-bold text-blue-600 dark:text-blue-400">{streak}</span>
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-[var(--background)] border-blue-500/30 text-[var(--foreground)] max-w-[90vw] rounded-2xl">
                  <DialogHeader>
                    <DialogTitle className="text-blue-500 flex items-center gap-2 text-2xl">
                      <TrendingUp size={24} />
                      Your Study Streak
                    </DialogTitle>
                  </DialogHeader>
                  <div className="py-6 space-y-8">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-6 bg-blue-500/5 rounded-2xl border border-blue-500/10 text-center">
                        <p className="text-sm text-[var(--muted-foreground)] mb-1">Current Streak</p>
                        <p className="text-4xl font-bold text-blue-500">{streak} Days</p>
                      </div>
                      <div className="p-6 bg-gray-500/5 rounded-2xl border border-gray-500/10 text-center">
                        <p className="text-sm text-[var(--muted-foreground)] mb-1">Longest Streak</p>
                        <p className="text-4xl font-bold text-[var(--foreground)]">{user?.longest_streak || streak} Days</p>
                      </div>
                    </div>

                    <div className="p-4 bg-blue-500/10 rounded-xl border border-blue-500/20">
                      <p className="text-sm font-medium text-blue-500 flex items-center gap-2">
                        <span className="text-lg">💡</span>
                        Rule: Study at least 20 minutes in a day to maintain your streak
                      </p>
                    </div>

                    <div className="text-center">
                      <p className="text-sm text-[var(--muted-foreground)]">
                        Consistency is the key to mastering your Class {user?.class || '11/12'} syllabus.
                      </p>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            )}

            {/* 4. Theme Toggle */}
            {mounted && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => toggleTheme()}
                className="text-[#a0a0a0] hover:text-blue-500 hover:bg-blue-500/10 rounded-full"
                title={`Switch to ${mode === 'dark' ? 'light' : 'dark'} mode`}
              >
                {mode === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
              </Button>
            )}

            {/* 6. Auth Actions (Only when NOT logged in) */}
            {!isAuthenticated && (
              <>
                <Link
                  href="/auth/login"
                  className="hidden md:block px-4 py-2 text-sm font-medium text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors"
                >
                  Log In
                </Link>
                <Link href="/auth/signup">
                  <Button
                    size="sm"
                    className="bg-[var(--primary)] text-[var(--primary-foreground)] hover:bg-[var(--primary)]/90 font-medium px-4 rounded-full h-9 shadow-sm shadow-[var(--primary)]/20"
                  >
                    Get Started
                  </Button>
                </Link>
              </>
            )}

            {/* 5. Profile Dropdown */}
            {isAuthenticated && user && (
              <div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="relative hover:bg-blue-500/10 rounded-full border border-blue-500/20 overflow-hidden w-10 h-10">
                      {user.avatar_url ? (
                        <img
                          src={user.avatar_url}
                          alt={user.full_name || 'User'}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = ''; // Fallback if load fails
                            (e.target as HTMLImageElement).style.display = 'none';
                            (e.target as HTMLImageElement).parentElement?.querySelector('.fallback-icon')?.classList.remove('hidden');
                          }}
                        />
                      ) : (
                        <User size={20} className="text-blue-500" />
                      )}
                      {/* Hidden fallback icon for error handling */}
                      <User size={20} className={`text-blue-500 fallback-icon absolute inset-0 m-auto ${user.avatar_url ? 'hidden' : ''}`} />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="bg-[var(--background)] border-blue-500/30 w-64">
                    <div className="p-4 border-b border-blue-500/20">
                      <p className="font-bold text-blue-500 mb-0.5">{user.full_name || (isTeacher ? 'Teacher' : 'Student')}</p>
                      <p className="text-xs text-[var(--muted-foreground)] truncate">{user.email}</p>
                      {(isTeacher || isAdmin) && (
                        <p className="text-xs text-blue-400 mt-1 capitalize">{userRole}</p>
                      )}
                    </div>
                    <DropdownMenuSeparator className="bg-blue-500/20" />
                    <DropdownMenuItem
                      onClick={() => router.push('/settings')}
                      className="text-[var(--foreground)] hover:text-blue-500 hover:bg-blue-500/10 cursor-pointer p-3"
                    >
                      <User size={16} className="mr-2" />
                      View Profile
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => router.push('/settings?tab=preferences')}
                      className="text-[var(--foreground)] hover:text-blue-500 hover:bg-blue-500/10 cursor-pointer p-3"
                    >
                      <Settings size={16} className="mr-2" />
                      Settings
                    </DropdownMenuItem>

                    <DropdownMenuSeparator className="bg-blue-500/20" />
                    <DropdownMenuItem
                      onClick={handleLogout}
                      className="text-red-400 hover:text-red-300 hover:bg-red-500/10 cursor-pointer p-3"
                    >
                      <LogOut size={16} className="mr-2" />
                      Logout
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            )}

            {/* Admin Link (Special Case) */}
            {isAdmin && (
              <Link
                href="/admin"
                className="hidden md:flex items-center gap-1.5 px-3 py-2 text-sm font-medium transition-colors text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300"
              >
                <Shield size={18} />
                Admin
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
