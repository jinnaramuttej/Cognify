'use client';

import { motion, useScroll, useSpring, useTransform } from 'framer-motion';
import { useRef } from 'react';
import { Rocket, Bot, FileText, BarChart3, Flame } from 'lucide-react';

const steps = [
    {
        title: 'Start a Session',
        description: 'Login to your focused workspace designed for Class 11 & 12.',
        icon: Rocket,
        color: '#3b82f6',
        imageUrl: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=800&auto=format&fit=crop' // Digital workspace
    },

    {
        title: 'Convert Notes',
        description: 'Turn your handwritten notes or PDFs into interactive study guides.',
        icon: FileText,
        color: '#8b5cf6',
        imageUrl: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?q=80&w=800&auto=format&fit=crop' // Study/Books
    },
    {
        title: 'Track Progress',
        description: 'See exactly where you stand with deep performance analytics.',
        icon: BarChart3,
        color: '#10b981',
        imageUrl: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=800&auto=format&fit=crop' // Data/Charts
    },
    {
        title: 'Build Streaks',
        description: 'Stay consistent and earn reputation points every day.',
        icon: Flame,
        color: '#f97316',
        imageUrl: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?q=80&w=800&auto=format&fit=crop' // Success/Team
    },
];

export default function Roadmap() {
    const containerRef = useRef<HTMLDivElement>(null);
    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start center", "end center"]
    });

    const scaleY = useSpring(scrollYProgress, {
        stiffness: 100,
        damping: 30,
        restDelta: 0.001
    });

    return (
        <section id="roadmap" ref={containerRef} className="py-32 px-4 relative overflow-hidden">
            <div className="max-w-4xl mx-auto mb-20 text-center">
                <h2 className="text-4xl md:text-5xl font-bold mb-6">How Cognify Works</h2>
                <p className="text-xl text-muted-foreground">Your journey to academic excellence, simplified.</p>
            </div>

            <div className="max-w-5xl mx-auto relative">
                {/* Animated Line */}
                <div className="absolute left-8 md:left-1/2 top-0 bottom-0 w-[2px] bg-secondary hidden md:block" />
                <motion.div
                    style={{ scaleY, originY: 0 }}
                    className="absolute left-8 md:left-1/2 top-0 bottom-0 w-[2px] bg-blue-600 z-10 hidden md:block"
                />

                {/* Mobile Line */}
                <div className="absolute left-8 top-0 bottom-0 w-[2px] bg-secondary md:hidden" />
                <motion.div
                    style={{ scaleY, originY: 0 }}
                    className="absolute left-8 top-0 bottom-0 w-[2px] bg-blue-600 z-10 md:hidden"
                />

                <div className="space-y-32">
                    {steps.map((step, index) => (
                        <div key={index} className={`relative flex items-center ${index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'} gap-8 md:gap-24`}>
                            {/* Icon / Circle */}
                            <motion.div
                                initial={{ scale: 0, opacity: 0 }}
                                whileInView={{ scale: 1, opacity: 1 }}
                                viewport={{ once: true, margin: "-100px" }}
                                transition={{ duration: 0.5, delay: index * 0.1 }}
                                className="absolute left-8 md:left-1/2 -translate-x-1/2 w-12 h-12 rounded-full bg-card border-2 border-blue-500 z-20 flex items-center justify-center p-2 shadow-lg shadow-blue-500/20"
                            >
                                <step.icon className="w-full h-full text-blue-500" strokeWidth={1.5} />
                            </motion.div>

                            {/* Content Side */}
                            <motion.div
                                initial={{ x: index % 2 === 0 ? -50 : 50, opacity: 0 }}
                                whileInView={{ x: 0, opacity: 1 }}
                                viewport={{ once: true, margin: "-100px" }}
                                transition={{ duration: 0.7, delay: index * 0.1 }}
                                className={`w-full md:w-[45%] pl-20 md:pl-0 ${index % 2 === 0 ? 'md:text-right' : 'md:text-left'}`}
                            >
                                {(step as any).isFuture && (
                                    <span className="inline-block px-3 py-1 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 text-xs font-bold uppercase tracking-wider mb-4 border border-blue-500/20">
                                        Coming {(step as any).year}
                                    </span>
                                )}
                                <h3 className="text-3xl font-bold mb-4">{step.title}</h3>
                                <p className="text-xl text-muted-foreground leading-relaxed">{step.description}</p>
                            </motion.div>

                            {/* Image Side */}
                            <motion.div
                                initial={{ x: index % 2 === 0 ? 50 : -50, opacity: 0 }}
                                whileInView={{ x: 0, opacity: 1 }}
                                viewport={{ once: true, margin: "-100px" }}
                                transition={{ duration: 0.7, delay: index * 0.2 }}
                                className="hidden md:block w-[45%]"
                            >
                                <div className="group relative aspect-video rounded-2xl overflow-hidden border border-border bg-secondary/20 shadow-2xl transition-transform duration-500 hover:scale-[1.02]">
                                    <div className="absolute inset-0 bg-gradient-to-tr from-blue-500/10 to-transparent z-10 group-hover:opacity-0 transition-opacity" />
                                    <img
                                        src={step.imageUrl}
                                        alt={step.title}
                                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                    />
                                </div>
                            </motion.div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
