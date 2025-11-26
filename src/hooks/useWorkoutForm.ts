import { useState } from 'react';
import { Alert } from 'react-native';
import {
  LocalWorkout,
  LocalExercise,
  FullWorkoutSubmission,
  ExerciseLibraryItem,
} from '@/types/types';
import { useAuth } from '@/app/_layout';
import { saveWorkout } from '@/services/WorkoutService';

// Helper for ID generation
const generateLocalId = () =>
  `local-${Math.random().toString(36).substring(2, 9)}`;

const newWorkoutTemplate: LocalWorkout = {
  name: 'New Workout',
  notes: '',
  exercises: [],
};

export function useWorkoutForm() {
  const { session, profile } = useAuth();
  const [workout, setWorkout] = useState<LocalWorkout>(newWorkoutTemplate);
  const [isSaving, setIsSaving] = useState(false);
  const [isPickerVisible, setPickerVisible] = useState(false);

  const preferredUnit = profile?.weight_unit ?? null;

  // --- Actions ---

  const updateWorkoutField = (field: keyof LocalWorkout, value: string) => {
    setWorkout(prev => ({ ...prev, [field]: value }));
  };

  const addExercise = (exerciseFromLibrary: ExerciseLibraryItem) => {
    const newExercise: LocalExercise = {
      local_id: generateLocalId(),
      exercise_library_id: exerciseFromLibrary.id,
      name: exerciseFromLibrary.name,
      image_url: exerciseFromLibrary.image_url,
      notes: '',
      sets: [
        { local_id: generateLocalId(), reps: '', weight: '', set_number: 1 },
      ],
    };

    setWorkout(prev => ({
      ...prev,
      exercises: [...prev.exercises, newExercise],
    }));
    setPickerVisible(false);
  };

  const removeExercise = (localId: string) => {
    setWorkout(prev => ({
      ...prev,
      exercises: prev.exercises.filter(ex => ex.local_id !== localId),
    }));
  };

  const updateExercise = (updatedExercise: LocalExercise) => {
    setWorkout(prev => ({
      ...prev,
      exercises: prev.exercises.map(ex =>
        ex.local_id === updatedExercise.local_id ? updatedExercise : ex,
      ),
    }));
  };

  const resetWorkout = () => {
    setWorkout(newWorkoutTemplate);
  };

  const prepareSubmission = (
    currentWorkout: LocalWorkout,
    userId: string,
  ): FullWorkoutSubmission => {
    // Transform UI Exercises -> Supabase Exercises
    const strictExercises = currentWorkout.exercises.map(ex => {
      // Transform UI Sets -> Supabase Sets
      const strictSets = ex.sets.map(s => ({
        set_number: s.set_number,
        reps: Number(s.reps) || 0,
        weight:
          preferredUnit === 'LB'
            ? (Number(s.weight) || 0) / 2.20462
            : Number(s.weight) || 0,
        user_id: userId,
        // workout_exercises_id is added in the service layer
      }));

      return {
        data: {
          exercise_library_id: ex.exercise_library_id,
          notes: ex.notes,
          user_id: userId,
          // workout_id is added in the service layer
        },
        sets: strictSets,
      };
    });

    return {
      workout: {
        name: currentWorkout.name || 'Untitled Workout',
        notes: currentWorkout.notes,
        user_id: userId,
      },
      exercises: strictExercises,
    };
  };

  const finishWorkout = async () => {
    if (!session?.user) {
      Alert.alert('Error', 'You must be logged in to save a workout.');
      return;
    }
    if (workout.exercises.length === 0) {
      Alert.alert('Empty Workout', 'Add at least one exercise to save.');
      return;
    }

    setIsSaving(true);
    try {
      const submission = prepareSubmission(workout, session.user.id);
      await saveWorkout(submission);
      Alert.alert('Success!', 'Workout saved.');
      resetWorkout();
    } catch (error) {
      console.error('Error saving workout:', error);
      if (error instanceof Error) {
        Alert.alert('Error', `Failed to save workout: ${error.message}`);
      }
    } finally {
      setIsSaving(false);
    }
  };

  return {
    workout,
    isSaving,
    isPickerVisible,
    preferredUnit,
    setPickerVisible,
    updateWorkoutField,
    addExercise,
    removeExercise,
    updateExercise,
    finishWorkout,
    resetWorkout,
    generateLocalId, // Exposed for ExerciseLogger if needed, or better, move to utils
  };
}
