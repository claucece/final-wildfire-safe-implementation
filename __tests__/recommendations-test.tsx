import React from "react";
import {
  render,
  screen,
  fireEvent,
  waitFor,
} from "@testing-library/react-native";
import { ActivityIndicator } from "react-native";

import Recommendations from "@/app/(tabs)/recommendations";
import { useRouter } from "expo-router";

import { act } from "react-test-renderer";

// Router mock
jest.mock("expo-router", () => ({
  useRouter: jest.fn(),
}));

// Safe area
jest.mock("react-native-safe-area-context", () => ({
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
}));

// Badges mock
jest.mock("@/components/badges/BadgeSystem", () => {
  const React = require("react");
  const { Text } = require("react-native");
  return {
    useBadges: () => ({ badges: {} }),
    BadgeList: () => <Text>Badges list</Text>,
  };
});

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

// MapView mock
jest.mock("react-native-maps", () => {
  const React = require("react");
  const { View, Text } = require("react-native");

  const MapView = ({ children }: any) => <View testID="map">{children}</View>;
  const Marker = ({ title, description, pinColor }: any) => (
    <View testID="marker">
      <Text>{title}</Text>
      {description ? <Text>{description}</Text> : null}
      {pinColor ? <Text>{pinColor}</Text> : null}
    </View>
  );

  return { __esModule: true, default: MapView, Marker };
});

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

jest.mock("expo-notifications", () => ({
  requestPermissionsAsync: jest.fn().mockResolvedValue({ status: "granted" }),
  getPermissionsAsync: jest.fn().mockResolvedValue({ status: "granted" }),
  setNotificationChannelAsync: jest.fn().mockResolvedValue(null),
  scheduleNotificationAsync: jest.fn().mockResolvedValue(null),
  cancelAllScheduledNotificationsAsync: jest.fn().mockResolvedValue(null),
  AndroidImportance: { MAX: 5 },
}));

const flushPromises = () => new Promise((resolve) => setImmediate(resolve));

describe("<Recommendations />", () => {
  const pushMock = jest.fn();

  // Pull mocks from the mocked modules (no outside undefined vars)
  const AsyncStorage = require("@react-native-async-storage/async-storage");
  const Location = require("expo-location");
  const Auth = require("firebase/auth");
  const Firestore = require("firebase/firestore");

  let authCallback: ((user: any) => void) | null = null;

  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue({ push: pushMock });

    // Capture the callback passed to onAuthStateChanged
    Auth.onAuthStateChanged.mockImplementation((_auth: any, cb: any) => {
      authCallback = cb;
      return () => {};
    });

    // Default: location permission denied
    Location.getForegroundPermissionsAsync.mockResolvedValue({
      status: "denied",
      canAskAgain: true,
    });

    // Default AsyncStorage: no allowLocation, no last location
    AsyncStorage.getItem.mockImplementation(async (key: string) => {
      if (key === "prefs.allowLocation") return "false";
      if (key === "prefs.lastCoarseLocation") return null;
      return null;
    });

    // Default Firestore user doc
    Firestore.getDoc.mockResolvedValue({
      exists: () => true,
      data: () => ({ username: "Sofia" }),
    });
  });

  it("shows loading indicator initially", async () => {
    const { UNSAFE_getByType } = render(<Recommendations />);

    // Initial effects run
    await act(async () => {
      await flushPromises();
    });

    expect(UNSAFE_getByType(ActivityIndicator)).toBeTruthy();
  });

  it("renders header and 3 sections after auth resolves", async () => {
    render(<Recommendations />);

    await waitFor(() => expect(authCallback).toBeTruthy());
    authCallback?.({ uid: "123", email: "sofia@example.com" });

    await waitFor(() => {
      expect(screen.getByText(/Your space/i)).toBeTruthy();
      expect(screen.getByText("Your profile")).toBeTruthy();
      expect(screen.getByText("Fires around you")).toBeTruthy();
      expect(screen.getByText("Your badges")).toBeTruthy();
    });
  });

  it("profile icon press navigates to profile", async () => {
    render(<Recommendations />);

    await waitFor(() => expect(authCallback).toBeTruthy());
    authCallback?.({ uid: "123", email: "sofia@example.com" });

    const iconButton = await screen.findByLabelText("Open profile");
    fireEvent.press(iconButton);

    expect(pushMock).toHaveBeenCalled();
  });

  it("Go to profile button navigates to profile", async () => {
    render(<Recommendations />);

    await waitFor(() => expect(authCallback).toBeTruthy());
    authCallback?.({ uid: "123", email: "sofia@example.com" });

    const goBtn = await screen.findByLabelText("Go to profile");
    fireEvent.press(goBtn);

    expect(pushMock).toHaveBeenCalled();
  });

  it("when allowLocation is false, shows enable-location message", async () => {
    render(<Recommendations />);

    await waitFor(() => expect(authCallback).toBeTruthy());
    authCallback?.({ uid: "123", email: "sofia@example.com" });

    await waitFor(() => {
      expect(screen.getByText(/Enable location/i)).toBeTruthy();
    });
  });

  it("when allowLocation is true and lastLocation exists, renders map and markers", async () => {
    // Permissions granted
    Location.getForegroundPermissionsAsync.mockResolvedValue({
      status: "granted",
      canAskAgain: true,
    });

    // Stored location present
    AsyncStorage.getItem.mockImplementation(async (key: string) => {
      if (key === "prefs.allowLocation") return "true";
      if (key === "prefs.lastCoarseLocation")
        return JSON.stringify({
          latitude: 10.12,
          longitude: -84.25,
          accuracyMeters: 500,
          timestamp: Date.now(),
        });
      return null;
    });

    // Mock FIRMS fetch
    const fetchMock = jest.spyOn(global, "fetch" as any).mockResolvedValue({
      ok: true,
      text: async () =>
        "latitude,longitude,frp,acq_date,acq_time,confidence\n" +
        "10.13,-84.26,12,2026-02-24,1200,nominal\n",
    } as any);

    render(<Recommendations />);

    await waitFor(() => expect(authCallback).toBeTruthy());
    authCallback?.({ uid: "123", email: "sofia@example.com" });

    await waitFor(() => {
      expect(screen.getByTestId("map")).toBeTruthy();
      expect(screen.getByText("You (approx.)")).toBeTruthy();
      expect(screen.getByText(/Fire spot|Fire Spot|Hotspot/i)).toBeTruthy();
    });

    fetchMock.mockRestore();
  });
});
