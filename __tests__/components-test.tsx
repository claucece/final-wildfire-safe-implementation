import { render, screen, fireEvent } from '@testing-library/react-native';

import CustomNavigationButton from '@/components/CustomNavigationButton';
import BackButton from '@/components/CustomBackButton';

// Test navigation button
describe('<CustomNavigationButton />', () => {
  it('renders the button with correct title', () => {
    render(
      <CustomNavigationButton
        title="Log In"
        route="/auth/login"
        refRoute="log in page"
        accessibilityLabel="Log In"
        handleNavigation={() => { }}
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
});


test('renders CustomBackButton with correct icon and size', () => {
  render(<BackButton size={60} color="blue" orientation="PORTRAIT" />);
  const backButton = screen.getByLabelText('Go back');
  expect(backButton).toBeTruthy();
});
