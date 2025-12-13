import { View, Text, SafeAreaView } from "react-native";
import { useRouter } from "expo-router";
import { useCallback } from "react";

import { Image } from "expo-image";
import CustomGradient from "@/components/CustomGradient";
import CustomAnimatedButton from "@/components/CustomAnimatedButton";
import BackButton from "@/components/CustomBackButton";

// Custom hooks
import { useOrientation } from "@/hooks/useOrientation";

// Firebase imports
import { signOut } from "firebase/auth";
import { auth } from "../firebaseConfig";

// Custom styles
// Blurhash placeholder for progressive image loading
import { BLUR_HASH_DATA } from "@/constants/blur-hash-data";
import logInImage from "@/assets/meditation-images/log-in-image.webp";
import Colors from "@/constants/Colors";
import { styles } from "@/styles/App.styles";

export default function Logout() {
  const orientation = useOrientation();
  const router = useRouter();

  // Optimize function recreation
  const handleLogout = useCallback(async () => {
    try {
      await signOut(auth);
      router.push("/");
    } catch (error) {
      console.error("Logout Error:", error.message);
    }
  }, [router]);

  return (
    <View style={styles.container}>
      {/* Background image */}
      <Image
        source={logInImage}
        contentFit="cover"
        priority="high"
        placeholder={{ blurhash: BLUR_HASH_DATA[2]?.hash || "L39[3oI8tuN84?tMIK?Z*F.O4V4Y" }}
        accessibilityLabel="Cozy background image depicting a serene retro environment"
        accessible
        accessibilityRole="image"
        style={[
          styles.imageContainer,
          orientation === "PORTRAIT" ? styles.portraitImage : styles.landscapeImage
        ]}
      />

      {/* Gradient overlay and main content */}
      <CustomGradient colors={[Colors.gradientMid, Colors.gradientDarkLight]}>
        <SafeAreaView style={[styles.safeAreaContainer, styles.safeAreaContainerAuth]}>
          {/* Back Button */}
          <BackButton orientation={orientation} size={orientation === 'PORTRAIT' ? 60 : 40} />

          {/* Title container */}
          <View
            style={[
              orientation === "PORTRAIT" ? styles.textContainerAuth : styles.textContainerAuthLandscape
            ]}
          >
            <Text style={[styles.mainTitle, styles.mainTitleAuth]} accessibilityRole="header">
              Log Out
            </Text>
            <Text style={styles.subTitleText}>Are you sure you want to log out?</Text>
          </View>

          {/* Logout button */}
          <CustomAnimatedButton
            onPress={handleLogout}
            title="Logout"
            textStyles={styles.buttonText}
            accessibilityLabel="Log out"
            accessibilityHint="Signs you out and redirects you to the main screen"
          />
        </SafeAreaView>
      </CustomGradient>
    </View>
  );
}
