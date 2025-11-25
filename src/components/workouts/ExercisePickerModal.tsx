import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '@/services/supabase';
import { ExerciseLibraryItem } from '../types';

type ExercisePickerModalProps = {
  visible: boolean;
  onClose: () => void;
  onExerciseSelect: (exercise: ExerciseLibraryItem) => void;
};

// Extended type for internal use
interface ExerciseItem extends ExerciseLibraryItem {
  primary_muscle_group?: string;
}

export default function ExercisePickerModal({
  visible,
  onClose,
  onExerciseSelect,
}: ExercisePickerModalProps) {
  const [exercises, setExercises] = useState<ExerciseItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (visible) {
      fetchExercises();
    }
  }, [visible]);

  const fetchExercises = async () => {
    setLoading(true);
    // Fetch muscle group in addition to basic details
    const { data, error } = await supabase
      .from('exercise_library')
      .select('id, name, image_url, primary_muscle_group')
      .order('name');

    if (error) {
      console.error(error);
    } else {
      setExercises(data || []);
    }
    setLoading(false);
  };

  const filteredExercises = exercises.filter(ex =>
    ex.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}>
      <SafeAreaView style={styles.modalContainer}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Add Exercise</Text>
          <TouchableOpacity onPress={onClose}>
            <Ionicons name="close" size={24} color="#333" />
          </TouchableOpacity>
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Ionicons
            name="search"
            size={20}
            color="#888"
            style={styles.searchIcon}
          />
          <TextInput
            style={styles.searchInput}
            placeholder="Search exercises..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            clearButtonMode="while-editing"
          />
        </View>

        {/* List or Loading */}
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#007bff" />
          </View>
        ) : (
          <FlatList
            data={filteredExercises}
            keyExtractor={item => item.id}
            contentContainerStyle={styles.listContent}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.itemContainer}
                onPress={() => onExerciseSelect(item)}>
                {item.image_url ? (
                  <Image
                    source={{ uri: item.image_url }}
                    style={styles.image}
                  />
                ) : (
                  <View style={[styles.image, styles.placeholderImage]}>
                    <Ionicons name="barbell-outline" size={24} color="#ccc" />
                  </View>
                )}

                <View style={styles.textContainer}>
                  <Text style={styles.itemName}>{item.name}</Text>
                  {item.primary_muscle_group && (
                    <View style={styles.muscleBadge}>
                      <Text style={styles.muscleText}>
                        {item.primary_muscle_group}
                      </Text>
                    </View>
                  )}
                </View>

                <Ionicons name="add-circle-outline" size={24} color="#007bff" />
              </TouchableOpacity>
            )}
          />
        )}
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#f0f0f0',
    margin: 16,
    marginBottom: 8,
    borderRadius: 8,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    height: 40,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  itemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  image: {
    width: 50,
    height: 50,
    borderRadius: 4,
    marginRight: 12,
    backgroundColor: '#eee',
  },
  placeholderImage: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  textContainer: {
    flex: 1,
    gap: 4,
  },
  itemName: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  muscleBadge: {
    backgroundColor: '#eef6ff',
    alignSelf: 'flex-start',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  muscleText: {
    fontSize: 12,
    color: '#007bff',
    fontWeight: '600',
  },
});
