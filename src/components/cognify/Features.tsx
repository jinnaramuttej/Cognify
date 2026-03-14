'use client';

import { Bot, Brain, Target, Trophy, TrendingUp, Download } from 'lucide-react';

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

function FeatureCard({ icon, title, description }: FeatureCardProps) {
  return (
    <div className="bg-white border border-blue-200 rounded-xl p-6 hover:border-blue-400 hover:shadow-lg transition-all duration-300 group">
      <div className="text-blue-600 mb-5">{icon}</div>
      <h3 className="text-lg font-bold text-slate-900 mb-3">{title}</h3>
      <p className="text-sm text-slate-600 mb-4 leading-relaxed">{description}</p>
      <button className="text-blue-600 text-xs font-semibold hover:underline transition-all">
        Learn More
      </button>
    </div>
  );
}

export default function Features() {
  const features = [
    {
      icon: <Bot size={48} />,
      title: '24/7 AI Mentor',
      description: 'Get instant help with any concept. Your personal AI tutor explains topics, answers questions, and adapts to your learning style.',
    },
    {
      icon: <Brain size={48} />,
      title: 'Adaptive Learning Paths',
      description: 'Our system tracks your progress in real-time and adjusts difficulty, pace, and content to match your learning speed.',
    },
    {
      icon: <Target size={48} />,
      title: 'Unlimited Practice',
      description: 'Access thousands of questions across subjects. Get instant feedback, detailed explanations, and performance analytics.',
    },
    {
      icon: <Trophy size={48} />,
      title: 'Gamified Learning',
      description: 'Earn points, unlock badges, climb leaderboards. Make learning fun and stay motivated with real-time rewards.',
    },
    {
      icon: <TrendingUp size={48} />,
      title: 'Real-Time Analytics',
      description: 'See detailed progress reports, identify weak areas, track study hours, and get AI-powered improvement recommendations.',
    },
    {
      icon: <Download size={48} />,
      title: 'Learn Offline',
      description: 'Download lessons, flashcards, and notes. Study anywhere—on trains, buses, or anywhere without internet.',
    },
  ];

  return (
    <section id="features" className="py-20 md:py-24 lg:py-32 px-4 md:px-6 lg:px-8">
      <div className="container mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">Why Choose Cognify?</h2>
          <p className="text-base md:text-lg text-slate-600 max-w-2xl mx-auto">
            Discover the features that make learning with Cognify truly transformative
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-6 lg:gap-6">
          {features.map((feature, index) => (
            <FeatureCard
              key={index}
              icon={feature.icon}
              title={feature.title}
              description={feature.description}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
