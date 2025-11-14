// This file defines the shapes of our local, in-progress workout data.
// These are different from our database types, as they include temporary local IDs.

export interface LocalSet {
  local_id: string;
  reps: string;
  weight: string;
  set_number: number;
}

export interface LocalExercise {
  local_id: string; // For React key
  exercise_library_id: string; // From DB
  name: string; // For display
  image_url?: string; // For display
  notes: string;
  sets: LocalSet[];
}

export interface LocalWorkout {
  name: string;
  notes: string;
  exercises: LocalExercise[];
}

// This will be the type for an item from our database
export interface ExerciseLibraryItem {
  id: string;
  name: string;
  image_url?: string;
  // ... other fields if needed
}

// --- DATABASE TYPES ---
// Types for data coming FROM Supabase

// A single record from the 'profiles' table
export type Profile = {
  id: string;
  username: string | null;
  preferred_unit: 'kg' | 'lbs';
};

// A single record from the 'workouts' table
export type WorkoutRecord = {
  id: string;
  user_id: string;
  name: string;
  notes: string | null;
  created_at: string;
};

// A single record from the 'workout_templates' table
// As per our plan, this will be similar to WorkoutRecord
export type TemplateRecord = {
  id: string;
  user_id: string;
  name: string;
  // ... other template fields
};

// This is the complex type for a FULL workout history item,
// based on the query from Phase 3 of our plan.
export type FullWorkout = WorkoutRecord & {
  workout_exercises: {
    id: string;
    notes: string | null;
    exercise_library: {
      id: string;
      name: string;
      image_url: string | null;
    };
    sets: {
      id: string;
      reps: number;
      weight: number;
      set_number: number;
    }[];
  }[];
};
