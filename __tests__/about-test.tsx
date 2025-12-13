import { render, screen } from '@testing-library/react-native';

import About from '@/app/info/about';
import { useOrientation } from '@/hooks/useOrientation';
import { Linking } from "react-native";

// Test about screen
describe('<About />', () => {
  beforeEach(() => {
    // Mock the hook to return a static orientation
    useOrientation.mockReturnValue('PORTRAIT');
  });

  it('renders correctly the about screen', () => {
    render(<About />);

    // Check if text elements are in the document
    expect(screen.getByText('About')).toBeTruthy();
    // Check for the expected credit text
    expect(
      screen.getByText(/Credit: The 8-bit Reflections developers. 2025./i)
    ).toBeTruthy();

    // Check for nested link texts
    expect(screen.getByText("NostalgiaTree, 2025.")).toBeTruthy();
    expect(screen.getByText(/Animations used with permission from/i)).toBeTruthy();
  });

  it("should open links when clicked", async () => {
    render(<About />);

    const nostalgiaTreeLink = screen.getByText("NostalgiaTree, 2025.");

    // Simulate a press action
    await nostalgiaTreeLink.props.onPress();

    expect(Linking.openURL).toHaveBeenCalledWith("https://www.patreon.com/NostalgiaTree");
  });
});
