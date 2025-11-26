import React from 'react';
import { View, Text, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import ExerciseLogger from './ExerciseLogger';
import ExercisePickerModal from './ExercisePickerModal';
import StyledButton from '../common/StyledButton';
import { useWorkoutForm } from '@/hooks/useWorkoutForm';
import StyledTextInput from '@/components/common/StyledTextInput';
import { ThemedView } from '@/components/themed-view';

export default function ActiveWorkout() {
  const {
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
    generateLocalId,
  } = useWorkoutForm();

  if (isSaving) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
        <Text style={styles.loadingText}>Saving Workout...</Text>
      </View>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <StyledTextInput
        style={styles.input}
        value={workout.name}
        onChangeText={text => updateWorkoutField('name', text)}
        placeholder="Workout Name"
      />
      <StyledTextInput
        style={[styles.input, styles.textArea]}
        value={workout.notes}
        onChangeText={text => updateWorkoutField('notes', text)}
        placeholder="Workout Notes"
        multiline
      />

      <View style={styles.exerciseList}>
        {workout.exercises.map(ex => (
          <ExerciseLogger
            key={ex.local_id}
            exercise={ex}
            onChange={updateExercise}
            onRemove={removeExercise}
            generateLocalId={generateLocalId}
            preferredUnit={preferredUnit}
          />
        ))}
      </View>

      <StyledButton
        title="+ Add Exercise"
        onPress={() => setPickerVisible(true)}
      />
      <StyledButton
        title="Finish Workout"
        onPress={finishWorkout}
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
                onPress: resetWorkout,
              },
            ],
          );
        }}
        type="danger"
        style={{ marginTop: 10 }}
      />

      <ExercisePickerModal
        visible={isPickerVisible}
        onClose={() => setPickerVisible(false)}
        onExerciseSelect={addExercise}
      />
    </ThemedView>
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
