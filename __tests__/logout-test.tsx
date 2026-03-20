import React from "react";
import {
  render,
  screen,
  fireEvent,
  waitFor,
} from "@testing-library/react-native";
import { useRouter } from "expo-router";
import { useOrientation } from "@/hooks/useOrientation";

import Logout from "@/app/auth/logout";
import { signOut } from "firebase/auth";
import { auth } from "@/app/firebaseConfig";

// Mock orientation hook
jest.mock("@/hooks/useOrientation", () => ({
  useOrientation: jest.fn(),
}));

// Mock expo-router
jest.mock("expo-router", () => ({
  useRouter: jest.fn(),
}));

// Mock firebase auth
jest.mock("firebase/auth", () => ({
  signOut: jest.fn(),
}));

// Mock firebase config (auth instance)
jest.mock("@/app/firebaseConfig", () => ({
  auth: { mock: "auth-instance" },
}));

// Logout test
describe("<Logout />", () => {
  const pushMock = jest.fn();
  const backMock = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();

    (useOrientation as jest.Mock).mockReturnValue("PORTRAIT");

    (useRouter as jest.Mock).mockReturnValue({
      push: pushMock,
      back: backMock,
    });

    (signOut as jest.Mock).mockResolvedValue(undefined);
  });

  it("renders correctly", () => {
    render(<Logout />);

    expect(screen.getByText("Log Out")).toBeTruthy();
    expect(screen.getByText("Are you sure you want to log out?")).toBeTruthy();

    // Button is there with correct accessibility label
    expect(screen.getByLabelText("Log out")).toBeTruthy();
  });

  it("calls signOut and redirects to home on logout press", async () => {
    render(<Logout />);

    const logoutButton = screen.getByLabelText("Log out");

    fireEvent.press(logoutButton);

    await waitFor(() => {
      expect(signOut).toHaveBeenCalledWith(auth);
      expect(pushMock).toHaveBeenCalledWith("/");
    });
  });

  it("does not redirect if signOut throws", async () => {
    (signOut as jest.Mock).mockRejectedValueOnce(new Error("Logout failed"));

    render(<Logout />);

    const logoutButton = screen.getByLabelText("Log out");

    fireEvent.press(logoutButton);

    // Wait for async handler to run
    await waitFor(() => {
      expect(signOut).toHaveBeenCalledWith(auth);
    });

    expect(pushMock).not.toHaveBeenCalled();
  });
});
