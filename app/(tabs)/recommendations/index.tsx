import React, { useEffect, useState } from "react";
import {
  ScrollView,
  Text,
  View,
  Platform,
  ActivityIndicator,
  Pressable,
} from "react-native";

import { StatusBar } from "expo-status-bar";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import * as Location from "expo-location";

import { Ionicons } from "@expo/vector-icons";

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

// Badges
import { BadgeList, useBadges } from "@/components/badges/BadgeSystem";

// Fire notifications
import { useFireNotifications } from "@/hooks/useFireNotifications";

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

// Auxiliary function
// Compute an approximate latitude/longitude bounding box around a point.
//
// This is used to query the FIRMS "area" API, which expects a rectangular
// bounding box (west, south, east, north) in decimal degrees.
const bboxFromPoint = (lat: number, lon: number, radiusKm: number) => {
  const dLat = radiusKm / 111.32;
  const dLon = radiusKm / (111.32 * Math.cos((lat * Math.PI) / 180));

  return {
    west: lon - dLon,
    south: lat - dLat,
    east: lon + dLon,
    north: lat + dLat,
  };
};

// Small CSV parser for FIRMS database
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

const frpToColor = (frp?: number) => {
  if (frp == null || !Number.isFinite(frp)) return "gray";

  // FRP in MW (VIIRS typical ranges)
  if (frp < 10) return "#FFD700"; // yellow, low intensity
  if (frp < 50) return "#FF8C00"; // orange, medium
  if (frp < 150) return "#FF4500"; // orange-red, high
  return "#B22222"; // dark red, extreme
};

const frpToLabel = (frp?: number) => {
  if (frp == null || !Number.isFinite(frp)) return "Unknown intensity";
  if (frp < 10) return "Low intensity";
  if (frp < 50) return "Moderate intensity";
  if (frp < 150) return "High intensity";
  return "Extreme intensity";
};

const buildFireDescription = (f: {
  acq_date?: string;
  acq_time?: string;
  frp?: number;
  confidence?: string | number;
}) => {
  const lines: string[] = [];

  if (f.acq_date) lines.push(`Date: ${f.acq_date}`);
  if (f.acq_time) lines.push(`Time: ${f.acq_time} UTC`);

  lines.push(`Intensity: ${frpToLabel(f.frp)}`);

  if (f.frp != null) lines.push(`FRP: ${Math.round(f.frp)} MW`);
  if (f.confidence != null) lines.push(`Confidence: ${f.confidence}`);

  return lines.join("\n");
};

const fetchFiresNear = async (lat: number, lon: number) => {
  // These values are chose in an adhoc manner
  const radiusKm = 100;
  const days = 3;
  // Visible Infrared Imaging Radiometer Suite: a satellite sensor that can detect thermal anomalies (heat) on Earth's surface
  // VIIRS = infrared fire detection sensor
  // SNPP  = Suomi-NPP satellite
  // NRT   = Near Real Time (≈ 3h latency)
  //
  // Returns active fire / hotspot detections (~375 m resolution),
  // not fire perimeters or smoke.
  const source = "VIIRS_SNPP_NRT";

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

  const points: FirePoint[] = rows
    .map((r) => {
      const latitude = Number(r.latitude ?? (r as any).lat);
      const longitude = Number(r.longitude ?? (r as any).lon);

      if (!Number.isFinite(latitude) || !Number.isFinite(longitude))
        return null;

      return {
        latitude,
        longitude,
        brightness: r.brightness ? Number(r.brightness) : undefined,
        frp: r.frp ? Number(r.frp) : undefined,
        confidence: r.confidence ?? (r as any).conf,
        acq_date: r.acq_date,
        acq_time: r.acq_time,
      } as FirePoint;
    })
    .filter((x): x is FirePoint => x !== null);

  return points;
};

const Recommendations = () => {
  const router = useRouter();

  const [username, setUsername] = useState<string | null>(null);
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

  // Check whether location is allowed and the last stored coarse location
  const [allowLocation, setAllowLocation] = useState(false);

  const { badges } = useBadges();
  const count = Object.keys(badges).length;

  // Notify user when fires are detected nearby
  useFireNotifications(fires, lastLocation);

  // Load persisted location opt-in
  useEffect(() => {
    (async () => {
      try {
        const allow = await AsyncStorage.getItem(STORAGE_KEYS.allowLocation);
        if (allow != null) setAllowLocation(allow === "true");
      } catch (e) {
        console.log("Failed to load allowLocation:", e);
      }
    })();
  }, []);

  // Sync allowLocation with actual OS permission on mount (reflect reality)
  useEffect(() => {
    (async () => {
      try {
        const { status } = await Location.getForegroundPermissionsAsync();
        const granted = status === "granted";
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

  // Set region when location changes
  useEffect(() => {
    if (!lastLocation) return;
    setRegion((r) => ({
      ...r,
      latitude: lastLocation.latitude,
      longitude: lastLocation.longitude,
    }));
  }, [lastLocation]);

  // Load last location and fires whenever allowLocation is true/changes
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
        setLastLocation(loc);

        if (!allowLocation) return;

        setFiresLoading(true);
        setFiresError(null);
        const pts = await fetchFiresNear(loc.latitude, loc.longitude);
        setFires(pts);
      } catch (e: any) {
        console.log("Failed to load fires:", e);
        setFiresError(e?.message ?? "Failed to load fires.");
      } finally {
        setFiresLoading(false);
      }
    })();
  }, [allowLocation]);

  // Load user basics for greeting
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

  // Loading UI
  if (loading) {
    return (
      <View style={styles.container}>
        <CustomGradient
          colors={[
            Colors.gradientMain,
            Colors.gradientMain,
            Colors.gradientMainDark,
          ]}
        >
          <View
            style={[styles.scrollViewContainer, styles.loadingIndicatorView]}
          >
            <ActivityIndicator size="large" color="white" />
          </View>
        </CustomGradient>
        <StatusBar style={Platform.OS === "ios" ? "light" : "auto"} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CustomGradient
        colors={[
          Colors.gradientMainDark,
          Colors.gradientMain,
          Colors.gradientMainDark,
        ]}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollViewContainer}
        >
          {/* Header */}
          <View style={styles.textContainerTest}>
            <View style={styles.homeHeaderPanel}>
              <View style={styles.recomHeaderView}>
                <Text style={styles.titleStyle} accessibilityRole="header">
                  Your space,{"\n"}
                  {username ?? "Friend"}!
                </Text>

                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Open profile"
                  onPress={() => router.push("personalised/profile")}
                  style={styles.recommHeaderLogo}
                >
                  <Ionicons
                    name="flame-outline"
                    size={56}
                    color={Colors.mainTitle}
                  />
                </Pressable>
              </View>

              {error && <Text style={styles.errorText}>{error}</Text>}
            </View>
          </View>

          {/* Section 1: Your profile */}
          <View style={styles.profileSectionCard}>
            <Text style={styles.profileSectionTitle}>Your profile</Text>

            <Text style={styles.profileSectionSubtitle}>
              Here, view your personal information, preferences, and account
              settings.
            </Text>

            <Pressable
              style={[styles.profileButton]}
              accessibilityRole="button"
              accessibilityLabel="Go to profile"
              onPress={() => router.push("/personalised/profile")}
            >
              <Text style={styles.profileButtonText}>Go to profile</Text>
            </Pressable>
          </View>

          {/* Section 2: Fires around you */}
          <View style={styles.profileSectionCard}>
            <Text style={styles.profileSectionTitle}>Fires around you</Text>

            {!allowLocation && (
              <>
                <Text style={styles.profileSectionSubtitle}>
                  Enable location in your profile settings to see fire spots
                  near you.
                </Text>
                <Pressable
                  style={[styles.profileButton, { marginTop: 10 }]}
                  accessibilityRole="button"
                  accessibilityLabel="Open profile settings"
                  onPress={() => router.push("/profile")}
                >
                  <Text style={styles.profileButtonText}>Open profile</Text>
                </Pressable>
              </>
            )}

            {allowLocation && !lastLocation && (
              <Text style={styles.profileSectionSubtitle}>
                No saved location yet. Open your profile and toggle location
                off/on to refresh it.
              </Text>
            )}

            {allowLocation && lastLocation && (
              <>
                {firesLoading ? (
                  <View>
                    <Text style={styles.profileSectionSubtitle}>
                      Loading nearby fires...
                    </Text>
                    <ActivityIndicator color="white" />
                  </View>
                ) : firesError ? (
                  <Text style={styles.errorText}>{firesError}</Text>
                ) : (
                  <Text style={styles.profileSectionSubtitle}>
                    Showing {fires.length} fire{fires.length === 1 ? "" : "s"}{" "}
                    near your approximate location.
                  </Text>
                )}

                <View style={styles.recomMapView}>
                  <MapView
                    key={fires.length}
                    style={styles.recomMap}
                    region={region}
                    onRegionChangeComplete={setRegion}
                  >
                    {/* You Marker */}
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
                          title="Fire Spot"
                          pinColor={frpToColor(f.frp)}
                          description={buildFireDescription(f)}
                        />
                      );
                    })}
                  </MapView>
                </View>

                <Text style={styles.profileSectionSubtitle}>
                  Fire spots are satellite detections (not exact fire
                  perimeters).
                </Text>
              </>
            )}
          </View>

          {/* Section 3: Your badges */}
          <View style={styles.profileSectionCard}>
            <Text style={styles.profileSectionTitle}>Your badges</Text>

            <Text style={styles.profileSectionSubtitle}>
              Badges represent your engagement and readiness.
            </Text>

            <Text style={styles.profileSectionSubtitle}>
              You've earned {count} badge{count === 1 ? "" : "s"}.
            </Text>

            <BadgeList />
          </View>
        </ScrollView>
      </CustomGradient>

      <StatusBar style={Platform.OS === "ios" ? "light" : "auto"} />
    </View>
  );
};

export default Recommendations;
