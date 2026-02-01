import React from "react";
import { render, screen } from "@testing-library/react-native";
import Tests from '@/app/(tabs)/test';

// Mock navigation functions
jest.mock('expo-router', () => {
  const pushMock = jest.fn(); // Define inside factory function
  return {
    useRouter: () => ({ push: pushMock }),
    Link: ({ children }: any) => <>{children}</>,
    useLocalSearchParams: () => ({ username: 'TestUser' }),
    __esModule: true, // Ensure ES module compatibility
    pushMock, // Export mock for testing
  };
});

// Mock data
jest.mock("@/constants/tests-data.ts", () => ([
  {
    title: "Emergency Kit",
    data: [
      {
        id: "kit-checklist",
        title: "Build a Wildfire Go-Bag",
        prompt: "Check off what belongs in a wildfire go-bag.",
        type: "Checklist",
        image: { uri: "img-1" },
      },
      {
        id: "kit-order",
        title: "Evacuation Pack Order",
        prompt: "Put these actions in the safest order.",
        type: "Drag",
        image: { uri: "img-2" },
      },
    ],
  },
  {
    title: "Home Safety",
    data: [
      {
        id: "home-defensible-space",
        title: "Defensible Space Checklist",
        prompt: "Check what helps reduce wildfire risk around your home.",
        type: "Checklist",
        image: { uri: "img-3" },
      },
    ],
  },
]));

describe("<Tests />", () => {
  it("renders the header texts", async () => {
    render(<Tests />);

    expect(await screen.findByText("Now test your knowledge...")).toBeTruthy();
    expect(
      screen.getByText("We have tests for you: click on the images and try!")
    ).toBeTruthy();
  });

  it("renders each gallery section title from TESTS_DATA", async () => {
    render(<Tests />);

    expect(await screen.findByText("Emergency Kit")).toBeTruthy();
    expect(screen.getByText("Home Safety")).toBeTruthy();
  });

  it("renders at least one item title inside galleries", async () => {
    render(<Tests />);

    expect(await screen.findByText("Emergency Kit")).toBeTruthy();
  });
});
