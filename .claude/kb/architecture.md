# Architecture

## Directory Layout
```
src/
├── app/                    # expo-router pages (file = route)
│   ├── _layout.tsx         # Root: AuthContext, ThemeProvider, auth guard, ProfileThemeSyncer
│   ├── index.tsx           # Redirects → /(app)
│   ├── (auth)/             # Unprotected: login, sign-up
│   └── (app)/              # Protected: dashboard, log-workout, history, templates, profile, settings
│       └── _layout.tsx     # Stack navigator with theme-aware header
├── components/
│   ├── workouts/           # Workout feature components
│   ├── common/             # Reusable UI (StyledButton, StyledTextInput)
│   ├── settings/           # CsvImporter
│   ├── themed-text.tsx     # Theme-aware Text (uses useAppTheme)
│   └── themed-view.tsx     # Theme-aware View (uses useAppTheme)
├── contexts/
│   └── ThemeContext.tsx    # ThemeProvider, useAppTheme(), ThemePreference type
├── hooks/
│   ├── useWorkoutForm.ts   # Workout state (main domain hook)
│   └── theme/              # use-theme-color.ts (reads Colors[colorScheme][key])
├── services/
│   ├── supabase.ts         # Supabase typed client singleton (createClient<Database>)
│   ├── AuthService.ts      # getInitialSession, onAuthStateChange, getUserProfile, signOut
│   ├── WorkoutService.ts   # saveWorkout, getWorkoutHistory, getLastSetsForExercise
│   ├── ExerciseService.ts  # fetchExerciseLibrary
│   └── ImportService.ts    # parseStrongCsv
├── types/
│   ├── supabase.ts         # Auto-generated DB types (Database, Tables<>, Enums<>)
│   └── schema.ts           # Domain types re-exported: Profile, WorkoutRecord, etc.
├── constants/
│   └── theme.ts            # Colors (light/dark palettes), Fonts
└── utils/
    └── helpers.ts          # generateLocalId, kgToLbs, lbsToKg
```

## Routing Structure
```
/                           → redirects to /(app)
/(auth)/login               → Login screen
/(auth)/sign-up             → Sign-up screen
/(app)/                     → Dashboard (index)
/(app)/log-workout          → Workout logging (modal)
/(app)/history              → Workout history list
/(app)/templates            → Templates (WIP)
/(app)/profile              → User profile
/(app)/settings             → Units preference, sign-out
```

## Auth Guard
`src/app/_layout.tsx` — Root layout:
- Uses `AuthService.getInitialSession()` + `AuthService.onAuthStateChange()`
- Calls `AuthService.getUserProfile(userId)` after login to populate `profile`
- `ProfileThemeSyncer` component (inside `AuthContext.Provider`) restores theme from `profile.theme_preference` on first profile load
- If no session → redirects to `/(auth)/login`
- If session → redirects to `/(app)`
- Exposes `AuthContext` / `useAuth()` → `{ session, profile, loading, setProfile, signOut }`

## State Management
| State | Location | Pattern |
|-------|----------|---------|
| Auth session + profile | `AuthContext` in root `_layout.tsx` | React Context |
| Workout form state | `useWorkoutForm` hook | Local hook state |
| Theme preference | `ThemeContext` in `src/contexts/ThemeContext.tsx` | React Context + AsyncStorage + Supabase |

No Redux, Zustand, or global store. Intentional — keep it simple.

## Data Flow: Workout Save
```
User taps "Finish"
  → useWorkoutForm.finishWorkout()
  → validates exercises + sets
  → WorkoutService.saveWorkout(workout, userId, preferredUnit)
    → INSERT workouts row → get workout.id
    → for each exercise: INSERT workout_exercises → get we.id
    → for each set: convert weight kg↔lbs → INSERT sets
  → resetWorkout() on success
  → Alert on failure
```

## Data Flow: Exercise Previous Sets
```
User adds exercise
  → useWorkoutForm.addExercise(exercise)
  → async: WorkoutService.getLastSetsForExercise(userId, exerciseLibraryId, preferredUnit)
  → stored in previousSetsMap[exerciseLibraryId]
  → SetLogger reads map to show ghost placeholder values
```

## Database Schema (Supabase — no migration files tracked in repo; apply via MCP)
| Table | Key Columns |
|-------|-------------|
| `profiles` | `id` (FK auth.users), `first_name`, `last_name`, `avatar_url`, `weight_unit` (KG\|LB enum), `theme_preference` ('system'\|'light'\|'dark'), `updated_at` |
| `workouts` | `id`, `user_id`, `name`, `notes`, `created_at` |
| `workout_exercises` | `id`, `user_id`, `workout_id`, `exercise_library_id`, `notes` |
| `sets` | `id`, `user_id`, `workout_exercises_id`, `weight`, `reps`, `set_number` |
| `exercise_library` | `id`, `name`, `primary_muscle_group`, `description`, `image_url`, `video_url`, `is_public`, `created_by` |

Note: `weight_unit` enum is `UNIT_TYPE` with values `"KG"` and `"LB"` (uppercase). All weights stored in DB as entered (not normalized to kg).

## Local vs Persisted IDs
- In-progress workout uses `local-XXXXXXX` IDs (from `generateLocalId()`)
- These are replaced by DB-generated UUIDs on save
- Never send `local_id` values to Supabase

## Theming System
- `ThemeContext` (`src/contexts/ThemeContext.tsx`) holds `themePreference` ('system'|'light'|'dark') and derived `colorScheme` ('light'|'dark')
- Preference persisted in AsyncStorage (`@app:theme`) AND in `profiles.theme_preference` in Supabase
- On login, `ProfileThemeSyncer` (in root `_layout.tsx`) reads `profile.theme_preference` and calls `setThemePreference` once to override AsyncStorage
- When user changes theme in Settings: `setThemePreference` (AsyncStorage) + Supabase update + `setProfile` all called together
- Screens use `useAppTheme()` and build an inline `c` color map: `const c = { pageBg: isDark ? '#1c1c1e' : '#f2f2f7', ... }`
- `ThemedText` / `ThemedView` use `useThemeColor` hook which reads `Colors[colorScheme][key]` from `src/constants/theme.ts`
- **Do not hardcode `backgroundColor: 'white'` or `color: '#333'`** — always use `c.xxx` or theme constants

## Settings Screen Sections
`src/app/(app)/settings.tsx`:
- **Profile card**: avatar (expo-image-picker → Supabase Storage `avatars` bucket), display name, "Edit Profile" → `/profile`
- **Preferences card**: KG/LB toggle → `profiles.weight_unit`
- **Appearance card**: System/Light/Dark picker → `ThemeContext` + `profiles.theme_preference`
- **Data Management card**: CSV import modal (`CsvImporter` component)
- **Account card**: Sign Out button

## Incomplete Features
- **Templates:** Screen renders list, "Start Workout" shows alert stub — loading template into `useWorkoutForm` not built
- **No offline support:** All operations require Supabase connectivity

## Animation
- `ExerciseLogger` uses `react-native-reanimated` v4 spring animation on mount
- No screen transition configuration beyond modal presentations
- Must use `babel-preset-expo` Babel plugin for reanimated to work
