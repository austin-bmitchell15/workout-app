import { parseStrongCsv } from '../ImportService';

describe('ImportService', () => {
  const mockCsv = `Date,Workout Name,Duration,Exercise Name,Set Order,Weight,Reps,Distance,Seconds,RPE
2025-11-17 23:06:28,"Evening Workout",1h 5m,"Bench Press (Barbell)",1,135.0,15.0,0,0.0,
2025-11-17 23:06:28,"Evening Workout",1h 5m,"Bench Press (Barbell)",2,205.0,10.0,0,0.0,
2025-11-17 23:06:28,"Evening Workout",1h 5m,"Incline Curl (Dumbbell)",1,35.0,8.0,0,0.0,
2020-06-22 10:30:35,"Morning Workout",42m,"Arnold Press (Dumbbell)",1,40.0,8.0,0,0.0,
`;

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
  });

  it('handles empty or invalid CSV input', () => {
    expect(() => parseStrongCsv('')).toThrow('No data found');
    expect(() => parseStrongCsv('invalid,data\n')).toThrow();
  });
});
