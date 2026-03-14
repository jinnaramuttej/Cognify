'use client';

import { Card, CardContent } from '@/components/ui/card';

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-[#1a1a1a] py-16 px-4">
      <div className="container mx-auto max-w-4xl">
        <div className="mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Terms of Service
          </h1>
          <p className="text-[#a0a0a0]">
            Last updated: January 2024
          </p>
        </div>

        <Card className="bg-[#0a0a0a] border-[#D4AF37]/20 mb-6">
          <CardContent className="pt-8 pb-8 px-6 space-y-6">
            <section>
              <h2 className="text-2xl font-bold text-white mb-4">1. Acceptance of Terms</h2>
              <p className="text-[#a0a0a0] mb-4">
                By accessing and using Cognify's platform and services, you agree to be bound by these Terms of Service ('Terms'). If you disagree with any part of these terms, you may not access our services.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">2. Description of Service</h2>
              <p className="text-[#a0a0a0] mb-3">
                Cognify provides an AI-powered educational platform including:
              </p>
              <ul className="list-disc list-inside text-[#a0a0a0] space-y-2 mb-4">
                <li>AI tutoring and mentoring</li>
                <li>Practice questions and mock tests</li>
                <li>Video lessons and study materials</li>
                <li>Progress tracking and analytics</li>
                <li>Interactive learning tools</li>
              </ul>
              <p className="text-[#a0a0a0]">
                We reserve the right to modify, suspend, or discontinue any part of our services at any time without prior notice.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">3. User Accounts</h2>
              <ul className="list-disc list-inside text-[#a0a0a0] space-y-2 mb-4">
                <li>You must be at least 13 years old to use Cognify</li>
                <li>You are responsible for maintaining the confidentiality of your account credentials</li>
                <li>You agree to provide accurate and complete information during registration</li>
                <li>You must notify us immediately of any unauthorized use of your account</li>
                <li>You are responsible for all activities that occur under your account</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">4. Acceptable Use Policy</h2>
              <p className="text-[#a0a0a0] mb-3">You agree NOT to:</p>
              <ul className="list-disc list-inside text-[#a0a0a0] space-y-2 mb-4">
                <li>Use the platform for any illegal or unauthorized purpose</li>
                <li>Share your account credentials with others</li>
                <li>Copy, reproduce, or distribute our content without permission</li>
                <li>Attempt to gain unauthorized access to our systems</li>
                <li>Interfere with or disrupt our services</li>
                <li>Upload malicious code or viruses</li>
                <li>Harass, abuse, or harm other users</li>
                <li>Violate any applicable laws or regulations</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">5. Intellectual Property</h2>
              <p className="text-[#a0a0a0] mb-4">
                All content on Cognify, including but not limited to text, graphics, logos, images, software, and videos, is owned by Cognify or its licensors and is protected by copyright and other intellectual property laws.
              </p>
              <p className="text-[#a0a0a0]">
                Users retain ownership of content they create, but grant Cognify a license to use, modify, and display such content for providing our services.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">6. Subscription and Payment</h2>
              <ul className="list-disc list-inside text-[#a0a0a0] space-y-2 mb-4">
                <li>Subscription fees are charged on a recurring basis (monthly or annual)</li>
                <li>All fees are non-refundable except as required by law</li>
                <li>We reserve the right to change pricing with 30 days notice</li>
                <li>Auto-renewal can be canceled at any time from your account settings</li>
                <li>Failure to pay fees may result in service suspension</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">7. Privacy Policy</h2>
              <p className="text-[#a0a0a0]">
                Your use of Cognify is also governed by our Privacy Policy, which explains how we collect, use, and protect your information. By using our services, you agree to our data practices.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">8. Disclaimer of Warranties</h2>
              <p className="text-[#a0a0a0] mb-4">
                Cognify is provided on an 'as is' and 'as available' basis. We make no warranties, expressed or implied, including:
              </p>
              <ul className="list-disc list-inside text-[#a0a0a0] space-y-2">
                <li>Accuracy or completeness of educational content</li>
                <li>Reliability of the platform</li>
                <li>Results or improvements in academic performance</li>
                <li>Uninterrupted or error-free service</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">9. Limitation of Liability</h2>
              <p className="text-[#a0a0a0] mb-4">
                To the maximum extent permitted by law, Cognify shall not be liable for:
              </p>
              <ul className="list-disc list-inside text-[#a0a0a0] space-y-2">
                <li>Any indirect, incidental, special, or consequential damages</li>
                <li>Loss of data, profits, or business opportunities</li>
                <li>Service interruptions or errors</li>
                <li>Third-party content or services</li>
              </ul>
              <p className="text-[#a0a0a0] mt-4">
                Our total liability shall not exceed the amount you paid for our services in the past 12 months.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">10. Termination</h2>
              <p className="text-[#a0a0a0] mb-3">
                We reserve the right to terminate or suspend your account at any time, with or without cause, including but not limited to:
              </p>
              <ul className="list-disc list-inside text-[#a0a0a0] space-y-2">
                <li>Violation of these Terms</li>
                <li>Non-payment of fees</li>
                <li>Suspected fraudulent activity</li>
                <li>Extended period of inactivity</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">11. Governing Law</h2>
              <p className="text-[#a0a0a0]">
                These Terms shall be governed by and construed in accordance with the laws of India. Any disputes shall be resolved in the courts of Telangana, India.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">12. Contact Us</h2>
              <p className="text-[#a0a0a0] mb-3">
                For questions about these Terms, please contact us:
              </p>
              <ul className="text-[#a0a0a0] space-y-2">
                <li>Email: legal@cognify.com</li>
                <li>Phone: +91 7207842641</li>
                <li>Address: Medchal, Telangana, India</li>
              </ul>
            </section>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
