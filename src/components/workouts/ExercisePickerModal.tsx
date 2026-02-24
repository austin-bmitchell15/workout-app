import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from '../themed-text';
import StyledTextInput from '../common/StyledTextInput';
import { useThemeColor } from '@/hooks/theme/use-theme-color';
import { fetchExerciseLibrary } from '@/services/ExerciseService';
import { ExerciseLibrary, ExerciseLibraryItem } from '@/types/schema';

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
  const [exercises, setExercises] = useState<ExerciseLibrary>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Theme Hooks
  const backgroundColor = useThemeColor({}, 'background');
  const iconColor = useThemeColor({}, 'icon');
  const borderColor = useThemeColor({}, 'border');
  const tintColor = useThemeColor({}, 'tint');

  useEffect(() => {
    if (visible) {
      getExerciseLibrary();
    }
  }, [visible]);

  const getExerciseLibrary = async () => {
    setLoading(true);
    const { data, error } = await fetchExerciseLibrary();
    if (error) console.error(error);
    setExercises(data || []);
    setLoading(false);
  };

  const filteredExercises = exercises?.filter(ex =>
    ex.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}>
      <SafeAreaView style={[styles.modalContainer, { backgroundColor }]}>
        {/* Header */}
        <View style={[styles.header, { borderColor }]}>
          <ThemedText type="subtitle">Add Exercise</ThemedText>
          <TouchableOpacity onPress={onClose} testID="close-modal-btn">
            <Ionicons name="close" size={24} color={iconColor} />
          </TouchableOpacity>
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <StyledTextInput
            style={styles.searchInput}
            placeholder="Search exercises..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            testID="search-exercise-input"
          />
        </View>

        {/* List or Loading */}
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={tintColor} />
          </View>
        ) : (
          <FlatList
            data={filteredExercises}
            keyExtractor={item => item.id}
            contentContainerStyle={styles.listContent}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[styles.itemContainer, { borderColor }]}
                onPress={() => onExerciseSelect(item)}
                testID={`exercise-item-${item.id}`}>
                {item.image_url ? (
                  <Image
                    source={{ uri: item.image_url }}
                    style={styles.image}
                  />
                ) : (
                  <View
                    style={[
                      styles.image,
                      styles.placeholderImage,
                      { borderColor },
                    ]}>
                    <Ionicons
                      name="barbell-outline"
                      size={24}
                      color={iconColor}
                    />
                  </View>
                )}

                <View style={styles.textContainer}>
                  <ThemedText type="defaultSemiBold">{item.name}</ThemedText>
                  {item.primary_muscle_group && (
                    <View style={styles.muscleBadge}>
                      <ThemedText
                        style={[styles.muscleText, { color: tintColor }]}>
                        {item.primary_muscle_group}
                      </ThemedText>
                    </View>
                  )}
                </View>

                <Ionicons
                  name="add-circle-outline"
                  size={24}
                  color={tintColor}
                />
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
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
  },
  searchContainer: {
    padding: 16,
    paddingBottom: 8,
  },
  searchInput: {
    height: 45, // Override default
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
  },
  image: {
    width: 50,
    height: 50,
    borderRadius: 4,
    marginRight: 12,
    backgroundColor: '#eee', // Fallback or could use theme card color
  },
  placeholderImage: {
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    backgroundColor: 'transparent',
  },
  textContainer: {
    flex: 1,
    gap: 4,
  },
  muscleBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 0,
    borderRadius: 4,
  },
  muscleText: {
    fontSize: 12,
    fontWeight: '600',
  },
});
