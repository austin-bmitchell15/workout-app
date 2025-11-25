import React from 'react';
import { render, screen } from '@testing-library/react-native';
import WorkoutHistoryCard, { formatDate } from '../WorkoutHistoryCard';

// Mock theme
jest.mock('@/hooks/theme/use-theme-color', () => ({
  useThemeColor: () => '#000',
}));

// Testing
describe('WorkoutHistoryCard', () => {
  const mockWorkout = {
    id: '1',
    name: 'Leg Day',
    created_at: '2023-10-27T10:00:00Z',
    workout_exercises: [
      {
        id: 'we-1',
        exercise_library: { name: 'Squat' },
        sets: [{}, {}, {}], // 3 sets
      },
      {
        id: 'we-2',
        exercise_library: { name: 'Lunge' },
        sets: [{}, {}], // 2 sets
      },
    ],
  };

  it('renders workout details correctly', () => {
    render(<WorkoutHistoryCard workout={mockWorkout} />);

    expect(screen.getByText('Leg Day')).toBeTruthy();
    // Check for total sets (3 + 2 = 5)
    expect(screen.getByText('5 Sets')).toBeTruthy();
  });

  it('renders exercise list', () => {
    render(<WorkoutHistoryCard workout={mockWorkout} />);

    expect(screen.getByText(/Squat/)).toBeTruthy();
    expect(screen.getByText(/3 sets/)).toBeTruthy();
    expect(screen.getByText(/Lunge/)).toBeTruthy();
  });

  it('formats date correctly', () => {
    // Just testing the helper function logic directly for sanity
    const formatted = formatDate('2023-10-27T10:00:00Z');
    // Result depends on locale, but should contain the month
    expect(formatted).toEqual(expect.stringMatching(/[A-Za-z]+ \d+/));
  });
});
