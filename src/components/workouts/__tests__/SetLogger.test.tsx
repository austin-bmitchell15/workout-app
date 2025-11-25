import React from 'react';
import { render, fireEvent, screen } from '@testing-library/react-native';
import SetLogger from '../SetLogger';
import { LocalSet } from '../../types';

// Mock theme hook
jest.mock('@/hooks/theme/use-theme-color', () => ({
  useThemeColor: () => '#000',
}));

describe('SetLogger', () => {
  const mockSet: LocalSet = {
    local_id: 'set-123',
    set_number: 1,
    weight: '100',
    reps: '10',
  };
  const mockOnChange = jest.fn();
  const mockOnRemove = jest.fn();

  it('renders set details correctly', () => {
    render(
      <SetLogger
        set={mockSet}
        onChange={mockOnChange}
        onRemove={mockOnRemove}
        unitLabel="kg"
      />,
    );

    expect(screen.getByText('1')).toBeOnTheScreen();
    expect(screen.getByDisplayValue('100')).toBeOnTheScreen();
    expect(screen.getByDisplayValue('10')).toBeOnTheScreen();
  });

  it('calls onChange when inputs are modified', () => {
    render(
      <SetLogger
        set={mockSet}
        onChange={mockOnChange}
        onRemove={mockOnRemove}
        unitLabel="kg"
      />,
    );

    fireEvent.changeText(screen.getByTestId('set-weight-set-123'), '105');
    expect(mockOnChange).toHaveBeenCalledWith({ ...mockSet, weight: '105' });

    fireEvent.changeText(screen.getByTestId('set-reps-set-123'), '12');
    expect(mockOnChange).toHaveBeenCalledWith({ ...mockSet, reps: '12' });
  });

  it('calls onRemove when delete button is pressed', () => {
    render(
      <SetLogger
        set={mockSet}
        onChange={mockOnChange}
        onRemove={mockOnRemove}
        unitLabel="kg"
      />,
    );

    fireEvent.press(screen.getByTestId('remove-set-set-123'));
    expect(mockOnRemove).toHaveBeenCalledWith('set-123');
  });
});
