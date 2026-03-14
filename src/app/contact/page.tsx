'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Mail, Phone, MapPin, Send } from 'lucide-react';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    // Simulate API call
    setTimeout(() => {
      console.log('Form submitted:', formData);
      setIsSubmitting(false);
      setSubmitted(true);
      setFormData({ name: '', email: '', subject: '', message: '' });
    }, 1500);
  };

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
              Get in{' '}
              <span className="text-[#D4AF37]">Touch</span>
            </h1>
            <p className="text-xl text-[#a0a0a0] mb-8">
              Have questions? We'd love to hear from you. Send us a message and we'll
              respond as soon as possible.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Contact Info Section */}
      <section className="py-12 px-4 bg-[#0a0a0a]">
        <div className="container mx-auto max-w-5xl">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="bg-[#1a1a1a] border-[#D4AF37]/20 text-center">
              <CardContent className="pt-6">
                <Mail className="w-12 h-12 text-[#D4AF37] mx-auto mb-3" />
                <h3 className="text-lg font-bold text-white mb-2">Email</h3>
                <a href="mailto:support@cognify.com" className="text-[#a0a0a0] hover:text-[#D4AF37]">
                  support@cognify.com
                </a>
              </CardContent>
            </Card>
            <Card className="bg-[#1a1a1a] border-[#D4AF37]/20 text-center">
              <CardContent className="pt-6">
                <Phone className="w-12 h-12 text-[#D4AF37] mx-auto mb-3" />
                <h3 className="text-lg font-bold text-white mb-2">Phone</h3>
                <a href="tel:+917207842641" className="text-[#a0a0a0] hover:text-[#D4AF37]">
                  +91 7207842641
                </a>
              </CardContent>
            </Card>
            <Card className="bg-[#1a1a1a] border-[#D4AF37]/20 text-center">
              <CardContent className="pt-6">
                <MapPin className="w-12 h-12 text-[#D4AF37] mx-auto mb-3" />
                <h3 className="text-lg font-bold text-white mb-2">Location</h3>
                <p className="text-[#a0a0a0]">Medchal, Telangana, India</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Contact Form */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-2xl">
          <Card className="bg-[#0a0a0a] border-[#D4AF37]/20">
            <CardContent className="pt-8 pb-8 px-6">
              {submitted ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center py-12"
                >
                  <div className="text-6xl mb-4">✅</div>
                  <h2 className="text-2xl font-bold text-white mb-2">
                    Message Sent!
                  </h2>
                  <p className="text-[#a0a0a0]">
                    Thank you for reaching out. We'll get back to you soon.
                  </p>
                  <Button
                    onClick={() => setSubmitted(false)}
                    className="mt-6 bg-[#D4AF37] text-black hover:bg-[#aa8c2c]"
                  >
                    Send Another Message
                  </Button>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label className="block text-sm font-semibold text-[#D4AF37] mb-2">
                      Your Name
                    </label>
                    <Input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="John Doe"
                      required
                      className="bg-[#1a1a1a] border-[#D4AF37]/20 text-white placeholder:text-[#606060]"
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
                      className="bg-[#1a1a1a] border-[#D4AF37]/20 text-white placeholder:text-[#606060]"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-[#D4AF37] mb-2">
                      Subject
                    </label>
                    <Input
                      type="text"
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      placeholder="How can we help?"
                      required
                      className="bg-[#1a1a1a] border-[#D4AF37]/20 text-white placeholder:text-[#606060]"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-[#D4AF37] mb-2">
                      Message
                    </label>
                    <Textarea
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      placeholder="Tell us more..."
                      required
                      rows={6}
                      className="bg-[#1a1a1a] border-[#D4AF37]/20 text-white placeholder:text-[#606060]"
                    />
                  </div>
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-[#D4AF37] text-black hover:bg-[#aa8c2c] flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? (
                      'Sending...'
                    ) : (
                      <>
                        Send Message <Send size={20} />
                      </>
                    )}
                  </Button>
                </form>
              )}
            </CardContent>
          </Card>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 px-4 bg-[#0a0a0a]">
        <div className="container mx-auto max-w-3xl">
          <h2 className="text-3xl md:text-4xl font-bold text-white text-center mb-12">
            Frequently Asked Questions
          </h2>
          <div className="space-y-6">
            <Card className="bg-[#1a1a1a] border-[#D4AF37]/20">
              <CardContent className="pt-6">
                <h3 className="text-lg font-semibold text-white mb-2">
                  How quickly do you respond?
                </h3>
                <p className="text-[#a0a0a0]">
                  We typically respond within 24 hours on business days. For urgent
                  matters, please call us directly.
                </p>
              </CardContent>
            </Card>
            <Card className="bg-[#1a1a1a] border-[#D4AF37]/20">
              <CardContent className="pt-6">
                <h3 className="text-lg font-semibold text-white mb-2">
                  Do you offer technical support?
                </h3>
                <p className="text-[#a0a0a0]">
                  Yes, we offer technical support for all our users. Reach out to us
                  for any platform-related issues.
                </p>
              </CardContent>
            </Card>
            <Card className="bg-[#1a1a1a] border-[#D4AF37]/20">
              <CardContent className="pt-6">
                <h3 className="text-lg font-semibold text-white mb-2">
                  Can I schedule a demo?
                </h3>
                <p className="text-[#a0a0a0]">
                  Absolutely! Contact us to schedule a personalized demo of the
                  Cognify platform.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
}
