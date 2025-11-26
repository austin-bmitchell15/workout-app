import React from 'react';
import { render, fireEvent, screen } from '@testing-library/react-native';
import ExerciseLogger from '../ExerciseLogger';
import { LocalExercise } from '@/types/types';

// Mock theme hook to return simple colors for testing
jest.mock('@/hooks/theme/use-theme-color', () => ({
  useThemeColor: () => '#000',
}));

describe('ExerciseLogger', () => {
  const mockExercise: LocalExercise = {
    local_id: 'ex-1',
    exercise_library_id: 'lib-1',
    name: 'Squat',
    notes: 'Keep back straight',
    image_url: '',
    sets: [
      { local_id: 's-1', reps: '10', weight: '100', set_number: 1 },
      { local_id: 's-2', reps: '8', weight: '110', set_number: 2 },
    ],
  };

  const mockOnChange = jest.fn();
  const mockOnRemove = jest.fn();
  const mockGenerateId = jest.fn(() => 'new-id');

  const defaultProps = {
    exercise: mockExercise,
    onChange: mockOnChange,
    onRemove: mockOnRemove,
    generateLocalId: mockGenerateId,
    preferredUnit: 'KG' as const,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders exercise name and sets', () => {
    render(<ExerciseLogger {...defaultProps} />);
    expect(screen.getByText('Squat')).toBeTruthy();
    expect(screen.getByDisplayValue('Keep back straight')).toBeTruthy();
    // Use testIDs or text finding for numbers
    expect(screen.getByText('1')).toBeTruthy();
    expect(screen.getByText('2')).toBeTruthy();
  });

  it('calls onRemove when trash icon is pressed', () => {
    render(<ExerciseLogger {...defaultProps} />);

    // Now we can target the button reliably
    fireEvent.press(screen.getByTestId('remove-exercise-btn'));

    expect(mockOnRemove).toHaveBeenCalledWith('ex-1');
  });

  it('updates notes when text changes', () => {
    render(<ExerciseLogger {...defaultProps} />);
    const notesInput = screen.getByPlaceholderText('Notes');
    fireEvent.changeText(notesInput, 'New notes');
    expect(mockOnChange).toHaveBeenCalledWith({
      ...mockExercise,
      notes: 'New notes',
    });
  });

  it('adds a new set when Add Set is pressed', () => {
    render(<ExerciseLogger {...defaultProps} />);

    // Robust selection using testID
    fireEvent.press(screen.getByTestId('add-set-btn'));

    expect(mockGenerateId).toHaveBeenCalled();
    expect(mockOnChange).toHaveBeenCalledWith(
      expect.objectContaining({
        sets: expect.arrayContaining([
          expect.objectContaining({ set_number: 3 }),
        ]),
      }),
    );
  });

  it('updates a set when modified', () => {
    render(<ExerciseLogger {...defaultProps} />);

    const weightInput = screen.getByTestId('set-weight-s-1');

    fireEvent.changeText(weightInput, '105');

    const calledArg = mockOnChange.mock.calls[0][0];
    expect(calledArg.sets[0].weight).toBe('105');
  });
});
