import { supabase } from './supabase';
import { FullWorkoutSubmission } from '@/types/types';

export const saveWorkout = async (submission: FullWorkoutSubmission) => {
  // 1. Create Workout
  const { data: workoutData, error: workoutError } = await supabase
    .from('workouts')
    .insert(submission.workout)
    .select()
    .single();

  if (workoutError) throw workoutError;

  // 2. Process Exercises
  for (const ex of submission.exercises) {
    const { data: woExerciseData, error: woExerciseError } = await supabase
      .from('workout_exercises')
      .insert({ ...ex.data, workout_id: workoutData.id })
      .select()
      .single();

    if (woExerciseError) throw woExerciseError;

    // 3. Process Sets
    // NO LOGIC HERE: Just map the IDs and insert.
    const setsToInsert = ex.sets.map(s => ({
      ...s,
      workout_exercises_id: woExerciseData.id,
      // We assume s.weight and s.reps are already numbers/converted
    }));

    if (setsToInsert.length > 0) {
      const { error: setsError } = await supabase
        .from('sets')
        .insert(setsToInsert);
      if (setsError) throw setsError;
    }
  }

  return workoutData;
};

export const getWorkoutHistory = async (userId: string) => {
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

  if (error) throw error;
  return data;
};
