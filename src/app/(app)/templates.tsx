import { Stack, useFocusEffect } from 'expo-router';
import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import StyledButton from '../../components/common/StyledButton';
import { TemplateRecord } from '../../components/types';
import { supabase } from '../../services/supabase';
import { useAuth } from '../_layout';

export default function TemplatesScreen() {
  const { session } = useAuth();
  const [templates, setTemplates] = useState<TemplateRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchTemplates = async () => {
    if (!session?.user) return;

    try {
      const { data, error } = await supabase
        .from('workout_templates') // As per our plan
        .select('*')
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTemplates(data || []);
    } catch (error) {
      if (error instanceof Error) {
        Alert.alert('Error', `Could not fetch templates: ${error.message}`);
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // useFocusEffect will re-fetch data every time the user visits this tab
  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      fetchTemplates();
    }, [fetchTemplates]),
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchTemplates();
  };

  const renderItem = ({ item }: { item: TemplateRecord }) => (
    <View style={styles.itemContainer}>
      <Text style={styles.itemTitle}>{item.name}</Text>
      <StyledButton
        title="Start"
        onPress={() => {
          // TODO: Add logic to start a workout from this template
          Alert.alert('Start Workout', `Start from ${item.name}?`);
        }}
      />
    </View>
  );

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: 'Workout Templates' }} />
      <FlatList
        data={templates}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.centered}>
            <Text style={styles.emptyText}>No templates saved yet.</Text>
            <Text style={styles.emptySubText}>
              You can save a workout as a template from the &quot;Log
              Workout&quot; tab.
            </Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    textAlign: 'center',
  },
  itemContainer: {
    backgroundColor: 'white',
    padding: 20,
    marginVertical: 8,
    marginHorizontal: 15,
    borderRadius: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderColor: '#eee',
    borderWidth: 1,
  },
  itemTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  emptyText: {
    fontSize: 16,
    color: '#777',
    textAlign: 'center',
    marginBottom: 5,
  },
  emptySubText: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  },
});
