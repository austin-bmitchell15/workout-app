import React, { useState, useRef } from 'react'; // Import useRef
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useAuth } from '../../app/_layout'; // Use our auth hook
import { supabase } from '../../services/supabase';
import { LocalWorkout, LocalExercise } from '../types';
import ExerciseLogger from './ExerciseLogger';
import ExercisePickerModal from './ExercisePickerModal';
import StyledButton from '../common/StyledButton'; // A better-looking button
import { BottomSheetModal } from '@gorhom/bottom-sheet'; // Import BottomSheetModal type

// Helper to generate temporary IDs for React keys
const generateLocalId = () =>
  `local-${Math.random().toString(36).substring(2, 9)}`;
const KG_TO_LBS = 2.20462;

const newWorkoutTemplate: LocalWorkout = {
  name: 'New Workout',
  notes: '',
  exercises: [],
};

export default function ActiveWorkout() {
  const { session, profile } = useAuth(); // Get profile
  const [workout, setWorkout] = useState<LocalWorkout>(newWorkoutTemplate);
  // const [isPickerOpen, setIsPickerOpen] = useState(false); // REMOVE THIS
  const [isSaving, setIsSaving] = useState(false);

  // ADD THIS REF
  const exercisePickerModalRef = useRef<BottomSheetModal>(null);

  const preferredUnit = profile?.preferred_unit || 'kg';

  // --- Main Save Logic (Phase 2, Step 4) ---
  const handleFinishWorkout = async () => {
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
      // 1. Insert into `workouts`
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

      // 2. Loop and insert `workout_exercises`
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

        // 3. Loop and insert `sets`
        const setsToInsert = ex.sets.map(s => {
          const rawWeight = Number(s.weight) || 0;

          // --- CONVERSION LOGIC ---
          // Convert to KG before saving if user preference is LBS
          const weightInKg =
            preferredUnit === 'lbs' ? rawWeight / KG_TO_LBS : rawWeight;

          return {
            user_id: user.id,
            workout_exercise_id: newWorkoutExerciseId,
            reps: Number(s.reps) || 0,
            weight: weightInKg, // Always save in KG
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

      // 4. Clear the local state
      Alert.alert('Success!', 'Workout saved.');
      setWorkout(newWorkoutTemplate);
      // TODO: Navigate to history tab
    } catch (error) {
      console.error('Error saving workout:', error);
      if (error instanceof Error) {
        Alert.alert('Error', `Failed to save workout: ${error.message}`);
      }
    } finally {
      setIsSaving(false);
    }
  };

  // --- Local State Management ---

  // Called from the modal when an exercise is picked
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
    // setIsPickerOpen(false); // REMOVE THIS
    exercisePickerModalRef.current?.dismiss(); // CLOSE THE NEW MODAL
  };

  // Called from the ExerciseLogger
  const handleRemoveExercise = (localId: string) => {
    setWorkout(prev => ({
      ...prev,
      exercises: prev.exercises.filter(ex => ex.local_id !== localId),
    }));
  };

  // Generic handler to update any part of the workout state
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
      <TextInput
        style={styles.input}
        value={workout.name}
        onChangeText={text => setWorkout(prev => ({ ...prev, name: text }))}
        placeholder="Workout Name"
        placeholderTextColor="#888"
      />
      <TextInput
        style={[styles.input, styles.textArea]}
        value={workout.notes}
        onChangeText={text => setWorkout(prev => ({ ...prev, notes: text }))}
        placeholder="Workout Notes"
        placeholderTextColor="#888"
        multiline
      />

      {/* Exercise List */}
      <View style={styles.exerciseList}>
        {workout.exercises.map(ex => (
          <ExerciseLogger
            key={ex.local_id}
            exercise={ex}
            onChange={handleExerciseChange}
            onRemove={handleRemoveExercise}
            generateLocalId={generateLocalId} // Pass helper
            preferredUnit={preferredUnit} // Pass unit preference down
          />
        ))}
      </View>

      {/* Action Buttons */}
      <StyledButton
        title="+ Add Exercise"
        onPress={() => exercisePickerModalRef.current?.present()} // CHANGE THIS
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

      {/* The Modal */}
      <ExercisePickerModal
        ref={exercisePickerModalRef} // CHANGE THIS
        onExerciseSelect={handleAddExercise} // CHANGE THIS
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 15,
  },
  input: {
    height: 50,
    borderColor: '#ccc',
    borderWidth: 1,
    marginBottom: 15,
    paddingHorizontal: 15,
    borderRadius: 8,
    backgroundColor: 'white',
    fontSize: 16,
    color: '#000',
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
