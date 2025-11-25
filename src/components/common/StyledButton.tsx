import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  TouchableOpacityProps,
  StyleProp,
  ViewStyle,
  ActivityIndicator,
} from 'react-native';
import { useThemeColor } from '@/hooks/use-theme-color'; // Import theme hook

interface StyledButtonProps extends TouchableOpacityProps {
  title: string;
  type?: 'primary' | 'secondary' | 'danger';
  style?: StyleProp<ViewStyle>;
  isLoading?: boolean; // Add loading prop
}

export default function StyledButton({
  title,
  type = 'secondary',
  style,
  isLoading = false,
  ...props
}: StyledButtonProps) {
  const primaryColor = useThemeColor({}, 'tint'); // Use your global tint color
  
  // Define dynamic styles based on type
  const getBackgroundColor = () => {
    if (props.disabled || isLoading) return '#ccc'; // Or a themed disabled color
    if (type === 'primary') return primaryColor;
    if (type === 'danger') return '#f8d7da'; // Consider theming this too
    return '#e9ecef';
  };

  const getTextColor = () => {
    if (type === 'primary') return 'white';
    if (type === 'danger') return '#dc3545';
    return primaryColor;
  };

  return (
    <TouchableOpacity
      style={[
        styles.button,
        { backgroundColor: getBackgroundColor() },
        style,
      ]}
      activeOpacity={0.7}
      disabled={props.disabled || isLoading}
      {...props}>
      {isLoading ? (
        <ActivityIndicator color={getTextColor()} />
      ) : (
        <Text style={[styles.text, { color: getTextColor() }]}>
          {title}
        </Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontSize: 16,
    fontWeight: 'bold',
  },
});
