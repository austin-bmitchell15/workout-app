# Workout App — Project Knowledge Base Index
# Read this file at the start of every session. Load topic files on demand.
# Last updated: 2026-03-01

## Project Overview
React Native workout tracking app (Expo 54 / expo-router v6 / TypeScript strict / Supabase backend).
Features: auth, workout logging w/ exercises & sets, workout history, unit conversion (kg↔lbs), templates (WIP).

## Quick Reference
| Topic | File | Load When |
|-------|------|-----------|
| Stack & toolchain | `kb/stack.md` | Adding deps, configuring tools, env vars |
| Architecture | `kb/architecture.md` | Modifying data flow, routing, state, services |
| Commands | `kb/commands.md` | Running tests, builds, lint — ALWAYS load this |
| Testing | `kb/testing.md` | Writing or fixing tests |
| Conventions | `kb/conventions.md` | Adding new code, components, hooks |
| Issues & Gotchas | `kb/issues.md` | Debugging, investigating odd behavior |

## Key Files (Absolute Paths)
- Types: `src/components/types.ts`
- Auth context + root layout: `src/app/_layout.tsx`
- Workout hook: `src/hooks/useWorkoutForm.ts`
- Workout service: `src/services/WorkoutService.ts`
- Active workout UI: `src/components/workouts/ActiveWorkout.tsx`
- Exercise card: `src/components/workouts/ExerciseLogger.tsx`
- Set row: `src/components/workouts/SetLogger.tsx`
- Exercise picker modal: `src/components/workouts/ExercisePickerModal.tsx`
- Supabase client: `src/services/supabase.ts`
- Theme constants: `src/constants/theme.ts`
- Helpers: `src/utils/helpers.ts`
- Jest setup: `jest.setup.js`
- CI: `.github/workflows/main.yml`, `claude.yml`, `claude-code-review.yml`

## Current Branch
`claude-skills` — branched from `main`

## Known Issues (Quick Ref)
- Console-logs Supabase URL/key in `src/services/supabase.ts:15-16` — should be removed
- Templates screen is a placeholder (alert stub only)
- Profile "Edit Username" is not implemented
- No migration files; schema managed in Supabase dashboard
