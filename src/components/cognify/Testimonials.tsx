'use client';

import { useState, useEffect } from 'react';
import { Star } from 'lucide-react';

interface Testimonial {
  quote: string;
  author: string;
  location: string;
  initials: string;
}

const testimonials: Testimonial[] = [
  {
    quote: 'I improved from 65% to 88% in just 3 months. The AI mentor explains better than my coaching teacher!',
    author: 'Priya, JEE Aspirant',
    location: 'Mumbai, Maharashtra',
    initials: 'P',
  },
  {
    quote: 'Saves me 15+ hours/week on grading. My students are more engaged than ever before.',
    author: 'Mr. Sharma, Math Teacher',
    location: 'Delhi, India',
    initials: 'S',
  },
  {
    quote: 'Finally, I can see exactly what my child is studying and how they\'re progressing. Worth every rupee!',
    author: 'Mrs. Gupta, Parent',
    location: 'Bangalore, Karnataka',
    initials: 'G',
  },
];

function TestimonialCard({ testimonial }: { testimonial: Testimonial }) {
  return (
    <div className="bg-white border border-blue-100 rounded-xl p-8 h-full flex flex-col shadow-sm">
      <div className="flex mb-4">
        {[...Array(5)].map((_, i) => (
          <Star key={i} size={16} className="text-blue-500 fill-blue-500" />
        ))}
      </div>
      <p className="text-base italic text-slate-600 mb-6 flex-grow leading-relaxed">
        "{testimonial.quote}"
      </p>
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
          <span className="text-blue-600 font-bold text-lg">{testimonial.initials}</span>
        </div>
        <div>
          <p className="text-sm font-semibold text-slate-900">{testimonial.author}</p>
          <p className="text-xs text-slate-500">{testimonial.location}</p>
        </div>
      </div>
    </div>
  );
}

export default function Testimonials() {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % testimonials.length);
    }, 5000);

    return () => clearInterval(timer);
  }, []);

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
  };

  return (
    <section className="py-16 md:py-20 lg:py-24 px-4 md:px-6 lg:px-8 border-y border-slate-200 bg-slate-50">
      <div className="container mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">What Our Users Say</h2>
          <p className="text-base md:text-lg text-slate-600 max-w-2xl mx-auto">
            Hear from students, teachers, and parents who have transformed their learning journey
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-6 lg:gap-6">
          {testimonials.map((testimonial, index) => (
            <TestimonialCard key={index} testimonial={testimonial} />
          ))}
        </div>

        {/* Carousel dots */}
        <div className="flex justify-center gap-2 mt-8">
          {testimonials.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                index === currentIndex ? 'bg-blue-600' : 'bg-blue-200'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
