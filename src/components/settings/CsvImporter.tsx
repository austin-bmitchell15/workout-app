import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Alert,
  ActivityIndicator,
} from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system/legacy';
import { Ionicons } from '@expo/vector-icons';
import {
  parseStrongCsv,
  batchSaveWorkouts,
  ImportableWorkout,
} from '@/services/ImportService';
import { ThemedText } from '../themed-text';
import { ThemedView } from '../themed-view'; // Import ThemedView
import StyledButton from '../common/StyledButton';
import StyledTextInput from '../common/StyledTextInput'; // Import StyledTextInput
import { useThemeColor } from '@/hooks/theme/use-theme-color';

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
  const [excludedExerciseKeys, setExcludedExerciseKeys] = useState<Set<string>>(
    new Set(),
  );

  // Theme Hooks
  const successColor = useThemeColor({}, 'success');
  const iconColor = useThemeColor({}, 'icon');
  const cardColor = useThemeColor({}, 'card');
  const borderColor = useThemeColor({}, 'border');
  const tintColor = useThemeColor({}, 'tint');

  const pickFile = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['text/csv', 'text/comma-separated-values', 'application/csv'],
      });
      if (result.canceled) return;
      setLoading(true);
      const fileUri = result.assets[0].uri;
      const fileContent = await FileSystem.readAsStringAsync(fileUri);
      const parsed = parseStrongCsv(fileContent);
      setWorkouts(parsed);
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

  const updateWorkoutName = (id: string, newName: string) => {
    setWorkouts(prev =>
      prev.map(w => (w.id === id ? { ...w, name: newName } : w)),
    );
  };

  const toggleExerciseExclusion = (workoutId: string, index: number) => {
    const key = `${workoutId}-${index}`;
    const newSet = new Set(excludedExerciseKeys);
    if (newSet.has(key)) newSet.delete(key);
    else newSet.add(key);
    setExcludedExerciseKeys(newSet);
  };

  const handleSave = async () => {
    // ... logic same as before ...
    const selectedWorkouts = workouts.filter(w => selectedIds.has(w.id));
    if (selectedWorkouts.length === 0) return;

    const finalWorkoutsToImport = selectedWorkouts.map(w => ({
      ...w,
      exercises: w.exercises.filter(
        (_, idx) => !excludedExerciseKeys.has(`${w.id}-${idx}`),
      ),
    }));

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
      <ThemedView style={styles.container}>
        <View style={styles.emptyState}>
          <Ionicons name="document-text-outline" size={64} color={iconColor} />
          <ThemedText style={styles.emptyText}>
            Import workouts from Strong CSV
          </ThemedText>
          <StyledButton
            title={loading ? 'Reading File...' : 'Select CSV File'}
            onPress={pickFile}
            disabled={loading}
            testID="select-csv-btn"
          />
        </View>
      </ThemedView>
    );
  }

  if (loading && progress) {
    return (
      <ThemedView style={styles.container}>
        <View style={styles.center}>
          <ActivityIndicator size="large" color={tintColor} />
          <ThemedText style={{ marginTop: 20 }}>
            Importing {progress.current} of {progress.total}...
          </ThemedText>
        </View>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <View style={[styles.header, { borderColor }]}>
        <ThemedText type="subtitle">Preview Import</ThemedText>
        <TouchableOpacity onPress={toggleSelectAll} testID="toggle-select-all">
          <ThemedText type="link">
            {selectedIds.size === workouts.length
              ? 'Deselect All'
              : 'Select All'}
          </ThemedText>
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
            <ThemedView
              style={[
                styles.card,
                { borderColor: isSelected ? tintColor : borderColor },
              ]}>
              <View style={styles.cardHeader}>
                <TouchableOpacity
                  onPress={() => toggleSelection(item.id)}
                  testID={`workout-checkbox-${item.id}`}>
                  <Ionicons
                    name={isSelected ? 'checkbox' : 'square-outline'}
                    size={24}
                    color={isSelected ? tintColor : iconColor}
                  />
                </TouchableOpacity>

                <View style={styles.cardInfo}>
                  <StyledTextInput
                    style={styles.nameInput}
                    value={item.name}
                    onChangeText={text => updateWorkoutName(item.id, text)}
                    placeholder="Workout Name"
                    testID={`workout-name-input-${item.id}`}
                  />
                  <ThemedText style={styles.dateText}>
                    {item.date} • {item.duration}
                  </ThemedText>
                </View>

                <TouchableOpacity
                  style={styles.expandButton}
                  onPress={() => toggleExpand(item.id)}
                  testID={`expand-workout-${item.id}`}>
                  <Ionicons
                    name={isExpanded ? 'chevron-up' : 'chevron-down'}
                    size={20}
                    color={iconColor}
                  />
                </TouchableOpacity>
              </View>

              {isExpanded && (
                <View
                  style={[
                    styles.details,
                    { backgroundColor: cardColor, borderColor },
                  ]}>
                  <ThemedText style={styles.detailsHeader}>
                    Exercises:
                  </ThemedText>
                  {item.exercises.map((ex, idx) => {
                    const isExcluded = excludedExerciseKeys.has(
                      `${item.id}-${idx}`,
                    );
                    return (
                      <TouchableOpacity
                        key={idx}
                        style={styles.exerciseRow}
                        onPress={() => toggleExerciseExclusion(item.id, idx)}
                        activeOpacity={0.7}
                        testID={`exercise-row-${item.id}-${idx}`}>
                        <Ionicons
                          name={
                            isExcluded
                              ? 'close-circle-outline'
                              : 'checkmark-circle'
                          }
                          size={20}
                          color={isExcluded ? iconColor : successColor}
                          style={{ marginRight: 8 }}
                        />
                        <View style={{ flex: 1 }}>
                          <ThemedText
                            style={[
                              styles.detailText,
                              isExcluded && styles.strikeThrough,
                            ]}>
                            {ex.name}
                          </ThemedText>
                          <ThemedText style={styles.setSummary}>
                            {ex.sets.length} sets • Max:{' '}
                            {Math.max(...ex.sets.map(s => s.weight))} lbs
                          </ThemedText>
                        </View>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              )}
            </ThemedView>
          );
        }}
      />

      <View style={[styles.footer, { borderColor }]}>
        <StyledButton
          title={`Import ${selectedIds.size} Workouts`}
          onPress={handleSave}
          type="primary"
          disabled={selectedIds.size === 0}
          testID="import-confirm-btn"
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
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
    opacity: 0.7,
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
    borderBottomWidth: 1,
  },
  list: {
    padding: 16,
  },
  card: {
    borderRadius: 8,
    marginBottom: 10,
    overflow: 'hidden',
    borderWidth: 1,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
  },
  cardInfo: {
    flex: 1,
    marginLeft: 12,
    gap: 4,
  },
  nameInput: {
    height: 40,
    fontSize: 16,
    fontWeight: '600',
    borderWidth: 0,
    borderBottomWidth: 1,
    borderRadius: 0,
    paddingHorizontal: 0,
  },
  dateText: {
    fontSize: 12,
    opacity: 0.6,
  },
  expandButton: {
    padding: 8,
  },
  details: {
    padding: 12,
    borderTopWidth: 1,
  },
  detailsHeader: {
    fontSize: 12,
    fontWeight: 'bold',
    opacity: 0.5,
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
    fontWeight: '500',
  },
  setSummary: {
    fontSize: 12,
    opacity: 0.7,
  },
  strikeThrough: {
    textDecorationLine: 'line-through',
    opacity: 0.5,
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
  },
});
