<div align="center">

<img src="https://img.shields.io/badge/Next.js-16-black?style=for-the-badge&logo=nextdotjs&logoColor=white" />
<img src="https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black" />
<img src="https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript&logoColor=white" />
<img src="https://img.shields.io/badge/Supabase-PostgreSQL-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white" />
<img src="https://img.shields.io/badge/TailwindCSS-4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white" />

<br/><br/>

# 🧠 Cognify

### *AI-Powered Competitive Exam Preparation Platform*

> Built for JEE Main · JEE Advanced · NEET · BITSAT

**Cognify** is a production-grade, full-stack AI edtech platform designed for Indian students preparing for competitive engineering and medical entrance exams. It combines real exam simulation, deep performance analytics, adaptive testing, and a Socratic AI tutor — all in a blazing-fast, dark-mode-first Next.js app.

<br/>

[![Live Demo](https://img.shields.io/badge/🚀_Live_Demo-Visit_Platform-blue?style=for-the-badge)](https://cognify.vercel.app)
[![Stars](https://img.shields.io/github/stars/IND-Captain/Cognify?style=for-the-badge&color=yellow)](https://github.com/IND-Captain/Cognify/stargazers)
[![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)](./LICENSE)

</div>

---

## ✨ What is Cognify?

Most students grind through textbooks and random YouTube playlists before exams. Cognify changes that. It gives every student a **personalized preparation engine** — one that knows their weak chapters, tracks their time habits, simulates the real exam, and has an AI tutor ready to explain every mistake using the Socratic method.

The platform's philosophy:

```
Concept → Practice → Analysis → Reinforcement → Concept (repeat)
```

Every feature is built around answering one student question: **"What should I study next?"**

---

## 🎯 Target Exams & Users

| Exam | Category | Subjects |
|------|----------|----------|
| **JEE Main** | Engineering | Physics, Chemistry, Mathematics |
| **JEE Advanced** | Engineering | Physics, Chemistry, Mathematics |
| **NEET** | Medical | Physics, Chemistry, Botany, Zoology |
| **BITSAT** | Engineering | Physics, Chemistry, Mathematics |

**Who is this for?**
- 🏫 **Class 11 students** — beginning their preparation journey
- 📚 **Class 12 students** — in their final, high-stakes preparation year
- 🔁 **Droppers** — re-attempting competitive exams with focused strategy

---

## 🔥 Core Features

### 🧪 Smart Test Engine
- **Chapter Tests** — Single-chapter, focused practice
- **Subject Tests** — Multi-chapter endurance builds
- **Full Mock Tests** — Real exam simulation (JEE: 90Q/3hrs, NEET: 180Q/3hrs)
- **Adaptive Tests** — AI-selected questions targeting your weakest topics
- **PYQ Mode** — Previous year questions with year/shift metadata
- **Negative Marking** — Configurable per exam (JEE: -1, NEET: -1)
- **Multiple Question Types** — Single correct, multi-correct, integer, numerical

### 📊 Deep Performance Analytics
- Accuracy per chapter, subject, and exam
- Time-per-question and time-management heatmaps
- Streak tracking with daily study habit monitoring
- Consistency and percentile scoring
- AI-generated actionable recommendations ("Your Thermodynamics accuracy dropped 15% this week")

### 🤖 Cogni — The AI Tutor
- Conversational AI that explains mistakes after every test
- **Socratic Method**: Guides with questions, doesn't just give answers
- Powered by **Groq API** (primary) + **Google Gemini API** (fallback)
- Renders LaTeX, code, and markdown via `react-markdown` + `react-syntax-highlighter`
- Personalized based on your actual test performance data

### 📖 Syllabus Library
- Complete hierarchical syllabus: `Exam → Subject → Unit → Chapter → Concept`
- Chapter weightage and class-level tagging (Class 11 / 12 / Both)
- Concept difficulty levels (1–5)
- JEE Main, JEE Advanced, NEET, and BITSAT fully seeded

### 🏟️ Arena (Social & Competitive)
- **Study Squads** — Create or join study groups with invite codes
- **Global Challenges** — Weekly and daily leaderboard challenges
- **Squad Challenges** — Custom challenges within your study group
- **Percentile Rankings** — Know exactly where you stand

### 👩‍🏫 Teacher & Admin Panels
- Teachers can create and assign tests to students with due dates
- Students see assigned tests on their dashboard
- Admin panel for platform-wide analytics and user management

### 🧭 Dashboard & Experience
- Live Study Session Timer with focus mode floater
- Weekly streak tracker with fire animation
- Animated timeline of recent study sessions
- Responsive layout for mobile and desktop study flows
- Consistent navigation and action placement across student workflows

---

## 🗺️ Product Surface Map (Pages, Scope, and Build Plan)

Use this section as your planning board while building. It maps what already exists and what should be improved next.

| Area | Route(s) | What the page currently has | Build / improve next |
|------|----------|-----------------------------|----------------------|
| **Landing + Marketing** | `/`, `/about`, `/features`, `/pricing`, `/contact`, `/blog`, `/careers`, `/courses`, `/lectures`, `/practice-tests`, `/practice-quizzes`, `/partners` | Marketing and product-discovery surface already scaffolded | Tighten conversion flow (hero → trust proof → CTA) and standardize content hierarchy across marketing pages |
| **Auth** | `/auth`, `/auth/login`, `/auth/signup` | Entry points for sign-in and sign-up | Add better onboarding branching (student vs teacher), post-signup exam/class setup |
| **Student Dashboard** | `/dashboard` | Live study session timer, assigned tests, streak + stats, rich hero cards | Add goal planner widget, today plan queue, and stronger empty states |
| **Test Hub** | `/tests` | Test OS dashboard with snapshot cards, smart queue, category matrix | Connect all cards to real data and personalize recommendations from analytics |
| **Test Creation** | `/tests/create` | Multi-step wizard (exam, subject/chapter, difficulty, timing, mode, PYQ filters) | Add presets (JEE Sprint, NEET Revision), validation hints, and saved templates |
| **Test Execution + Analysis** | `/tests/[testId]`, `/tests/[testId]/analysis`, `/tests/results`, `/tests/history`, `/tests/analytics`, `/tests/active`, `/tests/mocks` | Attempt flow + post-test views are present with history and analytics pages | Standardize data hierarchy and ensure every page uses the same performance vocabulary |
| **Syllabus Library** | `/library`, `/library/[examId]/[subjectId]`, `/library/[examId]/[subjectId]/[chapterId]` | Exam tabs, subject cards, syllabus search, chapter drill-down routes | Add bookmarks/recently viewed + progress sync from test mistakes |
| **AI Tutor (Cogni)** | `/cogni` | Full chat workspace with animated avatar states, session context, hints/mastery signals | Add conversation memory timeline, solved-problem notebook, and one-click "create test from this chat" |
| **Notes Converter** | `/notes-converter` (and `/notes` redirects here) | 3-panel pipeline: ingest notes/PDF → review text → generate flashcards/quiz/summary | Add output export packs (PDF/Anki/CSV), source chunk traceability, and quality scoring |
| **Settings** | `/settings` | Advanced grouped settings: profile, security, privacy, notifications, billing, learning prefs, AI prefs, targets, data, connected services | Add profile completeness meter, audit trail, and clearer danger-zone actions |
| **Arena + Competition** | `/arena`, `/leaderboard` | Leaderboard, streaks, squads, weekly challenges, social competition widgets | Add live challenge states, rewards economy, and anti-cheat/verification UX |
| **Teacher Workspace** | `/teacher`, `/teacher/tests`, `/teacher/questions`, `/teacher/batches`, `/teacher/analytics`, `/teacher/upload` | Operational dashboard with stats, question distribution, batches, recent tests/imports | Add assignment templates, batch-level insights, and moderation tools |
| **Alternate Teacher Routes** | `/teachers`, `/teachers/dashboard`, `/teachers/question-bank`, `/teachers/question-import` | Additional teacher-facing routes exist | Decide whether to merge into `/teacher/*` or keep both with clear role separation |
| **Admin Surface** | `/admin`, `/admin/config`, `/admin/system-health` | `/admin` currently redirects to `/teacher` for admin/teacher users | Decide final admin IA (separate command center vs teacher-extended mode) |
| **Policy / Compliance** | `/privacy-policy`, `/terms-of-service`, `/cookie-policy`, `/data-protection`, `/compliance` | Legal/compliance pages present | Add consistent legal layout and update cadence/version metadata |

### Quick Status Notes

- `Notes` page is intentionally redirected to notes converter until a dedicated notes experience is built.
- `Admin` page currently acts as role-based redirect, not a separate admin dashboard UI.
- `Settings` already has a broad section map; this is one of the most complete feature surfaces.

---

## 📋 Page-by-Page MVP Scope

This scope is intentionally design-agnostic. It defines what each page must do for an MVP release.

| Route | MVP Objective | Must-have functionality | Data/API dependency | MVP done when |
|-------|---------------|-------------------------|---------------------|---------------|
| `/` | Convert visitors into signed-in users | Exam-focused value proposition, clear CTAs, feature preview, trust proof | Static + marketing content | User can understand product and reach auth in one click |
| `/auth/login`, `/auth/signup` | Reliable access and account creation | Email auth, validation, error handling, role-aware redirect | Supabase Auth | User can sign up/login and land on correct workspace |
| `/dashboard` | Daily command center for students | Study session start/stop, assigned tests panel, streak/status summary, quick actions | `study_sessions`, `streaks`, assigned tests APIs | Student can start a session and continue study flow from one screen |
| `/tests` | Entry point to test workflows | Test categories, recommendation queue, navigation to create/history/results | Test summary APIs | Student can choose and launch the next test path in < 2 clicks |
| `/tests/create` | Configure tests safely | Exam/subject/chapter selection, difficulty/time/question count, validation, create action | `/api/tests/exams`, `/api/tests/subjects`, `/api/tests/chapters`, create APIs | User can create a valid test config with no broken states |
| `/tests/[testId]` | Complete an attempt | Question navigation, answer save, timer, submit/finish flow | Attempt and answer APIs | User can finish a full test attempt and persist answers |
| `/tests/[testId]/analysis` | Learn from mistakes | Accuracy by topic, mistakes list, suggested next actions | Analysis API + attempt data | User can identify weak topics and next recommended action |
| `/tests/results`, `/tests/history` | View past performance | Search/filter attempts, score/accuracy/time summary, drill into analysis | `/api/tests/history` | User can find any attempt and open analysis quickly |
| `/tests/analytics` | Monitor long-term performance | Trends, subject split, weak-topic highlights, recommendations | `/api/analytics` | User can see trend direction and priority weak areas |
| `/library` and nested routes | Navigate syllabus hierarchy | Exam switch, subject/chapter drill-down, syllabus search | Library service APIs | User can browse from exam to chapter without dead ends |
| `/cogni` | Get AI tutoring on demand | Chat input/output, session context, hint flow, fallback/error handling | Cogni AI endpoints | User can ask, receive help, and continue learning loop |
| `/notes-converter` | Convert notes into study assets | Text/PDF ingest, review editable extraction, generate flashcards/quiz/summary, output cache | Notes ingestion + generation APIs | User can generate at least one output type from notes |
| `/settings` | Manage account and learning preferences | Profile/security/privacy/notifications/targets/AI preferences, save feedback | Settings context + profile APIs | User can update settings and confirm persistence |
| `/arena` | Enable social motivation | Leaderboard preview, streak status, squad management, challenge card | Social/challenge tables + APIs | User can join/create squad and see competition context |
| `/leaderboard` | Rank visibility | Global ranking list, current user rank context, loading/empty states | `profiles`/ranking query | User can find own rank and compare with top users |
| `/teacher` + `/teacher/*` | Teacher operations workspace | Batch creation, question operations, test assignment, teacher analytics, uploads | Teacher service + ingestion logs + tests data | Teacher can create batch and manage tests/questions end-to-end |
| `/admin/config`, `/admin/system-health` | System controls and observability | Config management and health monitoring screens | Admin APIs/system checks | Admin can verify system status and update settings |
| Policy pages | Compliance visibility | Privacy/terms/cookies/data-protection/compliance content | Static docs/content | Legal pages are accessible and versioned |

### MVP Build Sequence

1. Auth + Dashboard + Test create/attempt/submit.
2. Results/history/analysis + library integration.
3. Cogni + notes converter.
4. Arena/leaderboard.
5. Teacher workflows.
6. Admin and policy hardening.

---

## 🧩 Component-Level Requirements Per Page

These are functional components, not visual prescriptions.

### Shared components required on every app page

- Route guard or role gate where needed.
- Data state handler: loading, empty, error, success.
- Primary action block (single clear next action).
- Notification/toast integration for async actions.
- Telemetry hook point (page viewed, primary action clicked).

### `/dashboard`

- `DashboardHeader` (user context + day summary).
- `StudySessionController` (start/stop, elapsed time, resume).
- `AssignedTestsPanel` (list + open action).
- `ProgressSnapshot` (streak, completion counters).
- `QuickActionsPanel` (start test, open library, open Cogni).

### `/tests`

- `TestsHubHeader`.
- `PerformanceSnapshotCards`.
- `SmartRecommendationQueue`.
- `TestCategoryGrid`.
- `RecentAttemptMiniList`.

### `/tests/create`

- `TestConfigStepper`.
- `ExamSelector`.
- `SubjectChapterSelector`.
- `DifficultyAndRulesPanel`.
- `TimeQuestionControls`.
- `ConfigValidationSummary`.
- `CreateTestActionBar`.

### `/tests/[testId]`

- `AttemptHeader` (timer + progress).
- `QuestionNavigator`.
- `QuestionRenderer`.
- `AnswerInputControl`.
- `SaveAndSubmitControls`.
- `AttemptRecoveryHandler` (reload/persist safeguards).

### `/tests/[testId]/analysis`

- `ResultSummaryCard`.
- `TopicBreakdownTable`.
- `MistakeReviewList`.
- `TimeAnalysisPanel`.
- `NextActionRecommendations`.

### `/tests/results` and `/tests/history`

- `AttemptFilters` (type/subject/date/search).
- `AttemptList` or `AttemptCards`.
- `AttemptSummaryStats`.
- `OpenAnalysisAction`.

### `/tests/analytics`

- `TrendChartContainer`.
- `SubjectPerformancePanel`.
- `WeakTopicPanel`.
- `TimeDistributionPanel`.
- `RecommendationInsightsPanel`.

### `/library` and nested routes

- `ExamSwitcher`.
- `SyllabusSearchBar`.
- `SubjectGrid`.
- `ChapterListPanel`.
- `ConceptListPanel`.
- `BreadcrumbPath`.

### `/cogni`

- `TutorSessionHeader`.
- `ConversationThread`.
- `PromptComposer`.
- `HintAndSocraticActions`.
- `SessionStatePanel` (mastery/hints/time context).
- `ConversationPersistenceHooks`.

### `/notes-converter`

- `InputSourcePanel` (paste/upload).
- `ExtractionReviewEditor`.
- `ConverterToolSelector`.
- `GenerationStatePanel`.
- `OutputRenderer` (flashcards/quiz/summary).
- `OutputExportActions`.

### `/settings`

- `SettingsSectionNav`.
- `ProfileSectionForm`.
- `SecuritySectionForm`.
- `PreferencesSectionForm`.
- `TargetsAndLearningSection`.
- `DataTransparencySection`.
- `SaveStatusIndicator`.

### `/arena`

- `ArenaHeader`.
- `StreakStatusCard`.
- `LeaderboardPreview`.
- `SquadManagementPanel`.
- `ChallengeCard`.
- `ParticipationActions`.

### `/leaderboard`

- `LeaderboardHeader`.
- `CurrentUserRankCard`.
- `RankedUserList`.
- `RankFilters` (optional for MVP if only global).

### `/teacher` and `/teacher/*`

- `TeacherWorkspaceHeader`.
- `TeacherStatsStrip`.
- `BatchManagementPanel`.
- `QuestionBankPanel`.
- `TestAssignmentPanel`.
- `TeacherAnalyticsPanel`.
- `UploadAndIngestionPanel`.

### `/admin/config` and `/admin/system-health`

- `AdminConfigForm`.
- `FeatureTogglePanel`.
- `HealthChecksPanel`.
- `SystemEventsPanel`.

### Policy pages

- `PolicyDocumentLayout`.
- `LastUpdatedMetadata`.
- `SectionAnchorNavigation`.

---

## ✅ Structure-First Planning Checklist

- [ ] Confirm final route ownership between `/teacher/*` and `/teachers/*`.
- [ ] Confirm whether `/admin` remains redirect-only or becomes a true dashboard.
- [ ] Finalize page-level MVP acceptance criteria with engineering + product.
- [ ] Add missing functional components listed above as tracked tasks.
- [ ] Create test coverage for create-attempt-submit-analyze critical path.

---

## 🏗️ Architecture Overview

```
┌──────────────────────────────────────────────────────────────┐
│                       FRONTEND LAYER                         │
│               Next.js App Router  (src/app/)                 │
│     Pages · Layouts · Route Groups · Client Components       │
├──────────────────────────────────────────────────────────────┤
│                      COMPONENT LAYER                         │
│       React 19 · shadcn/ui · Radix UI · Lucide Icons         │
│       src/components/ (54 ui primitives + domain components) │
├──────────────────────────────────────────────────────────────┤
│                       STATE LAYER                            │
│    Zustand (streak · theme · UI)  ·  React Context (Auth)    │
│              TanStack React Query (server state)             │
├──────────────────────────────────────────────────────────────┤
│                      SERVICE LAYER                           │
│     src/lib/ (test-service · study-service · teacher-service)│
│              src/utils/supabase/ (client · server)           │
├──────────────────────────────────────────────────────────────┤
│                        API LAYER                             │
│    Next.js Route Handlers  ·  src/app/api/                   │
│  tests(12) · cogni(2) · ai(3) · social(6) · admin(4) · ...  │
├──────────────────────────────────────────────────────────────┤
│                      DATABASE LAYER                          │
│       Supabase PostgreSQL · RLS on all 22 tables             │
│               uuid-ossp · pgcrypto extensions                │
├──────────────────────────────────────────────────────────────┤
│                        AI LAYER                              │
│            Groq API (LLM) · Google Gemini API                │
└──────────────────────────────────────────────────────────────┘
```

### Test Engine Data Flow

```
Student selects exam/chapter/difficulty
        ↓
POST /api/tests/create    → creates row in `tests`
        ↓
POST /api/tests/generate  → queries `questions` table
        ↓
Questions loaded          → `test_attempt_questions` rows created
        ↓
Student answers           → answers upserted per question
        ↓
POST /api/tests/track-completion → test marked 'completed'
        ↓
Results + AI analysis rendered ← Cogni + test data
```

---

## 🗂️ Project Structure

```
Cognify-Uttej/
├── src/
│   ├── app/                    # Next.js App Router — all pages & API routes
│   │   ├── layout.tsx          # Global root layout (singleton)
│   │   ├── globals.css         # Global app styles and shared UI tokens
│   │   ├── dashboard/          # Student dashboard + study session tracker
│   │   ├── tests/              # Test engine (create, active, results, history)
│   │   ├── library/            # Syllabus browser
│   │   ├── cogni/              # AI Tutor interface
│   │   ├── arena/              # Squads & competitive challenges
│   │   ├── leaderboard/        # Global rankings
│   │   ├── settings/           # Profile & preferences
│   │   ├── teacher/            # Teacher panel
│   │   ├── admin/              # Admin panel
│   │   └── api/                # 40+ API route handlers
│   │       ├── tests/          # 12 test engine endpoints
│   │       ├── cogni/          # AI tutor endpoints
│   │       ├── ai/             # AI generation endpoints
│   │       ├── social/         # Social & squad endpoints
│   │       ├── analytics/      # Performance analytics
│   │       ├── adaptive/       # Adaptive test logic
│   │       └── admin/          # Admin operations
│   │
│   ├── components/             # Shared UI components
│   │   ├── ui/                 # 54 shadcn/ui primitives
│   │   ├── cognify/            # App-specific (Navbar, Footer, BottomNav, Sidebar)
│   │   ├── settings/           # 31 settings section components
│   │   ├── social/             # Social feature components
│   │   ├── Motion/             # Framer Motion wrappers (PageAnimate)
│   │   └── landing/            # Landing page sections
│   │
│   ├── lib/                    # Services, stores & utilities
│   │   ├── test-service.ts     # Full test engine service layer
│   │   ├── study-service.ts    # Study session + dashboard stats
│   │   ├── teacher-service.ts  # Teacher assignment logic
│   │   ├── store.ts            # Zustand: streak store
│   │   ├── theme-store.ts      # Zustand: dark/light theme
│   │   └── ui-store.ts         # Zustand: sidebar state
│   │
│   ├── contexts/
│   │   └── AuthContext.tsx     # Auth state (user · login · logout · updateProfile)
│   │
│   └── hooks/                  # Custom React hooks
│
├── db/
│   └── schema.sql              # Master database schema (1046 lines · 22 tables)
│
├── scripts/                    # Question ingestion scripts (PDF & JSON)
├── docs/                       # Extended documentation
└── ARCHITECTURE.md             # Full architecture reference
```

---

## 🗄️ Database Schema (22 Tables)

| Group | Tables |
|-------|--------|
| **Core** | `profiles`, `study_sessions`, `streaks`, `notes`, `leaderboard`, `uploads` |
| **Tests** | `exams`, `subjects`, `chapters`, `topics`, `questions`, `tests`, `test_attempt_questions` |
| **Social** | `squads`, `squad_members`, `challenges`, `challenge_participants` |
| **Syllabus** | `syllabus_exams`, `syllabus_subjects`, `syllabus_units`, `syllabus_chapters`, `syllabus_concepts` |

- **Row Level Security** enabled on all 22 tables  
- **Auto-triggers**: `handle_new_user()` auto-creates `profiles` + `streaks` on signup  
- **Extensions**: `uuid-ossp`, `pgcrypto`

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|------------|
| **Framework** | Next.js 16 (App Router) |
| **Language** | TypeScript 5 |
| **UI Library** | React 19 |
| **Styling** | TailwindCSS v4 + CSS custom properties |
| **Components** | shadcn/ui + Radix UI primitives |
| **Animations** | Framer Motion 12 |
| **State** | Zustand 5 + TanStack React Query v5 |
| **Auth** | Supabase Auth + next-auth |
| **Database** | Supabase (PostgreSQL) |
| **AI / LLM** | Groq API + Google Gemini API |
| **Forms** | React Hook Form + Zod v4 |
| **Charts** | Recharts |
| **Icons** | Lucide React |
| **Fonts** | Geist Sans + Geist Mono |
| **Package Manager** | Bun |
| **Deployment** | Docker + Caddy reverse proxy |

---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) 20+ or [Bun](https://bun.sh/) 1.3+
- A [Supabase](https://supabase.com/) project
- API keys for [Groq](https://console.groq.com/) and optionally [Google AI](https://aistudio.google.com/)

### 1. Clone the repo

```bash
git clone https://github.com/IND-Captain/Cognify.git
cd Cognify
```

### 2. Install dependencies

```bash
bun install
# or
npm install
```

### 3. Configure environment variables

Copy the example env file and fill in your credentials:

```bash
cp .env.example .env.local
```

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# AI APIs
GROQ_API_KEY=your_groq_api_key
GOOGLE_API_KEY=your_google_api_key
GEMINI_API_KEY=your_gemini_api_key

# Auth
NEXTAUTH_SECRET=your_nextauth_secret
NEXTAUTH_URL=http://localhost:3000
```

### 4. Set up the database

Run the master schema against your Supabase project:

```bash
# In your Supabase SQL editor or psql:
psql -h your-db-host -U postgres -d postgres -f db/schema.sql
```

### 5. Run the development server

```bash
bun run dev
# or
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) 🎉

### 6. Ingest Questions (Optional)

Cognify supports bulk question import from PDF or JSON:

```bash
# Ingest from JSON
npm run ingest:json

# Ingest from PDF (via question extraction)
npm run ingest:pdf
```

---

## 🐳 Docker Deployment

```bash
# Build and run with Docker
docker build -t cognify .
docker run -p 3000:3000 --env-file .env cognify
```

A `Caddyfile` is included for production HTTPS reverse proxy setup.

---

## 🧱 Interface Standards (Design-Agnostic)

Use these implementation constraints while exploring multiple visual themes.

- Keep route structure and component responsibilities stable across design variants.
- Use a consistent state model on each page: loading, empty, success, error.
- Keep primary actions in predictable locations on every route.
- Avoid coupling business logic to visual components.
- Ensure mobile and desktop interactions follow the same user flow.
- Keep analytics event names stable even if UI changes.
- Define API contracts first, then renderers.

---

## 🔐 Authentication & Roles

| Role | Capabilities |
|------|-------------|
| **Student** | Take tests · View analytics · Use Cogni · Join squads · Participate in challenges |
| **Teacher** | Create & assign tests to students · View student results |
| **Admin** | Full platform access · Manage users · View system analytics |

Auth is handled via **Supabase Auth** with automatic profile + streak creation on signup via PostgreSQL triggers.

---

## 📦 Key Scripts

| Script | Description |
|--------|-------------|
| `bun run dev` | Start development server on port 3000 |
| `bun run build` | Build production bundle + standalone output |
| `bun run start` | Run production server via standalone build |
| `bun run lint` | Run ESLint |
| `npm run ingest:pdf` | Ingest questions from PDF files |
| `npm run ingest:json` | Ingest questions from JSON files |

---

## 🤝 Contributing

Contributions are welcome! Before contributing:

1. Read [`ARCHITECTURE.md`](./ARCHITECTURE.md) — understand the module structure
2. Read [`PROJECT_CONTEXT.md`](./PROJECT_CONTEXT.md) — understand the product philosophy
3. Read [`DATABASE_GUIDE.md`](./DATABASE_GUIDE.md) — never invent tables or columns
4. Check [`MODULE_RULES.md`](./MODULE_RULES.md) — follow the coding rules per module

### Development Rules

- ✅ Use `next/navigation` — never `react-router-dom`
- ✅ Use `@/` import alias throughout
- ✅ Add `'use client'` directive to all client components
- ✅ Support both dark and light modes in every UI element
- ✅ Use Supabase RLS — never bypass row-level security
- ❌ Never hardcode syllabus chapters or exam data
- ❌ Never create new root layouts, Navbars, or ThemeProviders

---

## 📄 License

This project is licensed under the **MIT License** — see the [LICENSE](./LICENSE) file for details.

---

<div align="center">

Made with ❤️ for every student chasing their dream rank.

**Cognify** — *Sharpen your mind. Conquer the exam.*

</div>
