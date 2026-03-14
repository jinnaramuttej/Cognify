'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Home, ArrowLeft, Search, Ghost } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function NotFound() {
    return (
        <div className="min-h-screen bg-[#0a0a0a] flex flex-col items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center space-y-8 max-w-lg"
            >
                {/* Floating Icon */}
                <motion.div
                    animate={{ y: [0, -20, 0] }}
                    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                    className="flex justify-center"
                >
                    <div className="p-6 bg-blue-500/10 rounded-full border border-blue-500/20 text-blue-500">
                        <Ghost size={80} />
                    </div>
                </motion.div>

                <div className="space-y-4">
                    <h1 className="text-6xl font-black text-white tracking-tighter">404</h1>
                    <h2 className="text-2xl font-bold text-blue-400">Lost in Cyberspace?</h2>
                    <p className="text-[#a0a0a0] text-lg">
                        The page you're looking for doesn't exist or has been moved to another dimension.
                    </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Link href="/">
                        <Button className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-8 h-12 rounded-xl w-full sm:w-auto flex items-center gap-2">
                            <Home size={18} />
                            Back to Home
                        </Button>
                    </Link>
                    <Button
                        variant="outline"
                        onClick={() => window.history.back()}
                        className="border-blue-500/30 text-blue-400 hover:bg-blue-500/10 font-bold px-8 h-12 rounded-xl w-full sm:w-auto flex items-center gap-2"
                    >
                        <ArrowLeft size={18} />
                        Go Back
                    </Button>
                </div>

                {/* Decorative elements */}
                <div className="pt-12 flex justify-center gap-8 opacity-20">
                    <Search className="text-blue-500" />
                    <Ghost className="text-blue-500" />
                    <Home className="text-blue-500" />
                </div>
            </motion.div>
        </div>
    );
}
