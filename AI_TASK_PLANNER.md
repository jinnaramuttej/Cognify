# AI Task Planner System

> Mandatory planning layer for all non-trivial code changes.

---

## 1 - Purpose

This system forces AI agents to produce a short implementation plan before writing code.

### Goals

- Reduce hallucinated implementation paths
- Make edits traceable to a declared plan
- Detect architecture, contract, and schema risks before coding

---

## 2 - When Planning Is Required

Planning is required when any of the following is true:

- More than one file will be modified
- API routes, database queries, or auth logic are involved
- A new component/service/module is added
- Existing behavior is changed (not only formatting)
- The user requests a review, refactor, migration, or architecture change

Planning can be skipped only for very small edits such as typo fixes, copy changes, or one-line class name fixes.

---

## 3 - Required Plan Format

Before coding, the AI must define these fields:

1. Objective
- One sentence describing the requested outcome

2. Scope
- Files likely to change
- Module affected
- Non-goals

3. Dependencies
- Contracts to read (`feature-contracts/[module].contract.md`)
- Shared contracts (`feature-contracts/shared-services.contract.md`, `feature-contracts/shared-ui.contract.md`)
- Governance docs needed for this task

4. Implementation Steps
- Ordered steps with clear action verbs
- Each step should produce a concrete artifact (code, test, doc, validation)

5. Risk Checks
- Contract violations (imports/routes/endpoints/tables)
- Database mismatch risk (table/column existence)
- UI/theme token risk (hardcoded styles)
- Behavioral regression risk

6. Validation Plan
- What checks/tests will be run
- What script or command validates the result

---

## 4 - Execution Rules

After writing the plan, the AI must:

1. Execute one step at a time
2. Re-check contracts before editing files outside initial scope
3. Update the plan if scope changes
4. Run validations listed in the plan
5. Return only after validations pass

---

## 5 - Plan Update Rule

If new information appears during implementation (for example, hidden dependencies or schema mismatch), the AI must:

1. Amend plan scope and risk checks
2. Explain why the plan changed
3. Continue execution only after the plan is updated

---

## 6 - Completion Criteria

A task is complete only when all are true:

- Planned steps are completed
- Contract checks pass
- Supervisor checks pass
- No unresolved violations remain

---

## 7 - Quick Plan Template

Use this template before coding:

```md
Objective:
- ...

Scope:
- Module: ...
- Files: ...
- Non-goals: ...

Dependencies:
- Contracts: ...
- Governance docs: ...

Implementation Steps:
1. ...
2. ...
3. ...

Risk Checks:
- ...
- ...

Validation Plan:
- ...
- ...
```
