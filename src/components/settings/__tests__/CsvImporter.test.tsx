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

// Mock external modules
jest.mock('expo-document-picker');
jest.mock('expo-file-system/legacy');
jest.mock('@/services/ImportService');
jest.spyOn(Alert, 'alert');

// Testing
describe('CsvImporter Component', () => {
  const mockUserId = 'user-123';
  const mockOnImportComplete = jest.fn();

  const mockParsedData = [
    {
      id: '1',
      date: '2025-11-17 23:06:28',
      name: 'Evening Workout',
      duration: '1h 5m',
      exercises: [
        {
          name: 'Bench Press (Barbell)',
          sets: [{ set_number: 1, weight: 135, reps: 15 }],
        },
      ],
    },
    {
      id: '2',
      date: '2020-06-22 10:30:35',
      name: 'Morning Workout',
      duration: '42m',
      exercises: [
        {
          name: 'Arnold Press (Dumbbell)',
          sets: [{ set_number: 1, weight: 40, reps: 8 }],
        },
      ],
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    // Setup default mock behaviors
    (ImportService.parseStrongCsv as jest.Mock).mockReturnValue(mockParsedData);
    (DocumentPicker.getDocumentAsync as jest.Mock).mockResolvedValue({
      canceled: false,
      assets: [{ uri: 'file://test.csv' }],
    });
    (FileSystem.readAsStringAsync as jest.Mock).mockResolvedValue(
      'mock-csv-content',
    );
  });

  it('renders the initial file selection button', () => {
    render(
      <CsvImporter
        userId={mockUserId}
        onImportComplete={mockOnImportComplete}
      />,
    );
    expect(screen.getByText('Select CSV File')).toBeTruthy();
  });

  it('parses file and displays workout preview list', async () => {
    render(
      <CsvImporter
        userId={mockUserId}
        onImportComplete={mockOnImportComplete}
      />,
    );

    fireEvent.press(screen.getByText('Select CSV File'));

    await waitFor(() => {
      expect(screen.getByText('Preview Import')).toBeTruthy();
      // UPDATED: Use getByDisplayValue because these are now editable inputs
      expect(screen.getByDisplayValue('Evening Workout')).toBeTruthy();
      expect(screen.getByDisplayValue('Morning Workout')).toBeTruthy();
    });
  });

  it('selects all items by default and allows deselection', async () => {
    render(
      <CsvImporter
        userId={mockUserId}
        onImportComplete={mockOnImportComplete}
      />,
    );
    fireEvent.press(screen.getByText('Select CSV File'));
    await screen.findByText('Preview Import');

    // Initially "Deselect All" should be visible because all are selected
    expect(screen.getByText('Deselect All')).toBeTruthy();

    // Deselect all
    fireEvent.press(screen.getByText('Deselect All'));
    expect(screen.getByText('Select All')).toBeTruthy();

    // Import button should be disabled
    // Use regex to be flexible with exact text content
    const importButton = screen.getByText(/Import 0 Workouts/i);
    expect(importButton).toBeDisabled();
  });

  it('calls batchSaveWorkouts when Import button is pressed', async () => {
    render(
      <CsvImporter
        userId={mockUserId}
        onImportComplete={mockOnImportComplete}
      />,
    );
    fireEvent.press(screen.getByText('Select CSV File'));
    await screen.findByText('Preview Import');

    // Press Import (2 items selected by default)
    fireEvent.press(screen.getByText('Import 2 Workouts'));

    await waitFor(() => {
      expect(ImportService.batchSaveWorkouts).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({ name: 'Evening Workout' }),
          expect.objectContaining({ name: 'Morning Workout' }),
        ]),
        mockUserId,
        'lbs',
        expect.any(Function),
      );
      expect(Alert.alert).toHaveBeenCalledWith(
        'Success',
        expect.stringContaining('Imported 2'),
      );
      expect(mockOnImportComplete).toHaveBeenCalled();
    });
  });

  it('allows renaming a workout in the preview', async () => {
    render(
      <CsvImporter
        userId={mockUserId}
        onImportComplete={mockOnImportComplete}
      />,
    );
    fireEvent.press(screen.getByText('Select CSV File'));
    await screen.findByDisplayValue('Evening Workout');

    const nameInput = screen.getByDisplayValue('Evening Workout');
    fireEvent.changeText(nameInput, 'Chest Day');

    fireEvent.press(screen.getByText('Import 2 Workouts'));

    await waitFor(() => {
      expect(ImportService.batchSaveWorkouts).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({ name: 'Chest Day' }), // Renamed
        ]),
        expect.anything(),
        expect.anything(),
        expect.anything(),
      );
    });
  });
});
