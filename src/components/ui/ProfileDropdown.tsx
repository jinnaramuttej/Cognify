'use client'

import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { LogOut, Settings as SettingsIcon, Shield, TrendingUp, User as UserIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
export default function ProfileDropdown() {
  const { user, isAuthenticated, logout } = useAuth();
  const router = useRouter();

  const initials = user?.name ? user.name.split(' ').map(s => s[0]).slice(0, 2).join('') : (user?.full_name ? user.full_name.split(' ').map(s => s[0]).slice(0, 2).join('') : 'S');

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <button className="w-10 h-10 rounded-full border border-[var(--border)] bg-background text-[var(--foreground)] flex items-center justify-center font-semibold hover:scale-105 transition-transform overflow-hidden shadow-sm">
          {user?.avatar_url ? (
            <img src={user.avatar_url} alt="avatar" className="w-10 h-10 rounded-full object-cover" />
          ) : isAuthenticated ? (
            initials
          ) : (
            <UserIcon className="w-5 h-5 opacity-60" />
          )}
        </button>
      </DropdownMenu.Trigger>

      <DropdownMenu.Content align="end" sideOffset={8} className="z-[100] min-w-[240px] bg-[var(--card)] border border-[var(--border)] rounded-xl p-3 shadow-xl animate-in fade-in zoom-in duration-200">
        {isAuthenticated ? (
          <>
            <div className="px-2 py-3 mb-2 border-b border-[var(--border)]">
              <div className="font-bold text-[var(--foreground)] truncate">{user?.full_name || user?.name || 'Student'}</div>
              <div className="text-xs text-[var(--muted)] truncate">{user?.email}</div>
              <div className="flex items-center gap-1.5 mt-2">
                <span className="px-1.5 py-0.5 rounded-full bg-[var(--primary)]/10 text-[var(--primary)] text-[10px] font-bold uppercase tracking-wider">
                  Class {user?.class || '11/12'}
                </span>
                {user?.isAdmin && (
                  <span className="px-1.5 py-0.5 rounded-full bg-purple-500/10 text-purple-500 text-[10px] font-bold uppercase tracking-wider">
                    Admin
                  </span>
                )}
              </div>
            </div>

            <div className="py-1 space-y-1">
              <DropdownMenu.Item asChild>
                <Link href="/dashboard" className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-[var(--sidebar-accent)] text-[var(--foreground)] transition-colors group">
                  <div className="p-1.5 rounded-md bg-blue-500/10 text-blue-500 group-hover:bg-blue-500 group-hover:text-white transition-colors">
                    <TrendingUp className="w-4 h-4" />
                  </div>
                  <span className="text-sm font-medium">Dashboard</span>
                </Link>
              </DropdownMenu.Item>

              <DropdownMenu.Item asChild>
                <Link href="/settings" className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-[var(--sidebar-accent)] text-[var(--foreground)] transition-colors group">
                  <div className="p-1.5 rounded-md bg-gray-500/10 text-gray-500 group-hover:bg-gray-500 group-hover:text-white transition-colors">
                    <SettingsIcon className="w-4 h-4" />
                  </div>
                  <span className="text-sm font-medium">Settings</span>
                </Link>
              </DropdownMenu.Item>

              {user?.isAdmin && (
                <DropdownMenu.Item asChild>
                  <Link href="/admin" className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-[var(--sidebar-accent)] text-[var(--foreground)] transition-colors group">
                    <div className="p-1.5 rounded-md bg-purple-500/10 text-purple-500 group-hover:bg-purple-500 group-hover:text-white transition-colors">
                      <Shield className="w-4 h-4" />
                    </div>
                    <span className="text-sm font-medium">Admin Panel</span>
                  </Link>
                </DropdownMenu.Item>
              )}

              <div className="h-px bg-[var(--border)] my-2" />

              <DropdownMenu.Item asChild>
                <button
                  onClick={() => logout()}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-red-500/10 text-red-500 transition-colors w-full text-left font-medium"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="text-sm">Logout</span>
                </button>
              </DropdownMenu.Item>
            </div>
          </>
        ) : (
          <div className="p-2 space-y-3">
            <div className="text-center pb-2 border-b border-[var(--border)] mb-3">
              <p className="text-sm font-semibold text-[var(--foreground)]">Welcome to Cognify</p>
              <p className="text-xs text-[var(--muted)] mt-1">Study smarter with AI</p>
            </div>
            <Link href="/auth/login" className="block">
              <Button className="w-full justify-center font-bold" variant="default" size="sm">
                Sign In
              </Button>
            </Link>
            <Link href="/auth/signup" className="block">
              <Button className="w-full justify-center font-bold" variant="outline" size="sm">
                Create Account
              </Button>
            </Link>
          </div>
        )}
      </DropdownMenu.Content>
    </DropdownMenu.Root>
  );
}
