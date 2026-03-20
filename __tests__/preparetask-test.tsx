import React from "react";
import { render, screen, fireEvent } from "@testing-library/react-native";
import PrepareTask from "@/app/prepare/[id]";

jest.mock("lottie-react-native", () => "LottieView");

// Make HighlightedText just render the string
jest.mock("@/components/HighlightedText", () => {
  const React = require("react");
  const { Text } = require("react-native");
  return ({ text, style }: any) => <Text style={style}>{text}</Text>;
});

// Icons
jest.mock("@expo/vector-icons", () => ({
  Feather: () => null,
  Ionicons: () => null,
}));

// Mock data/images
jest.mock("@/constants/prepare-tasks-images", () => [
  { uri: "img-1" },
  { uri: "img-2" },
  { uri: "img-3" },
]);

jest.mock("@/constants/prepare-tasks-data", () => ({
  PREPARE_TASK_DATA: [
    {
      id: 2,
      title: "Go Bag Essentials",
      description: "desc text",
      why: "why text",
      steps: ["step A", "step B"],
      tips: ["tip A", "tip B"],
    },
  ],
}));

jest.mock("expo-router", () => {
  const pushMock = jest.fn();
  const backMock = jest.fn();
  const paramsMock: any = { id: "2" };

  return {
    __esModule: true,
    useRouter: () => ({
      push: pushMock,
      back: backMock,
    }),
    useLocalSearchParams: () => paramsMock,
    pushMock,
    backMock,
    paramsMock,
  };
});

describe("<PrepareTask />", () => {
  beforeEach(() => {
    const { paramsMock, pushMock, backMock } = require("expo-router");
    paramsMock.id = "2";
    pushMock.mockClear();
    backMock.mockClear();
  });

  it("renders the correct task", async () => {
    render(<PrepareTask />);
    expect(await screen.findByText("Go Bag Essentials")).toBeTruthy();
  });

  it("shows 'Task not found' when id is not in data", async () => {
    const { paramsMock } = require("expo-router");

    paramsMock.id = "999"; // override

    render(<PrepareTask />);

    expect(await screen.findByText("Task not found.")).toBeTruthy();
  });

  it("renders task title and first page content", async () => {
    render(<PrepareTask />);

    expect(await screen.findByText("Go Bag Essentials")).toBeTruthy();
    expect(screen.getByText("Overview")).toBeTruthy();
    expect(screen.getByText("desc text")).toBeTruthy();

    // Swipe hint appears
    const hints = screen.getAllByText("Swipe left to continue");
    expect(hints).toHaveLength(3);
  });

  it("updates page progress text when a momentum scroll end occurs", async () => {
    render(<PrepareTask />);

    const pagesList = await screen.findByTestId("pages-list");

    fireEvent(pagesList, "momentumScrollEnd", {
      nativeEvent: { contentOffset: { x: 400 } },
    });

    // Progress meta should now show 2/4 and 50% and minutes left = 2
    const meta = screen.getByTestId("progress-meta");
    const metaText = Array.isArray(meta.props.children)
      ? meta.props.children.join("")
      : String(meta.props.children);

    expect(metaText).toContain("2/4");
    expect(metaText).toContain("50%");
    expect(metaText).toContain("2 min left");
  });

  it("shows end-of-task message when rendering last page item", async () => {
    render(<PrepareTask />);

    expect(await screen.findByText(/End of the task!/)).toBeTruthy();
  });
});
