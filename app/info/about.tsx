import React from "react";
import {
  View,
  Text,
  SafeAreaView,
  StatusBar,
  Platform
} from "react-native";

import { Image } from "expo-image";

// Allow external links
import * as Linking from 'expo-linking';

// Custom hooks
import { useOrientation } from "@/hooks/useOrientation";

// Custom styles and components
import CustomGradient from "@/components/CustomGradient";
import BackButton from "@/components/CustomBackButton";

import Colors from "@/constants/Colors";
import { styles } from "@/styles/App.styles";

// Constants and assets
// Blurhash placeholder for progressive image loading
import { BLUR_HASH_DATA } from "@/constants/blur-hash-data";
import aboutImage from "@/assets/app-images/about-image.webp";

export default function About() {
  const orientation = useOrientation();

  return (
    <View style={styles.container}>
      {/* Background image */}
      <Image
        source={aboutImage}
        contentFit="cover"
        placeholder={{ blurhash: BLUR_HASH_DATA[3]?.hash || "L39[3oI8tuN84?tMIK?Z*F.O4V4Y" }}
        accessibilityLabel="Cozy background image depicting a fire environment for about page"
        accessible
        accessibilityRole="image"
        style={[
          styles.imageContainer,
          orientation === 'PORTRAIT' ? styles.portraitImage : styles.landscapeImage
        ]}
      />
      <CustomGradient colors={[Colors.gradientDarkLight, Colors.gradientMid]}>
        <SafeAreaView style={[styles.safeAreaContainer, styles.safeAreaContainerAuth]}>
          {/* Back Button */}
          <BackButton orientation={orientation} size={orientation === 'PORTRAIT' ? 40 : 20} />

          {/* Title container */}
          <View
            style={[
              orientation === 'PORTRAIT' ? styles.textContainerAuth : styles.textContainerAuthLandscape
            ]}
          >
            <Text style={[styles.mainTitle, styles.mainTitleAuth, styles.pixelTitle]}>
              About
            </Text>

            <Text
              style={styles.aboutText}
              accessibilityLabel="Introductory text about the app"
            >
            Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum
            </Text>

          </View>
          <Text
            style={styles.quoteCredit}
            className="font-rpixel"
            accessibilityLabel="Credit text for the app development"
          >
            Credit: The Wildfire Safe developers. 2025-2026. Pixel art used with permission from {" "}
            <Text
              style={styles.linkText}
              onPress={() => Linking.openURL("https://www.patreon.com/NostalgiaTree")}
            >
              NostalgiaTree, 2025.
            </Text>
            Animations used with permission from {" "}
            <Text
              style={styles.linkText}
              onPress={() => Linking.openURL("https://lottiefiles.com/nps2t9xspsl919w4")}
            >
              Uilsu
            </Text>
            {" "} and {" "}
            <Text
              style={styles.linkText}
              onPress={() => Linking.openURL("https://lottiefiles.com/jvf0i8ro9uucz1lu")}
            >
              Alexander, 2025.
            </Text>
          </Text>

          {/* Light-themed status bar */}
          <StatusBar style={Platform.OS === 'ios' ? 'light' : 'auto'} />
        </SafeAreaView>
      </CustomGradient>
    </View>
  );
}
