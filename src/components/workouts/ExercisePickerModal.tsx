import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  Modal,
  FlatList,
  SafeAreaView,
} from 'react-native';
import { supabase } from '../../services/supabase';
import { useAuth } from '../../app/_layout';
import { ExerciseLibraryItem } from '../types';
import { FontAwesome } from '@expo/vector-icons';

type ExercisePickerModalProps = {
  visible: boolean;
  onClose: () => void;
  onExerciseSelect: (exercise: ExerciseLibraryItem) => void;
};

export default function ExercisePickerModal({
  visible,
  onClose,
  onExerciseSelect,
}: ExercisePickerModalProps) {
  const { session } = useAuth();
  const [exercises, setExercises] = useState<ExerciseLibraryItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (session?.user && visible) {
      setLoading(true);
      const fetchExercises = async () => {
        const { data, error } = await supabase
          .from('exercise_library')
          .select('id, name, image_url')
          .or(`is_public.eq.true,created_by.eq.${session.user.id}`)
          .ilike('name', `%${searchTerm}%`)
          .limit(50);

        if (error) {
          Alert.alert('Error', 'Could not fetch exercises');
          console.error(error);
        } else {
          setExercises(data as ExerciseLibraryItem[]);
        }
        setLoading(false);
      };

      const timer = setTimeout(() => {
        fetchExercises();
      }, 300);

      return () => clearTimeout(timer);
    }
  }, [searchTerm, session, visible]);

  const renderItem = ({ item }: { item: ExerciseLibraryItem }) => (
    <TouchableOpacity
      style={styles.item}
      onPress={() => onExerciseSelect(item)}>
      <Text style={styles.itemText}>{item.name}</Text>
      <FontAwesome name="plus-circle" size={24} color="#007bff" />
    </TouchableOpacity>
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet" // This gives the nice iOS card effect
      onRequestClose={onClose}>
      <SafeAreaView style={styles.modalContainer}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Add Exercise</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <FontAwesome name="times" size={20} color="#666" />
          </TouchableOpacity>
        </View>

        {/* Search Bar */}
        <TextInput
          style={styles.searchInput}
          placeholder="Search exercises..."
          placeholderTextColor="#888"
          value={searchTerm}
          onChangeText={setSearchTerm}
          autoFocus={false}
        />

        {/* List */}
        <View style={styles.listContainer}>
          {loading ? (
            <Text style={styles.emptyText}>Loading...</Text>
          ) : (
            <FlatList
              data={exercises}
              keyExtractor={item => item.id}
              renderItem={renderItem}
              ListEmptyComponent={
                <Text style={styles.emptyText}>No exercises found.</Text>
              }
            />
          )}
        </View>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    backgroundColor: 'white',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  closeButton: {
    padding: 5,
  },
  searchInput: {
    height: 50,
    backgroundColor: 'white',
    borderRadius: 8,
    paddingHorizontal: 15,
    margin: 15,
    borderWidth: 1,
    borderColor: '#ddd',
    fontSize: 16,
  },
  listContainer: {
    flex: 1,
  },
  item: {
    backgroundColor: 'white',
    padding: 15,
    marginVertical: 5,
    marginHorizontal: 15,
    borderRadius: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#eee',
  },
  itemText: {
    fontSize: 16,
    fontWeight: '500',
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 20,
    color: '#777',
  },
});
