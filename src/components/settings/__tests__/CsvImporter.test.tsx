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

jest.mock('expo-document-picker');
jest.mock('expo-file-system/legacy');
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
});
