import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { ThemedText } from '../themed-text';

export const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
};

type WorkoutHistoryCardProps = {
  workout: any; // TODO: Define a type for this
};

export default function WorkoutHistoryCard({
  workout,
}: WorkoutHistoryCardProps) {
  const totalSets =
    workout.workout_exercises?.reduce(
      (acc: number, ex: any) => acc + (ex.sets?.length || 0),
      0,
    ) || 0;

  return (
    <View style={styles.card} testID="history-card">
      <View style={styles.header}>
        <View>
          <ThemedText type="defaultSemiBold">{workout.name}</ThemedText>
          <Text style={styles.date}>{formatDate(workout.created_at)}</Text>
        </View>
        <View style={styles.summaryTag}>
          <Text style={styles.summaryText}>{totalSets} Sets</Text>
        </View>
      </View>

      {/* Quick preview of exercises */}
      <View style={styles.exerciseList}>
        {workout.workout_exercises?.map((we: any) => (
          <Text key={we.id} style={styles.exerciseText} numberOfLines={1}>
            • {we.exercise_library?.name || 'Unknown Exercise'} (
            {we.sets?.length || 0} sets)
          </Text>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  date: {
    color: '#666',
    fontSize: 14,
    marginTop: 2,
  },
  summaryTag: {
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  summaryText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#555',
  },
  exerciseList: {
    gap: 4,
  },
  exerciseText: {
    fontSize: 14,
    color: '#444',
  },
});
