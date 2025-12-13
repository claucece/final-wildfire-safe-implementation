import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';
import { useRouter } from 'expo-router';

import App from '@/app/index';
import { useOrientation } from '@/hooks/useOrientation';
import CustomNavigationButton from '@/components/CustomNavigationButton';

// Test navigation button
describe('<CustomNavigationButton />', () => {
  it('renders the button with correct title', () => {
    render(
      <CustomNavigationButton
        title="Log In"
        route="/auth/login"
        refRoute="log in page"
        accessibilityLabel="Log In"
        handleNavigation={() => {}}
      />
    );

    // Check if the button with the correct accessibility label is rendered
    expect(screen.getByLabelText('Log In')).toBeTruthy();
  });

  it('fires the handleNavigation function on press', () => {
    const handleNavigation = jest.fn();
    render(
      <CustomNavigationButton
        title="Sign Up"
        route="/auth/signup"
        refRoute="sign up page"
        accessibilityLabel="Sign Up"
        handleNavigation={handleNavigation}
      />
    );

    // Simulate a button press
    fireEvent.press(screen.getByLabelText('Sign Up'));

    // Check if the handleNavigation function was called with the correct route
    expect(handleNavigation).toHaveBeenCalledWith('/auth/signup', { ref: 'sign up page' });
  });

  it('calls the router push method on navigation', () => {
    const { push } = useRouter();
    render(
      <CustomNavigationButton
        title="Log In"
        route="/auth/login"
        refRoute="log in page"
        accessibilityLabel="Log In"
        handleNavigation={(route) => push({ pathname: route, params: { ref: 'log in page' } })}
      />
    );

    // Simulate a button press
    fireEvent.press(screen.getByLabelText('Log In'));

    // Check if the push method was called correctly
    expect(push).toHaveBeenCalledWith({ pathname: '/auth/login', params: { ref: 'log in page' } });
  });
});

// Test index screen
describe('<App />', () => {
  beforeEach(() => {
    // Mock the hook to return a static orientation
    useOrientation.mockReturnValue('PORTRAIT');
  });

  it('renders correctly', () => {
    render(<App />);

    // Check if text elements are in the document
    expect(screen.getByText('8-bit \n Reflections')).toBeTruthy();
    expect(screen.getByText('A Retro Path to Inner Peace')).toBeTruthy();
    expect(screen.getByLabelText('Log In')).toBeTruthy();
    expect(screen.getByLabelText('Sign Up')).toBeTruthy();
  });

  it('navigates to login on Log In button press', () => {
    const { push } = useRouter();
    render(<App />);

    // Find the 'Log In' button and simulate press
    fireEvent.press(screen.getByLabelText('Log In'));

    // Check if the push method was called correctly for the log in route
    expect(push).toHaveBeenCalledWith({
      pathname: '/auth/login',
      params: { ref: 'log in page' },
    });
  });

  it('navigates to sign up on Sign Up button press', () => {
    const { push } = useRouter();
    render(<App />);

    // Find the 'Log In' button and simulate press
    fireEvent.press(screen.getByLabelText('Sign Up'));

    // Check if the push method was called correctly for the log in route
    expect(push).toHaveBeenCalledWith({
      pathname: '/auth/signup',
      params: { ref: 'sign up page' },
    });
  });
});
