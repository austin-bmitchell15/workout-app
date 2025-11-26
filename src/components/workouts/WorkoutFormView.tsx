import React, { useCallback } from 'react';
import {
  StyleSheet,
  ActivityIndicator,
  FlatList,
  ListRenderItem,
} from 'react-native';
import ExerciseLogger from './ExerciseLogger';
import ExercisePickerModal from './ExercisePickerModal';
import { ThemedView } from '@/components/themed-view';
import { ThemedText } from '@/components/themed-text';
import { useThemeColor } from '@/hooks/theme/use-theme-color';
import { LocalWorkout, LocalExercise } from '@/types/types';
import { ExerciseLibraryItem, WeightEnums } from '@/types/schema';
import { WorkoutHeader } from './WorkoutHeader';
import { WorkoutFooter } from './WorkoutFooter';

// --- Props Interface ---
type WorkoutFormViewProps = {
  workout: LocalWorkout;
  isSaving: boolean;
  isPickerVisible: boolean;
  preferredUnit: WeightEnums;
  onPickerClose: () => void;
  onPickerSelect: (item: ExerciseLibraryItem) => void;
  onPickerOpen: () => void;
  onWorkoutNameChange: (text: string) => void;
  onWorkoutNotesChange: (text: string) => void;
  onExerciseChange: (exercise: LocalExercise) => void;
  onExerciseRemove: (id: string) => void;
  onFinish: () => void;
  onCancel: () => void;
};

export default function WorkoutFormView({
  workout,
  isSaving,
  isPickerVisible,
  preferredUnit,
  onPickerClose,
  onPickerSelect,
  onPickerOpen,
  onWorkoutNameChange,
  onWorkoutNotesChange,
  onExerciseChange,
  onExerciseRemove,
  onFinish,
  onCancel,
}: WorkoutFormViewProps) {
  const tintColor = useThemeColor({}, 'tint');

  const renderExercise: ListRenderItem<LocalExercise> = useCallback(
    ({ item }) => (
      <ExerciseLogger
        exercise={item}
        onChange={onExerciseChange}
        onRemove={onExerciseRemove}
        preferredUnit={preferredUnit}
      />
    ),
    [onExerciseChange, onExerciseRemove, preferredUnit],
  );

  if (isSaving) {
    return (
      <ThemedView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={tintColor} />
        <ThemedText style={styles.loadingText}>Saving Workout...</ThemedText>
      </ThemedView>
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
            onNameChange={onWorkoutNameChange}
            onNotesChange={onWorkoutNotesChange}
          />
        }
        ListFooterComponent={
          <WorkoutFooter
            onAdd={onPickerOpen}
            onFinish={onFinish}
            onCancel={onCancel}
            isSaving={isSaving}
          />
        }
        contentContainerStyle={styles.contentContainer}
        keyboardShouldPersistTaps="handled"
        initialNumToRender={5}
      />

      <ExercisePickerModal
        visible={isPickerVisible}
        onClose={onPickerClose}
        onExerciseSelect={onPickerSelect}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  contentContainer: { padding: 15, paddingBottom: 50 },
  input: { marginBottom: 15 },
  textArea: { height: 80, textAlignVertical: 'top', paddingTop: 15 },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: { marginTop: 10, fontSize: 16 },
});
