import React from 'react';
import { render, waitFor, screen } from '@testing-library/react-native';
import RootLayout from '../_layout';
import * as AuthService from '@/services/AuthService';

// Mock local dependencies
jest.mock('expo-font', () => ({ useFonts: () => [true] }));
jest.mock('expo-splash-screen', () => ({
  preventAutoHideAsync: jest.fn(),
  hideAsync: jest.fn(),
}));
jest.mock('@/hooks/theme/use-color-scheme.web', () => ({
  useColorScheme: () => 'light',
}));

// Complete Mock for AuthService
jest.mock('@/services/AuthService', () => ({
  signOut: jest.fn(),
  getInitialSession: jest.fn(),
  onAuthStateChange: jest.fn(),
  getUserProfile: jest.fn(),
}));

describe('RootLayout', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('initializes session and renders slot', async () => {
    (AuthService.getInitialSession as jest.Mock).mockResolvedValue(null);
    (AuthService.onAuthStateChange as jest.Mock).mockReturnValue({
      unsubscribe: jest.fn(),
    });

    render(<RootLayout />);

    await waitFor(() => {
      expect(AuthService.getInitialSession).toHaveBeenCalled();
    });

    await waitFor(() => {
      expect(screen.getByTestId('mock-slot')).toBeTruthy();
    });
  });
});
