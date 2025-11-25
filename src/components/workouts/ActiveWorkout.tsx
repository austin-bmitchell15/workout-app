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
import { saveWorkout } from '@/services/WorkoutService';
import { generateLocalId } from '@/utils/helpers';

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
    if (!session?.user) return;
    setIsSaving(true);
    
    const user = session.user;

    try {
      await saveWorkout(workout, user.id, preferredUnit)
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
