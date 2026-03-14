'use client';

import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, Star, Zap, Crown, Building2 } from 'lucide-react';
import Link from 'next/link';

export default function PricingPage() {
  const plans = [
    {
      name: 'Free',
      icon: Star,
      price: '₹0/month',
      description: 'Perfect for exploring Cognify',
      popular: false,
      features: [
        '5 video lessons/month',
        'Basic flashcards (up to 50)',
        'Limited practice questions',
        'Community Q&A access',
        'Basic progress tracking',
        'Ads shown',
      ],
      cta: 'Start Free',
      highlight: false,
    },
    {
      name: 'Standard',
      icon: Zap,
      price: '₹149/month',
      description: 'For regular learners',
      popular: true,
      features: [
        'Unlimited video lessons',
        'AI Mentor (24/7 access)',
        'Unlimited flashcards',
        '500+ practice questions/month',
        'Progress analytics',
        'Offline downloads',
        'Ad-free experience',
        'Priority support',
      ],
      cta: 'Start Free Trial',
      highlight: true,
    },
    {
      name: 'Premium',
      icon: Crown,
      price: '₹299/month',
      description: 'For serious learners',
      popular: false,
      features: [
        'Everything in Standard',
        'Advanced AI Mentor (priority)',
        'Teacher Tools (upload content)',
        'Parent Portal (tracking & alerts)',
        'Performance predictions',
        'AI-generated study planner',
        '1 free tutor session/month',
        'Mock test analysis',
      ],
      cta: 'Start Free Trial',
      highlight: false,
    },
    {
      name: 'Institutional',
      icon: Building2,
      price: '₹350/student/year',
      description: 'For schools & coaching centers',
      popular: false,
      features: [
        'All Premium features',
        'White-label LMS',
        'Bulk user management',
        'School admin dashboard',
        'SIS integration',
        'Custom branding',
        'Dedicated support',
        'Analytics & reports',
      ],
      cta: 'Contact Sales',
      highlight: false,
    },
  ];

  return (
    <div className="min-h-screen bg-[var(--background)]">
      {/* Hero Section */}
      <section className="relative py-20 md:py-32 px-4">
        <div className="container mx-auto max-w-4xl text-center text-[var(--foreground)]">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Simple, Transparent{' '}
              <span className="text-[var(--primary)]">Pricing</span>
            </h1>
            <p className="text-xl text-[var(--muted)] mb-8">
              Choose the perfect plan for your learning journey. No hidden fees, cancel
              anytime.
            </p>
            <div className="flex items-center justify-center gap-2 text-[var(--primary)]">
              <Check className="w-5 h-5" />
              <span className="font-medium">14-day free trial on all paid plans</span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="py-16 px-4 bg-[var(--background)]/50">
        <div className="container mx-auto max-w-7xl">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {plans.map((plan, index) => (
              <motion.div
                key={plan.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className={plan.highlight ? 'lg:scale-105 lg:z-10' : ''}
              >
                <Card
                  className={`h-full flex flex-col ${plan.highlight
                      ? 'bg-[var(--card)] border-[var(--primary)] shadow-[0_0_40px_rgba(212,175,55,0.2)]'
                      : 'bg-[var(--card)] border-[var(--border)] hover:border-[var(--primary)]/40'
                    } transition-all`}
                >
                  {plan.popular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10">
                      <Badge className="bg-[var(--primary)] text-black text-xs font-bold px-4 py-1">
                        MOST POPULAR
                      </Badge>
                    </div>
                  )}
                  <CardHeader className="pt-8 pb-4">
                    <div className="flex items-center gap-2 mb-2">
                      <plan.icon className={`w-6 h-6 ${plan.highlight ? 'text-[var(--primary)]' : 'text-[var(--muted)]'}`} />
                      <CardTitle className="text-[var(--foreground)]">{plan.name}</CardTitle>
                    </div>
                    <div className="text-3xl font-bold text-[var(--primary)] mb-2">
                      {plan.price}
                    </div>
                    <CardDescription className="text-[var(--muted)]">
                      {plan.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="flex-1 flex flex-col">
                    <ul className="space-y-3 mb-6 flex-1">
                      {plan.features.map((feature, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <Check className={`w-5 h-5 flex-shrink-0 mt-0.5 ${plan.highlight ? 'text-[var(--primary)]' : 'text-green-500'}`} />
                          <span className="text-sm text-[var(--muted)]">{feature}</span>
                        </li>
                      ))}
                    </ul>
                    <Link href="/auth/signup">
                      <Button
                        className={`w-full ${plan.highlight
                            ? 'bg-[var(--primary)] text-black hover:bg-[var(--primary)]/90 font-bold'
                            : 'bg-transparent text-[var(--foreground)] border border-[var(--border)] hover:border-[var(--primary)] hover:bg-[var(--primary)]/10'
                          }`}
                      >
                        {plan.cta}
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Comparison Section */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-5xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-[var(--foreground)] mb-4">
              Why Choose Cognify?
            </h2>
            <p className="text-lg text-[var(--muted)]">
              Better results at a fraction of the cost
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="text-5xl font-bold text-[var(--primary)] mb-2">10x</div>
              <p className="text-[var(--muted)]">More affordable than traditional coaching</p>
            </div>
            <div className="text-center">
              <div className="text-5xl font-bold text-[var(--primary)] mb-2">24/7</div>
              <p className="text-[var(--muted)]">AI mentor availability</p>
            </div>
            <div className="text-center">
              <div className="text-5xl font-bold text-[var(--primary)] mb-2">87%</div>
              <p className="text-[var(--muted)]">Average score improvement</p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 px-4 bg-[var(--background)]/50">
        <div className="container mx-auto max-w-3xl">
          <h2 className="text-3xl md:text-4xl font-bold text-[var(--foreground)] text-center mb-12">
            Frequently Asked Questions
          </h2>
          <div className="space-y-6">
            <Card className="bg-[var(--card)] border-[var(--border)]">
              <CardContent className="pt-6">
                <h3 className="text-lg font-semibold text-[var(--foreground)] mb-2">Can I cancel anytime?</h3>
                <p className="text-[var(--muted)]">
                  Yes! You can cancel your subscription at any time with no questions asked. Your access will continue until the end of your billing period.
                </p>
              </CardContent>
            </Card>
            <Card className="bg-[var(--card)] border-[var(--border)]">
              <CardContent className="pt-6">
                <h3 className="text-lg font-semibold text-[var(--foreground)] mb-2">Is there a free trial?</h3>
                <p className="text-[var(--muted)]">
                  Yes, all paid plans come with a 14-day free trial. No credit card required to start.
                </p>
              </CardContent>
            </Card>
            <Card className="bg-[var(--card)] border-[var(--border)]">
              <CardContent className="pt-6">
                <h3 className="text-lg font-semibold text-[var(--foreground)] mb-2">Can I switch plans?</h3>
                <p className="text-[var(--muted)]">
                  Absolutely! You can upgrade or downgrade your plan anytime from your dashboard.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-4xl text-center">
          <Card className="bg-gradient-to-br from-[var(--primary)]/10 to-[var(--primary)]/5 border-[var(--primary)]/20">
            <CardContent className="pt-8 pb-8 px-6">
              <h2 className="text-3xl md:text-4xl font-bold text-[var(--foreground)] mb-4">
                Start Learning Today
              </h2>
              <p className="text-[var(--muted)] mb-6">
                Join thousands of students already achieving their dreams with Cognify.
              </p>
              <Link href="/auth/signup">
                <Button className="bg-[var(--primary)] text-black hover:bg-[var(--primary)]/90 font-bold">
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
