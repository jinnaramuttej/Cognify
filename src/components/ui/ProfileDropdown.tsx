'use client'

import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { LogOut, Settings as SettingsIcon, Shield, TrendingUp, User as UserIcon } from 'lucide-react';
export default function ProfileDropdown() {
  const { user, isAuthenticated, logout } = useAuth();

  const initials = user?.name ? user.name.split(' ').map(s => s[0]).slice(0, 2).join('') : (user?.full_name ? user.full_name.split(' ').map(s => s[0]).slice(0, 2).join('') : 'S');

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <button
          className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-full border border-[#49473F] bg-[#2A2A2A] text-[11px] font-semibold uppercase tracking-wide text-[#E8E2D4] transition-all hover:border-[#CCC6B9]/60 hover:bg-[#353534]"
          aria-label="Open profile menu"
        >
          {user?.avatar_url ? (
            <img src={user.avatar_url} alt="avatar" className="h-9 w-9 rounded-full object-cover" />
          ) : isAuthenticated ? (
            initials
          ) : (
            <UserIcon className="h-4 w-4 text-[#CBC6BC]" />
          )}
        </button>
      </DropdownMenu.Trigger>

      <DropdownMenu.Content
        align="end"
        sideOffset={10}
        className="z-[100] min-w-[280px] overflow-hidden rounded-xl border border-[#49473F] bg-[#131313] p-0 shadow-[0_24px_64px_rgba(0,0,0,0.65)] animate-in fade-in zoom-in duration-150"
      >
        {isAuthenticated ? (
          <>
            <div className="border-b border-[#2A2A2A] px-4 py-4">
              <div className="truncate text-xl font-semibold text-[#E5E2E1]" style={{ fontFamily: 'Newsreader, Georgia, serif' }}>
                {user?.full_name || user?.name || 'Student'}
              </div>
              <div className="mt-1 truncate text-sm text-[#6E6A66]">{user?.email}</div>
              <div className="mt-3 flex items-center gap-2">
                <span className="rounded-full bg-[#10284F] px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider text-[#6EA8FF]">
                  Class {user?.class || '11/12'}
                </span>
                {user?.isAdmin && (
                  <span className="rounded-full bg-[#353534] px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider text-[#E8E2D4]">
                    Admin
                  </span>
                )}
              </div>
            </div>

            <div className="space-y-1 p-2">
              <DropdownMenu.Item asChild>
                <Link href="/dashboard" className="group flex items-center gap-3 rounded-lg px-3 py-2.5 text-[#E5E2E1] transition-colors hover:bg-[#1C1B1B]">
                  <div className="rounded-md bg-[#201F1F] p-1.5 text-[#CCC6B9] transition-colors group-hover:bg-[#2A2A2A] group-hover:text-[#E8E2D4]">
                    <TrendingUp className="h-4 w-4" />
                  </div>
                  <span className="text-sm font-semibold">Dashboard</span>
                </Link>
              </DropdownMenu.Item>

              <DropdownMenu.Item asChild>
                <Link href="/settings" className="group flex items-center gap-3 rounded-lg px-3 py-2.5 text-[#E5E2E1] transition-colors hover:bg-[#1C1B1B]">
                  <div className="rounded-md bg-[#201F1F] p-1.5 text-[#CCC6B9] transition-colors group-hover:bg-[#2A2A2A] group-hover:text-[#E8E2D4]">
                    <SettingsIcon className="h-4 w-4" />
                  </div>
                  <span className="text-sm font-semibold">Settings</span>
                </Link>
              </DropdownMenu.Item>

              {user?.isAdmin && (
                <DropdownMenu.Item asChild>
                  <Link href="/admin" className="group flex items-center gap-3 rounded-lg px-3 py-2.5 text-[#E5E2E1] transition-colors hover:bg-[#1C1B1B]">
                    <div className="rounded-md bg-[#201F1F] p-1.5 text-[#CCC6B9] transition-colors group-hover:bg-[#2A2A2A] group-hover:text-[#E8E2D4]">
                      <Shield className="h-4 w-4" />
                    </div>
                    <span className="text-sm font-semibold">Admin Panel</span>
                  </Link>
                </DropdownMenu.Item>
              )}

              <div className="my-2 h-px bg-[#2A2A2A]" />

              <DropdownMenu.Item asChild>
                <button
                  onClick={() => logout()}
                  className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left font-semibold text-[#F06767] transition-colors hover:bg-[#2A171A]"
                >
                  <LogOut className="h-4 w-4" />
                  <span className="text-sm">Logout</span>
                </button>
              </DropdownMenu.Item>
            </div>
          </>
        ) : (
          <div className="space-y-4 p-4">
            <div className="border-b border-[#2A2A2A] pb-3 text-center">
              <p className="text-sm font-semibold text-[#E5E2E1]">Welcome to Cognify</p>
              <p className="mt-1 text-xs text-[#6E6A66]">Study smarter with AI</p>
            </div>
            <Link href="/auth/login" className="block">
              <span className="flex w-full items-center justify-center rounded-md border border-[#49473F] bg-[#2A2A2A] px-3 py-2.5 text-sm font-semibold text-[#E5E2E1] transition-colors hover:bg-[#353534]">
                Sign In
              </span>
            </Link>
            <Link href="/auth/signup" className="block">
              <span className="flex w-full items-center justify-center rounded-md bg-[#E8E2D4] px-3 py-2.5 text-sm font-semibold text-[#1E1B13] transition-all hover:brightness-95">
                Create Account
              </span>
            </Link>
          </div>
        )}
      </DropdownMenu.Content>
    </DropdownMenu.Root>
  );
}
