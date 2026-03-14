'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Shield, Award, FileCheck, Globe, Lock, UserCheck } from 'lucide-react';

export default function CompliancePage() {
  const certifications = [
    {
      icon: Shield,
      title: 'ISO 27001:2013',
      description: 'Information Security Management System certified',
      status: 'Certified',
    },
    {
      icon: Lock,
      title: 'PCI-DSS Level 1',
      description: 'Payment Card Industry Data Security Standard compliance',
      status: 'Compliant',
    },
    {
      icon: FileCheck,
      title: 'IT Act Compliance',
      description: 'Indian Information Technology Act, 2000',
      status: 'Compliant',
    },
    {
      icon: Globe,
      title: 'GDPR Ready',
      description: 'General Data Protection Regulation for EU users',
      status: 'Ready',
    },
    {
      icon: UserCheck,
      title: 'COPPA Compliant',
      description: 'Children\'s Online Privacy Protection Act',
      status: 'Compliant',
    },
    {
      icon: Award,
      title: 'ISO 9001:2015',
      description: 'Quality Management System certified',
      status: 'Certified',
    },
  ];

  return (
    <div className="min-h-screen bg-[#1a1a1a] py-16 px-4">
      <div className="container mx-auto max-w-5xl">
        <div className="mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Compliance & Certifications
          </h1>
          <p className="text-[#a0a0a0]">
            Your trust is our priority. Learn about our compliance certifications and security standards.
          </p>
        </div>

        {/* Trust Banner */}
        <Card className="bg-gradient-to-br from-[#D4AF37]/20 to-[#aa8c2d]/20 border-[#D4AF37]/40 mb-8">
          <CardContent className="pt-8 pb-8 px-6 text-center">
            <Shield className="w-16 h-16 text-[#D4AF37] mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-2">
              Enterprise-Grade Security
            </h2>
            <p className="text-[#a0a0a0] max-w-2xl mx-auto">
              Cognify maintains the highest standards of security, privacy, and compliance.
              Our platform undergoes regular audits and assessments to ensure your data is always protected.
            </p>
          </CardContent>
        </Card>

        {/* Certifications Grid */}
        <h2 className="text-2xl font-bold text-white mb-6">Our Certifications</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {certifications.map((cert, index) => (
            <Card key={index} className="bg-[#0a0a0a] border-[#D4AF37]/20 hover:border-[#D4AF37]/50 transition-all">
              <CardContent className="pt-6">
                <cert.icon className="w-10 h-10 text-[#D4AF37] mb-4" />
                <div className="flex items-start justify-between mb-2">
                  <h3 className="text-lg font-bold text-white">{cert.title}</h3>
                  <Badge className="bg-[#D4AF37]/20 text-[#D4AF37] text-xs">
                    {cert.status}
                  </Badge>
                </div>
                <p className="text-sm text-[#a0a0a0]">{cert.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Security Standards */}
        <h2 className="text-2xl font-bold text-white mb-6">Security Standards</h2>
        <Card className="bg-[#0a0a0a] border-[#D4AF37]/20 mb-8">
          <CardContent className="pt-8 pb-8 px-6">
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-semibold text-white mb-3">Data Protection</h3>
                <ul className="text-[#a0a0a0] space-y-2">
                  <li>• AES-256 encryption for data at rest</li>
                  <li>• TLS 1.3 for data in transit</li>
                  <li>• Multi-factor authentication required for access</li>
                  <li>• Regular penetration testing and vulnerability assessments</li>
                </ul>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-white mb-3">Privacy Compliance</h3>
                <ul className="text-[#a0a0a0] space-y-2">
                  <li>• SPDI Rules compliance (India)</li>
                  <li>• GDPR alignment for EU users</li>
                  <li>• COPPA compliance for users under 13</li>
                  <li>• Transparent data processing practices</li>
                </ul>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-white mb-3">Payment Security</h3>
                <ul className="text-[#a0a0a0] space-y-2">
                  <li>• PCI-DSS Level 1 compliant payment processing</li>
                  <li>• No storage of complete payment card data</li>
                  <li>• Tokenization and secure payment gateways</li>
                  <li>• Fraud detection and prevention systems</li>
                </ul>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-white mb-3">Operational Security</h3>
                <ul className="text-[#a0a0a0] space-y-2">
                  <li>• 24/7 security monitoring</li>
                  <li>• Incident response team on standby</li>
                  <li>• Business continuity and disaster recovery plans</li>
                  <li>• Regular security awareness training for staff</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Legal Framework */}
        <h2 className="text-2xl font-bold text-white mb-6">Legal Framework</h2>
        <Card className="bg-[#0a0a0a] border-[#D4AF37]/20">
          <CardContent className="pt-8 pb-8 px-6">
            <div className="space-y-4">
              <div className="border-l-4 border-[#D4AF37] pl-4">
                <h3 className="text-white font-semibold mb-1">India</h3>
                <p className="text-[#a0a0a0] text-sm">Information Technology Act, 2000 | SPDI Rules | Digital Personal Data Protection Bill</p>
              </div>
              <div className="border-l-4 border-[#D4AF37] pl-4">
                <h3 className="text-white font-semibold mb-1">European Union</h3>
                <p className="text-[#a0a0a0] text-sm">General Data Protection Regulation (GDPR) | ePrivacy Directive</p>
              </div>
              <div className="border-l-4 border-[#D4AF37] pl-4">
                <h3 className="text-white font-semibold mb-1">United States</h3>
                <p className="text-[#a0a0a0] text-sm">COPPA | California Consumer Privacy Act (CCPA) | FERPA alignment</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
