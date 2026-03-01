# Conventions & Patterns

## TypeScript
- Strict mode — no `any`, no implicit returns, no unchecked indexing
- All shared types in `src/components/types.ts` — do not scatter type definitions
- Use `interface` for object shapes, `type` for unions/aliases
- Path alias: `@/*` → `src/*` — always use this in imports, never relative `../../`

## Component Patterns
- **Functional components only** — no class components
- Props typed inline or with a named `interface Props { ... }` at top of file
- Co-locate component, its hook usage, and styles in one file unless file grows >200 lines
- **Feature-first organization**: `components/workouts/`, `components/common/`, not layer-first

## Naming
| Thing | Convention | Example |
|-------|-----------|---------|
| Components | PascalCase | `ExerciseLogger` |
| Hooks | camelCase, `use` prefix | `useWorkoutForm` |
| Services | PascalCase + `Service` suffix | `WorkoutService` |
| Types/Interfaces | PascalCase | `LocalExercise`, `WorkoutRecord` |
| Constants | UPPER_SNAKE or camelCase object | `Colors.light`, `FONTS` |
| Local IDs | `local-XXXXXXX` format | `generateLocalId()` from `utils/helpers.ts` |
| Test files | `<Source>.test.ts(x)` in `__tests__/` | `WorkoutService.test.ts` |

## Imports Order (enforced by ESLint)
1. React / React Native core
2. Expo / third-party libraries
3. `@/` path alias imports (services, hooks, components, types)
4. Relative imports (rare, only same directory)

## State Management Rules
- **Auth state** → only in `AuthContext` (root `_layout.tsx`)
- **Workout form state** → only in `useWorkoutForm` hook
- **No prop drilling > 2 levels** — use context or restructure
- **No new global state libraries** without user approval

## Supabase Query Pattern
```ts
const { data, error } = await supabase
  .from('table_name')
  .select('col1, col2')
  .eq('user_id', userId)
  .single();

if (error) throw error;
```
Always check `error` before using `data`. Never swallow Supabase errors.

## Unit Conversion
- All weights stored in the DB in **kg** (canonical unit)
- Convert on read/write using `kgToLbs` / `lbsToKg` from `@/utils/helpers`
- `preferredUnit` comes from `profile.preferred_unit` ('kg' | 'lbs')
- Conversion happens in `WorkoutService` — not in components

## Animations
- Use `react-native-reanimated` v4 for any animations
- Spring animation preferred for UI entrances (see `ExerciseLogger.tsx`)
- Always mock with `react-native-reanimated/mock` in tests

## Theming
- Use `useThemeColor(props, colorName)` hook for dynamic colors
- Light/dark palettes defined in `src/constants/theme.ts`
- Use `ThemedText` and `ThemedView` for themed surfaces
- Never hardcode colors inline — always use theme constants

## Error Handling
- Surface errors to users via `Alert.alert(title, message)`
- Log unexpected errors to console for debug (but remove Supabase key logs)
- Never silently swallow `catch` blocks — at minimum `console.error`

## Git Commit Messages
Format: `type(scope): description`
Types: `feat`, `fix`, `refactor`, `test`, `chore`, `docs`
Examples:
- `feat(workout): add previous set ghost placeholders`
- `fix(auth): handle expired session refresh`
- `test(WorkoutService): add unit conversion edge cases`
