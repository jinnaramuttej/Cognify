'use client';

import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { BackgroundPaths } from '@/components/Motion/BackgroundPaths';

export default function Hero() {
    const router = useRouter();

    const container: any = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.15,
            },
        },
    };

    const item: any = {
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } },
    };

    return (
        <section className="relative min-h-[90vh] flex flex-col items-center justify-center text-center px-4 overflow-hidden">
            <BackgroundPaths />
            <motion.div
                variants={container}
                initial="hidden"
                animate="show"
                className="relative max-w-4xl mx-auto z-10"
            >
                <motion.h1
                    variants={item}
                    className="text-6xl md:text-8xl font-bold tracking-tight text-foreground mb-4"
                >
                    Cognify
                </motion.h1>

                <motion.p
                    variants={item}
                    className="text-2xl md:text-3xl font-medium text-blue-600 dark:text-blue-400 mb-6"
                >
                    AI-Powered Learning for Class 11 & 12
                </motion.p>

                <motion.p
                    variants={item}
                    className="text-xl md:text-2xl text-muted-foreground mb-10 max-w-2xl mx-auto"
                >
                    Study smarter. Build consistency. Let AI guide you.
                </motion.p>

                <motion.div
                    variants={item}
                    className="flex flex-wrap justify-center gap-6"
                >
                    <Button
                        size="lg"
                        onClick={() => router.push('/dashboard')}
                        className="h-14 px-10 text-lg rounded-full shadow-xl shadow-blue-500/10 hover:shadow-blue-500/20 transition-all font-bold"
                    >
                        Start Studying
                    </Button>
                    <Button
                        variant="outline"
                        size="lg"
                        onClick={() => document.getElementById('roadmap')?.scrollIntoView({ behavior: 'smooth' })}
                        className="h-14 px-10 text-lg rounded-full border-border hover:bg-secondary/50 font-bold"
                    >
                        See how it works
                    </Button>
                </motion.div>
            </motion.div>

            {/* Floating Indicators - Minimal */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1, duration: 1 }}
                className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 opacity-40"
            >
                <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-foreground">Scroll to explore</span>
                <div className="w-[1px] h-12 bg-gradient-to-b from-blue-500 to-transparent" />
            </motion.div>
        </section>
    );
}
