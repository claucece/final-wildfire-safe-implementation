import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';

import { useRouter } from 'expo-router';
import Home from '@/app/(tabs)/home';

// Mock icon but only for the home screen
export const Feather = ({ name }) => `Mocked Feather Icon: ${name}`;

jest.mock('@expo/vector-icons', () => ({
  Feather: jest.fn(() => null),
}));

// Mock navigation functions
jest.mock('expo-router', () => {
  const pushMock = jest.fn(); // Define inside factory function

  return {
    useRouter: () => ({ push: pushMock }),
    useLocalSearchParams: () => ({ username: 'TestUser' }),
    __esModule: true, // Ensure ES module compatibility
    pushMock, // Export mock for testing
  };
});

describe('<Home />', () => {
  it('renders the welcome message with username', () => {
    render(<Home />);
    expect(screen.getByText('Welcome, TestUser, to \n8-bit reflections!')).toBeTruthy();
  });

  it('renders the logout button and handles logout press', () => {
    const { push } = useRouter();
    render(<Home />);

    const logoutButton = screen.getByLabelText('Logout');
    expect(logoutButton).toBeTruthy();

    fireEvent.press(logoutButton);
    expect(push).toHaveBeenCalledWith('/auth/logout');
  });

  it('renders meditation sessions and handles navigation on press', () => {
    const { push } = useRouter();
    render(<Home />);

    const meditationItem = screen.getByLabelText('Meditation: The Willow'); // One of the titles
    expect(meditationItem).toBeTruthy();

    fireEvent.press(meditationItem);
    expect(push).toHaveBeenCalledWith('/meditation/2');
  });
});
