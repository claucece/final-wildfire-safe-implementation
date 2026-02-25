import React from "react";
import { render, screen } from "@testing-library/react-native";
import PrivacyPolicy from "@/app/info/privacy";
import { useOrientation } from "@/hooks/useOrientation";

// Mock the orientation hook
jest.mock("@/hooks/useOrientation", () => ({
  useOrientation: jest.fn(),
}));

describe("<PrivacyPolicy />", () => {
  beforeEach(() => {
    (useOrientation as jest.Mock).mockReturnValue("PORTRAIT");
    jest.clearAllMocks();
  });

  it("renders correctly the privacy policy screen", () => {
    render(<PrivacyPolicy />);

    expect(screen.getByText("Privacy Policy")).toBeTruthy();

    expect(
      screen.getByText(/designed with privacy as a core principle/i),
    ).toBeTruthy();

    expect(
      screen.getByText(/do not store or transmit your location/i),
    ).toBeTruthy();

    expect(
      screen.getByText(/All calculations/i),
    ).toBeTruthy();
  });

  it("marks the title as a header for accessibility", () => {
    render(<PrivacyPolicy />);

    const header = screen.getByText("Privacy Policy");
    expect(header.props.accessibilityRole).toBe("header");
  });

  it("includes the key client-side privacy guarantee", () => {
    render(<PrivacyPolicy />);

    expect(
      screen.getByText(/performed entirely on your device/i),
    ).toBeTruthy();

    expect(
      screen.getByText(/We do not store or transmit your location, preferences, badges/i),
    ).toBeTruthy();
  });

  it("mentions minimal remote storage for authentication", () => {
    render(<PrivacyPolicy />);

    expect(
      screen.getByText(/only personal information stored remotely/i),
    ).toBeTruthy();

    expect(
      screen.getByText(/email address, username/i),
    ).toBeTruthy();
  });

  it("matches snapshot", () => {
    const tree = render(<PrivacyPolicy />).toJSON();
    expect(tree).toMatchSnapshot();
  });
});
