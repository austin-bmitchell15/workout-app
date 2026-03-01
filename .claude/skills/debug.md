# Skill: debug
# Trigger: When diagnosing errors, crashes, or unexpected behavior
# Purpose: Structured debugging protocol for this codebase

## Step 1: Load Context
- Read `kb/issues.md` — check if this is a known issue
- Read `kb/testing.md` — if error is in tests, check mock patterns
- Read `kb/architecture.md` — if error involves data flow or state

## Step 2: Identify the Error
Common error categories in this project:

### Test Failures
| Error | Likely Cause | Fix |
|-------|-------------|-----|
| `useSharedValue is not a function` | reanimated mock missing | Add to `jest.setup.js` |
| `open handle: setInterval` | Fake timers not used | Add `jest.useFakeTimers()` |
| Supabase network call in test | Missing mock | Mock `@/services/supabase` in test file |
| `process.env.EXPO_PUBLIC_*` is undefined | env vars not set | Already in `jest.setup.js` — check import order |

### Runtime Errors
| Error | Likely Cause | Fix |
|-------|-------------|-----|
| Auth state not updating | Session listener not attached | Check `supabase.auth.onAuthStateChange` in `_layout.tsx` |
| Unit conversion wrong | Wrong direction (kg→lbs vs lbs→kg) | Check `WorkoutService.ts` save/load logic |
| Exercise not saving | Missing `exercise_library_id` | Ensure picker always sets this field |
| Animation crash | Reanimated worklet accessing JS state | Move state to shared value or use `runOnJS` |

## Step 3: Examine the Evidence
```bash
# Run failing test with verbose output
yarn test <file> --verbose

# TypeScript errors
yarn typecheck 2>&1 | head -50

# ESLint errors
yarn lint 2>&1 | head -50
```

## Step 4: Fix and Verify
1. Make the targeted fix
2. Re-run the failing test/command
3. Run `yarn test` to ensure no regressions
4. If a new gotcha was discovered, update `kb/issues.md` via the `memorize` skill
