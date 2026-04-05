'use client';

/**
 * NotesConverterPage — Main page for the Notes Converter module
 *
 * Three-panel workspace: Input -> Tools -> Output
 */

import React, { useMemo, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import {
    AlertCircle,
    BookOpen,
    Copy,
    FileText,
    Layers,
    ListChecks,
    Loader2,
    RefreshCw,
    Sparkles,
    Trash2,
    Upload,
} from 'lucide-react';
import { toast } from 'sonner';
import {
    generateNotesOutput,
    ingestNotes,
    saveReviewedText,
} from '../services/notes-ai-service';
import FlashcardViewer from '../components/FlashcardViewer';
import QuestionsViewer from '../components/QuestionsViewer';
import { SummaryViewer } from '../components/OutputViewers';
import type {
    ConversionType,
    OutputMap,
    ProcessingStage,
} from '../types/notes-types';

const TOOLS: { type: ConversionType; label: string; desc: string; icon: React.ElementType; color: string }[] = [
    { type: 'flashcards', label: 'Flashcards', desc: 'Q/A cards for memorization', icon: Layers, color: 'text-blue-500' },
    { type: 'quiz', label: 'Quiz Test', desc: '6 mixed conceptual/application/tricky questions', icon: ListChecks, color: 'text-purple-500' },
    { type: 'summary', label: 'Summary', desc: 'Quick summary + core concepts + exam tips', icon: BookOpen, color: 'text-amber-500' },
];

const focusStyles = {
    high: 'bg-red-500/10 text-red-700 dark:text-red-300 border-red-500/30',
    medium: 'bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/30',
    low: 'bg-green-500/10 text-green-700 dark:text-green-300 border-green-500/30',
};

export default function NotesConverterPage() {
    const fileInputRef = useRef<HTMLInputElement | null>(null);
    const [inputText, setInputText] = useState('');
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [generationId, setGenerationId] = useState<string | null>(null);
    const [extractedText, setExtractedText] = useState('');
    const [savedEditorText, setSavedEditorText] = useState('');
    const [normalizedText, setNormalizedText] = useState('');
    const [processingStage, setProcessingStage] = useState<ProcessingStage>('idle');
    const [selectedTool, setSelectedTool] = useState<ConversionType | null>(null);
    const [outputCache, setOutputCache] = useState<Partial<OutputMap>>({});
    const [detectedExam, setDetectedExam] = useState<'jee' | 'neet' | 'bitsat' | 'generic'>('generic');
    const [examFocus, setExamFocus] = useState<'high' | 'medium' | 'low'>('low');
    const [isSavingReview, setIsSavingReview] = useState(false);
    const [isGenerating, setIsGenerating] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const isReviewing = processingStage === 'review' || processingStage === 'reviewing' || processingStage === 'ready';
    const currentOutput = selectedTool ? outputCache[selectedTool] : null;

    const stageLabel = useMemo(() => {
        if (isGenerating && selectedTool) {
            return `Generating ${selectedTool}...`;
        }
        if (isSavingReview) {
            return 'Reviewing notes...';
        }
        if (processingStage === 'extracting') {
            return 'Extracting content...';
        }
        if (isReviewing) {
            return 'Review extracted text';
        }
        if (processingStage === 'failed') {
            return 'Something went wrong';
        }
        return 'Ready';
    }, [isGenerating, isSavingReview, isReviewing, processingStage, selectedTool]);

    async function ingestCurrentSource() {
        if (!selectedFile && !inputText.trim()) {
            throw new Error('Paste notes or upload a PDF first.');
        }

        setErrorMessage(null);
        setSelectedTool(null);
        setOutputCache({});
        setProcessingStage('extracting');

        const response = await ingestNotes({
            text: selectedFile ? undefined : inputText,
            file: selectedFile,
            sourceName: selectedFile?.name,
        });

        setGenerationId(response.generationId);
        setExtractedText(response.extractedText);
        setSavedEditorText(response.extractedText);
        setNormalizedText(response.normalizedText);
        setDetectedExam(response.detectedExam);
        setExamFocus(response.examFocus);
        setProcessingStage('reviewing');

        return response;
    }

    async function handleIngest() {
        try {
            await ingestCurrentSource();
            toast.success('Notes processed. Review the extracted text before generating.');
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Failed to process notes.';
            setErrorMessage(message);
            setProcessingStage('failed');
            toast.error(message);
        }
    }

    async function handleSaveReview() {
        if (!generationId) {
            toast.error('Ingest notes first.');
            return false;
        }

        try {
            setErrorMessage(null);
            setIsSavingReview(true);
            setProcessingStage('reviewing');
            const response = await saveReviewedText(generationId, extractedText);
            setNormalizedText(response.normalizedText);
            setSavedEditorText(extractedText);
            setProcessingStage('ready');
            return true;
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Failed to save reviewed notes.';
            setErrorMessage(message);
            setProcessingStage('failed');
            toast.error(message);
            return false;
        } finally {
            setIsSavingReview(false);
        }
    }

    async function handleConvert(type: ConversionType) {
        setSelectedTool(type);

        if (outputCache[type]) {
            return;
        }

        let activeGenerationId = generationId;
        let sourceWasJustIngested = false;

        if (!activeGenerationId) {
            try {
                const ingestResponse = await ingestCurrentSource();
                activeGenerationId = ingestResponse.generationId;
                sourceWasJustIngested = true;
            } catch (error) {
                const message = error instanceof Error ? error.message : 'Failed to process notes.';
                setErrorMessage(message);
                setProcessingStage('failed');
                toast.error(message);
                return;
            }
        }

        const reviewSaved = sourceWasJustIngested || extractedText === savedEditorText ? true : await handleSaveReview();
        if (!reviewSaved) {
            return;
        }

        try {
            setErrorMessage(null);
            setIsGenerating(true);
            setProcessingStage('generating');
            const response = await generateNotesOutput(activeGenerationId, type);
            setOutputCache((current) => ({
                ...current,
                [type]: response.result,
            }));
            setProcessingStage('completed');
            toast.success(`${TOOLS.find((tool) => tool.type === type)?.label} ready.`);
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Generation failed.';
            setErrorMessage(message);
            setProcessingStage('failed');
            toast.error(message);
        } finally {
            setIsGenerating(false);
        }
    }

    const renderOutput = () => {
        if (isGenerating) {
            return (
                <div className="flex flex-col items-center justify-center py-16 gap-4">
                    <Loader2 size={32} className="animate-spin text-primary" />
                    <p className="text-muted-foreground text-sm">{stageLabel}</p>
                </div>
            );
        }

        if (errorMessage) {
            return (
                <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
                    <AlertCircle size={48} className="text-destructive/70" />
                    <p className="text-foreground font-medium">Unable to complete request</p>
                    <p className="text-sm text-muted-foreground">{errorMessage}</p>
                </div>
            );
        }

        if (!currentOutput || !selectedTool) {
            return (
                <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
                    <Sparkles size={48} className="text-muted-foreground/30" />
                    <p className="text-muted-foreground">Select a conversion tool to get started.</p>
                    <p className="text-xs text-muted-foreground/60">
                        Paste your notes or upload a PDF, review extracted text, then pick a format.
                    </p>
                </div>
            );
        }

        switch (selectedTool) {
            case 'flashcards':
                return <FlashcardViewer flashcards={(currentOutput as OutputMap['flashcards']).cards} />;
            case 'quiz':
                return <QuestionsViewer questions={(currentOutput as OutputMap['quiz']).questions} />;
            case 'summary':
                return <SummaryViewer summary={currentOutput as OutputMap['summary']} />;
            default:
                return null;
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
                        <FileText size={32} className="text-primary" />
                        Notes Converter
                    </h1>
                    <p className="text-muted-foreground mt-1">
                        Transform your notes into flashcards, quiz practice, and exam-ready summaries
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    {generationId && (
                        <Badge variant="outline" className="font-mono text-[11px]">
                            {generationId.slice(0, 8)}
                        </Badge>
                    )}
                    <Badge variant="secondary" className="uppercase">{detectedExam}</Badge>
                    <Badge className={`border ${focusStyles[examFocus]}`}>Exam Focus {examFocus}</Badge>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                <div className="lg:col-span-4 space-y-4">
                    <Card className="bg-card border h-full">
                        <CardContent className="p-5 space-y-4">
                            <div className="flex items-center justify-between">
                                <h3 className="font-semibold text-foreground flex items-center gap-2">
                                    <Upload size={16} />
                                    Your Notes
                                </h3>
                                {(inputText || selectedFile || extractedText) && (
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => {
                                            setInputText('');
                                            setSelectedFile(null);
                                            setGenerationId(null);
                                            setExtractedText('');
                                            setSavedEditorText('');
                                            setNormalizedText('');
                                            setSelectedTool(null);
                                            setOutputCache({});
                                            setProcessingStage('idle');
                                            setErrorMessage(null);
                                        }}
                                    >
                                        <Trash2 size={14} />
                                    </Button>
                                )}
                            </div>

                            <button
                                type="button"
                                className="w-full rounded-lg border border-dashed border-border p-4 text-sm text-muted-foreground hover:border-primary/40 hover:text-foreground transition-colors"
                                onClick={() => fileInputRef.current?.click()}
                            >
                                {selectedFile ? `PDF selected: ${selectedFile.name}` : 'Upload PDF'}
                            </button>
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept=".pdf,application/pdf"
                                className="hidden"
                                onChange={(event) => {
                                    const nextFile = event.target.files?.[0] ?? null;
                                    setSelectedFile(nextFile);
                                    if (nextFile) {
                                        setInputText('');
                                        setTimeout(() => {
                                            void handleIngest();
                                        }, 0);
                                    }
                                }}
                            />

                            <Textarea
                                placeholder="Paste your notes, lecture content, or study material here..."
                                value={generationId ? extractedText : inputText}
                                onChange={(event) => {
                                    if (generationId) {
                                        setExtractedText(event.target.value);
                                    } else {
                                        setInputText(event.target.value);
                                    }
                                }}
                                onPaste={() => {
                                    if (!generationId) {
                                        setTimeout(() => {
                                            void handleIngest();
                                        }, 0);
                                    }
                                }}
                                className="min-h-[400px] resize-none bg-background border-border text-foreground placeholder:text-muted-foreground/50 text-sm leading-relaxed"
                            />

                            <div className="flex items-center justify-between text-xs text-muted-foreground">
                                <span>{(generationId ? extractedText : inputText).length} characters</span>
                                <div className="flex items-center gap-2">
                                    <span>{stageLabel}</span>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="gap-1"
                                        onClick={async () => {
                                            try {
                                                const text = await navigator.clipboard.readText();
                                                setInputText(text);
                                                setSelectedFile(null);
                                                setTimeout(() => {
                                                    void handleIngest();
                                                }, 0);
                                                toast.success('Pasted from clipboard');
                                            } catch {
                                                toast.error('Cannot read clipboard');
                                            }
                                        }}
                                    >
                                        <Copy size={12} /> Paste
                                    </Button>
                                </div>
                            </div>

                            {!generationId && (
                                <Button
                                    className="w-full"
                                    onClick={handleIngest}
                                    disabled={processingStage === 'extracting'}
                                >
                                    {processingStage === 'extracting' ? (
                                        <>
                                            <Loader2 size={14} className="mr-2 animate-spin" />
                                            Extracting...
                                        </>
                                    ) : (
                                        'Process Notes'
                                    )}
                                </Button>
                            )}

                            {generationId && (
                                <Button
                                    variant="outline"
                                    className="w-full"
                                    onClick={handleSaveReview}
                                    disabled={isSavingReview}
                                >
                                    {isSavingReview ? (
                                        <>
                                            <Loader2 size={14} className="mr-2 animate-spin" />
                                            Reviewing...
                                        </>
                                    ) : (
                                        'Save Reviewed Text'
                                    )}
                                </Button>
                            )}
                        </CardContent>
                    </Card>
                </div>

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
                                    onClick={() => void handleConvert(tool.type)}
                                >
                                    <CardContent className="p-3.5 flex items-center gap-3">
                                        <div className={`p-2 rounded-lg bg-muted ${tool.color}`}>
                                            <tool.icon size={18} />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-medium text-foreground text-sm">{tool.label}</p>
                                            <p className="text-xs text-muted-foreground">{tool.desc}</p>
                                        </div>
                                        {outputCache[tool.type] && (
                                            <Badge variant="secondary">Cached</Badge>
                                        )}
                                        {selectedTool === tool.type && isGenerating && (
                                            <Loader2 size={14} className="animate-spin text-primary" />
                                        )}
                                    </CardContent>
                                </Card>
                            </motion.div>
                        ))}
                    </div>
                </div>

                <div className="lg:col-span-5 space-y-4">
                    <div className="flex items-center justify-between">
                        <h3 className="font-semibold text-foreground text-sm uppercase tracking-wider">
                            Output
                        </h3>
                        <div className="flex items-center gap-2">
                            {selectedTool && (
                                <Badge variant="outline" className="capitalize">{selectedTool}</Badge>
                            )}
                            {selectedTool && outputCache[selectedTool] && (
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => void handleConvert(selectedTool)}
                                    disabled={isGenerating}
                                >
                                    <RefreshCw size={13} className="mr-1.5" />
                                    Reuse
                                </Button>
                            )}
                        </div>
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
