# TESTS Module Contract

## MODULE NAME
Tests Module

## MODULE PURPOSE
Handles test creation, test sessions, question rendering, scoring, and analytics. Manages the complete test-taking experience including timer, review, and result calculation.

## ROUTES

### Main Routes
- `/tests` — Landing page, test list
- `/tests/create` — Test creation flow
- `/tests/active` — Active test-taking session
- `/tests/[testId]` — Dynamic test session page
- `/tests/results` — Test results and performance analytics
- `/tests/history` — User's test history
- `/tests/analytics` — Performance analytics dashboard

### Nested Routes
- `/tests/[testId]/review` — Review test responses

## DATABASE TABLES

**Core Tables (Read/Write):**
- `exams` — Exam definitions (JEE Main, NEET, etc.)
- `subjects` — Subject definitions (Physics, Chemistry, etc.)
- `chapters` — Chapter definitions within subjects
- `topics` — Topic definitions within chapters
- `questions` — Question bank with metadata
- `tests` — Test sessions (created & run by users)
- `test_attempt_questions` — Individual question responses

**Reference Tables (Read-Only):**
- `profiles` — User data for scoring context

## API ENDPOINTS

- `POST /api/tests/create` — Create new test session
- `POST /api/tests/generate` — Generate test from criteria
- `POST /api/tests/[testId]/submit` — Submit test responses
- `GET /api/tests/[testId]` — Fetch test details
- `GET /api/tests/history` — Get user's test history
- `GET /api/tests/[testId]/results` — Get test results
- `GET /api/tests/analytics` — Get performance analytics
- `POST /api/tests/[testId]/save-progress` — Save in-progress test

## UI COMPONENTS

**Container Components:**
- `TestLanding` — Main tests page
- `TestCreator` — Test creation interface
- `TestSession` — Active test-taking session
- `ResultsPage` — Test results display

**Presentational Components:**
- `QuestionViewer` — Display question with options
- `TestTimer` — Countdown timer
- `QuestionNavigator` — Question list navigator
- `ResultsChart` — Results visualization
- `PerformanceMetrics` — Performance stats display

## DEPENDENCIES

**Shared Services:**
- `@/lib/supabase` — Database access
- `@/contexts/AuthContext` — User authentication

**Shared UI:**
- `@/components/ui/*` — shadcn/ui components
- `@/lib/utils` — Utility functions

**External Libraries:**
- `recharts` — Charts and visualizations
- `zustand` — State management
- `framer-motion` — Animations
- `next/router` — Navigation

## ALLOWED IMPORTS

```typescript
// Shared services (allowed)
@/lib/supabase
@/contexts/AuthContext
@/lib/utils
@/lib/test-service
@/lib/theme-store
@/lib/ui-store
@/lib/app-store

// Shared UI (allowed)
@/components/ui
@/components/cognify
@/components/Navbar

// Own module (allowed)
src/modules/tests/*
src/app/tests/*

// External libraries (allowed)
recharts
framer-motion
zustand
next
lucide-react
```

## FORBIDDEN IMPORTS

```typescript
// ❌ Cannot import from other feature modules
@/modules/library/*
@/modules/teacher/*
@/modules/cogni/*
@/modules/analytics/*
@/modules/notes-converter/*

// ❌ Cannot import internal utilities from other features
@/app/dashboard/components/*
@/app/library/utils/*

// ❌ Cannot directly access feature-specific stores
// (use only shared stores)
@/lib/library-store
@/lib/teacher-store
```

## VALIDATION RULES

- ✅ All database queries must use tables listed above
- ✅ All routes must match the defined path structure
- ✅ All API endpoints must be documented here
- ✅ All components must be created within this module
- ✅ Imports must match ALLOWED_IMPORTS list
- ❌ FORBIDDEN_IMPORTS will cause validation failure

## NOTES

- Tests module has its own layout at `src/app/tests/layout.tsx` (suppresses global Navbar)
- Questions are immutable — never modify the `questions` table from this module
- Test scoring must use `negative_marking` field from exams table
- Session data is transient — only `tests` and `test_attempt_questions` persist
