import React from 'react';
import { View, StyleSheet } from 'react-native';
import StyledTextInput from '@/components/common/StyledTextInput';

type Props = {
  name: string;
  notes: string;
  onNameChange: (text: string) => void;
  onNotesChange: (text: string) => void;
};

export const WorkoutHeader = ({
  name,
  notes,
  onNameChange,
  onNotesChange,
}: Props) => (
  <View style={styles.container}>
    <StyledTextInput
      style={styles.input}
      value={name}
      onChangeText={onNameChange}
      placeholder="Workout Name"
    />
    <StyledTextInput
      style={[styles.input, styles.textArea]}
      value={notes}
      onChangeText={onNotesChange}
      placeholder="Workout Notes"
      multiline
    />
  </View>
);

const styles = StyleSheet.create({
  container: { marginBottom: 10 },
  input: { marginBottom: 15 },
  textArea: { height: 80, textAlignVertical: 'top', paddingTop: 15 },
});
