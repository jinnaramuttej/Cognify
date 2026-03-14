# Cognify Platform Architecture

> **⚠️ AI RULE**: Before modifying any code, read `AI_SKILLS.md` and this document.
> This file documents the real architecture. Do NOT invent structures that do not exist.

---

## 1 — System Overview

**Cognify** is a modular AI-powered learning platform for competitive exam preparation in India (JEE Main, JEE Advanced, NEET, BITSAT).

The platform is built as a **monolithic Next.js application** using the App Router pattern. It consists of independent feature modules (Dashboard, Tests, Library, Cogni AI Tutor, Arena, Settings) that share a common layout system, component library, and Supabase database backend.

---

## 2 — High-Level Architecture

```
┌──────────────────────────────────────────────────────────┐
│                    FRONTEND LAYER                        │
│              Next.js App Router (src/app/)                │
│    Pages, Layouts, Route Groups, Client Components       │
├──────────────────────────────────────────────────────────┤
│                   COMPONENT LAYER                        │
│         React 19 + shadcn/ui + Radix UI + Lucide         │
│       src/components/ (Navbar, Footer, ui/, cognify/)     │
├──────────────────────────────────────────────────────────┤
│                     STATE LAYER                          │
│    Zustand (src/lib/store, theme-store, ui-store)        │
│    React Context (AuthContext)                           │
│    TanStack React Query (server state)                   │
├──────────────────────────────────────────────────────────┤
│                   SERVICE LAYER                          │
│         src/lib/ (test-service, study-service)            │
│         src/utils/supabase/ (client, server)             │
├──────────────────────────────────────────────────────────┤
│                     API LAYER                            │
│        Next.js Route Handlers (src/app/api/)              │
│    tests/, cogni/, ai/, social/, admin/, teacher/         │
├──────────────────────────────────────────────────────────┤
│                   DATABASE LAYER                         │
│          Supabase PostgreSQL + Row Level Security         │
│              db/schema.sql (22 tables)                   │
├──────────────────────────────────────────────────────────┤
│                      AI LAYER                            │
│              Groq API (LLM inference)                    │
│           Google/Gemini API (AI services)                 │
└──────────────────────────────────────────────────────────┘
```

---

## 3 — Folder Architecture

```
Cognify-Uttej/
├── src/
│   ├── app/                # Next.js App Router — ALL pages and API routes
│   │   ├── layout.tsx      # GLOBAL ROOT LAYOUT (singleton)
│   │   ├── globals.css     # GLOBAL STYLES with theme tokens
│   │   ├── page.tsx        # Landing page (/)
│   │   ├── dashboard/      # Dashboard module
│   │   ├── tests/          # Tests module (has its own layout.tsx)
│   │   ├── library/        # Library module
│   │   ├── cogni/          # AI Tutor module (currently empty)
│   │   ├── settings/       # Settings module
│   │   ├── arena/          # Competitive arena
│   │   ├── leaderboard/    # Leaderboard page
│   │   ├── auth/           # Authentication pages
│   │   ├── api/            # API route handlers
│   │   └── [static pages]  # about, blog, pricing, etc.
│   │
│   ├── components/         # Shared UI components
│   │   ├── Navbar.tsx      # SINGLETON — global navigation bar
│   │   ├── NavbarWrapper.tsx   # Smart wrapper (hides nav on /tests)
│   │   ├── ProtectedRoute.tsx  # Auth guard
│   │   ├── ui/             # shadcn/ui primitives (54 files)
│   │   ├── cognify/        # Core app components (Footer, BottomNav, Sidebar, etc.)
│   │   ├── providers/      # ThemeProvider, utils
│   │   ├── settings/       # Settings section components
│   │   ├── social/         # Social feature components
│   │   ├── landing/        # Landing page sections
│   │   ├── Motion/         # Animation wrappers (PageAnimate)
│   │   ├── auth/           # Auth components
│   │   ├── admin/          # Admin components
│   │   ├── common/         # Shared utilities
│   │   └── tests/          # Tests-specific components
│   │
│   ├── lib/                # Services, stores, and utilities
│   │   ├── supabase.ts         # Supabase browser client
│   │   ├── supabaseClient.ts   # Supabase client (alias)
│   │   ├── supabaseServer.ts   # Supabase server client
│   │   ├── test-service.ts     # Test engine service layer
│   │   ├── study-service.ts    # Study session service
│   │   ├── store.ts            # Zustand app store (streak)
│   │   ├── theme-store.ts      # Zustand theme store
│   │   ├── ui-store.ts         # Zustand UI store
│   │   └── utils.ts            # cn() helper (clsx + tailwind-merge)
│   │
│   ├── hooks/              # Custom React hooks
│   │   ├── use-mobile.ts       # Mobile detection
│   │   ├── use-toast.ts        # Toast notifications
│   │   ├── useBypassAuth.ts    # Dev auth bypass
│   │   ├── store.ts, theme-store.ts, ui-store.ts  # Store hooks
│   │   └── utils.ts
│   │
│   ├── contexts/           # React Context providers
│   │   └── AuthContext.tsx  # Auth state (user, login, logout)
│   │
│   ├── modules/            # Feature modules
│   │   └── tests/          # Tests module logic (36 files)
│   │
│   └── utils/              # Additional utilities
│       └── supabase/       # Supabase helpers (client.ts, server.ts)
│
├── db/
│   └── schema.sql          # MASTER DATABASE SCHEMA (1046 lines, 22 tables)
│
├── public/                 # Static assets (images, icons)
├── scripts/                # Build/deploy scripts
├── mini-services/          # Microservices placeholder (.gitkeep only)
└── [config files]          # package.json, tsconfig.json, next.config.ts, etc.
```

### Adding a New Module

1. Create the page directory: `src/app/[module-name]/page.tsx`
2. Create module-specific components: `src/app/[module-name]/components/` or `src/components/[module-name]/`
3. Add API routes if needed: `src/app/api/[module-name]/route.ts`
4. Add service layer if needed: `src/lib/[module]-service.ts`
5. Use existing global layout — do **NOT** create a new root layout
6. Use existing Supabase clients — do **NOT** create new database connections

---

## 4 — Core Layout System

The layout system is defined in `src/app/layout.tsx` and **must never be duplicated**.

### Layout Components (Singletons)

| Component | Location | Purpose |
|-----------|----------|---------|
| `layout.tsx` | `src/app/layout.tsx` | Root layout — wraps entire app with ThemeProvider, AuthProvider, fonts |
| `NavbarWrapper` | `src/components/NavbarWrapper.tsx` | Conditionally renders Navbar (hidden on `/tests` routes) |
| `Navbar` | `src/components/Navbar.tsx` | Main navigation bar (263 lines) |
| `BottomNav` | `src/components/cognify/BottomNav.tsx` | Mobile bottom navigation |
| `Footer` | `src/components/cognify/Footer.tsx` | Global footer |
| `PageAnimate` | `src/components/Motion/PageAnimate.tsx` | Framer Motion page transition wrapper |
| `ThemeProvider` | `src/components/providers/ThemeProvider.tsx` | next-themes provider (dark/light mode) |
| `AuthContext` | `src/contexts/AuthContext.tsx` | Auth state provider (user, login, logout) |

### ⚠️ CRITICAL RULES

- **NEVER** create a second Navbar, Footer, or BottomNav
- **NEVER** create a second root layout
- **NEVER** create a second ThemeProvider
- The Tests module (`/tests`) has its **own** `layout.tsx` — this is **intentional** (it suppresses the global nav during test-taking)
- The Dashboard module (`/dashboard`) has its own `layout.tsx` — this is **intentional**

---

## 5 — Module Architecture

Each module follows a consistent pattern:

### Dashboard (`/dashboard`)
- Pages: `src/app/dashboard/page.tsx`
- Layout: `src/app/dashboard/layout.tsx`
- Uses: `profiles`, `streaks`, `study_sessions`, `tests` tables

### Tests (`/tests`)
- Pages: `src/app/tests/` (create, active, results, history, analytics)
- Layout: `src/app/tests/layout.tsx` (suppresses global nav)
- Components: `src/app/tests/components/`
- Hooks: `src/app/tests/hooks/`
- Mocks: `src/app/tests/mocks/`
- Service: `src/lib/test-service.ts`
- Uses: `exams`, `subjects`, `chapters`, `topics`, `questions`, `tests`, `test_attempt_questions` tables
- API: 12 endpoints under `/api/tests/`

### Library (`/library`)
- Pages: `src/app/library/page.tsx`
- Components: `src/app/library/components/`
- Uses: `syllabus_exams`, `syllabus_subjects`, `syllabus_units`, `syllabus_chapters`, `syllabus_concepts` tables

### Cogni AI Tutor (`/cogni`)
- Route: `src/app/cogni/` (currently empty — not yet implemented)
- API: `src/app/api/cogni/` (2 routes), `src/app/api/ai/` (3 routes)
- Uses: Groq API and Google/Gemini API for LLM inference

### Arena / Social (`/arena`)
- Pages: `src/app/arena/`
- Components: `src/components/social/`
- Uses: `squads`, `squad_members`, `challenges`, `challenge_participants` tables
- API: `src/app/api/social/` (6 routes), `src/app/api/squads/` (2 routes)

### Settings (`/settings`)
- Pages: `src/app/settings/page.tsx`
- Components: `src/components/settings/` (31 files)
- Uses: `profiles` table

### Requirements for All Modules

1. Use Next.js App Router pages (`page.tsx`)
2. Use Supabase for all data operations
3. Use shared components from `src/components/`
4. Use `@/` import alias
5. Ensure dark mode compatibility
6. Use theme tokens from `globals.css`

---

## 6 — Routing Rules

### Mandatory Rules

1. **Use Next.js App Router** — all routes are file-system based under `src/app/`
2. **NEVER use `react-router-dom`** — use `next/navigation` and `next/link` exclusively
3. Page files must be named `page.tsx`
4. Layout files must be named `layout.tsx`
5. API route files must be named `route.ts`
6. Dynamic routes use folder brackets: `[paramName]/page.tsx`
7. Client components must have `'use client'` directive

### Navigation Imports

```typescript
// ✅ CORRECT
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import Link from 'next/link';

// ❌ WRONG
import { Route, BrowserRouter } from 'react-router-dom';
```

---

## 7 — State Management

### Zustand (Global App State)

| Store | Location | Purpose |
|-------|----------|---------|
| `store.ts` | `src/lib/store.ts` | Streak data |
| `theme-store.ts` | `src/lib/theme-store.ts` | Dark/light mode toggle |
| `ui-store.ts` | `src/lib/ui-store.ts` | Sidebar state |

### React Context (Auth)

| Context | Location | Purpose |
|---------|----------|---------|
| `AuthContext` | `src/contexts/AuthContext.tsx` | User auth state, login, logout, updateProfile |

### TanStack React Query (Server State)

- Use for data fetching and caching
- Configured via `@tanstack/react-query` (v5.82.0)

### Rules

- Do NOT create new Zustand stores unless necessary — use existing ones
- Do NOT create new auth providers — use the existing `AuthContext`
- Do NOT create new theme logic — use the existing `theme-store.ts`

---

## 8 — Styling System

### TailwindCSS v4 with `@theme` Directive

The theme is defined in `src/app/globals.css` using CSS custom properties:

```css
:root {
  --primary: hsl(221.2 83.2% 53.3%);    /* Blue */
  --background: hsl(210 40% 98%);
  --foreground: hsl(222.2 84% 4.9%);
  --muted: hsl(210 40% 92%);
  --destructive: hsl(0 84.2% 60.2%);
  --border: hsl(214.3 31.8% 91.4%);
}

.dark {
  --primary: hsl(217.2 91.2% 59.8%);
  --background: hsl(222.2 84% 4.9%);
  --foreground: hsl(210 40% 98%);
}
```

### Style Rules

1. **Always use TailwindCSS** utility classes
2. **Use theme tokens** — `bg-background`, `text-foreground`, `text-primary`, etc.
3. **Never hardcode colors** — always reference CSS custom properties
4. **Use `cn()`** from `@/lib/utils` for conditional class merging
5. **Support both dark and light modes**
6. **Glassmorphism pattern**: `bg-background/95 backdrop-blur-sm`
7. **Blue accents**: `blue-500/10`, `blue-500/20` for hover states
8. Fonts: Geist Sans (primary), Geist Mono (code)

### Animation Utilities

| Class | Effect |
|-------|--------|
| `.animate-fadeInUp` | Fade + slide up |
| `.animate-float` | 8s floating loop |
| `.smooth-hover` | 180ms ease transitions |
| `.hover-lift` | translateY(-3px) on hover |
| `.hover-shadow` | Soft box-shadow on hover |
| `.blob-btn` | Moving gradient blob |
| `.neon-edge` | Blue glow border |
| `.blue-glow` | Blue box-shadow glow |

---

## 9 — API Architecture

### Route Handler Pattern

All API routes are under `src/app/api/` using Next.js Route Handlers:

```
src/app/api/
├── tests/          # 12 sub-routes (create, generate, smart-generate, etc.)
├── cogni/          # 2 routes (AI tutor endpoints)
├── ai/             # 3 routes (AI service endpoints)
├── social/         # 6 routes (friends, squads, feed, etc.)
├── squads/         # 2 routes (squad management)
├── admin/          # 4 routes (admin operations)
├── teacher/        # 4 routes (teacher operations)
├── auth/           # 2 routes (auth flows)
├── user/           # 2 routes (user data)
├── analytics/      # 1 route
├── adaptive/       # 1 route
├── item-bank/      # 2 routes (question bank)
└── notebooklm/     # 1 route (NotebookLM integration)
```

### Service Layer Pattern

API routes call service functions from `src/lib/`:

```
Client Component → fetch('/api/tests/create') → route.ts → test-service.ts → Supabase
```

- Use `supabaseServer.ts` for server-side data access in API routes
- Use `supabase.ts` or `supabaseClient.ts` for client-side data access
- Validate inputs with Zod schemas
- Export named HTTP methods: `GET`, `POST`, `PUT`, `DELETE`

---

## 10 — AI System Architecture

### Cogni AI Tutor

```
User Chat Input
    ↓
src/app/cogni/ (frontend — not yet implemented)
    ↓
POST /api/cogni/ or /api/ai/
    ↓
Server-side API Route Handler
    ↓
Groq API (primary) or Gemini API (secondary)
    ↓
Streaming response rendered with react-markdown
```

### AI API Keys (Environment)

| Variable | Service |
|----------|---------|
| `GROQ_API_KEY` | Groq LLM inference |
| `GOOGLE_API_KEY` | Google AI services |
| `GEMINI_API_KEY` | Gemini API |

### AI Rules

1. AI API calls go through **server-side** Next.js API routes — never from the client
2. Use streaming responses for chat interactions
3. Render responses with `react-markdown` + `react-syntax-highlighter`
4. Personalize guidance using the user's test performance data
5. Store conversation context server-side if persistence is needed

---

*Last updated: 2026-03-08 | Generated from live codebase analysis*
