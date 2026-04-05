'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { SummaryResult } from '../types/notes-types';

const relevanceStyles = {
    high: 'bg-red-500/10 text-red-700 dark:text-red-300 border-red-500/30',
    medium: 'bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/30',
    low: 'bg-green-500/10 text-green-700 dark:text-green-300 border-green-500/30',
};

export function SummaryViewer({ summary }: { summary: SummaryResult }) {
    return (
        <div className="space-y-4">
            <Card className="bg-primary/5 border-primary/20">
                <CardHeader className="pb-2">
                    <CardTitle className="text-lg text-foreground">Quick Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                    {summary.quickSummary.map((point, index) => (
                        <div key={`${point}-${index}`} className="flex gap-3 text-sm text-foreground">
                            <span className="font-semibold text-primary">{index + 1}.</span>
                            <p>{point}</p>
                        </div>
                    ))}
                </CardContent>
            </Card>

            <div className="space-y-4">
                {summary.coreConcepts.map((concept, index) => (
                    <motion.div
                        key={`${concept.title}-${index}`}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                    >
                        <Card className="bg-card border">
                            <CardHeader className="pb-2">
                                <div className="flex items-start justify-between gap-2">
                                    <CardTitle className="text-base text-foreground">{concept.title}</CardTitle>
                                    <Badge className={`border ${relevanceStyles[concept.examRelevance]}`}>
                                        {concept.examRelevance}
                                    </Badge>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <p className="text-sm leading-relaxed text-muted-foreground whitespace-pre-wrap">
                                    {concept.explanation}
                                </p>
                                <div className="flex flex-wrap gap-2">
                                    {concept.topicTags.map((tag) => (
                                        <Badge key={tag} variant="secondary" className="capitalize">
                                            {tag}
                                        </Badge>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                ))}
            </div>

            <Card className="bg-card border">
                <CardHeader className="pb-2">
                    <CardTitle className="text-base text-foreground">Exam Tips</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                    {summary.examTips.map((tip, index) => (
                        <div key={`${tip}-${index}`} className="flex gap-3 text-sm text-foreground">
                            <span className="font-semibold text-primary">Tip</span>
                            <p>{tip}</p>
                        </div>
                    ))}
                </CardContent>
            </Card>
        </div>
    );
}
