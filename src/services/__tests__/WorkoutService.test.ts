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
    await saveWorkout(mockWorkout, mockUserId, 'kg');

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

  it('should convert weight from lbs to kg correctly', async () => {
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

    await saveWorkout(mockWorkout, mockUserId, 'lbs');

    const insertedSets = mockSetsInsert.mock.calls[0][0];
    const weight = insertedSets[0].weight;

    expect(weight).toBeCloseTo(102.058, 3);
  });

  it('should throw an error if workout creation fails', async () => {
    const mockSingle = jest
      .fn()
      .mockResolvedValue({ data: null, error: { message: 'DB Error' } });
    const mockInsert = jest.fn(() => ({
      select: jest.fn(() => ({ single: mockSingle })),
    }));
    (supabase.from as jest.Mock).mockReturnValue({ insert: mockInsert });

    await expect(
      saveWorkout(mockWorkout, mockUserId, 'kg'),
    ).rejects.toMatchObject({ message: 'DB Error' });
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
