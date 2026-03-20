import React from "react";

import {
  render,
  screen,
  fireEvent,
  waitFor,
} from "@testing-library/react-native";
import { useRouter } from "expo-router";

import SignUp from "@/app/auth/signup";
import { useOrientation } from "@/hooks/useOrientation";

let mockFormData = {
  email: "",
  password: "",
  confirmPassword: "",
  username: "",
};
let mockSetFormData = jest.fn();

jest.mock("@/hooks/useForm", () => ({
  useForm: jest.fn(() => ({
    formData: mockFormData,
    handleInputChange: (field: keyof typeof mockFormData, value: string) => {
      // Manually update the mock form data
      mockFormData = { ...mockFormData, [field]: value };
      // Mock the setFormData function to trigger the rerender
      mockSetFormData(mockFormData);
    },
  })),
}));

beforeEach(() => {
  // Reset mockFormData and mockSetFormData before each test
  mockFormData = { email: "", password: "", confirmPassword: "", username: "" };
  mockSetFormData = jest.fn();
});

describe("<SignUp />", () => {
  beforeEach(() => {
    useOrientation.mockReturnValue("PORTRAIT"); // or "LANDSCAPE" for different cases
    useRouter.mockReturnValue({ push: jest.fn() });
  });

  it("renders correctly", () => {
    render(<SignUp />);

    expect(screen.getByText("Sign Up")).toBeTruthy();
    expect(screen.getByPlaceholderText("Your Username")).toBeTruthy();
    expect(screen.getByPlaceholderText("Your Email")).toBeTruthy();
    expect(screen.getByPlaceholderText("Your Password")).toBeTruthy();
    expect(screen.getByPlaceholderText("Confirm Password")).toBeTruthy();
  });

  it("shows error when fields are empty and tries to submit", async () => {
    render(<SignUp />);

    // Try signup attempt with empty fields
    fireEvent.press(screen.getByLabelText("Sign Up button"));

    await waitFor(() =>
      expect(screen.getByText("Please fill in all fields.")).toBeTruthy(),
    );
  });

  it("fills form with correct email and password", async () => {
    render(<SignUp />);

    fireEvent.changeText(
      screen.getByPlaceholderText("Your Username"),
      "testuser",
    );
    fireEvent.changeText(
      screen.getByPlaceholderText("Your Email"),
      "test@example.com",
    );
    fireEvent.changeText(
      screen.getByPlaceholderText("Your Password"),
      "password123",
    );
    fireEvent.changeText(
      screen.getByPlaceholderText("Confirm Password"),
      "password123",
    );

    await waitFor(() => {
      expect(mockFormData.username).toBe("testuser");
      expect(mockFormData.email).toBe("test@example.com");
      expect(mockFormData.password).toBe("password123");
      expect(mockFormData.confirmPassword).toBe("password123");
    });
  });

  it("signup back button calls router.back", async () => {
    const backMock = jest.fn();

    // Mock the useRouter hook to return the correct router with back
    useRouter.mockReturnValue({
      back: backMock,
      push: jest.fn(),
    });

    render(<SignUp />);

    const backButton = screen.getByLabelText("Go back");

    fireEvent.press(backButton);

    expect(backMock).toHaveBeenCalled();
  });
});
