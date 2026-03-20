import React from "react";
import { render, screen, fireEvent } from "@testing-library/react-native";
import Home from "@/app/(tabs)/home";

import { useRouter } from "expo-router";

// Mock lottie and gradient
jest.mock("lottie-react-native", () => "LottieView");

jest.mock("expo-linear-gradient", () => {
  const React = require("react");
  const { View } = require("react-native");
  return { LinearGradient: ({ children }: any) => <View>{children}</View> };
});

// CustomGradient wrapper
jest.mock("@/components/CustomGradient", () => {
  const React = require("react");
  const { View } = require("react-native");
  return ({ children }: any) => <View>{children}</View>;
});

// Vector icons
jest.mock("@expo/vector-icons", () => ({
  Feather: jest.fn(() => null),
}));

// Make task data deterministic
jest.mock("@/constants/prepare-tasks-data", () => ({
  PREPARE_TASK_DATA: [
    { id: 1, title: "Understanding Wildfire Risk" },
    { id: 2, title: "Create an Emergency Kit" },
  ],
}));

// Mock images lookup
jest.mock("@/constants/prepare-tasks-images", () => [
  { uri: "mock-image-1" },
  { uri: "mock-image-2" },
]);

// Mock navigation functions
jest.mock("expo-router", () => {
  const pushMock = jest.fn(); // Define inside factory function
  return {
    useRouter: () => ({ push: pushMock }),
    useLocalSearchParams: () => ({ username: "TestUser" }),
    __esModule: true, // Ensure ES module compatibility
    pushMock, // Export mock for testing
  };
});

// Home tests
describe("<Home />", () => {
  it("renders the welcome message with username", () => {
    render(<Home />);

    // Since the text includes a newline and exclamation, use a regex
    expect(screen.getByText(/Welcome,\s*TestUser!/)).toBeTruthy();
  });

  it("renders all prepare tasks", () => {
    render(<Home />);
    const items = screen.getAllByLabelText(/^Prepare Task:/);
    expect(items).toHaveLength(2);
  });

  it("renders prepare tasks and navigates on press", () => {
    const { push } = useRouter();
    render(<Home />);

    const item = screen.getByLabelText(
      "Prepare Task: Understanding Wildfire Risk",
    );
    expect(item).toBeTruthy();

    fireEvent.press(item);

    // Item has id=1, hence: /prepare/1
    expect(push).toHaveBeenCalledWith("/prepare/1");

    const item2 = screen.getByLabelText(
      "Prepare Task: Create an Emergency Kit",
    );
    expect(item2).toBeTruthy();

    fireEvent.press(item2);

    // Item has id=2, hence: /prepare/2
    expect(push).toHaveBeenCalledWith("/prepare/2");
  });

  it("sets accessibilityHint on items", () => {
    render(<Home />);
    const item = screen.getByLabelText("Prepare Task: Create an Emergency Kit");
    expect(item.props.accessibilityHint).toBe("Opens prepare task details");
  });
});
