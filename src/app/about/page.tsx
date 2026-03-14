'use client';

import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Target, Lightbulb, Zap, Users, Award, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function AboutPage() {
  const milestones = [
    { year: '2024', event: 'Cognify Founded in Medchal' },
    { year: '2024 Q2', event: 'First 100 Students Join' },
    { year: '2024 Q3', event: 'Launch of AI Mentor System' },
    { year: '2025 Q1', event: 'Expansion to 8+ States' },
    { year: '2025 Q2', event: '500+ Active Students' },
    { year: '2026 Q1', event: 'Target: 10,000+ Students' },
  ];

  const values = [
    {
      icon: Target,
      title: 'Student-Centric',
      description: 'Every feature is designed with student success in mind.',
    },
    {
      icon: Lightbulb,
      title: 'Innovation',
      description: 'Leveraging cutting-edge AI to transform education.',
    },
    {
      icon: Zap,
      title: 'Accessibility',
      description: 'Quality education at 1/10th the cost of traditional tutoring.',
    },
    {
      icon: Users,
      title: 'Community',
      description: 'Building a supportive learning ecosystem.',
    },
    {
      icon: Award,
      title: 'Excellence',
      description: 'Committed to delivering the best educational outcomes.',
    },
    {
      icon: Globe,
      title: 'Scalability',
      description: 'Empowering students across India and beyond.',
    },
  ];

  const team = [
    {
      name: 'Jinnaram Uttej',
      role: 'Founder & CEO',
      description: 'Visionary leader passionate about democratizing education.',
    },
    {
      name: 'Dr. Priya Sharma',
      role: 'Head of AI Research',
      description: 'PhD in Machine Learning with 15+ years experience.',
    },
    {
      name: 'Rahul Kumar',
      role: 'Lead Developer',
      description: 'Full-stack expert building scalable EdTech solutions.',
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
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
              AI-Powered Education for{' '}
              <span className="text-[#D4AF37]">JEE/NEET</span>
            </h1>
            <p className="text-xl text-[#a0a0a0] mb-8">
              Founded by Jinnaram Uttej, Cognify is on a mission to make quality
              education accessible to every student through personalized AI learning.
            </p>
            <Link href="/dashboard">
              <Button className="bg-[#D4AF37] text-black hover:bg-[#aa8c2c]">
                Try Cognify Now
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-16 px-4 bg-[#0a0a0a]">
        <div className="container mx-auto max-w-6xl">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Our Mission
            </h2>
            <p className="text-lg text-[#a0a0a0] max-w-3xl mx-auto">
              To revolutionize education by making personalized learning accessible,
              affordable, and effective for every student preparing for competitive
              exams like JEE and NEET.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {values.map((value, index) => (
              <motion.div
                key={value.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Card className="bg-[#1a1a1a] border-[#D4AF37]/20 hover:border-[#D4AF37]/50 transition-all h-full">
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-3 bg-[#D4AF37]/10 rounded-lg">
                        <value.icon className="w-6 h-6 text-[#D4AF37]" />
                      </div>
                      <h3 className="text-xl font-bold text-white">{value.title}</h3>
                    </div>
                    <p className="text-[#a0a0a0]">{value.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline Section */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-4xl">
          <h2 className="text-3xl md:text-4xl font-bold text-white text-center mb-12">
            Our Journey
          </h2>
          <div className="space-y-8">
            {milestones.map((milestone, index) => (
              <motion.div
                key={milestone.year}
                initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="flex gap-4 items-start"
              >
                <div className="flex-shrink-0 w-24 text-right">
                  <span className="text-[#D4AF37] font-bold">{milestone.year}</span>
                </div>
                <div className="w-4 h-4 bg-[#D4AF37] rounded-full flex-shrink-0 mt-1"></div>
                <div className="flex-1 bg-[#0a0a0a] p-4 rounded-lg border border-[#D4AF37]/20">
                  <p className="text-white">{milestone.event}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-16 px-4 bg-[#0a0a0a]">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-3xl md:text-4xl font-bold text-white text-center mb-12">
            Meet the Team
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {team.map((member, index) => (
              <motion.div
                key={member.name}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Card className="bg-[#1a1a1a] border-[#D4AF37]/20 hover:border-[#D4AF37]/50 transition-all h-full">
                  <CardContent className="pt-6 text-center">
                    <div className="w-24 h-24 mx-auto mb-4 bg-[#D4AF37]/20 rounded-full flex items-center justify-center">
                      <span className="text-3xl font-bold text-[#D4AF37]">
                        {member.name.split(' ').map(n => n[0]).join('')}
                      </span>
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">{member.name}</h3>
                    <p className="text-[#D4AF37] text-sm mb-3">{member.role}</p>
                    <p className="text-[#a0a0a0] text-sm">{member.description}</p>
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
                Join Our Journey
              </h2>
              <p className="text-[#a0a0a0] mb-6">
                Be part of the education revolution. Start learning smarter today.
              </p>
              <Link href="/contact">
                <Button className="bg-[#D4AF37] text-black hover:bg-[#aa8c2c]">
                  Get in Touch
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}
