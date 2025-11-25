import { renderHook, act } from '@testing-library/react-native';
import { useWorkoutForm } from '../useWorkoutForm';
import * as WorkoutService from '@/services/WorkoutService';
import { Alert } from 'react-native';

// CORRECTION: Mock the root layout where useAuth is defined
jest.mock('@/app/_layout', () => ({
  useAuth: () => ({
    session: { user: { id: 'test-user' } },
    profile: { preferred_unit: 'kg' },
  }),
}));

jest.spyOn(Alert, 'alert');

describe('useWorkoutForm', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should initialize with a default template', () => {
    const { result } = renderHook(() => useWorkoutForm());
    expect(result.current.workout.name).toBe('New Workout');
    expect(result.current.workout.exercises).toHaveLength(0);
  });

  it('should add an exercise', () => {
    const { result } = renderHook(() => useWorkoutForm());

    const mockExercise = { id: 'ex-1', name: 'Bench Press', image_url: '' };

    act(() => {
      result.current.addExercise(mockExercise);
    });

    expect(result.current.workout.exercises).toHaveLength(1);
    expect(result.current.workout.exercises[0].name).toBe('Bench Press');
    expect(result.current.workout.exercises[0].sets).toHaveLength(1);
  });

  it('should update workout fields', () => {
    const { result } = renderHook(() => useWorkoutForm());

    act(() => {
      result.current.updateWorkoutField('name', 'Morning Lift');
    });

    expect(result.current.workout.name).toBe('Morning Lift');
  });

  it('should call saveService when finishing workout', async () => {
    const { result } = renderHook(() => useWorkoutForm());
    // Mock the service to resolve successfully
    const saveSpy = jest
      .spyOn(WorkoutService, 'saveWorkout')
      .mockResolvedValue({} as any);

    // 1. Add an exercise (required to save)
    act(() => {
      result.current.addExercise({ id: 'ex-1', name: 'Pushups' });
    });

    // 2. Finish Workout
    await act(async () => {
      await result.current.finishWorkout();
    });

    // Now this expectation should pass because session.user is mocked correctly
    expect(saveSpy).toHaveBeenCalledTimes(1);
    expect(result.current.workout.name).toBe('New Workout'); // Should reset after save
    expect(Alert.alert).toHaveBeenCalledWith('Success!', expect.anything());
  });

  it('should validate empty workout before saving', async () => {
    const { result } = renderHook(() => useWorkoutForm());
    const saveSpy = jest.spyOn(WorkoutService, 'saveWorkout');

    await act(async () => {
      await result.current.finishWorkout();
    });

    expect(saveSpy).not.toHaveBeenCalled();
    // This expectation should now be correct (Empty Workout instead of "Not Logged In")
    expect(Alert.alert).toHaveBeenCalledWith(
      'Empty Workout',
      expect.anything(),
    );
  });
});
