import { supabase } from './supabase';
import { LocalWorkout } from '../components/types';

const KG_TO_LBS = 2.20462;

export const saveWorkout = async (
  workout: LocalWorkout,
  userId: string,
  preferredUnit: 'kg' | 'lbs',
) => {
  // 1. Create the Workout Record
  const { data: workoutData, error: workoutError } = await supabase
    .from('workouts')
    .insert({
      name: workout.name,
      notes: workout.notes,
      user_id: userId,
    })
    .select()
    .single();

  if (workoutError) throw workoutError;

  // 2. Process Exercises and Sets
  const newWorkoutId = workoutData.id;

  for (const ex of workout.exercises) {
    const { data: woExerciseData, error: woExerciseError } = await supabase
      .from('workout_exercises')
      .insert({
        user_id: userId,
        workout_id: newWorkoutId,
        exercise_library_id: ex.exercise_library_id,
        notes: ex.notes,
      })
      .select()
      .single();

    if (woExerciseError) throw woExerciseError;

    const newWorkoutExerciseId = woExerciseData.id;

    const setsToInsert = ex.sets.map(s => {
      const rawWeight = Number(s.weight) || 0;
      // Always store in KG or normalize here
      const weightInKg =
        preferredUnit === 'lbs' ? rawWeight / KG_TO_LBS : rawWeight;

      return {
        user_id: userId,
        workout_exercise_id: newWorkoutExerciseId,
        reps: Number(s.reps) || 0,
        weight: weightInKg,
        set_number: s.set_number,
      };
    });

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
