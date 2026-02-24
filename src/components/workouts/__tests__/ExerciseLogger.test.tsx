import React from 'react';
import { render, fireEvent, screen } from '@testing-library/react-native';
import ExerciseLogger from '../ExerciseLogger';
import { LocalExercise } from '@/types/types';
import { generateLocalId } from '@/utils/helpers';

// 1. Mock the module completely
jest.mock('@/utils/helpers', () => ({
  generateLocalId: jest.fn(),
  // We don't need to mock lbsToKg/kgToLbs here as they aren't used in this component,
  // but if they were, we would add them here.
}));

// Mock theme hook
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

  const defaultProps = {
    exercise: mockExercise,
    onChange: mockOnChange,
    onRemove: mockOnRemove,
    preferredUnit: 'KG' as const,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    // 2. Set the return value for the mock
    (generateLocalId as jest.Mock).mockReturnValue('new-id');
  });

  it('renders exercise name and sets', () => {
    render(<ExerciseLogger {...defaultProps} />);
    expect(screen.getByText('Squat')).toBeTruthy();
    expect(screen.getByDisplayValue('Keep back straight')).toBeTruthy();
    expect(screen.getByText('1')).toBeTruthy();
    expect(screen.getByText('2')).toBeTruthy();
  });

  it('calls onRemove when trash icon is pressed', () => {
    render(<ExerciseLogger {...defaultProps} />);
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

    fireEvent.press(screen.getByTestId('add-set-btn'));

    // 3. Assert on the imported mock
    expect(generateLocalId).toHaveBeenCalled();

    expect(mockOnChange).toHaveBeenCalledWith(
      expect.objectContaining({
        sets: expect.arrayContaining([
          expect.objectContaining({ set_number: 3, local_id: 'new-id' }),
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
