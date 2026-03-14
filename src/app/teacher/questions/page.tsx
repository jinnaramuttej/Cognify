'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  getQuestions,
  getFilterOptions,
  updateQuestion,
  deleteQuestion,
  type QuestionRow,
  type QuestionFilters,
} from '@/lib/teacher-service';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
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
import {
  Search,
  Filter,
  Edit,
  Trash2,
  ChevronLeft,
  ChevronRight,
  BookOpen,
  Loader2,
} from 'lucide-react';

const DIFFICULTIES = ['Easy', 'Medium', 'Hard'];
const PAGE_SIZE = 20;

export default function QuestionBankPage() {
  const [search, setSearch] = useState('');
  const [subject, setSubject] = useState('');
  const [chapter, setChapter] = useState('');
  const [difficulty, setDifficulty] = useState('');
  const [exam, setExam] = useState('');
  const [year, setYear] = useState('');
  const [page, setPage] = useState(0);

  const [questions, setQuestions] = useState<QuestionRow[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [editingQ, setEditingQ] = useState<QuestionRow | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);

  const [subjects, setSubjects] = useState<string[]>([]);
  const [chapters, setChapters] = useState<{ name: string; subject: string }[]>([]);
  const [exams, setExams] = useState<string[]>([]);

  useEffect(() => {
    getFilterOptions().then(({ subjects, chapters, exams }) => {
      setSubjects(subjects);
      setChapters(chapters);
      setExams(exams);
    });
  }, []);

  const loadQuestions = useCallback(async () => {
    setLoading(true);
    const filters: QuestionFilters = {
      search: search || undefined,
      subject: subject || undefined,
      chapter: chapter || undefined,
      difficulty: difficulty || undefined,
      exam: exam || undefined,
      year: year ? parseInt(year) : undefined,
      page,
      pageSize: PAGE_SIZE,
    };
    const { data, total: t } = await getQuestions(filters);
    setQuestions(data);
    setTotal(t);
    setLoading(false);
  }, [search, subject, chapter, difficulty, exam, year, page]);

  useEffect(() => {
    loadQuestions();
  }, [loadQuestions]);

  const handleSearch = () => {
    setPage(0);
    loadQuestions();
  };

  const handleClearFilters = () => {
    setSearch('');
    setSubject('');
    setChapter('');
    setDifficulty('');
    setExam('');
    setYear('');
    setPage(0);
  };

  const handleSaveEdit = async () => {
    if (!editingQ) return;
    setSaving(true);
    const { error } = await updateQuestion(editingQ.id, {
      question_text: editingQ.question_text,
      options: editingQ.options,
      correct_option: editingQ.correct_option,
      difficulty: editingQ.difficulty,
      explanation: editingQ.explanation,
    });
    if (!error) {
      setQuestions((prev) => prev.map((q) => (q.id === editingQ.id ? editingQ : q)));
    }
    setSaving(false);
    setEditingQ(null);
  };

  const handleDelete = async (id: string) => {
    setDeleting(id);
    const { error } = await deleteQuestion(id);
    if (!error) {
      setQuestions((prev) => prev.filter((q) => q.id !== id));
      setTotal((prev) => prev - 1);
    }
    setDeleting(null);
  };

  const difficultyColor = (d: string) => {
    switch (d) {
      case 'Easy': return 'bg-emerald-500/10 text-emerald-600 border-emerald-500/30';
      case 'Medium': return 'bg-amber-500/10 text-amber-600 border-amber-500/30';
      case 'Hard': return 'bg-red-500/10 text-red-600 border-red-500/30';
      default: return '';
    }
  };

  const totalPages = Math.ceil(total / PAGE_SIZE);
  const filteredChapters = subject ? chapters.filter((c) => c.subject === subject) : chapters;

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto space-y-6">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-3">
          <div>
            <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <BookOpen className="h-6 w-6 text-primary" />
              Question Bank
            </h1>
            <p className="text-sm text-muted-foreground">{total.toLocaleString()} questions total</p>
          </div>
        </motion.div>

        {/* Filters */}
        <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
          <CardContent className="pt-5 space-y-4">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search questions..." className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSearch()} />
              </div>
              <Button onClick={handleSearch}><Filter className="h-4 w-4 mr-2" />Apply</Button>
              <Button variant="outline" onClick={handleClearFilters}>Clear</Button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
              <Select value={subject} onValueChange={(v) => { setSubject(v === 'all' ? '' : v); setChapter(''); }}>
                <SelectTrigger><SelectValue placeholder="Subject" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Subjects</SelectItem>
                  {subjects.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                </SelectContent>
              </Select>

              <Select value={chapter} onValueChange={(v) => setChapter(v === 'all' ? '' : v)}>
                <SelectTrigger><SelectValue placeholder="Chapter" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Chapters</SelectItem>
                  {filteredChapters.map((c) => <SelectItem key={c.name} value={c.name}>{c.name}</SelectItem>)}
                </SelectContent>
              </Select>

              <Select value={difficulty} onValueChange={(v) => setDifficulty(v === 'all' ? '' : v)}>
                <SelectTrigger><SelectValue placeholder="Difficulty" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  {DIFFICULTIES.map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                </SelectContent>
              </Select>

              <Select value={exam} onValueChange={(v) => setExam(v === 'all' ? '' : v)}>
                <SelectTrigger><SelectValue placeholder="Exam" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Exams</SelectItem>
                  {exams.map((e) => <SelectItem key={e} value={e}>{e}</SelectItem>)}
                </SelectContent>
              </Select>

              <Input placeholder="Year" type="number" value={year} onChange={(e) => setYear(e.target.value)} />
            </div>
          </CardContent>
        </Card>

        {/* Table */}
        <Card className="border-border/50 bg-card/80 backdrop-blur-sm overflow-hidden">
          <CardContent className="p-0">
            {loading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : questions.length === 0 ? (
              <div className="text-center py-20 text-muted-foreground">
                <BookOpen className="h-10 w-10 mx-auto mb-3 opacity-40" />
                <p>No questions found</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-8">#</TableHead>
                      <TableHead>Question</TableHead>
                      <TableHead>Subject</TableHead>
                      <TableHead>Chapter</TableHead>
                      <TableHead>Difficulty</TableHead>
                      <TableHead>PYQ</TableHead>
                      <TableHead className="w-24">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {questions.map((q, i) => (
                      <TableRow key={q.id}>
                        <TableCell className="text-muted-foreground">{page * PAGE_SIZE + i + 1}</TableCell>
                        <TableCell className="max-w-xs"><p className="text-sm truncate">{q.question_text}</p></TableCell>
                        <TableCell className="text-sm">{q.subject_name ?? '—'}</TableCell>
                        <TableCell className="text-sm">{q.chapter_name ?? '—'}</TableCell>
                        <TableCell><Badge variant="outline" className={difficultyColor(q.difficulty)}>{q.difficulty}</Badge></TableCell>
                        <TableCell>{q.is_pyq ? <Badge variant="secondary">PYQ {q.year}</Badge> : '—'}</TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setEditingQ({ ...q })}><Edit className="h-3.5 w-3.5" /></Button>
                            <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" disabled={deleting === q.id} onClick={() => handleDelete(q.id)}>
                              {deleting === q.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">Page {page + 1} of {totalPages}</p>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" disabled={page === 0} onClick={() => setPage((p) => p - 1)}>
                <ChevronLeft className="h-4 w-4 mr-1" />Prev
              </Button>
              <Button variant="outline" size="sm" disabled={page >= totalPages - 1} onClick={() => setPage((p) => p + 1)}>
                Next<ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </div>
        )}

        {/* Edit Modal */}
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
                        {DIFFICULTIES.map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Explanation</Label>
                  <Textarea value={editingQ.explanation ?? ''} onChange={(e) => setEditingQ({ ...editingQ, explanation: e.target.value || null })} rows={2} />
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setEditingQ(null)}>Cancel</Button>
                  <Button onClick={handleSaveEdit} disabled={saving}>{saving ? 'Saving...' : 'Save Changes'}</Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
