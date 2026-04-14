'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: 'dashboard' },
  { href: '/tests', label: 'Tests', icon: 'quiz' },
  { href: '/library', label: 'Library', icon: 'menu_book' },
  { href: '/cogni', label: 'Cogni', icon: 'psychology' },
  { href: '/arena', label: 'Arena', icon: 'sports_esports' },
  { href: '/notes', label: 'Notes', icon: 'description' },
]

const bottomItems = [
  { href: '/settings', label: 'Settings', icon: 'settings' },
  { href: '/support', label: 'Support', icon: 'contact_support' },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="fixed left-0 top-0 z-50 flex h-full w-16 flex-col bg-[#201F1F] py-6 md:w-[200px] md:py-8">
      <div className="px-3 md:px-5">
        <Link
          href="/dashboard"
          className="hidden font-headline text-xl font-semibold tracking-tight text-[#CCC6B9] md:block"
          style={{ fontFamily: 'Newsreader, Georgia, serif' }}
        >
          Cognify
        </Link>
      </div>

      <nav className="flex flex-1 flex-col gap-y-0.5 px-2 pt-12 md:pt-8">
        {navItems.map((item) => {
          const active = pathname.startsWith(item.href)
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`group flex items-center gap-3 rounded-md px-3 py-2.5 transition-all duration-150
                ${
                  active
                    ? 'border-l-2 border-[#CCC6B9] bg-[#2A2A2A] pl-[10px] text-[#E8E2D4]'
                    : 'border-l-2 border-transparent pl-3 text-[#919191] hover:bg-[#2A2A2A] hover:text-[#E8E2D4]'
                }`}
              aria-current={active ? 'page' : undefined}
            >
              <span
                className="material-symbols-outlined shrink-0 text-[20px]"
                style={active ? { fontVariationSettings: "'FILL' 1" } : {}}
              >
                {item.icon}
              </span>
              <span className="hidden font-body text-sm font-medium md:block">{item.label}</span>
            </Link>
          )
        })}
      </nav>

      <div className="flex flex-col gap-y-0.5 border-t border-[#49473F]/20 px-2 pt-3">
        {bottomItems.map((item) => {
          const active = pathname.startsWith(item.href)
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 rounded-md px-3 py-2.5 transition-all duration-150
                ${
                  active
                    ? 'border-l-2 border-[#CCC6B9] bg-[#2A2A2A] pl-[10px] text-[#E8E2D4]'
                    : 'border-l-2 border-transparent pl-3 text-[#919191] hover:bg-[#2A2A2A] hover:text-[#E8E2D4]'
                }`}
              aria-current={active ? 'page' : undefined}
            >
              <span className="material-symbols-outlined shrink-0 text-[20px]">{item.icon}</span>
              <span className="hidden font-body text-sm font-medium md:block">{item.label}</span>
            </Link>
          )
        })}
      </div>
    </aside>
  )
}
