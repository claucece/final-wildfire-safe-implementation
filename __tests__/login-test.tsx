import React from "react";

import {
  render,
  screen,
  fireEvent,
  waitFor,
} from "@testing-library/react-native";
import { useRouter } from "expo-router";

import Login from "@/app/auth/login";
import { useOrientation } from "@/hooks/useOrientation";

// Mock the data for login
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
      // Mock the setFormData function to trigger the re-render
      mockSetFormData(mockFormData);
    },
  })),
}));

beforeEach(() => {
  // Reset mockFormData and mockSetFormData before each test
  mockFormData = { email: "", password: "", confirmPassword: "", username: "" };
  mockSetFormData = jest.fn();
});

// Login Tests
describe("<Login />", () => {
  beforeEach(() => {
    useOrientation.mockReturnValue("PORTRAIT");
    useRouter.mockReturnValue({ push: jest.fn() });
  });

  it("renders correctly", () => {
    render(<Login />);

    expect(screen.getByText("Log In")).toBeTruthy();
    expect(screen.getByPlaceholderText("Your Email")).toBeTruthy();
    expect(screen.getByPlaceholderText("Your Password")).toBeTruthy();
  });

  it("shows error when fields are empty and tries to submit", async () => {
    render(<Login />);

    // Try login attempt with empty fields
    fireEvent.press(screen.getByLabelText("Login button"));

    await waitFor(() =>
      expect(screen.getByText("Please fill in all fields.")).toBeTruthy(),
    );
  });

  it("fills form with correct email and password", async () => {
    render(<Login />);

    fireEvent.changeText(
      screen.getByPlaceholderText("Your Email"),
      "test@example.com",
    );
    fireEvent.changeText(
      screen.getByPlaceholderText("Your Password"),
      "password123",
    );
    await waitFor(() => {
      expect(mockFormData.password).toBe("password123");
      expect(mockFormData.email).toBe("test@example.com");
    });
  });

  it("login back button calls router.back", async () => {
    const backMock = jest.fn();

    // Mock the useRouter hook to return the correct router with back
    useRouter.mockReturnValue({
      back: backMock,
      push: jest.fn(),
    });

    render(<Login />);

    const backButton = screen.getByLabelText("Go back");

    fireEvent.press(backButton);

    expect(backMock).toHaveBeenCalled();
  });
});
