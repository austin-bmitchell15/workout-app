import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { LocalSet } from '../types';
import { FontAwesome } from '@expo/vector-icons';
import { ThemedText } from '../themed-text';
import StyledTextInput from '../common/StyledTextInput';
import { useThemeColor } from '@/hooks/theme/use-theme-color';

type SetLoggerProps = {
  set: LocalSet;
  onChange: (set: LocalSet) => void;
  onRemove: (localId: string) => void;
  unitLabel: 'kg' | 'lbs';
};

export default function SetLogger({
  set,
  onChange,
  onRemove,
  unitLabel,
}: SetLoggerProps) {
  const iconColor = useThemeColor({}, 'icon');

  return (
    <View style={styles.setRow}>
      <View style={styles.setCol}>
        <ThemedText style={styles.setText}>{set.set_number}</ThemedText>
      </View>
      <View style={styles.weightCol}>
        <StyledTextInput
          style={styles.input}
          placeholder={unitLabel}
          keyboardType="numeric"
          value={set.weight}
          onChangeText={text => onChange({ ...set, weight: text })}
          testID={`set-weight-${set.local_id}`}
        />
      </View>
      <View style={styles.repsCol}>
        <StyledTextInput
          style={styles.input}
          placeholder="reps"
          keyboardType="numeric"
          value={set.reps}
          onChangeText={text => onChange({ ...set, reps: text })}
          testID={`set-reps-${set.local_id}`}
        />
      </View>
      <TouchableOpacity
        style={styles.removeCol}
        onPress={() => onRemove(set.local_id)}
        testID={`remove-set-${set.local_id}`}>
        <FontAwesome name="minus-circle" size={20} color={iconColor} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  setRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  input: {
    height: 40,
    textAlign: 'center',
    backgroundColor: 'transparent',
  },
  setText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  setCol: {
    flex: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  weightCol: {
    flex: 2,
    paddingHorizontal: 5,
  },
  repsCol: {
    flex: 2,
    paddingHorizontal: 5,
  },
  removeCol: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
