'use client';

import { motion } from 'framer-motion';
import { ShieldCheck, Zap, UserCheck, Layers } from 'lucide-react';

export default function TrustSection() {
    const points = [
        {
            title: 'No fake data',
            description: 'We prioritize real student progress over marketing metrics.',
            icon: ShieldCheck
        },
        {
            title: 'No clutter',
            description: 'A focused whitespace designed to reduce cognitive load.',
            icon: zap => <Zap className="w-6 h-6 text-primary" />
        },
        {
            title: 'Designed for focus',
            description: 'Every interaction is intentional, minimal, and premium.',
            icon: Layers
        },
        {
            title: 'Built for real students',
            description: 'Tested and refined with Class 11 & 12 students.',
            icon: UserCheck
        }
    ];

    return (
        <section className="py-32 px-4 bg-background border-y border-border">
            <div className="max-w-4xl mx-auto text-center">
                <h2 className="text-3xl md:text-4xl font-bold mb-16">Why Students Trust Cognify</h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-12 text-left">
                    {points.map((p, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, x: -20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: i * 0.1 }}
                            className="flex gap-6"
                        >
                            <div className="flex-shrink-0 w-12 h-12 rounded-full bg-secondary/30 flex items-center justify-center">
                                {(() => {
                                    const IconComponent = p.icon as any;
                                    return typeof p.icon === 'function' ? IconComponent({}) : <IconComponent className="w-6 h-6 text-[#D4AF37]" />;
                                })()}
                            </div>
                            <div>
                                <h3 className="text-xl font-bold mb-2">{p.title}</h3>
                                <p className="text-muted-foreground leading-relaxed">{p.description}</p>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
