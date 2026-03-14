# Cognify AI Supervisor — Self-Correcting Validation System

> **⚠️ AI RULE**: This system is mandatory. Before returning ANY generated code, the AI must complete all validation checks defined in this document.

---

## 1 — Purpose

This document defines a **self-correcting AI development workflow** for the Cognify repository.

### Goal

Prevent architectural violations and hallucinated implementations by forcing AI agents to **validate their output** before returning code.

### How It Works

```
User Request
    ↓
AI generates code
    ↓
AI runs validation checks (this document)
    ↓
Violations found? → Correct code → Re-validate
    ↓
No violations → Return final code
```

Every AI agent modifying this repository must treat this as a **mandatory gate** — no code is returned until all checks pass.

---

## 2 — AI Validation Process

Before returning code, the AI **must** perform each of the following checks.

---

### ✅ Check 0: Task Planner Check

Confirm:

- [ ] For non-trivial tasks, a plan was created before coding
- [ ] Plan follows `AI_TASK_PLANNER.md` format
- [ ] Plan includes: objective, scope, dependencies, steps, risk checks, validation plan
- [ ] Implementation followed the planned sequence (or was explicitly updated)
- [ ] Validation steps in the plan were executed before final output

If this check fails, code output is blocked until plan compliance is restored.

---

### ✅ Check 0.5: AI Debug System Check

Confirm:

- [ ] `npm run debug` was executed before code generation
- [ ] `ai-debug/debug-runner.ts` completed successfully
- [ ] No blocking errors exist in route, env, schema, layout, or import checks
- [ ] If debug errors were found, they were fixed before continuing

If this check fails, code output is blocked until debug system errors are resolved.

---

### ✅ Check 1: Architecture Check

Confirm:

- [ ] Code fits inside the `src/app/` structure (App Router)
- [ ] No duplicate `layout.tsx` files created (only `src/app/layout.tsx`, `src/app/tests/layout.tsx`, and `src/app/dashboard/layout.tsx` exist intentionally)
- [ ] `Navbar` is NOT duplicated — singleton at `src/components/Navbar.tsx`
- [ ] `Footer` is NOT duplicated — singleton at `src/components/cognify/Footer.tsx`
- [ ] `BottomNav` is NOT duplicated — singleton at `src/components/cognify/BottomNav.tsx`
- [ ] `ThemeProvider` is NOT duplicated — singleton at `src/components/providers/ThemeProvider.tsx`
- [ ] No standalone React app created — everything within Next.js App Router

---

### ✅ Check 2: Database Check

Confirm:

- [ ] All queries reference **real tables** that exist in `db/schema.sql`
- [ ] All referenced **fields** exist on the queried tables
- [ ] All CHECK constraints are respected (`question_type`, `difficulty`, `status`, `type`, `role`, `class_level`)
- [ ] No fake or invented tables are created

**The 22 valid tables are:**

`profiles`, `study_sessions`, `streaks`, `notes`, `leaderboard`, `uploads`, `exams`, `subjects`, `chapters`, `topics`, `questions`, `tests`, `test_attempt_questions`, `squads`, `squad_members`, `challenges`, `challenge_participants`, `syllabus_exams`, `syllabus_subjects`, `syllabus_units`, `syllabus_chapters`, `syllabus_concepts`

If the code references any table **not** in this list → **VIOLATION**.

---

### ✅ Check 3: Feature Contract Validation

**NEW STEP**: Before returning code, AI must read and verify against feature contracts.

Confirm:

- [ ] Target module's contract file exists at `feature-contracts/[module].contract.md`
- [ ] All imports are in the ALLOWED_IMPORTS section
- [ ] No imports match the FORBIDDEN_IMPORTS section
- [ ] All database tables are listed in the DATABASE_TABLES section
- [ ] All custom routes match the ROUTES section
- [ ] All new API endpoints are listed in the API_ENDPOINTS section
- [ ] No cross-module imports (except shared services/ui)
- [ ] Shared services match `feature-contracts/shared-services.contract.md`
- [ ] Shared UI matches `feature-contracts/shared-ui.contract.md`

**If violations found**: Reject code, fix violations, re-validate.

**How to validate:**
1. Open `feature-contracts/[module].contract.md`
2. Check ALLOWED_IMPORTS section
3. Check FORBIDDEN_IMPORTS section
4. Check DATABASE_TABLES section
5. Cross-reference all code against these lists
6. If any violation exists → FIX BEFORE RETURNING

---

### ✅ Check 4: Import Check

Confirm:

- [ ] All imported modules exist in the repository or `package.json`
- [ ] `@/` alias is used for cross-module imports (maps to `./src/*`)
- [ ] No `react-router-dom` imports
- [ ] No libraries that are not in `package.json`

---

### ✅ Check 5: Theme Check

Confirm:

- [ ] No hardcoded colors (no `#hex`, no `rgb()`, no `hsl()` inline)
- [ ] Uses theme tokens: `bg-background`, `text-foreground`, `text-primary`, etc.
- [ ] Dark mode compatible (works with `.dark` class)
- [ ] Uses `cn()` from `@/lib/utils` for conditional classes

---

### ✅ Check 6: Module Placement Check

Confirm the file belongs in the correct directory:

| Module | Page Directory | Component Directory |
|--------|---------------|-------------------|
| Dashboard | `src/app/dashboard/` | `src/app/dashboard/components/` |
| Tests | `src/app/tests/` | `src/app/tests/components/` |
| Library | `src/app/library/` | `src/app/library/components/` |
| Cogni | `src/app/cogni/` | `src/app/cogni/components/` |
| Settings | `src/app/settings/` | `src/components/settings/` |
| Arena | `src/app/arena/` | `src/components/social/` |
| API routes | `src/app/api/[domain]/` | — |
| Shared UI | — | `src/components/ui/` |
| Services | — | `src/lib/` |

---

## 6 — Self-Correcting Rule

If the generated code violates **any** check above, the AI must:

1. **Detect** the specific violation
2. **Correct** the code to comply with the rule
3. **Re-validate** the corrected code against all checks
4. **Only then** return the final output

### Example Corrections

| Violation | Correction |
|-----------|-----------|
| Code creates a second `Navbar` | Remove it; use existing `src/components/Navbar.tsx` |
| Code queries `user_scores` table | Replace with query to `tests` or `test_attempt_questions` |
| Code imports `react-router-dom` | Replace with `next/navigation` and `next/link` |
| Code uses `bg-blue-600` hardcoded | Replace with `bg-primary` |
| Code creates `src/pages/test.tsx` | Move to `src/app/tests/page.tsx` (App Router) |

---

## 7 — Forbidden AI Behaviors

The AI must **NEVER**:

| Forbidden Action | Why |
|-----------------|-----|
| Create fake database tables | Only 22 tables exist in `db/schema.sql` |
| Create duplicate layouts | Global layout is a singleton |
| Create new navigation components | Navbar, Footer, BottomNav are singletons |
| Use `react-router-dom` | Project uses Next.js App Router exclusively |
| Hardcode colors | Theme token system in `globals.css` must be used |
| Create standalone React apps | Everything lives within the Next.js App Router |
| Use mock data in production code | Mocks only in `src/app/tests/mocks/` for development |
| Introduce new CSS frameworks | TailwindCSS v4 is the only CSS framework |
| Introduce new icon libraries | Lucide React is the only icon library |

---

## 8 — Code Output Rule

AI must **only** output code after completing **all** validation checks.

### Mandatory Workflow

```
Step 1 → Read AI_SKILLS.md
Step 2 → Create task plan using AI_TASK_PLANNER.md (when task is non-trivial)
Step 3 → Read relevant governance files (ARCHITECTURE.md, DATABASE_GUIDE.md, MODULE_RULES.md)
Step 4 → Run `npm run debug` and resolve blocking errors
Step 5 → Inspect the target file and surrounding module
Step 6 → Generate code
Step 7 → Run all validation checks in Section 2
Step 8 → If violations found → correct and re-validate (Section 6)
Step 9 → Return validated code
```

**Skipping any step is not permitted.**

---

## 9 — AI Development Guardrail Checklist

Every code generation task **must** pass this checklist before output is returned.

### Pre-Generation Checklist

| # | Check | Action |
|---|-------|--------|
| 1 | **Read governance files** | Read AI_SKILLS.md + relevant docs for the task |
| 2 | **Create task plan** | For non-trivial tasks, create plan using `AI_TASK_PLANNER.md` |
| 3 | **Identify target module** | Determine which module the code belongs to |
| 4 | **Check existing code** | Inspect the target file and surrounding files |
| 5 | **Verify database usage** | Confirm all tables/columns exist in `db/schema.sql` |
| 6 | **Check API contracts** | If API work, verify against `docs/api-contracts.md` |

### Post-Generation Checklist

| # | Check | Pass Criteria |
|---|-------|--------------|
| 1 | **Architecture compliance** | Code uses App Router, no duplicate singletons |
| 2 | **Database schema compliance** | All queries target valid tables with valid columns |
| 3 | **Import validity** | All imports resolve, `@/` alias used, no banned libs |
| 4 | **Theme token usage** | No hardcoded colors, uses `bg-background`/`text-foreground` |
| 5 | **Module placement** | File is in the correct directory per MODULE_RULES.md |
| 6 | **Dark mode** | Component works in both light and dark themes |
| 7 | **Type safety** | TypeScript types match existing interfaces |
| 8 | **Error handling** | try/catch on Supabase queries, graceful failures |

### If Any Check Fails

```
1. Identify which check(s) failed
2. Document the specific violation
3. Correct the code
4. Re-run ALL post-generation checks
5. Only return code when all 8 checks pass
```

---

### Reference Documents

| File | Purpose |
|------|---------|
| `AI_SKILLS.md` | Complete codebase knowledge system |
| `AI_TASK_PLANNER.md` | Required planning standard before code generation |
| `ai-debug/debug-runner.ts` | Mandatory pre-code architecture debugging gate |
| `AI_WORKFLOW.md` | Development workflow rules |
| `ARCHITECTURE.md` | Platform architecture documentation |
| `DATABASE_GUIDE.md` | Database schema and rules |
| `MODULE_RULES.md` | Module structure and component rules |
| `PROJECT_CONTEXT.md` | Product vision and design philosophy |
| `docs/api-contracts.md` | API request/response contracts |
| `docs/ui-patterns.md` | UI layout and styling patterns |
| `ai-prompts/prompt-library.md` | Reusable development prompts |

---

*Last updated: 2026-03-09 | Cognify AI Supervisor System*
