'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import {
  getFilterOptionsWithIds,
  getQuestions,
  createTest,
  getAllBatches,
  type ExamOption,
  type SubjectOption,
  type ChapterOption,
  type QuestionRow,
  type BatchInfo,
  type CreateTestPayload,
} from '@/lib/teacher-service';
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
import { Checkbox } from '@/components/ui/checkbox';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  FileText,
  Loader2,
  CheckCircle,
  Search,
  Plus,
  Minus,
  Clock,
  Users,
} from 'lucide-react';

type BuilderStep = 'configure' | 'select' | 'review' | 'created';

export default function TestBuilderPage() {
  const { user } = useAuth();

  // Step
  const [step, setStep] = useState<BuilderStep>('configure');

  // Config
  const [title, setTitle] = useState('');
  const [duration, setDuration] = useState(60);
  const [dueDate, setDueDate] = useState('');
  const [selectedBatch, setSelectedBatch] = useState('');

  // Filter options
  const [exams, setExams] = useState<ExamOption[]>([]);
  const [subjects, setSubjects] = useState<SubjectOption[]>([]);
  const [chapters, setChapters] = useState<ChapterOption[]>([]);
  const [batches, setBatches] = useState<(BatchInfo & { invite_code: string; description: string | null })[]>([]);

  // Question selection filters
  const [filterExam, setFilterExam] = useState('');
  const [filterSubject, setFilterSubject] = useState('');
  const [filterChapter, setFilterChapter] = useState('');
  const [filterDifficulty, setFilterDifficulty] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // Questions
  const [availableQuestions, setAvailableQuestions] = useState<QuestionRow[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [loadingQuestions, setLoadingQuestions] = useState(false);
  const [totalAvailable, setTotalAvailable] = useState(0);
  const [qPage, setQPage] = useState(0);

  // Result
  const [creating, setCreating] = useState(false);
  const [createdTestId, setCreatedTestId] = useState<string | null>(null);
  const [createError, setCreateError] = useState<string | null>(null);

  useEffect(() => {
    const loadOptions = async () => {
      const opts = await getFilterOptionsWithIds();
      setExams(opts.exams);
      setSubjects(opts.subjects);
      setChapters(opts.chapters);

      if (user?.id) {
        const { data } = await getAllBatches(user.id);
        setBatches(data);
      }
    };
    loadOptions();
  }, [user?.id]);

  const filteredSubjects = filterExam
    ? subjects.filter((s) => s.exam_id === filterExam)
    : subjects;
  const filteredChapters = filterSubject
    ? chapters.filter((c) => c.subject_id === filterSubject)
    : chapters;

  const loadQuestions = useCallback(async () => {
    setLoadingQuestions(true);
    const selectedExamName = exams.find((e) => e.id === filterExam)?.name;
    const selectedSubjectName = subjects.find((s) => s.id === filterSubject)?.name;
    const selectedChapterName = chapters.find((c) => c.id === filterChapter)?.name;

    const { data, total } = await getQuestions({
      search: searchQuery || undefined,
      exam: selectedExamName || undefined,
      subject: selectedSubjectName || undefined,
      chapter: selectedChapterName || undefined,
      difficulty: filterDifficulty || undefined,
      page: qPage,
      pageSize: 30,
    });

    setAvailableQuestions(data);
    setTotalAvailable(total);
    setLoadingQuestions(false);
  }, [filterExam, filterSubject, filterChapter, filterDifficulty, searchQuery, qPage, exams, subjects, chapters]);

  useEffect(() => {
    if (step === 'select') {
      loadQuestions();
    }
  }, [step, loadQuestions]);

  const toggleQuestion = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const selectAll = () => {
    const allIds = availableQuestions.map((q) => q.id);
    setSelectedIds((prev) => {
      const next = new Set(prev);
      allIds.forEach((id) => next.add(id));
      return next;
    });
  };

  const deselectAll = () => {
    const pageIds = new Set(availableQuestions.map((q) => q.id));
    setSelectedIds((prev) => {
      const next = new Set(prev);
      pageIds.forEach((id) => next.delete(id));
      return next;
    });
  };

  const handleCreate = async () => {
    if (!user?.id || selectedIds.size === 0 || !title.trim()) return;
    setCreating(true);
    setCreateError(null);

    const payload: CreateTestPayload = {
      title: title.trim(),
      created_by: user.id,
      question_ids: Array.from(selectedIds),
      duration_minutes: duration,
      due_date: dueDate || undefined,
      batch_id: selectedBatch || undefined,
    };

    const { testId, error } = await createTest(payload);
    if (error) {
      setCreateError(error);
    } else {
      setCreatedTestId(testId);
      setStep('created');
    }
    setCreating(false);
  };

  const selectedQuestions = availableQuestions.filter((q) => selectedIds.has(q.id));

  const difficultyColor = (d: string) => {
    switch (d) {
      case 'Easy': return 'bg-emerald-500/10 text-emerald-600 border-emerald-500/30';
      case 'Medium': return 'bg-amber-500/10 text-amber-600 border-amber-500/30';
      case 'Hard': return 'bg-red-500/10 text-red-600 border-red-500/30';
      default: return '';
    }
  };

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto space-y-6">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <FileText className="h-6 w-6 text-primary" />
            Test Builder
          </h1>
          <p className="text-sm text-muted-foreground mt-1">Create and assign tests to your batches</p>
        </motion.div>

        {/* Step indicator */}
        <div className="flex items-center gap-2 text-sm">
          {(['configure', 'select', 'review'] as const).map((s, i) => (
            <div key={s} className="flex items-center gap-2">
              {i > 0 && <div className="w-8 h-px bg-border" />}
              <Badge
                variant={step === s ? 'default' : step === 'created' || (['configure', 'select', 'review'].indexOf(step) > i) ? 'secondary' : 'outline'}
                className="capitalize"
              >
                {i + 1}. {s}
              </Badge>
            </div>
          ))}
        </div>

        {/* Step 1: Configure */}
        {step === 'configure' && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
              <CardHeader><CardTitle>Test Configuration</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="test-title">Test Title *</Label>
                  <Input id="test-title" placeholder="e.g. JEE Mains Mock Test - Physics" value={title} onChange={(e) => setTitle(e.target.value)} />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="duration" className="flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5" />Duration (mins)
                    </Label>
                    <Input id="duration" type="number" min={5} max={300} value={duration} onChange={(e) => setDuration(parseInt(e.target.value) || 60)} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="due-date">Due Date (optional)</Label>
                    <Input id="due-date" type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label className="flex items-center gap-1">
                      <Users className="h-3.5 w-3.5" />Assign to Batch
                    </Label>
                    <Select value={selectedBatch} onValueChange={setSelectedBatch}>
                      <SelectTrigger><SelectValue placeholder="Select batch" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">No batch</SelectItem>
                        {batches.map((b) => (
                          <SelectItem key={b.id} value={b.id}>{b.name} ({b.studentCount} students)</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button disabled={!title.trim()} onClick={() => setStep('select')}>
                    Next: Select Questions
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Step 2: Select Questions */}
        {step === 'select' && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
            {/* Filters */}
            <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
              <CardContent className="pt-5 space-y-4">
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input placeholder="Search questions..." className="pl-9" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
                  </div>
                  <Badge variant="secondary" className="h-10 px-4 flex items-center gap-1">
                    {selectedIds.size} selected
                  </Badge>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <Select value={filterExam} onValueChange={(v) => { setFilterExam(v === 'all' ? '' : v); setFilterSubject(''); setFilterChapter(''); }}>
                    <SelectTrigger><SelectValue placeholder="Exam" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Exams</SelectItem>
                      {exams.map((e) => <SelectItem key={e.id} value={e.id}>{e.name}</SelectItem>)}
                    </SelectContent>
                  </Select>

                  <Select value={filterSubject} onValueChange={(v) => { setFilterSubject(v === 'all' ? '' : v); setFilterChapter(''); }}>
                    <SelectTrigger><SelectValue placeholder="Subject" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Subjects</SelectItem>
                      {filteredSubjects.map((s) => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
                    </SelectContent>
                  </Select>

                  <Select value={filterChapter} onValueChange={(v) => setFilterChapter(v === 'all' ? '' : v)}>
                    <SelectTrigger><SelectValue placeholder="Chapter" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Chapters</SelectItem>
                      {filteredChapters.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                    </SelectContent>
                  </Select>

                  <Select value={filterDifficulty} onValueChange={(v) => setFilterDifficulty(v === 'all' ? '' : v)}>
                    <SelectTrigger><SelectValue placeholder="Difficulty" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All</SelectItem>
                      <SelectItem value="Easy">Easy</SelectItem>
                      <SelectItem value="Medium">Medium</SelectItem>
                      <SelectItem value="Hard">Hard</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={selectAll}><Plus className="h-3.5 w-3.5 mr-1" />Select All on Page</Button>
                  <Button variant="outline" size="sm" onClick={deselectAll}><Minus className="h-3.5 w-3.5 mr-1" />Deselect Page</Button>
                </div>
              </CardContent>
            </Card>

            {/* Questions */}
            <Card className="border-border/50 bg-card/80 backdrop-blur-sm overflow-hidden">
              <CardContent className="p-0">
                {loadingQuestions ? (
                  <div className="flex items-center justify-center py-20">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : availableQuestions.length === 0 ? (
                  <div className="text-center py-20 text-muted-foreground">No questions found</div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-10"></TableHead>
                          <TableHead>Question</TableHead>
                          <TableHead>Subject</TableHead>
                          <TableHead>Chapter</TableHead>
                          <TableHead>Difficulty</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {availableQuestions.map((q) => (
                          <TableRow key={q.id} className={selectedIds.has(q.id) ? 'bg-primary/5' : ''}>
                            <TableCell>
                              <Checkbox checked={selectedIds.has(q.id)} onCheckedChange={() => toggleQuestion(q.id)} />
                            </TableCell>
                            <TableCell className="max-w-sm"><p className="text-sm truncate">{q.question_text}</p></TableCell>
                            <TableCell className="text-sm">{q.subject_name ?? '—'}</TableCell>
                            <TableCell className="text-sm">{q.chapter_name ?? '—'}</TableCell>
                            <TableCell><Badge variant="outline" className={difficultyColor(q.difficulty)}>{q.difficulty}</Badge></TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Pagination + Navigation */}
            <div className="flex items-center justify-between">
              <Button variant="outline" onClick={() => setStep('configure')}>Back</Button>
              <div className="flex gap-2">
                {qPage > 0 && <Button variant="outline" size="sm" onClick={() => setQPage((p) => p - 1)}>Prev</Button>}
                {availableQuestions.length === 30 && <Button variant="outline" size="sm" onClick={() => setQPage((p) => p + 1)}>More</Button>}
              </div>
              <Button disabled={selectedIds.size === 0} onClick={() => setStep('review')}>
                Review ({selectedIds.size} questions)
              </Button>
            </div>
          </motion.div>
        )}

        {/* Step 3: Review */}
        {step === 'review' && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
              <CardHeader><CardTitle>Review Test</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div>
                    <p className="text-xs text-muted-foreground">Title</p>
                    <p className="font-medium">{title}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Questions</p>
                    <p className="font-medium">{selectedIds.size}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Duration</p>
                    <p className="font-medium">{duration} mins</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Batch</p>
                    <p className="font-medium">{batches.find((b) => b.id === selectedBatch)?.name || 'None'}</p>
                  </div>
                </div>

                {createError && (
                  <div className="p-3 bg-destructive/10 text-destructive rounded-lg text-sm">{createError}</div>
                )}

                <div className="flex justify-between">
                  <Button variant="outline" onClick={() => setStep('select')}>Back to Selection</Button>
                  <Button onClick={handleCreate} disabled={creating}>
                    {creating ? (<><Loader2 className="h-4 w-4 mr-2 animate-spin" />Creating...</>) : 'Create Test'}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Selected questions preview */}
            <Card className="border-border/50 bg-card/80 backdrop-blur-sm overflow-hidden">
              <CardHeader><CardTitle className="text-base">Selected Questions ({selectedIds.size})</CardTitle></CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-8">#</TableHead>
                        <TableHead>Question</TableHead>
                        <TableHead>Subject</TableHead>
                        <TableHead>Difficulty</TableHead>
                        <TableHead className="w-10"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {selectedQuestions.map((q, i) => (
                        <TableRow key={q.id}>
                          <TableCell className="text-muted-foreground">{i + 1}</TableCell>
                          <TableCell className="max-w-sm"><p className="text-sm truncate">{q.question_text}</p></TableCell>
                          <TableCell className="text-sm">{q.subject_name ?? '—'}</TableCell>
                          <TableCell><Badge variant="outline" className={difficultyColor(q.difficulty)}>{q.difficulty}</Badge></TableCell>
                          <TableCell>
                            <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => toggleQuestion(q.id)}>
                              <Minus className="h-3.5 w-3.5" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Step 4: Created */}
        {step === 'created' && (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center justify-center py-20">
            <CheckCircle className="h-16 w-16 text-emerald-500 mb-4" />
            <h2 className="text-2xl font-bold text-foreground">Test Created</h2>
            <p className="text-muted-foreground mt-2">
              &quot;{title}&quot; with {selectedIds.size} questions has been created.
            </p>
            <div className="flex gap-3 mt-6">
              <Button variant="outline" onClick={() => {
                setStep('configure');
                setTitle('');
                setSelectedIds(new Set());
                setCreatedTestId(null);
              }}>
                Create Another
              </Button>
              <Button onClick={() => setStep('configure')}>Back to Builder</Button>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
