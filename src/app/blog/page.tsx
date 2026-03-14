'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Calendar, Clock, ArrowRight, Search } from 'lucide-react';
import Link from 'next/link';

export default function BlogPage() {
  const [searchQuery, setSearchQuery] = useState('');

  const blogPosts = [
    {
      id: 1,
      title: 'How to Crack JEE Mains in 3 Months',
      excerpt: 'A comprehensive guide to strategize your JEE Mains preparation efficiently and effectively.',
      author: 'Dr. Priya Sharma',
      date: '2024-01-15',
      readTime: '8 min read',
      category: 'JEE Preparation',
      image: '🎯',
    },
    {
      id: 2,
      title: 'NEET Biology Topper Strategy',
      excerpt: 'Learn the techniques used by NEET toppers to score 360+ in Biology.',
      author: 'Dr. Ananya Patel',
      date: '2024-01-12',
      readTime: '6 min read',
      category: 'NEET Preparation',
      image: '🧬',
    },
    {
      id: 3,
      title: 'Mastering Organic Chemistry Reactions',
      excerpt: 'Tips and tricks to remember and understand complex organic chemistry mechanisms.',
      author: 'Prof. Rajesh Kumar',
      date: '2024-01-10',
      readTime: '10 min read',
      category: 'Chemistry',
      image: '⚗️',
    },
    {
      id: 4,
      title: 'Calculus Made Easy for JEE',
      excerpt: 'Step-by-step approach to mastering differentiation and integration.',
      author: 'Prof. Suresh Reddy',
      date: '2024-01-08',
      readTime: '12 min read',
      category: 'Mathematics',
      image: '📐',
    },
    {
      id: 5,
      title: 'Physics: Mechanics Problem Solving',
      excerpt: 'Common mistakes and how to avoid them in mechanics problems.',
      author: 'Dr. Kavita Singh',
      date: '2024-01-05',
      readTime: '7 min read',
      category: 'Physics',
      image: '⚡',
    },
    {
      id: 6,
      title: 'Time Management During Exams',
      excerpt: 'Strategies to maximize your score through effective time management.',
      author: 'Jinnaram Uttej',
      date: '2024-01-03',
      readTime: '5 min read',
      category: 'Study Tips',
      image: '⏱️',
    },
  ];

  const categories = [
    'All',
    'JEE Preparation',
    'NEET Preparation',
    'Physics',
    'Chemistry',
    'Biology',
    'Mathematics',
    'Study Tips',
  ];

  const [activeCategory, setActiveCategory] = useState('All');

  const filteredPosts = blogPosts.filter(post => {
    const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.excerpt.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = activeCategory === 'All' || post.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

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
              Cognify{' '}
              <span className="text-[#D4AF37]">Blog</span>
            </h1>
            <p className="text-xl text-[#a0a0a0] mb-8">
              Expert insights, study tips, and exam preparation strategies to help you
              succeed.
            </p>
            <div className="relative max-w-md mx-auto">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#a0a0a0] w-5 h-5" />
              <Input
                type="text"
                placeholder="Search articles..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-[#0a0a0a] border-[#D4AF37]/20 text-white placeholder:text-[#606060]"
              />
            </div>
          </motion.div>
        </div>
      </section>

      {/* Category Filter */}
      <section className="py-8 px-4 bg-[#0a0a0a]">
        <div className="container mx-auto max-w-4xl">
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setActiveCategory(category)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  activeCategory === category
                    ? 'bg-[#D4AF37] text-black'
                    : 'bg-[#1a1a1a] text-[#a0a0a0] hover:text-[#D4AF37]'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Blog Posts */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-7xl">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPosts.map((post, index) => (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Card className="bg-[#0a0a0a] border-[#D4AF37]/20 hover:border-[#D4AF37]/50 transition-all h-full group">
                  <CardContent className="pt-6">
                    <div className="text-5xl mb-4">{post.image}</div>
                    <span className="inline-block px-3 py-1 bg-[#D4AF37]/10 text-[#D4AF37] text-xs font-semibold rounded-full mb-3">
                      {post.category}
                    </span>
                    <h3 className="text-xl font-bold text-white mb-2 group-hover:text-[#D4AF37] transition-colors">
                      {post.title}
                    </h3>
                    <p className="text-[#a0a0a0] text-sm mb-4 line-clamp-3">
                      {post.excerpt}
                    </p>
                    <div className="flex items-center gap-4 text-xs text-[#606060] mb-4">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {new Date(post.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {post.readTime}
                      </span>
                      <span>By {post.author}</span>
                    </div>
                    <Button
                      variant="ghost"
                      className="w-full text-[#D4AF37] hover:bg-[#D4AF37]/10 group-hover:justify-between"
                    >
                      Read More <ArrowRight size={16} className="ml-2 group-hover:ml-0" />
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {filteredPosts.length === 0 && (
            <div className="text-center py-12">
              <p className="text-[#a0a0a0]">
                No articles found. Try a different search or category.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="py-16 px-4 bg-[#0a0a0a]">
        <div className="container mx-auto max-w-2xl text-center">
          <Card className="bg-gradient-to-br from-[#D4AF37]/20 to-[#aa8c2d]/20 border-[#D4AF37]/40">
            <CardContent className="pt-8 pb-8 px-6">
              <h2 className="text-3xl font-bold text-white mb-4">
                Subscribe to Our Newsletter
              </h2>
              <p className="text-[#a0a0a0] mb-6">
                Get the latest articles, tips, and exam updates delivered to your inbox.
              </p>
              <div className="flex gap-2">
                <Input
                  type="email"
                  placeholder="Enter your email"
                  className="flex-1 bg-[#1a1a1a] border-[#D4AF37]/20 text-white placeholder:text-[#606060]"
                />
                <Button className="bg-[#D4AF37] text-black hover:bg-[#aa8c2c]">
                  Subscribe
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}
