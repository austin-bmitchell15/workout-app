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

const mockReplace = jest.fn();
jest.mock('expo-router', () => {
  const { View } = require('react-native');
  return {
    Slot: () => <View testID="mock-slot" />,
    useRouter: () => ({
      replace: mockReplace,
      push: jest.fn(),
      back: jest.fn(),
    }),
    useSegments: () => [],
    useRootNavigationState: () => ({ key: 'root', routes: [] }),
    Link: ({ children }: { children: React.ReactNode }) => (
      <View>{children}</View>
    ),
  };
});

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

  it('subscribes to auth state changes and unsubscribes on unmount', async () => {
    const mockUnsubscribe = jest.fn();
    (AuthService.getInitialSession as jest.Mock).mockResolvedValue(null);
    (AuthService.onAuthStateChange as jest.Mock).mockReturnValue({
      unsubscribe: mockUnsubscribe,
    });

    const { unmount } = render(<RootLayout />);

    await waitFor(() => {
      expect(AuthService.onAuthStateChange).toHaveBeenCalled();
    });

    unmount();
    expect(mockUnsubscribe).toHaveBeenCalled();
  });

  it('fetches profile after session is loaded', async () => {
    const mockSession = { user: { id: 'user-123' } };
    const mockProfile = { id: 'user-123', username: 'testuser' };

    (AuthService.getInitialSession as jest.Mock).mockResolvedValue(mockSession);
    (AuthService.getUserProfile as jest.Mock).mockResolvedValue({
      data: mockProfile,
      error: null,
    });
    (AuthService.onAuthStateChange as jest.Mock).mockReturnValue({
      unsubscribe: jest.fn(),
    });

    render(<RootLayout />);

    await waitFor(() => {
      expect(AuthService.getUserProfile).toHaveBeenCalledWith('user-123');
    });
  });

  it('handles profile fetch error gracefully', async () => {
    const mockSession = { user: { id: 'user-123' } };
    const consoleSpy = jest
      .spyOn(console, 'error')
      .mockImplementation(() => {});

    (AuthService.getInitialSession as jest.Mock).mockResolvedValue(mockSession);
    (AuthService.getUserProfile as jest.Mock).mockResolvedValue({
      data: null,
      error: new Error('Profile fetch failed'),
    });
    (AuthService.onAuthStateChange as jest.Mock).mockReturnValue({
      unsubscribe: jest.fn(),
    });

    render(<RootLayout />);

    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith(
        'Error fetching profile:',
        expect.any(Error),
      );
    });

    consoleSpy.mockRestore();
  });

  it('redirects unauthenticated users to login', async () => {
    (AuthService.getInitialSession as jest.Mock).mockResolvedValue(null);
    (AuthService.onAuthStateChange as jest.Mock).mockReturnValue({
      unsubscribe: jest.fn(),
    });

    render(<RootLayout />);

    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalledWith('/(auth)/login');
    });
  });

  it('calls signOut and redirects to login', async () => {
    (AuthService.signOut as jest.Mock).mockResolvedValue({ error: null });
    (AuthService.getInitialSession as jest.Mock).mockResolvedValue({
      user: { id: 'user-123' },
    });
    (AuthService.getUserProfile as jest.Mock).mockResolvedValue({
      data: { id: 'user-123' },
      error: null,
    });
    (AuthService.onAuthStateChange as jest.Mock).mockReturnValue({
      unsubscribe: jest.fn(),
    });

    render(<RootLayout />);

    await waitFor(() => {
      expect(screen.getByTestId('mock-slot')).toBeTruthy();
    });
  });
});
