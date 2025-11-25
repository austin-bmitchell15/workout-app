import React from 'react';
import { render, fireEvent, screen } from '@testing-library/react-native';
import ActiveWorkout from '../ActiveWorkout';
import { useWorkoutForm } from '@/hooks/useWorkoutForm';

// Mock the custom hook
jest.mock('@/hooks/useWorkoutForm');

describe('ActiveWorkout Component', () => {
  // Default mock values
  const mockHookValues = {
    workout: {
      name: 'Test Workout',
      notes: '',
      exercises: [],
    },
    isSaving: false,
    isPickerVisible: false,
    preferredUnit: 'kg',
    setPickerVisible: jest.fn(),
    updateWorkoutField: jest.fn(),
    addExercise: jest.fn(),
    removeExercise: jest.fn(),
    updateExercise: jest.fn(),
    finishWorkout: jest.fn(),
    resetWorkout: jest.fn(),
    generateLocalId: jest.fn(),
  };

  beforeEach(() => {
    (useWorkoutForm as jest.Mock).mockReturnValue(mockHookValues);
    jest.clearAllMocks();
  });

  it('renders the workout name input', () => {
    render(<ActiveWorkout />);
    expect(screen.getByPlaceholderText('Workout Name')).toBeTruthy();
    expect(screen.getByDisplayValue('Test Workout')).toBeTruthy();
  });

  it('updates workout name on text change', () => {
    render(<ActiveWorkout />);
    const input = screen.getByPlaceholderText('Workout Name');

    fireEvent.changeText(input, 'New Name');

    expect(mockHookValues.updateWorkoutField).toHaveBeenCalledWith(
      'name',
      'New Name',
    );
  });

  it('opens the exercise picker when Add Exercise is pressed', () => {
    render(<ActiveWorkout />);
    const addButton = screen.getByText('+ Add Exercise');

    fireEvent.press(addButton);

    expect(mockHookValues.setPickerVisible).toHaveBeenCalledWith(true);
  });

  it('calls finishWorkout when Finish button is pressed', () => {
    render(<ActiveWorkout />);
    const finishButton = screen.getByText('Finish Workout');

    fireEvent.press(finishButton);

    expect(mockHookValues.finishWorkout).toHaveBeenCalled();
  });

  it('shows loading state when isSaving is true', () => {
    // Override hook to return loading state
    (useWorkoutForm as jest.Mock).mockReturnValue({
      ...mockHookValues,
      isSaving: true,
    });

    render(<ActiveWorkout />);

    expect(screen.getByText('Saving Workout...')).toBeTruthy();
    expect(screen.queryByPlaceholderText('Workout Name')).toBeNull(); // Inputs should be hidden
  });

  it('renders exercises list', () => {
    // Override hook to have exercises
    (useWorkoutForm as jest.Mock).mockReturnValue({
      ...mockHookValues,
      workout: {
        ...mockHookValues.workout,
        exercises: [
          {
            local_id: '1',
            name: 'Bench Press',
            sets: [],
            notes: '',
            exercise_library_id: '1',
          },
        ],
      },
    });

    render(<ActiveWorkout />);
    expect(screen.getByText('Bench Press')).toBeTruthy();
  });
});
