# AI DEVELOPMENT WORKFLOW

When modifying this repository the AI must follow this order:

1. Read AI_SKILLS.md completely
2. Create a task plan using `AI_TASK_PLANNER.md` (required for non-trivial changes)
3. Run the AI debug gate: `npm run debug` and resolve blocking errors
4. Read the target module's contract file from `feature-contracts/[module].contract.md`
5. Inspect the current file being edited
6. Verify module architecture
7. Verify database schema
8. Verify imports against contract's ALLOWED_IMPORTS and FORBIDDEN_IMPORTS
9. Verify database tables against contract's DATABASE_TABLES list
10. Verify API endpoints against contract's API_ENDPOINTS list
11. Only then generate code

## Rules

- Never assume missing modules.
- Never create duplicate layouts.
- Never create a second Navbar.
- Never create mock database tables.
- Never create duplicate UI providers.
- Always integrate into the existing architecture.
- Always follow the structure defined in AI_SKILLS.md.
- Always plan implementation before coding when task complexity is non-trivial.
- Always run `npm run debug` before generating code.
- Always read core governance documents first; read secondary documentation only when needed for the current task.

## Feature Contract Rules

- **BEFORE MODIFYING ANY MODULE**: Read its contract file at `feature-contracts/[module].contract.md`
- **CHECK ALLOWED_IMPORTS**: Ensure all imports match the contract
- **CHECK FORBIDDEN_IMPORTS**: Reject any forbidden import patterns
- **CHECK DATABASE TABLES**: Only use tables listed in contract's DATABASE_TABLES
- **CHECK API ENDPOINTS**: Only create endpoints listed in contract's API_ENDPOINTS
- **VALIDATE ROUTES**: Ensure new routes match contract's ROUTES section
- **If violations detected**: Reject output, fix imports/queries, then re-validate

## Task Planner Rules

- **PLANNING GATE**: For non-trivial changes, create a plan before writing code using `AI_TASK_PLANNER.md`
- **REQUIRED PLAN FIELDS**: Objective, Scope, Dependencies, Implementation Steps, Risk Checks, Validation Plan
- **STEPWISE EXECUTION**: Execute one planned step at a time
- **PLAN UPDATES**: If scope changes, update plan before continuing
- **VALIDATION LOCK**: Do not return final output until planned validations pass

## AI Debug Rules

- **PRE-CODE DEBUG GATE**: Run `npm run debug` before writing code
- **BLOCKING BEHAVIOR**: If debug runner reports errors, fix them before implementation
- **HEALTH REPORT REQUIRED**: Include key debug findings in implementation context

---

## Shared Resources (Always Available)

See `feature-contracts/shared-services.contract.md` and `feature-contracts/shared-ui.contract.md` for:
- Shared services: `@/lib/supabase`, `@/contexts/AuthContext`, stores, utilities
- Shared UI: shadcn/ui, Cognify components, Tailwind, theme tokens

---

## Planner Reference

- Planning standard: `AI_TASK_PLANNER.md`
- Supervisor enforcement: `AI_SUPERVISOR.md`
