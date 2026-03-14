'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Play, X } from 'lucide-react';
import { Dialog, DialogContent } from '@/components/ui/dialog';

export function DemoModeButton() {
  const [showDemo, setShowDemo] = useState(false);

  return (
    <>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setShowDemo(true)}
        className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 gap-2"
      >
        <Play size={16} />
        {/* <span className="hidden sm:inline">Watch Demo</span> */}
      </Button>

      <Dialog open={showDemo} onOpenChange={setShowDemo}>
        <DialogContent className="bg-white border-blue-100 text-slate-900 max-w-4xl w-full p-0 overflow-hidden">
          <div className="relative p-6">
            <button
              onClick={() => setShowDemo(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-blue-600 z-10"
            >
              <X size={24} />
            </button>
            <h2 className="text-2xl font-bold text-blue-600 mb-4">Platform Demo</h2>
            <div className="aspect-video bg-slate-900 rounded-lg flex items-center justify-center border border-slate-200">
              <Play size={64} className="text-white opacity-50" />
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}