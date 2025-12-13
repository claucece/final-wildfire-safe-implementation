import { ScrollView, Text, View, Platform } from "react-native";

import React from "react";

import { StatusBar } from "expo-status-bar";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import Gallery from "@/components/Gallery";
import CustomGradient from "@/components/CustomGradient";

// Load data
import TESTS_DATA from "@/constants/tests-data.ts";

// Custom styles
import { styles } from "@/styles/App.styles";
import Colors from "@/constants/Colors";

const Tests = () => {
    const insets = useSafeAreaInsets(); // Safearea inset

    return (
        <View style={styles.container}>
            <CustomGradient
                colors={[Colors.gradientQuoteLight, Colors.gradientQuote, Colors.gradientQuoteDark]}
            >
                <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollViewContainer}>
                    {/* Header with main test */}
                    <View style={styles.textContainerQuote}>
                        <Text style={styles.textQuoteStyle} accessible={true} accessibilityLabel="Main test text">
                            Now test your knowledge!
                        </Text>
                        <Text style={styles.textQuoteSmallStyle} accessible={true} accessibilityLabel="Secondary test text">
                            We have tests for you: click on the images and try!
                        </Text>
                    </View>

                    {/* Gallery section to display quotes */}
                    <View style={{ paddingTop: insets.top }}>
                        {TESTS_DATA.map((section) => (
                            <Gallery
                                key={section.title}
                                title={section.title}
                                items={section.data}
                                hrefForItem={(item) => `/test/${item.id}`}
                                accessible={true}
                                accessibilityLabel={`Gallery section: ${section.title}`} // Accessibility for gallery sections
                            />
                        ))}
                    </View>
                </ScrollView>
            </CustomGradient>

            {/* Light-themed status bar */}
            <StatusBar style={Platform.OS === 'ios' ? 'light' : 'auto'} />
        </View>
    );
};

export default Tests;
