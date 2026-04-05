'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, XCircle, Eye } from 'lucide-react';
import type { QuizQuestion } from '../types/notes-types';

interface Props {
    questions: QuizQuestion[];
}

export default function QuestionsViewer({ questions }: Props) {
    const [answers, setAnswers] = useState<Record<number, number>>({});
    const [revealed, setRevealed] = useState<Set<number>>(new Set());
    const typeStyles = {
        conceptual: 'bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-500/30',
        application: 'bg-violet-500/10 text-violet-700 dark:text-violet-300 border-violet-500/30',
        tricky: 'bg-rose-500/10 text-rose-700 dark:text-rose-300 border-rose-500/30',
    };
    const relevanceStyles = {
        high: 'bg-red-500/10 text-red-700 dark:text-red-300 border-red-500/30',
        medium: 'bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/30',
        low: 'bg-green-500/10 text-green-700 dark:text-green-300 border-green-500/30',
    };

    const selectAnswer = (qIndex: number, optIndex: number) => {
        if (revealed.has(qIndex)) return;
        setAnswers((prev) => ({ ...prev, [qIndex]: optIndex }));
    };

    const revealAnswer = (qIndex: number) => {
        setRevealed((prev) => new Set([...prev, qIndex]));
    };

    const score = questions.reduce((sum, q, i) => {
        if (revealed.has(i) && answers[i] === q.correctIndex) return sum + 1;
        return sum;
    }, 0);

    return (
        <div className="space-y-6">
            {revealed.size > 0 && (
                <div className="flex items-center gap-3 p-3 rounded-lg bg-primary/10 border border-primary/20">
                    <span className="text-sm font-medium text-foreground">
                        Score: {score}/{revealed.size} ({revealed.size > 0 ? Math.round((score / revealed.size) * 100) : 0}%)
                    </span>
                </div>
            )}

            {questions.map((q, qIndex) => {
                const isRevealed = revealed.has(qIndex);
                const userAnswer = answers[qIndex];

                return (
                    <motion.div
                        key={q.id || qIndex}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: qIndex * 0.05 }}
                    >
                        <Card className="bg-card border overflow-hidden">
                            <CardContent className="p-5 space-y-4">
                                <div className="flex items-start gap-3">
                                    <Badge variant="secondary" className="mt-0.5 shrink-0">Q{qIndex + 1}</Badge>
                                    <div className="space-y-2">
                                        <div className="flex flex-wrap gap-2">
                                            <Badge className={`border ${typeStyles[q.type]}`}>{q.type}</Badge>
                                            <Badge className={`border ${relevanceStyles[q.examRelevance]}`}>{q.examRelevance}</Badge>
                                            {q.topicTags.map((tag) => (
                                                <Badge key={tag} variant="outline" className="capitalize">{tag}</Badge>
                                            ))}
                                        </div>
                                        <p className="text-foreground font-medium leading-relaxed">{q.question}</p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 gap-2 ml-8">
                                    {q.options.map((opt, optIdx) => {
                                        let className = 'p-3 rounded-lg border text-sm cursor-pointer transition-all ';
                                        if (isRevealed) {
                                            if (optIdx === q.correctIndex) className += 'bg-green-500/10 border-green-500/50 text-green-700 dark:text-green-400';
                                            else if (optIdx === userAnswer && optIdx !== q.correctIndex) className += 'bg-red-500/10 border-red-500/50 text-red-700 dark:text-red-400';
                                            else className += 'bg-muted/30 border-border text-muted-foreground';
                                        } else {
                                            className += userAnswer === optIdx
                                                ? 'bg-primary/10 border-primary text-foreground'
                                                : 'bg-muted/20 border-border text-foreground hover:bg-muted/40';
                                        }

                                        return (
                                            <div
                                                key={optIdx}
                                                className={className}
                                                onClick={() => selectAnswer(qIndex, optIdx)}
                                            >
                                                <span className="font-medium mr-2">{String.fromCharCode(65 + optIdx)}.</span>
                                                {opt}
                                                {isRevealed && optIdx === q.correctIndex && <CheckCircle2 size={14} className="inline ml-2" />}
                                                {isRevealed && optIdx === userAnswer && optIdx !== q.correctIndex && <XCircle size={14} className="inline ml-2" />}
                                            </div>
                                        );
                                    })}
                                </div>

                                <div className="flex items-center gap-2 ml-8">
                                    {!isRevealed ? (
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => revealAnswer(qIndex)}
                                            disabled={userAnswer === undefined}
                                            className="gap-1.5"
                                        >
                                            <Eye size={14} /> Check Answer
                                        </Button>
                                    ) : (
                                        <div className="p-3 rounded-lg bg-muted/30 text-sm text-muted-foreground w-full">
                                            <strong>Explanation:</strong> {q.explanation}
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                );
            })}
        </div>
    );
}
