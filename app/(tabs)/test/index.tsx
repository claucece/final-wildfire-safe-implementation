import { ScrollView, Text, View, Platform } from "react-native";

import React from "react";

import { StatusBar } from "expo-status-bar";
import { useSafeAreaInsets } from "react-native-safe-area-context";

// Our components
import Gallery from "@/components/Gallery";
import CustomGradient from "@/components/CustomGradient";

// Load data
import TESTS_DATA from "@/constants/tests-data.ts";

// Custom styles
import { styles } from "@/styles/App.styles";
import Colors from "@/constants/Colors";

// The list of tests
const Tests = () => {
  const insets = useSafeAreaInsets(); // Safearea inset

  return (
    <View style={styles.container}>
      <CustomGradient
        colors={[
          Colors.gradientTestLight,
          Colors.gradientTest,
          Colors.gradientTestDark,
        ]}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollViewContainer}
        >
          {/* Header with main test */}
          <View style={styles.textContainerTest}>
            <View style={[styles.homeHeaderPanel]}>
              <Text
                style={styles.textTestStyle}
                accessible={true}
                accessibilityLabel="Main test text"
              >
                Now test your knowledge...
              </Text>
              <Text
                style={styles.textTestSmallStyle}
                accessible={true}
                accessibilityLabel="Secondary test text"
              >
                We have tests for you: click on the images and try!
              </Text>
            </View>
          </View>

          {/* Gallery section to display tests */}
          <View style={{ paddingTop: insets.top - 30 }}>
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
      <StatusBar style={Platform.OS === "ios" ? "light" : "auto"} />
    </View>
  );
};

export default Tests;
