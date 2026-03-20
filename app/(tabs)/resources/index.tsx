import React from "react";
import {
  ScrollView,
  Text,
  View,
  Platform,
  Pressable,
  Image,
} from "react-native";

import { StatusBar } from "expo-status-bar";
import { useRouter } from "expo-router";
import * as Linking from "expo-linking";
import { useSafeAreaInsets } from "react-native-safe-area-context";

// Custom styles
import { styles } from "@/styles/App.styles";
import Colors from "@/constants/Colors";
import CustomGradient from "@/components/CustomGradient";

// Load data for resources
import RESOURCES_DATA from "@/constants/resources-data.ts";

// The resources
const Resources = () => {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  return (
    <View style={styles.container}>
      <CustomGradient
        colors={[Colors.gradientResourcesLight, Colors.gradientResourcesDark]}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollViewContainer}
        >
          {/* Header */}
          <View style={[styles.homeHeaderPanel]}>
            <View style={styles.textContainerTest}>
              <Text
                style={styles.textTestStyle}
                accessible
                accessibilityLabel="Main resources text"
              >
                We have recommendations!
              </Text>
              <Text
                style={styles.textTestSmallStyle}
                accessible
                accessibilityLabel="Secondary resources text"
              >
                Browse guides by category: quick, practical, and easy to follow.
              </Text>
            </View>
          </View>

          {/* Categories */}
          <View style={{ paddingTop: insets.top - 30 }}>
            {RESOURCES_DATA.map((section) => (
              <View key={section.title}>
                <Text
                  style={[styles.testsTitle, styles.resourceTitle]}
                  accessibilityRole="header"
                  accessibilityLabel={`Resources category: ${section.title}`}
                >
                  {section.title}
                </Text>

                <View>
                  {section.items.map((item) => (
                    <Pressable
                      key={item.id}
                      onPress={() => {
                        if (item.href.startsWith("http")) {
                          Linking.openURL(item.href);
                        } else {
                          router.push(item.href);
                        }
                      }}
                      accessibilityRole="button"
                      accessibilityLabel={`Open resource: ${item.title}`}
                      accessibilityHint="Opens the resource page"
                      android_ripple={{ color: "#ddd" }}
                      style={styles.resource}
                    >
                      <View style={styles.resourceBox}>
                        <Image
                          source={item.image}
                          style={styles.resourceImage}
                          resizeMode="cover"
                          accessibilityRole="image"
                          accessibilityLabel={`Resource image: ${item.title}`}
                        />
                        <View style={styles.resourceInBox}>
                          <Text
                            style={[
                              styles.pixelPrepareTitle,
                              styles.resourceInText,
                            ]}
                            numberOfLines={1}
                          >
                            {item.title}
                          </Text>
                          <Text
                            style={[
                              styles.pixelPrepareSubtleText,
                              { textAlign: "left" },
                            ]}
                            numberOfLines={2}
                          >
                            {item.description}
                          </Text>
                        </View>
                      </View>
                    </Pressable>
                  ))}
                </View>
              </View>
            ))}
          </View>
        </ScrollView>
      </CustomGradient>

      <StatusBar style={Platform.OS === "ios" ? "light" : "auto"} />
    </View>
  );
};

export default Resources;
