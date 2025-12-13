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

const Recommendations = () => {
    const insets = useSafeAreaInsets(); // Safearea inset

    return (
        <View style={styles.container}>
            <CustomGradient
                colors={[Colors.gradientQuoteLight, Colors.gradientQuote, Colors.gradientQuoteDark]}
            >
                <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollViewContainer}>
                    {/* Header with main quote */}
                    <View style={styles.textContainerQuote}>
                        <Text style={styles.textQuoteStyle} accessible={true} accessibilityLabel="Main quote text">
                            Read 8-bit quotes!
                        </Text>
                        <Text style={styles.textQuoteSmallStyle} accessible={true} accessibilityLabel="Secondary quote text">
                            We have quotes for you: click on the images and read them!
                        </Text>
                    </View>

                </ScrollView>
            </CustomGradient>

            {/* Light-themed status bar */}
            <StatusBar style={Platform.OS === 'ios' ? 'light' : 'auto'} />
        </View>
    );
};

export default Recommendations;
