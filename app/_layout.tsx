import Timer from "@/context/Timer";

import { SplashScreen, Stack } from "expo-router";
import { useFonts } from "expo-font";

import "@/global.css";

import { SafeAreaProvider } from "react-native-safe-area-context";
import { useEffect } from "react";

export default function BaseLayout() {
   // Prevent flickering by ensuring the splash screen does not auto-hide
   SplashScreen.preventAutoHideAsync();

   // Load custom fonts
   const [fontsLoaded, error] = useFonts({
      "Poxel-Font": require("../assets/fonts/poxel-font.ttf"),
      "PressStart2P-Regular": require("../assets/fonts/PressStart2P-Regular.ttf"),
      "Roboto-Mono": require("../assets/fonts/RobotoMono-Regular.ttf"),
   });

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
      <SafeAreaProvider>
         {/* Timer context wraps the app, ensuring time-related management */}
         <Timer>
            <Stack>
               {/* Main navigation structure */}
               <Stack.Screen
                  name="(tabs)"
                  options={{ headerShown: false, accessibilityLabel: "Main Tabs Navigation" }}
               />
               <Stack.Screen
                  name="prepare/[id]"
                  options={{ headerShown: false, accessibilityLabel: "Prepare Task Session Screen" }}
               />
               <Stack.Screen
                  name="resources/[itemId]"
                  options={{ headerShown: false, accessibilityLabel: "Resources Session Screen" }}
               />
               <Stack.Screen
                  name="index"
                  options={{ headerShown: false, accessibilityLabel: "Home Screen" }}
               />
               <Stack.Screen
                  name="(modal)/adjust-meditation"
                  options={{
                     headerShown: false,
                     presentation: "modal",
                     accessibilityLabel: "Adjust Meditation Settings",
                     animation: 'slide_from_bottom',
                     animationDuration: 100,
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
            </Stack>
         </Timer>
      </SafeAreaProvider>
   );
}
