import React, { useState, useEffect, useMemo, forwardRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { supabase } from '../../services/supabase';
import { useAuth } from '../../app/_layout';
import { ExerciseLibraryItem } from '../types';
import {
  BottomSheetModal,
  BottomSheetHandle,
  BottomSheetFlatList,
} from '@gorhom/bottom-sheet';

type ExercisePickerModalProps = {
  onExerciseSelect: (exercise: ExerciseLibraryItem) => void;
};

// We use forwardRef to pass the ref from ActiveWorkout into the BottomSheetModal
const ExercisePickerModal = forwardRef<
  BottomSheetModal,
  ExercisePickerModalProps
>(({ onExerciseSelect }, ref) => {
  const { session } = useAuth();
  const [exercises, setExercises] = useState<ExerciseLibraryItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);

  // variables
  const snapPoints = useMemo(() => ['50%', '85%'], []);

  // Fetch exercises from the library
  useEffect(() => {
    if (session?.user) {
      setLoading(true);
      const fetchExercises = async () => {
        // Fetch all public exercises OR exercises created by the user
        const { data, error } = await supabase
          .from('exercise_library')
          .select('id, name, image_url')
          .or(`is_public.eq.true,created_by.eq.${session.user.id}`)
          .ilike('name', `%${searchTerm}%`) // Filter by search term
          .limit(50); // Limit results

        if (error) {
          Alert.alert('Error', 'Could not fetch exercises');
          console.error(error);
        } else {
          setExercises(data as ExerciseLibraryItem[]);
        }
        setLoading(false);
      };
      // Debounce search
      const timer = setTimeout(() => {
        fetchExercises();
      }, 300); // Wait 300ms after user stops typing

      return () => clearTimeout(timer);
    }
  }, [searchTerm, session]); // Re-fetch on search or session change

  const renderItem = ({ item }: { item: ExerciseLibraryItem }) => (
    <TouchableOpacity
      style={styles.item}
      onPress={() => onExerciseSelect(item)}>
      <Text style={styles.itemText}>{item.name}</Text>
    </TouchableOpacity>
  );

  return (
    <BottomSheetModal
      ref={ref}
      index={1} // Start at 85%
      snapPoints={snapPoints}
      handleComponent={props => (
        <View style={styles.handleContainer}>
          <BottomSheetHandle {...props} />
          <Text style={styles.title}>Add Exercise</Text>
        </View>
      )}>
      <View style={styles.contentContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search exercises..."
          placeholderTextColor="#888"
          value={searchTerm}
          onChangeText={setSearchTerm}
        />
        {loading ? (
          <Text style={styles.emptyText}>Loading...</Text>
        ) : (
          <BottomSheetFlatList
            data={exercises}
            keyExtractor={(item: ExerciseLibraryItem) => item.id}
            renderItem={renderItem}
            ListEmptyComponent={
              <Text style={styles.emptyText}>No exercises found.</Text>
            }
          />
        )}
      </View>
    </BottomSheetModal>
  );
});

// Add this line to fix the linter error
ExercisePickerModal.displayName = 'ExercisePickerModal';

export default ExercisePickerModal;

const styles = StyleSheet.create({
  contentContainer: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  handleContainer: {
    backgroundColor: '#f5f5f5',
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 15,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 5,
  },
  searchInput: {
    height: 45,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 15,
    marginBottom: 15,
    marginHorizontal: 15,
    backgroundColor: 'white',
    fontSize: 16,
    color: '#000',
  },
  item: {
    backgroundColor: 'white',
    padding: 20,
    marginVertical: 8,
    marginHorizontal: 15,
    borderRadius: 8,
    borderColor: '#eee',
    borderWidth: 1,
  },
  itemText: {
    fontSize: 18,
    color: '#000',
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 20,
    fontSize: 16,
    color: '#777',
  },
});
