# Architecture

## Directory Layout
```
src/
├── app/                    # expo-router pages (file = route)
│   ├── _layout.tsx         # Root: AuthContext, auth guard, GestureHandler, BottomSheetModalProvider
│   ├── index.tsx           # Redirects → /(app)
│   ├── (auth)/             # Unprotected: login, sign-up
│   └── (app)/              # Protected: dashboard, log-workout, history, templates, profile, settings
├── components/
│   ├── types.ts            # ALL shared TypeScript interfaces
│   ├── workouts/           # Workout feature components
│   ├── common/             # Reusable UI (StyledButton, StyledTextInput)
│   ├── themed-text.tsx     # Theme-aware Text
│   └── themed-view.tsx     # Theme-aware View
├── hooks/
│   ├── useWorkoutForm.ts   # Workout state (main domain hook)
│   └── theme/              # Color scheme + theme color hooks
├── services/
│   ├── supabase.ts         # Supabase client singleton
│   ├── AuthService.ts      # signInWithEmail, signUpWithEmail
│   └── WorkoutService.ts   # getLastSetsForExercise, saveWorkout
├── constants/
│   └── theme.ts            # Colors (light/dark), Fonts
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
- Listens to `supabase.auth.onAuthStateChange`
- Fetches `profiles` row after login to get `preferred_unit`
- If no session → redirects to `/(auth)/login`
- If session → redirects to `/(app)`
- Exposes `AuthContext` / `useAuth()` → `{ session, profile }`

## State Management
| State | Location | Pattern |
|-------|----------|---------|
| Auth session + profile | `AuthContext` in root `_layout.tsx` | React Context |
| Workout form state | `useWorkoutForm` hook | Local hook state |
| Theme | `useColorScheme` + `useThemeColor` | Platform hook |

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

## Database Schema (Supabase — no migration files in repo)
| Table | Key Columns |
|-------|-------------|
| `profiles` | `id` (FK auth.users), `username`, `preferred_unit` (kg\|lbs) |
| `workouts` | `id`, `user_id`, `name`, `notes`, `created_at` |
| `workout_exercises` | `id`, `user_id`, `workout_id`, `exercise_library_id`, `notes` |
| `sets` | `id`, `user_id`, `workout_exercise_id`, `weight`, `reps`, `set_number` |
| `exercise_library` | `id`, `name`, `image_url`, `is_public`, `created_by` |
| `workout_templates` | `id`, `user_id`, `name`, `created_at` |

## Local vs Persisted IDs
- In-progress workout uses `local-XXXXXXX` IDs (from `generateLocalId()`)
- These are replaced by DB-generated UUIDs on save
- Never send `local_id` values to Supabase

## Incomplete Features
- **Templates:** Screen exists, "Start Workout" shows alert stub — template → form population not built
- **Profile Edit:** "Edit Username" shows "Not Implemented" alert
- **No offline support:** All operations require Supabase connectivity

## Animation
- `ExerciseLogger` uses `react-native-reanimated` v4 spring animation on mount
- No screen transition configuration beyond modal presentations
- Must use `babel-preset-expo` Babel plugin for reanimated to work
