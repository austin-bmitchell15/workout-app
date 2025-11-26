import { renderHook, act } from '@testing-library/react-native';
import { useWorkoutForm } from '../useWorkoutForm';
import * as WorkoutService from '@/services/WorkoutService';
import { Alert } from 'react-native';

// 1. Create a mock function for useAuth
const mockUseAuth = jest.fn();

// 2. Mock the module to use our mock function
jest.mock('@/app/_layout', () => ({
  useAuth: () => mockUseAuth(),
}));

jest.spyOn(Alert, 'alert');

describe('useWorkoutForm', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Default: Authenticated user
    mockUseAuth.mockReturnValue({
      session: { user: { id: 'test-user' } },
      profile: { preferred_unit: 'kg' },
    });
  });

  it('should initialize with a default template', () => {
    const { result } = renderHook(() => useWorkoutForm());
    expect(result.current.workout.name).toBe('New Workout');
    expect(result.current.workout.exercises).toHaveLength(0);
  });

  it('should add, update, and remove an exercise', () => {
    const { result } = renderHook(() => useWorkoutForm());

    // Add
    act(() => {
      result.current.addExercise({
        id: 'ex-1',
        name: 'Bench Press',
        image_url: null,
        primary_muscle_group: 'Chest',
      });
    });
    expect(result.current.workout.exercises).toHaveLength(1);
    const exerciseId = result.current.workout.exercises[0].local_id;

    // Update
    act(() => {
      const ex = result.current.workout.exercises[0];
      result.current.updateExercise({ ...ex, notes: 'Heavy day' });
    });
    expect(result.current.workout.exercises[0].notes).toBe('Heavy day');

    // Remove
    act(() => {
      result.current.removeExercise(exerciseId);
    });
    expect(result.current.workout.exercises).toHaveLength(0);
  });

  it('should update workout fields', () => {
    const { result } = renderHook(() => useWorkoutForm());
    act(() => {
      result.current.updateWorkoutField('name', 'Morning Lift');
    });
    expect(result.current.workout.name).toBe('Morning Lift');
  });

  it('should fail to save if user is not logged in', async () => {
    // Mock unauthenticated state
    mockUseAuth.mockReturnValue({ session: null, profile: null });
    const { result } = renderHook(() => useWorkoutForm());
    const saveSpy = jest.spyOn(WorkoutService, 'saveWorkout');

    await act(async () => {
      await result.current.finishWorkout();
    });

    expect(saveSpy).not.toHaveBeenCalled();
    expect(Alert.alert).toHaveBeenCalledWith(
      'Error',
      expect.stringContaining('must be logged in'),
    );
  });

  it('should call saveService when finishing workout', async () => {
    const { result } = renderHook(() => useWorkoutForm());
    // UPDATED: Mock resolved value with correct structure
    const saveSpy = jest
      .spyOn(WorkoutService, 'saveWorkout')
      .mockResolvedValue({ data: { id: '123' }, error: null } as any);

    act(() => {
      result.current.addExercise({
        id: 'ex-1',
        name: 'Pushups',
        image_url: null,
        primary_muscle_group: 'Chest',
      });
    });

    await act(async () => {
      await result.current.finishWorkout();
    });

    expect(saveSpy).toHaveBeenCalledTimes(1);
    expect(result.current.workout.name).toBe('New Workout');
    expect(Alert.alert).toHaveBeenCalledWith('Success!', expect.anything());
  });

  it('should handle errors during saving', async () => {
    const { result } = renderHook(() => useWorkoutForm());

    // UPDATED: Service no longer rejects/throws. It returns { error }.
    jest
      .spyOn(WorkoutService, 'saveWorkout')
      .mockResolvedValue({ data: null, error: new Error('Network Fail') });

    act(() => {
      result.current.addExercise({
        id: 'ex-1',
        name: 'Pushups',
        image_url: null,
        primary_muscle_group: 'Chest',
      });
    });

    await act(async () => {
      await result.current.finishWorkout();
    });

    expect(Alert.alert).toHaveBeenCalledWith(
      'Error',
      expect.stringContaining('Network Fail'),
    );
  });
});
