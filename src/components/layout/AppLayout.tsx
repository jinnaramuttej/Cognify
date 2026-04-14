import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'
import { Sidebar } from './Sidebar'
import { Topbar } from './Topbar'
import type { TopbarNavItem } from './Topbar'

export function AppLayout({
  children,
  breadcrumb,
  topbar,
  contentClassName,
  pageClassName,
}: {
  children: ReactNode
  breadcrumb?: string
  topbar?: {
    title?: string
    searchPlaceholder?: string
    navItems?: TopbarNavItem[]
    showSearch?: boolean
    leftSlot?: ReactNode
    rightSlot?: ReactNode
  }
  contentClassName?: string
  pageClassName?: string
}) {
  return (
    <div className={cn('min-h-screen bg-[#131313] text-[#E5E2E1]', pageClassName)}>
      <Sidebar />
      <Topbar
        breadcrumb={breadcrumb}
        title={topbar?.title}
        searchPlaceholder={topbar?.searchPlaceholder}
        navItems={topbar?.navItems}
        showSearch={topbar?.showSearch}
        leftSlot={topbar?.leftSlot}
        rightSlot={topbar?.rightSlot}
      />
      <main className="ml-16 min-h-screen pt-16 md:ml-[200px]">
        <div className={cn('p-6 md:p-10', contentClassName)}>{children}</div>
      </main>
    </div>
  )
}
