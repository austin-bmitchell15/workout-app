# Commands

## Package Manager
Always use **Yarn** (not npm, not bun).

## Install
```bash
yarn install
```

## Development
```bash
yarn start          # Start Expo dev server
yarn start --ios    # Start on iOS simulator
yarn start --android # Start on Android emulator
```

## Quality Checks
```bash
yarn lint           # ESLint (flat config)
yarn format         # Prettier (write mode)
yarn typecheck      # tsc --noEmit
yarn check          # lint + format + typecheck (all three)
```

## Testing
```bash
yarn test                   # Run all tests
yarn test:watch             # Watch mode
yarn test:coverage          # Generate coverage report

# Run a single test file
yarn test src/hooks/__tests__/useWorkoutForm.test.ts

# Run tests matching a pattern
yarn test --testNamePattern="finishWorkout"

# Run tests for a specific directory
yarn test src/components/workouts/

# Update snapshots
yarn test --updateSnapshot
```

## Git (always use --no-pager)
```bash
git --no-pager log --oneline -10
git --no-pager diff
git --no-pager diff --cached --stat
git --no-pager show HEAD
```

## CI
CI runs on push/PR to `main` via `.github/workflows/main.yml`:
1. `yarn install`
2. `yarn lint`
3. `yarn typecheck`
4. `yarn test`

Pre-commit hook (Husky + lint-staged) runs:
1. `prettier --write`
2. `eslint --fix`
on all `*.{js,jsx,ts,tsx}` staged files.
