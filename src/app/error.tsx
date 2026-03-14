'use client';

import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { AlertCircle, RefreshCcw, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        // Log the error to an error reporting service
        console.error('Unhandled Runtime Error:', error);
    }, [error]);

    return (
        <div className="min-h-screen bg-[#0a0a0a] flex flex-col items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-[#1a1a1a] border border-red-500/20 p-8 md:p-12 rounded-3xl shadow-2xl max-w-xl w-full text-center space-y-8"
            >
                <div className="inline-flex p-4 bg-red-500/10 rounded-2xl text-red-500 mb-2">
                    <AlertCircle size={48} />
                </div>

                <div className="space-y-4">
                    <h1 className="text-3xl font-bold text-white">Something went wrong!</h1>
                    <p className="text-[#a0a0a0] text-lg">
                        An unexpected error occurred. We've been notified and are looking into it.
                    </p>
                    {process.env.NODE_ENV === 'development' && (
                        <div className="bg-black/50 p-4 rounded-xl border border-white/10 text-left overflow-auto max-h-40">
                            <p className="text-red-400 font-mono text-sm break-all">
                                {error.message || 'Unknown error'}
                            </p>
                        </div>
                    )}
                </div>

                <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                    <Button
                        onClick={() => reset()}
                        className="bg-red-600 hover:bg-red-700 text-white font-bold px-8 h-12 rounded-xl w-full sm:w-auto flex items-center gap-2"
                    >
                        <RefreshCcw size={18} />
                        Try Again
                    </Button>
                    <Link href="/">
                        <Button
                            variant="outline"
                            className="border-white/10 text-white hover:bg-white/5 font-bold px-8 h-12 rounded-xl w-full sm:w-auto flex items-center gap-2"
                        >
                            <Home size={18} />
                            Go to Homepage
                        </Button>
                    </Link>
                </div>
            </motion.div>
        </div>
    );
}
