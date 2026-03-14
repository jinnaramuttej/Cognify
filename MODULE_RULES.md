# Cognify Module Rules

> **⚠️ AI RULE**: Before creating or modifying any module, read `AI_SKILLS.md` and this file.
> These rules prevent architectural violations and ensure consistency.

---

## 1 — Module Definition

A **Cognify module** is a self-contained feature area with its own pages, components, and data layer. Each module lives under the Next.js App Router at `src/app/[module]/`.

### Existing Modules

| Module | Route | Page Dir | Status |
|--------|-------|----------|--------|
| **Dashboard** | `/dashboard` | `src/app/dashboard/` | Active |
| **Tests** | `/tests` | `src/app/tests/` | Active (sub-app with own layout) |
| **Library** | `/library` | `src/app/library/` | Active |
| **Cogni** | `/cogni` | `src/app/cogni/` | Route exists, page not implemented |
| **Settings** | `/settings` | `src/app/settings/` | Active |
| **Arena** | `/arena` | `src/app/arena/` | Active |
| **Leaderboard** | `/leaderboard` | `src/app/leaderboard/` | Active |
| **Admin** | `/admin` | `src/app/admin/` | Active |
| **Teachers** | `/teachers` | `src/app/teachers/` | Active |

---

## 2 — Module Folder Rules

### Pages

All page files **must** exist inside `src/app/[module]/`:

```
src/app/[module]/
├── page.tsx              # Main module page
├── layout.tsx            # ONLY if module needs custom layout (rare)
├── components/           # Module-specific components
├── [subpage]/            # Sub-routes
│   └── page.tsx
└── hooks/                # Module-specific hooks (if needed)
```

### Components

Module-specific components go in one of two places:

1. **Inline**: `src/app/[module]/components/` — for components used only within that module
2. **Shared**: `src/components/[module]/` — for components used across the app from that module's domain

### Service Layer

Module services go in `src/lib/[module]-service.ts`.

### API Routes

Module API routes go in `src/app/api/[module]/route.ts`.

---

## 3 — Tests Module Rules

The Tests module is the most complex module. It operates as a **self-contained sub-app**.

### Architecture

```
src/app/tests/
├── layout.tsx          # ⚠️ INTENTIONAL — suppresses global Navbar
├── page.tsx            # Tests landing page
├── create/page.tsx     # Test creation flow
├── active/page.tsx     # Active test-taking session
├── [testId]/page.tsx   # Dynamic test route
├── results/page.tsx    # Test results
├── history/page.tsx    # Test history
├── analytics/page.tsx  # Performance analytics
├── components/         # Tests-specific UI components
├── hooks/              # Tests-specific hooks
├── mocks/              # Mock data (development only)
├── db/                 # Tests DB utilities
├── mini-services/      # Tests microservice stubs
├── examples/           # Example implementations
├── download/           # Download functionality
├── upload/             # Upload (currently empty)
└── public/             # Tests-specific static assets
```

### Key Rules

1. `tests/layout.tsx` **intentionally** suppresses the global Navbar — the `NavbarWrapper` checks for `/tests` paths
2. The service layer is at `src/lib/test-service.ts`
3. Questions **must** come from the `questions` table — never generate fake data
4. Test sessions **must** be persisted in the `tests` table
5. Each question attempt **must** be recorded in `test_attempt_questions`
6. Timer is mandatory — tests have `duration_minutes`
7. Negative marking is configurable per test/exam

### Database Tables

`exams` → `subjects` → `chapters` → `topics` → `questions` → `test_attempt_questions` ← `tests`

---

## 4 — Library Module Rules

### Syllabus Hierarchy

```
Exam → Subject → Unit → Chapter → Concept
```

Maps to database tables:

```
syllabus_exams → syllabus_subjects → syllabus_units → syllabus_chapters → syllabus_concepts
```

### Key Rules

1. Content loads **dynamically** from `syllabus_*` tables via Supabase
2. **Never hardcode** syllabus data in the frontend
3. Navigation follows the exact hierarchy: Exam → Subject → Unit → Chapter
4. Page: `src/app/library/page.tsx`
5. Components: `src/app/library/components/`
6. Seeded exams: JEE Main, JEE Advanced, NEET, BITSAT
7. Each chapter has `class_level` (`'11'`, `'12'`, `'Both'`) and `weightage`
8. Concepts have `difficulty_level` (1–5)

---

## 5 — Cogni AI Tutor Rules

### Current State

- Route directory: `src/app/cogni/` — **currently empty** (page not implemented yet)
- API: `src/app/api/cogni/` (2 routes), `src/app/api/ai/` (3 routes)

### Architecture Rules

1. AI API calls go through **server-side** Next.js API routes — never from the client
2. Use Groq API (`GROQ_API_KEY`) for LLM inference
3. Use Google/Gemini API for secondary AI capabilities
4. Render responses with `react-markdown` + `react-syntax-highlighter`
5. Personalize using user's test performance data (`tests`, `test_attempt_questions`)
6. Use streaming responses for chat interactions

---

## 6 — UI Rules

### Technology

- **TailwindCSS v4** with `@theme` directive in `src/app/globals.css`
- **shadcn/ui** components in `src/components/ui/` (54 files)
- **Radix UI** headless primitives
- **Lucide React** icons

### Rules

1. **Use TailwindCSS** utility classes — never raw CSS for layout
2. **Use theme tokens** — `bg-background`, `text-foreground`, `text-primary`
3. **No hardcoded colors** — always use CSS custom properties
4. **Dark mode compatibility** — test both `.dark` and `:root` modes
5. Use **`cn()`** from `@/lib/utils` for conditional class merging
6. Use **Framer Motion** for animations via `PageAnimate`
7. Glassmorphism: `bg-background/95 backdrop-blur-sm`

---

## 7 — Component Rules

### Singletons — NEVER Duplicate

| Component | Location | Notes |
|-----------|----------|-------|
| **Navbar** | `src/components/Navbar.tsx` | Global nav (263 lines) |
| **NavbarWrapper** | `src/components/NavbarWrapper.tsx` | Hides nav on `/tests` |
| **Footer** | `src/components/cognify/Footer.tsx` | Global footer |
| **BottomNav** | `src/components/cognify/BottomNav.tsx` | Mobile bottom nav |
| **Root Layout** | `src/app/layout.tsx` | Global layout |
| **ThemeProvider** | `src/components/providers/ThemeProvider.tsx` | Theme context |

### Component Placement

| Type | Location |
|------|----------|
| New UI primitives | `src/components/ui/` |
| Shared feature components | `src/components/[feature]/` |
| Page-specific components | `src/app/[page]/components/` |
| New shared components | `src/components/[feature-area]/` |

### Component Patterns

- Use **Radix UI + shadcn/ui** patterns for new primitives
- Use **Lucide icons** — do NOT introduce another icon library
- All client components need `'use client'` at file top

---

## 8 — API Rules

### Route Handler Pattern

```
src/app/api/[domain]/route.ts
```

### Rules

1. Export named HTTP methods: `GET`, `POST`, `PUT`, `DELETE`
2. Use `supabaseServer.ts` for server-side data access
3. Validate inputs with **Zod** schemas
4. Return proper HTTP status codes
5. Handle errors gracefully with try/catch

### Example

```typescript
import { createServerClient } from '@/lib/supabaseServer';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const supabase = createServerClient();
  const { data, error } = await supabase.from('table_name').select('*');
  
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}
```

---

## 9 — Database Rules

### Absolute Rules

1. **Use Supabase** for ALL data operations
2. **Never invent tables** — use only tables in `db/schema.sql`
3. **Never use mock data in production** — mocks are only for `tests/mocks/`
4. **Respect RLS policies** — all queries go through Supabase client
5. **Check constraints** before inserts/updates
6. **Use existing Supabase clients**:
   - Browser: `src/lib/supabase.ts` or `src/lib/supabaseClient.ts`
   - Server: `src/lib/supabaseServer.ts`
   - Additional: `src/utils/supabase/client.ts`, `src/utils/supabase/server.ts`

---

## 10 — Import Rules

### Path Alias

Always use `@/` prefix for cross-module imports:

```typescript
// ✅ CORRECT
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { cn } from '@/lib/utils';

// ❌ WRONG
import { Button } from '../../../components/ui/button';
import { Route } from 'react-router-dom';
import axios from 'axios';
```

### Rules

1. `@/` maps to `./src/*` (configured in `tsconfig.json`)
2. **Never** use deep relative paths for cross-module imports
3. **Never** import `react-router-dom` — use `next/navigation` and `next/link`
4. **Never** import libraries not in `package.json`
5. Use named exports for components
6. Use `'use client'` directive for any file using React hooks or browser APIs

### File Naming

| File Type | Convention | Example |
|-----------|-----------|---------|
| Pages | `page.tsx` | `src/app/dashboard/page.tsx` |
| Layouts | `layout.tsx` | `src/app/tests/layout.tsx` |
| API routes | `route.ts` | `src/app/api/tests/route.ts` |
| Components | PascalCase | `NavbarWrapper.tsx` |
| Hooks | camelCase | `use-mobile.ts` |
| Stores | kebab-case | `theme-store.ts` |
| Utilities | camelCase | `utils.ts` |

---

*Last updated: 2026-03-08 | Generated from live codebase analysis*
