# Conventions & Patterns

## TypeScript
- Strict mode — no `any`, no implicit returns, no unchecked indexing
- DB-derived types live in `src/types/supabase.ts` (auto-generated via Supabase MCP `generate_typescript_types`)
- Domain types re-exported from `src/types/schema.ts` (e.g. `Profile`, `WorkoutRecord`, `Tables<>`, `Enums<>`)
- **Regenerate `src/types/supabase.ts` via MCP after any schema changes** — never edit it manually
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
- `profile.weight_unit` holds the user's unit preference — type `'KG' | 'LB'` (uppercase, from `UNIT_TYPE` enum)
- Convert on read/write using `kgToLbs` / `lbsToKg` from `@/utils/helpers`
- Conversion happens in `WorkoutService` — not in components

## Animations
- Use `react-native-reanimated` v4 for any animations
- Spring animation preferred for UI entrances (see `ExerciseLogger.tsx`)
- Always mock with `react-native-reanimated/mock` in tests

## Theming
Two valid patterns — pick based on component type:

**Pattern A — Themed components** (for simple text/view wrappers):
- Use `ThemedText` and `ThemedView` — they call `useThemeColor` internally
- Light/dark palettes defined in `src/constants/theme.ts`

**Pattern B — Inline color map** (for screens with many distinct styled elements):
```tsx
const { colorScheme } = useAppTheme();
const isDark = colorScheme === 'dark';
const c = {
  pageBg: isDark ? '#1c1c1e' : '#f2f2f7',
  cardBg: isDark ? '#2c2c2e' : '#fff',
  primaryText: isDark ? '#ECEDEE' : '#000',
  secondaryText: isDark ? '#9BA1A6' : '#6e6e73',
};
// Then use: style={[styles.container, { backgroundColor: c.pageBg }]}
```
Used in: settings.tsx, profile.tsx, index.tsx, templates.tsx, (app)/_layout.tsx

**Do not** hardcode colors like `backgroundColor: 'white'` or `color: '#333'` in screens.

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
