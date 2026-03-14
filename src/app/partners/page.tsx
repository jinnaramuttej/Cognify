'use client';

import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Building2, Check, Star, Award, ArrowRight, Mail } from 'lucide-react';
import Link from 'next/link';

export default function PartnersPage() {
  const partners = [
    {
      name: 'EdTech India',
      type: 'Strategic Partner',
      logo: '🏫',
      testimonial: 'Cognify has transformed how our students learn. The AI mentor provides personalized attention that was previously impossible at scale.',
      author: 'Rajesh Kumar, CEO',
    },
    {
      name: 'Coaching Plus',
      type: 'Content Partner',
      logo: '📚',
      testimonial: 'Partnering with Cognify has allowed us to reach more students while maintaining the quality of our educational content.',
      author: 'Priya Singh, Director',
    },
    {
      name: 'LearnFast Academy',
      type: 'Technology Partner',
      logo: '💻',
      testimonial: 'The platform\'s advanced analytics and reporting have helped us identify student needs faster and more accurately.',
      author: 'Vikram Reddy, Head of Tech',
    },
  ];

  const benefits = [
    {
      icon: Star,
      title: 'White-Label Solution',
      description: 'Brand our platform as your own with custom logos, colors, and domain.',
    },
    {
      icon: Award,
      title: 'Revenue Sharing',
      description: 'Earn commissions on student enrollments from your referrals.',
    },
    {
      icon: Building2,
      title: 'Bulk Pricing',
      description: 'Special institutional pricing for schools and coaching centers.',
    },
    {
      icon: Check,
      title: 'Dedicated Support',
      description: 'Priority support and dedicated account manager for partners.',
    },
  ];

  return (
    <div className="min-h-screen bg-[#1a1a1a]">
      {/* Hero Section */}
      <section className="relative py-20 md:py-32 px-4">
        <div className="container mx-auto max-w-4xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Building2 className="w-16 h-16 text-[#D4AF37] mx-auto mb-6" />
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
              Partner{' '}
              <span className="text-[#D4AF37]">With Us</span>
            </h1>
            <p className="text-xl text-[#a0a0a0] mb-8">
              Join our network of educational institutions and transform learning together.
              We offer flexible partnership programs for schools, coaching centers, and
              EdTech companies.
            </p>
            <Link href="/contact">
              <Button className="bg-[#D4AF37] text-black hover:bg-[#aa8c2c]">
                Become a Partner
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-16 px-4 bg-[#0a0a0a]">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-3xl font-bold text-white text-center mb-12">
            Partnership Benefits
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {benefits.map((benefit, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Card className="bg-[#1a1a1a] border-[#D4AF37]/20">
                  <CardContent className="pt-6">
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0 p-3 bg-[#D4AF37]/10 rounded-lg">
                        <benefit.icon className="w-6 h-6 text-[#D4AF37]" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-white mb-2">
                          {benefit.title}
                        </h3>
                        <p className="text-[#a0a0a0]">{benefit.description}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Partner Types */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-3xl font-bold text-white text-center mb-12">
            Partnership Programs
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="bg-[#0a0a0a] border-[#D4AF37]/20">
              <CardContent className="pt-6 text-center">
                <div className="text-5xl mb-4">🏫</div>
                <h3 className="text-xl font-bold text-white mb-2">
                  Schools & Colleges
                </h3>
                <p className="text-[#a0a0a0] mb-4">
                  Integrate Cognify into your curriculum with custom branding and
                  institutional pricing.
                </p>
                <Button
                  variant="outline"
                  className="w-full border-[#D4AF37]/30 text-[#D4AF37] hover:bg-[#D4AF37]/10"
                >
                  Learn More
                </Button>
              </CardContent>
            </Card>
            <Card className="bg-[#0a0a0a] border-[#D4AF37]/20">
              <CardContent className="pt-6 text-center">
                <div className="text-5xl mb-4">📚</div>
                <h3 className="text-xl font-bold text-white mb-2">
                  Coaching Centers
                </h3>
                <p className="text-[#a0a0a0] mb-4">
                  Enhance your coaching with AI-powered tools and expand your reach
                  online.
                </p>
                <Button
                  variant="outline"
                  className="w-full border-[#D4AF37]/30 text-[#D4AF37] hover:bg-[#D4AF37]/10"
                >
                  Learn More
                </Button>
              </CardContent>
            </Card>
            <Card className="bg-[#0a0a0a] border-[#D4AF37]/20">
              <CardContent className="pt-6 text-center">
                <div className="text-5xl mb-4">🤝</div>
                <h3 className="text-xl font-bold text-white mb-2">
                  EdTech Companies
                </h3>
                <p className="text-[#a0a0a0] mb-4">
                  API integration and technology partnerships for mutual growth and
                  innovation.
                </p>
                <Button
                  variant="outline"
                  className="w-full border-[#D4AF37]/30 text-[#D4AF37] hover:bg-[#D4AF37]/10"
                >
                  Learn More
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 px-4 bg-[#0a0a0a]">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-3xl font-bold text-white text-center mb-12">
            What Our Partners Say
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {partners.map((partner, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Card className="bg-[#1a1a1a] border-[#D4AF37]/20 h-full">
                  <CardContent className="pt-6">
                    <div className="text-center mb-4">
                      <div className="text-5xl mb-2">{partner.logo}</div>
                      <div className="px-3 py-1 bg-[#D4AF37]/10 text-[#D4AF37] text-xs rounded-full inline-block">
                        {partner.type}
                      </div>
                    </div>
                    <h3 className="text-lg font-bold text-white mb-2">
                      {partner.name}
                    </h3>
                    <p className="text-[#a0a0a0] text-sm mb-4 italic">
                      "{partner.testimonial}"
                    </p>
                    <div className="flex items-center gap-1 text-sm text-[#D4AF37]">
                      <span>{partner.author}</span>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-4xl text-center">
          <Card className="bg-gradient-to-br from-[#D4AF37]/20 to-[#aa8c2d]/20 border-[#D4AF37]/40">
            <CardContent className="pt-8 pb-8 px-6">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                Ready to Partner?
              </h2>
              <p className="text-[#a0a0a0] mb-6">
                Let's discuss how we can work together to transform education.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/contact">
                  <Button className="bg-[#D4AF37] text-black hover:bg-[#aa8c2c] flex items-center gap-2">
                    Contact Sales <Mail size={20} />
                  </Button>
                </Link>
                <Button
                  variant="outline"
                  className="border-[#D4AF37]/30 text-[#D4AF37] hover:bg-[#D4AF37]/10"
                >
                  Download Partnership Deck <ArrowRight size={20} className="ml-2" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}
