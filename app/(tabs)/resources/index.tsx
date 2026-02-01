import { ScrollView, Text, View, Platform } from "react-native";

import React from "react";

import { StatusBar } from "expo-status-bar";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import Gallery from "@/components/Gallery";
import CustomGradient from "@/components/CustomGradient";

// Load data
import QUOTES_DATA from "@/constants/quotes-data.ts";

// Custom styles
import { styles } from "@/styles/App.styles";
import Colors from "@/constants/Colors";

const Resources = () => {
    const insets = useSafeAreaInsets(); // Safearea inset

    return (
        <View style={styles.container}>
            <CustomGradient
                colors={[Colors.gradientTestLight, Colors.gradientTest, Colors.gradientTestDark]}
            >
                <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollViewContainer}>
                    {/* Header with main quote */}
                    <View style={styles.textContainerTest}>
                        <Text style={styles.textTestStyle} accessible={true} accessibilityLabel="Main quote text">
                            We have recommendations!
                        </Text>
                        <Text style={styles.textTestSmallStyle} accessible={true} accessibilityLabel="Secondary quote text">
                        </Text>
                    </View>

                </ScrollView>
            </CustomGradient>

            {/* Light-themed status bar */}
            <StatusBar style={Platform.OS === 'ios' ? 'light' : 'auto'} />
        </View>
    );
};

export default Resources;
