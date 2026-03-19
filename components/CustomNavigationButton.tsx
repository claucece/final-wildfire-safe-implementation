import "@/global.css";

import React from "react";

import CustomAnimatedButton from "@/components/CustomAnimatedButton"; // Importing custom button component for animations

import { styles } from "@/styles/App.styles"; // Custom styles

// Props for the CustomNavigationButton component
interface NavigationButtonProps {
  title: string;
  route: string; // Route to navigate to
  refRoute: string; // Reference route for navigation logic
  onPress?: () => void; // Optional function for button press
  accessibilityLabel: string; // Accessibility label for screen readers
  handleNavigation: (route: string, params?: Record<string, any>) => void; // Navigation function to handle the route change
}

const CustomNavigationButton = ({
  title,
  route,
  refRoute,
  onPress,
  accessibilityLabel,
  handleNavigation,
}: NavigationButtonProps) => {
  return (
    <CustomAnimatedButton
      onPress={onPress || (() => handleNavigation(route, { ref: refRoute }))} // Default to navigation if no custom onPress
      title={title}
      containerStyles={[styles.navButtonContainer, styles.shadowStyle]} // Merge custom container styles for button (with shadow effect)
      textStyles={styles.navButtonText} // Custom text styles
      accessibilityLabel={accessibilityLabel} // Provide a label for screen readers
    />
  );
};

export default CustomNavigationButton;
