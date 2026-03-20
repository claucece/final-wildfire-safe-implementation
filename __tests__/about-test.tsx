import { render, screen, fireEvent } from "@testing-library/react-native";
import About from "@/app/info/about";
import * as Linking from "react-native/Libraries/Linking/Linking";
import { useOrientation } from "@/hooks/useOrientation";

// Mock the orientation hook
jest.mock("@/hooks/useOrientation", () => ({
  useOrientation: jest.fn(),
}));

// Mock Linking.openURL
jest.spyOn(Linking, "openURL").mockImplementation(jest.fn());

describe("<About />", () => {
  beforeEach(() => {
    (useOrientation as jest.Mock).mockReturnValue("PORTRAIT");
    jest.clearAllMocks();
  });

  it("renders correctly the about screen", () => {
    render(<About />);

    expect(screen.getByText("About Wildfire Safe")).toBeTruthy();
    expect(
      screen.getByText(/Credit: Wildfire Safe developers. 2025-2026./i),
    ).toBeTruthy();

    // Individual link texts present
    expect(screen.getByText("NostalgiaTree, 2025.")).toBeTruthy();
    expect(screen.getByText("Uilsu")).toBeTruthy();
    expect(screen.getByText("Alexander, 2025.")).toBeTruthy();
  });

  it("marks the title as a header for accessibility", () => {
    render(<About />);

    const header = screen.getByText("About Wildfire Safe");
    expect(header.props.accessibilityRole).toBe("header");
  });

  it("shows the core about description", () => {
    render(<About />);

    expect(
      screen.getByText(
        /designed to help in wildfire-prone areas to prepare calmly and confidently/i,
      ),
    ).toBeTruthy();
  });

  it("opens links when pressed", () => {
    render(<About />);

    // NostalgiaTree link
    const nostalgiaTreeLink = screen.getByText("NostalgiaTree, 2025.");
    fireEvent.press(nostalgiaTreeLink);
    expect(Linking.openURL).toHaveBeenCalledWith(
      "https://www.patreon.com/NostalgiaTree",
    );

    // Uilsu link
    const uilsuLink = screen.getByText("Uilsu");
    fireEvent.press(uilsuLink);
    expect(Linking.openURL).toHaveBeenCalledWith(
      "https://lottiefiles.com/nps2t9xspsl919w4",
    );

    // Alexander link
    const alexanderLink = screen.getByText("Alexander, 2025.");
    fireEvent.press(alexanderLink);
    expect(Linking.openURL).toHaveBeenCalledWith(
      "https://lottiefiles.com/jvf0i8ro9uucz1lu",
    );
  });

  it("matches snapshot", () => {
    const tree = render(<About />).toJSON();
    expect(tree).toMatchSnapshot();
  });
});
