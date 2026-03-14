'use client';

import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';

export default function FinalCTA() {
    const router = useRouter();

    return (
        <section className="py-32 px-4 text-center">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="max-w-3xl mx-auto p-12 rounded-[32px] bg-gradient-to-br from-secondary/30 to-background border border-border shadow-2xl shadow-primary/5"
            >
                <h2 className="text-4xl font-bold mb-6">Start building your study habit today.</h2>
                <p className="text-xl text-muted-foreground mb-10">
                    Join the focused workspace designed specifically for your success.
                </p>
                <Button
                    size="lg"
                    onClick={() => router.push('/dashboard')}
                    className="h-14 px-12 text-lg rounded-full bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all"
                >
                    Go to Dashboard
                </Button>
            </motion.div>
        </section>
    );
}
