import React from "react";
import {
  Text,
  View,
  StatusBar,
  FlatList,
  Pressable,
  ImageBackground,
} from "react-native";

import { useRouter, useLocalSearchParams } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";

// Icons
import { Feather } from "@expo/vector-icons";
// Animations
import LottieView from "lottie-react-native";

// Custom style
import CustomGradient from "@/components/CustomGradient";
import Colors from "@/constants/Colors";
import { styles } from "@/styles/App.styles";

import { useOrientation } from "@/hooks/useOrientation";

import PREPARE_TASK_IMAGES from "@/constants/prepare-tasks-images";
import { PREPARE_TASK_DATA } from "@/constants/prepare-tasks-data";

// The main entry point of the app: shows the prepardness tasks
const Home = () => {
  const orientation = useOrientation();
  // Determine if portrait
  const isPortrait = orientation === "PORTRAIT";

  // Fetch the username for personalization
  const { username } = useLocalSearchParams() || {};

  const router = useRouter();

  // Navigate to individual prepare task session
  const handlePrepareTaskPress = (id: string | number) => {
    router.push(`/prepare/${id}`);
  };

  return (
    <View style={styles.container}>
      <CustomGradient
        colors={[
          Colors.gradientMain,
          Colors.gradientMain,
          Colors.gradientMainDark,
        ]}
      >
        {/* Header with Welcome Message and Username */}
        <View style={[styles.homeHeaderPanel]}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Open settings and profile"
            onPress={() => router.push("/recommendations")}
            style={
              isPortrait ? styles.settingsButton : styles.settingsButtonLand
            }
          >
            <Feather name="settings" size={22} color="white" />
          </Pressable>

          <View style={styles.header}>
            <Text
              testID="welcome-title"
              style={[
                styles.titleStyle,
                isPortrait ? styles.titleStyleNorm : styles.titleStyleLand,
              ]}
              accessibilityLabel={`Welcome, ${username ?? "there"}!`}
              accessibilityRole="header"
            >
              Welcome,{"\n"}
              {username ?? "there"}!
            </Text>

            {/* Lottie Animation */}
            <Pressable accessibilityRole="button" style={styles.lottiePress}>
              <LottieView
                source={require("../../assets/animations/retro-animation.json")}
                loop
                autoPlay
                style={styles.lottieAni}
              />
            </Pressable>
          </View>

          {/* Instruction Text */}
          <Text style={styles.textSmallStyle}>
            Choose a lesson to build your wildfire preparedness step by step.
          </Text>
        </View>

        {/* Prepare Tasks List */}
        <View style={styles.flatContainer}>
          <FlatList
            testID="prepare-list"
            data={PREPARE_TASK_DATA}
            contentContainerStyle={styles.list}
            keyExtractor={(item) => item.id.toString()}
            showsVerticalScrollIndicator={false}
            initialNumToRender={5} // Limit the initial renders
            removeClippedSubviews={true} // Unmounting offscreen items
            windowSize={5} // Items rendered offscreen
            renderItem={({ item }) => (
              <Pressable
                onPress={() => handlePrepareTaskPress(item.id)}
                style={styles.pressableMain}
                accessibilityLabel={`Prepare Task: ${item.title}`}
                accessibilityHint="Opens prepare task details"
                accessibilityRole="button"
              >
                <ImageBackground
                  source={PREPARE_TASK_IMAGES[item.id - 1]}
                  resizeMode="cover"
                  style={styles.backgroundImage}
                  accessible={false}
                >
                  <LinearGradient
                    colors={["transparent", Colors.transparentM]}
                    style={styles.gradient}
                  >
                    <Text style={styles.textListStyle}>{item.title}</Text>
                  </LinearGradient>
                </ImageBackground>
              </Pressable>
            )}
          />
        </View>
      </CustomGradient>

      {/* Status Bar */}
      <StatusBar barStyle="light" />
    </View>
  );
};

export default Home;
