import React from 'react';
import { TextInput, StyleSheet, TextInputProps } from 'react-native';
import { useThemeColor } from '@/hooks/theme/use-theme-color';

export default function StyledTextInput({ style, ...props }: TextInputProps) {
  const textColor = useThemeColor({}, 'text');
  const borderColor = useThemeColor({}, 'border');
  const placeholderColor = useThemeColor(
    { light: '#888', dark: '#666' },
    'icon',
  );

  return (
    <TextInput
      style={[
        styles.input,
        { color: textColor, borderColor: borderColor },
        style,
      ]}
      placeholderTextColor={placeholderColor}
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
