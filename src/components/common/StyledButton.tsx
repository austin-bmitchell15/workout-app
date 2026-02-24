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
import { useThemeColor } from '@/hooks/theme/use-theme-color';

interface StyledButtonProps extends TouchableOpacityProps {
  title: string;
  type?: 'primary' | 'secondary' | 'danger';
  style?: StyleProp<ViewStyle>;
  isLoading?: boolean;
}

export default function StyledButton({
  title,
  type = 'secondary',
  style,
  isLoading = false,
  ...props
}: StyledButtonProps) {
  const primaryColor = useThemeColor({}, 'tint');

  // Define dynamic colors for Secondary/Danger/Disabled states
  const secondaryBg = useThemeColor(
    { light: '#e9ecef', dark: '#2C3036' }, // Light Gray vs Dark Card
    'card',
  );
  const dangerBg = useThemeColor(
    { light: '#f8d7da', dark: '#58151c' }, // Pink vs Dark Red
    'background',
  );
  const disabledBg = useThemeColor(
    { light: '#cccccc', dark: '#3E444A' },
    'icon',
  );

  const dangerText = useThemeColor(
    { light: '#dc3545', dark: '#ff6b6b' }, // Dark Red vs Light Red
    'text',
  );

  const getBackgroundColor = () => {
    if (props.disabled || isLoading) return disabledBg;
    if (type === 'primary') return primaryColor;
    if (type === 'danger') return dangerBg;
    return secondaryBg;
  };

  const getTextColor = () => {
    if (type === 'primary') return 'white';
    if (type === 'danger') return dangerText;
    return primaryColor; // Tint color usually works on both Secondary backgrounds
  };

  return (
    <TouchableOpacity
      style={[styles.button, { backgroundColor: getBackgroundColor() }, style]}
      activeOpacity={0.7}
      disabled={props.disabled || isLoading}
      {...props}>
      {isLoading ? (
        <ActivityIndicator color={getTextColor()} />
      ) : (
        <Text style={[styles.text, { color: getTextColor() }]}>{title}</Text>
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
