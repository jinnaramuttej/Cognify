CRITICAL AI RULE:

Before performing ANY code generation, refactor, or file creation
the AI must read and follow this entire document.

If the instructions conflict with generated code,
the instructions in this file take priority.

# 🧠 AI_SKILLS.md — Cognify AI Knowledge System

> **⚠️ MANDATORY: Every AI agent modifying this repository MUST read this file before generating any code.**
>
> This document is the single source of truth for the Cognify codebase.
> Before writing, editing, or generating ANY code, the AI must verify its understanding against this file.
> Violations of these rules — duplicate layouts, fake database tables, broken imports — are **unacceptable**.

---

## TABLE OF CONTENTS

1. [Project Overview](#1--project-overview)
2. [Detected Tech Stack](#2--detected-tech-stack)
3. [Project Architecture](#3--project-architecture)
4. [Database Model](#4--database-model)
5. [Module Rules](#5--module-rules)
6. [UI System](#6--ui-system)
7. [Test Engine Rules](#7--test-engine-rules)
8. [Library Module Rules](#8--library-module-rules)
9. [Cogni AI Tutor Rules](#9--cogni-ai-tutor-rules)
10. [AI Generation Rules](#10--ai-generation-rules)

---

## 1 — PROJECT OVERVIEW

**Cognify** is an AI-powered learning platform designed for competitive exam preparation in India.

### Core Goals

| Goal | Description |
|------|-------------|
| **AI Tutor (Cogni)** | Conversational AI tutor for concept explanation, mistake analysis, and personalized guidance |
| **Adaptive Test Engine** | Practice tests, full mock exams, chapter-wise tests, PYQ filtering, difficulty filters |
| **Structured Syllabus Library** | Hierarchical content: Exam → Subject → Unit → Chapter, dynamically loaded from database |
| **Performance Analytics** | Progress tracking, streak system, XP, leaderboard rankings |
| **Social & Competitive** | Study squads, weekly challenges, squad challenges, leaderboards |
| **Settings & Profile** | Full user profile management, preferences, privacy, notifications |

### Supported Exams

| Exam | Category | Total Marks | Duration |
|------|----------|-------------|----------|
| JEE Main | Engineering | 300 | 180 min |
| JEE Advanced | Engineering | 360 | 180 min |
| NEET | Medical | 720 | 200 min |
| BITSAT | Engineering | 390 | 180 min |

### Subjects per Exam

- **JEE Main / JEE Advanced / BITSAT**: Physics, Chemistry, Mathematics
- **NEET**: Physics, Chemistry, Botany, Zoology

---

## 2 — DETECTED TECH STACK

> All items below are verified from `package.json`, config files, and source code.

### Frontend Framework

| Technology | Version | Purpose |
|-----------|---------|---------|
| **Next.js** | ^16.1.1 | App Router (not Pages Router) — `src/app/` directory |
| **React** | ^19.0.0 | UI library |
| **TypeScript** | ^5 | Type safety |

### Styling

| Technology | Version | Purpose |
|-----------|---------|---------|
| **TailwindCSS** | ^4 | Utility-first CSS (v4 with `@theme` directive) |
| **tw-animate-css** | ^1.3.5 | Animation utilities |
| **tailwind-merge** | ^3.3.1 | Class merging |
| **class-variance-authority** | ^0.7.1 | Variant-based styling (shadcn) |

### UI Component Library

| Technology | Version | Purpose |
|-----------|---------|---------|
| **Radix UI** (full suite) | Various | Headless UI primitives (accordion, dialog, dropdown, tabs, toast, tooltip, etc.) |
| **shadcn/ui** | — | Component layer on top of Radix (see `components.json`) |
| **Lucide React** | ^0.525.0 | Icon system |
| **Framer Motion** | ^12.34.4 | Animations and page transitions |
| **Recharts** | ^2.15.4 | Data visualization / charts |
| **cmdk** | ^1.1.1 | Command palette |
| **Sonner** | ^2.0.6 | Toast notifications |
| **Embla Carousel** | ^8.6.0 | Carousels |
| **React Day Picker** | ^9.8.0 | Date picker |
| **@dnd-kit** | Various | Drag and drop |

### Backend / Database

| Technology | Version | Purpose |
|-----------|---------|---------|
| **Supabase** (`@supabase/supabase-js`) | ^2.94.0 | BaaS — PostgreSQL, Auth, RLS |
| **Supabase Auth Helpers** (`@supabase/auth-helpers-nextjs`) | ^0.9.0 | Server-side auth integration |
| **NextAuth** (`next-auth`) | ^4.24.11 | Authentication (configured alongside Supabase Auth) |
| **PostgreSQL** | (via Supabase) | Database with Row Level Security |
| **bcryptjs** | ^3.0.3 | Password hashing |

### AI Services

| Technology | Purpose |
|-----------|---------|
| **Groq API** | LLM inference (env: `GROQ_API_KEY`) |
| **Google/Gemini API** | AI services (env: `GOOGLE_API_KEY`, `GEMINI_API_KEY`) |

### State Management

| Technology | Version | Purpose |
|-----------|---------|---------|
| **Zustand** | ^5.0.10 | Global state (streak, theme, UI) |
| **React Context** | (built-in) | Auth state (`AuthContext`) |
| **TanStack React Query** | ^5.82.0 | Server state / data fetching |

### Form Handling & Validation

| Technology | Version | Purpose |
|-----------|---------|---------|
| **React Hook Form** | ^7.60.0 | Form management |
| **Zod** | ^4.0.2 | Schema validation |
| **@hookform/resolvers** | ^5.1.1 | Zod resolver bridge |

### Additional Libraries

| Library | Purpose |
|---------|---------|
| `react-markdown` | Markdown rendering (for AI tutor responses) |
| `react-syntax-highlighter` | Code syntax highlighting |
| `react-resizable-panels` | Resizable panel layouts |
| `next-themes` | Theme switching (dark/light) |
| `next-intl` (^4.3.4) | Internationalization |
| `date-fns` (^4.1.0) | Date formatting |
| `uuid` (^11.1.0) | UUID generation |
| `sharp` (^0.34.3) | Image optimization |
| `vaul` (^1.1.2) | Drawer component |
| `@headlessui/react` (^2.2.9) | Headless UI primitives (additional to Radix) |
| `@tanstack/react-table` (^8.21.3) | Data table management |
| `input-otp` (^1.4.2) | OTP input component |
| `clsx` (^2.1.1) | Conditional class utility (used by `cn()`) |
| `zustand-persist` (^0.4.0) | Zustand persistence middleware |
| `tailwindcss-animate` (^1.0.7) | TailwindCSS animation plugin |

### Build & Config

| Config | Value |
|--------|-------|
| `output` | `"standalone"` |
| `reactStrictMode` | `false` |
| `typescript.ignoreBuildErrors` | `true` |
| Path alias | `@/*` → `./src/*` |
| Fonts | Geist Sans, Geist Mono (Google Fonts) |

---

## 3 — PROJECT ARCHITECTURE

### Root Structure

```
Cognify-Uttej/
├── src/                    # All source code
│   ├── app/                # Next.js App Router (pages & API routes)
│   ├── components/         # Reusable UI components
│   ├── contexts/           # React Context providers
│   ├── hooks/              # Custom React hooks
│   ├── lib/                # Utilities, services, stores
│   ├── modules/            # Feature modules (tests)
│   └── utils/              # Utility helpers (supabase)
├── db/                     # Database schema (single source of truth)
│   └── schema.sql          # MASTER SQL SCHEMA (1046 lines)
├── public/                 # Static assets
├── mini-services/          # Microservices (empty — .gitkeep only)
├── scripts/                # Build/deploy scripts
└── [config files]          # package.json, tsconfig.json, next.config.ts, etc.
```

### App Router Structure (`src/app/`)

```
src/app/
├── layout.tsx              # ⚠️ GLOBAL LAYOUT — DO NOT DUPLICATE
├── page.tsx                # Landing page (/)
├── globals.css             # ⚠️ GLOBAL STYLES — DO NOT DUPLICATE
├── error.tsx               # Global error boundary
├── not-found.tsx           # 404 page
│
├── dashboard/              # Student dashboard
│   ├── layout.tsx          # Dashboard layout
│   ├── page.tsx            # Main dashboard view
│   └── components/         # Dashboard-specific components (if any)
│
├── tests/                  # Test engine module
│   ├── layout.tsx          # Tests-specific layout (suppresses global nav)
│   ├── page.tsx            # Tests landing/list page
│   ├── create/             # Test creation flow
│   ├── active/             # Active test-taking session
│   ├── [testId]/           # Dynamic test route
│   ├── results/            # Test results display
│   ├── history/            # Test history
│   ├── analytics/          # Test analytics
│   ├── components/         # Tests-specific components
│   ├── hooks/              # Tests-specific hooks
│   ├── mocks/              # Mock data for testing
│   ├── db/                 # Tests DB utilities
│   ├── mini-services/      # Tests microservice stubs
│   ├── examples/           # Example implementations
│   ├── download/           # Download functionality
│   ├── upload/             # Upload functionality (currently empty)
│   └── public/             # Tests-specific public assets
│
├── library/                # Syllabus library
│   ├── page.tsx            # Library main page
│   └── components/         # Library-specific components
│
├── cogni/                  # AI tutor (currently empty route dir)
│
├── settings/               # User settings
│   ├── page.tsx            # Settings page
│   └── components/         # Settings sections
│
├── auth/                   # Authentication
│   ├── page.tsx            # Auth landing/redirect
│   ├── login/              # Login page
│   └── signup/             # Signup page
│
├── leaderboard/            # Global leaderboard
├── arena/                  # Competitive arena
├── admin/                  # Admin panel
├── recommendations/        # Personalized recommendations
├── progress-analytics/     # Progress analytics
├── lectures/               # Lecture content
├── courses/                # Course catalog
├── practice-quizzes/       # Practice quizzes
├── teachers/               # Teacher portal
│
├── api/                    # API Routes (Next.js Route Handlers)
│   ├── route.ts            # Root API route
│   ├── tests/              # Tests API (12 sub-routes)
│   │   ├── [testId]/       # Single test operations
│   │   ├── create/         # Test creation
│   │   ├── generate/       # Test generation
│   │   ├── smart-generate/ # AI-powered test generation
│   │   ├── adaptive/       # Adaptive testing
│   │   ├── attempts/       # Test attempts
│   │   ├── chapters/       # Chapter data
│   │   ├── subjects/       # Subject data
│   │   ├── items/          # Question items
│   │   ├── history/        # Test history
│   │   ├── performance/    # Performance data
│   │   └── track-completion/ # Completion tracking
│   ├── ai/                 # AI endpoints (3 routes)
│   ├── cogni/              # Cogni AI tutor API (2 routes)
│   ├── social/             # Social features API (6 routes)
│   ├── squads/             # Squads API (2 routes)
│   ├── admin/              # Admin API (4 routes)
│   ├── teacher/            # Teacher API (4 routes)
│   ├── auth/               # Auth API (2 routes)
│   ├── user/               # User API (2 routes)
│   ├── analytics/          # Analytics API
│   ├── adaptive/           # Adaptive learning API
│   ├── item-bank/          # Question bank API (2 routes)
│   └── notebooklm/         # NotebookLM integration
│
└── [static pages]          # about, blog, careers, contact, pricing,
                            # features, partners, compliance,
                            # privacy-policy, terms-of-service,
                            # cookie-policy, data-protection
```

### Components Structure (`src/components/`)

```
src/components/
├── Navbar.tsx              # ⚠️ MAIN NAVBAR — DO NOT DUPLICATE (263 lines)
├── NavbarWrapper.tsx        # Smart wrapper — hides navbar on /tests routes
├── ProtectedRoute.tsx       # Auth guard component
│
├── cognify/                # Core app components
│   ├── BottomNav.tsx        # ⚠️ MOBILE BOTTOM NAV — DO NOT DUPLICATE
│   ├── Header.tsx           # Page header component
│   ├── Footer.tsx           # ⚠️ MAIN FOOTER — DO NOT DUPLICATE
│   ├── Sidebar.tsx          # Dashboard sidebar
│   ├── Hero.tsx             # Landing page hero
│   ├── Features.tsx         # Features showcase
│   ├── Pricing.tsx          # Pricing section
│   ├── Testimonials.tsx     # Testimonials
│   ├── CTA.tsx              # Call to action
│   ├── CardNav.tsx          # Card navigation component
│   ├── CardNav.css          # CardNav styles
│   ├── StudyTracker.tsx     # Study session tracker
│   ├── DemoModeBanner.tsx   # Demo mode indicator
│   ├── DemoModeButton.tsx   # Demo mode toggle
│   ├── NavigationExample.tsx # Navigation reference
│   ├── CognifyExternalPageWrapper.tsx # External page wrapper
│   ├── store.ts             # Cognify-specific store
│   ├── theme-store.ts       # Theme store
│   ├── ui-store.ts          # UI state store
│   ├── utils.ts             # Utilities
│   └── modals/              # Modal components (5 files)
│
├── ui/                     # shadcn/ui primitives (54 files)
│   ├── button.tsx, card.tsx, dialog.tsx, dropdown-menu.tsx,
│   │   input.tsx, label.tsx, select.tsx, tabs.tsx, toast.tsx,
│   │   tooltip.tsx, sheet.tsx, badge.tsx, avatar.tsx, etc.
│   └── [all Radix-based UI primitives]
│
├── settings/               # Settings components (31 files)
│   ├── SettingsLayout.tsx   # Settings page layout
│   ├── DangerZone.tsx       # Account danger zone
│   ├── Tabs.tsx             # Settings tabs
│   ├── sections/            # Settings sections (10 files)
│   ├── tabs/                # Settings tab content (7 files)
│   └── advanced/            # Advanced settings (11 files)
│
├── social/                 # Social features (6 files)
│   ├── AnimatedLeaderboard.tsx
│   ├── SquadManagement.tsx
│   ├── WeeklyChallengeCard.tsx
│   ├── RankBadge.tsx
│   ├── StreakCounter.tsx
│   └── MicroCelebration.tsx
│
├── landing/                # Landing page sections (5 files)
│   ├── Hero.tsx, FeatureGrid.tsx, FinalCTA.tsx,
│   │   Roadmap.tsx, TrustSection.tsx
│
├── auth/                   # Auth components (2 files)
├── admin/                  # Admin components (1 file)
├── common/                 # Shared components (1 file)
├── tests/                  # Tests-specific components
├── providers/              # Context providers
│   ├── ThemeProvider.tsx    # Theme context provider
│   └── utils.ts            # Provider utilities
│
└── Motion/                 # Animation wrappers
    ├── PageAnimate.tsx      # Page transition animation
    └── [other animation components]
```

### State & Services (`src/lib/`, `src/contexts/`, `src/hooks/`)

```
src/lib/
├── supabase.ts             # Supabase client initialization (browser)
├── supabaseClient.ts       # Supabase client (alias)
├── supabaseServer.ts       # Supabase server-side client
├── test-service.ts         # Test engine service layer (9,697 bytes)
├── study-service.ts        # Study session service
├── store.ts                # Zustand app store (streak)
├── theme-store.ts          # Zustand theme store (dark/light mode)
├── ui-store.ts             # Zustand UI store (sidebar state)
└── utils.ts                # cn() utility (clsx + tailwind-merge)

src/contexts/
└── AuthContext.tsx          # Auth state (user, login, logout, updateProfile)
                             # Uses localStorage for persistence

src/hooks/
├── store.ts                # Store hook
├── theme-store.ts          # Theme store hook
├── ui-store.ts             # UI store hook
├── use-mobile.ts           # Mobile detection hook
├── use-toast.ts            # Toast hook (shadcn)
├── useBypassAuth.ts        # Auth bypass for development
└── utils.ts                # Hook utilities
```

---

## 4 — DATABASE MODEL

> **Source of truth**: `db/schema.sql` (1046 lines)
> This file contains all tables, indexes, RLS policies, triggers, functions, and seed data.

### Table Overview

| # | Table | Module | Primary Key | Description |
|---|-------|--------|-------------|-------------|
| 1 | `profiles` | Core | `id` (uuid → auth.users) | User profiles, XP, streaks, preferences |
| 2 | `study_sessions` | Core | `id` (uuid) | Study session tracking |
| 3 | `streaks` | Core | `user_id` (uuid → auth.users) | Study streaks (auto-created on signup) |
| 4 | `notes` | Core | `id` (uuid) | User notes |
| 5 | `leaderboard` | Core | `id` (uuid) | Rankings |
| 6 | `uploads` | Core | `id` (uuid) | File uploads |
| 7 | `exams` | Tests | `id` (uuid) | Competitive exams (JEE, NEET, BITSAT) |
| 8 | `subjects` | Tests | `id` (uuid) | Subjects per exam (Physics, Chemistry, etc.) |
| 9 | `chapters` | Tests | `id` (uuid) | Chapters per subject |
| 10 | `topics` | Tests | `id` (uuid) | Topics per chapter |
| 11 | `questions` | Tests | `id` (uuid) | Question bank (single/multi correct, integer, numerical) |
| 12 | `tests` | Tests | `id` (uuid) | Test sessions (practice/assigned) |
| 13 | `test_attempt_questions` | Tests | `id` (uuid) | Individual question attempts per test |
| 14 | `squads` | Social | `id` (uuid) | Study groups |
| 15 | `squad_members` | Social | `(squad_id, user_id)` | Squad membership |
| 16 | `challenges` | Social | `id` (uuid) | Weekly/daily/squad challenges |
| 17 | `challenge_participants` | Social | `id` (uuid) | Challenge participation & scores |
| 18 | `syllabus_exams` | Library | `id` (uuid) | Syllabus exam catalog |
| 19 | `syllabus_subjects` | Library | `id` (uuid) | Syllabus subjects |
| 20 | `syllabus_units` | Library | `id` (uuid) | Syllabus units |
| 21 | `syllabus_chapters` | Library | `id` (uuid) | Syllabus chapters (with class_level & weightage) |
| 22 | `syllabus_concepts` | Library | `id` (uuid) | Syllabus concepts (with difficulty_level 1-5) |

### Relationship Map

```
auth.users
  └── profiles (1:1)
  └── study_sessions (1:N)
  └── streaks (1:1)
  └── notes (1:N)
  └── tests (1:N, user_id)
  └── tests (1:N, created_by — teacher)
  └── squad_members (M:N via join)
  └── challenge_participants (M:N via join)

exams (1:N) → subjects (1:N) → chapters (1:N) → topics (1:N) → questions
                                                                   ↓
tests (1:N) → test_attempt_questions ← questions

squads (1:N) → squad_members ← auth.users
squads (1:N) → challenges (1:N) → challenge_participants ← auth.users

syllabus_exams (1:N) → syllabus_subjects (1:N) → syllabus_units (1:N) → syllabus_chapters (1:N) → syllabus_concepts
```

### Module → Table Mapping

| Module | Tables Used |
|--------|------------|
| **Dashboard** | `profiles`, `streaks`, `study_sessions`, `tests` |
| **Tests** | `exams`, `subjects`, `chapters`, `topics`, `questions`, `tests`, `test_attempt_questions` |
| **Library** | `syllabus_exams`, `syllabus_subjects`, `syllabus_units`, `syllabus_chapters`, `syllabus_concepts` |
| **Social/Arena** | `squads`, `squad_members`, `challenges`, `challenge_participants` |
| **Leaderboard** | `leaderboard`, `challenge_participants` |
| **Settings** | `profiles` |
| **Auth** | `auth.users`, `profiles`, `streaks` |

### Key Constraints

- **Questions table**: `question_type` must be one of: `'single_correct'`, `'multi_correct'`, `'integer'`, `'numerical'`
- **Questions table**: `difficulty` must be one of: `'Easy'`, `'Medium'`, `'Hard'`
- **Tests table**: `type` must be one of: `'practice'`, `'assigned'`
- **Tests table**: `status` must be one of: `'in_progress'`, `'completed'`
- **Challenges table**: `type` must be one of: `'weekly_global'`, `'squad_custom'`, `'daily'`
- **Squad members**: `role` must be one of: `'admin'`, `'member'`
- **Syllabus chapters**: `class_level` must be one of: `'11'`, `'12'`, `'Both'`

### Automation (Triggers & Functions)

| Function | Purpose |
|----------|---------|
| `handle_new_user()` | Trigger on `auth.users` INSERT — creates `profiles` and `streaks` rows |
| `update_streak()` | Manages daily streak logic (increment, reset, maintain) |
| `calculate_percentiles_for_challenge()` | Calculates percentile rankings for challenge leaderboards |

### Row Level Security

All 22 tables have RLS enabled. Key policies:

- **profiles**: Users can only view/update their own
- **tests**: Users can manage their own tests (by `user_id` or `created_by`)
- **test_attempt_questions**: Access tied to parent test ownership
- **exams/subjects/chapters/topics/questions**: Public read access
- **squads**: Only visible to members
- **challenges**: Global challenges public; squad challenges restricted to members
- **syllabus_***: All public read access

---

## 5 — MODULE RULES

### Absolute Rules (NEVER Violate)

1. **All new pages MUST be created inside `src/app/`** using Next.js App Router conventions
2. **NEVER use `react-router-dom`** — always use `next/navigation` and `next/link`
3. **NO duplicate `layout.tsx` files** except where architecturally required (e.g., `/tests/layout.tsx` exists intentionally to suppress global nav during test-taking)
4. **Use the EXISTING global layout** at `src/app/layout.tsx` — do NOT create a new root layout
5. **Use Supabase for ALL data operations** — never use mock data in production code (mocks only in `/tests/mocks/` for development)
6. **NO standalone React apps** — everything must be within the Next.js App Router
7. **Import path alias**: Always use `@/` prefix for imports (maps to `./src/*`)
8. **Client components MUST have `'use client'`** directive at the top of the file
9. **NEVER create a second Navbar, Footer, or BottomNav** — these exist as singletons in the global layout

### Component Creation Rules

- New shared components go in `src/components/[feature-area]/`
- New UI primitives go in `src/components/ui/`
- Page-specific components go in `src/app/[page]/components/`
- Use Radix UI + shadcn/ui patterns for new UI primitives
- Use Lucide icons — do NOT introduce a second icon library

### API Route Rules

- API routes live in `src/app/api/[domain]/route.ts`
- Follow the existing pattern: export named functions (`GET`, `POST`, `PUT`, `DELETE`)
- Use Supabase server client (`supabaseServer.ts`) for server-side data access
- Validate inputs with Zod schemas

### State Management Rules

- **Global app state**: Use Zustand stores in `src/lib/`
- **Auth state**: Use the existing `AuthContext` from `src/contexts/AuthContext.tsx`
- **Server state**: Use TanStack React Query for data fetching and caching
- **Theme state**: Use the existing `theme-store.ts` — do NOT create new theme logic
- **UI state**: Use the existing `ui-store.ts` for sidebar/UI toggles

---

## 6 — UI SYSTEM

### Theme System

Cognify uses a **CSS custom property-based** theme system defined in `src/app/globals.css`.

**Primary Color**: Blue (`hsl(221.2, 83.2%, 53.3%)` light / `hsl(217.2, 91.2%, 59.8%)` dark)

| Token | Light Mode | Dark Mode |
|-------|-----------|-----------|
| `--background` | `hsl(210 40% 98%)` | `hsl(222.2 84% 4.9%)` |
| `--foreground` | `hsl(222.2 84% 4.9%)` | `hsl(210 40% 98%)` |
| `--primary` | `hsl(221.2 83.2% 53.3%)` | `hsl(217.2 91.2% 59.8%)` |
| `--card` | `hsl(210 40% 99%)` | `hsl(222.2 84% 4.9%)` |
| `--muted` | `hsl(210 40% 92%)` | `hsl(217.2 32.6% 12%)` |
| `--destructive` | `hsl(0 84.2% 60.2%)` | `hsl(0 62.8% 30.6%)` |
| `--border` | `hsl(214.3 31.8% 91.4%)` | `hsl(217.2 32.6% 17.5%)` |

### Theme Switching

- Managed by `next-themes` + `ThemeProvider` at `src/components/providers/ThemeProvider.tsx`
- Zustand `theme-store.ts` exposes `mode` and `toggleTheme()`
- Toggle button in Navbar (Sun/Moon icons)
- Dark mode class: `.dark` on `<html>` element

### Typography

- **Primary font**: Geist Sans (`--font-geist-sans`)
- **Monospace**: Geist Mono (`--font-geist-mono`)
- Responsive font sizes using `clamp()` for h1, h2, h3, body

### Animation System

| Utility Class | Effect |
|--------------|--------|
| `.animate-fadeInUp` | Fade + slide up on mount |
| `.animate-float` | Floating animation (8s loop) |
| `.smooth-hover` | 180ms ease transitions on hover |
| `.hover-lift` | `translateY(-3px) scale(1.01)` on hover |
| `.hover-shadow` | Soft box-shadow on hover |
| `.blob-btn` | Moving gradient blob effect |
| `.neon-edge` | Subtle blue glow border |
| `.blue-glow` | Blue box-shadow glow |

- **Framer Motion** is used for page transitions in `PageAnimate.tsx` and throughout components
- Mobile animations use `--anim-duration-mobile: 200ms` vs desktop `400ms`

### Scrollbar

Custom webkit scrollbar: primary color thumb, background track.

### Style Rules

1. **Always use TailwindCSS** utility classes
2. **Always reference CSS custom properties** via `var(--token)` or Tailwind's `bg-background`, `text-foreground`, etc.
3. **Never use hardcoded colors** — use the theme tokens
4. **Ensure dark mode compatibility** — test both modes
5. **Use `cn()` helper** from `@/lib/utils` for conditional class merging
6. **Glassmorphism**: Use `bg-background/95 backdrop-blur-sm` pattern (as seen in Navbar)
7. **Blue accents**: `blue-500/10`, `blue-500/20` for hover/active states
8. **Border pattern**: `border-blue-500/20` for subtle borders

---

## 7 — TEST ENGINE RULES

### Architecture

The Tests module is a **self-contained sub-app** within `/src/app/tests/` with its own:
- Layout (`tests/layout.tsx`) — intentionally hides the global Navbar during test-taking
- Components (`tests/components/`)
- Hooks (`tests/hooks/`)
- Mock data (`tests/mocks/`)
- Service layer (`src/lib/test-service.ts`)

### Test Types

| Type | Description |
|------|-------------|
| `practice` | Student-generated practice tests |
| `assigned` | Teacher-assigned tests |

### Test Flow

1. **Create** (`/tests/create`) → Student selects exam, subject, chapter, difficulty, question count
2. **Active** (`/tests/active`) → Test-taking interface with timer and question navigation
3. **Results** (`/tests/results/[testId]`) → Score breakdown, correct/incorrect analysis
4. **History** (`/tests/history`) → List of past tests
5. **Analytics** (`/tests/analytics`) → Performance trends

### Question Features

- **Types**: single_correct, multi_correct, integer, numerical
- **Difficulty**: Easy, Medium, Hard
- **PYQ Support**: `is_pyq` flag, `year`, `shift` fields
- **Marking**: Configurable positive marks and negative marking
- **Options format**: JSON array `[{label: "A", text: "..."}, ...]`

### Database Tables Used

```
exams → subjects → chapters → topics → questions
                                          ↓
tests → test_attempt_questions ← questions
```

### API Endpoints

| Endpoint | Purpose |
|----------|---------|
| `POST /api/tests/create` | Create a new test |
| `POST /api/tests/generate` | Generate questions for a test |
| `POST /api/tests/smart-generate` | AI-powered question selection |
| `GET /api/tests/[testId]` | Fetch test details |
| `GET /api/tests/history` | Fetch test history |
| `GET /api/tests/subjects` | List subjects |
| `GET /api/tests/chapters` | List chapters for a subject |
| `GET /api/tests/performance` | Performance analytics |
| `POST /api/tests/track-completion` | Mark test as complete |
| `GET /api/tests/attempts` | Fetch attempts |
| `GET /api/tests/items` | Fetch question items |
| `POST /api/tests/adaptive` | Adaptive test generation |

### Rules

1. **Questions MUST come from the `questions` table** — never generate fake question data
2. **Test sessions MUST be persisted** in the `tests` table
3. **Each question attempt** must be recorded in `test_attempt_questions`
4. **Timer is mandatory** — `duration_minutes` field
5. **Negative marking** is configurable per test/exam
6. The tests layout **intentionally suppresses** the global navbar — the `NavbarWrapper` checks for `/tests` paths

---

## 8 — LIBRARY MODULE RULES

### Navigation Hierarchy

```
Exam → Subject → Unit → Chapter → Concepts
```

This hierarchy maps exactly to the syllabus database tables:

```
syllabus_exams → syllabus_subjects → syllabus_units → syllabus_chapters → syllabus_concepts
```

### Rules

1. Content MUST load dynamically from the `syllabus_*` tables via Supabase
2. **Never hardcode syllabus data** in the frontend
3. Navigation must follow the exact hierarchy: Exam → Subject → Unit → Chapter
4. The library page lives at `/library` with components in `/library/components/`
5. Seeded exams: JEE Main, JEE Advanced, NEET, BITSAT
6. Each chapter has a `class_level` field (`'11'`, `'12'`, `'Both'`)
7. Each chapter has a `weightage` field for importance ranking
8. Concepts have `difficulty_level` (1-5) for progressive learning

### Seeded Syllabus Structure

**JEE Main, BITSAT**: Physics (7 units), Chemistry (3 units), Mathematics (4 units)
**NEET**: Physics (7 units), Chemistry (3 units), Botany (1 unit), Zoology (1 unit)

---

## 9 — COGNI AI TUTOR RULES

### Current State

The Cogni AI tutor has:
- A route directory at `/src/app/cogni/` (currently **empty** — TO VERIFY if page exists)
- API routes at `/src/app/api/cogni/` (2 sub-routes)
- AI service endpoints at `/src/app/api/ai/` (3 sub-routes)

### Planned Features

| Feature | Description |
|---------|-------------|
| **Conversational Tutoring** | Chat-based interaction with LLM |
| **Question Explanation** | Step-by-step breakdown of test questions |
| **Mistake Analysis** | Analyze wrong answers and identify weak areas |
| **Concept Reinforcement** | Recommend topics based on performance gaps |

### AI Backend

- **Groq API** for LLM inference (fast, low-latency)
- **Google/Gemini API** for additional AI capabilities
- Responses should be rendered using `react-markdown` + `react-syntax-highlighter`

### Rules

1. The AI tutor MUST use the user's performance data (from `tests`, `test_attempt_questions`) to personalize guidance
2. API calls to LLMs go through Next.js API routes (server-side) — never call AI APIs from the client
3. Use streaming responses for chat interactions when possible
4. Render AI responses with proper markdown formatting
5. Store conversation context server-side if persistence is needed

---

## 10 — AI GENERATION RULES

### Pre-Generation Checklist

Before writing ANY code, the AI MUST:

- [ ] Read this `AI_SKILLS.md` file
- [ ] Verify the target file/module exists in the project architecture
- [ ] Verify database tables referenced exist in `db/schema.sql`
- [ ] Verify imported components/libraries exist in `package.json` or the codebase
- [ ] Ensure no duplication of existing modules or components
- [ ] Ensure compatibility with the theme system (light + dark mode)
- [ ] Use `@/` import alias (not relative paths for cross-module imports)

### AI MUST NEVER Generate

| ❌ Never Do This | ✅ Do This Instead |
|-----------------|-------------------|
| Fake database tables | Use existing tables from `db/schema.sql` |
| Duplicate `layout.tsx` at root | Use existing `src/app/layout.tsx` |
| Second Navbar component | Use existing `src/components/Navbar.tsx` |
| Second Footer component | Use existing `src/components/cognify/Footer.tsx` |
| Second BottomNav | Use existing `src/components/cognify/BottomNav.tsx` |
| Hardcoded colors | Use CSS custom property tokens |
| `react-router-dom` imports | Use `next/navigation` and `next/link` |
| New icon library | Use `lucide-react` |
| New CSS framework | Use TailwindCSS v4 |
| Module in wrong directory | Follow `src/app/` for pages, `src/components/` for components |
| Standalone React app | Everything must be within the Next.js App Router |
| Mock data in production | Use Supabase queries |

### Import Rules

```typescript
// ✅ CORRECT
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { cn } from '@/lib/utils';

// ❌ WRONG
import { Button } from '../../../components/ui/button';  // No relative paths
import { Route } from 'react-router-dom';                // Wrong router
import axios from 'axios';                                // Not installed
```

### File Naming Conventions

- Pages: `page.tsx` (Next.js App Router convention)
- Layouts: `layout.tsx`
- API routes: `route.ts`
- Components: `PascalCase.tsx` (e.g., `SettingsLayout.tsx`)
- Hooks: `camelCase.ts` (e.g., `use-mobile.ts`)
- Stores: `kebab-case.ts` (e.g., `theme-store.ts`)
- Utilities: `camelCase.ts`

---

## ITEMS TO VERIFY

> The following items could not be 100% confirmed during analysis and should be verified:

| Item | Status | Notes |
|------|--------|-------|
| `/src/app/cogni/page.tsx` | ✅ CONFIRMED EMPTY | Directory exists, no `page.tsx` inside — route is not yet implemented |
| NotebookLM integration | ⚠️ TO VERIFY | API route exists at `/api/notebooklm/` but implementation status unknown |
| Adaptive testing completeness | ⚠️ TO VERIFY | API route exists, frontend integration unclear |
| `mini-services/` usage | ✅ CONFIRMED | Root `mini-services/` has only `.gitkeep`; `tests/mini-services/` has 3 files |
| Supabase project status | ⚠️ TO VERIFY | Previous conversations indicate DNS/connectivity issues |
| `_standalone_library_backup/` | ✅ CONFIRMED BACKUP | 178-child directory in `src/` — legacy backup from Vite migration |
| `src/leaderboard/` | ✅ CONFIRMED EMPTY | Empty directory at `src/` root level (separate from `src/app/leaderboard/`) |

---

## HOW TO USE THIS FILE

### For AI Agents

1. **Read this file FIRST** before any code generation task
2. **Verify your plan** against the architecture and database sections
3. **Check for existing components** before creating new ones
4. **Follow the module rules** strictly
5. **Use the theme system** for all styling
6. **Test both light and dark modes**

### For Human Developers

1. **Update this file** when adding new modules, tables, or major components
2. **Reference this file** in PR reviews to catch architectural violations
3. **Keep `db/schema.sql` in sync** — it is the single source of truth for the database

---

*Last updated: 2026-03-08 | Generated from live codebase analysis*
