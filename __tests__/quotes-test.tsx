import React from "react";
import { render, screen } from "@testing-library/react-native";

import Quotes from "@/app/(tabs)/quotes/index";

import QUOTES_DATA from "@/constants/quotes-data";

// Mock the gallery: only used here.
jest.mock("@/components/Gallery", () => {
  return ({ title, accessibilityLabel }: { title: string; accessibilityLabel: string }) => (
    <div accessibilityLabel={accessibilityLabel}>{title}</div>
  );
});

// Mock useSafeAreaInsets
jest.mock("react-native-safe-area-context", () => ({
  useSafeAreaInsets: jest.fn().mockReturnValue({ top: 20, bottom: 10 }),
}));

describe("Quotes Screen", () => {
  it("renders main and secondary quote texts", () => {
    render(<Quotes />);

    expect(screen.getByLabelText("Main quote text")).toBeTruthy();
    expect(screen.getByLabelText("Secondary quote text")).toBeTruthy();
  });

  it("renders all gallery sections", () => {
    render(<Quotes />);

    QUOTES_DATA.forEach(({ title }) => {
      expect(screen.getByLabelText("Gallery section: " + title)).toBeTruthy();
    });
  });

  it("ensures accessibility labels exist and quotes exist", () => {
    render(<Quotes />);

    QUOTES_DATA.forEach(({ title }) => {
      expect(screen.getByLabelText(`Gallery section: ${title}`)).toBeTruthy();
    });
  });
});
