'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { SummarySection, MindMapNode, FormulaEntry, KeyPoint } from '../types/notes-types';

/** ── Summary Viewer ── */
export function SummaryViewer({ sections }: { sections: SummarySection[] }) {
    return (
        <div className="space-y-4">
            {sections.map((s, i) => (
                <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
                    <Card className="bg-card border">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-lg text-foreground">{s.heading}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">{s.content}</p>
                        </CardContent>
                    </Card>
                </motion.div>
            ))}
        </div>
    );
}

/** ── Mind Map Viewer ── */
function MindMapBranch({ node, depth = 0 }: { node: MindMapNode; depth?: number }) {
    const colors = ['text-primary', 'text-blue-500', 'text-purple-500', 'text-amber-500'];
    const bgColors = ['bg-primary/10', 'bg-blue-500/10', 'bg-purple-500/10', 'bg-amber-500/10'];

    return (
        <div className={depth > 0 ? 'ml-6 border-l-2 border-border pl-4' : ''}>
            <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: depth * 0.1 }}
                className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg ${bgColors[depth % bgColors.length]} mb-2`}
            >
                <div className={`w-2.5 h-2.5 rounded-full ${colors[depth % colors.length].replace('text-', 'bg-')}`} />
                <span className={`font-medium text-sm ${colors[depth % colors.length]}`}>{node.label}</span>
            </motion.div>
            {node.children?.map((child) => (
                <MindMapBranch key={child.id} node={child} depth={depth + 1} />
            ))}
        </div>
    );
}

export function MindMapViewer({ root }: { root: MindMapNode }) {
    return (
        <Card className="bg-card border">
            <CardContent className="p-6">
                <MindMapBranch node={root} />
            </CardContent>
        </Card>
    );
}

/** ── Formula Sheet Viewer ── */
export function FormulaSheetViewer({ formulas }: { formulas: FormulaEntry[] }) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {formulas.map((f, i) => (
                <motion.div key={i} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.05 }}>
                    <Card className="bg-card border h-full">
                        <CardContent className="p-5 space-y-2">
                            <h4 className="font-semibold text-foreground">{f.name}</h4>
                            <div className="px-4 py-3 rounded-lg bg-primary/5 border border-primary/20 font-mono text-lg text-center text-primary">
                                {f.formula}
                            </div>
                            <p className="text-sm text-muted-foreground">{f.explanation}</p>
                            {f.example && (
                                <p className="text-xs text-muted-foreground bg-muted/30 px-3 py-2 rounded">
                                    <strong>Example:</strong> {f.example}
                                </p>
                            )}
                        </CardContent>
                    </Card>
                </motion.div>
            ))}
        </div>
    );
}

/** ── Key Points Viewer ── */
export function KeyPointsViewer({ points }: { points: KeyPoint[] }) {
    const importanceColors = {
        high: 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/30',
        medium: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30',
        low: 'bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/30',
    };

    return (
        <div className="space-y-3">
            {points.map((p, i) => (
                <motion.div
                    key={p.id || i}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="flex items-start gap-3 p-4 rounded-lg bg-card border"
                >
                    <Badge className={`shrink-0 border ${importanceColors[p.importance]}`}>
                        {p.importance}
                    </Badge>
                    <p className="text-foreground leading-relaxed">{p.point}</p>
                </motion.div>
            ))}
        </div>
    );
}
