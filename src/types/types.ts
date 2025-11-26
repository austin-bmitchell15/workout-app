import { fetchExerciseLibrary } from '@/services/ExerciseService';
import { Database } from '@/types/supabase';

// Helper to access table types easily
export type Tables<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Row'];
export type Enums<T extends keyof Database['public']['Enums']> =
  Database['public']['Enums'][T];
export type InsertTables<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Insert'];

// --- UI STATE (Loose types for forms) ---
// These remain separate because input fields handle strings (e.g., "10." is valid while typing)
export interface LocalSet {
  local_id: string;
  reps: string;
  weight: string;
  set_number: number;
}

export interface LocalExercise {
  local_id: string;
  exercise_library_id: string;
  name: string;
  image_url: string | null;
  notes: string;
  sets: LocalSet[];
}

export interface LocalWorkout {
  name: string;
  notes: string;
  exercises: LocalExercise[];
}

// --- DATABASE TYPES (Strict types from Supabase) ---

export type Profile = Tables<'profiles'>;
export type WorkoutRecord = Tables<'workouts'>;
export type ExerciseRecord = Tables<'workout_exercises'>;
export type WeightEnums = Enums<'UNIT_TYPE'> | null;

export type ExerciseLibrary = Awaited<
  ReturnType<typeof fetchExerciseLibrary>
>['data'];
export type ExerciseLibraryItem = NonNullable<ExerciseLibrary>[number];

// Alias for Template Record
// NOTE: Since 'workout_templates' is missing from your generated types,
// we define a manual interface or use 'any' temporarily.
export interface TemplateRecord {
  id: string;
  user_id: string;
  name: string;
  created_at: string;
  // Add other fields if you have them
}

// --- STRICT SUBMISSION TYPES ---

export type WorkoutInsert = InsertTables<'workouts'>;
export type ExerciseInsert = InsertTables<'workout_exercises'>;
export type SetInsert = InsertTables<'sets'>;

export type SetSubmission = Omit<SetInsert, 'id' | 'workout_exercises_id'>;
export interface ExerciseSubmission {
  data: Omit<ExerciseInsert, 'id' | 'workout_id'>;
  sets: SetSubmission[];
}

export interface FullWorkoutSubmission {
  workout: WorkoutInsert;
  exercises: ExerciseSubmission[];
}

export type FullWorkoutHistory = WorkoutRecord & {
  workout_exercises: ExerciseRecord &
    {
      exercise: Pick<Tables<'exercise_library'>, 'name' | 'image_url'> | null;
      sets: Tables<'sets'>[];
    }[];
};
