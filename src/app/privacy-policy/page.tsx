'use client';

import { Card, CardContent } from '@/components/ui/card';

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-[#1a1a1a] py-16 px-4">
      <div className="container mx-auto max-w-4xl">
        <div className="mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Privacy Policy
          </h1>
          <p className="text-[#a0a0a0]">
            Last updated: January 2024
          </p>
        </div>

        <Card className="bg-[#0a0a0a] border-[#D4AF37]/20 mb-6">
          <CardContent className="pt-8 pb-8 px-6 space-y-6">
            <section>
              <h2 className="text-2xl font-bold text-white mb-4">Introduction</h2>
              <p className="text-[#a0a0a0] mb-4">
                Cognify ('we', 'our', or 'us') is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our educational platform, website, and services.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">Information We Collect</h2>
              <p className="text-[#a0a0a0] mb-3">We collect several types of information:</p>
              <ul className="list-disc list-inside text-[#a0a0a0] space-y-2">
                <li><strong>Personal Information:</strong> Name, email address, phone number, date of birth, and educational details</li>
                <li><strong>Academic Data:</strong> Subject preferences, study progress, test scores, and learning analytics</li>
                <li><strong>Usage Data:</strong> Pages visited, time spent, features used, and device information</li>
                <li><strong>Payment Information:</strong> Securely processed through third-party payment providers</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">How We Use Your Information</h2>
              <p className="text-[#a0a0a0] mb-3">We use your information to:</p>
              <ul className="list-disc list-inside text-[#a0a0a0] space-y-2">
                <li>Provide personalized learning experiences and AI-powered recommendations</li>
                <li>Track your progress and generate analytics reports</li>
                <li>Send important updates about your account and services</li>
                <li>Improve our platform and develop new features</li>
                <li>Process payments and manage subscriptions</li>
                <li>Provide customer support</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">Data Sharing</h2>
              <p className="text-[#a0a0a0] mb-3">We may share your information with:</p>
              <ul className="list-disc list-inside text-[#a0a0a0] space-y-2">
                <li><strong>Service Providers:</strong> Third-party companies that help us operate our platform</li>
                <li><strong>Parents/Guardians:</strong> With consent, to provide progress updates</li>
                <li><strong>Educational Institutions:</strong> For institutional partnerships</li>
                <li><strong>Legal Requirements:</strong> When required by law or to protect our rights</li>
              </ul>
              <p className="text-[#a0a0a0] mt-4">
                We never sell your personal information to third parties for marketing purposes.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">Data Security</h2>
              <p className="text-[#a0a0a0] mb-4">
                We implement industry-standard security measures to protect your information, including:
              </p>
              <ul className="list-disc list-inside text-[#a0a0a0] space-y-2">
                <li>SSL/TLS encryption for all data transmission</li>
                <li>Secure payment processing through PCI-compliant providers</li>
                <li>Regular security audits and updates</li>
                <li>Access controls and authentication systems</li>
                <li>Data backup and recovery procedures</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">Your Rights</h2>
              <p className="text-[#a0a0a0] mb-3">You have the right to:</p>
              <ul className="list-disc list-inside text-[#a0a0a0] space-y-2">
                <li>Access your personal data</li>
                <li>Request correction of inaccurate data</li>
                <li>Request deletion of your account and data</li>
                <li>Opt-out of marketing communications</li>
                <li>Export your data</li>
                <li>Object to certain data processing activities</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">Cookies</h2>
              <p className="text-[#a0a0a0] mb-4">
                We use cookies and similar technologies to improve your experience, analyze usage, and provide personalized content. You can manage your cookie preferences through your browser settings. See our Cookie Policy for more details.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">Children's Privacy</h2>
              <p className="text-[#a0a0a0] mb-4">
                Cognify is intended for students aged 13 and above. We do not knowingly collect personal information from children under 13. If we become aware of such collection, we will take immediate steps to delete the information.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">Changes to This Policy</h2>
              <p className="text-[#a0a0a0] mb-4">
                We may update this Privacy Policy from time to time. We will notify you of any material changes by posting the new policy on our website and sending you an email notification.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">Contact Us</h2>
              <p className="text-[#a0a0a0] mb-3">
                If you have questions about this Privacy Policy or our data practices, please contact us:
              </p>
              <ul className="text-[#a0a0a0] space-y-2">
                <li>Email: privacy@cognify.com</li>
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
