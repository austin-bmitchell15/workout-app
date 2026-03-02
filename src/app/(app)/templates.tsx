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
import { useAuth } from '../_layout';
import { TemplateRecord } from '@/types/schema';
import { useAppTheme } from '@/contexts/ThemeContext';

export default function TemplatesScreen() {
  const { session } = useAuth();
  const { colorScheme } = useAppTheme();
  const isDark = colorScheme === 'dark';
  const [templates, setTemplates] = useState<TemplateRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const c = {
    pageBg: isDark ? '#1c1c1e' : '#f5f5f5',
    cardBg: isDark ? '#2c2c2e' : 'white',
    cardBorder: isDark ? '#48484a' : '#eee',
    primaryText: isDark ? '#ECEDEE' : '#333',
    secondaryText: isDark ? '#9BA1A6' : '#777',
    mutedText: isDark ? '#636366' : '#999',
  };

  const fetchTemplates = useCallback(async () => {
    if (!session?.user) return;

    try {
      setTemplates([]);
    } catch (error) {
      if (error instanceof Error) {
        Alert.alert('Error', `Could not fetch templates: ${error.message}`);
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [session]);

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
    <View
      style={[
        styles.itemContainer,
        { backgroundColor: c.cardBg, borderColor: c.cardBorder },
      ]}>
      <Text style={[styles.itemTitle, { color: c.primaryText }]}>
        {item.name}
      </Text>
      <StyledButton
        title="Start"
        onPress={() => {
          Alert.alert('Start Workout', `Start from ${item.name}?`);
        }}
      />
    </View>
  );

  if (loading) {
    return (
      <View style={[styles.centered, { backgroundColor: c.pageBg }]}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: c.pageBg }]}>
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
            <Text style={[styles.emptyText, { color: c.secondaryText }]}>
              No templates saved yet.
            </Text>
            <Text style={[styles.emptySubText, { color: c.mutedText }]}>
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
