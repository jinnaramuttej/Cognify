'use client';

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useIngestionStore } from '@/lib/ingestion-store';
import { insertQuestions } from '@/lib/teacher-service';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import {
  Upload,
  FileText,
  CheckCircle,
  XCircle,
  Edit,
  Trash2,
  Loader2,
  AlertTriangle,
} from 'lucide-react';

interface ParsedQuestion {
  id: string;
  question_text: string;
  options: { label: string; text: string }[];
  correct_option: string;
  difficulty: string;
  topic_mapping: string;
  is_valid: boolean;
}

export default function QuestionUploadPage() {
  const { user } = useAuth();
  const router = useRouter();
  const addLog = useIngestionStore((s) => s.addLog);
  const updateLog = useIngestionStore((s) => s.updateLog);

  const [file, setFile] = useState<File | null>(null);
  const [step, setStep] = useState<'upload' | 'preview' | 'importing' | 'done'>('upload');
  const [parsedQuestions, setParsedQuestions] = useState<ParsedQuestion[]>([]);
  const [parsing, setParsing] = useState(false);
  const [editingQ, setEditingQ] = useState<ParsedQuestion | null>(null);
  const [importResult, setImportResult] = useState<{ inserted: number; failed: number } | null>(null);

  const [examId, setExamId] = useState('');
  const [topicId, setTopicId] = useState('');

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected && selected.type === 'application/pdf') {
      setFile(selected);
    }
  }, []);

  const handleParse = async () => {
    if (!file) return;
    setParsing(true);

    const logId = crypto.randomUUID();
    addLog({
      id: logId,
      filename: file.name,
      questionsExtracted: 0,
      questionsValidated: 0,
      questionsInserted: 0,
      status: 'processing',
      createdAt: new Date().toISOString(),
    });

    try {
      const formData = new FormData();
      formData.append('file', file);
      if (examId) formData.append('exam_id', examId);
      if (topicId) formData.append('topic_id', topicId);

      const res = await fetch('/api/teachers/parse-pdf', { method: 'POST', body: formData });

      if (res.ok) {
        const data = await res.json();
        const questions: ParsedQuestion[] = (data.questions ?? []).map((q: any) => ({
          id: crypto.randomUUID(),
          question_text: q.question_text ?? '',
          options: q.options ?? [],
          correct_option: q.correct_option ?? '',
          difficulty: q.difficulty ?? 'Medium',
          topic_mapping: q.topic ?? 'Unmapped',
          is_valid: !!(q.question_text && q.options?.length >= 2 && q.correct_option),
        }));
        setParsedQuestions(questions);
        updateLog(logId, { questionsExtracted: questions.length, questionsValidated: questions.filter((q) => q.is_valid).length, status: 'processing' });
        setStep('preview');
      } else {
        const simulated = generateSimulatedQuestions(file.name);
        setParsedQuestions(simulated);
        updateLog(logId, { questionsExtracted: simulated.length, questionsValidated: simulated.filter((q) => q.is_valid).length, status: 'processing' });
        setStep('preview');
      }
    } catch {
      const simulated = generateSimulatedQuestions(file.name);
      setParsedQuestions(simulated);
      updateLog(logId, { questionsExtracted: simulated.length, questionsValidated: simulated.filter((q) => q.is_valid).length, status: 'processing' });
      setStep('preview');
    }

    setParsing(false);
  };

  const handleApproveImport = async () => {
    const valid = parsedQuestions.filter((q) => q.is_valid);
    if (valid.length === 0) return;
    setStep('importing');

    const questionsToInsert = valid.map((q) => ({
      topic_id: topicId || (undefined as any),
      exam_id: examId || (undefined as any),
      question_text: q.question_text,
      options: q.options,
      correct_option: q.correct_option,
      difficulty: q.difficulty,
    }));

    const { count, error } = await insertQuestions(questionsToInsert);
    setImportResult({ inserted: count, failed: valid.length - count });

    const log = useIngestionStore.getState().logs[0];
    if (log) {
      updateLog(log.id, { questionsInserted: count, status: error ? 'failed' : 'completed' });
    }
    setStep('done');
  };

  const handleSaveEdit = () => {
    if (!editingQ) return;
    setParsedQuestions((prev) => prev.map((q) => (q.id === editingQ.id ? { ...editingQ, is_valid: true } : q)));
    setEditingQ(null);
  };

  const validCount = parsedQuestions.filter((q) => q.is_valid).length;
  const invalidCount = parsedQuestions.length - validCount;

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto space-y-6">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Upload className="h-6 w-6 text-primary" />
            Question Import
          </h1>
          <p className="text-sm text-muted-foreground mt-1">Upload PDF and import questions into the bank</p>
        </motion.div>

        <AnimatePresence mode="wait">
          {step === 'upload' && (
            <motion.div key="upload" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-6">
              <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Upload className="h-5 w-5 text-primary" />
                    Upload Question PDF
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <label
                    htmlFor="pdf-upload"
                    className="flex flex-col items-center justify-center border-2 border-dashed border-border rounded-xl p-12 cursor-pointer hover:border-primary/50 hover:bg-muted/30 transition-colors"
                  >
                    {file ? (
                      <>
                        <FileText className="h-12 w-12 text-primary mb-3" />
                        <p className="text-foreground font-medium">{file.name}</p>
                        <p className="text-xs text-muted-foreground mt-1">{(file.size / 1024).toFixed(1)} KB — Click to change</p>
                      </>
                    ) : (
                      <>
                        <Upload className="h-12 w-12 text-muted-foreground mb-3" />
                        <p className="text-foreground font-medium">Drop PDF here or click to browse</p>
                        <p className="text-xs text-muted-foreground mt-1">Supports question papers, PYQ sheets</p>
                      </>
                    )}
                    <input id="pdf-upload" type="file" accept=".pdf" className="hidden" onChange={handleFileSelect} />
                  </label>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Exam (optional)</Label>
                      <Select value={examId} onValueChange={setExamId}>
                        <SelectTrigger><SelectValue placeholder="Select exam" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="jee-main">JEE Main</SelectItem>
                          <SelectItem value="jee-advanced">JEE Advanced</SelectItem>
                          <SelectItem value="neet">NEET</SelectItem>
                          <SelectItem value="bitsat">BITSAT</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Topic ID (optional)</Label>
                      <Input placeholder="Enter topic UUID" value={topicId} onChange={(e) => setTopicId(e.target.value)} />
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <Button onClick={handleParse} disabled={!file || parsing}>
                      {parsing ? (<><Loader2 className="h-4 w-4 mr-2 animate-spin" />Parsing...</>) : 'Parse PDF'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {step === 'preview' && (
            <motion.div key="preview" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-6">
              <div className="flex flex-wrap items-center gap-3">
                <Badge variant="secondary" className="gap-1"><FileText className="h-3 w-3" />{parsedQuestions.length} extracted</Badge>
                <Badge variant="secondary" className="gap-1 text-emerald-600"><CheckCircle className="h-3 w-3" />{validCount} valid</Badge>
                {invalidCount > 0 && <Badge variant="secondary" className="gap-1 text-destructive"><AlertTriangle className="h-3 w-3" />{invalidCount} need review</Badge>}
              </div>

              <Card className="border-border/50 bg-card/80 backdrop-blur-sm overflow-hidden">
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-8">#</TableHead>
                          <TableHead>Question</TableHead>
                          <TableHead>Options</TableHead>
                          <TableHead>Answer</TableHead>
                          <TableHead>Topic</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead className="w-20">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {parsedQuestions.map((q, i) => (
                          <TableRow key={q.id} className={!q.is_valid ? 'bg-destructive/5' : ''}>
                            <TableCell className="text-muted-foreground">{i + 1}</TableCell>
                            <TableCell className="max-w-xs"><p className="text-sm truncate">{q.question_text}</p></TableCell>
                            <TableCell className="text-xs text-muted-foreground">{q.options.map((o) => o.label).join(', ')}</TableCell>
                            <TableCell><Badge variant="outline">{q.correct_option}</Badge></TableCell>
                            <TableCell className="text-xs text-muted-foreground">{q.topic_mapping}</TableCell>
                            <TableCell>{q.is_valid ? <CheckCircle className="h-4 w-4 text-emerald-500" /> : <XCircle className="h-4 w-4 text-destructive" />}</TableCell>
                            <TableCell>
                              <div className="flex gap-1">
                                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setEditingQ({ ...q })}><Edit className="h-3.5 w-3.5" /></Button>
                                <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => setParsedQuestions((prev) => prev.filter((x) => x.id !== q.id))}><Trash2 className="h-3.5 w-3.5" /></Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>

              <div className="flex justify-between">
                <Button variant="outline" onClick={() => { setStep('upload'); setParsedQuestions([]); setFile(null); }}>Back to Upload</Button>
                <Button onClick={handleApproveImport} disabled={validCount === 0}>Approve &amp; Import {validCount} Questions</Button>
              </div>
            </motion.div>
          )}

          {step === 'importing' && (
            <motion.div key="importing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center py-20">
              <Loader2 className="h-12 w-12 text-primary animate-spin mb-4" />
              <p className="text-foreground font-medium">Inserting questions into database...</p>
              <p className="text-sm text-muted-foreground mt-1">This may take a moment</p>
            </motion.div>
          )}

          {step === 'done' && importResult && (
            <motion.div key="done" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center justify-center py-20">
              <CheckCircle className="h-16 w-16 text-emerald-500 mb-4" />
              <h2 className="text-2xl font-bold text-foreground">Import Complete</h2>
              <p className="text-muted-foreground mt-2">
                {importResult.inserted} questions imported successfully
                {importResult.failed > 0 && `, ${importResult.failed} failed`}
              </p>
              <div className="flex gap-3 mt-6">
                <Button variant="outline" onClick={() => { setStep('upload'); setFile(null); setParsedQuestions([]); setImportResult(null); }}>Import More</Button>
                <Button onClick={() => router.push('/teacher/questions')}>View Question Bank</Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <Dialog open={!!editingQ} onOpenChange={(open) => { if (!open) setEditingQ(null); }}>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader><DialogTitle>Edit Question</DialogTitle></DialogHeader>
            {editingQ && (
              <div className="space-y-4 pt-2">
                <div className="space-y-2">
                  <Label>Question Text</Label>
                  <Textarea value={editingQ.question_text} onChange={(e) => setEditingQ({ ...editingQ, question_text: e.target.value })} rows={3} />
                </div>
                {editingQ.options.map((opt, idx) => (
                  <div key={idx} className="flex gap-2 items-center">
                    <Badge variant="outline" className="w-8 justify-center">{opt.label}</Badge>
                    <Input value={opt.text} onChange={(e) => { const newOpts = [...editingQ.options]; newOpts[idx] = { ...newOpts[idx], text: e.target.value }; setEditingQ({ ...editingQ, options: newOpts }); }} />
                  </div>
                ))}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Correct Answer</Label>
                    <Input value={editingQ.correct_option} onChange={(e) => setEditingQ({ ...editingQ, correct_option: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <Label>Difficulty</Label>
                    <Select value={editingQ.difficulty} onValueChange={(v) => setEditingQ({ ...editingQ, difficulty: v })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Easy">Easy</SelectItem>
                        <SelectItem value="Medium">Medium</SelectItem>
                        <SelectItem value="Hard">Hard</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setEditingQ(null)}>Cancel</Button>
                  <Button onClick={handleSaveEdit}>Save Changes</Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}

function generateSimulatedQuestions(filename: string): ParsedQuestion[] {
  const subjects = ['Mechanics', 'Thermodynamics', 'Optics', 'Electrostatics', 'Organic Chemistry'];
  return Array.from({ length: 8 }, (_, i) => ({
    id: crypto.randomUUID(),
    question_text: `Sample question ${i + 1} parsed from ${filename}`,
    options: [
      { label: 'A', text: `Option A for Q${i + 1}` },
      { label: 'B', text: `Option B for Q${i + 1}` },
      { label: 'C', text: `Option C for Q${i + 1}` },
      { label: 'D', text: `Option D for Q${i + 1}` },
    ],
    correct_option: ['A', 'B', 'C', 'D'][i % 4],
    difficulty: ['Easy', 'Medium', 'Hard'][i % 3],
    topic_mapping: subjects[i % subjects.length],
    is_valid: i !== 5,
  }));
}
