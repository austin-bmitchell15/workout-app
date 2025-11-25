/* eslint-env jest */
import mockAsyncStorage from '@react-native-async-storage/async-storage/jest/async-storage-mock';

jest.mock('@react-native-async-storage/async-storage', () => mockAsyncStorage);

// Mock Environment Variables
process.env.EXPO_PUBLIC_SUPABASE_API_KEY = 'https://mock-url.supabase.co';
process.env.EXPO_PUBLIC_SUPABASE_SECRET_KEY = 'mock-key';

// Mock Expo Icons
jest.mock('@expo/vector-icons', () => ({
  FontAwesome: 'FontAwesome',
  Ionicons: 'Ionicons',
  MaterialIcons: 'MaterialIcons',
}));
