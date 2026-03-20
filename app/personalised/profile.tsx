import React, { useEffect, useState } from "react";
import {
  ScrollView,
  Text,
  View,
  Platform,
  ActivityIndicator,
  Switch,
  Pressable,
  Alert,
  Linking,
} from "react-native";

import { StatusBar } from "expo-status-bar";
import { useRouter } from "expo-router";
import * as Location from "expo-location";

import { Ionicons } from "@expo/vector-icons";

// Storage
import AsyncStorage from "@react-native-async-storage/async-storage";

// Firebase
import { doc, getDoc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { auth, firestore } from "../firebaseConfig";

// Styles & UI
import CustomGradient from "@/components/CustomGradient";
import BackButton from "@/components/CustomBackButton";
import { styles } from "@/styles/App.styles";
import Colors from "@/constants/Colors";

import { useOrientation } from "@/hooks/useOrientation";

// Store preferences
const STORAGE_KEYS = {
  allowLocation: "prefs.allowLocation",
  lastCoarseLocation: "prefs.lastCoarseLocation",
  allowNotifications: "prefs.allowNotifications",
} as const;

type StoredLocation = {
  latitude: number;
  longitude: number;
  accuracyMeters?: number | null;
  timestamp: number;
};

// Auxiliary function to round
const roundTo = (value: number, decimals = 2) => {
  const p = Math.pow(10, decimals);
  return Math.round(value * p) / p;
};

// The user profile: preferences, alerts and badges
const Profile = () => {
  const router = useRouter();
  const orientation = useOrientation();

  const [username, setUsername] = useState<string | null>(null);
  const [email, setEmail] = useState<string | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Preferences
  const [allowLocation, setAllowLocation] = useState(false);
  const [locationHint, setLocationHint] = useState<string | null>(null);
  const [allowNotifications, setAllowNotifications] = useState(false);

  // Load persisted prefs on mount
  useEffect(() => {
    (async () => {
      try {
        const [allow, notifications] = await Promise.all([
          AsyncStorage.getItem(STORAGE_KEYS.allowLocation),
          AsyncStorage.getItem(STORAGE_KEYS.allowNotifications),
        ]);

        if (allow != null) setAllowLocation(allow === "true");
        if (notifications != null)
          setAllowNotifications(notifications === "true");
      } catch (e) {
        console.log("Failed to load preferences:", e);
      }
    })();
  }, []);

  // Sync allowLocation with OS permissions on mount
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

  // Load user data
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
        console.log("Error fetching user:", e);
        setError("Failed to load user data.");
      } finally {
        setLoading(false);
      }
    });

    return unsubscribe;
  }, []);

  // Account actions: logout
  const handleSignOut = async () => {
    try {
      router.push("/auth/logout");
    } catch (e) {
      console.log("Log out error:", e);
      setError("Failed to log out. Please try again.");
    }
  };

  const openSettings = () => {
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
      let pos = await Location.getLastKnownPositionAsync({});
      if (!pos) {
        pos = await Location.getCurrentPositionAsync({
          accuracy: Location.LocationAccuracy.Balanced,
          // @ts-ignore
          mayShowUserSettingsDialog: true,
        });
      }

      const stored: StoredLocation = {
        latitude: roundTo(pos.coords.latitude, 2),
        longitude: roundTo(pos.coords.longitude, 2),
        accuracyMeters: pos.coords.accuracy ?? null,
        timestamp: Date.now(),
      };

      await AsyncStorage.setItem(
        STORAGE_KEYS.lastCoarseLocation,
        JSON.stringify(stored),
      );

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

  // Preferences handlers
  const handleToggleNotifications = async (value: boolean) => {
    setAllowNotifications(value);

    try {
      await AsyncStorage.setItem(
        STORAGE_KEYS.allowNotifications,
        value ? "true" : "false",
      );
    } catch (e) {
      console.log("Failed to persist notifications preference:", e);
    }
  };

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
      await saveLastCoarseLocation();
    } catch (e) {
      console.log("Location permission error:", e);
      setAllowLocation(false);
      setLocationHint(null);
      await AsyncStorage.setItem(STORAGE_KEYS.allowLocation, "false");
      Alert.alert("Error", "Could not request location permission.");
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <CustomGradient
          colors={[
            Colors.gradientBlue,
            Colors.gradientMainLight,
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
          Colors.gradientBlueDark,
          Colors.gradientMain,
          Colors.gradientMainDark,
        ]}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollViewContainer}
        >
          <BackButton
            orientation={orientation}
            size={orientation === "PORTRAIT" ? 50 : 30}
            accessibilityLabel="Go back"
          />
          {/* Header */}
          <View style={styles.pixelPreparePanel}>
            <Text style={styles.pixelPrepareTitle} accessibilityRole="header">
              Your profile
            </Text>

            {error && <Text style={styles.errorText}>{error}</Text>}
          </View>

          {/* Details */}
          <View style={styles.profileSectionCard}>
            <Text style={styles.profileSectionTitle}>Details</Text>

            <View style={styles.profileRow}>
              <Text style={styles.profileLabel}>Username:</Text>
              <Text style={styles.profileValue}>{username ?? "—"}</Text>
            </View>

            <View style={styles.profileRow}>
              <Text style={styles.profileLabel}>Email:</Text>
              <Text style={styles.profileValue}>{email ?? "—"}</Text>
            </View>
          </View>

          {/* Preferences */}
          <View style={styles.profileSectionCard}>
            <Text style={styles.profileSectionTitle}>Preferences</Text>

            <View style={styles.profileRow}>
              <View style={styles.profileInRow}>
                <Ionicons
                  name="notifications-outline"
                  size={20}
                  color={Colors.mainBorder}
                  style={styles.profileInIcon}
                />
                <Text style={styles.profileLabel}>Allow notifications</Text>
              </View>
              <Switch
                testID="allow-notifications-switch"
                value={allowNotifications}
                onValueChange={handleToggleNotifications}
                thumbColor={
                  allowNotifications ? Colors.secondary : Colors.mainBorder
                }
                trackColor={{
                  false: Colors.secondary,
                  true: Colors.pink,
                }}
              />
            </View>
            <Text style={styles.profileSectionSubtitle}>
              Receive alerts when significant fires are detected near you.
            </Text>

            <View style={styles.profileRow}>
              <View style={styles.profileInRow}>
                <Ionicons
                  name="location-outline"
                  size={20}
                  color={Colors.mainBorder}
                  style={styles.profileInIcon}
                />
                <Text style={styles.profileLabel}>Allow location</Text>
              </View>
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
              Location is only used to tailor notifications and map display.
            </Text>

            {!!locationHint && (
              <Text style={styles.profileSectionSubtitle}>{locationHint}</Text>
            )}
          </View>

          {/* Help & info */}
          <View style={styles.profileSectionCard}>
            <Text style={styles.profileSectionTitle}>Help & info</Text>

            <Text style={[styles.profileSectionSubtitle, { marginTop: 8 }]}>
              Version 1.0.0
            </Text>

            {/* About */}
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="About"
              onPress={() => router.push("info/about")}
              style={styles.profileInfoRow}
            >
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <Ionicons
                  name="information-circle-outline"
                  size={20}
                  color={Colors.mainBorder}
                  style={styles.profileInIcon}
                />
                <Text style={styles.profileLabel}>About</Text>
              </View>

              <Ionicons
                name="chevron-forward"
                size={18}
                color={Colors.mainBorder}
                style={{ opacity: 0.8 }}
              />
            </Pressable>

            {/* Privacy Policy */}
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Privacy policy"
              onPress={() => router.push("info/privacy")}
              style={styles.profileInfoRow}
            >
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <Ionicons
                  name="shield-checkmark-outline"
                  size={20}
                  color={Colors.mainBorder}
                  style={styles.profileInIcon}
                />
                <Text style={styles.profileLabel}>Privacy policy</Text>
              </View>

              <Ionicons
                name="chevron-forward"
                size={18}
                color={Colors.mainBorder}
                style={{ opacity: 0.8 }}
              />
            </Pressable>

            {/* FAQ */}
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="FAQ"
              onPress={() => router.push("resource/faq")}
              style={styles.profileInfoRow}
            >
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <Ionicons
                  name="help-circle-outline"
                  size={20}
                  color={Colors.mainBorder}
                  style={styles.profileInIcon}
                />
                <Text style={styles.profileLabel}>FAQ</Text>
              </View>

              <Ionicons
                name="chevron-forward"
                size={18}
                color={Colors.mainBorder}
                style={{ opacity: 0.8 }}
              />
            </Pressable>
          </View>

          {/* Account */}
          <View style={styles.profileSectionCard}>
            <Text style={styles.profileSectionTitle}>Account</Text>

            <Pressable
              style={[styles.profileButton]}
              accessibilityRole="button"
              accessibilityLabel="Log out"
              onPress={handleSignOut}
            >
              <Text style={styles.profileButtonText}>Log out</Text>
            </Pressable>
          </View>
        </ScrollView>
      </CustomGradient>

      <StatusBar style={Platform.OS === "ios" ? "light" : "auto"} />
    </View>
  );
};

export default Profile;
