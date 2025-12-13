// Import global CSS: for tailwind and font loading
import "@/global.css";

import { useCallback } from "react";
import { View, Text, SafeAreaView, Pressable, Platform } from "react-native";

import { StatusBar } from "expo-status-bar";
import { Image } from 'expo-image';
import { useRouter } from "expo-router";
import Feather from "@expo/vector-icons/Feather";

// Custom hooks
import { useOrientation } from "@/hooks/useOrientation";

// Custom components, style and constants
import CustomNavigationButton from "@/components/CustomNavigationButton";
import CustomGradient from "@/components/CustomGradient";
import Colors from "@/constants/Colors";
import { styles } from "@/styles/App.styles";

// Blurhash placeholder for progressive image loading
import { BLUR_HASH_DATA } from "@/constants/blur-hash-data";

// Assets: background image
import homeImage from "@/assets/app-images/home-image.webp";

// Main application component: the entry screen to our application
const App = () => {
  // Get the current orientation of the device for responsive design
  const orientation = useOrientation();

  // Initialize the router for navigation between pages
  const router = useRouter();

  // Navigation handler to navigate between screens
  const handleNavigation = useCallback((route: string, params: Record<string, any> = {}) => {
    const navigate = async () => {
      try {
        // Attempt to navigate to the desired route
        await router.push({ pathname: route, params });
      } catch (error) {
        // Log error in case navigation fails
        console.log('Navigation failed:', error);
      }
    };
    navigate();
  }, [router]);

  return (
    <View style={styles.container}>
      {/* Background image with progressive loading: blurhash */}
      <Image
        source={homeImage}
        contentFit="cover"
        placeholder={{ blurhash: BLUR_HASH_DATA[0]?.hash || "L39[3oI8tuN84?tMIK?Z*F.O4V4Y" }} // Fallback to default blurhash
        accessibilityLabel="Cozy background image depicting a serene retro environment"
        accessible // Makes the image accessible for screen readers
        accessibilityRole="image"
        style={[
          styles.imageContainer,
          // Apply responsive image styles based on orientation (portrait/landscape)
          orientation === 'PORTRAIT' ? styles.portraitImage : styles.landscapeImage
        ]}
      />

      {/* Gradient overlay and main content */}
      <CustomGradient
        colors={[Colors.gradientDark, Colors.gradientMid, Colors.gradientLight]}
      >
        <SafeAreaView style={styles.safeAreaContainer}>
          {/* Titles section */}
          <View
            style={[
              orientation === 'PORTRAIT' ? styles.textContainer : styles.landscapeTextContainer,
                                           styles.pixelPanel,
            ]}
            accessibilityRole="header"
          >
            {/* About/information button */}
            <Pressable
              style={[
              orientation === "PORTRAIT" ? styles.pressableAboutContainer : styles.pressableAboutContainerLandscape,
              ]}
              onPress={() => router.push("info/about")} // Direct to the about page
              accessibilityLabel="Get information" // Accessibility label for screen readers
              accessibilityRole="button"
            >
              <Feather name="info" size={20} color="white" />
            </Pressable>
            {/* Main app name with custom font */}
            <Text style={styles.appName} className="font-rpixelstart">
              WildFire {"\n"} Safe
            </Text>
            {/* Subtitle with centered text */}
            <Text style={[styles.subTitleText, styles.textCenter]}>
              Wildfire preparedness, simplified
            </Text>
          </View>

          {/* Buttons for authentication */}
          <View style={styles.buttonContainer}>
            {/* Log In button with accessibilityHint */}
            <CustomNavigationButton
              title="Log In"
              route="/auth/login"
              refRoute="log in page"
              accessibilityLabel="Log In"
              accessibilityHint="Navigate to the log in page."
              handleNavigation={handleNavigation}
            />
            {/* Sign Up button with accessibilityHint */}
            <CustomNavigationButton
              title="Sign Up"
              route="/auth/signup"
              refRoute="sign up page"
              accessibilityLabel="Sign Up"
              accessibilityHint="Navigate to the sign-up page."
              handleNavigation={handleNavigation}
            />
          </View>
          {/* Light-themed status bar */}
          <StatusBar style={Platform.OS === 'ios' ? 'light' : 'auto'} />
        </SafeAreaView>
      </CustomGradient>
    </View>
  );
};

export default App;
