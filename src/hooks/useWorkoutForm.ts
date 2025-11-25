import { useState } from 'react';
import { Alert } from 'react-native';
import { LocalWorkout, LocalExercise } from '@/components/types';
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

  const preferredUnit = profile?.preferred_unit || 'kg';

  // --- Actions ---

  const updateWorkoutField = (field: keyof LocalWorkout, value: string) => {
    setWorkout(prev => ({ ...prev, [field]: value }));
  };

  const addExercise = (exerciseFromLibrary: {
    id: string;
    name: string;
    image_url?: string;
  }) => {
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
      await saveWorkout(workout, session.user.id, preferredUnit);
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
