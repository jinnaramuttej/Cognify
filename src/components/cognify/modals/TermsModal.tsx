'use client';

import { Dialog, DialogContent } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { X } from 'lucide-react';

interface TermsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function TermsModal({ isOpen, onClose }: TermsModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-[#1a1a1a] border border-[#D4AF37]/30 text-white max-w-[90%] w-[600px] p-0 rounded-xl">
        <div className="sticky top-0 bg-[#1a1a1a] border-b border-[#D4AF37]/30 p-6 flex items-center justify-between">
          <h2 className="text-xl font-bold text-[#D4AF37]">Terms of Service</h2>
          <button
            onClick={onClose}
            className="p-2 text-[#D4AF37] hover:text-[#f0ad42] transition-colors"
            aria-label="Close modal"
          >
            <X size={24} />
          </button>
        </div>

        <ScrollArea className="max-h-[600px] p-6">
          <div className="space-y-4 text-sm text-[#a0a0a0] leading-relaxed">
            <p className="text-[#606060]">Last updated: January 2024</p>

            <section>
              <h3 className="text-base font-semibold text-white mb-2">1. Acceptance of Terms</h3>
              <p>
                By accessing and using Cognify, you accept and agree to be bound by the terms and provisions of this agreement. If you do not agree to abide by these terms, please do not use this service.
              </p>
            </section>

            <section>
              <h3 className="text-base font-semibold text-white mb-2">2. Description of Service</h3>
              <p>
                Cognify is an AI-powered educational platform that provides personalized learning experiences, including AI tutoring, practice quizzes, progress tracking, and other educational features.
              </p>
            </section>

            <section>
              <h3 className="text-base font-semibold text-white mb-2">3. User Accounts</h3>
              <p>
                You are responsible for maintaining the confidentiality of your account and password. You agree to accept responsibility for all activities that occur under your account or password.
              </p>
            </section>

            <section>
              <h3 className="text-base font-semibold text-white mb-2">4. Privacy Policy</h3>
              <p>
                Your use of Cognify is also subject to our Privacy Policy. Please review our Privacy Policy, which also governs the Service and informs users of our data collection practices.
              </p>
            </section>

            <section>
              <h3 className="text-base font-semibold text-white mb-2">5. Intellectual Property</h3>
              <p>
                The content, features, and functionality of Cognify are owned by Cognify and are protected by international copyright, trademark, and other intellectual property laws.
              </p>
            </section>

            <section>
              <h3 className="text-base font-semibold text-white mb-2">6. Limitation of Liability</h3>
              <p>
                To the fullest extent permitted by law, Cognify shall not be liable for any indirect, incidental, special, consequential, or punitive damages.
              </p>
            </section>

            <section>
              <h3 className="text-base font-semibold text-white mb-2">7. Governing Law</h3>
              <p>
                These terms shall be governed by and construed in accordance with the laws of India, and you irrevocably submit to the exclusive jurisdiction of the courts in that State or location.
              </p>
            </section>

            <section>
              <h3 className="text-base font-semibold text-white mb-2">8. Contact Us</h3>
              <p>
                If you have any questions about these Terms, please contact us at support@cognify.com
              </p>
            </section>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
