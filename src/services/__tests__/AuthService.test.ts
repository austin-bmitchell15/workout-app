import {
  signInWithEmail,
  signUpWithEmail,
  signOut,
  getInitialSession,
  onAuthStateChange,
  getUserProfile,
} from '../AuthService';
import { supabase } from '../supabase';

// Mock Supabase
jest.mock('../supabase', () => ({
  supabase: {
    auth: {
      signInWithPassword: jest.fn(),
      signUp: jest.fn(),
      signOut: jest.fn(),
      getSession: jest.fn(),
      onAuthStateChange: jest.fn(),
    },
    from: jest.fn(),
  },
}));

// Testing
describe('AuthService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('signInWithEmail', () => {
    it('should call supabase signInWithPassword with correct credentials', async () => {
      (supabase.auth.signInWithPassword as jest.Mock).mockResolvedValue({
        data: { user: { id: '123' } },
        error: null,
      });

      await signInWithEmail('test@example.com', 'password123');

      expect(supabase.auth.signInWithPassword).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
      });
    });
  });

  describe('signUpWithEmail', () => {
    it('should call supabase signUp with correct credentials', async () => {
      (supabase.auth.signUp as jest.Mock).mockResolvedValue({
        data: { user: { id: '123' } },
        error: null,
      });

      await signUpWithEmail('new@example.com', 'password123');

      expect(supabase.auth.signUp).toHaveBeenCalledWith({
        email: 'new@example.com',
        password: 'password123',
      });
    });
  });

  describe('signOut', () => {
    it('should call supabase signOut', async () => {
      (supabase.auth.signOut as jest.Mock).mockResolvedValue({ error: null });

      await signOut();

      expect(supabase.auth.signOut).toHaveBeenCalled();
    });
  });

  describe('getInitialSession', () => {
    it('should return session data', async () => {
      const mockSession = { user: { id: '123' } };
      (supabase.auth.getSession as jest.Mock).mockResolvedValue({
        data: { session: mockSession },
        error: null,
      });

      const result = await getInitialSession();
      expect(result).toEqual(mockSession);
    });

    it('should handle errors', async () => {
      (supabase.auth.getSession as jest.Mock).mockResolvedValue({
        data: { session: null },
        error: { message: 'Session error' },
      });

      const result = await getInitialSession();
      expect(result).toBeNull();
    });
  });

  describe('onAuthStateChange', () => {
    it('should setup auth listener', () => {
      const mockUnsubscribe = jest.fn();
      (supabase.auth.onAuthStateChange as jest.Mock).mockReturnValue({
        data: { subscription: { unsubscribe: mockUnsubscribe } },
      });

      const callback = jest.fn();
      const subscription = onAuthStateChange(callback);

      expect(supabase.auth.onAuthStateChange).toHaveBeenCalled();
      expect(subscription.unsubscribe).toBeDefined();
    });
  });

  describe('getUserProfile', () => {
    it('should fetch profile data', async () => {
      const mockProfile = { id: '123', username: 'Test User' };

      const mockSingle = jest
        .fn()
        .mockResolvedValue({ data: mockProfile, error: null });
      const mockEq = jest.fn(() => ({ single: mockSingle }));
      const mockSelect = jest.fn(() => ({ eq: mockEq }));

      (supabase.from as jest.Mock).mockReturnValue({ select: mockSelect });

      const result = await getUserProfile('123');

      expect(supabase.from).toHaveBeenCalledWith('profiles');
      expect(mockSelect).toHaveBeenCalledWith('*');
      expect(mockEq).toHaveBeenCalledWith('id', '123');
      expect(result.data).toEqual(mockProfile);
    });
  });
});
