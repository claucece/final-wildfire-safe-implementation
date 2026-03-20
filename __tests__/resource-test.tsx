import React from "react";
import { render, screen, fireEvent } from "@testing-library/react-native";

import * as ExpoLinking from "expo-linking";

import Resource from "@/app/(tabs)/resources";

// Mock icons
jest.mock("@expo/vector-icons", () => ({
  Feather: () => null,
  Ionicons: () => null,
}));

// Mock Link
jest.mock("expo-linking", () => ({
  openURL: jest.fn(),
}));

const mockPush = jest.fn();
// Mock navigation functions
jest.mock("expo-router", () => {
  return {
    __esModule: true, // Ensure ES module compatibility
    useRouter: () => ({ push: mockPush }),
    Link: ({ children }: any) => <>{children}</>,
    useLocalSearchParams: () => ({ username: "TestUser" }),
  };
});

// Mock the Resources data
jest.mock("@/constants/resources-data.ts", () => [
  {
    title: "General",
    items: [
      {
        id: "r1",
        title: "Breathing guide",
        description: "A quick breathing exercise.",
        href: "/breathing",
        image: 123,
      },
      {
        id: "r2",
        title: "External guide",
        description: "Opens in browser.",
        href: "https://example.com/guide",
        image: 456,
      },
    ],
  },
]);

// Resources test
describe("<Resource />", () => {
  it("renders header texts", () => {
    render(<Resource />);

    expect(screen.getByLabelText("Main resources text")).toBeTruthy();
    expect(screen.getByLabelText("Secondary resources text")).toBeTruthy();

    expect(screen.getByText("We have recommendations!")).toBeTruthy();
    expect(
      screen.getByText(
        "Browse guides by category: quick, practical, and easy to follow.",
      ),
    ).toBeTruthy();
  });

  it("renders category header and items", () => {
    render(<Resource />);

    expect(screen.getByText("General")).toBeTruthy();
    expect(screen.getByText("Breathing guide")).toBeTruthy();
    expect(screen.getByText("External guide")).toBeTruthy();

    expect(
      screen.getByLabelText("Open resource: Breathing guide"),
    ).toBeTruthy();
    expect(screen.getByLabelText("Open resource: External guide")).toBeTruthy();

    expect(
      screen.getByLabelText("Resource image: Breathing guide"),
    ).toBeTruthy();
    expect(
      screen.getByLabelText("Resource image: External guide"),
    ).toBeTruthy();
  });

  it("pressing a resource calls router", () => {
    render(<Resource />);

    fireEvent.press(screen.getByLabelText("Open resource: Breathing guide"));

    expect(mockPush).toHaveBeenCalledTimes(1);
    expect(mockPush).toHaveBeenCalledWith("/breathing");
    expect(ExpoLinking.openURL).not.toHaveBeenCalled();
  });

  it("pressing an external resource calls Linking", () => {
    render(<Resource />);

    fireEvent.press(screen.getByLabelText("Open resource: External guide"));

    expect(ExpoLinking.openURL).toHaveBeenCalledTimes(1);
    expect(ExpoLinking.openURL).toHaveBeenCalledWith(
      "https://example.com/guide",
    );
  });
});
