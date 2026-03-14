'use client'

import { LucideIcon, User, Lock, Palette, Bell, Shield, BarChart3, Settings } from 'lucide-react';

export interface TabItem { id: string; label: string; icon?: any }

const tabs: TabItem[] = [
  { id: 'profile', label: 'Profile', icon: User },
  { id: 'preferences', label: 'Preferences', icon: Settings },
  { id: 'analytics', label: 'Analytics', icon: BarChart3 },
  { id: 'security', label: 'Security', icon: Shield },
  { id: 'appearance', label: 'Appearance', icon: Palette },
  { id: 'notifications', label: 'Notifications', icon: Bell },
];

type TabId = 'profile' | 'preferences' | 'analytics' | 'security' | 'appearance' | 'notifications';

export default function Tabs({ active, onChange }: { active: TabId; onChange: (id: TabId) => void }) {
  return (
    <div className="hidden md:block">
      <nav className="space-y-1">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => onChange(t.id as TabId)}
            className={`w-full flex items-center gap-3 p-3 rounded-lg text-sm text-[var(--muted)] hover:bg-[var(--sidebar-accent)] hover:text-[var(--primary)] transition-colors ${active === t.id ? 'bg-[var(--sidebar-accent)] text-[var(--primary)]' : ''}`}
          >
            <t.icon className="w-5 h-5" />
            <span>{t.label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
}

