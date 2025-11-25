import React from 'react';
import { TextInput, StyleSheet, TextInputProps } from 'react-native';
import { useThemeColor } from '@/hooks/theme/use-theme-color';

interface StyledTextInputProps extends TextInputProps {
  // Add any custom props here if needed
}

export default function StyledTextInput({
  style,
  ...props
}: StyledTextInputProps) {
  const textColor = useThemeColor({}, 'text');
  const borderColor = useThemeColor({}, 'text');

  return (
    <TextInput
      style={[
        styles.input,
        { color: textColor, borderColor: borderColor },
        style,
      ]}
      placeholderTextColor={useThemeColor(
        { light: '#888', dark: '#ccc' },
        'text',
      )}
      {...props}
    />
  );
}

const styles = StyleSheet.create({
  input: {
    height: 50,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    fontSize: 16,
  },
});
