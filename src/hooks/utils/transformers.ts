import { FullWorkoutSubmission } from '@/types/api';
import { WeightEnums } from '@/types/schema';
import { LocalWorkout } from '@/types/types';

export const transformWorkoutForSubmission = (
  workout: LocalWorkout,
  userId: string,
  preferredUnit: WeightEnums,
): FullWorkoutSubmission => {
  const strictExercises = workout.exercises.map(ex => {
    const strictSets = ex.sets.map(s => ({
      set_number: s.set_number,
      reps: Number(s.reps) || 0,
      weight:
        preferredUnit === 'LB'
          ? (Number(s.weight) || 0) / 2.20462
          : Number(s.weight) || 0,
      user_id: userId,
    }));

    return {
      data: {
        exercise_library_id: ex.exercise_library_id,
        notes: ex.notes,
        user_id: userId,
      },
      sets: strictSets,
    };
  });

  return {
    workout: {
      name: workout.name || 'Untitled Workout',
      notes: workout.notes,
      user_id: userId,
    },
    exercises: strictExercises,
  };
};
