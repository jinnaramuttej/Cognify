"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Sun, Moon } from 'lucide-react'
import { useThemeStore } from '@/lib/theme-store'

export function ThemeToggle() {
  const mode = useThemeStore(state => state.mode);
  const toggleTheme = useThemeStore(state => state.toggleTheme);

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => toggleTheme()}
      aria-label="Toggle color theme"
    >
      <Sun className={`h-[1.2rem] w-[1.2rem] transition-all ${mode === 'light' ? 'opacity-100' : 'opacity-0 scale-75'}`} />
      <Moon className={`absolute h-[1.2rem] w-[1.2rem] transition-all ${mode === 'dark' ? 'opacity-100' : 'opacity-0 scale-75'}`} />
      <span className="sr-only">Toggle theme</span>
    </Button>
  )
}