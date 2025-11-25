/* eslint-env jest */
import mockAsyncStorage from '@react-native-async-storage/async-storage/jest/async-storage-mock';

// 1. Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => mockAsyncStorage);

// 2. Mock Environment Variables
process.env.EXPO_PUBLIC_SUPABASE_API_KEY = 'https://mock-url.supabase.co';
process.env.EXPO_PUBLIC_SUPABASE_SECRET_KEY = 'mock-key';

// 3. Mock Expo Vector Icons (Global Fix)
jest.mock('@expo/vector-icons', () => {
  const { Text } = require('react-native');
  return {
    Ionicons: ({ name }) => <Text>{name}</Text>,
    FontAwesome: ({ name }) => <Text>{name}</Text>,
    MaterialIcons: ({ name }) => <Text>{name}</Text>,
  };
});

// 4. Mock Safe Area Context (Global Fix)
jest.mock('react-native-safe-area-context', () => {
  const { View } = require('react-native');
  return {
    SafeAreaView: ({ children }) => <View>{children}</View>,
    useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
  };
});

// 5. Mock Expo Router (Global Fix for common parts)
jest.mock('expo-router', () => {
  const { View } = require('react-native');
  return {
    Slot: () => <View testID="mock-slot" />,
    useRouter: () => ({ replace: jest.fn(), push: jest.fn(), back: jest.fn() }),
    useSegments: () => [],
    useRootNavigationState: () => ({ key: 'root', routes: [] }),
    Link: ({ children }) => <View>{children}</View>,
  };
});

// 6. Mock Gesture Handler
jest.mock('react-native-gesture-handler', () => {
  const { View } = require('react-native');
  return {
    GestureHandlerRootView: ({ children }) => <View>{children}</View>,
  };
});
