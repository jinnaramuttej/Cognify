'use client';

import { Button } from '@/components/ui/button';
import { Check } from 'lucide-react';

interface PricingCardProps {
  name: string;
  price: string;
  billed?: string;
  description: string;
  features: string[];
  buttonText: string;
  buttonVariant: 'primary' | 'secondary' | 'outline';
  isPopular?: boolean;
  onClick: () => void;
}

function PricingCard({
  name,
  price,
  billed,
  description,
  features,
  buttonText,
  buttonVariant,
  isPopular,
  onClick,
}: PricingCardProps) {
  const getButtonClass = () => {
    switch (buttonVariant) {
      case 'primary':
        return 'bg-blue-600 text-white hover:bg-blue-700';
      case 'secondary':
        return 'bg-blue-600 text-white hover:bg-blue-700';
      case 'outline':
        return 'border border-blue-600 text-blue-600 hover:bg-blue-50';
      default:
        return 'bg-blue-600 text-white hover:bg-blue-700';
    }
  };

  return (
    <div className="relative bg-white border border-blue-200 border-t-[3px] border-t-blue-600 rounded-xl p-8 hover:border-blue-400 hover:shadow-lg transition-all duration-300">
      {isPopular && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          <span className="bg-blue-600 text-white text-xs font-bold px-4 py-1 rounded-full">
            MOST POPULAR
          </span>
        </div>
      )}
      <div className="mb-8">
        <h3 className="text-2xl font-bold text-blue-600 mb-2">{name}</h3>
        <div className="mb-2">
          <span className="text-3xl font-bold text-slate-900">{price}</span>
          {billed && <p className="text-sm text-slate-500 mt-1">{billed}</p>}
        </div>
        <p className="text-sm text-slate-600">{description}</p>
      </div>
      <ul className="space-y-3 mb-8">
        {features.map((feature, index) => (
          <li key={index} className="flex items-start gap-3 text-sm text-slate-600">
            <Check size={16} className="text-blue-600 mt-0.5 flex-shrink-0" />
            <span>{feature}</span>
          </li>
        ))}
      </ul>
      <Button onClick={onClick} className={`w-full h-12 text-base font-semibold transition-all duration-300 ${getButtonClass()}`}>
        {buttonText}
      </Button>
    </div>
  );
}

interface PricingProps {
  onPlanClick: (plan: string) => void;
}

export default function Pricing({ onPlanClick }: PricingProps) {
  return (
    <section id="pricing" className="py-20 md:py-24 lg:py-32 px-4 md:px-6 lg:px-8">
      <div className="container mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">Choose Your Plan</h2>
          <p className="text-base md:text-lg text-slate-600 max-w-2xl mx-auto">
            Flexible pricing options for every learner. Start free, upgrade anytime.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
          <PricingCard
            name="FREE"
            price="₹0/month"
            description="Perfect for exploring"
            features={[
              '5 video lessons/month',
              'Basic flashcards (up to 50)',
              'Limited practice questions',
              'Community Q&A access',
              'Ads shown',
            ]}
            buttonText="Start Free"
            buttonVariant="outline"
            onClick={() => onPlanClick('free')}
          />
          <PricingCard
            name="STANDARD"
            price="₹149/month"
            billed="or ₹1,788/year (save 20%)"
            description="For regular learners"
            features={[
              'Unlimited video lessons',
              'AI Mentor (24/7 access)',
              'Unlimited flashcards',
              '500+ practice questions/month',
              'Progress analytics',
              'Offline downloads',
              'Ad-free',
            ]}
            buttonText="Start Free Trial"
            buttonVariant="primary"
            isPopular
            onClick={() => onPlanClick('standard')}
          />
          <PricingCard
            name="PREMIUM"
            price="₹299/month"
            billed="or ₹3,588/year (save 20%)"
            description="For serious learners"
            features={[
              'Everything in Standard',
              'Advanced AI Mentor (priority support)',
              'Teacher Tools (upload content, create quizzes)',
              'Parent Portal (tracking, alerts)',
              'Performance predictions',
              'Study planner (AI-generated)',
              '1 free tutor session/month',
            ]}
            buttonText="Start Free Trial"
            buttonVariant="primary"
            onClick={() => onPlanClick('premium')}
          />
          <PricingCard
            name="INSTITUTIONAL"
            price="₹350/student/year"
            description="For schools & coaching"
            features={[
              'All Premium features',
              'White-label LMS',
              'Bulk user management',
              'School admin dashboard',
              'SIS integration',
              'Custom branding',
              'Dedicated support',
              'Analytics & reports',
            ]}
            buttonText="Contact Sales"
            buttonVariant="outline"
            onClick={() => onPlanClick('institutional')}
          />
        </div>
      </div>
    </section>
  );
}
