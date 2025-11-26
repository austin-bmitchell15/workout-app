import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { LocalExercise, LocalSet, WeightEnums } from '@/types/types';
import { FontAwesome } from '@expo/vector-icons';
import SetLogger from './SetLogger';
import StyledTextInput from '@/components/common/StyledTextInput';
import { ThemedView } from '@/components/themed-view';
import { ThemedText } from '@/components/themed-text';
import { useThemeColor } from '@/hooks/theme/use-theme-color';

type ExerciseLoggerProps = {
  exercise: LocalExercise;
  onChange: (exercise: LocalExercise) => void;
  onRemove: (localId: string) => void;
  generateLocalId: () => string;
  preferredUnit: WeightEnums;
};

export default function ExerciseLogger({
  exercise,
  onChange,
  onRemove,
  generateLocalId,
  preferredUnit,
}: ExerciseLoggerProps) {
  const borderColor = useThemeColor({}, 'border');
  const buttonBg = useThemeColor(
    { light: '#e9ecef', dark: '#2C3036' },
    'background',
  );

  const handleSetChange = (updatedSet: LocalSet) => {
    const newSets = exercise.sets.map(s =>
      s.local_id === updatedSet.local_id ? updatedSet : s,
    );
    onChange({ ...exercise, sets: newSets });
  };

  const handleRemoveSet = (localSetId: string) => {
    const newSets = exercise.sets.filter(s => s.local_id !== localSetId);
    onChange({ ...exercise, sets: newSets });
  };

  const handleAddSet = () => {
    const newSet: LocalSet = {
      local_id: generateLocalId(),
      reps: '',
      weight: '',
      set_number: exercise.sets.length + 1,
    };

    const lastSet = exercise.sets[exercise.sets.length - 1];
    if (lastSet) {
      newSet.reps = lastSet.reps;
      newSet.weight = lastSet.weight;
    }
    onChange({ ...exercise, sets: [...exercise.sets, newSet] });
  };

  return (
    <ThemedView style={[styles.container, { borderColor }]}>
      <View style={styles.header}>
        <ThemedText type="subtitle">{exercise.name}</ThemedText>
        <TouchableOpacity
          onPress={() => onRemove(exercise.local_id)}
          testID="remove-exercise-btn">
          <FontAwesome name="trash" size={20} color="#dc3545" />
        </TouchableOpacity>
      </View>

      <StyledTextInput
        style={styles.notesInput}
        placeholder="Notes"
        value={exercise.notes}
        onChangeText={text => onChange({ ...exercise, notes: text })}
        multiline
      />

      {/* Set Headers */}
      <View style={styles.setRow}>
        <ThemedText style={[styles.setHeader, styles.setCol]}>Set</ThemedText>
        <ThemedText style={[styles.setHeader, styles.weightCol]}>
          Weight ({preferredUnit})
        </ThemedText>
        <ThemedText style={[styles.setHeader, styles.repsCol]}>Reps</ThemedText>
        <View style={styles.removeCol} />
      </View>

      {/* Sets List */}
      {exercise.sets.map(set => (
        <SetLogger
          key={set.local_id}
          set={set}
          onChange={handleSetChange}
          onRemove={handleRemoveSet}
          unitLabel={preferredUnit}
        />
      ))}

      <TouchableOpacity
        style={[styles.addSetButton, { backgroundColor: buttonBg }]}
        onPress={handleAddSet}
        testID="add-set-btn">
        <ThemedText type="link" style={styles.addSetButtonText}>
          + Add Set
        </ThemedText>
      </TouchableOpacity>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 8,
    padding: 15,
    marginBottom: 15,
    borderWidth: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  notesInput: {
    borderRadius: 5,
    padding: 10,
    fontSize: 14,
    marginBottom: 15,
    height: 40,
  },
  setRow: {
    flexDirection: 'row',
    marginBottom: 5,
  },
  setHeader: {
    fontSize: 14,
    fontWeight: 'bold',
    opacity: 0.7,
  },
  setCol: {
    flex: 1.5,
    textAlign: 'center',
  },
  weightCol: {
    flex: 2,
    textAlign: 'center',
  },
  repsCol: {
    flex: 2,
    textAlign: 'center',
  },
  removeCol: {
    flex: 1,
  },
  addSetButton: {
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 10,
  },
  addSetButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
});
