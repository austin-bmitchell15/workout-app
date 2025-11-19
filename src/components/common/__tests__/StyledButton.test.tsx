import React from 'react';
import { render, fireEvent, screen } from '@testing-library/react-native';
import StyledButton from '../StyledButton';

describe('StyledButton', () => {
  it('renders the title correctly', () => {
    render(<StyledButton title="Click Me" onPress={() => {}} />);

    // Uses jest-native matcher
    expect(screen.getByText('Click Me')).toBeOnTheScreen();
  });

  it('handles press events', () => {
    const onPressMock = jest.fn();
    render(<StyledButton title="Press Me" onPress={onPressMock} />);

    fireEvent.press(screen.getByText('Press Me'));
    expect(onPressMock).toHaveBeenCalledTimes(1);
  });
});
