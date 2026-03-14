'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X, Rocket } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useDemoModeStore } from '@/lib/demo-mode';

export default function DemoModeBanner() {
  const { isDemoMode, disableDemoMode, demoUser } = useDemoModeStore();

  return (
    <AnimatePresence>
      {isDemoMode && (
        <motion.div
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -100, opacity: 0 }}
          transition={{ duration: 0.3, ease: 'easeInOut' }}
          className="fixed top-0 left-0 right-0 z-[9999] bg-blue-600 border-b border-blue-700 text-white"
        >
          <div className="container mx-auto px-4 py-2 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Rocket className="w-5 h-5 text-white animate-pulse" />
              <Badge className="bg-white text-blue-600 border-none font-bold text-sm px-3 py-1">
                DEMO MODE: ON
              </Badge>
              <span className="text-white font-semibold text-sm hidden sm:inline-block">
                Bypass Authentication Active - Role: {demoUser?.role?.toUpperCase()}
              </span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={disableDemoMode}
              className="text-white hover:bg-white/20"
            >
              <X className="w-4 h-4" />
              <span className="sr-only">Exit Demo Mode</span>
            </Button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
