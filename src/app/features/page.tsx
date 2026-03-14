'use client';

import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import {
  Bot,
  Brain,
  FileText,
  Trophy,
  BarChart3,
  Download,
  ArrowRight,
  Zap,
  Shield,
  Users,
  Clock,
  Sparkles,
} from 'lucide-react';

export default function FeaturesPage() {
  const coreFeatures = [

    {
      icon: Brain,
      title: 'Adaptive Learning Paths',
      description: 'Our intelligent system tracks your progress in real-time and automatically adjusts difficulty, pace, and content to match your learning speed and preferences.',
      color: 'text-purple-400',
      bgColor: 'bg-purple-400/10',
    },
    {
      icon: FileText,
      title: 'Unlimited Practice',
      description: 'Access thousands of practice questions across Physics, Chemistry, Biology, and Mathematics. Get instant feedback, detailed explanations, and performance analytics.',
      color: 'text-green-400',
      bgColor: 'bg-green-400/10',
    },
    {
      icon: Trophy,
      title: 'Gamified Learning',
      description: 'Earn points for every correct answer, unlock badges for achievements, climb leaderboards, and make learning fun with real-time rewards and recognition.',
      color: 'text-yellow-400',
      bgColor: 'bg-yellow-400/10',
    },
    {
      icon: BarChart3,
      title: 'Real-Time Analytics',
      description: 'See detailed progress reports, identify weak areas, track study hours, and get AI-powered improvement recommendations tailored to your needs.',
      color: 'text-pink-400',
      bgColor: 'bg-pink-400/10',
    },
    {
      icon: Download,
      title: 'Learn Offline',
      description: 'Download lessons, flashcards, notes, and practice questions. Study anywhere—on trains, buses, or anywhere without internet access.',
      color: 'text-cyan-400',
      bgColor: 'bg-cyan-400/10',
    },
  ];

  const advancedFeatures = [
    {
      icon: Shield,
      title: 'Exam Simulation',
      description: 'Practice with full-length mock tests that simulate actual JEE/NEET exam conditions with timer, negative marking, and difficulty levels.',
    },
    {
      icon: Users,
      title: 'Peer Learning',
      description: 'Connect with fellow students, discuss concepts, share notes, and learn collaboratively in study groups.',
    },
    {
      icon: Clock,
      title: 'Smart Reminders',
      description: 'AI-powered study reminders that know your schedule and help you maintain consistent study habits.',
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
              Powerful Features for{' '}
              <span className="text-blue-400">Smarter Learning</span>
            </h1>
            <p className="text-xl text-[#a0a0a0] mb-8">
              Everything you need to ace JEE and NEET, powered by cutting-edge AI
              technology and backed by educational expertise.
            </p>
            <Link href="/dashboard">
              <Button className="bg-blue-600 text-white hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-400 font-bold px-8 h-12 rounded-xl">
                Try All Features
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Core Features Section */}
      <section className="py-16 px-4 bg-[#0a0a0a]">
        <div className="container mx-auto max-w-7xl">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Core Features
            </h2>
            <p className="text-lg text-[#a0a0a0] max-w-3xl mx-auto">
              Five powerful capabilities that transform how you prepare for competitive
              exams.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {coreFeatures.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Card className="bg-[#1a1a1a] border-blue-500/20 hover:border-blue-500/50 transition-all h-full group">
                  <CardContent className="pt-6">
                    <div className={`flex items-center gap-3 mb-4 ${feature.color}`}>
                      <div className={`p-3 ${feature.bgColor} rounded-lg group-hover:scale-110 transition-transform`}>
                        <feature.icon className="w-6 h-6" />
                      </div>
                      <h3 className="text-xl font-bold text-white">{feature.title}</h3>
                    </div>
                    <p className="text-[#a0a0a0]">{feature.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Advanced Features Section */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-7xl">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Advanced Capabilities
            </h2>
            <p className="text-lg text-[#a0a0a0] max-w-3xl mx-auto">
              More features designed to give you the competitive edge.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {advancedFeatures.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, x: index % 2 === 0 ? -30 : 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Card className="bg-[#0a0a0a] border-blue-500/20 hover:border-blue-500/40 transition-all">
                  <CardContent className="pt-6">
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0 p-3 bg-blue-500/10 rounded-lg">
                        <feature.icon className="w-6 h-6 text-blue-500" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-white mb-2">{feature.title}</h3>
                        <p className="text-[#a0a0a0]">{feature.description}</p>
                      </div>
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
        <div className="container mx-auto max-w-4xl">
          <Card className="bg-gradient-to-br from-blue-500/20 to-blue-700/20 border-blue-500/40">
            <CardContent className="pt-8 pb-8 px-6 text-center">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                Ready to Experience These Features?
              </h2>
              <p className="text-[#a0a0a0] mb-6">
                Start your free trial today and transform your JEE/NEET preparation.
              </p>
              <Link href="/dashboard">
                <Button className="bg-blue-600 text-white hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-400 font-bold px-10 h-14 rounded-2xl shadow-lg shadow-blue-500/20">
                  Get Started Free <ArrowRight className="ml-2" size={20} />
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}
