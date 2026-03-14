'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function CookiePolicyPage() {
  return (
    <div className="min-h-screen bg-[#1a1a1a] py-16 px-4">
      <div className="container mx-auto max-w-4xl">
        <div className="mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Cookie Policy
          </h1>
          <p className="text-[#a0a0a0]">
            Last updated: January 2024
          </p>
        </div>

        <Card className="bg-[#0a0a0a] border-[#D4AF37]/20 mb-6">
          <CardContent className="pt-8 pb-8 px-6 space-y-6">
            <section>
              <h2 className="text-2xl font-bold text-white mb-4">What Are Cookies?</h2>
              <p className="text-[#a0a0a0] mb-4">
                Cookies are small text files that are stored on your device when you visit our website. They help us provide you with a better experience by remembering your preferences and understanding how you use our platform.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">How We Use Cookies</h2>
              <p className="text-[#a0a0a0] mb-3">We use cookies for several purposes:</p>
              <ul className="list-disc list-inside text-[#a0a0a0] space-y-2 mb-4">
                <li><strong>Essential Cookies:</strong> Required for basic website functionality (authentication, security)</li>
                <li><strong>Performance Cookies:</strong> Help us understand how visitors use our site</li>
                <li><strong>Functionality Cookies:</strong> Remember your preferences and settings</li>
                <li><strong>Targeting Cookies:</strong> Deliver relevant content and advertisements</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">Types of Cookies We Use</h2>
              <div className="space-y-4">
                <div className="bg-[#1a1a1a] p-4 rounded-lg">
                  <h3 className="text-lg font-semibold text-white mb-2">Essential Cookies</h3>
                  <p className="text-[#a0a0a0] mb-2">Required for the platform to function properly.</p>
                  <p className="text-sm text-[#606060]">Duration: Session to 1 year</p>
                </div>
                <div className="bg-[#1a1a1a] p-4 rounded-lg">
                  <h3 className="text-lg font-semibold text-white mb-2">Analytics Cookies</h3>
                  <p className="text-[#a0a0a0] mb-2">Help us improve our platform by tracking usage patterns.</p>
                  <p className="text-sm text-[#606060]">Duration: 6 months to 2 years</p>
                </div>
                <div className="bg-[#1a1a1a] p-4 rounded-lg">
                  <h3 className="text-lg font-semibold text-white mb-2">Preference Cookies</h3>
                  <p className="text-[#a0a0a0] mb-2">Remember your settings and language preferences.</p>
                  <p className="text-sm text-[#606060]">Duration: 1 year</p>
                </div>
                <div className="bg-[#1a1a1a] p-4 rounded-lg">
                  <h3 className="text-lg font-semibold text-white mb-2">Marketing Cookies</h3>
                  <p className="text-[#a0a0a0] mb-2">Used to deliver personalized advertisements and content.</p>
                  <p className="text-sm text-[#606060]">Duration: Varies by provider</p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">Third-Party Cookies</h2>
              <p className="text-[#a0a0a0] mb-3">
                We may allow third parties to place cookies on your device for:
              </p>
              <ul className="list-disc list-inside text-[#a0a0a0] space-y-2 mb-4">
                <li>Analytics (Google Analytics)</li>
                <li>Payment processing (Razorpay, Stripe)</li>
                <li>Social media integration</li>
                <li>Advertising purposes</li>
              </ul>
              <p className="text-[#a0a0a0]">
                These third parties have their own privacy policies and cookie policies.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">Managing Cookies</h2>
              <p className="text-[#a0a0a0] mb-4">
                You can control and manage cookies through your browser settings. Please note that disabling certain cookies may affect the functionality of our platform.
              </p>
              <div className="space-y-3">
                <p className="text-[#a0a0a0]"><strong>Chrome:</strong> Settings → Privacy and Security → Cookies and other site data</p>
                <p className="text-[#a0a0a0]"><strong>Firefox:</strong> Options → Privacy & Security → Cookies and Site Data</p>
                <p className="text-[#a0a0a0]"><strong>Safari:</strong> Preferences → Privacy → Manage Website Data</p>
                <p className="text-[#a0a0a0]"><strong>Edge:</strong> Settings → Cookies and site permissions</p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">Cookie Preferences</h2>
              <p className="text-[#a0a0a0] mb-4">
                You can adjust your cookie preferences below:
              </p>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-[#1a1a1a] rounded-lg">
                  <div>
                    <h3 className="text-white font-semibold">Essential Cookies</h3>
                    <p className="text-sm text-[#a0a0a0]">Required for basic functionality</p>
                  </div>
                  <Button disabled variant="outline" size="sm">Required</Button>
                </div>
                <div className="flex items-center justify-between p-4 bg-[#1a1a1a] rounded-lg">
                  <div>
                    <h3 className="text-white font-semibold">Analytics Cookies</h3>
                    <p className="text-sm text-[#a0a0a0]">Help us improve the platform</p>
                  </div>
                  <Button variant="outline" size="sm" className="border-[#D4AF37]/30">Enabled</Button>
                </div>
                <div className="flex items-center justify-between p-4 bg-[#1a1a1a] rounded-lg">
                  <div>
                    <h3 className="text-white font-semibold">Marketing Cookies</h3>
                    <p className="text-sm text-[#a0a0a0]">Personalized content and ads</p>
                  </div>
                  <Button variant="outline" size="sm" className="border-[#D4AF37]/30">Enabled</Button>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">Updates to This Policy</h2>
              <p className="text-[#a0a0a0]">
                We may update this Cookie Policy from time to time. We will notify you of any material changes by posting the new policy on our website.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">Contact Us</h2>
              <p className="text-[#a0a0a0] mb-3">
                If you have questions about our use of cookies, please contact us:
              </p>
              <ul className="text-[#a0a0a0] space-y-2">
                <li>Email: privacy@cognify.com</li>
                <li>Phone: +91 7207842641</li>
              </ul>
            </section>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
