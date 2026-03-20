import { useEffect, useRef } from "react";

import * as Notifications from "expo-notifications";
import * as TaskManager from "expo-task-manager";
import * as BackgroundFetch from "expo-background-fetch";

import AsyncStorage from "@react-native-async-storage/async-storage";

// The utils
import { FirePoint, haversineKm, bboxFromPoint, parseCsv } from "@/utils/firms";

// Assign a name
const TASK_NAME = "fire-check-background";

// Get the preferences
const STORAGE_KEYS = {
  allowLocation: "prefs.allowLocation",
  lastCoarseLocation: "prefs.lastCoarseLocation",
  allowNotifications: "prefs.allowNotifications",
} as const;

// Notification helpers
const buildNotificationContent = (
  nearbyCount: number,
  highIntensityCount: number,
  thresholdKm: number,
): Notifications.NotificationContentInput => {
  const label = highIntensityCount > 0 ? "High-intensity fire" : "Fire";
  const plural = nearbyCount === 1 ? "hotspot" : "hotspots";

  return {
    title: `${label} detected nearby`,
    body: `${nearbyCount} ${plural} detected within ${thresholdKm} km of your location.`,
    sound: "default",
    data: { nearbyCount, highIntensityCount },
  };
};

// Core fire-check logic, used by both foreground hook and background task
export async function checkAndNotifyFires(thresholdKm = 50): Promise<void> {
  // Only if location is allowed
  const allow = await AsyncStorage.getItem(STORAGE_KEYS.allowLocation);
  if (allow !== "true") return;

  // Only if notifications are allowed
  const allowNotif = await AsyncStorage.getItem(
    STORAGE_KEYS.allowNotifications,
  );
  if (allowNotif !== "true") return;

  // Get the last location
  const raw = await AsyncStorage.getItem(STORAGE_KEYS.lastCoarseLocation);
  if (!raw) return;

  const { latitude, longitude } = JSON.parse(raw) as {
    latitude: number;
    longitude: number;
  };

  const MAP_KEY = process.env.EXPO_PUBLIC_FIRMS_MAP_KEY;
  if (!MAP_KEY) {
    console.warn("[FireNotifications] Missing EXPO_PUBLIC_FIRMS_MAP_KEY");
    return;
  }

  // Get the location
  const { west, south, east, north } = bboxFromPoint(latitude, longitude, 100);
  const url =
    `https://firms.modaps.eosdis.nasa.gov/api/area/csv/` +
    `${MAP_KEY}/VIIRS_SNPP_NRT/${west},${south},${east},${north}/1`;

  const res = await fetch(url);
  if (!res.ok) return;

  const rows = parseCsv(await res.text());

  const nearby = rows.filter((r) => {
    const lat = Number(r.latitude ?? r.lat);
    const lon = Number(r.longitude ?? r.lon);
    if (!isFinite(lat) || !isFinite(lon)) return false;
    return haversineKm(latitude, longitude, lat, lon) <= thresholdKm;
  });

  if (nearby.length === 0) return;

  const highIntensity = nearby.filter((r) => Number(r.frp) >= 50);

  await Notifications.scheduleNotificationAsync({
    content: buildNotificationContent(
      nearby.length,
      highIntensity.length,
      thresholdKm,
    ),
    trigger: null, // deliver immediately
  });
}

// Background task, using task manager
TaskManager.defineTask(TASK_NAME, async () => {
  try {
    await checkAndNotifyFires();
    return BackgroundFetch.BackgroundFetchResult.NewData;
  } catch (e) {
    console.warn("[FireNotifications] Background task error:", e);
    return BackgroundFetch.BackgroundFetchResult.Failed;
  }
});

async function registerBackgroundTask(): Promise<void> {
  const status = await BackgroundFetch.getStatusAsync();
  if (
    status === BackgroundFetch.BackgroundFetchStatus.Restricted ||
    status === BackgroundFetch.BackgroundFetchStatus.Denied
  ) {
    console.warn("[FireNotifications] Background fetch not available.");
    return;
  }

  const isRegistered = await TaskManager.isTaskRegisteredAsync(TASK_NAME);
  if (!isRegistered) {
    await BackgroundFetch.registerTaskAsync(TASK_NAME, {
      minimumInterval: 60 * 15, // 15 minutes
      stopOnTerminate: false,
      startOnBoot: true,
    });
  }
}

type UserLocation = {
  latitude: number;
  longitude: number;
};

// Requests notification permissions, registers a background fire-check task,
// and sends an immediate notification when fires are detected within
// 'thresholdKm' kilometres of the user's location.
export function useFireNotifications(
  fires: FirePoint[],
  userLocation: UserLocation | null,
  thresholdKm = 50,
): void {
  // Prevent duplicate notifications within the same component session
  const notifiedRef = useRef(false);

  // Request permissions and register background task once on mount
  useEffect(() => {
    (async () => {
      const { status } = await Notifications.requestPermissionsAsync();
      if (status !== "granted") {
        console.warn("[FireNotifications] Permission not granted.");
        return;
      }
      await registerBackgroundTask();
    })();
  }, []);

  // Foreground: notify when fresh fires are near the user
  useEffect(() => {
    if (!userLocation || fires.length === 0 || notifiedRef.current) return;

    (async () => {
      // Respect the user's notification preference
      const allow = await AsyncStorage.getItem("prefs.allowNotifications");
      if (allow !== "true") return;

      const nearby = fires.filter(
        (f) =>
          haversineKm(
            userLocation.latitude,
            userLocation.longitude,
            f.latitude,
            f.longitude,
          ) <= thresholdKm,
      );

      if (nearby.length === 0) return;

      notifiedRef.current = true;

      const highIntensity = nearby.filter((f) => (f.frp ?? 0) >= 50);

      Notifications.scheduleNotificationAsync({
        content: buildNotificationContent(
          nearby.length,
          highIntensity.length,
          thresholdKm,
        ),
        trigger: null,
      }).catch((e) =>
        console.warn("[FireNotifications] Failed to schedule notification:", e),
      );
    })();
  }, [fires, userLocation, thresholdKm]);
}
