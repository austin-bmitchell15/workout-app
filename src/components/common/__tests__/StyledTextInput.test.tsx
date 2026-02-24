import React from 'react';
import { render, screen } from '@testing-library/react-native';
import StyledTextInput from '../StyledTextInput';

// Mock Themes
jest.mock('@/hooks/theme/use-theme-color', () => ({
  useThemeColor: () => '#000000', // Return black for testing
}));

// Testing
describe('StyledTextInput', () => {
  it('renders correctly with placeholder', () => {
    render(<StyledTextInput placeholder="Enter text" />);

    const input = screen.getByPlaceholderText('Enter text');
    expect(input).toBeTruthy();
  });

  it('applies style overrides', () => {
    render(
      <StyledTextInput testID="input" style={{ backgroundColor: 'red' }} />,
    );

    const input = screen.getByTestId('input');
    // In React Native testing library, we check styles directly
    expect(input.props.style).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ backgroundColor: 'red' }),
      ]),
    );
  });
});
