'use client'

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export default function AppearanceTab() {
  const [mode, setMode] = useState<'light' | 'dark' | 'system' | 'custom'>('light');
  const [primary, setPrimary] = useState('#3B82F6');

  return (
    <div className="space-y-6">
      <section>
        <h3 className="font-semibold text-lg">Theme Selection</h3>
        <div className="mt-3 flex flex-wrap gap-3">
          {(['light', 'dark', 'system', 'custom'] as const).map(m => (
            <button key={m} onClick={() => setMode(m)} className={`px-3 py-2 rounded-md ${mode === m ? 'bg-[var(--sidebar-accent)] text-[var(--primary)]' : 'bg-transparent text-[var(--muted)]'} transition-colors`}>{m}</button>
          ))}
        </div>

        {mode === 'custom' && (
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-[var(--muted)]">Primary Color</label>
              <div className="mt-2 flex items-center gap-3">
                <input
                  type="color"
                  value={primary}
                  onChange={(e) => setPrimary(e.target.value)}
                  className="w-12 h-12 rounded cursor-pointer border-none p-0 bg-transparent"
                />
                <Input
                  value={primary}
                  onChange={(e) => setPrimary(e.target.value)}
                  className="font-mono uppercase"
                  maxLength={7}
                />
              </div>
            </div>

            <div>
              <label className="text-sm text-[var(--muted)]">Preview</label>
              <div className="mt-2 p-4 rounded-md" style={{ background: primary }}>
                <div className="text-white p-4 rounded">Preview pane</div>
              </div>
            </div>
          </div>
        )}
      </section>

      <section>
        <h3 className="font-semibold text-lg">Dashboard Layout</h3>
        <div className="mt-3 flex items-center gap-3">
          <label className="flex items-center gap-2"><input type="radio" name="cards" defaultChecked /> 2</label>
          <label className="flex items-center gap-2"><input type="radio" name="cards" /> 3</label>
          <label className="flex items-center gap-2"><input type="radio" name="cards" /> 4</label>
        </div>

        <div className="mt-4">
          <label className="text-sm text-[var(--muted)]">Font Size</label>
          <div className="mt-2 flex gap-2">
            <button className="px-3 py-1 rounded bg-transparent">Small</button>
            <button className="px-3 py-1 rounded bg-[var(--sidebar-accent)]">Normal</button>
            <button className="px-3 py-1 rounded bg-transparent">Large</button>
          </div>
        </div>
      </section>

      <section>
        <h3 className="font-semibold text-lg">Accessibility</h3>
        <div className="mt-3 space-y-2">
          <label className="flex items-center gap-3"><input type="checkbox" /> High Contrast Mode</label>
          <label className="flex items-center gap-3"><input type="checkbox" /> Dyslexia Font</label>
          <label className="flex items-center gap-3"><input type="checkbox" /> Screen Reader Optimized</label>
          <div className="mt-2">
            <label className="text-sm">Animation Speed</label>
            <select className="input">
              <option>Normal</option>
              <option>Fast</option>
              <option>Slow</option>
              <option>None</option>
            </select>
          </div>
        </div>
      </section>
    </div>
  );
}

