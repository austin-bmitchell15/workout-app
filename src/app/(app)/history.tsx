import React, { useState, useCallback } from 'react';
import {
  StyleSheet,
  FlatList,
  View,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useAuth } from '../_layout';
import { getWorkoutHistory } from '@/services/WorkoutService';
import { ThemedView } from '@/components/themed-view';
import { ThemedText } from '@/components/themed-text';
import WorkoutHistoryCard from '@/components/workouts/WorkoutHistoryCard';
import { useFocusEffect } from 'expo-router';
import { FullWorkoutHistory } from '@/types/types';

export default function HistoryScreen() {
  const { session } = useAuth();
  const [workouts, setWorkouts] = useState<FullWorkoutHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchHistory = useCallback(async () => {
    if (!session?.user) return;
    const { data, error } = await getWorkoutHistory(session.user.id);
    if (error) console.error(error);
    setWorkouts(data || []);
    setLoading(false);
    setRefreshing(false);
  }, [session?.user]);

  // Refresh when the screen comes into focus (e.g., after logging a workout)
  useFocusEffect(
    useCallback(() => {
      fetchHistory();
    }, [fetchHistory]),
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchHistory();
  };

  if (loading && workouts.length === 0) {
    return (
      <ThemedView style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" />
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <FlatList
        data={workouts}
        keyExtractor={item => item.id}
        renderItem={({ item }) => <WorkoutHistoryCard workout={item} />}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.center}>
            <ThemedText>No workouts found.</ThemedText>
            <ThemedText style={styles.subText}>
              Go to the &quot;Log&quot; tab to track your first workout!
            </ThemedText>
          </View>
        }
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContent: {
    padding: 16,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  subText: {
    fontSize: 14,
    color: '#666',
    marginTop: 8,
    textAlign: 'center',
  },
});
