'use client';

import React from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

import Sidebar from '@/components/cognify/Sidebar';
import { NavbarWrapper } from '@/components/NavbarWrapper';
import Footer from '@/components/cognify/Footer';
import { BottomNav } from '@/components/cognify/BottomNav';
import PageAnimate from '@/components/Motion/PageAnimate';

/**
 * LayoutShell — Route-aware layout that renders the correct UI shell
 * based on the current pathname.
 *
 * Shells:
 *   PUBLIC  → Header + Footer + BottomNav (landing, marketing, auth pages)
 *   APP     → Navbar + Sidebar + content (dashboard, library, cogni, arena, leaderboard)
 *   TEST    → Fullscreen, no chrome (test execution)
 *   SETTINGS → Navbar + centered content (no sidebar)
 *   ADMIN   → Bare wrapper (admin page has its own sidebar)
 *   TEACHER → Bare wrapper (teacher page has its own sidebar/guard)
 */

type Shell = 'public' | 'app' | 'test' | 'settings' | 'admin' | 'teacher' | 'stitch';

const PUBLIC_PATHS = [
    '/', '/about', '/blog', '/careers', '/compliance', '/contact',
    '/cookie-policy', '/courses', '/data-protection', '/features',
    '/partners', '/pricing', '/privacy-policy', '/terms-of-service',
    '/auth', '/auth/login', '/auth/signup', '/auth/forgot-password',
];

const STITCH_PATHS = [
    '/dashboard',
    '/tests',
    '/analytics',
    '/cogni',
    '/library',
    '/notes',
    '/arena',
    '/settings',
    '/support',
];

function getShell(pathname: string): Shell {
    // Exact public paths
    if (PUBLIC_PATHS.includes(pathname)) return 'public';

    if (STITCH_PATHS.includes(pathname)) return 'stitch';

    // Admin routes
    if (pathname.startsWith('/admin')) return 'admin';

    // Teacher routes
    if (pathname.startsWith('/teacher')) return 'teacher';

    // Test execution: /tests/[uuid] or /tests/[uuid]/analysis (fullscreen)
    if (pathname.match(/^\/tests\/[a-zA-Z0-9-]+/)) return 'test';

    // Settings
    if (pathname.startsWith('/settings')) return 'settings';

    // App routes (dashboard, library, cogni, arena, leaderboard, tests listing)
    if (
        pathname.startsWith('/dashboard') ||
        pathname.startsWith('/library') ||
        pathname.startsWith('/cogni') ||
        pathname.startsWith('/arena') ||
        pathname.startsWith('/analytics') ||
        pathname.startsWith('/leaderboard') ||
        pathname.startsWith('/lectures') ||
        pathname.startsWith('/notes') ||
        pathname.startsWith('/recommendations') ||
        pathname.startsWith('/progress-analytics') ||
        pathname.startsWith('/practice-quizzes') ||
        pathname.startsWith('/notes-converter') ||
        pathname === '/tests' ||
        pathname === '/tests/create'
    ) {
        return 'app';
    }

    // Default to public for unknown routes
    return 'public';
}

export default function LayoutShell({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const { isAuthenticated, loading } = useAuth();
    const router = useRouter();
    const shell = getShell(pathname || '/');
    const isRootLanding = (pathname || '/') === '/';
    const isAuthRoute = (pathname || '/').startsWith('/auth');

    // Auth guard for protected shells
    React.useEffect(() => {
        if (!loading && !isAuthenticated && (shell === 'app' || shell === 'settings' || shell === 'admin' || shell === 'teacher' || shell === 'stitch')) {
            router.push('/auth/login');
        }
    }, [loading, isAuthenticated, shell, router]);

    // ── PUBLIC SHELL ──────────────────────────────────────────
    if (shell === 'public') {
        // The root landing page now owns its full visual chrome.
        if (isRootLanding) {
            return <PageAnimate>{children}</PageAnimate>;
        }

        // Auth screens own their own UI and should not render legacy header/footer chrome.
        if (isAuthRoute) {
            return <PageAnimate>{children}</PageAnimate>;
        }

        return (
            <>
                <NavbarWrapper />
                <PageAnimate>{children}</PageAnimate>
                <Footer />
                <BottomNav />
            </>
        );
    }

    // ── ADMIN SHELL ───────────────────────────────────────────
    // Admin page has its own gold-themed sidebar
    if (shell === 'admin') {
        return (
            <>
                <NavbarWrapper />
                <PageAnimate>{children}</PageAnimate>
            </>
        );
    }

    // ── TEACHER SHELL ─────────────────────────────────────────
    // Teacher page has its own TeacherSidebar + TeacherGuard
    if (shell === 'teacher') {
        return (
            <>
                <NavbarWrapper />
                <PageAnimate>{children}</PageAnimate>
            </>
        );
    }

    // Stitch-integrated routes include their own generated navigation chrome.
    if (shell === 'stitch') {
        if (!isAuthenticated && !loading) return null;
        return <>{children}</>;
    }

    // ── TEST EXECUTION SHELL ──────────────────────────────────
    // Fullscreen — no navbar, no sidebar, no footer
    if (shell === 'test') {
        return <>{children}</>;
    }

    // ── SETTINGS SHELL ────────────────────────────────────────
    // Navbar + centered content, NO sidebar
    if (shell === 'settings') {
        if (!isAuthenticated && !loading) return null;
        return (
            <>
                <NavbarWrapper />
                <div className="min-h-screen bg-[var(--background)]">
                    <main className="max-w-7xl mx-auto pt-24 p-4 md:p-8">
                        <PageAnimate>{children}</PageAnimate>
                    </main>
                </div>
            </>
        );
    }

    // ── APP SHELL ─────────────────────────────────────────────
    // Navbar + Sidebar + content, NO footer
    if (!isAuthenticated && !loading) return null;
    return (
        <>
            <NavbarWrapper />
            <div className="flex min-h-screen bg-[var(--background)]">
                <Sidebar />
                <div className="flex-1 md:pl-20 transition-all duration-300 ease-in-out">
                    <main className="p-4 md:p-8 pt-24 md:pt-24 max-w-7xl mx-auto">
                        <PageAnimate>{children}</PageAnimate>
                    </main>
                </div>
            </div>
        </>
    );
}
