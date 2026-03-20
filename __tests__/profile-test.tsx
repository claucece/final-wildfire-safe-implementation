import React from "react";
import { Alert } from "react-native";

import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";

import {
  render,
  screen,
  fireEvent,
  waitFor,
} from "@testing-library/react-native";
import * as Location from "expo-location";

import { onAuthStateChanged } from "firebase/auth";
import { getDoc } from "firebase/firestore";

import Profile from "@/app/personalised/profile";

// Mock styles and orientation
jest.mock("@/components/CustomGradient", () => {
  const React = require("react");
  const { View } = require("react-native");
  return ({ children }: any) => <View>{children}</View>;
});

jest.mock("@/hooks/useOrientation", () => ({
  useOrientation: () => "PORTRAIT",
}));

// Mock router
const pushMock = jest.fn();
jest.mock("expo-router", () => ({
  useRouter: jest.fn(),
}));

// AsyncStorage
jest.mock("@react-native-async-storage/async-storage", () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
}));

// Expo Location
jest.mock("expo-location", () => ({
  getForegroundPermissionsAsync: jest.fn(),
  requestForegroundPermissionsAsync: jest.fn(),
  getLastKnownPositionAsync: jest.fn(),
  getCurrentPositionAsync: jest.fn(),
  LocationAccuracy: { Balanced: 3 },
}));

// Firebase
jest.mock("firebase/auth", () => ({
  onAuthStateChanged: jest.fn(),
}));

jest.mock("firebase/firestore", () => ({
  doc: jest.fn(),
  getDoc: jest.fn(),
}));

jest.mock("../app/firebaseConfig", () => ({
  auth: {},
  firestore: {},
}));

jest.mock("@expo/vector-icons", () => {
  const React = require("react");
  const { Text } = require("react-native");

  const Icon = ({ name, size, color, ...props }: any) => (
    <Text {...props}>{`icon:${name}`}</Text>
  );

  return {
    Ionicons: Icon,
    MaterialIcons: Icon,
    FontAwesome: Icon,
  };
});

const asMock = <T,>(fn: T) => fn as unknown as jest.Mock;

// Profile tests
describe("<Profile />", () => {
  beforeEach(() => {
    jest.clearAllMocks();

    (useRouter as unknown as jest.Mock).mockReturnValue({ push: pushMock });

    jest.spyOn(Alert, "alert").mockImplementation(() => {});

    // Auth state: user exists
    asMock(onAuthStateChanged).mockImplementation((_auth, cb) => {
      cb({ uid: "user123", email: "user@example.com" });
      return () => {};
    });

    // Firestore doc: username/email
    asMock(getDoc).mockResolvedValue({
      exists: () => true,
      data: () => ({ username: "Sofia", email: "user@example.com" }),
    });

    // Default persisted prefs
    asMock(AsyncStorage.getItem).mockImplementation(async (key: string) => {
      if (key === "prefs.allowLocation") return "false";
      if (key === "prefs.nightMode") return "false";
      if (key === "prefs.allowNotifications") return "false";
      if (key === "prefs.lastCoarseLocation") return null;
      return null;
    });

    // Default OS permission
    asMock(Location.getForegroundPermissionsAsync).mockResolvedValue({
      status: "denied",
      canAskAgain: true,
      granted: false,
    });

    asMock(Location.requestForegroundPermissionsAsync).mockResolvedValue({
      status: "denied",
      canAskAgain: true,
      granted: false,
    });

    asMock(Location.getLastKnownPositionAsync).mockResolvedValue(null);
    asMock(Location.getCurrentPositionAsync).mockResolvedValue({
      coords: { latitude: 38.7223, longitude: -9.1393, accuracy: 50 },
    });
  });

  it("renders Details section (username and email)", async () => {
    render(<Profile />);

    expect(await screen.findByText("Details")).toBeTruthy();
    expect(screen.getByText("Username:")).toBeTruthy();
    expect(screen.getByText("Email:")).toBeTruthy();

    expect(await screen.findByText("Sofia")).toBeTruthy();
    expect(await screen.findByText("user@example.com")).toBeTruthy();
  });

  it("toggles Night mode and persists", async () => {
    render(<Profile />);

    const nightSwitch = await screen.findByTestId("night-mode-switch");

    fireEvent(nightSwitch, "valueChange", true);

    await waitFor(() => {
      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        "prefs.nightMode",
        "true",
      );
    });
  });

  it("toggles Notifications and persists", async () => {
    render(<Profile />);

    const notifSwitch = await screen.findByTestId("allow-notifications-switch");

    fireEvent(notifSwitch, "valueChange", true);

    await waitFor(() => {
      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        "prefs.allowNotifications",
        "true",
      );
    });
  });

  it("toggle ON location: requests permission. If granted, stores allowLocation and lastCoarseLocation", async () => {
    // Make request granted
    asMock(Location.requestForegroundPermissionsAsync).mockResolvedValue({
      status: "granted",
      canAskAgain: true,
      granted: true,
    });

    // Provide last known location so it stores it
    asMock(Location.getLastKnownPositionAsync).mockResolvedValue({
      coords: { latitude: 38.7223, longitude: -9.1393, accuracy: 50 },
    });

    render(<Profile />);

    const locSwitch = await screen.findByTestId("allow-location-switch");
    fireEvent(locSwitch, "valueChange", true);

    await waitFor(() => {
      expect(Location.requestForegroundPermissionsAsync).toHaveBeenCalled();
      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        "prefs.allowLocation",
        "true",
      );
      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        "prefs.lastCoarseLocation",
        expect.stringContaining('"latitude"'),
      );
    });
  });

  it("toggle ON location denied: persists false and shows alert", async () => {
    asMock(Location.requestForegroundPermissionsAsync).mockResolvedValue({
      status: "denied",
      canAskAgain: true,
      granted: false,
    });

    render(<Profile />);

    const locSwitch = await screen.findByTestId("allow-location-switch");
    fireEvent(locSwitch, "valueChange", true);

    await waitFor(() => {
      expect(Location.requestForegroundPermissionsAsync).toHaveBeenCalled();
      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        "prefs.allowLocation",
        "false",
      );
      expect(Alert.alert).toHaveBeenCalledWith(
        "Location not enabled",
        expect.stringContaining("near me"),
      );
    });

    // Switch should remain off
    expect(screen.getByTestId("allow-location-switch").props.value).toBe(false);
  });

  it("toggle ON location when canAskAgain is false: prompts Settings alert and stays off", async () => {
    asMock(Location.getForegroundPermissionsAsync).mockResolvedValue({
      status: "denied",
      canAskAgain: false,
      granted: false,
    });

    render(<Profile />);

    const locSwitch = await screen.findByTestId("allow-location-switch");
    fireEvent(locSwitch, "valueChange", true);

    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith(
        "Enable Location in Settings",
        expect.any(String),
        expect.any(Array),
      );
      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        "prefs.allowLocation",
        "false",
      );
    });
  });

  it("Help and info links navigate correctly", async () => {
    render(<Profile />);

    // Wait for screen
    expect(await screen.findByText("Help & info")).toBeTruthy();

    fireEvent.press(screen.getByLabelText("About"));
    expect(pushMock).toHaveBeenCalledWith("info/about");

    fireEvent.press(screen.getByLabelText("Privacy policy"));
    expect(pushMock).toHaveBeenCalledWith("info/privacy");

    fireEvent.press(screen.getByLabelText("FAQ"));
    expect(pushMock).toHaveBeenCalledWith("resource/faq");
  });

  it("Sign out navigates to logout", async () => {
    render(<Profile />);

    const btn = await screen.findByLabelText("Log out");
    fireEvent.press(btn);

    expect(pushMock).toHaveBeenCalledWith("/auth/logout");
  });
});
