"use client";

import { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import {
  Target,
  BookOpen,
  Clock,
  Settings2,
  Sparkles,
  ChevronRight,
  ChevronLeft,
  Check,
  AlertCircle,
  PlayCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";

// --- DATA MOCKS ---
const EXAMS = [
  { id: "JEE", name: "JEE Main", icon: "🎯" },
  { id: "JEE_ADV", name: "JEE Advanced", icon: "🚀" },
  { id: "NEET", name: "NEET UG", icon: "🏥" },
  { id: "BITSAT", name: "BITSAT", icon: "⚡" },
];

const SUBJECTS: Record<string, string[]> = {
  JEE: ["Physics", "Chemistry", "Mathematics"],
  JEE_ADV: ["Physics", "Chemistry", "Mathematics"],
  NEET: ["Physics", "Chemistry", "Biology"],
  BITSAT: [
    "Physics",
    "Chemistry",
    "Mathematics",
    "English",
    "Logical Reasoning",
  ],
};

const CHAPTERS: Record<string, string[]> = {
  Physics: [
    "Physics and Measurement",
    "Kinematics",
    "Laws of Motion",
    "Work, Energy and Power",
    "Rotational Motion",
    "Gravitation",
    "Properties of Solids and Liquids",
    "Thermodynamics",
    "Kinetic Theory of Gases",
    "Oscillations and Waves",
    "Electrostatics",
    "Current Electricity",
    "Magnetic Effects of Current and Magnetism",
    "Electromagnetic Induction and Alternating Currents",
    "Electromagnetic Waves",
    "Optics",
    "Dual Nature of Matter and Radiation",
    "Atoms and Nuclei",
    "Electronic Devices",
  ],
  Chemistry: [
    "Some Basic Concepts in Chemistry",
    "Atomic Structure",
    "Chemical Bonding and Molecular Structure",
    "Chemical Thermodynamics",
    "Solutions",
    "Equilibrium",
    "Redox Reactions and Electrochemistry",
    "Chemical Kinetics",
    "Classification of Elements and Periodicity in Properties",
    "p-Block Elements",
    "d- and f-Block Elements",
    "Coordination Compounds",
    "Purification and Characterisation of Organic Compounds",
    "Some Basic Principles of Organic Chemistry",
    "Hydrocarbons",
    "Organic Compounds Containing Halogens",
    "Organic Compounds Containing Oxygen",
    "Organic Compounds Containing Nitrogen",
    "Biomolecules",
  ],
  Mathematics: [
    "Sets, Relations and Functions",
    "Complex Numbers and Quadratic Equations",
    "Matrices and Determinants",
    "Permutations and Combinations",
    "Mathematical Induction",
    "Binomial Theorem and its Simple Applications",
    "Sequence and Series",
    "Limit, Continuity and Differentiability",
    "Integral Calculus",
    "Differential Equations",
    "Coordinate Geometry",
    "Three Dimensional Geometry",
    "Vector Algebra",
    "Statistics and Probability",
    "Trigonometry",
  ],
  Biology: ["Human Physiology", "Genetics", "Ecology", "Cell Biology"],
  English: ["Grammar", "Vocabulary", "Reading Comprehension"],
  "Logical Reasoning": ["Verbal Reasoning", "Non-Verbal Reasoning"],
};

const DIFFICULTIES = [
  {
    id: "easy",
    name: "Foundation",
    desc: "Direct formula based",
    color: "bg-emerald-500",
  },
  {
    id: "medium",
    name: "Standard (Mains)",
    desc: "Multi-concept application",
    color: "bg-blue-500",
  },
  {
    id: "hard",
    name: "Advanced",
    desc: "Deep analytical problems",
    color: "bg-indigo-500",
  },
  {
    id: "mixed",
    name: "Exam Sim",
    desc: "Real exam distribution",
    color: "bg-purple-500",
  },
];

// --- MAIN WIZARD COMPONENT ---
export default function CreateTestWizard() {
  const router = useRouter();

  // Wizard State
  const [step, setStep] = useState(1);
  const [isCreating, setIsCreating] = useState(false);

  // Configuration State
  // DB types
  type DbExam = { id: string; name: string; icon: string };
  type DbSubject = { id: string; name: string };
  type DbChapter = { id: string; name: string; subject_id: string };

  const [loadedExams, setLoadedExams] = useState<DbExam[]>([]);
  const [loadedSubjects, setLoadedSubjects] = useState<DbSubject[]>([]);
  const [loadedChapters, setLoadedChapters] = useState<DbChapter[]>([]);
  const [loadingSubjects, setLoadingSubjects] = useState(false);
  const [loadingChapters, setLoadingChapters] = useState(false);

  const [exam, setExam] = useState("");
  const [subjects, setSubjects] = useState<string[]>([]);
  const [chapters, setChapters] = useState<string[]>([]);

  const [questionCount, setQuestionCount] = useState(30);
  const [timeLimit, setTimeLimit] = useState(60);
  const [difficulty, setDifficulty] = useState("medium");

  const [includePYQ, setIncludePYQ] = useState(true);
  const [mode, setMode] = useState<"practice" | "strict">("practice");
  const [yearFilter, setYearFilter] = useState("all");

  // Fetch exams on mount
  useEffect(() => {
    fetch('/api/tests/exams')
      .then((r) => r.json())
      .then((d) => {
        if (d.success && d.exams?.length) {
          setLoadedExams(d.exams);
          setExam(d.exams[0].id);
        }
      })
      .catch(() => {});
  }, []);

  // Fetch subjects when exam changes
  useEffect(() => {
    if (!exam) return;
    setLoadingSubjects(true);
    setLoadedSubjects([]);
    setSubjects([]);
    setChapters([]);
    fetch(`/api/tests/subjects?examId=${exam}`)
      .then((r) => r.json())
      .then((d) => { if (d.success) setLoadedSubjects(d.subjects ?? []); })
      .catch(() => {})
      .finally(() => setLoadingSubjects(false));
  }, [exam]);

  // Fetch chapters when subjects change
  useEffect(() => {
    if (subjects.length === 0) { setLoadedChapters([]); setChapters([]); return; }
    setLoadingChapters(true);
    fetch(`/api/tests/chapters?subjectIds=${subjects.join(',')}`)
      .then((r) => r.json())
      .then((d) => { if (d.success) setLoadedChapters(d.chapters ?? []); })
      .catch(() => {})
      .finally(() => setLoadingChapters(false));
  }, [subjects]);

  // Derived / Calculated
  const availableChapters = useMemo(
    () => loadedChapters.map((ch) => `${ch.subject_id}:${ch.id}`),
    [loadedChapters],
  );

  const chapterNames = useMemo(() => {
    const map: Record<string, { chap: string; sub: string }> = {};
    loadedChapters.forEach((ch) => {
      const subName = loadedSubjects.find((s) => s.id === ch.subject_id)?.name ?? '';
      map[`${ch.subject_id}:${ch.id}`] = { chap: ch.name, sub: subName };
    });
    return map;
  }, [loadedChapters, loadedSubjects]);

  const toggleSubject = (subId: string) => {
    setSubjects((prev) => {
      const isSelected = prev.includes(subId);
      if (isSelected) {
        setChapters((c) => c.filter((ch) => !ch.startsWith(`${subId}:`)));
        return prev.filter((s) => s !== subId);
      }
      return [...prev, subId];
    });
  };

  const toggleChapter = (chapNode: string) => {
    setChapters((prev) =>
      prev.includes(chapNode)
        ? prev.filter((c) => c !== chapNode)
        : [...prev, chapNode],
    );
  };

  const previewStats = useMemo(() => {
    const avgTime = timeLimit / questionCount;
    const poolSize = (chapters.length || subjects.length * 5) * 40;
    const coverage = Math.min(
      100,
      Math.round((questionCount / Math.max(1, poolSize)) * 100),
    );
    return {
      avgTime: avgTime.toFixed(1),
      poolSize,
      coverage,
      isPaceGood: avgTime >= 1.5 && avgTime <= 3,
      tooFast: avgTime < 1.5,
    };
  }, [questionCount, timeLimit, chapters, subjects]);

  // --- HANDLERS ---
  const handleNext = () => {
    if (step === 1 && !exam) return;
    if (step === 2 && subjects.length === 0) return;
    if (step < 4) setStep(step + 1);
  };

  const handleCreate = async () => {
    setIsCreating(true);
    try {
      // 1. Create the test session in DB
      const createRes = await fetch('/api/tests/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          examId: exam,
          subjectIds: subjects,
          chapterIds: chapters.map((c) => c.split(':')[1]),
          difficulty: difficulty === 'mixed' ? undefined : difficulty,
          questionCount,
          durationMinutes: timeLimit,
          mode,
          negativeMarking: mode === 'strict',
          isPyq: includePYQ,
          years: yearFilter,
        }),
      });
      if (!createRes.ok) {
        const err = await createRes.json().catch(() => ({}));
        throw new Error(err.error || 'Failed to create test');
      }
      const { testId } = await createRes.json();

      // 2. Generate / select questions for the test
      const genRes = await fetch('/api/tests/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ testId }),
      });
      if (!genRes.ok) {
        const err = await genRes.json().catch(() => ({}));
        throw new Error(err.error || 'Failed to generate questions');
      }

      router.push(`/tests/${testId}`);
    } catch (err) {
      console.error('Failed to create test:', err);
      setIsCreating(false);
    }
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6 lg:h-[calc(100vh-8rem)]">
      {/* LEFT: WIZARD */}
      <div className="flex-1 flex flex-col bg-card border border-border rounded-3xl shadow-sm overflow-hidden relative">
        {/* Progress Bar Header */}
        <div className="p-6 border-b border-border bg-muted/30">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-foreground">
              Configure Mock Test
            </h2>
            <div className="text-sm font-semibold text-muted-foreground">
              Step {step} of 4
            </div>
          </div>

          <div className="relative flex justify-between">
            <div className="absolute top-1/2 left-0 w-full h-1 bg-border -translate-y-1/2 rounded-full z-0"></div>
            <div
              className="absolute top-1/2 left-0 h-1 bg-primary -translate-y-1/2 rounded-full z-0 transition-all duration-500"
              style={{ width: `${((step - 1) / 3) * 100}%` }}
            ></div>

            {[
              { icon: Target, label: "Exam" },
              { icon: BookOpen, label: "Syllabus" },
              { icon: Settings2, label: "Parameters" },
              { icon: Sparkles, label: "Finish" },
            ].map((s, i) => {
              const isActive = step >= i + 1;
              const Icon = s.icon;
              return (
                <div
                  key={i}
                  className="relative z-10 flex flex-col items-center gap-2"
                >
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-colors duration-300 ${isActive ? "bg-primary border-primary text-primary-foreground shadow-md shadow-primary/20" : "bg-card border-border text-muted-foreground"}`}
                  >
                    {step > i + 1 ? <Check size={14} /> : i + 1}
                  </div>
                  <span
                    className={`text-[10px] font-semibold uppercase tracking-wider hidden md:block ${isActive ? "text-primary" : "text-muted-foreground"}`}
                  >
                    {s.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Wizard Content Container */}
        <div className="flex-1 overflow-y-auto p-6 md:p-8 relative scrollbar-hide">
          <AnimatePresence mode="wait">
            {/* STEP 1: EXAM */}
            {step === 1 && (
              <motion.div
                key="s1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div>
                  <h3 className="text-lg font-bold text-foreground">
                    Target Exam Format
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Select the baseline pattern for scoring and question
                    framing.
                  </p>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {loadedExams.length === 0 ? (
                    <p className="col-span-4 text-sm text-muted-foreground py-4">Loading exams…</p>
                  ) : loadedExams.map((e) => (
                    <div
                      key={e.id}
                      onClick={() => setExam(e.id)}
                      className={`p-4 rounded-2xl border-2 text-center cursor-pointer transition-all ${exam === e.id ? "border-primary bg-primary/10" : "border-border hover:border-primary/50"}`}
                    >
                      <span className="text-3xl block mb-2">{e.icon}</span>
                      <span
                        className={`font-bold text-sm ${exam === e.id ? "text-primary" : "text-foreground"}`}
                      >
                        {e.name}
                      </span>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* STEP 2: SYLLABUS */}
            {step === 2 && (
              <motion.div
                key="s2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-8"
              >
                <div>
                  <h3 className="text-lg font-bold text-foreground">
                    Subjects
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Pick subjects to include in the mock.
                  </p>
                  <div className="flex flex-wrap gap-3">
                    {loadingSubjects ? (
                      <p className="text-sm text-muted-foreground py-2">Loading subjects…</p>
                    ) : loadedSubjects.map((sub) => (
                      <button
                        key={sub.id}
                        onClick={() => toggleSubject(sub.id)}
                        className={`px-4 py-2 rounded-xl text-sm font-semibold border-2 transition-all flex items-center gap-2 ${subjects.includes(sub.id) ? "border-primary bg-primary/10 text-primary" : "border-border bg-card text-muted-foreground hover:border-primary/50"}`}
                      >
                        {sub.name} {subjects.includes(sub.id) && <Check size={14} />}
                      </button>
                    ))}
                  </div>
                </div>

                {subjects.length > 0 && (
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-bold text-foreground">
                        Topic Focus (Optional)
                      </h3>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          setChapters(
                            chapters.length === availableChapters.length
                              ? []
                              : availableChapters,
                          )
                        }
                      >
                        {chapters.length === availableChapters.length
                          ? "Clear All"
                          : "Select All"}
                      </Button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {loadingChapters ? (
                        <p className="col-span-2 text-sm text-muted-foreground py-2">Loading chapters…</p>
                      ) : availableChapters.map((node) => {
                        const info = chapterNames[node] ?? { chap: node, sub: '' };
                        const isSelect = chapters.includes(node);
                        return (
                          <div
                            key={node}
                            onClick={() => toggleChapter(node)}
                            className={`p-3 rounded-xl border-2 cursor-pointer transition-all flex justify-between items-center ${isSelect ? "border-primary bg-primary/5" : "border-border hover:border-border/80"}`}
                          >
                            <div>
                              <span
                                className={`block text-sm font-bold ${isSelect ? "text-primary" : "text-foreground"}`}
                              >
                                {info.chap}
                              </span>
                              <span className="text-xs text-muted-foreground">
                                {info.sub}
                              </span>
                            </div>
                            <div
                              className={`w-5 h-5 rounded-md border-2 flex items-center justify-center ${isSelect ? "bg-primary border-primary text-primary-foreground" : "border-muted-foreground/30"}`}
                            >
                              {isSelect && <Check size={12} />}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </motion.div>
            )}

            {/* STEP 3: PARAMETERS */}
            {step === 3 && (
              <motion.div
                key="s3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-8"
              >
                <div>
                  <div className="flex justify-between items-end mb-4">
                    <div>
                      <h3 className="text-lg font-bold text-foreground">
                        Test Constraints
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        Adjust length and timing.
                      </p>
                    </div>
                  </div>

                  <div className="space-y-8 p-6 bg-muted/30 rounded-2xl border border-border">
                    <div>
                      <div className="flex justify-between mb-4">
                        <span className="text-sm font-bold text-foreground">
                          Total Questions
                        </span>
                        <span className="text-sm font-bold text-primary px-3 py-1 bg-primary/10 rounded-lg">
                          {questionCount} Qs
                        </span>
                      </div>
                      <Slider
                        value={[questionCount]}
                        onValueChange={(v) => setQuestionCount(v[0])}
                        min={10}
                        max={100}
                        step={5}
                      />
                    </div>

                    <div>
                      <div className="flex justify-between mb-4">
                        <span className="text-sm font-bold text-foreground">
                          Time Limit
                        </span>
                        <span className="text-sm font-bold text-primary px-3 py-1 bg-primary/10 rounded-lg">
                          {timeLimit} mins
                        </span>
                      </div>
                      <Slider
                        value={[timeLimit]}
                        onValueChange={(v) => setTimeLimit(v[0])}
                        min={15}
                        max={180}
                        step={15}
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-bold text-foreground mb-4">
                    Difficulty Spread
                  </h3>
                  <div className="grid grid-cols-2 gap-3">
                    {DIFFICULTIES.map((d) => (
                      <div
                        key={d.id}
                        onClick={() => setDifficulty(d.id)}
                        className={`p-4 rounded-2xl border-2 cursor-pointer transition-all ${difficulty === d.id ? "border-primary bg-primary/5" : "border-border hover:border-primary/30"}`}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <div
                            className={`w-3 h-3 rounded-full ${d.color}`}
                          ></div>
                          <span
                            className={`font-bold text-sm ${difficulty === d.id ? "text-primary" : "text-foreground"}`}
                          >
                            {d.name}
                          </span>
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {d.desc}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {/* STEP 4: EXTRA */}
            {step === 4 && (
              <motion.div
                key="s4"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div>
                  <h3 className="text-lg font-bold text-foreground mb-4">
                    Final Customization
                  </h3>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 rounded-2xl border border-border bg-card">
                      <div>
                        <span className="block font-bold text-foreground text-sm">
                          Prioritize PYQs
                        </span>
                        <span className="text-xs text-muted-foreground block">
                          Ensure 70%+ questions are Previous Year matches.
                        </span>
                      </div>
                      <Switch
                        checked={includePYQ}
                        onCheckedChange={setIncludePYQ}
                        className="data-[state=checked]:bg-primary"
                      />
                    </div>

                    <div className="p-4 rounded-2xl border border-border bg-card">
                      <span className="block font-bold text-foreground text-sm mb-3">
                        Simulation Mode
                      </span>
                      <div className="flex gap-2">
                        <Button
                          variant={mode === "practice" ? "default" : "outline"}
                          onClick={() => setMode("practice")}
                          className={
                            mode === "practice" ? "w-1/2 bg-primary" : "w-1/2"
                          }
                        >
                          Practice (Hints)
                        </Button>
                        <Button
                          variant={mode === "strict" ? "default" : "outline"}
                          onClick={() => setMode("strict")}
                          className={
                            mode === "strict"
                              ? "w-1/2 bg-destructive hover:bg-destructive/90 text-destructive-foreground"
                              : "w-1/2"
                          }
                        >
                          Strict Exam
                        </Button>
                      </div>
                    </div>

                    <div className="p-4 rounded-2xl border border-border bg-card">
                      <span className="block font-bold text-foreground text-sm mb-3">
                        PYQ Year Filter
                      </span>
                      <select
                        value={yearFilter}
                        onChange={(e) => setYearFilter(e.target.value)}
                        className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary outline-none"
                      >
                        <option value="all">All Available Years</option>
                        <option value="last5">
                          Last 5 Years (2019 - 2024)
                        </option>
                        <option value="last10">Last 10 Years</option>
                      </select>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Wizard Footer Controls */}
        <div className="p-6 border-t border-border bg-card flex items-center justify-between mt-auto">
          {step === 1 ? (
            <Button
              variant="ghost"
              className="text-muted-foreground hover:text-foreground"
              onClick={() => router.push("/tests")}
            >
              <ChevronLeft size={16} className="mr-1" /> Dashboard
            </Button>
          ) : (
            <Button
              variant="ghost"
              className="text-muted-foreground hover:text-foreground"
              onClick={() => setStep(step - 1)}
            >
              <ChevronLeft size={16} className="mr-1" /> Back
            </Button>
          )}

          {step < 4 ? (
            <Button
              onClick={handleNext}
              disabled={
                (step === 1 && !exam) || (step === 2 && subjects.length === 0)
              }
              className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl px-8 shadow-md"
            >
              Next <ChevronRight size={16} className="ml-1" />
            </Button>
          ) : (
            <Button
              onClick={handleCreate}
              disabled={isCreating || (step === 2 && subjects.length === 0)}
              className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl px-8 shadow-md group"
            >
              {isCreating ? "Generating Engine..." : "Compile Test"}
              {!isCreating && (
                <PlayCircle
                  size={16}
                  className="ml-2 group-hover:scale-110 transition-transform"
                />
              )}
            </Button>
          )}
        </div>
      </div>

      {/* RIGHT: LIVE PREVIEW PANEL */}
      <div className="w-full lg:w-80 shrink-0">
        <div className="sticky top-6 bg-gradient-to-br from-card to-muted/50 border border-border rounded-3xl p-6 shadow-sm overflow-hidden h-full">
          {/* Decorative Background */}
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-primary/10 blur-3xl rounded-full"></div>

          <h3 className="text-sm font-bold text-foreground uppercase tracking-widest flex items-center gap-2 mb-6">
            <Sparkles size={16} className="text-primary" /> Live Engine Sync
          </h3>

          <div className="space-y-6 relative z-10">
            {/* Top Level Stats */}
            <div className="grid grid-cols-2 gap-3 border-b border-border pb-6">
              <div>
                <span className="text-xs text-muted-foreground block mb-1">
                  Total Qs
                </span>
                <span className="text-3xl font-black text-foreground">
                  {questionCount}
                </span>
              </div>
              <div>
                <span className="text-xs text-muted-foreground block mb-1">
                  Duration
                </span>
                <span className="text-3xl font-black text-primary">
                  {timeLimit}
                  <span className="text-lg text-muted-foreground ml-1 font-medium">
                    m
                  </span>
                </span>
              </div>
            </div>

            {/* Timing Analysis */}
            <div className="bg-background rounded-2xl p-4 border border-border">
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm font-bold text-foreground">
                  Pacing Check
                </span>
                <span
                  className={`text-xs font-bold px-2 py-0.5 rounded-md ${previewStats.tooFast ? "bg-destructive/10 text-destructive" : previewStats.isPaceGood ? "bg-emerald-500/10 text-emerald-500" : "bg-amber-500/10 text-amber-500"}`}
                >
                  {previewStats.avgTime} m / Q
                </span>
              </div>
              <p className="text-[10px] text-muted-foreground mt-2">
                {previewStats.tooFast
                  ? "Warning: Severe time crunch. Standard JEE physics questions require ~2 mins."
                  : "Pacing allows for reading, calculation, and review buffer."}
              </p>
            </div>

            {/* Pool Availability */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-foreground font-semibold flex items-center gap-1.5">
                  <Clock size={14} className="text-muted-foreground" /> Database
                  Pool
                </span>
                <span className="text-xs font-bold text-muted-foreground">
                  {previewStats.poolSize} Avail
                </span>
              </div>
              <Progress
                value={Math.min(
                  100,
                  (questionCount / Math.max(1, previewStats.poolSize)) * 100,
                )}
                className="h-2 bg-muted [&>div]:bg-primary"
              />
              <div className="flex justify-between mt-1 text-[10px] text-muted-foreground font-medium">
                <span>Coverage Density</span>
                <span>{previewStats.coverage}%</span>
              </div>
            </div>

            {/* Composition */}
            <div className="pt-4 border-t border-border">
              <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3">
                Syllabus Matrix
              </h4>
              <div className="flex flex-wrap gap-2">
                {subjects.length > 0 ? (
                  subjects.map((s) => (
                    <div
                      key={s}
                      className="px-2 py-1 bg-muted rounded text-[10px] font-semibold text-foreground border border-border"
                    >
                      {s}
                    </div>
                  ))
                ) : (
                  <span className="text-xs text-muted-foreground">
                    No subjects selected
                  </span>
                )}
                {chapters.length > 0 && (
                  <div className="px-2 py-1 bg-primary/10 text-primary rounded text-[10px] font-bold border border-primary/20">
                    + {chapters.length} Focus Topics
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
