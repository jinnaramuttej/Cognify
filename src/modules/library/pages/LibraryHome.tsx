'use client';

/**
 * LibraryHome — Main page container for the Library module
 * 
 * Renders the syllabus browser: Exam → Subject → Unit → Chapter → Concept
 */

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
    BookOpen,
    ChevronRight,
    GraduationCap,
    Atom,
    FlaskConical,
    Calculator,
} from 'lucide-react';
import { getExams } from '../services/syllabus-service';
import type { SyllabusExam } from '../types';

const examIcons: Record<string, React.ReactNode> = {
    'JEE Main': <Atom size={28} className="text-blue-500" />,
    'JEE Advanced': <Atom size={28} className="text-purple-500" />,
    'NEET': <FlaskConical size={28} className="text-green-500" />,
    'BITSAT': <Calculator size={28} className="text-amber-500" />,
};

export default function LibraryHome() {
    const router = useRouter();
    const [exams, setExams] = useState<SyllabusExam[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadExams();
    }, []);

    const loadExams = async () => {
        try {
            const data = await getExams();
            setExams(data);
        } catch (err) {
            console.error('Failed to load exams:', err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
                    <BookOpen size={32} className="text-primary" />
                    Library
                </h1>
                <p className="text-muted-foreground mt-1">Browse syllabus by exam</p>
            </div>

            {loading ? (
                <div className="flex justify-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent" />
                </div>
            ) : exams.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                    <GraduationCap size={48} className="mx-auto mb-3 opacity-40" />
                    <p>No exams found. Seed the syllabus database first.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {exams.map((exam, i) => (
                        <motion.div
                            key={exam.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.1 }}
                            whileHover={{ y: -4 }}
                        >
                            <Card
                                className="bg-card border cursor-pointer hover:border-primary/50 hover:shadow-lg transition-all duration-300"
                                onClick={() => router.push(`/library/${exam.id}`)}
                            >
                                <CardContent className="p-6 flex items-center gap-5">
                                    <div className="p-4 rounded-2xl bg-muted">
                                        {examIcons[exam.name] || <GraduationCap size={28} className="text-primary" />}
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="text-xl font-bold text-foreground">{exam.name}</h3>
                                        <p className="text-sm text-muted-foreground mt-1">
                                            {exam.description || 'Browse complete syllabus'}
                                        </p>
                                    </div>
                                    <ChevronRight size={20} className="text-muted-foreground" />
                                </CardContent>
                            </Card>
                        </motion.div>
                    ))}
                </div>
            )}
        </div>
    );
}
