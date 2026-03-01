# Skill: recall
# Trigger: Start of any task requiring project context
# Purpose: Load only the KB sections relevant to the current task

## Instructions

You are loading project context for the workout-app. The index is at:
`.claude/project_knowledge_base.md`

Based on the current task, load the relevant topic files:

| If task involves... | Load |
|--------------------|------|
| Running tests, builds, lint | `kb/commands.md` (ALWAYS load this) |
| Adding/changing dependencies, env vars | `kb/stack.md` |
| Modifying routing, state, data flow, services | `kb/architecture.md` |
| Writing or fixing tests | `kb/testing.md` |
| Adding new code, components, hooks | `kb/conventions.md` |
| Debugging unexpected behavior | `kb/issues.md` |

## Protocol

1. Read `.claude/project_knowledge_base.md` (index, quick ref, key file paths)
2. Read `kb/commands.md` — always, before running any command
3. Read additional topic files matching the task
4. Do NOT load all topic files if only 1-2 are relevant — token efficiency matters

## Key Facts (no file load needed for these)
- Package manager: **Yarn** (never npm or bun)
- Test command: `yarn test`
- Lint: `yarn lint`, Format: `yarn format`, Types: `yarn typecheck`
- Path alias: `@/*` → `src/*`
- All types in: `src/components/types.ts`
- Workout state: `src/hooks/useWorkoutForm.ts`
- Auth context: `src/app/_layout.tsx` via `useAuth()`
