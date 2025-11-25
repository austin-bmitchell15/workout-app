import React from 'react';
import {
  render,
  fireEvent,
  screen,
  waitFor,
} from '@testing-library/react-native';
import LoginScreen from '../login';
import { supabase } from '@/services/supabase';
import { Alert } from 'react-native';

// 1. Mock Supabase
jest.mock('@/services/supabase', () => ({
  supabase: {
    auth: {
      signInWithPassword: jest.fn(),
    },
  },
}));

// 2. Mock Expo Router
jest.mock('expo-router', () => ({
  Link: ({ children }: { children: React.ReactNode }) => children,
  router: {
    replace: jest.fn(),
  },
}));

// 3. Mock Theme Hook
jest.mock('@/hooks/theme/use-theme-color', () => ({
  useThemeColor: () => '#000000',
}));

// 4. Spy on Alert
jest.spyOn(Alert, 'alert');

describe('LoginScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders correctly', () => {
    render(<LoginScreen />);

    expect(screen.getByText('Welcome Back!')).toBeTruthy();
    expect(screen.getByPlaceholderText('Email')).toBeTruthy();
    expect(screen.getByPlaceholderText('Password')).toBeTruthy();
  });

  it('handles user input', () => {
    render(<LoginScreen />);

    fireEvent.changeText(
      screen.getByPlaceholderText('Email'),
      'test@example.com',
    );
    fireEvent.changeText(
      screen.getByPlaceholderText('Password'),
      'password123',
    );

    expect(screen.getByDisplayValue('test@example.com')).toBeTruthy();
    expect(screen.getByDisplayValue('password123')).toBeTruthy();
  });

  it('calls sign in on button press', async () => {
    (supabase.auth.signInWithPassword as jest.Mock).mockResolvedValue({
      error: null,
    });

    render(<LoginScreen />);

    fireEvent.changeText(
      screen.getByPlaceholderText('Email'),
      'test@example.com',
    );
    fireEvent.changeText(screen.getByPlaceholderText('Password'), 'pass');

    fireEvent.press(screen.getByText('Login'));

    await waitFor(() => {
      expect(supabase.auth.signInWithPassword).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'pass',
      });
    });

    await waitFor(() => {
      expect(screen.getByText('Login')).toBeTruthy();
    });
  });

  it('shows alert on login failure', async () => {
    (supabase.auth.signInWithPassword as jest.Mock).mockResolvedValue({
      error: { message: 'Invalid credentials' },
    });

    render(<LoginScreen />);

    fireEvent.changeText(
      screen.getByPlaceholderText('Email'),
      'test@example.com',
    );
    fireEvent.changeText(screen.getByPlaceholderText('Password'), 'wrong');
    fireEvent.press(screen.getByText('Login'));

    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith('Error', 'Invalid credentials');
    });

    await waitFor(() => {
      expect(screen.getByText('Login')).toBeTruthy();
    });
  });
});
