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
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Alert, Linking } from "react-native";

// Firebase
import { doc, getDoc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { auth, firestore } from "../../firebaseConfig";

// Styles & UI
import CustomGradient from "@/components/CustomGradient";
import { styles } from "@/styles/App.styles";
import Colors from "@/constants/Colors";

// To persist the location
const STORAGE_KEYS = {
  allowLocation: "prefs.allowLocation",
  lastCoarseLocation: "prefs.lastCoarseLocation",
} as const;

type StoredLocation = {
  latitude: number;
  longitude: number;
  accuracyMeters?: number | null;
  timestamp: number; // Date.now()
};

const roundTo = (value: number, decimals = 2) => {
  const p = Math.pow(10, decimals);
  return Math.round(value * p) / p;
};

const Recommendations = () => {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [username, setUsername] = useState<string | null>(null);
  const [email, setEmail] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
        ]);

        if (allow != null) setAllowLocation(allow === "true");
        if (night != null) setNightMode(night === "true");
      } catch (e) {
        console.log("Failed to load preferences:", e);
      }
    })();
  }, []);

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
          granted ? "true" : "false"
        );
      } catch (e) {
        console.log("Failed to read location permission:", e);
      }
    })();
  }, []);

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

      const stored: StoredLocation = {
        latitude: roundTo(pos.coords.latitude, 2), // ~1km-ish
        longitude: roundTo(pos.coords.longitude, 2),
        accuracyMeters: pos.coords.accuracy ?? null,
        timestamp: Date.now(),
      };

      await AsyncStorage.setItem(
        STORAGE_KEYS.lastCoarseLocation,
        JSON.stringify(stored)
      );

      console.log("Saved coarse location:", stored);

      // "Approximate" handling: if accuracy is large, show a hint
      const acc = pos.coords.accuracy ?? null;
      if (Platform.OS === "ios" && acc != null && acc > 1000) {
        setLocationHint(
          "Location is approximate. Enable Precise Location in Settings for better results."
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
          ]
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
        granted ? "true" : "false"
      );

      if (!granted) {
        setLocationHint(null);
        Alert.alert(
          "Location not enabled",
          "You can still use the app by searching for an area, but 'near me' features will be limited."
        );
        return;
      }

      // Permission granted: store last known coarse location
      await saveLastCoarseLocation();
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
            Colors.gradientQuoteLight,
            Colors.gradientQuote,
            Colors.gradientQuoteDark,
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

  // The screen
  return (
    <View style={styles.container}>
      <CustomGradient
        colors={[
          Colors.gradientQuoteLight,
          Colors.gradientQuote,
          Colors.gradientQuoteDark,
        ]}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollViewContainer}
        >
          {/* Header */}
          <View style={styles.textContainerQuote}>
            <View style={styles.homeHeaderPanel}>
              <Text style={styles.textQuoteStyle} accessibilityRole="header">
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
                thumbColor={allowLocation ? Colors.secondary : Colors.mainBorder}
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
        </ScrollView>
      </CustomGradient>

      <StatusBar style={Platform.OS === "ios" ? "light" : "auto"} />
    </View>
  );
};

export default Recommendations;
