# ANALYTICS Module Contract

## MODULE NAME
Analytics Module

## MODULE PURPOSE
Provides performance analytics, learning patterns, progress tracking, and personalized insights. Tracks user engagement, test performance, learning velocity, and generates recommendations based on historical data.

## ROUTES

### Main Routes
- `/progress-analytics` — User progress dashboard
- `/progress-analytics/overview` — Quick stats
- `/progress-analytics/detailed` — Detailed analytics

### Feature Routes
- `/progress-analytics/strengths` — Strong topics
- `/progress-analytics/weakpoints` — Weak areas
- `/progress-analytics/velocity` — Learning speed trends

## DATABASE TABLES

**Core Tables (Write):**
- `user_analytics` — Aggregated user metrics
- `test_performance_metrics` — Per-test statistics
- `learning_patterns` — Learning behavior data
- `performance_trends` — Trend over time

**Reference Tables (Read-Only):**
- `profiles` — User data
- `tests` — Test session data
- `test_attempt_questions` — Individual responses
- `study_sessions` — Study time tracking

## API ENDPOINTS

- `GET /api/analytics/overview` — User stats summary
- `GET /api/analytics/performance` — Performance detailed
- `GET /api/analytics/trends` — Performance trends
- `GET /api/analytics/weak-areas` — Weak topics analysis
- `GET /api/analytics/strengths` — Strong topics
- `POST /api/analytics/export` — Export analytics data
- `GET /api/analytics/recommendations` — AI recommendations

## UI COMPONENTS

**Container Components:**
- `AnalyticsPage` — Main analytics dashboard
- `PerformanceOverview` — Overall stats
- `DetailedMetrics` — Detailed breakdowns
- `TrendAnalysis` — Trend visualization

**Presentational Components:**
- `StatCard` — Individual metric card
- `TrendChart` — Trend line chart
- `DistributionChart` — Topic distribution pie chart
- `PerformanceGauge` — Circular progress indicator
- `ComparisonPanel` — Before/after comparison
- `RecommendationCard` — Recommendation display

## DEPENDENCIES

**Shared Services:**
- `@/lib/supabase` — Data queries
- `@/contexts/AuthContext` — User session
- `@/lib/utils` — Utilities
- Analytics computation libraries

**Shared UI:**
- `@/components/ui/*` — UI primitives
- `@/lib/theme-store` — Theme

**External Libraries:**
- `zustand` — State management
- `recharts` — Charts
- `framer-motion` — Animations
- `lucide-react` — Icons

## ALLOWED IMPORTS

```typescript
// Shared services
@/lib/supabase
@/contexts/AuthContext
@/lib/utils
@/lib/app-store
@/lib/theme-store

// Shared UI
@/components/ui
@/components/cognify

// Own module
src/modules/analytics/*
src/app/progress-analytics/*

// External
zustand
recharts
framer-motion
lucide-react
next
date-fns
```

## FORBIDDEN IMPORTS

```typescript
// ❌ Cannot import from other feature modules
@/modules/tests/*
@/modules/library/*
@/modules/teacher/*
@/modules/cogni/*
@/modules/notes-converter/*

// ❌ Cannot make changes to functional modules
@/lib/test-service (write)
@/lib/teacher-service (write)
```

## VALIDATION RULES

- ✅ All metrics computed from immutable source data (tests, study_sessions)
- ✅ Aggregations cached for performance
- ✅ User can only access own analytics
- ✅ Data exports must be non-destructive (read-only)
- ✅ Recommendations based only on test performance
- ❌ Cannot modify source test data
- ❌ Cannot export other users' data

## NOTES

- Analytics pages are read-only views of historical data
- Metrics computed nightly (async batch jobs recommended)
- Supports export to CSV/PDF
- Weak area detection: <60% accuracy on topic
- Strong area detection: >80% accuracy on topic
- Velocity: average questions-per-hour over last 7 days
- Privacy: only user's own analytics visible
