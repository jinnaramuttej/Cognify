# DASHBOARD Module Contract

## MODULE NAME
Dashboard Module

## MODULE PURPOSE
Student personalized dashboard providing quick stats, learning recommendations, upcoming tests, streak tracking, and quick-access buttons to major features. Serves as the main hub after login.

## ROUTES

### Main Routes
- `/dashboard` — Main dashboard view
- `/dashboard/quick-actions` — Recommended next steps

## DATABASE TABLES

**Read Tables:**
- `profiles` — Student profile and streak data
- `streaks` — Current streak tracking
- `tests` — Test history for stats
- `study_sessions` — Study time tracking
- `challenge_participants` — Challenge progress

**Reference Tables (Read-Only):**
- `exams` — Exam data for progress

## API ENDPOINTS

- `GET /api/dashboard/stats` — User statistics
- `GET /api/dashboard/recent-tests` — Last 5 tests
- `GET /api/dashboard/upcoming` — Upcoming tests/deadlines
- `GET /api/dashboard/recommendations` — Next steps
- `GET /api/dashboard/streak` — Current streak info

## UI COMPONENTS

**Container Components:**
- `DashboardPage` — Main dashboard view
- `StatsSection` — Statistics cards
- `RecentTestsSection` — Test history list
- `UpcomingSection` — Upcoming items
- `QuickActionsSection` — Action buttons

**Presentational Components:**
- `StatCard` — Individual metric card
- `StreakDisplay` — Streak counter
- `TestCard` — Test result summary
- `DetailCard` — Detailed stat display
- `ActionButton` — Quick-access button
- `ProgressIndicator` — User progress bar

## DEPENDENCIES

**Shared Services:**
- `@/lib/supabase` — Data queries
- `@/contexts/AuthContext` — User session
- `@/lib/utils` — Utilities
- `@/lib/study-service` — Dashboard data

**Shared UI:**
- `@/components/ui/*` — UI primitives
- `@/components/cognify/*` — Cognify-specific UI
- `@/lib/theme-store` — Theme

**External Libraries:**
- `zustand` — State management
- `framer-motion` — Animations
- `lucide-react` — Icons
- `date-fns` — Date utilities

## ALLOWED IMPORTS

```typescript
// Shared services
@/lib/supabase
@/lib/study-service
@/contexts/AuthContext
@/lib/utils
@/lib/app-store
@/lib/theme-store
@/lib/ui-store

// Shared UI
@/components/ui
@/components/cognify
@/components/Navbar

// Own module
src/app/dashboard/*

// External
zustand
framer-motion
lucide-react
date-fns
next
```

## FORBIDDEN IMPORTS

```typescript
// ❌ Cannot import from other feature modules
@/modules/tests/*
@/modules/library/*
@/modules/teacher/*
@/modules/cogni/*
@/modules/analytics/*
@/modules/notes-converter/*

// ❌ Cannot write to any data
// Dashboard is read-only
@/lib/test-service (write)
@/lib/teacher-service

// ❌ Cannot access role-specific features
@/app/teacher/*
```

## VALIDATION RULES

- ✅ Dashboard only accessible to authenticated users
- ✅ Only students (role='student') can access dashboard
- ✅ All data sourced from read-only queries
- ✅ Stats computed from immutable historical data
- ✅ No data modification allowed
- ❌ Teachers see teacher dashboard (/teacher)
- ❌ Dashboard cannot write to database

## NOTES

- Student-only feature (teachers see /teacher dashboard)
- Role check: only role='student' (and admin) access
- Redirect rule: teachers auto-redirect to /teacher on /dashboard attempt
- Quick actions link to: /tests, /library, /notes-converter, /cogni
- Streak info fetches from streaks table
- Recent tests: last 5 from most recent
- Recommendations based on weak areas from analytics
- Dashboard has custom layout at `src/app/dashboard/layout.tsx`
