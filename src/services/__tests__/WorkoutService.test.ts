import { FullWorkoutSubmission } from '@/types/api';
import { saveWorkout, getWorkoutHistory } from '../WorkoutService';
import { supabase } from '../supabase';

// Mock the entire supabase client structure
// Added 'rpc' to the mock since we now use it for saving
jest.mock('../supabase', () => ({
  supabase: {
    from: jest.fn(),
    rpc: jest.fn(),
  },
}));

describe('WorkoutService', () => {
  const mockUserId = 'test-user-id';
  const mockWorkout: FullWorkoutSubmission = {
    workout: {
      name: 'Leg Day',
      notes: 'Focus on form',
      user_id: mockUserId, // Added to match type if strict
    },
    exercises: [
      {
        data: {
          exercise_library_id: 'ex-123',
          user_id: mockUserId,
          notes: 'Go deep',
        },
        sets: [{ user_id: mockUserId, reps: 5, weight: 225, set_number: 1 }],
      },
    ],
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('saveWorkout', () => {
    it('should call the save_full_workout RPC and return data', async () => {
      // 1. Mock RPC success response
      const mockResponse = { id: 'new-workout-id' };
      (supabase.rpc as jest.Mock).mockResolvedValue({
        data: mockResponse,
        error: null,
      });

      // 2. Act
      const result = await saveWorkout(mockWorkout);

      // 3. Assert
      expect(supabase.rpc).toHaveBeenCalledWith('save_full_workout', {
        workout_data: mockWorkout.workout,
        exercises_data: mockWorkout.exercises,
      });
      expect(result).toEqual({ data: mockResponse, error: null });
    });

    it('should return an error object if RPC fails', async () => {
      // 1. Mock RPC failure
      const mockError = { message: 'DB Error' };
      (supabase.rpc as jest.Mock).mockResolvedValue({
        data: null,
        error: mockError,
      });

      // 2. Act
      const result = await saveWorkout(mockWorkout);

      // 3. Assert: It should NOT throw, but return the error
      expect(result.error).toEqual(mockError);
      expect(result.data).toBeNull();
    });
  });

  describe('getWorkoutHistory', () => {
    it('should fetch history ordered by date', async () => {
      const mockData = [{ id: '1', name: 'Morning Lift' }];

      // Chain mocks for .from().select().eq().order()
      const mockOrder = jest
        .fn()
        .mockResolvedValue({ data: mockData, error: null });
      const mockEq = jest.fn(() => ({ order: mockOrder }));
      const mockSelect = jest.fn(() => ({ eq: mockEq }));

      (supabase.from as jest.Mock).mockReturnValue({
        select: mockSelect,
      });

      // Act
      const result = await getWorkoutHistory(mockUserId);

      // Assert
      expect(supabase.from).toHaveBeenCalledWith('workouts');
      expect(mockSelect).toHaveBeenCalledWith(
        expect.stringContaining('workout_exercises'),
      );
      expect(mockEq).toHaveBeenCalledWith('user_id', mockUserId);

      // New check: expecting { data, error } structure
      expect(result.data).toEqual(mockData);
      expect(result.error).toBeNull();
    });

    it('should return error object if fetch fails', async () => {
      const mockError = { message: 'Fetch Error' };

      const mockOrder = jest
        .fn()
        .mockResolvedValue({ data: null, error: mockError });
      const mockEq = jest.fn(() => ({ order: mockOrder }));
      const mockSelect = jest.fn(() => ({ eq: mockEq }));

      (supabase.from as jest.Mock).mockReturnValue({ select: mockSelect });

      // Act
      const result = await getWorkoutHistory(mockUserId);

      // Assert: Should not throw
      expect(result.data).toBeNull();
      expect(result.error).toEqual(mockError);
    });
  });
});
