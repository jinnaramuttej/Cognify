'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MapPin, Briefcase, DollarSign, Send, Building } from 'lucide-react';

export default function CareersPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    position: '',
    experience: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    // Simulate API call
    setTimeout(() => {
      console.log('Application submitted:', formData);
      setIsSubmitting(false);
      setSubmitted(true);
      setFormData({ name: '', email: '', position: '', experience: '' });
    }, 1500);
  };

  const jobs = [
    {
      id: 1,
      title: 'Content Developer',
      department: 'Academic Content',
      location: 'Hyderabad / Remote',
      type: 'Full-time',
      salary: '₹8-12 LPA',
      description: 'Create high-quality educational content for JEE/NEET preparation. Work with subject matter experts to develop comprehensive study materials.',
      requirements: [
        'Strong understanding of Physics, Chemistry, or Mathematics',
        'Experience in academic content creation',
        'Excellent writing and communication skills',
        'B.Tech/M.Tech from IIT/NIT preferred',
      ],
    },
    {
      id: 2,
      title: 'AI Engineer',
      department: 'Technology',
      location: 'Hyderabad',
      type: 'Full-time',
      salary: '₹15-25 LPA',
      description: 'Build and maintain AI-powered learning systems. Work on cutting-edge NLP and machine learning models for education.',
      requirements: [
        '3+ years of experience in ML/AI',
        'Strong Python and TensorFlow/PyTorch skills',
        'Experience with NLP and LLMs',
        'B.Tech/M.Tech/PhD in CS or related field',
      ],
    },
    {
      id: 3,
      title: 'Frontend Developer',
      department: 'Technology',
      location: 'Hyderabad',
      type: 'Full-time',
      salary: '₹10-18 LPA',
      description: 'Build beautiful and intuitive user interfaces for our learning platform. Work with React, Next.js, and modern frontend technologies.',
      requirements: [
        '2+ years of React/Next.js experience',
        'Strong TypeScript and CSS skills',
        'Experience with responsive design',
        'Portfolio of previous work',
      ],
    },
    {
      id: 4,
      title: 'Product Manager',
      department: 'Product',
      location: 'Hybrid',
      type: 'Full-time',
      salary: '₹18-25 LPA',
      description: 'Lead product strategy and roadmap. Work closely with engineering, design, and academic teams to deliver exceptional user experiences.',
      requirements: [
        '4+ years of product management experience',
        'Experience in EdTech or consumer products',
        'Strong analytical and problem-solving skills',
        'MBA from top B-school preferred',
      ],
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
            <Building className="w-16 h-16 text-[#D4AF37] mx-auto mb-6" />
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
              Join Our{' '}
              <span className="text-[#D4AF37]">Team</span>
            </h1>
            <p className="text-xl text-[#a0a0a0] mb-8">
              Build the future of education with us. We're looking for passionate
              individuals who want to make a difference.
            </p>
            <div className="flex items-center justify-center gap-8 text-[#a0a0a0]">
              <div className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-[#D4AF37]" />
                <span>Hyderabad, India</span>
              </div>
              <div className="flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-[#D4AF37]" />
                <span>Open Positions</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Why Join Us */}
      <section className="py-16 px-4 bg-[#0a0a0a]">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-3xl font-bold text-white text-center mb-12">
            Why Work at Cognify?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="bg-[#1a1a1a] border-[#D4AF37]/20">
              <CardContent className="pt-6 text-center">
                <DollarSign className="w-12 h-12 text-[#D4AF37] mx-auto mb-4" />
                <h3 className="text-xl font-bold text-white mb-2">Competitive Pay</h3>
                <p className="text-[#a0a0a0]">
                  Market-leading compensation and performance bonuses
                </p>
              </CardContent>
            </Card>
            <Card className="bg-[#1a1a1a] border-[#D4AF37]/20">
              <CardContent className="pt-6 text-center">
                <Briefcase className="w-12 h-12 text-[#D4AF37] mx-auto mb-4" />
                <h3 className="text-xl font-bold text-white mb-2">Growth</h3>
                <p className="text-[#a0a0a0]">
                  Clear career paths and continuous learning opportunities
                </p>
              </CardContent>
            </Card>
            <Card className="bg-[#1a1a1a] border-[#D4AF37]/20">
              <CardContent className="pt-6 text-center">
                <Building className="w-12 h-12 text-[#D4AF37] mx-auto mb-4" />
                <h3 className="text-xl font-bold text-white mb-2">Impact</h3>
                <p className="text-[#a0a0a0]">
                  Make a real difference in students' lives
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Open Positions */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-3xl font-bold text-white mb-8">Open Positions</h2>
          <div className="space-y-6">
            {jobs.map((job, index) => (
              <motion.div
                key={job.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Card className="bg-[#0a0a0a] border-[#D4AF37]/20 hover:border-[#D4AF37]/50 transition-all">
                  <CardContent className="pt-6">
                    <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-4">
                      <div>
                        <h3 className="text-xl font-bold text-white mb-2">{job.title}</h3>
                        <div className="flex flex-wrap gap-3 text-sm text-[#a0a0a0]">
                          <span className="flex items-center gap-1">
                            <MapPin className="w-4 h-4" />
                            {job.location}
                          </span>
                          <span className="flex items-center gap-1">
                            <Briefcase className="w-4 h-4" />
                            {job.type}
                          </span>
                          <span className="flex items-center gap-1">
                            <DollarSign className="w-4 h-4" />
                            {job.salary}
                          </span>
                        </div>
                      </div>
                      <Button className="bg-[#D4AF37] text-black hover:bg-[#aa8c2c] whitespace-nowrap">
                        Apply Now
                      </Button>
                    </div>
                    <p className="text-[#a0a0a0] mb-4">{job.description}</p>
                    <div>
                      <h4 className="text-white font-semibold mb-2">Requirements:</h4>
                      <ul className="list-disc list-inside text-[#a0a0a0] space-y-1">
                        {job.requirements.map((req, idx) => (
                          <li key={idx}>{req}</li>
                        ))}
                      </ul>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Application Form */}
      <section className="py-16 px-4 bg-[#0a0a0a]">
        <div className="container mx-auto max-w-2xl">
          <Card className="bg-[#1a1a1a] border-[#D4AF37]/20">
            <CardContent className="pt-8 pb-8 px-6">
              {submitted ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center py-12"
                >
                  <div className="text-6xl mb-4">✅</div>
                  <h2 className="text-2xl font-bold text-white mb-2">
                    Application Received!
                  </h2>
                  <p className="text-[#a0a0a0]">
                    Thank you for your interest in Cognify. We'll review your application and get back to you soon.
                  </p>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <h2 className="text-2xl font-bold text-white mb-6">
                    General Application
                  </h2>
                  <div>
                    <label className="block text-sm font-semibold text-[#D4AF37] mb-2">
                      Full Name
                    </label>
                    <Input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="John Doe"
                      required
                      className="bg-[#0a0a0a] border-[#D4AF37]/20 text-white placeholder:text-[#606060]"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-[#D4AF37] mb-2">
                      Email Address
                    </label>
                    <Input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="john@example.com"
                      required
                      className="bg-[#0a0a0a] border-[#D4AF37]/20 text-white placeholder:text-[#606060]"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-[#D4AF37] mb-2">
                      Position of Interest
                    </label>
                    <Input
                      type="text"
                      value={formData.position}
                      onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                      placeholder="e.g., Frontend Developer"
                      required
                      className="bg-[#0a0a0a] border-[#D4AF37]/20 text-white placeholder:text-[#606060]"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-[#D4AF37] mb-2">
                      Years of Experience
                    </label>
                    <Input
                      type="text"
                      value={formData.experience}
                      onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                      placeholder="e.g., 3 years"
                      required
                      className="bg-[#0a0a0a] border-[#D4AF37]/20 text-white placeholder:text-[#606060]"
                    />
                  </div>
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-[#D4AF37] text-black hover:bg-[#aa8c2c] flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? (
                      'Submitting...'
                    ) : (
                      <>
                        Submit Application <Send size={20} />
                      </>
                    )}
                  </Button>
                </form>
              )}
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}
