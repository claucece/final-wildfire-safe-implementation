import "@/global.css";

import { ViewStyle, Platform } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

import React, { ReactNode, useMemo } from "react";

import CustomSafeView from "./CustomSafeView"; // Wrapper for safe areas

import Colors from "@/constants/Colors"; // Color constants
import { styles } from "@/styles/App.styles"; // Custom style

// Define the props for the CustomGradient component
interface CustomGradientProps {
  children: ReactNode; // Children
  colors: string[];
  style?: ViewStyle; // Optional prop to allow passing custom styles for the gradient container
  start?: { x: number; y: number }; // Optional starting point for the gradient (default top-left)
  end?: { x: number; y: number }; // Optional end point for the gradient (default bottom-right)
}

const CustomGradient = ({
  children,
  colors = [
    Colors.gradientBlueLight,
    Colors.gradientBlue,
    Colors.gradientBlueDark,
  ], // Default colors for gradient
  style,
  start = { x: 0, y: 0 }, // Default gradient start point (top-left corner)
  end = { x: 1, y: 1 }, // Default gradient end point (bottom-right corner)
}: CustomGradientProps) => {
  // useMemo to avoid recalculating the gradient configuration on every render
  const gradientProps = useMemo(
    () => ({
      colors,
      style: [styles.linearGradientContainer, style], // Merge custom styles with default gradient styles
      start,
      end,
      // Adjust dithering (gradient smoothing) based on the platform
      dither: Platform.OS === "android" ? false : true,
    }),
    [colors, style, start, end],
  );

  return (
    <LinearGradient
      {...gradientProps} // Apply the gradient props to the LinearGradient component
    >
      {/* CustomSafeView ensures proper rendering */}
      <CustomSafeView>{children}</CustomSafeView>
    </LinearGradient>
  );
};

export default CustomGradient;
