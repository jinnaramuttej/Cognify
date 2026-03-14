'use client';

import { Dialog, DialogContent } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { X } from 'lucide-react';

interface PrivacyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function PrivacyModal({ isOpen, onClose }: PrivacyModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-[#1a1a1a] border border-[#D4AF37]/30 text-white max-w-[90%] w-[600px] p-0 rounded-xl">
        <div className="sticky top-0 bg-[#1a1a1a] border-b border-[#D4AF37]/30 p-6 flex items-center justify-between">
          <h2 className="text-xl font-bold text-[#D4AF37]">Privacy Policy</h2>
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
              <h3 className="text-base font-semibold text-white mb-2">1. Information We Collect</h3>
              <p>
                Cognify collects information you provide directly to us, including name, email address, and other contact information. We also collect information about your use of our platform, including learning progress and activity data.
              </p>
            </section>

            <section>
              <h3 className="text-base font-semibold text-white mb-2">2. How We Use Your Information</h3>
              <p>
                We use the information we collect to provide, maintain, and improve our services, to communicate with you, and to comply with legal obligations. We also use your data to personalize your learning experience.
              </p>
            </section>

            <section>
              <h3 className="text-base font-semibold text-white mb-2">3. Information Sharing</h3>
              <p>
                We do not sell your personal information. We may share your information with service providers who perform services on our behalf, or as required by law.
              </p>
            </section>

            <section>
              <h3 className="text-base font-semibold text-white mb-2">4. Data Security</h3>
              <p>
                We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction.
              </p>
            </section>

            <section>
              <h3 className="text-base font-semibold text-white mb-2">5. Your Rights</h3>
              <p>
                You have the right to access, correct, or delete your personal data. You can also object to the processing of your data or request data portability.
              </p>
            </section>

            <section>
              <h3 className="text-base font-semibold text-white mb-2">6. Cookies</h3>
              <p>
                We use cookies and similar tracking technologies to track activity on our Service and hold certain information. You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent.
              </p>
            </section>

            <section>
              <h3 className="text-base font-semibold text-white mb-2">7. Children's Privacy</h3>
              <p>
                Our Service is not intended for children under the age of 13. We do not knowingly collect personal information from children under 13.
              </p>
            </section>

            <section>
              <h3 className="text-base font-semibold text-white mb-2">8. Changes to This Privacy Policy</h3>
              <p>
                We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page.
              </p>
            </section>

            <section>
              <h3 className="text-base font-semibold text-white mb-2">9. Contact Us</h3>
              <p>
                If you have any questions about this Privacy Policy, please contact us at privacy@cognify.com
              </p>
            </section>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
