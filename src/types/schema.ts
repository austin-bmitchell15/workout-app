import { fetchExerciseLibrary } from '@/services/ExerciseService';
import { Database, Enums, Tables } from './supabase';

export type Profile = Tables<'profiles'>;
export type WorkoutRecord = Tables<'workouts'>;
export type ExerciseRecord = Tables<'workout_exercises'>;
export type SetRecord = Tables<'sets'>;
export type WeightEnums = Enums<'UNIT_TYPE'> | null;

export type ExerciseLibrary = Awaited<
  ReturnType<typeof fetchExerciseLibrary>
>['data'];
export type ExerciseLibraryItem = NonNullable<ExerciseLibrary>[number];

export interface TemplateRecord {
  id: string;
  user_id: string;
  name: string;
  created_at: string;
}

export type InsertTables<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Insert'];

export type WorkoutInsert = InsertTables<'workouts'>;
export type ExerciseInsert = InsertTables<'workout_exercises'>;
export type SetInsert = InsertTables<'sets'>;
