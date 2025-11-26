import React, { useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
  ActivityIndicator,
  FlatList,
  ListRenderItem,
} from 'react-native';
import ExerciseLogger from './ExerciseLogger';
import ExercisePickerModal from './ExercisePickerModal';
import StyledButton from '../common/StyledButton';
import { useWorkoutForm } from '@/hooks/useWorkoutForm';
import { ThemedView } from '@/components/themed-view';
import { LocalExercise } from '@/types/types';
import { WorkoutHeader } from './WorkoutHeader';

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
  } = useWorkoutForm();

  // 1. The Exercise Card
  const renderExercise: ListRenderItem<LocalExercise> = useCallback(
    ({ item }) => (
      <ExerciseLogger
        exercise={item}
        onChange={updateExercise}
        onRemove={removeExercise}
        preferredUnit={preferredUnit}
      />
    ),
    [updateExercise, removeExercise, preferredUnit],
  );

  // 3. Footer Component (Action Buttons)
  const renderFooter = () => (
    <View style={styles.footerContainer}>
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
    </View>
  );

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
      <FlatList
        data={workout.exercises}
        renderItem={renderExercise}
        keyExtractor={item => item.local_id}
        ListHeaderComponent={
          <WorkoutHeader
            name={workout.name}
            notes={workout.notes}
            onNameChange={t => updateWorkoutField('name', t)}
            onNotesChange={t => updateWorkoutField('notes', t)}
          />
        }
        ListFooterComponent={renderFooter}
        contentContainerStyle={styles.contentContainer}
        keyboardShouldPersistTaps="handled"
        initialNumToRender={5}
        maxToRenderPerBatch={5}
        windowSize={10}
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
    flex: 1,
  },
  contentContainer: {
    padding: 15,
    paddingBottom: 50,
  },
  headerContainer: {
    marginBottom: 10,
  },
  footerContainer: {
    marginTop: 10,
    marginBottom: 20,
  },
  input: {
    marginBottom: 15,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
    paddingTop: 15,
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
