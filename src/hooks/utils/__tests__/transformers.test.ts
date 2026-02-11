import { transformWorkoutForSubmission } from '../transformers';
import { LocalWorkout } from '@/types/types';

describe('transformWorkoutForSubmission', () => {
  const userId = 'user-123';

  const makeWorkout = (
    overrides: Partial<LocalWorkout> = {},
  ): LocalWorkout => ({
    name: 'Test Workout',
    notes: 'Some notes',
    exercises: [
      {
        local_id: 'ex-1',
        exercise_library_id: 'lib-1',
        name: 'Bench Press',
        image_url: null,
        notes: 'Go heavy',
        sets: [
          { local_id: 's-1', reps: '5', weight: '225', set_number: 1 },
          { local_id: 's-2', reps: '5', weight: '215', set_number: 2 },
        ],
      },
    ],
    ...overrides,
  });

  it('should pass through KG weights unchanged', () => {
    const result = transformWorkoutForSubmission(makeWorkout(), userId, 'KG');

    expect(result.exercises[0].sets[0].weight).toBe(225);
    expect(result.exercises[0].sets[1].weight).toBe(215);
  });

  it('should convert LB weights to KG', () => {
    const result = transformWorkoutForSubmission(makeWorkout(), userId, 'LB');

    // 225 lbs / 2.20462 ≈ 102.06 kg
    expect(result.exercises[0].sets[0].weight).toBeCloseTo(225 / 2.20462);
    expect(result.exercises[0].sets[1].weight).toBeCloseTo(215 / 2.20462);
  });

  it('should handle null unit as KG passthrough', () => {
    const result = transformWorkoutForSubmission(makeWorkout(), userId, null);

    expect(result.exercises[0].sets[0].weight).toBe(225);
  });

  it('should handle empty exercises array', () => {
    const result = transformWorkoutForSubmission(
      makeWorkout({ exercises: [] }),
      userId,
      'KG',
    );

    expect(result.exercises).toHaveLength(0);
    expect(result.workout.name).toBe('Test Workout');
  });

  it('should default empty weight to 0', () => {
    const workout = makeWorkout({
      exercises: [
        {
          local_id: 'ex-1',
          exercise_library_id: 'lib-1',
          name: 'Pushups',
          image_url: null,
          notes: '',
          sets: [{ local_id: 's-1', reps: '10', weight: '', set_number: 1 }],
        },
      ],
    });

    const result = transformWorkoutForSubmission(workout, userId, 'KG');
    expect(result.exercises[0].sets[0].weight).toBe(0);
  });

  it('should default empty reps to 0', () => {
    const workout = makeWorkout({
      exercises: [
        {
          local_id: 'ex-1',
          exercise_library_id: 'lib-1',
          name: 'Pushups',
          image_url: null,
          notes: '',
          sets: [{ local_id: 's-1', reps: '', weight: '100', set_number: 1 }],
        },
      ],
    });

    const result = transformWorkoutForSubmission(workout, userId, 'KG');
    expect(result.exercises[0].sets[0].reps).toBe(0);
  });

  it('should use "Untitled Workout" when name is empty', () => {
    const result = transformWorkoutForSubmission(
      makeWorkout({ name: '' }),
      userId,
      'KG',
    );

    expect(result.workout.name).toBe('Untitled Workout');
  });

  it('should set user_id on workout, exercise data, and sets', () => {
    const result = transformWorkoutForSubmission(makeWorkout(), userId, 'KG');

    expect(result.workout.user_id).toBe(userId);
    expect(result.exercises[0].data.user_id).toBe(userId);
    expect(result.exercises[0].sets[0].user_id).toBe(userId);
  });
});
