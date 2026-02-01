import React from "react";
import { ScrollView, Text, View, Platform, Pressable, Image } from "react-native";

import { StatusBar } from "expo-status-bar";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Link } from "expo-router";

import CustomGradient from "@/components/CustomGradient";

// Custom styles
import { styles } from "@/styles/App.styles";
import Colors from "@/constants/Colors";
import images from "@/constants/tests-images";

const RESOURCES_DATA = [
  {
    title: "External help",
    items: [
      {
        id: "alerts",
        title: "Wildfire guidance",
        description: "RedCross Wildfire safety.",
        href: "https://www.redcross.org/get-help/how-to-prepare-for-emergencies/types-of-emergencies/wildfire.html",
        image: images.testImageEleven,
      },
      {
        id: "global-fires",
        title: "Global Fires",
        description: "NASA's map of wildfires.",
        href: "https://firms.modaps.eosdis.nasa.gov/",
        image: images.testImageEight,
      },
    ],
  },
  {
    title: "Volunteering Efforts",
    items: [
      {
        id: "ngo-1",
        title: "IFRC",
        description: "Red Cross volunteering.",
        href: "https://www.ifrc.org/article/heatwaves-and-wildfires-europe-red-cross-and-red-crescent-teams-protect-people-high-risk",
        image: images.testImageTen,
      },
      {
        id: "ngo-2",
        title: "Team Rubicon",
        description: "Volunteer with Rubicon.",
        href: "https://teamrubiconusa.org/how-to-get-involved/volunteer-with-us",
        image: images.testImageTwelve,
      },
    ],
  },
  {
    title: "FAQ",
    items: [
      {
        id: "faq",
        title: "FAQ",
        description: "Let's go to the FAQ!",
        href: "/faq",
        image: images.testImageThTeen,
      },
    ],
  },
];

const Resources = () => {
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.container}>
      <CustomGradient
        colors={[
          Colors.gradientResourcesLight,
          Colors.gradientResourcesDark,
        ]}
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
                  style={[styles.testsTitle, {fontSize: 18, backgroundColor: Colors.orangeTitle, marginTop: 5}]}
                  accessibilityRole="header"
                  accessibilityLabel={`Resources category: ${section.title}`}
                >
                  {section.title}
                </Text>

                <View>
                  {section.items.map((item) => (
                    <Link key={item.id} href={item.href} asChild>
                      <Pressable
                        accessibilityRole="button"
                        accessibilityLabel={`Open resource: ${item.title}`}
                        accessibilityHint="Opens the resource page"
                        android_ripple={{ color: "#ddd" }}
                        style={styles.resource}
                      >
<View style={{ flexDirection: "row", alignItems: "center" }}>
  <Image
    source={item.image}
    style={{
      width: 74,
      height: 74,
      marginRight: 5,
      borderWidth: 2,
    }}
    resizeMode="cover"
    accessibilityRole="image"
    accessibilityLabel={`Resource image: ${item.title}`}
  />

  <View style={{ flex: 1, marginLeft: 15}}>
    <Text
      style={[
        styles.pixelPrepareTitle,
        { fontSize: 18, textAlign:"left", },
      ]}
      numberOfLines={1}
    >
      {item.title}
    </Text>

    <Text style={[styles.pixelPrepareSubtleText, {textAlign:"left"}]} numberOfLines={2}>
      {item.description}
    </Text>
  </View>
</View>
                      </Pressable>
                    </Link>
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
