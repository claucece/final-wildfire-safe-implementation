import React from "react";
import { render, screen, fireEvent } from "@testing-library/react-native";
import FAQ from "@/app/resource/faq";

// Icons
jest.mock("@expo/vector-icons", () => ({
  Feather: () => null,
  Ionicons: () => null,
}));

// Mock navigation functions
jest.mock("expo-router", () => {
  const pushMock = jest.fn(); // Define inside factory function
  return {
    useRouter: () => ({ push: pushMock }),
    Link: ({ children }: any) => <>{children}</>,
    useLocalSearchParams: () => ({ username: "TestUser" }),
    __esModule: true, // Ensure ES module compatibility
    pushMock, // Export mock for testing
  };
});

// Mock the FAQ data
jest.mock("@/constants/faq-data", () => ({
  FAQ_DATA: [
    {
      title: "Getting started",
      items: [
        {
          id: "q1",
          tag: "Basics",
          question: "What is this app?",
          answer: "It is a demo app.",
        },
        {
          id: "q2",
          question: "How do I sign in?",
          answer: "Use email and password.",
        },
      ],
    },
    {
      title: "Privacy",
      items: [
        {
          id: "q3",
          tag: "Important",
          question: "Do you track me?",
          answer: "No tracking.",
        },
      ],
    },
  ],
}));

describe("<FAQ />", () => {
  it("renders the header texts", async () => {
    render(<FAQ />);

    screen.getByLabelText("FAQ main text");
    expect(screen.getByLabelText("FAQ subtitle text")).toBeTruthy();
    expect(screen.getByText("FAQ")).toBeTruthy();
    expect(
      screen.getByText("Quick answers to common questions for you!"),
    ).toBeTruthy();
  });

  it("renders section headers and questions", () => {
    render(<FAQ />);

    expect(screen.getByText("Getting started")).toBeTruthy();
    expect(screen.getByText("Privacy")).toBeTruthy();

    expect(screen.getByText("What is this app?")).toBeTruthy();
    expect(screen.getByText("How do I sign in?")).toBeTruthy();
    expect(screen.getByText("Do you track me?")).toBeTruthy();
  });

  it("expands and collapses an answer when pressing a question", () => {
    render(<FAQ />);

    // Initially collapsed
    expect(screen.queryByText("It is a demo app.")).toBeNull();

    // Expand
    fireEvent.press(screen.getByLabelText("FAQ: What is this app?"));
    expect(screen.getByText("It is a demo app.")).toBeTruthy();

    // Collapse
    fireEvent.press(screen.getByLabelText("FAQ: What is this app?"));
    expect(screen.queryByText("It is a demo app.")).toBeNull();
  });

  it("only keeps one item open at a time, as opening another closes the previous", () => {
    render(<FAQ />);

    fireEvent.press(screen.getByLabelText("FAQ: What is this app?"));
    expect(screen.getByText("It is a demo app.")).toBeTruthy();

    fireEvent.press(screen.getByLabelText("FAQ: How do I sign in?"));
    expect(screen.getByText("Use email and password.")).toBeTruthy();

    // First should have closed
    expect(screen.queryByText("It is a demo app.")).toBeNull();
  });

  it("renders tags when present", () => {
    render(<FAQ />);

    expect(screen.getByText("Basics")).toBeTruthy();
    expect(screen.getByText("Important")).toBeTruthy();
  });
});
