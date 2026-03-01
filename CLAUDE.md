# CLAUDE.md — workout-app
# Project-level instructions. Extends ~/.claude/CLAUDE.md (global rules still apply).
# Overrides take precedence over global defaults where noted.

---

## Session Start Protocol

**Every session, before doing anything else:**

1. Read `.claude/project_knowledge_base.md` — compact index, key file paths, current branch
2. Read `.claude/kb/commands.md` — always, before running any command
3. Load additional KB topic files only as the task requires (see Skill Router below)

**Package manager override:** Always use **Yarn**. Never `npm` or `bun`.

---

## Skill Router

This table is the authoritative dispatch map. When a trigger matches, read the listed skill
file before acting. Project skills (`.claude/skills/`) override global skills of the same name.

### Project Skills (`.claude/skills/`)

| Trigger | Skill | File |
|---------|-------|------|
| Start of any task needing project context | `recall` | `.claude/skills/recall.md` |
| After discovering a new pattern, bug, or architectural change | `memorize` | `.claude/skills/memorize.md` |
| Before running any build / test / lint / run command | `interact` | `.claude/skills/interact.md` |
| Diagnosing an error, crash, or unexpected behavior | `debug` | `.claude/skills/debug.md` |
| End of session, user says "reflect" / "update skills" / "feedback loop" | `reflect` | `.claude/skills/reflect.md` |

### Global Skills (`~/.claude/skills/`) — used as-is for this project

| Trigger | Skill | Notes |
|---------|-------|-------|
| Repo missing `.claude/`, user says "init" / "initialize" | `project-init` | Already initialized — KB exists |
| Asked to document code, APIs, or architecture | `doc-gen` | — |
| Adding, updating, or auditing dependencies | `dep-audit` | Yarn; check peer deps for Expo compatibility |
| User wants to extract data from a URL into CSV | `scrape` | — |

### Claude Code Built-in Skills

| Trigger | Skill |
|---------|-------|
| User asks to commit changes | `commit` |
| User asks to commit, push, and open a PR | `commit-push-pr` |
| User asks to review a PR | `code-review` |
| User asks to build a new feature | `feature-dev` |
| User asks to simplify or clean up code | `simplify` |
| Code imports `anthropic` / `@anthropic-ai/sdk` | `claude-developer-platform` |
| User asks to build a UI component or page | `frontend-design` |

---

## Knowledge Base Reference

Full KB lives in `.claude/kb/`. Load on demand — do not preload all files.

| File | Load When |
|------|-----------|
| `kb/stack.md` | Adding deps, env vars, configuring tooling |
| `kb/architecture.md` | Changing routing, state, data flow, services, DB schema |
| `kb/commands.md` | **Always** — before any command |
| `kb/testing.md` | Writing or fixing tests |
| `kb/conventions.md` | Writing new components, hooks, or services |
| `kb/issues.md` | Debugging or investigating odd behavior |

---

## Project-Specific Rules (override global defaults where they differ)

### Technology Constraints
- **TypeScript strict** — no `any`, no unchecked array indexing, no implicit `any` returns
- **Path alias** — always `@/*` (maps to `src/*`), never relative `../../`
- **All shared types** — go in `src/components/types.ts`, nowhere else
- **Animations** — `react-native-reanimated` v4 only; always mock with `react-native-reanimated/mock` in tests
- **Supabase** — never put query logic in components; route through `src/services/`

### State Management Hard Rules
- Auth state → `AuthContext` in `src/app/_layout.tsx` only
- Workout form state → `useWorkoutForm` hook only
- Do not introduce Redux, Zustand, or any new global store without user approval

### Unit Conversion Contract
- DB stores all weights in **kg** — this is the canonical unit
- Convert on read/write in `WorkoutService.ts` using `kgToLbs` / `lbsToKg` from `@/utils/helpers`
- Components never do unit conversion directly

### Testing Mandate
- After every functional code change: run `yarn test` (or targeted file)
- After adding a new function/module: write tests before marking task complete
- Test files live in `__tests__/` next to the source file they test
- Never skip or suppress a failing test — fix the root cause

### Pre-commit (Husky runs automatically)
Staged `*.{js,jsx,ts,tsx}` files are auto-formatted and linted on commit:
1. `prettier --write`
2. `eslint --fix`

Do not bypass with `--no-verify` unless the user explicitly requests it.

---

## Quick Command Reference

```bash
yarn test                          # run all tests
yarn test <path/to/file.test.ts>   # single file
yarn lint                          # ESLint
yarn format                        # Prettier
yarn typecheck                     # tsc --noEmit
yarn check                         # lint + format + typecheck
```

Git — always `--no-pager`:
```bash
git --no-pager log --oneline -10
git --no-pager diff
git --no-pager diff --cached --stat
```
