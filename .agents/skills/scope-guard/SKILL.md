---
name: scope-guard
description: Prevent implementation from expanding beyond the approved plan. Use when implementing work from a plan and stop when an out-of-scope change is discovered.
---

# Scope Guard

Implement only work explicitly included in the current plan.

The plan defines the boundary of the current task and pull request.

## Before implementation

1. Read the current plan completely.
2. Identify:
   - Goal
   - In-scope work
   - Out-of-scope work
   - Expected files or areas to change
3. Treat anything not required by the plan as out of scope.

## During implementation

Before making a meaningful change, ask:

> Is this change necessary to complete the current plan?

If yes, continue.

If no, do not make the change.

If uncertain, treat the change as out of scope.

## Out-of-scope discoveries

When discovering unrelated bugs, refactoring opportunities, cleanup, improvements, or additional features:

- Do not implement them.
- Do not silently expand the plan.
- Record them as follow-up candidates.
- Continue the original task if possible.

## Stop condition

Stop implementation when an out-of-scope change is required to complete the current plan.

Report:

1. The change that appears necessary.
2. Why it is necessary.
3. Why it is outside the current plan.
4. What has already been completed.
5. A suggested follow-up action.

Do not continue until the plan is updated or the user explicitly approves the scope change.

## Forbidden behavior

Do not:

- perform opportunistic refactoring
- clean up unrelated code
- fix unrelated bugs
- add features not described in the plan
- redesign architecture unless required by the plan
- modify unrelated files merely because improvement is possible

Prefer a small completed pull request over a broader improved implementation.
