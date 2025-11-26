import { supabase } from './supabase';
import { FullWorkoutSubmission } from '@/types/types';

export const saveWorkout = async (submission: FullWorkoutSubmission) => {
  try {
    const { data, error } = await supabase.rpc('save_full_workout', {
      workout_data: submission.workout as any,
      exercises_data: submission.exercises as any,
    });

    if (error) {
      console.error('Error in save_full_workout RPC:', error);
      return { data: null, error };
    }

    return { data, error: null };
  } catch (err) {
    return { data: null, error: err };
  }
};

export const getWorkoutHistory = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from('workouts')
      .select(
        `
        id,
        name,
        notes,
        created_at,
        workout_exercises (
          id,
          notes,
          exercise_library (
            id,
            name,
            image_url
          ),
          sets (
            id,
            reps,
            weight,
            set_number
          )
        )
      `,
      )
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching history:', error);
      return { data: null, error };
    }

    return { data, error: null };
  } catch (err) {
    return { data: null, error: err };
  }
};
