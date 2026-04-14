'use client'

import Link from 'next/link'
import type { ReactNode } from 'react'

export type TopbarNavItem = {
  label: string
  href?: string
  active?: boolean
}

export function Topbar({
  title = 'Cognify',
  breadcrumb,
  searchPlaceholder = 'Search...',
  navItems,
  showSearch = true,
  leftSlot,
  rightSlot,
}: {
  title?: string
  breadcrumb?: string
  searchPlaceholder?: string
  navItems?: TopbarNavItem[]
  showSearch?: boolean
  leftSlot?: ReactNode
  rightSlot?: ReactNode
}) {
  return (
    <header className="fixed left-16 right-0 top-0 z-40 flex h-16 items-center justify-between bg-[#131313]/80 px-4 backdrop-blur-xl md:left-[200px] md:px-10">
      <div className="flex min-w-0 items-center gap-4 md:gap-8">
        {leftSlot ?? (
          <>
            <Link
              href="/dashboard"
              className="hidden font-headline text-xl font-semibold tracking-tight text-[#CCC6B9] md:block"
              style={{ fontFamily: 'Newsreader, Georgia, serif' }}
            >
              {title}
            </Link>

            {showSearch && (
              <label className="group relative hidden md:block">
                <span className="material-symbols-outlined pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-[#919191] transition-colors group-focus-within:text-[#E8E2D4]">
                  search
                </span>
                <input
                  type="text"
                  placeholder={searchPlaceholder}
                  className="w-56 rounded-md border border-transparent bg-[#353534] py-1.5 pl-10 pr-3 text-xs text-[#CBC6BC] outline-none transition-all placeholder:text-[#919191] focus:border-[#49473F] focus:w-64"
                />
              </label>
            )}

            {navItems?.length ? (
              <nav className="hidden items-center gap-6 md:flex">
                {navItems.map((item) => (
                  <Link
                    key={item.label}
                    href={item.href ?? '#'}
                    className={`text-[11px] uppercase tracking-[0.2em] transition-colors ${
                      item.active ? 'font-semibold text-[#CCC6B9]' : 'text-[#919191] hover:text-[#E8E2D4]'
                    }`}
                  >
                    {item.label}
                  </Link>
                ))}
              </nav>
            ) : (
              breadcrumb && <span className="font-body text-sm text-[#919191]">{breadcrumb}</span>
            )}
          </>
        )}

        <span className="font-body text-sm text-[#919191] md:hidden">{breadcrumb ?? title}</span>
      </div>

      <div className="ml-4 flex items-center gap-4 text-[#CCC6B9]">
        {rightSlot ?? (
          <>
            <button
              type="button"
              aria-label="Notifications"
              className="material-symbols-outlined cursor-pointer text-[20px] transition-colors hover:text-[#E8E2D4]"
            >
              notifications
            </button>
            <div className="h-8 w-8 cursor-pointer overflow-hidden rounded-full border border-[#49473F] bg-[#2A2A2A]" />
          </>
        )}
      </div>
    </header>
  )
}
