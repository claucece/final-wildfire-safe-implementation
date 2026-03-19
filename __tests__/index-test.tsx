import React from "react";
import {
  render,
  screen,
  fireEvent,
  waitFor,
} from "@testing-library/react-native";
import { useRouter } from "expo-router";
import * as Notifications from "expo-notifications";

import App from "@/app/index";
import { useOrientation } from "@/hooks/useOrientation";
import CustomNavigationButton from "@/components/CustomNavigationButton";

// mocks
jest.mock("@/hooks/useOrientation", () => ({
  useOrientation: jest.fn(),
}));

jest.mock("expo-router", () => ({
  useRouter: jest.fn(),
}));

jest.mock("expo-notifications", () => ({
  getPermissionsAsync: jest.fn().mockResolvedValue({ status: "granted" }),
  requestPermissionsAsync: jest.fn().mockResolvedValue({ status: "granted" }),
  scheduleNotificationAsync: jest.fn().mockResolvedValue("test-id"),
  getAllScheduledNotificationsAsync: jest.fn().mockResolvedValue([]),
}));

describe("<CustomNavigationButton />", () => {
  it("renders the button with correct title", () => {
    render(
      <CustomNavigationButton
        title="Log In"
        route="/auth/login"
        refRoute="log in page"
        accessibilityLabel="Log In"
        handleNavigation={() => {}}
      />,
    );

    expect(screen.getByLabelText("Log In")).toBeTruthy();
  });

  it("fires the handleNavigation function on press", () => {
    const handleNavigation = jest.fn();

    render(
      <CustomNavigationButton
        title="Sign Up"
        route="/auth/signup"
        refRoute="sign up page"
        accessibilityLabel="Sign Up"
        handleNavigation={handleNavigation}
      />,
    );

    fireEvent.press(screen.getByLabelText("Sign Up"));

    expect(handleNavigation).toHaveBeenCalledWith("/auth/signup", {
      ref: "sign up page",
    });
  });

  it("calls the router push method on navigation", () => {
    const push = jest.fn();

    (useRouter as jest.Mock).mockReturnValue({ push });

    render(
      <CustomNavigationButton
        title="Log In"
        route="/auth/login"
        refRoute="log in page"
        accessibilityLabel="Log In"
        handleNavigation={(route) =>
          push({ pathname: route, params: { ref: "log in page" } })
        }
      />,
    );

    fireEvent.press(screen.getByLabelText("Log In"));

    expect(push).toHaveBeenCalledWith({
      pathname: "/auth/login",
      params: { ref: "log in page" },
    });
  });
});

describe("<App />", () => {
  const push = jest.fn();

  beforeEach(() => {
    (useOrientation as jest.Mock).mockReturnValue("PORTRAIT");
    (useRouter as jest.Mock).mockReturnValue({ push });
    jest.clearAllMocks();
  });

  it("renders correctly", () => {
    render(<App />);

    expect(screen.getByText("Wildfire Safe")).toBeTruthy();
    expect(
      screen.getByText("Wildfire preparedness, simplified"),
    ).toBeTruthy();
    expect(screen.getByLabelText("Log In")).toBeTruthy();
    expect(screen.getByLabelText("Sign Up")).toBeTruthy();
  });

  it("navigates to login on Log In button press", () => {
    render(<App />);

    fireEvent.press(screen.getByLabelText("Log In"));

    expect(push).toHaveBeenCalledWith({
      pathname: "/auth/login",
      params: { ref: "log in page" },
    });
  });

  it("navigates to sign up on Sign Up button press", () => {
    render(<App />);

    fireEvent.press(screen.getByLabelText("Sign Up"));

    expect(push).toHaveBeenCalledWith({
      pathname: "/auth/signup",
      params: { ref: "sign up page" },
    });
  });
});
