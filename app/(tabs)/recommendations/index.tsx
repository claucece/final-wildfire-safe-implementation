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

// Firebase
import { doc, getDoc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { auth, firestore } from "../../firebaseConfig";

// Styles & UI
import CustomGradient from "@/components/CustomGradient";
import { styles } from "@/styles/App.styles";
import Colors from "@/constants/Colors";

const Recommendations = () => {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [username, setUsername] = useState<string | null>(null);
  const [email, setEmail] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // UI Preferences
  const [nightMode, setNightMode] = useState(false);
  const [allowLocation, setAllowLocation] = useState(false);

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

  // ➤ Navigate to logout confirmation
  const handleSignOut = async () => {
    try {
      router.push("/auth/logout");
    } catch (e) {
      console.log("Sign out error:", e);
      setError("Failed to sign out. Please try again.");
    }
  };

  // Toggle handlers
  const handleToggleNightMode = (value: boolean) => setNightMode(value);
  const handleToggleAllowLocation = (value: boolean) => setAllowLocation(value);

  // ——— Loading UI ———
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

  // ——— Main screen ———
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
              Location is only used to tailor notifications and the map.
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
