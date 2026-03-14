'use client';

import { Button } from '@/components/ui/button';

interface CTAProps {
  onGetStartedClick: () => void;
}

export default function CTA({ onGetStartedClick }: CTAProps) {
  return (
    <section className="relative py-20 md:py-32 px-4 md:px-6 lg:px-8 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-blue-500 to-blue-700" />
      <div className="absolute inset-0 bg-black/20" />

      <div className="relative z-10 max-w-4xl mx-auto text-center">
        <h2 className="text-3xl md:text-4xl font-bold text-white mb-5">
          Ready to Transform Your Learning?
        </h2>
        <p className="text-base text-white/90 mb-10 max-w-2xl mx-auto">
          Join thousands of students already learning smarter, faster, and more effectively.
        </p>
        <Button
          onClick={onGetStartedClick}
          className="bg-white text-blue-600 hover:bg-blue-50 hover:scale-105 w-[200px] h-14 text-base font-semibold transition-all duration-300"
        >
          Get Started Free - No Credit Card Needed
        </Button>
      </div>
    </section>
  );
}
