'use client';

import { motion } from 'framer-motion';
import { Bot, FileText, Flame, LayoutDashboard, LineChart } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const features = [

    {
        title: 'Notes Converter',
        description: 'Transform raw sketches or long lectures into organized, searchable notes.',
        icon: FileText,
        color: '#3b82f6'
    },
    {
        title: 'Study Streaks',
        description: 'Build consistency with gamified habit tracking and reputation points.',
        icon: Flame,
        color: '#f59e0b'
    },
    {
        title: 'Smart Dashboard',
        description: 'A distraction-free central hub for all your daily academic tasks.',
        icon: LayoutDashboard,
        color: '#10b981'
    },
    {
        title: 'Personalized Insights',
        description: 'AI-driven analysis of your performance to pinpoint weak areas.',
        icon: LineChart,
        color: '#8b5cf6'
    }
];

export default function FeatureGrid() {
    return (
        <section className="py-32 px-4 bg-secondary/10">
            <div className="max-w-6xl mx-auto">
                <div className="text-center mb-20">
                    <h2 className="text-4xl font-bold mb-4">Core Features</h2>
                    <p className="text-xl text-muted-foreground">Purpose-built tools for the modern student.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {features.map((f, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: i * 0.1 }}
                            whileHover={{ y: -5, boxShadow: "0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)" }}
                        >
                            <Card className="h-full bg-card border-border hover:border-blue-500/50 transition-colors duration-300">
                                <CardHeader>
                                    <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 bg-secondary/50">
                                        <f.icon className="w-6 h-6" style={{ color: f.color }} />
                                    </div>
                                    <CardTitle className="text-2xl font-bold">{f.title}</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-muted-foreground leading-relaxed">{f.description}</p>
                                </CardContent>
                            </Card>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
