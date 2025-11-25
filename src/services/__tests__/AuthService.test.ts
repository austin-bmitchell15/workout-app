import { signInWithEmail, signUpWithEmail } from '../AuthService';
import { supabase } from '../supabase';

// Mock Supabase
jest.mock('../supabase', () => ({
  supabase: {
    auth: {
      signInWithPassword: jest.fn(),
      signUp: jest.fn(),
    },
  },
}));

describe('AuthService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('signInWithEmail', () => {
    it('should call supabase signInWithPassword with correct credentials', async () => {
      // Mock success response
      (supabase.auth.signInWithPassword as jest.Mock).mockResolvedValue({
        data: { user: { id: '123' } },
        error: null,
      });

      const email = 'test@example.com';
      const password = 'password123';

      await signInWithEmail(email, password);

      expect(supabase.auth.signInWithPassword).toHaveBeenCalledWith({
        email,
        password,
      });
    });

    it('should return error if sign in fails', async () => {
      const mockError = { message: 'Invalid login' };
      (supabase.auth.signInWithPassword as jest.Mock).mockResolvedValue({
        data: { user: null },
        error: mockError,
      });

      const result = await signInWithEmail('test@example.com', 'wrongpass');

      expect(result.error).toEqual(mockError);
    });
  });

  describe('signUpWithEmail', () => {
    it('should call supabase signUp with correct credentials', async () => {
      (supabase.auth.signUp as jest.Mock).mockResolvedValue({
        data: { user: { id: '123' } },
        error: null,
      });

      const email = 'new@example.com';
      const password = 'password123';

      await signUpWithEmail(email, password);

      expect(supabase.auth.signUp).toHaveBeenCalledWith({
        email,
        password,
      });
    });
  });
});
