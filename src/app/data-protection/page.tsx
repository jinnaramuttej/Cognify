'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Shield, Lock, Eye, FileCheck } from 'lucide-react';

export default function DataProtectionPage() {
  return (
    <div className="min-h-screen bg-[#1a1a1a] py-16 px-4">
      <div className="container mx-auto max-w-4xl">
        <div className="mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Data Protection
          </h1>
          <p className="text-[#a0a0a0]">
            Last updated: January 2024
          </p>
        </div>

        <Card className="bg-[#0a0a0a] border-[#D4AF37]/20 mb-6">
          <CardContent className="pt-8 pb-8 px-6 space-y-6">
            <section>
              <h2 className="text-2xl font-bold text-white mb-4">Our Commitment</h2>
              <p className="text-[#a0a0a0] mb-4">
                Cognify is committed to protecting the privacy and security of your personal data. We implement comprehensive data protection measures to ensure your information is safe and used responsibly.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-[#1a1a1a] p-4 rounded-lg">
                  <Shield className="w-8 h-8 text-[#D4AF37] mb-2" />
                  <h3 className="text-white font-semibold mb-1">Secure Storage</h3>
                  <p className="text-sm text-[#a0a0a0]">Encrypted databases with access controls</p>
                </div>
                <div className="bg-[#1a1a1a] p-4 rounded-lg">
                  <Lock className="w-8 h-8 text-[#D4AF37] mb-2" />
                  <h3 className="text-white font-semibold mb-1">Data Encryption</h3>
                  <p className="text-sm text-[#a0a0a0]">SSL/TLS encryption for all data transfers</p>
                </div>
                <div className="bg-[#1a1a1a] p-4 rounded-lg">
                  <Eye className="w-8 h-8 text-[#D4AF37] mb-2" />
                  <h3 className="text-white font-semibold mb-1">Transparency</h3>
                  <p className="text-sm text-[#a0a0a0]">Clear information about data usage</p>
                </div>
                <div className="bg-[#1a1a1a] p-4 rounded-lg">
                  <FileCheck className="w-8 h-8 text-[#D4AF37] mb-2" />
                  <h3 className="text-white font-semibold mb-1">Compliance</h3>
                  <p className="text-sm text-[#a0a0a0]">Full regulatory compliance</p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">Data We Collect</h2>
              <ul className="list-disc list-inside text-[#a0a0a0] space-y-2">
                <li>Personal identification information (name, email, phone)</li>
                <li>Academic data (grades, subjects, progress)</li>
                <li>Usage data (time spent, features used, performance)</li>
                <li>Device information (browser, OS, IP address)</li>
                <li>Payment information (processed securely through PCI-DSS compliant providers)</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">How We Protect Your Data</h2>
              <div className="space-y-4">
                <div className="border-l-4 border-[#D4AF37] pl-4">
                  <h3 className="text-white font-semibold mb-1">Encryption</h3>
                  <p className="text-[#a0a0a0]">All data is encrypted at rest using AES-256 encryption and in transit using TLS 1.3</p>
                </div>
                <div className="border-l-4 border-[#D4AF37] pl-4">
                  <h3 className="text-white font-semibold mb-1">Access Control</h3>
                  <p className="text-[#a0a0a0]">Strict access controls with multi-factor authentication for all administrative access</p>
                </div>
                <div className="border-l-4 border-[#D4AF37] pl-4">
                  <h3 className="text-white font-semibold mb-1">Regular Audits</h3>
                  <p className="text-[#a0a0a0]">Quarterly security audits and vulnerability assessments</p>
                </div>
                <div className="border-l-4 border-[#D4AF37] pl-4">
                  <h3 className="text-white font-semibold mb-1">Data Backup</h3>
                  <p className="text-[#a0a0a0]">Daily automated backups with redundant storage across multiple geographic locations</p>
                </div>
                <div className="border-l-4 border-[#D4AF37] pl-4">
                  <h3 className="text-white font-semibold mb-1">Incident Response</h3>
                  <p className="text-[#a0a0a0]">24/7 monitoring and incident response team</p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">Your Data Rights</h2>
              <p className="text-[#a0a0a0] mb-3">You have the following rights under data protection laws:</p>
              <ul className="list-disc list-inside text-[#a0a0a0] space-y-2">
                <li><strong>Right to Access:</strong> Request a copy of your personal data</li>
                <li><strong>Right to Rectification:</strong> Correct inaccurate or incomplete data</li>
                <li><strong>Right to Erasure:</strong> Request deletion of your personal data</li>
                <li><strong>Right to Portability:</strong> Receive your data in a machine-readable format</li>
                <li><strong>Right to Object:</strong> Object to certain data processing activities</li>
                <li><strong>Right to Restrict Processing:</strong> Limit how we use your data</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">Data Retention</h2>
              <p className="text-[#a0a0a0] mb-3">
                We retain your personal data only as long as necessary for:
              </p>
              <ul className="list-disc list-inside text-[#a0a0a0] space-y-2">
                <li>Providing our services</li>
                <li>Complying with legal obligations</li>
                <li>Resolving disputes</li>
                <li>Enforcing our agreements</li>
              </ul>
              <p className="text-[#a0a0a0] mt-4">
                Academic data is retained for 3 years after account closure unless required by law.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">Compliance</h2>
              <p className="text-[#a0a0a0] mb-4">
                Cognify complies with all applicable data protection regulations, including:
              </p>
              <ul className="list-disc list-inside text-[#a0a0a0] space-y-2">
                <li>Information Technology Act, 2000 (India)</li>
                <li>SPDI Rules (Sensitive Personal Data or Information)</li>
                <li>PCI-DSS (Payment Card Industry Data Security Standard)</li>
                <li>General Data Protection Regulation (GDPR) for EU users</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">Contact</h2>
              <p className="text-[#a0a0a0] mb-3">
                For data protection inquiries, please contact:
              </p>
              <ul className="text-[#a0a0a0] space-y-2">
                <li><strong>Data Protection Officer:</strong> dpo@cognify.com</li>
                <li><strong>General Inquiries:</strong> privacy@cognify.com</li>
                <li><strong>Phone:</strong> +91 7207842641</li>
                <li><strong>Address:</strong> Medchal, Telangana, India</li>
              </ul>
            </section>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
