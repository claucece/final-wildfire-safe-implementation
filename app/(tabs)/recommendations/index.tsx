import React, { useEffect, useState } from "react";
import {
  ScrollView,
  Text,
  View,
  Platform,
  ActivityIndicator,
  Switch,
  Pressable,
} from "react-native";

import { StatusBar } from "expo-status-bar";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import * as Location from "expo-location"; // for location permission

// Alerts
import { Alert, Linking } from "react-native";

// Storage and map renderer
import AsyncStorage from "@react-native-async-storage/async-storage";
import MapView, { Marker } from "react-native-maps";

// Firebase
import { doc, getDoc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { auth, firestore } from "../../firebaseConfig";

// Styles & UI
import CustomGradient from "@/components/CustomGradient";
import { styles } from "@/styles/App.styles";
import Colors from "@/constants/Colors";

// Keys that allow to persist the location
const STORAGE_KEYS = {
  allowLocation: "prefs.allowLocation",
  lastCoarseLocation: "prefs.lastCoarseLocation",
} as const;

// Stored location by latitude and longitude
type StoredLocation = {
  latitude: number;
  longitude: number;
  accuracyMeters?: number | null;
  timestamp: number; // Date.now()
};

// A single fire / hotspot detection returned by NASA FIRMS.
// Coordinates are geographic (WGS84) latitude and longitude.
type FirePoint = {
  latitude: number;
  longitude: number;

  // Brightness temperature of the detected pixel (sensor-dependent units),
  // higher values generally indicate more intense heat.
  brightness?: number;

  // Fire Radiative Power (FRP), in megawatts (MW).
  // A proxy for fire intensity and energy output.
  frp?: number;

  // Confidence level of the detection.
  confidence?: string | number;

  // Acquisition date of the satellite observation (YYYY-MM-DD).
  acq_date?: string;

  // Acquisition time of the satellite observation (UTC, HHMM format).
  acq_time?: string;
};

// Auxiliary function to round values
const roundTo = (value: number, decimals = 2) => {
  const p = Math.pow(10, decimals);
  return Math.round(value * p) / p;
};

// Auxiliary function
// Compute an approximate latitude/longitude bounding box around a point.
//
// This is used to query the FIRMS "area" API, which expects a rectangular
// bounding box (west, south, east, north) in decimal degrees.
const bboxFromPoint = (lat: number, lon: number, radiusKm: number) => {
  // Approximate conversion: 1 degree of latitude ≈ 111.32 km everywhere
  const dLat = radiusKm / 111.32;

  // Longitude degrees shrink with latitude:
  // 1 degree of longitude ≈ 111.32 * cos(latitude) km
  const dLon = radiusKm / (111.32 * Math.cos((lat * Math.PI) / 180));

  return {
    west: lon - dLon,
    south: lat - dLat,
    east: lon + dLon,
    north: lat + dLat,
  };
};

// Small CSV parser for FIRMS
const parseCsv = (csvText: string) => {
  const lines = csvText.trim().split("\n");
  if (lines.length < 2) return [];

  const headers = lines[0].split(",").map((h) => h.trim());
  return lines.slice(1).map((line) => {
    const cols = line.split(",");
    const row: Record<string, string> = {};
    headers.forEach((h, i) => (row[h] = (cols[i] ?? "").trim()));
    return row;
  });
};

const fetchFiresNear = async (lat: number, lon: number) => {
  const radiusKm = 100;
  const days = 3;
  // Visible Infrared Imaging Radiometer Suite: a satellite sensor that can detect thermal anomalies (heat) on Earth's surface
  // VIIRS = infrared fire detection sensor
  // SNPP  = Suomi-NPP satellite
  // NRT   = Near Real Time (≈ 3h latency)
  //
  // Returns active fire / hotspot detections (~375 m resolution),
  // not fire perimeters or smoke.
  const source = "VIIRS_SNPP_NRT"; // https://www.earthdata.nasa.gov/data/instruments/viirs/land-near-real-time-data

  const MAP_KEY = process.env.EXPO_PUBLIC_FIRMS_MAP_KEY;
  if (!MAP_KEY) {
    throw new Error("Missing FIRMS key. Set EXPO_PUBLIC_FIRMS_MAP_KEY.");
  }

  const { west, south, east, north } = bboxFromPoint(lat, lon, radiusKm);

  const url =
    "https://firms.modaps.eosdis.nasa.gov/api/area/csv/" +
    `${MAP_KEY}/${source}/` +
    `${west},${south},${east},${north}/${days}`;

  const res = await fetch(url);
  if (!res.ok) {
    const t = await res.text().catch(() => "");
    throw new Error(`FIRMS error ${res.status}. ${t}`.trim());
  }

  const csv = await res.text();
  if (!csv.trim()) return [];

  const rows = parseCsv(csv);

  // FIRMS columns
  const points: FirePoint[] = rows
    .map((r) => {
      const latitude = Number(r.latitude ?? r.lat);
      const longitude = Number(r.longitude ?? r.lon);

      if (!Number.isFinite(latitude) || !Number.isFinite(longitude))
        return null;

      return {
        latitude,
        longitude,
        brightness: r.brightness ? Number(r.brightness) : undefined,
        frp: r.frp ? Number(r.frp) : undefined,
        confidence: r.confidence ?? r.conf,
        acq_date: r.acq_date,
        acq_time: r.acq_time,
      } as FirePoint;
    })
    .filter((x): x is FirePoint => x !== null);

  return points;
};

const Recommendations = () => {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [username, setUsername] = useState<string | null>(null);
  const [email, setEmail] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [lastLocation, setLastLocation] = useState<StoredLocation | null>(null);
  const [fires, setFires] = useState<FirePoint[]>([]);
  const [firesLoading, setFiresLoading] = useState(false);
  const [firesError, setFiresError] = useState<string | null>(null);

  const [region, setRegion] = useState({
    latitude: 0,
    longitude: 0,
    latitudeDelta: 0.5,
    longitudeDelta: 0.5,
  });

  // UI Preferences: night mode and locations
  const [nightMode, setNightMode] = useState(false);
  const [allowLocation, setAllowLocation] = useState(false);
  const [locationHint, setLocationHint] = useState<string | null>(null);

  // Load persisted prefs (toggle opt-in, last location)
  useEffect(() => {
    (async () => {
      try {
        const [allow, night] = await Promise.all([
          AsyncStorage.getItem(STORAGE_KEYS.allowLocation),
          AsyncStorage.getItem("prefs.nightMode"),
        ]);

        if (allow != null) setAllowLocation(allow === "true");
        if (night != null) setNightMode(night === "true");
      } catch (e) {
        console.log("Failed to load preferences:", e);
      }
    })();
  }, []);

  // Set region
  useEffect(() => {
    if (!lastLocation) return;
    setRegion((r) => ({
      ...r,
      latitude: lastLocation.latitude,
      longitude: lastLocation.longitude,
    }));
  }, [lastLocation]);

  // Sync allowLocation with actual OS permission on mount
  useEffect(() => {
    (async () => {
      try {
        const { status } = await Location.getForegroundPermissionsAsync();
        const granted = status === "granted";

        // If user opted-in but permission isn't granted anymore, reflect reality.
        setAllowLocation(granted);

        await AsyncStorage.setItem(
          STORAGE_KEYS.allowLocation,
          granted ? "true" : "false",
        );
      } catch (e) {
        console.log("Failed to read location permission:", e);
      }
    })();
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEYS.lastCoarseLocation);
        if (!raw) {
          setLastLocation(null);
          setFires([]);
          return;
        }
        const loc = JSON.parse(raw) as StoredLocation;
        console.log("[Location] Loaded from storage:", loc);
        setLastLocation(loc);

        if (!allowLocation) return;

        setFiresLoading(true);
        setFiresError(null);
        const pts = await fetchFiresNear(loc.latitude, loc.longitude);
        console.log("[FIRMS] Fires returned:", pts.length);
        setFires(pts);
      } catch (e: any) {
        console.log("Failed to load fires:", e);
        setFiresError(e?.message ?? "Failed to load fires.");
      } finally {
        setFiresLoading(false);
      }
    })();
  }, [allowLocation]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        setError("No authenticated user at the moment.");
        setLoading(false);
        return;
      }

      try {
        const userRef = doc(firestore, "users", user.uid);
        const userSnap = await getDoc(userRef);

        if (userSnap.exists()) {
          const data = userSnap.data();
          setUsername(data.username ?? null);
          setEmail(data.email ?? user.email ?? null);
        } else {
          setError("User document not found in Firestore.");
        }
      } catch (e) {
        console.log("Error fetching username:", e);
        setError("Failed to load user data.");
      } finally {
        setLoading(false);
      }
    });

    return unsubscribe;
  }, []);

  // Navigate to logout confirmation
  const handleSignOut = async () => {
    try {
      router.push("/auth/logout");
    } catch (e) {
      console.log("Sign out error:", e);
      setError("Failed to sign out. Please try again.");
    }
  };

  const openSettings = () => {
    // Linking.openSettings exists; if it fails, fallback to URL
    // @ts-ignore
    if (Linking.openSettings) {
      // @ts-ignore
      Linking.openSettings();
      return;
    }
    Linking.openURL("app-settings:");
  };

  const saveLastCoarseLocation = async (): Promise<StoredLocation | null> => {
    try {
      // Try last known first
      let pos = await Location.getLastKnownPositionAsync({});
      if (!pos) {
        pos = await Location.getCurrentPositionAsync({
          accuracy: Location.LocationAccuracy.Balanced,
          // Android: may show system dialog; TS typing differs between SDKs
          // @ts-ignore
          mayShowUserSettingsDialog: true,
        });
      }

      // store location
      const stored: StoredLocation = {
        latitude: roundTo(pos.coords.latitude, 2), // ~1km-ish
        longitude: roundTo(pos.coords.longitude, 2),
        accuracyMeters: pos.coords.accuracy ?? null,
        timestamp: Date.now(),
      };

      await AsyncStorage.setItem(
        STORAGE_KEYS.lastCoarseLocation,
        JSON.stringify(stored),
      );

      // "Approximate" handling: if accuracy is large, show a hint
      const acc = pos.coords.accuracy ?? null;
      if (Platform.OS === "ios" && acc != null && acc > 1000) {
        setLocationHint(
          "Location is approximate. Enable Precise Location in Settings for better results.",
        );
      } else {
        setLocationHint(null);
      }

      return stored;
    } catch (e) {
      console.log("Failed to store last coarse location:", e);
      return null;
    }
  };

  // Toggle handlers
  // Night mode
  const handleToggleNightMode = (value: boolean) => setNightMode(value);

  // Location
  const handleToggleAllowLocation = async (value: boolean) => {
    // Turning OFF: disable in-app usage and persist preference.
    if (!value) {
      setAllowLocation(false);
      setLocationHint(null);
      await AsyncStorage.setItem(STORAGE_KEYS.allowLocation, "false");
      return;
    }

    // Turning ON: request permission now.
    try {
      const existing = await Location.getForegroundPermissionsAsync();

      if (existing.status !== "granted" && existing.canAskAgain === false) {
        Alert.alert(
          "Enable Location in Settings",
          "Location permission is disabled. Enable it in Settings to show fires near you.",
          [
            { text: "Cancel", style: "cancel" },
            { text: "Open Settings", onPress: openSettings },
          ],
        );
        setAllowLocation(false);
        await AsyncStorage.setItem(STORAGE_KEYS.allowLocation, "false");
        return;
      }

      const req = await Location.requestForegroundPermissionsAsync();
      const granted = req.status === "granted";

      setAllowLocation(granted);
      await AsyncStorage.setItem(
        STORAGE_KEYS.allowLocation,
        granted ? "true" : "false",
      );

      if (!granted) {
        setLocationHint(null);
        Alert.alert(
          "Location not enabled",
          "You can still use the app by searching for an area, but 'near me' features will be limited.",
        );
        return;
      }

      // Permission granted: store last known coarse location
      const stored = await saveLastCoarseLocation();
      if (stored) setLastLocation(stored);
    } catch (e) {
      console.log("Location permission error:", e);
      setAllowLocation(false);
      setLocationHint(null);
      await AsyncStorage.setItem(STORAGE_KEYS.allowLocation, "false");
      Alert.alert("Error", "Could not request location permission.");
    }
  };

  // Loading UI
  if (loading) {
    return (
      <View style={styles.container}>
        <CustomGradient
          colors={[
            Colors.gradientTestLight,
            Colors.gradientTest,
            Colors.gradientTestDark,
          ]}
        >
          <View
            style={[
              styles.scrollViewContainer,
              { justifyContent: "center", alignItems: "center" },
            ]}
          >
            <ActivityIndicator />
          </View>
        </CustomGradient>
        <StatusBar style={Platform.OS === "ios" ? "light" : "auto"} />
      </View>
    );
  }

  // The main screen
  return (
    <View style={styles.container}>
      <CustomGradient
        colors={[
          Colors.gradientTestLight,
          Colors.gradientTest,
          Colors.gradientTestDark,
        ]}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollViewContainer}
        >
          {/* Header */}
          <View style={styles.textContainerTest}>
            <View style={styles.homeHeaderPanel}>
              <Text style={styles.textTestStyle} accessibilityRole="header">
                Your space,{"\n"}
                {username ?? "Friend"}!
              </Text>

              {error && <Text style={styles.errorText}>{error}</Text>}
            </View>
          </View>

          {/* Section 1: Overview */}
          <View style={styles.profileSectionCard}>
            <Text style={styles.profileSectionTitle}>Overview</Text>

            <View style={styles.profileRow}>
              <Text style={styles.profileLabel}>Username</Text>
              <Text style={styles.profileValue}>{username ?? "—"}</Text>
            </View>

            <View style={styles.profileRow}>
              <Text style={styles.profileLabel}>Email</Text>
              <Text style={styles.profileValue}>{email ?? "—"}</Text>
            </View>
          </View>

          {/* Section 2: Preferences */}
          <View style={styles.profileSectionCard}>
            <Text style={styles.profileSectionTitle}>Preferences</Text>

            <View style={styles.profileRow}>
              <Text style={styles.profileLabel}>Night mode</Text>
              <Switch
                testID="night-mode-switch"
                value={nightMode}
                onValueChange={handleToggleNightMode}
                thumbColor={nightMode ? Colors.secondary : Colors.mainBorder}
                trackColor={{
                  false: Colors.secondary,
                  true: Colors.pink,
                }}
              />
            </View>

            <View style={styles.profileRow}>
              <Text style={styles.profileLabel}>Allow location</Text>
              <Switch
                testID="allow-location-switch"
                value={allowLocation}
                onValueChange={handleToggleAllowLocation}
                thumbColor={
                  allowLocation ? Colors.secondary : Colors.mainBorder
                }
                trackColor={{
                  false: Colors.secondary,
                  true: Colors.pink,
                }}
              />
            </View>

            <Text style={styles.profileSectionSubtitle}>
              Location is only used to tailor notifications and for the map.
            </Text>
          </View>

          {/* Section 3: Account */}
          <View style={styles.profileSectionCard}>
            <Text style={styles.profileSectionTitle}>Account</Text>

            <Pressable
              style={[styles.profileButton]}
              accessibilityRole="button"
              accessibilityLabel="Sign out"
              onPress={handleSignOut}
            >
              <Text style={styles.profileButtonText}>Sign out</Text>
            </Pressable>
          </View>

          {/* Section 4: Fires near you */}
          <View style={styles.profileSectionCard}>
            <Text style={styles.profileSectionTitle}>Fires near you</Text>

            {!allowLocation && (
              <Text style={styles.profileSectionSubtitle}>
                Turn on “Allow location” to see hotspots near you.
              </Text>
            )}

            {allowLocation && !lastLocation && (
              <Text style={styles.profileSectionSubtitle}>
                No saved location yet. Toggle location off/on to refresh it.
              </Text>
            )}

            {allowLocation && lastLocation && (
              <>
                {firesLoading ? (
                  <View style={{ paddingVertical: 12 }}>
                    <ActivityIndicator />
                    <Text style={styles.profileSectionSubtitle}>
                      Loading nearby fires…
                    </Text>
                  </View>
                ) : firesError ? (
                  <Text style={styles.errorText}>{firesError}</Text>
                ) : (
                  <Text style={styles.profileSectionSubtitle}>
                    Showing {fires.length} fires
                    {fires.length === 1 ? "" : "s"} near your approximate
                    location.
                  </Text>
                )}

                <View
                  style={{
                    height: 240,
                    marginTop: 12,
                    borderRadius: 16,
                    overflow: "hidden",
                  }}
                >
                  <MapView
                    key={fires.length}
                    style={{ flex: 1 }}
                    region={region}
                    onRegionChangeComplete={setRegion}
                  >
                    {/* You */}
                    <Marker
                      coordinate={{
                        latitude: lastLocation.latitude,
                        longitude: lastLocation.longitude,
                      }}
                      title="You (approx.)"
                      pinColor="blue"
                    />

                    {/* Fires (jittered so overlapping hotspots are visible) */}
                    {fires.map((f, idx) => {
                      // ~0.5–2% of current span
                      const jitterLat = region.latitudeDelta * 0.01;
                      const jitterLon = region.longitudeDelta * 0.01;

                      const angle =
                        (idx / Math.max(1, fires.length)) * 2 * Math.PI;

                      return (
                        <Marker
                          key={`${f.latitude},${f.longitude},${idx}`}
                          coordinate={{
                            latitude: f.latitude + jitterLat * Math.cos(angle),
                            longitude:
                              f.longitude + jitterLon * Math.sin(angle),
                          }}
                          title="Hotspot"
                          pinColor="red"
                          description={[
                            f.acq_date ? `Date: ${f.acq_date}` : null,
                            f.acq_time ? `Time: ${f.acq_time}` : null,
                            f.frp != null ? `FRP: ${f.frp}` : null,
                            f.confidence != null
                              ? `Conf: ${f.confidence}`
                              : null,
                          ]
                            .filter((x): x is string => Boolean(x))
                            .join(" · ")}
                        />
                      );
                    })}
                  </MapView>
                </View>

                <Text style={styles.profileSectionSubtitle}>
                  Hotspots are satellite detections (not exact fire perimeters).
                </Text>
              </>
            )}
          </View>
        </ScrollView>
      </CustomGradient>

      <StatusBar style={Platform.OS === "ios" ? "light" : "auto"} />
    </View>
  );
};

export default Recommendations;
