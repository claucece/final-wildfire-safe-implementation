import React from "react";
import {
  View,
  Text,
  SafeAreaView,
  StatusBar,
  Platform,
  ScrollView,
} from "react-native";

import { Image } from "expo-image";

// Custom hooks
import { useOrientation } from "@/hooks/useOrientation";

// Custom styles and components
import CustomGradient from "@/components/CustomGradient";
import BackButton from "@/components/CustomBackButton";

import Colors from "@/constants/Colors";
import { styles } from "@/styles/App.styles";

// Constants and assets
import { BLUR_HASH_DATA } from "@/constants/blur-hash-data";
import aboutImage from "@/assets/app-images/about-image.webp";

export default function PrivacyPolicy() {
  const orientation = useOrientation();
  // Determine if portrait
  const isPortrait = orientation === "PORTRAIT";

  return (
    <View style={styles.container}>
      {/* Background image */}
      <Image
        source={aboutImage}
        contentFit="cover"
        placeholder={{
          blurhash: BLUR_HASH_DATA[3]?.hash || "L12rapoL5iR~FQa{-Bo0NWa{xIoN",
        }}
        accessibilityLabel="Background image for privacy policy page"
        accessible
        accessibilityRole="image"
        style={[
          styles.imageContainer,
          orientation === "PORTRAIT"
            ? styles.portraitImage
            : styles.landscapeImage,
        ]}
      />

      <CustomGradient colors={[Colors.gradientDarkLight, Colors.gradientMid]}>
        <SafeAreaView
          style={[styles.safeAreaContainer, styles.safeAreaContainerAuth]}
        >
          {/* Back Button */}
          <BackButton
            orientation={orientation}
            size={isPortrait ? 40 : 30}
            customStyle={isPortrait ? styles.buttonNorm : styles.buttonLand}
            accessibilityLabel="Go back"
          />

          {/* Scrollable content */}
          <ScrollView
            contentContainerStyle={{ flexGrow: 1 }}
            showsVerticalScrollIndicator={false}
          >
            {/* Title container */}
            <View
              style={[
                styles.pixelPanel,
                orientation === "PORTRAIT"
                  ? styles.textContainerAuth
                  : styles.textContainerAuthLandscape,
              ]}
            >
              <Text
                style={[styles.mainTitle, styles.pixelTitle]}
                accessibilityRole="header"
              >
                Privacy Policy
              </Text>

              <Text style={styles.aboutText}>
                Wildfire Safe is designed with privacy as a core principle. We
                aim to provide useful wildfire preparedness tools without
                collecting or tracking unnecessary personal data.
              </Text>

              <Text style={styles.aboutText}>
                We do not store or transmit your location, preferences, badges,
                or activity history to our servers. All calculations, including
                fire proximity checks and intensity evaluation, are performed
                entirely on your device.
              </Text>

              <Text style={styles.aboutText}>
                Location access, if enabled, is used only locally to approximate
                your area and tailor map display or alerts. Your precise
                location is never stored remotely, and only a coarse, rounded
                location may be saved on your device to improve usability.
              </Text>

              <Text style={styles.aboutText}>
                Preferences such as night mode, notification settings, and badge
                progress are stored locally on your device using secure local
                storage. You can disable these at any time.
              </Text>

              <Text style={styles.aboutText}>
                The only personal information stored remotely is the information
                required for authentication: your email address, username, and
                encrypted password. This data is used solely to provide account
                access and is never shared with third parties.
              </Text>

              <Text style={styles.smallText}>
                By keeping all sensitive logic client-side, Wildfire Safe
                ensures that your preparedness journey remains private,
                transparent, and under your control.
              </Text>
            </View>
          </ScrollView>
          {/* Status bar */}
          <StatusBar style={Platform.OS === "ios" ? "light" : "auto"} />
        </SafeAreaView>
      </CustomGradient>
    </View>
  );
}
