import React from "react";
import { render, screen, fireEvent } from "@testing-library/react-native";
import TestDetail from "@/app/test/[itemId]";

// Icons
jest.mock("@expo/vector-icons", () => ({
  Feather: () => null,
  Ionicons: () => null,
}));

// Mock navigation functions
jest.mock("expo-router", () => {
  const pushMock = jest.fn();
  const backMock = jest.fn();
  const mockParams: any = { itemId: "kit-checklist" };

  return {
    __esModule: true,
    useRouter: () => ({ push: pushMock, back: backMock }),
    useLocalSearchParams: () => mockParams,
    mockParams,
    pushMock,
    backMock,
  };
});

// Mock TESTS_DATA with one checklist test and one drag test
jest.mock("@/constants/tests-data", () => ([
  {
    title: "Emergency Kit",
    data: [
      {
        id: "kit-checklist",
        title: "Build a Wildfire Go-Bag",
        prompt: "Check off what belongs in a wildfire go-bag.",
        type: "Checklist",
        image: { uri: "img-1" },
        checklistItems: [
          { id: "water", label: "Water", done: false, isCorrect: true },
          { id: "mask", label: "Mask", done: false, isCorrect: true },
          { id: "perfume", label: "Perfume", done: false, isCorrect: false },
        ],
      },
      {
        id: "kit-order",
        title: "Evacuation Pack Order",
        prompt: "Put these actions in the safest order.",
        type: "Drag",
        image: { uri: "img-2" },
        dragItems: [
          { key: "alerts", label: "Check official alerts" },
          { key: "gobag", label: "Grab go-bag + documents" },
        ],
        correctOrderKeys: ["alerts", "gobag"],
      },
    ],
  },
]));

// Mock badges hook so we can assert awardBadge calls
jest.mock("@/components/badges/BadgeSystem", () => {
  const awardBadge = jest.fn();
  const hasBadge = jest.fn(() => false);
  return {
    __esModule: true,
    useBadges: () => ({ awardBadge, hasBadge }),
    awardBadge,
    hasBadge,
  };
});

describe("<TestDetail />", () => {
  beforeEach(() => {
    const { mockParams } = require("expo-router");
    mockParams.itemId = "kit-checklist";

    const { awardBadge, hasBadge } = require("@/components/badges/BadgeSystem");
    awardBadge.mockClear();
    hasBadge.mockClear();
    hasBadge.mockReturnValue(false);
  });

  it("shows 'Test not found' when itemId is not in data", async () => {
    const { mockParams } = require("expo-router");
    mockParams.itemId = "does-not-exist";

    render(<TestDetail />);

    expect(await screen.findByText("Test not found.")).toBeTruthy();
  });

  it("renders checklist test title and prompt", async () => {
    render(<TestDetail />);

    expect(await screen.findByText("Build a Wildfire Go-Bag")).toBeTruthy();
    expect(
      screen.getByText("Check off what belongs in a wildfire go-bag.")
    ).toBeTruthy();

    // PixelChecklist title prop
    expect(screen.getByText("Checklist Test")).toBeTruthy();
  });

  it("shows feedback when missing correct items and then shows success when correct", async () => {
    render(<TestDetail />);

    expect(
      screen.getByText("You're missing at least one important item.")
    ).toBeTruthy();

    // Toggle water and mask on (correct items)
    fireEvent.press(screen.getByText("Water"));
    fireEvent.press(screen.getByText("Mask"));

    // Now all correct are checked and incorrect is unchecked: success
    expect(
      await screen.findByText("Great job: checklist completed correctly!")
    ).toBeTruthy();
  });

  it("shows 'Wrong item!' if an incorrect checklist item is selected", async () => {
    render(<TestDetail />);

    fireEvent.press(screen.getByText("Perfume"));

    expect(await screen.findByText("Wrong item!")).toBeTruthy();
  });

  it("awards a badge when checklist is completed correctly", async () => {
    render(<TestDetail />);

    fireEvent.press(screen.getByText("Water"));
    fireEvent.press(screen.getByText("Mask"));

    // success message proves checklistCorrect
    expect(
      await screen.findByText("Great job: checklist completed correctly!")
    ).toBeTruthy();

    const { awardBadge } = require("@/components/badges/BadgeSystem");

    // It should have awarded exactly once
    expect(awardBadge).toHaveBeenCalledTimes(1);

    const arg = awardBadge.mock.calls[0][0];
    expect(arg.id).toBe("task:kit-checklist");
    expect(arg.title).toBe("Build a Wildfire Go-Bag");
  });
});
