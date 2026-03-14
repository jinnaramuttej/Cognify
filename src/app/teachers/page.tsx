'use client';

import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Award, Star, GraduationCap } from 'lucide-react';

export default function TeachersPage() {
  const teachers = [
    {
      name: 'Dr. Priya Sharma',
      subject: 'Physics',
      experience: '15+ years',
      education: 'Ph.D. IIT Delhi',
      rating: 4.9,
      students: '5000+',
      description: 'Expert in Mechanics and Thermodynamics with a passion for making complex concepts simple.',
    },
    {
      name: 'Prof. Rajesh Kumar',
      subject: 'Chemistry',
      experience: '12+ years',
      education: 'M.Tech IIT Bombay',
      rating: 4.8,
      students: '4500+',
      description: 'Specializes in Organic Chemistry and reaction mechanisms.',
    },
    {
      name: 'Dr. Ananya Patel',
      subject: 'Biology',
      experience: '10+ years',
      education: 'Ph.D. AIIMS',
      rating: 4.9,
      students: '4000+',
      description: 'Expert in NEET Biology with focus on NCERT and diagram-based learning.',
    },
    {
      name: 'Prof. Suresh Reddy',
      subject: 'Mathematics',
      experience: '18+ years',
      education: 'M.Sc. IIT Madras',
      rating: 4.9,
      students: '6000+',
      description: 'Master of Calculus and Algebra with innovative teaching methods.',
    },
    {
      name: 'Dr. Kavita Singh',
      subject: 'Physics',
      experience: '8+ years',
      education: 'Ph.D. BITS Pilani',
      rating: 4.7,
      students: '3000+',
      description: 'Expert in Electricity and Magnetism with practical examples.',
    },
    {
      name: 'Prof. Vikram Mehta',
      subject: 'Chemistry',
      experience: '11+ years',
      education: 'M.Sc. IIT Kanpur',
      rating: 4.8,
      students: '3500+',
      description: 'Inorganic Chemistry specialist with memory techniques.',
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
            <div className="flex items-center justify-center gap-2 mb-4">
              <GraduationCap className="w-10 h-10 text-[#D4AF37]" />
            </div>
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
              Meet Our{' '}
              <span className="text-[#D4AF37]">Expert Teachers</span>
            </h1>
            <p className="text-xl text-[#a0a0a0] mb-8">
              Learn from the best minds in the country. Our faculty consists of IIT
              alumni and experienced educators dedicated to your success.
            </p>
            <Link href="/dashboard">
              <Button className="bg-[#D4AF37] text-black hover:bg-[#aa8c2c]">
                Start Learning
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 px-4 bg-[#0a0a0a]">
        <div className="container mx-auto max-w-5xl">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <Award className="w-12 h-12 text-[#D4AF37] mx-auto mb-3" />
              <div className="text-4xl font-bold text-white mb-2">50+</div>
              <p className="text-[#a0a0a0]">Expert Teachers</p>
            </div>
            <div className="text-center">
              <Star className="w-12 h-12 text-[#D4AF37] mx-auto mb-3" />
              <div className="text-4xl font-bold text-white mb-2">4.8+</div>
              <p className="text-[#a0a0a0]">Average Rating</p>
            </div>
            <div className="text-center">
              <GraduationCap className="w-12 h-12 text-[#D4AF37] mx-auto mb-3" />
              <div className="text-4xl font-bold text-white mb-2">10L+</div>
              <p className="text-[#a0a0a0]">Students Taught</p>
            </div>
          </div>
        </div>
      </section>

      {/* Teachers Grid */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-7xl">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {teachers.map((teacher, index) => (
              <motion.div
                key={teacher.name}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Card className="bg-[#0a0a0a] border-[#D4AF37]/20 hover:border-[#D4AF37]/50 transition-all h-full">
                  <CardContent className="pt-6 text-center">
                    <div className="w-24 h-24 mx-auto mb-4 bg-gradient-to-br from-[#D4AF37] to-[#aa8c2d] rounded-full flex items-center justify-center">
                      <span className="text-3xl font-bold text-white">
                        {teacher.name.split(' ').map(n => n[0]).join('')}
                      </span>
                    </div>
                    <h3 className="text-xl font-bold text-white mb-1">{teacher.name}</h3>
                    <p className="text-[#D4AF37] font-semibold mb-2">{teacher.subject}</p>
                    <p className="text-sm text-[#a0a0a0] mb-3">{teacher.education}</p>
                    <div className="flex items-center justify-center gap-4 text-sm text-[#a0a0a0] mb-4">
                      <span className="flex items-center gap-1">
                        <Award className="w-4 h-4 text-[#D4AF37]" />
                        {teacher.experience}
                      </span>
                      <span className="flex items-center gap-1">
                        <Star className="w-4 h-4 text-[#D4AF37] fill-[#D4AF37]" />
                        {teacher.rating}
                      </span>
                      <span>{teacher.students} students</span>
                    </div>
                    <p className="text-sm text-[#b0b0b0]">{teacher.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Our Teachers Section */}
      <section className="py-16 px-4 bg-[#0a0a0a]">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-8">
            Why Our Teachers Are Different
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="bg-[#1a1a1a] border-[#D4AF37]/20">
              <CardContent className="pt-6">
                <Award className="w-10 h-10 text-[#D4AF37] mx-auto mb-3" />
                <h3 className="text-lg font-bold text-white mb-2">IIT Alumni</h3>
                <p className="text-[#a0a0a0]">
                  Learn from those who have cracked the exams themselves
                </p>
              </CardContent>
            </Card>
            <Card className="bg-[#1a1a1a] border-[#D4AF37]/20">
              <CardContent className="pt-6">
                <Star className="w-10 h-10 text-[#D4AF37] mx-auto mb-3" />
                <h3 className="text-lg font-bold text-white mb-2">Highly Rated</h3>
                <p className="text-[#a0a0a0]">
                  Average rating of 4.8+ from thousands of students
                </p>
              </CardContent>
            </Card>
            <Card className="bg-[#1a1a1a] border-[#D4AF37]/20">
              <CardContent className="pt-6">
                <GraduationCap className="w-10 h-10 text-[#D4AF37] mx-auto mb-3" />
                <h3 className="text-lg font-bold text-white mb-2">Experienced</h3>
                <p className="text-[#a0a0a0]">
                  10+ years of teaching experience on average
                </p>
              </CardContent>
            </Card>
            <Card className="bg-[#1a1a1a] border-[#D4AF37]/20">
              <CardContent className="pt-6">
                <Award className="w-10 h-10 text-[#D4AF37] mx-auto mb-3" />
                <h3 className="text-lg font-bold text-white mb-2">Dedicated</h3>
                <p className="text-[#a0a0a0]">
                  Committed to every student's success
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-4xl text-center">
          <Card className="bg-gradient-to-br from-[#D4AF37]/20 to-[#aa8c2d]/20 border-[#D4AF37]/40">
            <CardContent className="pt-8 pb-8 px-6">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                Ready to Learn from the Best?
              </h2>
              <p className="text-[#a0a0a0] mb-6">
                Join Cognify and start your journey to success with India's top teachers.
              </p>
              <Link href="/dashboard">
                <Button className="bg-[#D4AF37] text-black hover:bg-[#aa8c2c]">
                  Get Started Free
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}
