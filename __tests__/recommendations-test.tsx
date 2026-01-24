import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react-native";
import { Alert } from "react-native";

import Recommendations from '@/app/(tabs)/recommendations';

// Router
jest.mock("expo-router", () => ({
  useRouter: () => ({ push: jest.fn() }),
}));

// Safe area
jest.mock("react-native-safe-area-context", () => ({
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
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

// Firebase auth/firestore
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

import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Location from "expo-location";
import { onAuthStateChanged } from "firebase/auth";
import { getDoc } from "firebase/firestore";

const asMock = <T,>(fn: T) => fn as unknown as jest.Mock;

describe("<Recommendations />", () => {
  beforeEach(() => {
    jest.clearAllMocks();

    // Prevent real alerts in test
    jest.spyOn(Alert, "alert").mockImplementation(() => {});

    // Mock auth state: user exists
    asMock(onAuthStateChanged).mockImplementation((_auth, cb) => {
      cb({ uid: "user123", email: "user@example.com" });
      return () => {};
    });

    // Mock Firestore getDoc -> returns username
    asMock(getDoc).mockResolvedValue({
      exists: () => true,
      data: () => ({ username: "Sofia", email: "user@example.com" }),
    });

    // Default AsyncStorage values
    asMock(AsyncStorage.getItem).mockImplementation(async (key: string) => {
      // You can return defaults here
      if (key === "prefs.allowLocation") return "false";
      if (key === "prefs.lastCoarseLocation") return null;
      return null;
    });

    // Default permissions
    asMock(Location.getForegroundPermissionsAsync).mockResolvedValue({
      status: "denied",
      canAskAgain: true,
      granted: false,
    });
  });

  it("toggle ON location calls requestForegroundPermissionsAsync", async () => {
    // When user toggles ON, we grant permission
    asMock(Location.requestForegroundPermissionsAsync).mockResolvedValue({
      status: "granted",
      canAskAgain: true,
      granted: true,
    });

    // And we have a last known position to store
    asMock(Location.getLastKnownPositionAsync).mockResolvedValue({
      coords: { latitude: 38.7223, longitude: -9.1393, accuracy: 50 },
    });

    render(<Recommendations />);

    // wait for screen to render after loading
    await waitFor(() => screen.getByTestId("allow-location-switch"));

    fireEvent(screen.getByTestId("allow-location-switch"), "valueChange", true);

    await waitFor(() => {
      expect(Location.requestForegroundPermissionsAsync).toHaveBeenCalled();
      expect(AsyncStorage.setItem).toHaveBeenCalledWith("prefs.allowLocation", "true");
      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        "prefs.lastCoarseLocation",
        expect.stringContaining('"latitude"')
      );
    });
  });

  it("toggle ON location denied: switch stays OFF and shows alert", async () => {
    asMock(Location.requestForegroundPermissionsAsync).mockResolvedValue({
      status: "denied",
      canAskAgain: true,
      granted: false,
    });

    render(<Recommendations />);

    await waitFor(() => screen.getByTestId("allow-location-switch"));

    fireEvent(screen.getByTestId("allow-location-switch"), "valueChange", true);

    await waitFor(() => {
      expect(Location.requestForegroundPermissionsAsync).toHaveBeenCalled();
      expect(AsyncStorage.setItem).toHaveBeenCalledWith("prefs.allowLocation", "false");
      expect(Alert.alert).toHaveBeenCalledWith(
        "Location not enabled",
        expect.stringContaining("near me")
      );
    });

    expect(screen.getByTestId("allow-location-switch").props.value).toBe(false);
  });

  it("toggle ON location but canAskAgain=false: prompts Settings alert", async () => {
    asMock(Location.getForegroundPermissionsAsync).mockResolvedValue({
      status: "denied",
      canAskAgain: false,
      granted: false,
    });

    render(<Recommendations />);

    await waitFor(() => screen.getByTestId("allow-location-switch"));
    fireEvent(screen.getByTestId("allow-location-switch"), "valueChange", true);

    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalled();
      expect(AsyncStorage.setItem).toHaveBeenCalledWith("prefs.allowLocation", "false");
    });
  });

  it("toggle OFF location persists false", async () => {
    // Mock permission is granted initially so switch starts ON
    asMock(Location.getForegroundPermissionsAsync).mockResolvedValue({
      status: "granted",
      canAskAgain: true,
      granted: true,
    });

    // Ensure the persisted pref doesn't flip it back to false
    asMock(AsyncStorage.getItem).mockImplementation(async (key: string) => {
      if (key === "prefs.allowLocation") return "true";
      if (key === "prefs.nightMode") return "false";
      return null;
    });

    render(<Recommendations />);

    await waitFor(() => screen.getByTestId("allow-location-switch"));

    // In your component, the OS sync effect sets allowLocation based on permission.
    await waitFor(() =>
      expect(screen.getByTestId("allow-location-switch").props.value).toBe(true)
    );

    // Toggle off
    fireEvent(screen.getByTestId("allow-location-switch"), "valueChange", false);

    await waitFor(() => {
      expect(AsyncStorage.setItem).toHaveBeenCalledWith("prefs.allowLocation", "false");
    });

    expect(screen.getByTestId("allow-location-switch").props.value).toBe(false);
  });
});
