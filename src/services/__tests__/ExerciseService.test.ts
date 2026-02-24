import { fetchExerciseLibrary } from '../ExerciseService';
import { supabase } from '../supabase';

jest.mock('../supabase', () => ({
  supabase: {
    from: jest.fn(),
  },
}));

describe('ExerciseService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('fetchExerciseLibrary', () => {
    it('should fetch exercises ordered by name', async () => {
      const mockData = [
        {
          id: '1',
          name: 'Bench Press',
          image_url: null,
          primary_muscle_group: 'Chest',
        },
        {
          id: '2',
          name: 'Squat',
          image_url: null,
          primary_muscle_group: 'Legs',
        },
      ];

      const mockOrder = jest
        .fn()
        .mockResolvedValue({ data: mockData, error: null });
      const mockSelect = jest.fn(() => ({ order: mockOrder }));

      (supabase.from as jest.Mock).mockReturnValue({ select: mockSelect });

      const result = await fetchExerciseLibrary();

      expect(supabase.from).toHaveBeenCalledWith('exercise_library');
      expect(mockSelect).toHaveBeenCalledWith(
        'id, name, image_url, primary_muscle_group',
      );
      expect(mockOrder).toHaveBeenCalledWith('name');
      expect(result.data).toEqual(mockData);
      expect(result.error).toBeNull();
    });

    it('should return error when fetch fails', async () => {
      const mockError = { message: 'DB connection failed' };

      const mockOrder = jest
        .fn()
        .mockResolvedValue({ data: null, error: mockError });
      const mockSelect = jest.fn(() => ({ order: mockOrder }));

      (supabase.from as jest.Mock).mockReturnValue({ select: mockSelect });

      const result = await fetchExerciseLibrary();

      expect(result.data).toBeNull();
      expect(result.error).toEqual(mockError);
    });
  });
});
