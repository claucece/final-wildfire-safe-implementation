import "@/global.css";

import React from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { Text } from "react-native"; // Import Text to wrap raw strings

import { styles } from "@/styles/App.styles"; // Custom styles

// Props for the CustomSafeView component
interface CustomSafeViewProps {
    children: React.ReactNode;
}

// CustomSafeView component to ensure content is properly positioned
const CustomSafeView = ({ children }: CustomSafeViewProps) => {
    return (
        <SafeAreaView style={[styles.safeViewContainer]}>
            {typeof children === "string" ? (
                <Text>{children}</Text> // Wrap strings in a Text component
            ) : (
                children
            )}
        </SafeAreaView>
    );
};

export default CustomSafeView;
