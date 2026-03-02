# Known Issues & Gotchas

## Active Bugs

### Console Logging Supabase Credentials
- **File:** `src/services/supabase.ts:15-16`
- **Issue:** `console.log` outputs the Supabase URL and anon key on client init
- **Risk:** Leaks to production logs / crash reporters
- **Fix:** Remove the two `console.log` lines before any production deployment

## Incomplete Features

### Templates Screen (Placeholder)
- **File:** `src/app/(app)/templates.tsx`
- **Status:** Screen renders list with dark mode support, but "Start Workout" button shows an `Alert` stub
- **Missing:** Logic to load a template into `useWorkoutForm` state
- **Dependency:** `useWorkoutForm` needs an `initFromTemplate(template)` action

## Architecture Limitations

### No Migration Files in Repo
- **Issue:** No `.sql` migration files tracked in the repo
- **Workflow:** Apply schema changes via Supabase MCP `apply_migration` tool, then regenerate types with `generate_typescript_types`
- **Risk:** Schema drift between environments, no local history of changes
- **Workaround:** Document current schema in `kb/architecture.md`

### No Offline Support
- **Issue:** All reads/writes require live Supabase connection
- **Failure mode:** Silently fails or shows raw error alerts when offline

### Exercise Library — No Create Flow
- **Issue:** Users cannot create new exercises in-app; they rely on pre-seeded `exercise_library` rows
- **Workaround:** Data must be inserted directly via Supabase dashboard or SQL

## Testing Gotchas

### react-native-reanimated Mock
- **Issue:** If `react-native-reanimated/mock` is not applied, tests throw `useSharedValue is not a function`
- **Fix:** Always keep `jest.mock('react-native-reanimated', () => require('react-native-reanimated/mock'))` in `jest.setup.js`

### Fake Timers + `useWorkoutForm`
- **Issue:** Timer in `useWorkoutForm` uses `setInterval` — tests must call `jest.useFakeTimers()` or the interval leaks and causes "open handle" warnings
- **Fix:** Always `jest.useFakeTimers()` in `beforeEach` and `jest.useRealTimers()` in `afterEach` for hook tests

### Supabase Client Import in Tests
- **Issue:** Importing `supabase.ts` in tests triggers real client initialization (reads env vars)
- **Fix:** `jest.setup.js` pre-sets env vars; tests must mock `@/services/supabase` to avoid real network calls

## ESLint / Prettier Conflicts
- **Issue:** If Prettier and ESLint rules conflict, `eslint-plugin-prettier/recommended` makes Prettier the winner
- **Fix:** All formatting is Prettier-first; ESLint only enforces logical rules

## Husky Pre-commit
- **Issue:** First-time setup after cloning may need `yarn prepare` to install Husky hooks
- **Fix:** `yarn prepare` (runs automatically on `yarn install` in most cases)

### Pre-commit Hook in Non-Interactive Environments
- **Issue:** The hook originally had `exec < /dev/tty` which fatally errors in non-interactive shells (CI, Claude tool execution)
- **Fix applied:** Changed to `if tty -s 2>/dev/null; then exec < /dev/tty; fi` in `.husky/pre-commit`
- **Hook runs:** `yarn typecheck` → `yarn lint-staged` → `yarn test --passWithNoTests`
