import React from "react";
import {
  View,
  Text,
  SafeAreaView,
  StatusBar,
  Platform,
} from "react-native";

import { Image } from "expo-image";
import * as Linking from "expo-linking";

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

export default function About() {
  const orientation = useOrientation();

  return (
    <View style={styles.container}>
      {/* Background image */}
      <Image
        source={aboutImage}
        contentFit="cover"
        placeholder={{
          blurhash:
            BLUR_HASH_DATA[3]?.hash || "L39[3oI8tuN84?tMIK?Z*F.O4V4Y",
        }}
        accessibilityLabel="Cozy background image depicting a fire environment for about page"
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
            size={orientation === "PORTRAIT" ? 40 : 20}
          />

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
              About Wildfire Safe
            </Text>

            <Text
              style={styles.aboutText}
              accessibilityLabel="Introductory text about our app"
            >
              The app you have has been designed to help in wildfire-prone areas
              to prepare calmly and confidently. We provide you with short,
              easy-to-follow lessons, interactive checklists and tests, and
              personalised guidance. We focus specifically on wildfire
              preparedness, providing clear steps, progress tracking, and
              supportive design, without overwhelming notifications. Wildfire
              Safe aims to make wildfire readiness simple, accessible, and
              stress-free for everyone.
            </Text>
          </View>

          {/* Credits */}
          <View>
            <Text
              style={styles.quoteCredit}
              className="font-rpixel"
              accessibilityLabel="Credit text for the app development"
            >
              Credit: Wildfire Safe developers. 2025-2026. Pixel art used with
              permission from{" "}
              <Text
                style={styles.linkText}
                accessibilityRole="link"
                accessibilityHint="Opens NostalgiaTree Patreon page in your browser"
                onPress={() =>
                  Linking.openURL("https://www.patreon.com/NostalgiaTree")
                }
              >
                NostalgiaTree, 2025.
              </Text>
              {" "}Animations used with permission from{" "}
              <Text
                style={styles.linkText}
                accessibilityRole="link"
                accessibilityHint="Opens Uilsu animation on LottieFiles"
                onPress={() =>
                  Linking.openURL(
                    "https://lottiefiles.com/nps2t9xspsl919w4"
                  )
                }
              >
                Uilsu
              </Text>
              {" "}and{" "}
              <Text
                style={styles.linkText}
                accessibilityRole="link"
                accessibilityHint="Opens Alexander animation on LottieFiles"
                onPress={() =>
                  Linking.openURL(
                    "https://lottiefiles.com/jvf0i8ro9uucz1lu"
                  )
                }
              >
                Alexander, 2025.
              </Text>
            </Text>
          </View>

          {/* Light-themed status bar */}
          <StatusBar style={Platform.OS === "ios" ? "light" : "auto"} />
        </SafeAreaView>
      </CustomGradient>
    </View>
  );
}
