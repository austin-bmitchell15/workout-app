import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
} from 'react-native';
import { LocalSet } from '../types';
import { FontAwesome } from '@expo/vector-icons';

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
  return (
    <View style={styles.setRow}>
      <View style={styles.setCol}>
        <Text style={styles.setText}>{set.set_number}</Text>
      </View>
      <View style={styles.weightCol}>
        <TextInput
          style={styles.input}
          placeholder={unitLabel}
          placeholderTextColor="#888"
          keyboardType="numeric"
          value={set.weight}
          onChangeText={text => onChange({ ...set, weight: text })}
        />
      </View>
      <View style={styles.repsCol}>
        <TextInput
          style={styles.input}
          placeholder="reps"
          placeholderTextColor="#888"
          keyboardType="numeric"
          value={set.reps}
          onChangeText={text => onChange({ ...set, reps: text })}
        />
      </View>
      <TouchableOpacity
        style={styles.removeCol}
        onPress={() => onRemove(set.local_id)}>
        <FontAwesome name="minus-circle" size={20} color="#adb5bd" />
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
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
    textAlign: 'center',
    backgroundColor: 'white',
    fontSize: 16,
    color: '#000',
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
