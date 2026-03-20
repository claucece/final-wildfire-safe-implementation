import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  SafeAreaView,
  KeyboardAvoidingView,
  ActivityIndicator,
  Modal,
  ScrollView,
  Platform,
} from "react-native";

import { StatusBar } from "expo-status-bar";
import { useRouter } from "expo-router";
import { Image } from "expo-image";

// Custom hooks
import { useOrientation } from "@/hooks/useOrientation";
import { useForm } from "@/hooks/useForm";
import { signUpUser } from "@/app/auth/authService";

// Custom styles
import CustomGradient from "@/components/CustomGradient";
import CustomAnimatedButton from "@/components/CustomAnimatedButton";
import BackButton from "@/components/CustomBackButton";
import Colors from "@/constants/Colors";
import { styles } from "@/styles/App.styles";

// Constants and assets
// Blurhash placeholder for progressive image loading
import { BLUR_HASH_DATA } from "@/constants/blur-hash-data";
import signUpImage from "@/assets/app-images/sign-up-image.webp";

export default function SignUp() {
  const orientation = useOrientation();
  // Determine if portrait
  const isPortrait = orientation === "PORTRAIT";

  // Form to signup
  const { formData, handleInputChange } = useForm();

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);

  const router = useRouter();

  // Validate user input before attempting signup
  const validateForm = () => {
    const { email, password, confirmPassword, username } = formData;
    if (username.length > 9) {
      setError("Username should be no longer than 8 chars.");
      return false;
    }

    if (!email || !password || !confirmPassword || !username) {
      setError("Please fill in all fields.");
      return false;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return false;
    }
    return true;
  };

  // Sign-up logic
  const handleSignUp = async () => {
    if (!validateForm()) return;

    setLoading(true);
    setError(null);

    try {
      const { email, password, username } = formData;
      const { success, errorMessage } = await signUpUser(
        email,
        password,
        username,
      );

      if (success) {
        setModalVisible(true);
        setLoading(false);

        // Auto-dismiss modal and navigate in success
        setTimeout(() => {
          setModalVisible(false);
          router.push("auth/login");
        }, 1000);
      } else {
        setError(errorMessage);
      }
    } catch (error) {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Background Image with BlurHash for performance */}
      <Image
        source={signUpImage}
        contentFit="cover"
        placeholder={{
          blurhash: BLUR_HASH_DATA[1]?.hash || "L2FF24Ed?QMU0CvC=:XT2|CQ$+WG",
        }}
        accessibilityLabel="Cozy background image depicting a serene retro environment for signup"
        accessible
        accessibilityRole="image"
        style={[
          styles.imageContainer,
          orientation === "PORTRAIT"
            ? styles.portraitImage
            : styles.landscapeImage,
        ]}
      />

      <CustomGradient colors={[Colors.gradientMid, Colors.gradientDarkLight]}>
        <SafeAreaView
          style={[styles.safeAreaContainer, styles.safeAreaContainerAuth]}
        >
          {/* Back Button */}
          <BackButton
            orientation={orientation}
            customStyle={isPortrait ? styles.buttonNorm : styles.buttonLand}
            size={isPortrait ? 40 : 50}
          />

          {/* Title Section */}
          <View
            style={[
              styles.pixelPanel,
               isPortrait
                ? styles.textContainerAuth
                : styles.textContainerAuthLandscape,
            ]}
          >
            <Text
              style={[
                styles.mainTitle,
                styles.mainTitleAuth,
                isPortrait ? styles.pixelTitle : styles.pixelTitleLand,
              ]}
            >
              Sign Up
            </Text>
            <Text style={[styles.pixelSubtleText]}>
              Start your preparedness progress
            </Text>
          </View>

          {/* Modal for Sign-Up Success */}
          {modalVisible && (
            <Modal
              transparent
              animationType="fade"
              supportedOrientations={["portrait", "landscape"]}
            >
              <View style={styles.modalOverlay}>
                <View
                  style={styles.modalContainer}
                  accessible
                  accessibilityRole="alert"
                >
                  <Text
                    style={styles.modalText}
                    accessibilityLabel="Sign-Up Successful. Redirecting now."
                  >
                    Sign-Up Successful! Redirecting...
                  </Text>
                </View>
              </View>
            </Modal>
          )}

          {/* Form Inputs */}
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
          >
            {/* Ensure the login form remains scrollable even when the keyboard pops */}
            <ScrollView
              contentContainerStyle={styles.formScroll}
              keyboardShouldPersistTaps="handled"
            >
              <View style={[styles.pixelPanel, styles.formPanel]}>
                {["username", "email", "password", "confirmPassword"].map(
                  (field, index) => (
                    <TextInput
                      key={index}
                      style={[
                        isPortrait ? styles.input : styles.inputLandscape,
                      ]}
                      placeholder={
                        field === "confirmPassword"
                          ? "Confirm Password"
                          : `Your ${field.charAt(0).toUpperCase() + field.slice(1)}`
                      }
                      placeholderTextColor="#EAEAEA"
                      value={formData[field as keyof typeof formData]}
                      onChangeText={(value) =>
                        handleInputChange(field as keyof typeof formData, value)
                      }
                      secureTextEntry={field.toLowerCase().includes("password")}
                      autoCapitalize={
                        ["email", "password", "confirmPassword"].includes(field)
                          ? "none"
                          : "words"
                      }
                      keyboardType={
                        field === "email" ? "email-address" : "default"
                      }
                      textContentType={
                        ["password", "confirmPassword"].includes(field)
                          ? "oneTimeCode"
                          : "none"
                      }
                      accessibilityLabel={field}
                      maxLength={field === "username" ? 8 : undefined} // Limit length of username
                    />
                  ),
                )}

                {/* Error Handling */}
                {error && <Text style={styles.errorText}>{error}</Text>}
                {loading ? (
                  <ActivityIndicator
                    size="small"
                    style={styles.activityIndicator}
                  />
                ) : (
                  <CustomAnimatedButton
                    onPress={handleSignUp}
                    title="Sign Up"
                    textStyles={styles.buttonText}
                    accessibilityLabel="Sign Up button"
                  />
                )}
              </View>
            </ScrollView>
          </KeyboardAvoidingView>
          {/* Light-themed status bar */}
          <StatusBar style={Platform.OS === "ios" ? "light" : "auto"} />
        </SafeAreaView>
      </CustomGradient>
    </View>
  );
}
