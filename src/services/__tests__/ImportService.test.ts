import { parseStrongCsv, batchSaveWorkouts } from '../ImportService';
import { supabase } from '../supabase';
import { saveWorkout } from '../WorkoutService';

// 1. Mock dependencies
jest.mock('../WorkoutService', () => ({
  saveWorkout: jest.fn(),
}));

// 2. Mock Supabase structure
jest.mock('../supabase', () => ({
  supabase: {
    from: jest.fn(),
  },
}));

describe('ImportService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const mockCsv = `Date,Workout Name,Duration,Exercise Name,Set Order,Weight,Reps
2025-11-17 23:06:28,"Evening Workout",1h 5m,"Bench Press (Barbell)",1,135.0,15.0
2025-11-17 23:06:28,"Evening Workout",1h 5m,"Bench Press (Barbell)",2,205.0,10.0
2025-11-17 23:06:28,"Evening Workout",1h 5m,"Incline Curl (Dumbbell)",1,35.0,8.0
2020-06-22 10:30:35,"Morning Workout",42m,"Arnold Press (Dumbbell)",1,40.0,8.0
`;

  describe('parseStrongCsv', () => {
    it('parses and groups workouts by unique date/name combination', () => {
      const result = parseStrongCsv(mockCsv);
      expect(result).toHaveLength(2);
      expect(result[0].name).toBe('Evening Workout');
      expect(result[1].name).toBe('Morning Workout');
    });

    it('groups exercises and sets correctly within a workout', () => {
      const result = parseStrongCsv(mockCsv);
      const eveningWorkout = result.find(w => w.name === 'Evening Workout');
      expect(eveningWorkout).toBeDefined();
      if (!eveningWorkout) return;

      expect(eveningWorkout.exercises).toHaveLength(2);
      const benchPress = eveningWorkout.exercises.find(
        e => e.name === 'Bench Press (Barbell)',
      );
      expect(benchPress).toBeDefined();
      expect(benchPress?.sets).toHaveLength(2);
      expect(benchPress?.sets[0].weight).toBe(135);
      expect(benchPress?.sets[0].reps).toBe(15);
    });

    it('handles empty or invalid CSV input', () => {
      expect(() => parseStrongCsv('')).toThrow('No data found');
    });
  });

  describe('batchSaveWorkouts', () => {
    // Define the chained mock functions
    const mockMaybeSingle = jest.fn();
    const mockSingle = jest.fn();
    const mockIlike = jest.fn(() => ({ maybeSingle: mockMaybeSingle }));

    // 'select' is used in two contexts:
    // 1. .select('id').ilike(...) -> needs to return { ilike }
    // 2. .insert(...).select().single() -> needs to return { single }
    const mockSelect = jest.fn(() => ({
      ilike: mockIlike,
      single: mockSingle,
    }));

    const mockInsert = jest.fn(() => ({ select: mockSelect }));

    // We cast to jest.Mock to get type support
    const mockFrom = supabase.from as jest.Mock;

    beforeEach(() => {
      // Setup the chain return values
      mockFrom.mockReturnValue({
        select: mockSelect,
        insert: mockInsert,
      });
    });

    const mockParsedWorkouts = [
      {
        id: '1',
        date: '2023-01-01',
        name: 'Test Workout',
        duration: '1h',
        exercises: [
          {
            name: 'Existing Exercise',
            sets: [{ set_number: 1, weight: 100, reps: 10 }],
          },
          {
            name: 'New Exercise',
            sets: [{ set_number: 1, weight: 50, reps: 10 }],
          },
        ],
      },
    ];

    it('resolves exercise IDs, converts weights, and saves workouts', async () => {
      // 1. Mock "Existing Exercise" found
      mockMaybeSingle.mockResolvedValueOnce({ data: { id: 'ex-id-1' } });

      // 2. Mock "New Exercise" NOT found (returns null)
      mockMaybeSingle.mockResolvedValueOnce({ data: null });

      // 3. Mock Insert for "New Exercise" success
      mockSingle.mockResolvedValueOnce({
        data: { id: 'ex-id-2' },
        error: null,
      });

      const onProgress = jest.fn();

      // Trigger the batch save (Simulate User selecting 'lbs' as source)
      await batchSaveWorkouts(mockParsedWorkouts, 'user-1', 'lbs', onProgress);

      // Verify progress callback
      expect(onProgress).toHaveBeenCalledWith(1, 1);

      // Verify DB checks for exercise library
      expect(mockFrom).toHaveBeenCalledWith('exercise_library');

      // Calculate expected KG weights
      const KG_TO_LBS = 2.20462;
      const expectedWeight1 = 100 / KG_TO_LBS;
      const expectedWeight2 = 50 / KG_TO_LBS;

      // Verify Save Call matches the internal logic of ImportService
      expect(saveWorkout).toHaveBeenCalledWith(
        expect.objectContaining({
          workout: expect.objectContaining({
            name: 'Test Workout',
            user_id: 'user-1',
            created_at: expect.any(String),
          }),
          exercises: expect.arrayContaining([
            // Check Existing Exercise
            expect.objectContaining({
              data: expect.objectContaining({
                exercise_library_id: 'ex-id-1',
                user_id: 'user-1',
              }),
              sets: expect.arrayContaining([
                expect.objectContaining({
                  weight: expectedWeight1, // Check conversion
                  unit: 'kg',
                  user_id: 'user-1',
                }),
              ]),
            }),
            // Check New Exercise
            expect.objectContaining({
              data: expect.objectContaining({
                exercise_library_id: 'ex-id-2',
                user_id: 'user-1',
              }),
              sets: expect.arrayContaining([
                expect.objectContaining({
                  weight: expectedWeight2, // Check conversion
                  unit: 'kg',
                }),
              ]),
            }),
          ]),
        }),
      );
    });
  });
});
