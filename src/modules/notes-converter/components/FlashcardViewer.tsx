'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, RotateCcw, Shuffle, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { Flashcard } from '../types/notes-types';

interface Props {
    flashcards: Flashcard[];
}

export default function FlashcardViewer({ flashcards }: Props) {
    const [index, setIndex] = useState(0);
    const [flipped, setFlipped] = useState(false);
    const [cards, setCards] = useState(flashcards);
    const [learned, setLearned] = useState<Set<string>>(new Set());

    const current = cards[index];
    const relevanceStyles = {
        high: 'bg-red-500/10 text-red-700 dark:text-red-300 border-red-500/30',
        medium: 'bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/30',
        low: 'bg-green-500/10 text-green-700 dark:text-green-300 border-green-500/30',
    };

    const next = () => { setFlipped(false); setIndex((i) => Math.min(i + 1, cards.length - 1)); };
    const prev = () => { setFlipped(false); setIndex((i) => Math.max(i - 1, 0)); };
    const shuffle = () => {
        setCards([...cards].sort(() => Math.random() - 0.5));
        setIndex(0);
        setFlipped(false);
    };
    const markLearned = () => {
        const id = current?.front || String(index);
        const next = new Set(learned);
        if (next.has(id)) next.delete(id); else next.add(id);
        setLearned(next);
    };

    if (!current) return <p className="text-muted-foreground text-center py-8">No flashcards generated.</p>;

    return (
        <div className="space-y-6">
            {/* Progress */}
            <div className="flex justify-between items-center text-sm text-muted-foreground">
                <span>Card {index + 1} of {cards.length}</span>
                <span>{learned.size} learned</span>
            </div>

            {/* Progress bar */}
            <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                <motion.div
                    className="h-full bg-primary rounded-full"
                    animate={{ width: `${((index + 1) / cards.length) * 100}%` }}
                    transition={{ duration: 0.3 }}
                />
            </div>

            {/* Card */}
            <div
                className="relative cursor-pointer perspective-1000"
                style={{ minHeight: 280 }}
                onClick={() => setFlipped(!flipped)}
            >
                <AnimatePresence mode="wait">
                    <motion.div
                        key={`${index}-${flipped}`}
                        initial={{ rotateY: flipped ? -90 : 90, opacity: 0 }}
                        animate={{ rotateY: 0, opacity: 1 }}
                        exit={{ rotateY: flipped ? 90 : -90, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className={`w-full p-8 rounded-2xl border-2 flex flex-col items-center justify-center text-center min-h-[280px] ${flipped
                                ? 'bg-primary/5 border-primary/30'
                                : 'bg-card border-border'
                            } ${learned.has(current.front || String(index)) ? 'ring-2 ring-green-500/50' : ''}`}
                    >
                        <div className="mb-4 flex flex-wrap justify-center gap-2">
                            {current?.examRelevance && (
                                <Badge className={`border ${relevanceStyles[current.examRelevance]}`}>
                                    {current.examRelevance}
                                </Badge>
                            )}
                            {current?.topicTags?.map((tag) => (
                                <Badge key={tag} variant="secondary" className="capitalize">
                                    {tag}
                                </Badge>
                            ))}
                        </div>
                        <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-4">
                            {flipped ? 'Answer' : 'Question'}
                        </span>
                        <p className="text-lg md:text-xl font-medium text-foreground leading-relaxed">
                            {flipped ? current.back : current.front}
                        </p>
                        <span className="text-xs text-muted-foreground mt-6">Click to flip</span>
                    </motion.div>
                </AnimatePresence>
            </div>

            {/* Controls */}
            <div className="flex items-center justify-center gap-3">
                <Button variant="outline" size="icon" onClick={prev} disabled={index === 0}>
                    <ChevronLeft size={18} />
                </Button>
                <Button variant="outline" size="icon" onClick={shuffle}>
                    <Shuffle size={16} />
                </Button>
                <Button
                    variant={learned.has(current.front || String(index)) ? 'default' : 'outline'}
                    size="icon"
                    onClick={markLearned}
                    className={learned.has(current.front || String(index)) ? 'bg-green-600 hover:bg-green-700' : ''}
                >
                    <Check size={16} />
                </Button>
                <Button variant="outline" size="icon" onClick={() => setFlipped(false)}>
                    <RotateCcw size={16} />
                </Button>
                <Button variant="outline" size="icon" onClick={next} disabled={index === cards.length - 1}>
                    <ChevronRight size={18} />
                </Button>
            </div>
        </div>
    );
}
