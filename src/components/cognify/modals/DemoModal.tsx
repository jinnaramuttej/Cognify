'use client';

import { Dialog, DialogContent } from '@/components/ui/dialog';
import { X } from 'lucide-react';

interface DemoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function DemoModal({ isOpen, onClose }: DemoModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-[#1a1a1a] border border-[#D4AF37]/30 text-white max-w-[90%] w-[800px] p-0 rounded-xl overflow-hidden">
        <div className="relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-[#D4AF37] hover:text-[#f0ad42] transition-colors z-10"
            aria-label="Close modal"
          >
            <X size={24} />
          </button>

          <div className="aspect-video bg-black flex items-center justify-center">
            <div className="text-center p-8">
              <h2 className="text-2xl font-bold text-[#D4AF37] mb-4">Watch How Cognify Works</h2>
              <p className="text-sm text-[#a0a0a0] mb-4">
                See how AI mentoring, adaptive learning, and gamification work together.
              </p>
              <p className="text-xs text-[#606060]">
                Demo video would be embedded here (YouTube iframe)
              </p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
