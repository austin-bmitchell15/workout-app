import React from 'react';
import {
  render,
  fireEvent,
  screen,
  waitFor,
} from '@testing-library/react-native';
import CsvImporter from '../CsvImporter';
import * as ImportService from '@/services/ImportService';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system/legacy';
import { Alert } from 'react-native';

// UPDATE: Use a virtual mock to bypass module resolution issues
jest.mock(
  'expo-document-picker',
  () => ({
    getDocumentAsync: jest.fn(),
  }),
  { virtual: true },
);

jest.mock(
  'expo-file-system/legacy',
  () => ({
    readAsStringAsync: jest.fn(),
  }),
  { virtual: true },
);

jest.mock('@/services/ImportService');
jest.spyOn(Alert, 'alert');

describe('CsvImporter Component', () => {
  const mockUserId = 'user-123';
  const mockOnImportComplete = jest.fn();

  const mockParsedData = [
    {
      id: '1',
      date: '2025-11-17',
      name: 'Leg Day',
      duration: '1h',
      exercises: [
        { name: 'Squat', sets: [{ set_number: 1, weight: 225, reps: 5 }] },
        { name: 'Lunge', sets: [{ set_number: 1, weight: 50, reps: 10 }] },
      ],
    },
  ];

  const mockMultipleWorkouts = [
    {
      id: '1',
      date: '2025-11-17',
      name: 'Leg Day',
      duration: '1h',
      exercises: [
        { name: 'Squat', sets: [{ set_number: 1, weight: 225, reps: 5 }] },
      ],
    },
    {
      id: '2',
      date: '2025-11-18',
      name: 'Push Day',
      duration: '45m',
      exercises: [
        {
          name: 'Bench Press',
          sets: [{ set_number: 1, weight: 185, reps: 8 }],
        },
      ],
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    (ImportService.parseStrongCsv as jest.Mock).mockReturnValue(mockParsedData);
    (DocumentPicker.getDocumentAsync as jest.Mock).mockResolvedValue({
      canceled: false,
      assets: [{ uri: 'file://test.csv' }],
    });
    (FileSystem.readAsStringAsync as jest.Mock).mockResolvedValue(
      'mock-content',
    );
  });

  const loadPreview = async () => {
    render(
      <CsvImporter
        userId={mockUserId}
        onImportComplete={mockOnImportComplete}
      />,
    );
    fireEvent.press(screen.getByText('Select CSV File'));
    await screen.findByText('Preview Import');
  };

  it('renders preview and allows expanding details', async () => {
    await loadPreview();

    // Expand the workout
    fireEvent.press(screen.getByTestId('expand-workout-1'));

    // Check if exercises are visible
    expect(screen.getByText('Squat')).toBeOnTheScreen();
    expect(screen.getByText('Lunge')).toBeOnTheScreen();
  });

  it('allows excluding specific exercises', async () => {
    await loadPreview();
    fireEvent.press(screen.getByTestId('expand-workout-1'));

    // Deselect 'Squat' (index 0)
    fireEvent.press(screen.getByTestId('exercise-row-1-0'));

    // Import
    fireEvent.press(screen.getByTestId('import-confirm-btn'));

    await waitFor(() => {
      // Expect batchSaveWorkouts to be called with only Lunge
      const savedWorkouts = (ImportService.batchSaveWorkouts as jest.Mock).mock
        .calls[0][0];
      const exercises = savedWorkouts[0].exercises;
      expect(exercises).toHaveLength(1);
      expect(exercises[0].name).toBe('Lunge');
    });
  });

  it('shows error if all exercises are excluded', async () => {
    await loadPreview();
    fireEvent.press(screen.getByTestId('expand-workout-1'));

    // Deselect both exercises
    fireEvent.press(screen.getByTestId('exercise-row-1-0')); // Squat
    fireEvent.press(screen.getByTestId('exercise-row-1-1')); // Lunge

    fireEvent.press(screen.getByTestId('import-confirm-btn'));

    expect(Alert.alert).toHaveBeenCalledWith(
      'Error',
      expect.stringContaining('No exercises selected'),
    );
    expect(ImportService.batchSaveWorkouts).not.toHaveBeenCalled();
  });

  it('handles file pick error gracefully', async () => {
    const consoleSpy = jest
      .spyOn(console, 'error')
      .mockImplementation(() => {});
    (DocumentPicker.getDocumentAsync as jest.Mock).mockRejectedValue(
      new Error('Permission denied'),
    );

    render(
      <CsvImporter
        userId={mockUserId}
        onImportComplete={mockOnImportComplete}
      />,
    );
    fireEvent.press(screen.getByText('Select CSV File'));

    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith(
        'Error',
        'Failed to parse CSV file. Please check the format.',
      );
    });

    consoleSpy.mockRestore();
  });

  it('handles canceled file pick', async () => {
    (DocumentPicker.getDocumentAsync as jest.Mock).mockResolvedValue({
      canceled: true,
    });

    render(
      <CsvImporter
        userId={mockUserId}
        onImportComplete={mockOnImportComplete}
      />,
    );
    fireEvent.press(screen.getByText('Select CSV File'));

    // Should still show empty state
    await waitFor(() => {
      expect(screen.getByText('Select CSV File')).toBeOnTheScreen();
    });
  });

  it('toggles workout selection', async () => {
    await loadPreview();

    // Workout should be selected by default
    const checkbox = screen.getByTestId('workout-checkbox-1');
    expect(checkbox).toBeTruthy();

    // Deselect
    fireEvent.press(checkbox);

    // Import button should show 0
    expect(screen.getByText('Import 0 Workouts')).toBeOnTheScreen();

    // Re-select
    fireEvent.press(checkbox);
    expect(screen.getByText('Import 1 Workouts')).toBeOnTheScreen();
  });

  it('toggles select all / deselect all', async () => {
    (ImportService.parseStrongCsv as jest.Mock).mockReturnValue(
      mockMultipleWorkouts,
    );

    render(
      <CsvImporter
        userId={mockUserId}
        onImportComplete={mockOnImportComplete}
      />,
    );
    fireEvent.press(screen.getByText('Select CSV File'));
    await screen.findByText('Preview Import');

    // All should be selected, button shows "Deselect All"
    expect(screen.getByText('Deselect All')).toBeOnTheScreen();

    // Deselect all
    fireEvent.press(screen.getByTestId('toggle-select-all'));
    expect(screen.getByText('Select All')).toBeOnTheScreen();

    // Select all again
    fireEvent.press(screen.getByTestId('toggle-select-all'));
    expect(screen.getByText('Deselect All')).toBeOnTheScreen();
  });

  it('allows editing workout name', async () => {
    await loadPreview();

    const nameInput = screen.getByTestId('workout-name-input-1');
    fireEvent.changeText(nameInput, 'Renamed Workout');

    expect(screen.getByDisplayValue('Renamed Workout')).toBeOnTheScreen();
  });

  it('handles save error', async () => {
    (ImportService.batchSaveWorkouts as jest.Mock).mockRejectedValue(
      new Error('Save failed'),
    );

    await loadPreview();
    fireEvent.press(screen.getByTestId('import-confirm-btn'));

    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith('Error', 'Save failed');
    });
  });

  it('handles save error with non-Error object', async () => {
    (ImportService.batchSaveWorkouts as jest.Mock).mockRejectedValue(
      'string error',
    );

    await loadPreview();
    fireEvent.press(screen.getByTestId('import-confirm-btn'));

    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith(
        'Error',
        'An unknown error occurred',
      );
    });
  });

  it('resets state on cancel', async () => {
    await loadPreview();

    // Press cancel button
    fireEvent.press(screen.getByText('Cancel'));

    // Should go back to empty state
    await waitFor(() => {
      expect(screen.getByText('Select CSV File')).toBeOnTheScreen();
    });
  });

  it('calls onImportComplete after successful save', async () => {
    (ImportService.batchSaveWorkouts as jest.Mock).mockResolvedValue({
      success: true,
      count: 1,
    });

    await loadPreview();
    fireEvent.press(screen.getByTestId('import-confirm-btn'));

    await waitFor(() => {
      expect(mockOnImportComplete).toHaveBeenCalled();
    });
  });
});
