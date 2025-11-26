import { FullWorkoutSubmission } from '@/types/types';
import { saveWorkout, getWorkoutHistory } from '../WorkoutService';
import { supabase } from '../supabase';

// Mock the entire supabase client structure
jest.mock('../supabase', () => ({
  supabase: {
    from: jest.fn(),
  },
}));

describe('WorkoutService', () => {
  const mockUserId = 'test-user-id';
  const mockWorkout: FullWorkoutSubmission = {
    workout: {
      name: 'Leg Day',
      notes: 'Focus on form',
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

  it('should save a workout and exercises successfully', async () => {
    // Chain mocks: .from().insert().select().single()
    const mockSingle = jest.fn();
    const mockSelect = jest.fn(() => ({ single: mockSingle }));
    const mockInsert = jest.fn(() => ({ select: mockSelect }));

    // Default implementation for tables
    (supabase.from as jest.Mock).mockReturnValue({
      insert: mockInsert,
    });

    // 1. Workout Response
    mockSingle.mockResolvedValueOnce({
      data: { id: 'new-workout-1' },
      error: null,
    });

    // 2. Workout Exercise Response
    mockSingle.mockResolvedValueOnce({
      data: { id: 'new-wo-exercise-1' },
      error: null,
    });

    // 3. Sets Response
    const mockSetsInsert = jest.fn().mockResolvedValue({ error: null });

    // Override mock for 'sets' table
    (supabase.from as jest.Mock).mockImplementation((table: string) => {
      if (table === 'sets') {
        return { insert: mockSetsInsert };
      }
      return { insert: mockInsert };
    });

    // Act
    await saveWorkout(mockWorkout);

    // Assert
    expect(supabase.from).toHaveBeenCalledWith('workouts');
    expect(supabase.from).toHaveBeenCalledWith('workout_exercises');

    // Check Sets Insert
    expect(supabase.from).toHaveBeenCalledWith('sets');
    expect(mockSetsInsert).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({
          workout_exercises_id: 'new-wo-exercise-1', // Plural column name
          weight: 225,
        }),
      ]),
    );
  });

  it('should throw an error if workout creation fails', async () => {
    const mockSingle = jest
      .fn()
      .mockResolvedValue({ data: null, error: { message: 'DB Error' } });
    const mockInsert = jest.fn(() => ({
      select: jest.fn(() => ({ single: mockSingle })),
    }));
    (supabase.from as jest.Mock).mockReturnValue({ insert: mockInsert });

    await expect(saveWorkout(mockWorkout)).rejects.toMatchObject({
      message: 'DB Error',
    });
  });

  describe('getWorkoutHistory', () => {
    it('should fetch history ordered by date', async () => {
      const mockData = [{ id: '1', name: 'Morning Lift' }];

      const mockOrder = jest
        .fn()
        .mockResolvedValue({ data: mockData, error: null });
      const mockEq = jest.fn(() => ({ order: mockOrder }));
      const mockSelect = jest.fn(() => ({ eq: mockEq }));

      (supabase.from as jest.Mock).mockReturnValue({
        select: mockSelect,
      });

      const result = await getWorkoutHistory(mockUserId);

      expect(supabase.from).toHaveBeenCalledWith('workouts');
      expect(mockSelect).toHaveBeenCalledWith(
        expect.stringContaining('workout_exercises'),
      );
      expect(mockEq).toHaveBeenCalledWith('user_id', mockUserId);
      expect(result).toEqual(mockData);
    });

    it('should throw error if fetch fails', async () => {
      const mockOrder = jest
        .fn()
        .mockResolvedValue({ data: null, error: { message: 'Fetch Error' } });
      const mockEq = jest.fn(() => ({ order: mockOrder }));
      const mockSelect = jest.fn(() => ({ eq: mockEq }));

      (supabase.from as jest.Mock).mockReturnValue({ select: mockSelect });

      await expect(getWorkoutHistory(mockUserId)).rejects.toMatchObject({
        message: 'Fetch Error',
      });
    });
  });
});
