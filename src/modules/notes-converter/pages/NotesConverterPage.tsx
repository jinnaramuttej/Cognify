'use client';

/**
 * NotesConverterPage — Main page for the Notes Converter module
 * 
 * Three-panel workspace: Input → Tools → Output
 */

import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import {
    FileText,
    Upload,
    Layers,
    HelpCircle,
    ListChecks,
    BookOpen,
    Network,
    Calculator,
    Sparkles,
    Star,
    Loader2,
    Trash2,
    Copy,
} from 'lucide-react';
import { toast } from 'sonner';
import { convertNotes } from '../services/notes-ai-service';
import FlashcardViewer from '../components/FlashcardViewer';
import QuestionsViewer from '../components/QuestionsViewer';
import {
    SummaryViewer,
    MindMapViewer,
    FormulaSheetViewer,
    KeyPointsViewer,
} from '../components/OutputViewers';
import type { ConversionType } from '../types/notes-types';

const TOOLS: { type: ConversionType; label: string; desc: string; icon: React.ElementType; color: string }[] = [
    { type: 'flashcards', label: 'Flashcards', desc: 'Q/A cards for memorization', icon: Layers, color: 'text-blue-500' },
    { type: 'questions', label: 'Practice Questions', desc: 'Exam-style MCQs', icon: HelpCircle, color: 'text-green-500' },
    { type: 'quiz', label: 'Quiz Test', desc: 'Mini test with scoring', icon: ListChecks, color: 'text-purple-500' },
    { type: 'summary', label: 'Summary', desc: 'Structured overview', icon: BookOpen, color: 'text-amber-500' },
    { type: 'mindmap', label: 'Mind Map', desc: 'Concept hierarchy', icon: Network, color: 'text-pink-500' },
    { type: 'formulas', label: 'Formula Sheet', desc: 'Extract equations', icon: Calculator, color: 'text-cyan-500' },
    { type: 'keypoints', label: 'Key Points', desc: 'Important info', icon: Star, color: 'text-orange-500' },
];

export default function NotesConverterPage() {
    const [inputText, setInputText] = useState('');
    const [selectedTool, setSelectedTool] = useState<ConversionType | null>(null);
    const [result, setResult] = useState<any>(null);
    const [isGenerating, setIsGenerating] = useState(false);
    const [isDemo, setIsDemo] = useState(false);

    const handleConvert = useCallback(async (type: ConversionType) => {
        if (!inputText.trim()) {
            toast.error('Please enter or paste your notes first.');
            return;
        }
        if (inputText.trim().length < 30) {
            toast.error('Notes are too short. Please provide more content.');
            return;
        }

        setSelectedTool(type);
        setIsGenerating(true);
        setResult(null);

        try {
            const response = await convertNotes(inputText, type);
            setResult(response.result);
            setIsDemo(response.demo || false);
            if (response.demo) {
                toast.info('Showing demo output — AI key not configured.');
            } else {
                toast.success('Conversion complete!');
            }
        } catch (err) {
            toast.error('Conversion failed. Please try again.');
            console.error(err);
        } finally {
            setIsGenerating(false);
        }
    }, [inputText]);

    const renderOutput = () => {
        if (isGenerating) {
            return (
                <div className="flex flex-col items-center justify-center py-16 gap-4">
                    <Loader2 size={32} className="animate-spin text-primary" />
                    <p className="text-muted-foreground text-sm">Generating {selectedTool}...</p>
                </div>
            );
        }

        if (!result || !selectedTool) {
            return (
                <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
                    <Sparkles size={48} className="text-muted-foreground/30" />
                    <p className="text-muted-foreground">Select a conversion tool to get started.</p>
                    <p className="text-xs text-muted-foreground/60">Paste your notes on the left, then pick a format.</p>
                </div>
            );
        }

        switch (selectedTool) {
            case 'flashcards':
                return <FlashcardViewer flashcards={Array.isArray(result) ? result : []} />;
            case 'questions':
            case 'quiz':
                return <QuestionsViewer questions={Array.isArray(result) ? result : []} />;
            case 'summary':
                return <SummaryViewer sections={Array.isArray(result) ? result : []} />;
            case 'mindmap':
                return <MindMapViewer root={result} />;
            case 'formulas':
                return <FormulaSheetViewer formulas={Array.isArray(result) ? result : []} />;
            case 'keypoints':
                return <KeyPointsViewer points={Array.isArray(result) ? result : []} />;
            default:
                return null;
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
                        <FileText size={32} className="text-primary" />
                        Notes Converter
                    </h1>
                    <p className="text-muted-foreground mt-1">
                        Transform your notes into flashcards, questions, summaries, and more
                    </p>
                </div>
                {isDemo && <Badge variant="secondary">Demo Mode</Badge>}
            </div>

            {/* Main Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

                {/* ── Panel 1: Notes Input ── */}
                <div className="lg:col-span-4 space-y-4">
                    <Card className="bg-card border h-full">
                        <CardContent className="p-5 space-y-4">
                            <div className="flex items-center justify-between">
                                <h3 className="font-semibold text-foreground flex items-center gap-2">
                                    <Upload size={16} />
                                    Your Notes
                                </h3>
                                {inputText && (
                                    <Button variant="ghost" size="sm" onClick={() => setInputText('')}>
                                        <Trash2 size={14} />
                                    </Button>
                                )}
                            </div>

                            <Textarea
                                placeholder="Paste your notes, lecture content, or study material here...&#10;&#10;Example: Newton's First Law states that an object at rest stays at rest and an object in motion stays in motion unless acted upon by an external force. This is also known as the law of inertia..."
                                value={inputText}
                                onChange={(e) => setInputText(e.target.value)}
                                className="min-h-[400px] resize-none bg-background border-border text-foreground placeholder:text-muted-foreground/50 text-sm leading-relaxed"
                            />

                            <div className="flex items-center justify-between text-xs text-muted-foreground">
                                <span>{inputText.length} characters</span>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="gap-1"
                                    onClick={async () => {
                                        try {
                                            const text = await navigator.clipboard.readText();
                                            setInputText(text);
                                            toast.success('Pasted from clipboard');
                                        } catch { toast.error('Cannot read clipboard'); }
                                    }}
                                >
                                    <Copy size={12} /> Paste
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* ── Panel 2: Conversion Tools ── */}
                <div className="lg:col-span-3 space-y-4">
                    <h3 className="font-semibold text-foreground text-sm uppercase tracking-wider flex items-center gap-2">
                        <Sparkles size={14} className="text-primary" />
                        Convert Into
                    </h3>

                    <div className="grid grid-cols-1 gap-2.5">
                        {TOOLS.map((tool) => (
                            <motion.div key={tool.type} whileHover={{ x: 4 }} whileTap={{ scale: 0.98 }}>
                                <Card
                                    className={`border cursor-pointer transition-all duration-200 ${selectedTool === tool.type
                                            ? 'bg-primary/10 border-primary/50 shadow-sm'
                                            : 'bg-card hover:bg-muted/40'
                                        }`}
                                    onClick={() => handleConvert(tool.type)}
                                >
                                    <CardContent className="p-3.5 flex items-center gap-3">
                                        <div className={`p-2 rounded-lg bg-muted ${tool.color}`}>
                                            <tool.icon size={18} />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-medium text-foreground text-sm">{tool.label}</p>
                                            <p className="text-xs text-muted-foreground truncate">{tool.desc}</p>
                                        </div>
                                        {selectedTool === tool.type && isGenerating && (
                                            <Loader2 size={14} className="animate-spin text-primary" />
                                        )}
                                    </CardContent>
                                </Card>
                            </motion.div>
                        ))}
                    </div>
                </div>

                {/* ── Panel 3: Generated Output ── */}
                <div className="lg:col-span-5 space-y-4">
                    <div className="flex items-center justify-between">
                        <h3 className="font-semibold text-foreground text-sm uppercase tracking-wider">
                            Output
                        </h3>
                        {selectedTool && (
                            <Badge variant="outline" className="capitalize">{selectedTool}</Badge>
                        )}
                    </div>

                    <Card className="bg-card border min-h-[400px]">
                        <CardContent className="p-5">
                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={selectedTool || 'empty'}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                >
                                    {renderOutput()}
                                </motion.div>
                            </AnimatePresence>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
