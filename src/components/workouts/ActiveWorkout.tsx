import React, { useState } from 'react'; // removed useRef
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useAuth } from '../../app/_layout';
import { supabase } from '../../services/supabase';
import { LocalWorkout, LocalExercise } from '../types';
import ExerciseLogger from './ExerciseLogger';
import ExercisePickerModal from './ExercisePickerModal';
import StyledButton from '../common/StyledButton';
import StyledTextInput from '../common/StyledTextInput';

// Helper to generate temporary IDs
const generateLocalId = () =>
  `local-${Math.random().toString(36).substring(2, 9)}`;
const KG_TO_LBS = 2.20462;

const newWorkoutTemplate: LocalWorkout = {
  name: 'New Workout',
  notes: '',
  exercises: [],
};

export default function ActiveWorkout() {
  const { session, profile } = useAuth();
  const [workout, setWorkout] = useState<LocalWorkout>(newWorkoutTemplate);
  const [isSaving, setIsSaving] = useState(false);

  // 1. Re-introduce the simple state variable
  const [isPickerVisible, setPickerVisible] = useState(false);

  const preferredUnit = profile?.preferred_unit || 'kg';

  const handleFinishWorkout = async () => {
    // ... (Keep existing save logic unchanged) ...
    if (!session?.user) {
      Alert.alert('Error', 'You must be logged in to save a workout.');
      return;
    }
    if (workout.exercises.length === 0) {
      Alert.alert('Empty Workout', 'Add at least one exercise to save.');
      return;
    }

    setIsSaving(true);
    const user = session.user;

    try {
      const { data: workoutData, error: workoutError } = await supabase
        .from('workouts')
        .insert({
          name: workout.name,
          notes: workout.notes,
          user_id: user.id,
        })
        .select()
        .single();

      if (workoutError) throw workoutError;
      const newWorkoutId = workoutData.id;

      for (const ex of workout.exercises) {
        const { data: woExerciseData, error: woExerciseError } = await supabase
          .from('workout_exercises')
          .insert({
            user_id: user.id,
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
          const weightInKg =
            preferredUnit === 'lbs' ? rawWeight / KG_TO_LBS : rawWeight;

          return {
            user_id: user.id,
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

      Alert.alert('Success!', 'Workout saved.');
      setWorkout(newWorkoutTemplate);
    } catch (error) {
      console.error('Error saving workout:', error);
      if (error instanceof Error) {
        Alert.alert('Error', `Failed to save workout: ${error.message}`);
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddExercise = (exerciseFromLibrary: {
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

    // 2. Close the modal using state
    setPickerVisible(false);
  };

  const handleRemoveExercise = (localId: string) => {
    setWorkout(prev => ({
      ...prev,
      exercises: prev.exercises.filter(ex => ex.local_id !== localId),
    }));
  };

  const handleExerciseChange = (updatedExercise: LocalExercise) => {
    setWorkout(prev => ({
      ...prev,
      exercises: prev.exercises.map(ex =>
        ex.local_id === updatedExercise.local_id ? updatedExercise : ex,
      ),
    }));
  };

  if (isSaving) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
        <Text style={styles.loadingText}>Saving Workout...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StyledTextInput
        style={styles.input}
        value={workout.name}
        onChangeText={text => setWorkout(prev => ({ ...prev, name: text }))}
        placeholder="Workout Name"
        placeholderTextColor="#888"
      />
      <StyledTextInput
        style={[styles.input, styles.textArea]}
        value={workout.notes}
        onChangeText={text => setWorkout(prev => ({ ...prev, notes: text }))}
        placeholder="Workout Notes"
        multiline
      />

      <View style={styles.exerciseList}>
        {workout.exercises.map(ex => (
          <ExerciseLogger
            key={ex.local_id}
            exercise={ex}
            onChange={handleExerciseChange}
            onRemove={handleRemoveExercise}
            generateLocalId={generateLocalId}
            preferredUnit={preferredUnit}
          />
        ))}
      </View>

      {/* 3. Update Button to toggle state */}
      <StyledButton
        title="+ Add Exercise"
        onPress={() => setPickerVisible(true)}
      />
      <StyledButton
        title="Finish Workout"
        onPress={handleFinishWorkout}
        type="primary"
        style={{ marginTop: 10 }}
        disabled={isSaving}
      />
      <StyledButton
        title="Cancel Workout"
        onPress={() => {
          Alert.alert(
            'Cancel Workout?',
            'Are you sure you want to discard this workout?',
            [
              { text: 'No', style: 'cancel' },
              {
                text: 'Yes',
                style: 'destructive',
                onPress: () => setWorkout(newWorkoutTemplate),
              },
            ],
          );
        }}
        type="danger"
        style={{ marginTop: 10 }}
      />

      {/* 4. Pass standard props to the new Modal component */}
      <ExercisePickerModal
        visible={isPickerVisible}
        onClose={() => setPickerVisible(false)}
        onExerciseSelect={handleAddExercise}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 15,
  },
  input: {
    marginBottom: 15,
    backgroundColor: 'white',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
    paddingTop: 15,
  },
  exerciseList: {
    marginBottom: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
  },
});
