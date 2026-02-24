import { Tables } from './supabase';
import {
  ExerciseInsert,
  ExerciseRecord,
  SetInsert,
  SetRecord,
  WorkoutInsert,
  WorkoutRecord,
} from './schema';

export type SetSubmission = Omit<SetInsert, 'id' | 'workout_exercises_id'>;
export interface ExerciseSubmission {
  data: Omit<ExerciseInsert, 'id' | 'workout_id'>;
  sets: SetSubmission[];
}

export interface FullWorkoutSubmission {
  workout: WorkoutInsert;
  exercises: ExerciseSubmission[];
}

export type FullWorkoutHistory = Omit<WorkoutRecord, 'user_id'> & {
  workout_exercises: (Omit<
    ExerciseRecord,
    'user_id' | 'exercise_library_id' | 'workout_id'
  > & {
    exercise_library: Pick<
      Tables<'exercise_library'>,
      'name' | 'image_url'
    > | null;
    sets: Omit<SetRecord, 'user_id' | 'workout_exercises_id'>[];
  })[];
};
