import React from 'react';
import {
  render,
  fireEvent,
  waitFor,
  screen,
} from '@testing-library/react-native';
import ExercisePickerModal from '../ExercisePickerModal';
import { supabase } from '@/services/supabase';

jest.mock('@/services/supabase', () => ({
  supabase: {
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        single: jest.fn().mockReturnThis(),
      })),
    })),
  },
}));

describe('ExercisePickerModal', () => {
  const mockOnClose = jest.fn();
  const mockOnSelect = jest.fn();
  const mockExercises = [
    {
      id: '1',
      name: 'Bench Press',
      image_url: 'bench.png',
      primary_muscle_group: 'Chest',
    },
    { id: '2', name: 'Squat', image_url: null, primary_muscle_group: 'Legs' },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders modal correctly when visible with muscle groups', async () => {
    const mockSelect = jest.fn().mockReturnValue({
      order: jest.fn().mockResolvedValue({ data: mockExercises, error: null }),
    });
    (supabase.from as jest.Mock).mockReturnValue({ select: mockSelect });

    render(
      <ExercisePickerModal
        visible={true}
        onClose={mockOnClose}
        onExerciseSelect={mockOnSelect}
      />,
    );

    await waitFor(() => {
      expect(screen.getByText('Add Exercise')).toBeTruthy();
      expect(screen.getByText('Bench Press')).toBeTruthy();
      expect(screen.getByText('Chest')).toBeTruthy();
    });
  });

  it('filters exercises based on search', async () => {
    const mockSelect = jest.fn().mockReturnValue({
      order: jest.fn().mockResolvedValue({ data: mockExercises, error: null }),
    });
    (supabase.from as jest.Mock).mockReturnValue({ select: mockSelect });

    render(
      <ExercisePickerModal
        visible={true}
        onClose={mockOnClose}
        onExerciseSelect={mockOnSelect}
      />,
    );

    await screen.findByText('Bench Press');

    const searchInput = screen.getByPlaceholderText('Search exercises...');
    fireEvent.changeText(searchInput, 'Squat');

    expect(screen.queryByText('Bench Press')).toBeNull();
    expect(screen.getByText('Squat')).toBeTruthy();
  });

  it('calls onExerciseSelect when pressed', async () => {
    const mockSelect = jest.fn().mockReturnValue({
      order: jest.fn().mockResolvedValue({ data: mockExercises, error: null }),
    });
    (supabase.from as jest.Mock).mockReturnValue({ select: mockSelect });

    render(
      <ExercisePickerModal
        visible={true}
        onClose={mockOnClose}
        onExerciseSelect={mockOnSelect}
      />,
    );

    await screen.findByText('Bench Press');

    fireEvent.press(screen.getByText('Bench Press'));

    expect(mockOnSelect).toHaveBeenCalledWith(mockExercises[0]);
  });

  it('calls onClose when close button is pressed', async () => {
    const mockSelect = jest.fn().mockReturnValue({
      order: jest.fn().mockResolvedValue({ data: [], error: null }),
    });
    (supabase.from as jest.Mock).mockReturnValue({ select: mockSelect });

    render(
      <ExercisePickerModal
        visible={true}
        onClose={mockOnClose}
        onExerciseSelect={mockOnSelect}
      />,
    );

    await screen.findByText('Add Exercise');

    const closeButton = screen.getByText('close');
    fireEvent.press(closeButton);

    expect(mockOnClose).toHaveBeenCalled();
  });
});
