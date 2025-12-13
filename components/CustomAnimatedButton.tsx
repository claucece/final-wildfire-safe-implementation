import { Platform, TouchableOpacity, TouchableNativeFeedback } from "react-native";
import { Text, Animated, ViewStyle, TextStyle } from "react-native";
import React, { useState } from "react";
import { styles } from "@/styles/App.styles"; // Custom styles

// Interface defining the props for the CustomAnimatedButton component
interface CustomAnimatedButtonProps {
    onPress: () => void; // Function to handle press event
    title: string;
    disabled?: boolean; // Optional prop to disable the button
    textStyles?: TextStyle | TextStyle[]; // Optional styles for the button text
    containerStyles?: ViewStyle | ViewStyle[]; // Optional styles for the button container
}

const CustomAnimatedButton = ({
    onPress,
    title,
    disabled,
    textStyles = {}, // Default to empty styles if not provided
    containerStyles = {}, // Default to empty styles if not provided
}: CustomAnimatedButtonProps) => {
    // Animated value to control the scaling effect
    const [scaleVal] = useState(new Animated.Value(1));

    // Function to animate the button's scale on press
    const buttonAnimate = () => {
        Animated.timing(scaleVal, {
            toValue: 0.7,
            duration: 200,
            useNativeDriver: true, // Use native driver for better performance
        }).start(() => {
            Animated.timing(scaleVal, {
                toValue: 1,
                duration: 200,
                useNativeDriver: true, // Use native driver for better performance
            }).start();
        });
    };

    // Combine the animation and the onPress handler
    const combinedOnPress = () => {
        buttonAnimate();
        onPress();
    };

    // Choose TouchableNativeFeedback for Android (with ripple effect),
    // and TouchableOpacity for iOS and other platforms
    const TouchableComponent = Platform.OS === 'android' ? (
        <TouchableNativeFeedback
            onPress={combinedOnPress}
            disabled={disabled}
            background={TouchableNativeFeedback.Ripple('#ddd', false)} // Ripple effect for Android
        >
            <Animated.View
                style={[
                    styles.buttonCompContainer,
                    containerStyles,
                    { transform: [{ scale: scaleVal }] }, // Apply scaling animation
                ]}
            >
                {/* Display the button title wrapped inside the Text component */}
                <Text style={[styles.textButtonComp, textStyles]}>{title}</Text>
            </Animated.View>
        </TouchableNativeFeedback>
    ) : (
        // For iOS and other platforms, use TouchableOpacity for opacity effect
        <TouchableOpacity
            onPress={combinedOnPress}
            disabled={disabled}
            accessibilityRole="button" // For screen readers
            accessibilityLabel={`Press to ${title}`}
            accessibilityState={{ disabled }}
        >
            <Animated.View
                style={[
                    styles.buttonCompContainer,
                    containerStyles,
                    { transform: [{ scale: scaleVal }] }, // Apply scaling animation
                ]}
            >
                {/* Display the button title wrapped inside the Text component */}
                <Text style={[styles.textButtonComp, textStyles]}>{title}</Text>
            </Animated.View>
        </TouchableOpacity>
    );

    return TouchableComponent;
};

export default CustomAnimatedButton;
