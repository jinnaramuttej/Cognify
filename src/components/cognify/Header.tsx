'use client';

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import ProfileDropdown from '@/components/ui/ProfileDropdown';
import { useAuth } from '@/contexts/AuthContext';

export default function Header() {
  const { user, isAuthenticated } = useAuth();
  return (
    <header className="sticky top-0 z-50 w-full border-b border-[var(--border)] bg-[var(--background)]/95 backdrop-blur supports-[backdrop-filter]:bg-[var(--background)]/60 transition-colors duration-300">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link href={isAuthenticated ? "/dashboard" : "/"} className="flex items-center gap-2 smooth-hover">
          <span className="text-lg font-bold text-[var(--foreground)]">Cognify</span>
        </Link>

        <nav className="flex items-center gap-6">
          <div className="hidden md:flex items-center gap-6">
            <Link href="/features" className="text-sm font-medium text-[var(--foreground)] hover:text-[var(--primary)] transition-colors smooth-hover">Features</Link>
            <Link href="/pricing" className="text-sm font-medium text-[var(--foreground)] hover:text-[var(--primary)] transition-colors smooth-hover">Pricing</Link>
            {isAuthenticated && (
              <Link href="/dashboard" className="text-sm font-medium text-[var(--foreground)] hover:text-[var(--primary)] transition-colors smooth-hover">Dashboard</Link>
            )}
            {user?.isAdmin && (
              <Link href="/admin" className="text-sm font-medium text-[var(--foreground)] hover:text-[var(--primary)] transition-colors smooth-hover">Admin</Link>
            )}
          </div>

          <div className="flex items-center gap-2 sm:gap-4">
            {!isAuthenticated && (
              <div className="hidden sm:flex items-center gap-2">
                <Link href="/auth/login">
                  <Button variant="ghost" size="sm" className="smooth-hover text-[var(--muted)] hover:text-[var(--primary)]">
                    Sign In
                  </Button>
                </Link>
                <Link href="/auth/signup">
                  <Button size="sm" className="bg-[var(--primary)] text-black font-bold smooth-hover">
                    Get Started
                  </Button>
                </Link>
              </div>
            )}
            <ThemeToggle />

            {/* Profile dropdown (always visible, handles auth state) */}
            <div className="ml-3">
              <ProfileDropdown />
            </div>
          </div>
        </nav>
      </div>
    </header>
  );
}