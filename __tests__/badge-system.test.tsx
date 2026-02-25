import React from "react";
import { Text, Pressable } from "react-native";
import { render, screen, fireEvent, waitFor } from "@testing-library/react-native";

import AsyncStorage from "@react-native-async-storage/async-storage";
import { BadgeProvider, BadgeList, useBadges } from "@/components/badges/BadgeSystem";

// Mock AsyncStorage
jest.mock("@react-native-async-storage/async-storage", () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
}));

const asMock = <T,>(fn: T) => fn as unknown as jest.Mock;

function AwardButton() {
  const { awardBadge } = useBadges();
  return (
    <Pressable
      accessibilityLabel="Award badge"
      onPress={() =>
        awardBadge({
          id: "task:1",
          title: "Checklist 1",
          description: "Checklist finished",
        })
      }
    >
      <Text>Award</Text>
    </Pressable>
  );
}

function ClearButton() {
  const { clearBadges } = useBadges();
  return (
    <Pressable accessibilityLabel="Clear badges" onPress={() => clearBadges()}>
      <Text>Clear</Text>
    </Pressable>
  );
}

describe("BadgeSystem", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    asMock(AsyncStorage.getItem).mockResolvedValue(null);
    asMock(AsyncStorage.setItem).mockResolvedValue(undefined);
    asMock(AsyncStorage.removeItem).mockResolvedValue(undefined);
  });

  it("shows 'No badges yet.' when empty", async () => {
    render(
      <BadgeProvider>
        <BadgeList />
      </BadgeProvider>,
    );

    expect(await screen.findByText("No badges yet.")).toBeTruthy();
  });

  it("loads badges from AsyncStorage on mount and renders them", async () => {
    const stored = {
      "task:99": {
        id: "task:99",
        title: "Loaded badge",
        description: "From storage",
        awardedAt: 123,
      },
    };

    asMock(AsyncStorage.getItem).mockResolvedValue(JSON.stringify(stored));

    render(
      <BadgeProvider>
        <BadgeList />
      </BadgeProvider>,
    );

    expect(await screen.findByText("Loaded badge")).toBeTruthy();
    expect(screen.getByText("From storage")).toBeTruthy();
  });

  it("awards a badge, persists it, and shows toast", async () => {
    // silence console.log
    jest.spyOn(console, "log").mockImplementation(() => {});

    render(
      <BadgeProvider>
        <AwardButton />
        <BadgeList />
      </BadgeProvider>,
    );

    fireEvent.press(screen.getByLabelText("Award badge"));

    // Badge appears in list
    expect(await screen.findByText("Checklist 1")).toBeTruthy();
    expect(screen.getByText("Checklist finished")).toBeTruthy();

    // Toast appears
    expect(await screen.findByLabelText("Dismiss badge message")).toBeTruthy();
    expect(await screen.findByText("Badge Unlocked: Checklist 1")).toBeTruthy();

    // Persisted
    await waitFor(() => {
      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        "badges.v1",
        expect.stringContaining('"task:1"'),
      );
    });
  });

  it("awarding the same badge twice does not duplicate or re-award", async () => {
    jest.spyOn(console, "log").mockImplementation(() => {});

    function DoubleAward() {
      const { awardBadge } = useBadges();
      return (
        <Pressable
          accessibilityLabel="Double award"
          onPress={async () => {
            await awardBadge({ id: "task:1", title: "X", description: "Y" });
            await awardBadge({ id: "task:1", title: "X", description: "Y" });
          }}
        >
          <Text>Double</Text>
        </Pressable>
      );
    }

    render(
      <BadgeProvider>
        <DoubleAward />
        <BadgeList />
      </BadgeProvider>,
    );

    fireEvent.press(screen.getByLabelText("Double award"));

    expect(await screen.findByText("X")).toBeTruthy();
    expect(screen.getAllByText("X").length).toBe(1);
  });

  it("dismisses badge toast when pressed", async () => {
    jest.spyOn(console, "log").mockImplementation(() => {});

    render(
      <BadgeProvider>
        <AwardButton />
      </BadgeProvider>,
    );

    fireEvent.press(screen.getByLabelText("Award badge"));

    const toast = await screen.findByLabelText("Dismiss badge message");
    expect(toast).toBeTruthy();

    fireEvent.press(toast);

    await waitFor(() => {
      expect(screen.queryByLabelText("Dismiss badge message")).toBeNull();
    });
  });

  it("clearBadges removes storage and list becomes empty", async () => {
    jest.spyOn(console, "log").mockImplementation(() => {});

    render(
      <BadgeProvider>
        <AwardButton />
        <ClearButton />
        <BadgeList />
      </BadgeProvider>,
    );

    fireEvent.press(screen.getByLabelText("Award badge"));
    expect(await screen.findByText("Checklist 1")).toBeTruthy();

    fireEvent.press(screen.getByLabelText("Clear badges"));

    await waitFor(() => {
      expect(AsyncStorage.removeItem).toHaveBeenCalledWith("badges.v1");
    });

    expect(await screen.findByText("No badges yet.")).toBeTruthy();
  });

  it("useBadges throws if used outside BadgeProvider", () => {
    const spy = jest.spyOn(console, "error").mockImplementation(() => {});

    function BadConsumer() {
      useBadges();
      return <Text>Oops</Text>;
    }

    // React throws during render
    expect(() => render(<BadConsumer />)).toThrow(
      "useBadges must be used within BadgeProvider",
    );
  });
});
