import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Alert,
  ActivityIndicator,
  TextInput,
} from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
// Change the import to use the legacy module if you want a quick fix,
// OR use the new API. Since `readAsStringAsync` is simple, the legacy import is the easiest drop-in replacement.
import * as FileSystem from 'expo-file-system/legacy';
import { Ionicons } from '@expo/vector-icons';
import {
  parseStrongCsv,
  batchSaveWorkouts,
  ImportableWorkout,
} from '@/services/ImportService';
import { ThemedText } from '../themed-text';
import StyledButton from '../common/StyledButton';

type CsvImporterProps = {
  userId: string;
  onImportComplete: () => void;
};

export default function CsvImporter({
  userId,
  onImportComplete,
}: CsvImporterProps) {
  const [workouts, setWorkouts] = useState<ImportableWorkout[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState<{
    current: number;
    total: number;
  } | null>(null);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

  // Granular Control State
  // Format: "workoutId-exerciseIndex"
  const [excludedExerciseKeys, setExcludedExerciseKeys] = useState<Set<string>>(
    new Set(),
  );

  const pickFile = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['text/csv', 'text/comma-separated-values', 'application/csv'],
      });

      if (result.canceled) return;

      setLoading(true);
      const fileUri = result.assets[0].uri;

      // Use the legacy import for readAsStringAsync
      const fileContent = await FileSystem.readAsStringAsync(fileUri);

      const parsed = parseStrongCsv(fileContent);
      setWorkouts(parsed);
      // Select all workouts by default
      setSelectedIds(new Set(parsed.map(w => w.id)));
      setLoading(false);
    } catch (error) {
      console.error(error);
      Alert.alert(
        'Error',
        'Failed to parse CSV file. Please check the format.',
      );
      setLoading(false);
    }
  };

  const toggleSelection = (id: string) => {
    const newSet = new Set(selectedIds);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setSelectedIds(newSet);
  };

  const toggleExpand = (id: string) => {
    const newSet = new Set(expandedIds);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setExpandedIds(newSet);
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === workouts.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(workouts.map(w => w.id)));
    }
  };

  // Granular Control: Rename Workout
  const updateWorkoutName = (id: string, newName: string) => {
    setWorkouts(prev =>
      prev.map(w => (w.id === id ? { ...w, name: newName } : w)),
    );
  };

  // Granular Control: Toggle Specific Exercise
  const toggleExerciseExclusion = (workoutId: string, index: number) => {
    const key = `${workoutId}-${index}`;
    const newSet = new Set(excludedExerciseKeys);
    if (newSet.has(key)) newSet.delete(key);
    else newSet.add(key);
    setExcludedExerciseKeys(newSet);
  };

  const handleSave = async () => {
    // Filter workouts that are unchecked
    const selectedWorkouts = workouts.filter(w => selectedIds.has(w.id));

    if (selectedWorkouts.length === 0) return;

    // Apply granular filters: Remove exercises that were unchecked
    const finalWorkoutsToImport = selectedWorkouts.map(w => ({
      ...w,
      exercises: w.exercises.filter(
        (_, idx) => !excludedExerciseKeys.has(`${w.id}-${idx}`),
      ),
    }));

    // Double check we didn't create empty workouts
    const validWorkouts = finalWorkoutsToImport.filter(
      w => w.exercises.length > 0,
    );

    if (validWorkouts.length === 0) {
      Alert.alert('Error', 'No exercises selected to import.');
      return;
    }

    setLoading(true);
    try {
      await batchSaveWorkouts(validWorkouts, userId, 'lbs', (curr, total) =>
        setProgress({ current: curr, total }),
      );
      Alert.alert('Success', `Imported ${validWorkouts.length} workouts!`);
      onImportComplete();
      setWorkouts([]);
      setSelectedIds(new Set());
      setExcludedExerciseKeys(new Set());
    } catch (error: any) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
      setProgress(null);
    }
  };

  if (workouts.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.emptyState}>
          <Ionicons name="document-text-outline" size={64} color="#ccc" />
          <ThemedText style={styles.emptyText}>
            Import workouts from Strong CSV
          </ThemedText>
          <StyledButton
            title={loading ? 'Reading File...' : 'Select CSV File'}
            onPress={pickFile}
            disabled={loading}
          />
        </View>
      </View>
    );
  }

  if (loading && progress) {
    return (
      <View style={styles.container}>
        <View style={styles.center}>
          <ActivityIndicator size="large" />
          <ThemedText style={{ marginTop: 20 }}>
            Importing {progress.current} of {progress.total}...
          </ThemedText>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <ThemedText type="subtitle">Preview Import</ThemedText>
        <TouchableOpacity onPress={toggleSelectAll}>
          <Text style={styles.linkText}>
            {selectedIds.size === workouts.length
              ? 'Deselect All'
              : 'Select All'}
          </Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={workouts}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => {
          const isSelected = selectedIds.has(item.id);
          const isExpanded = expandedIds.has(item.id);

          return (
            <View style={[styles.card, isSelected && styles.cardSelected]}>
              {/* Card Header / Main Row */}
              <View style={styles.cardHeader}>
                <TouchableOpacity onPress={() => toggleSelection(item.id)}>
                  <Ionicons
                    name={isSelected ? 'checkbox' : 'square-outline'}
                    size={24}
                    color={isSelected ? '#007bff' : '#ccc'}
                  />
                </TouchableOpacity>

                <View style={styles.cardInfo}>
                  {/* Editable Name Input */}
                  <TextInput
                    style={styles.nameInput}
                    value={item.name}
                    onChangeText={text => updateWorkoutName(item.id, text)}
                    placeholder="Workout Name"
                  />
                  <Text style={styles.dateText}>
                    {item.date} • {item.duration}
                  </Text>
                </View>

                <TouchableOpacity
                  style={styles.expandButton}
                  onPress={() => toggleExpand(item.id)}>
                  <Ionicons
                    name={isExpanded ? 'chevron-up' : 'chevron-down'}
                    size={20}
                    color="#666"
                  />
                </TouchableOpacity>
              </View>

              {/* Expanded Details View */}
              {isExpanded && (
                <View style={styles.details}>
                  <Text style={styles.detailsHeader}>Exercises:</Text>
                  {item.exercises.map((ex, idx) => {
                    const isExcluded = excludedExerciseKeys.has(
                      `${item.id}-${idx}`,
                    );
                    return (
                      <TouchableOpacity
                        key={idx}
                        style={styles.exerciseRow}
                        onPress={() => toggleExerciseExclusion(item.id, idx)}
                        activeOpacity={0.7}>
                        <Ionicons
                          name={
                            isExcluded
                              ? 'close-circle-outline'
                              : 'checkmark-circle'
                          }
                          size={20}
                          color={isExcluded ? '#ccc' : '#28a745'}
                          style={{ marginRight: 8 }}
                        />
                        <View style={{ flex: 1 }}>
                          <Text
                            style={[
                              styles.detailText,
                              isExcluded && styles.strikeThrough,
                            ]}>
                            {ex.name}
                          </Text>
                          <Text style={styles.setSummary}>
                            {ex.sets.length} sets • Max:{' '}
                            {Math.max(...ex.sets.map(s => s.weight))} lbs
                          </Text>
                        </View>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              )}
            </View>
          );
        }}
      />

      <View style={styles.footer}>
        <StyledButton
          title={`Import ${selectedIds.size} Workouts`}
          onPress={handleSave}
          type="primary"
          disabled={selectedIds.size === 0}
        />
        <StyledButton
          title="Cancel"
          onPress={() => {
            setWorkouts([]);
            setSelectedIds(new Set());
            setExcludedExerciseKeys(new Set());
          }}
          type="secondary"
          style={{ marginTop: 8 }}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    gap: 20,
  },
  emptyText: {
    textAlign: 'center',
    marginBottom: 20,
    color: '#666',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  linkText: {
    color: '#007bff',
    fontWeight: '600',
  },
  list: {
    padding: 16,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 8,
    marginBottom: 10,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'transparent',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  cardSelected: {
    borderColor: '#007bff',
    backgroundColor: '#f8f9ff',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
  },
  cardInfo: {
    flex: 1,
    marginLeft: 12,
  },
  nameInput: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    paddingBottom: 2,
    marginBottom: 4,
  },
  dateText: {
    fontSize: 12,
    color: '#666',
  },
  expandButton: {
    padding: 8,
  },
  details: {
    backgroundColor: '#fafafa',
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  detailsHeader: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#888',
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  exerciseRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    paddingVertical: 4,
  },
  detailText: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  setSummary: {
    fontSize: 12,
    color: '#777',
  },
  strikeThrough: {
    textDecorationLine: 'line-through',
    color: '#999',
  },
  footer: {
    padding: 16,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
});
