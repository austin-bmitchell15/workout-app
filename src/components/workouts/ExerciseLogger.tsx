import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
} from 'react-native';
import { LocalExercise, LocalSet } from '../types';
import { FontAwesome } from '@expo/vector-icons';
import SetLogger from './SetLogger'; // We'll create this next
import StyledTextInput from '../common/StyledTextInput';

type ExerciseLoggerProps = {
  exercise: LocalExercise;
  onChange: (exercise: LocalExercise) => void;
  onRemove: (localId: string) => void;
  generateLocalId: () => string;
  preferredUnit: 'kg' | 'lbs'; // New prop
};

export default function ExerciseLogger({
  exercise,
  onChange,
  onRemove,
  generateLocalId,
  preferredUnit, // Get unit preference
}: ExerciseLoggerProps) {
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
    // Pre-fill with last set's data if available
    const lastSet = exercise.sets[exercise.sets.length - 1];
    if (lastSet) {
      newSet.reps = lastSet.reps;
      newSet.weight = lastSet.weight;
    }
    onChange({ ...exercise, sets: [...exercise.sets, newSet] });
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.exerciseName}>{exercise.name}</Text>
        <TouchableOpacity onPress={() => onRemove(exercise.local_id)}>
          <FontAwesome name="trash" size={20} color="#dc3545" />
        </TouchableOpacity>
      </View>

      <StyledTextInput
        style={styles.notesInput}
        placeholder="Notes"
        placeholderTextColor="#888"
        value={exercise.notes}
        onChangeText={text => onChange({ ...exercise, notes: text })}
        multiline
      />

      {/* Set Headers */}
      <View style={styles.setRow}>
        <Text style={[styles.setHeader, styles.setCol]}>Set</Text>
        <Text style={[styles.setHeader, styles.weightCol]}>
          Weight ({preferredUnit}) {/* Display correct unit */}
        </Text>
        <Text style={[styles.setHeader, styles.repsCol]}>Reps</Text>
        <View style={styles.removeCol} />
      </View>

      {/* Sets List */}
      {exercise.sets.map((set, index) => (
        <SetLogger
          key={set.local_id}
          set={set}
          onChange={handleSetChange}
          onRemove={handleRemoveSet}
          unitLabel={preferredUnit} // Pass unit label
        />
      ))}

      <TouchableOpacity style={styles.addSetButton} onPress={handleAddSet}>
        <Text style={styles.addSetButtonText}>+ Add Set</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 15,
    marginBottom: 15,
    borderColor: '#ddd',
    borderWidth: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  exerciseName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  notesInput: {
    backgroundColor: '#f9f9f9',
    borderRadius: 5,
    padding: 10,
    fontSize: 14,
    marginBottom: 15,
    color: '#000',
  },
  setRow: {
    flexDirection: 'row',
    marginBottom: 5,
  },
  setHeader: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#555',
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
    backgroundColor: '#e9ecef',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 10,
  },
  addSetButtonText: {
    fontSize: 16,
    color: '#007bff',
    fontWeight: 'bold',
  },
});
