import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

export function CognifyCard({
  children,
  className,
  hover = true,
}: {
  children: ReactNode
  className?: string
  hover?: boolean
}) {
  return (
    <div
      className={cn(
        'rounded-xl bg-[#201F1F] p-5',
        hover && 'transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#2A2A2A]',
        className
      )}
    >
      {children}
    </div>
  )
}
