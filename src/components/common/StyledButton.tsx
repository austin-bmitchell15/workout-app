import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  TouchableOpacityProps,
  StyleProp,
  ViewStyle,
} from 'react-native';

interface StyledButtonProps extends TouchableOpacityProps {
  title: string;
  type?: 'primary' | 'secondary' | 'danger';
  style?: StyleProp<ViewStyle>;
}

export default function StyledButton({
  title,
  type = 'secondary',
  style,
  ...props
}: StyledButtonProps) {
  return (
    <TouchableOpacity
      style={[
        styles.button,
        type === 'primary' && styles.primaryButton,
        type === 'danger' && styles.dangerButton,
        props.disabled && styles.disabledButton,
        style,
      ]}
      activeOpacity={0.7}
      {...props}>
      <Text
        style={[
          styles.text,
          type === 'primary' && styles.primaryText,
          type === 'danger' && styles.dangerText,
        ]}>
        {title}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: '#e9ecef',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButton: {
    backgroundColor: '#007bff',
  },
  dangerButton: {
    backgroundColor: '#f8d7da',
  },
  disabledButton: {
    backgroundColor: '#f8f9fa',
    opacity: 0.7,
  },
  text: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#007bff',
  },
  primaryText: {
    color: 'white',
  },
  dangerText: {
    color: '#dc3545',
  },
});
