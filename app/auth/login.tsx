import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  SafeAreaView,
  StatusBar,
  KeyboardAvoidingView,
  ActivityIndicator,
  Platform,
  ScrollView
} from "react-native";

import { useRouter } from "expo-router";
import { Image } from "expo-image";

import { loginUser } from "@/app/auth/authService";

// Custom hooks
import { useOrientation } from "@/hooks/useOrientation";
import { useForm } from "@/hooks/useForm";

// Custom styles
import CustomGradient from "@/components/CustomGradient";
import CustomAnimatedButton from "@/components/CustomAnimatedButton";
import BackButton from "@/components/CustomBackButton";
import Colors from "@/constants/Colors";
import { styles } from "@/styles/App.styles";

// Constants and assets
// Blurhash placeholder for progressive image loading
import { BLUR_HASH_DATA } from "@/constants/blur-hash-data";
import logInImage from "@/assets/app-images/log-in-image.webp";

export default function Login() {
  const orientation = useOrientation();
  const { formData, handleInputChange } = useForm();

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const router = useRouter();

  // Validate user input before attempting login
  const validateForm = () => {
    const { email, password } = formData;

    if (!email || !password) {
      setError("Please fill in all fields.");
      setLoading(false);
      return false;
    }
    return true;
  };

  // Login logic
  const handleLogin = async () => {
    if (!validateForm()) return;

    setLoading(true); // Show loading indicator
    setError(null);   // Clear any previous error

    try {
      const { email, password } = formData;
      const { success, username, errorMessage } = await loginUser(email, password);

      if (success) {
        setLoading(false);
        router.push({
          pathname: "/home",
          params: { post: "random", username: username }, // Passing the username to the next routes
        });
      } else {
        setError(errorMessage);
        setLoading(false);
      }
    } catch (error) {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Background image */}
      <Image
        source={logInImage}
        contentFit="cover"
        placeholder={{ blurhash: BLUR_HASH_DATA[2]?.hash || "L39[3oI8tuN84?tMIK?Z*F.O4V4Y" }}
        accessibilityLabel="Cozy background image depicting a serene retro environment for login"
        accessible
        accessibilityRole="image"
        style={[
          styles.imageContainer,
          orientation === 'PORTRAIT' ? styles.portraitImage : styles.landscapeImage
        ]}
      />
      <CustomGradient colors={[Colors.gradientMid, Colors.gradientDarkLight]}>
        <SafeAreaView style={[styles.safeAreaContainer, styles.safeAreaContainerAuth]}>
          {/* Back Button */}
          <BackButton orientation={orientation} size={orientation === 'PORTRAIT' ? 40 : 20} />

          {/* Title container */}
          <View
            style={[
              styles.pixelPanel,
              orientation === 'PORTRAIT' ? styles.textContainerAuth : styles.textContainerAuthLandscape
            ]}
          >
            <Text style={[styles.mainTitle, styles.mainTitleAuth, styles.pixelTitle]}>Log In</Text>
            <Text style={[styles.pixelSubtleText]}>
              Continue your preparedness progress
            </Text>
          </View>

          <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
          {/* Ensure the login form remains scrollable even when the keyboard pops */}
          <ScrollView
            contentContainerStyle={styles.formScroll}
            keyboardShouldPersistTaps="handled"
          >
          {/* Form Inputs */}
            <View style={[styles.pixelPanel, styles.formPanel]}>
            {["email", "password"].map((field, index) => (
              <TextInput
                key={index}
                style={[
                  orientation === 'PORTRAIT' ? styles.input : styles.inputLandscape
                ]}
                placeholder={`Your ${field.charAt(0).toUpperCase() + field.slice(1)}`}
                placeholderTextColor="#EAEAEA"
                value={formData[field as keyof typeof formData]}
                onChangeText={(value) => handleInputChange(field as keyof typeof formData, value)}
                secureTextEntry={field.toLowerCase().includes("password")}
                autoCapitalize={"none"}
                keyboardType={field === "email" ? "email-address" : "default"}
                textContentType={["password"].includes(field) ? "oneTimeCode" : "none"}
                accessibilityLabel={field}
              />
            ))}

            {/* Display error message if any */}
            {error && <Text style={styles.errorText} accessibilityLabel="error fields">{error}</Text>}

            {/* Show either the loading indicator or the login button */}
            {loading ? (
              <ActivityIndicator size="small" style={styles.activityIndicator} />
            ) : (
              <CustomAnimatedButton
                onPress={loading ? null : handleLogin}
                title="Log In"
                textStyles={styles.buttonText}
                accessibilityLabel="Login button"
              />
            )}
          </View>
          </ScrollView>
          </KeyboardAvoidingView>

          {/* Light-themed status bar */}
          <StatusBar style={Platform.OS === 'ios' ? 'light' : 'auto'} />
        </SafeAreaView>
      </CustomGradient>
    </View>
  );
}
