# Cognify Prompt Library

> Reusable prompts for common AI development tasks.  
> Each prompt references the Cognify governance files to prevent architectural violations.

---

## 1 — Create New Module

```
Follow the rules defined in:
AI_SKILLS.md, ARCHITECTURE.md, MODULE_RULES.md, DATABASE_GUIDE.md

TASK: Create a new module called [MODULE_NAME].

Before writing code:
1. Check MODULE_RULES.md for folder structure rules
2. Check ARCHITECTURE.md for layout system rules
3. Check DATABASE_GUIDE.md for available tables

Create:
- src/app/[module-name]/page.tsx
- src/app/[module-name]/components/ (if needed)
- src/app/api/[module-name]/route.ts (if API needed)

Rules:
- Use existing global layout (do NOT create a new root layout)
- Use @/ import alias
- Use theme tokens from globals.css
- Use shadcn/ui components
- Support dark mode
```

---

## 2 — Fix UI Bug

```
Follow the rules defined in:
AI_SKILLS.md, docs/ui-patterns.md, MODULE_RULES.md

TASK: Fix the UI bug in [FILE_PATH].

Before modifying:
1. Check docs/ui-patterns.md for the correct layout pattern
2. Check that no singleton components are duplicated
3. Verify theme token usage (no hardcoded colors)

Rules:
- Use cn() from @/lib/utils for class merging
- Use theme tokens: bg-background, text-foreground, text-primary
- Ensure dark mode compatibility
- Test both mobile and desktop layouts
```

---

## 3 — Add Supabase Query

```
Follow the rules defined in:
DATABASE_GUIDE.md, AI_SUPERVISOR.md

TASK: Add a Supabase query for [DESCRIPTION].

Before writing:
1. Verify the table exists in DATABASE_GUIDE.md (22 tables only)
2. Verify all column names match db/schema.sql
3. Check RLS policies apply
4. Use existing Supabase client from src/lib/supabaseClient.ts (browser) or src/lib/supabaseServer.ts (server)

Rules:
- Never query tables not in schema.sql
- Never invent column names
- Respect CHECK constraints on enums
- Use proper error handling
```

---

## 4 — Create API Endpoint

```
Follow the rules defined in:
ARCHITECTURE.md, docs/api-contracts.md, DATABASE_GUIDE.md

TASK: Create API endpoint at /api/[path].

Before writing:
1. Check docs/api-contracts.md for existing contract patterns
2. Check ARCHITECTURE.md Section 9 for API rules
3. Use src/lib/supabaseServer.ts for server-side queries

File: src/app/api/[path]/route.ts

Pattern:
- Export named HTTP methods (GET, POST, PUT, DELETE)
- Validate inputs
- Use try/catch error handling
- Return proper HTTP status codes
- Use NextResponse.json() for responses
```

---

## 5 — Debug Next.js Page

```
Follow the rules defined in:
AI_SKILLS.md, ARCHITECTURE.md, MODULE_RULES.md

TASK: Debug the page at [ROUTE_PATH].

Checklist:
1. Check for 'use client' directive if using hooks/state
2. Verify imports use @/ alias
3. Check for layout conflicts (only tests/ and dashboard/ have custom layouts)
4. Verify NavbarWrapper logic for route hiding
5. Check Supabase query tables exist in schema.sql
6. Verify no duplicate component instances

Common issues:
- Missing 'use client' → hooks fail silently
- Wrong import path → Module not found
- Layout nesting → Duplicate navbars
- Stale .next cache → Delete .next and restart
```

---

## 6 — Add Component

```
Follow the rules defined in:
MODULE_RULES.md, docs/ui-patterns.md

TASK: Create component [COMPONENT_NAME].

Placement rules:
- Shared UI primitive → src/components/ui/
- Module-specific → src/app/[module]/components/
- Cross-module feature → src/components/[feature]/

Rules:
- Use 'use client' if using hooks or browser APIs
- Use cn() for conditional classes
- Use theme tokens (never hardcoded colors)
- Use Lucide icons (never add new icon libraries)
- Follow shadcn/ui patterns for primitives
- Export as named export
```

---

## 7 — Add Test Engine Feature

```
Follow the rules defined in:
DATABASE_GUIDE.md, MODULE_RULES.md, docs/api-contracts.md

TASK: Add [FEATURE] to the test engine.

Tables available:
exams, subjects, chapters, topics, questions, tests, test_attempt_questions

Service layer: src/lib/test-service.ts
Smart generator: src/lib/tests/smart-test-generator.ts
Adaptive engine: src/lib/tests/adaptive-engine.ts

Rules:
- tests/layout.tsx intentionally suppresses global nav
- Questions must come from the questions table
- Test sessions must persist in the tests table
- Each attempt recorded in test_attempt_questions
- Timer is mandatory
- Negative marking is configurable
```

---

## 8 — Implement Analytics Feature

```
Follow the rules defined in:
DATABASE_GUIDE.md, PROJECT_CONTEXT.md

TASK: Add analytics for [METRIC].

Available services:
- src/lib/analytics/difficulty-calibrator.ts
- src/lib/analytics/question-quality.ts
- src/lib/analytics/mistake-detector.ts

Data sources:
- tests table (scores, completion)
- test_attempt_questions (per-question performance)
- profiles (streak, XP)
- study_sessions (study time)

Rule: Analytics must answer "What should I study next?"
```

---

*Last updated: 2026-03-08*
