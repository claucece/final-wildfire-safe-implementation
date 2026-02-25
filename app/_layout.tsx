import "react-native-gesture-handler";

import * as Notifications from "expo-notifications";
import Timer from "@/context/Timer";

import { SplashScreen, Stack } from "expo-router";
import { useFonts } from "expo-font";

import "@/global.css";

import { SafeAreaProvider } from "react-native-safe-area-context";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { useEffect } from "react";

import { Platform } from "react-native";

import DismissBadgeToastOnRouteChange from "@/components/badges/BadgeDismiss";
import { BadgeProvider } from "@/components/badges/BadgeSystem";

import AsyncStorage from "@react-native-async-storage/async-storage";

// Controls how notifications behave
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false, // badge
  }),
});

export default function BaseLayout() {
  // TODO: Temporary for debugging purposes, remove
  useEffect(() => {
    if (!__DEV__) return;

    (async () => {
      await AsyncStorage.removeItem("badges.v1");
      console.log("[dev] cleared badges.v1");
    })();
  }, []);

  // Prevent flickering by ensuring the splash screen does not auto-hide
  SplashScreen.preventAutoHideAsync();

  // Load custom fonts
  const [fontsLoaded, error] = useFonts({
    "Poxel-Font": require("../assets/fonts/poxel-font.ttf"),
    "PressStart2P-Regular": require("../assets/fonts/PressStart2P-Regular.ttf"),
    "Roboto-Mono": require("../assets/fonts/RobotoMono-Regular.ttf"),
  });

  // Request permissions
  useEffect(() => {
    async function configureNotifications() {
      // Ask permission
      const { status } = await Notifications.getPermissionsAsync();
      if (status !== "granted") {
        await Notifications.requestPermissionsAsync();
      }

      // Android channels
      if (Platform.OS === "android") {
        await Notifications.setNotificationChannelAsync("default", {
          name: "default",
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: "#FF231F7C",
        });
      }
    }

    configureNotifications();
  }, []);

  // Splash logic
  useEffect(() => {
    if (error) {
      console.error("Font loading error:", error);
      return;
    }
    if (fontsLoaded) {
      SplashScreen.hideAsync(); // Hide splash screen only after fonts load
    }
  }, [fontsLoaded, error]);

  // Show nothing until fonts are fully loaded
  if (!fontsLoaded) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <BadgeProvider>
          <DismissBadgeToastOnRouteChange />
          {/* Timer context wraps the app, ensuring time-related management */}
          <Timer>
            <Stack>
              {/* Main navigation structure */}
              <Stack.Screen
                name="(tabs)"
                options={{
                  headerShown: false,
                  accessibilityLabel: "Main Tabs Navigation",
                }}
              />
              <Stack.Screen
                name="prepare/[id]"
                options={{
                  headerShown: false,
                  accessibilityLabel: "Prepare Task Session Screen",
                }}
              />
              <Stack.Screen
                name="resource/[itemId]"
                options={{
                  headerShown: false,
                  accessibilityLabel: "Resources Session Screen",
                }}
              />
              <Stack.Screen
                name="test/[itemId]"
                options={{
                  headerShown: false,
                  accessibilityLabel: "Tests Session Screen",
                }}
              />
              <Stack.Screen
                name="index"
                options={{
                  headerShown: false,
                  accessibilityLabel: "Home Screen",
                }}
              />
              <Stack.Screen
                name="info/about"
                options={{
                  headerShown: false,
                  title: "About",
                  accessibilityLabel: "About Screen",
                }}
              />
              <Stack.Screen
                name="info/privacy"
                options={{
                  headerShown: false,
                  title: "Privacy Policy",
                  accessibilityLabel: "Privacy Policy Screen",
                }}
              />
              <Stack.Screen
                name="auth/login"
                options={{
                  headerShown: false,
                  title: "Log In",
                  accessibilityLabel: "Log In Screen",
                }}
              />
              <Stack.Screen
                name="auth/logout"
                options={{
                  headerShown: false,
                  title: "Log Out",
                  accessibilityLabel: "Log Out Screen",
                }}
              />
              <Stack.Screen
                name="auth/signup"
                options={{
                  headerShown: false,
                  title: "Sign Up",
                  accessibilityLabel: "Sign Up Screen",
                }}
              />
              <Stack.Screen
                name="resource/faq"
                options={{
                  headerShown: false,
                  title: "FAQ",
                  accessibilityLabel: "FAQ Screen",
                }}
              />
              <Stack.Screen
                name="personalised/profile"
                options={{
                  headerShown: false,
                  title: "Profile",
                  accessibilityLabel: "Profile Screen",
                }}
              />
            </Stack>
          </Timer>
        </BadgeProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
