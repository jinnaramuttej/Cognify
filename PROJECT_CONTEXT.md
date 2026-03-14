# Cognify — Project Context

> **⚠️ AI RULE**: Read this file before generating any feature code.
> This document explains the product vision and design philosophy. All code must align with these principles.

---

## 1 — Product Vision

**Cognify** is an AI-powered competitive exam preparation platform built for students in India.

### Mission

| Goal | Description |
|------|-------------|
| **Personalize preparation** | Adapt content and tests to each student's strengths and weaknesses |
| **Simulate real exams** | Recreate actual exam environments with real timing, marking schemes, and question patterns |
| **Analyze performance deeply** | Go beyond scores — identify weak chapters, time management issues, and accuracy patterns |
| **AI-powered tutoring** | Provide a conversational AI tutor (Cogni) for concept explanation and mistake analysis |

### Target Exams

| Exam | Category | Subjects |
|------|----------|----------|
| **JEE Main** | Engineering | Physics, Chemistry, Mathematics |
| **JEE Advanced** | Engineering | Physics, Chemistry, Mathematics |
| **NEET** | Medical | Physics, Chemistry, Botany, Zoology |
| **BITSAT** | Engineering | Physics, Chemistry, Mathematics |

### Target Users

- **Class 11** students beginning exam preparation
- **Class 12** students in their final preparation year
- **Droppers** re-attempting competitive exams

---

## 2 — Core Learning Philosophy

Cognify follows a structured learning cycle:

```
Concept → Practice → Analysis → Reinforcement
     ↑                                    │
     └────────────────────────────────────┘
```

### The Learning Loop

1. **Learn concepts** — Study topics through the syllabus library
2. **Practice topic tests** — Take chapter-wise tests to build familiarity
3. **Take full mocks** — Simulate real exam conditions
4. **Analyze mistakes** — Review wrong answers, identify patterns
5. **Receive AI tutor guidance** — Cogni explains mistakes and reinforces weak areas

### Mistake Analysis is the Most Important Feature

The system must help students identify:

- **Weak chapters** — Topics with consistently low accuracy
- **Time management issues** — Questions taking too long or being rushed
- **Accuracy problems** — Careless mistakes vs. conceptual gaps

Every test result should answer: *"What went wrong, and how do I fix it?"*

---

## 3 — Exam Simulation Philosophy

Cognify aims to make mock tests **feel identical to the real exam**.

### Key Simulation Features

| Feature | Purpose |
|---------|---------|
| **Real exam timer** | Countdown matching actual exam duration |
| **Subject sectioning** | Physics / Chemistry / Math / Biology sections |
| **Negative marking** | Deduction for wrong answers (configurable per exam) |
| **PYQ-based tests** | Previous Year Questions with year and shift data |
| **Adaptive difficulty** | AI adjusts question difficulty based on performance |
| **Question types** | Single correct, multi correct, integer, numerical |

### Design Principle

A student taking a Cognify mock test should not be able to tell the difference between the platform and the real exam interface. The test-taking UI must be distraction-free, focused, and exam-like.

---

## 4 — Test Types in Cognify

### Chapter Tests
- **Scope**: Single chapter
- **Purpose**: Build topic-level mastery
- **Example**: "Kinematics — 20 questions, 30 minutes"

### Subject Tests
- **Scope**: Multiple chapters within one subject
- **Purpose**: Build subject-level endurance
- **Example**: "Physics — 30 questions, 60 minutes"

### Full Mocks
- **Scope**: Complete exam simulation (all subjects)
- **Purpose**: Simulate real exam conditions
- **Example**: "JEE Main Full Mock — 90 questions, 180 minutes"

### Adaptive Tests
- **Scope**: AI-selected questions based on student weaknesses
- **Purpose**: Target weak areas efficiently
- **Example**: "AI identifies low accuracy in Thermodynamics → generates focused test"

---

## 5 — Syllabus Philosophy

### Hierarchy

```
Exam → Subject → Unit → Chapter → Concept
```

This maps directly to the database:

| Level | Table |
|-------|-------|
| Exam | `syllabus_exams` |
| Subject | `syllabus_subjects` |
| Unit | `syllabus_units` |
| Chapter | `syllabus_chapters` |
| Concept | `syllabus_concepts` |

### Rules

1. **All syllabus content comes from the database** — never hardcode chapters, subjects, or topics
2. Each chapter has a `class_level` (`'11'`, `'12'`, `'Both'`) for filtering
3. Each chapter has a `weightage` for importance ranking
4. Concepts have `difficulty_level` (1–5) for progressive learning
5. The hierarchy is consistent across all exams

### Seeded Exams

- **JEE Main / BITSAT**: Physics (7 units), Chemistry (3 units), Mathematics (4 units)
- **NEET**: Physics (7 units), Chemistry (3 units), Botany (1 unit), Zoology (1 unit)

---

## 6 — Performance Tracking Philosophy

### Metrics Tracked

| Metric | What It Measures |
|--------|-----------------|
| **Accuracy** | Percentage of correct answers |
| **Speed** | Time per question, time per section |
| **Consistency** | Performance stability across tests |
| **Streaks** | Daily study habit tracking |
| **Subject strength** | Per-subject accuracy over time |
| **Chapter mastery** | Per-chapter performance progression |

### The Core Question

All analytics must help the student answer:

> **"What should I study next?"**

Analytics should not just show numbers — they should provide **actionable recommendations**:
- "Your Thermodynamics accuracy dropped 15% this week"
- "You spend 2x longer on Organic Chemistry questions than average"
- "Focus on Electromagnetic Induction — 3 weak topics identified"

---

## 7 — Cogni AI Tutor Philosophy

**Cogni** is Cognify's AI tutor — a conversational assistant that teaches through dialogue.

### Teaching Style: Socratic Method

Cogni should **ask guiding questions** instead of giving answers immediately.

| ❌ Bad (Direct Answer) | ✅ Good (Socratic) |
|------------------------|-------------------|
| "The answer is A because F=ma" | "What force equation relates mass and acceleration? Can you apply it here?" |
| "Surface tension has dimensions [MT⁻²]" | "What is the formula for surface tension? What are the dimensions of force and length?" |

### Cogni's Responsibilities

1. **Explain concepts** — Break down topics into understandable steps
2. **Analyze mistakes** — Review wrong answers and explain why the student's approach failed
3. **Guide step-by-step** — Walk through problem-solving methodology
4. **Ask before telling** — Prompt the student to think before revealing answers

### Technical Architecture

- API: Groq API (primary LLM) + Google/Gemini API (secondary)
- All API calls go through server-side Next.js route handlers
- Responses rendered with `react-markdown` + `react-syntax-highlighter`
- Personalization uses data from `tests` and `test_attempt_questions` tables

---

## 8 — User Types

### Students

| Type | Description |
|------|-------------|
| **Class 11** | Beginning preparation, focus on foundational concepts |
| **Class 12** | Final year preparation, focus on revision and mocks |
| **Dropper** | Re-attempting exams, focus on weak areas and full mocks |

Students can:
- Take practice tests and full mocks
- View performance analytics
- Use the AI tutor
- Join study squads
- Participate in challenges

### Teachers

Teachers can:
- Create tests (`type: 'assigned'`)
- Assign tests to students
- View student results and analysis

### Admins

Admins can:
- Manage platform data
- View system-wide analytics
- Manage user accounts

---

## 9 — UX Design Principles

### Core Principles

| Principle | Implementation |
|-----------|---------------|
| **Minimal** | Clean layouts, no visual clutter, purposeful whitespace |
| **Fast** | Optimized loading, instant navigation, no unnecessary animations |
| **Distraction-free** | Test-taking mode hides all navigation; focus on content |
| **Dark-mode friendly** | Full dark mode support using CSS custom property tokens |

### Design Philosophy

Students come to Cognify to **learn and practice**, not to navigate complex UI. Every screen should have a clear purpose and a single primary action.

- Test pages: focus on questions and timer
- Analytics pages: focus on insights and recommendations
- Library pages: focus on content hierarchy and navigation
- Dashboard: focus on progress and next actions

---

## 10 — AI Design Rules

### AI Must Never

| ❌ Never | ✅ Instead |
|---------|-----------|
| Invent exams | Use exams from `syllabus_exams` / `exams` tables |
| Invent syllabus chapters | Use chapters from `syllabus_chapters` / `chapters` tables |
| Invent database tables | Use only tables defined in `db/schema.sql` |
| Hardcode question data | Query from `questions` table |
| Create mock data for production | Use Supabase queries |
| Assume student performance | Query from `tests` and `test_attempt_questions` |

### AI Must Always

1. Reference `db/schema.sql` before writing any database query
2. Use the existing syllabus hierarchy from the database
3. Follow the module structure defined in `AI_SKILLS.md` and `MODULE_RULES.md`
4. Respect the exam-specific configurations (marks, duration, negative marking)
5. Use real data for any student-facing feature

---

*Last updated: 2026-03-08 | Cognify Product Context Document*
