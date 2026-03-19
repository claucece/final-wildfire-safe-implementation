import React, { useEffect } from "react";

import { Pressable, Platform, BackHandler, ViewStyle } from "react-native";
import { useRouter } from "expo-router";
import Feather from "@expo/vector-icons/Feather";

// Custom styles
import Colors from "@/constants/Colors";
import { styles } from "@/styles/App.styles";

// Prop types for the BackButton component
type BackButtonProps = {
  size?: number; // Optional size
  color?: string; // Optional color
  orientation?: "PORTRAIT" | "LANDSCAPE"; // Orientation
  onPress?: () => void; // Custom function to execute on press
  customStyle?: ViewStyle; // Custom styles for the Pressable container
};

const BackButton = ({
  size = 30, // Default size for the back button icon
  color = Colors.sutleWhite, // Default color
  orientation = "PORTRAIT", // Default orientation
  onPress, // Custom action when button is pressed
  customStyle, // Custom styles
}: BackButtonProps) => {
  const router = useRouter(); // Access navigation router

  useEffect(() => {
    // Handle Android back button
    const backAction = () => {
      if (onPress) {
        onPress();
      } else {
        router.back();
      }
      return true; // Prevent default behavior
    };

    if (Platform.OS === "android") {
      BackHandler.addEventListener("hardwareBackPress", backAction);
      return () =>
        BackHandler.removeEventListener("hardwareBackPress", backAction);
    }
  }, [onPress, router]);

  return (
    <Pressable
      style={[
        orientation === "PORTRAIT"
          ? styles.pressableContainer
          : styles.pressableContainerLandscape,
        customStyle,
      ]}
      onPress={onPress ? onPress : () => router.back()} // Use custom press action or default back action
      accessibilityLabel="Go back" // Accessibility label for screen readers
      accessibilityRole="button"
    >
      <Feather name="arrow-left-circle" size={size} color={color} />
    </Pressable>
  );
};

export default BackButton;
