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

### 🎨 Dashboard & UX
- Live Study Session Timer with focus mode floater
- Weekly streak tracker with fire animation
- Animated timeline of recent study sessions
- Responsive dark/light theme with Geist fonts
- Framer Motion page transitions and micro-animations throughout

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
│   │   ├── globals.css         # Design system tokens (TailwindCSS v4)
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

## 📐 Design System

Cognify uses **TailwindCSS v4** with a CSS custom property token system:

```css
/* Light mode */
:root {
  --primary:    hsl(221.2 83.2% 53.3%);   /* Cognify Blue */
  --background: hsl(210 40% 98%);
  --foreground: hsl(222.2 84% 4.9%);
}

/* Dark mode */
.dark {
  --primary:    hsl(217.2 91.2% 59.8%);
  --background: hsl(222.2 84% 4.9%);
  --foreground: hsl(210 40% 98%);
}
```

**Animation utilities available globally:**

| Class | Effect |
|-------|--------|
| `.animate-fadeInUp` | Fade + slide up entrance |
| `.animate-float` | 8s floating loop |
| `.smooth-hover` | 180ms ease transitions |
| `.hover-lift` | `translateY(-3px)` on hover |
| `.blue-glow` | Blue box-shadow neon glow |
| `.neon-edge` | Glowing border effect |

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
