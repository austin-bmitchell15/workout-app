import { saveWorkout } from '../WorkoutService';
import { supabase } from '../supabase';

// Mock the entire supabase client structure
jest.mock('../supabase', () => ({
  supabase: {
    from: jest.fn(),
  },
}));

describe('WorkoutService', () => {
  const mockUserId = 'test-user-id';
  const mockWorkout = {
    name: 'Leg Day',
    notes: 'Focus on form',
    exercises: [
      {
        local_id: 'local-1',
        exercise_library_id: 'ex-123',
        name: 'Squat',
        image_url: 'http://example.com/squat.png',
        notes: 'Go deep',
        sets: [{ local_id: 's-1', reps: '5', weight: '225', set_number: 1 }],
      },
    ],
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should save a workout and exercises successfully', async () => {
    // We need to chain mocks: .from().insert().select().single()
    // We use a helper to create a "query builder" mock
    const mockSingle = jest.fn();
    const mockSelect = jest.fn(() => ({ single: mockSingle }));
    const mockInsert = jest.fn(() => ({ select: mockSelect }));

    // Default implementation for tables that return data (workouts, workout_exercises)
    (supabase.from as jest.Mock).mockReturnValue({
      insert: mockInsert,
    });

    // 1. Mock Workout response
    mockSingle.mockResolvedValueOnce({
      data: { id: 'new-workout-1' },
      error: null,
    });

    // 2. Mock WorkoutExercise response
    mockSingle.mockResolvedValueOnce({
      data: { id: 'new-wo-exercise-1' },
      error: null,
    });

    // 3. Mock Sets response
    const mockSetsInsert = jest.fn().mockResolvedValue({ error: null });

    // Override the mock for the 'sets' table specifically
    (supabase.from as jest.Mock).mockImplementation((table: string) => {
      if (table === 'sets') {
        return { insert: mockSetsInsert };
      }
      return { insert: mockInsert };
    });

    // Act
    await saveWorkout(mockWorkout, mockUserId, 'kg');

    // Assert
    // Check Workout Insert
    expect(supabase.from).toHaveBeenCalledWith('workouts');
    expect(mockInsert).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'Leg Day',
        user_id: mockUserId,
      }),
    );

    // Check Exercise Insert
    expect(supabase.from).toHaveBeenCalledWith('workout_exercises');
    expect(mockInsert).toHaveBeenCalledWith(
      expect.objectContaining({
        workout_id: 'new-workout-1', // Should use the ID from step 1
        exercise_library_id: 'ex-123',
      }),
    );

    // Check Sets Insert
    expect(supabase.from).toHaveBeenCalledWith('sets');
    expect(mockSetsInsert).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({
          workout_exercise_id: 'new-wo-exercise-1',
          weight: 225, // No conversion because we passed 'kg'
        }),
      ]),
    );
  });

  it('should convert weight from lbs to kg correctly', async () => {
    // Setup generic successful mocks
    const mockSingle = jest
      .fn()
      .mockResolvedValue({ data: { id: 'id' }, error: null });
    const mockInsert = jest.fn(() => ({
      select: jest.fn(() => ({ single: mockSingle })),
    }));
    const mockSetsInsert = jest.fn().mockResolvedValue({ error: null });

    (supabase.from as jest.Mock).mockImplementation(table =>
      table === 'sets' ? { insert: mockSetsInsert } : { insert: mockInsert },
    );

    // Act with 'lbs' preferred unit
    await saveWorkout(mockWorkout, mockUserId, 'lbs');

    // Assert
    // 225 lbs / 2.20462 ≈ 102.058
    const insertedSets = mockSetsInsert.mock.calls[0][0];
    const weight = insertedSets[0].weight;

    expect(weight).toBeCloseTo(102.058, 3);
  });

  it('should throw an error if workout creation fails', async () => {
    // Mock failure
    const mockSingle = jest
      .fn()
      .mockResolvedValue({ data: null, error: { message: 'DB Error' } });
    const mockInsert = jest.fn(() => ({
      select: jest.fn(() => ({ single: mockSingle })),
    }));
    (supabase.from as jest.Mock).mockReturnValue({ insert: mockInsert });

    // Act & Assert
    await expect(
      saveWorkout(mockWorkout, mockUserId, 'kg'),
    ).rejects.toMatchObject({ message: 'DB Error' });
  });
});
