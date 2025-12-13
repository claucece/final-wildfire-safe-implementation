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

import { Feather } from "@expo/vector-icons";
import LottieView from "lottie-react-native";

// Custom style
import CustomGradient from "@/components/CustomGradient";
import Colors from "@/constants/Colors";
import { styles } from "@/styles/App.styles";

import PREPARE_TASK_IMAGES from "@/constants/prepare-tasks-images";
import { PREPARE_TASK_DATA } from "@/constants/prepare-tasks-data";

const Home = () => {
  const { username } = useLocalSearchParams() || {};
  const router = useRouter();

  // Navigate to logout screen
  const handlePressLogout = () => {
    router.push(`/auth/logout`);
  };

  // Navigate to prepare task session
  const handlePrepareTaskPress = (id: string | number) => {
    router.push(`/prepare/${id}`);
  };

  return (
    <View style={styles.container}>
      <CustomGradient colors={[Colors.gradientMain, Colors.gradientMain, Colors.gradientMainDark]}>
        {/* Header with Welcome Message & Logout Button */}
        <View style={[styles.homeHeaderPanel]}>
        <View style={styles.header}>
          <Text style={styles.titleStyle} accessibilityRole="header">
            Welcome,{"\n"}{username}!
          </Text>

          {/* Logout Button with Lottie Animation */}
          <Pressable
            style={styles.lottiePress}
            onPress={handlePressLogout}
            accessibilityLabel="Logout"
            accessibilityHint="Navigates to logout screen"
          >
            <LottieView
              source={require('../../assets/animations/retro-animation.json')}
              loop
              autoPlay
              style={styles.lottieAni}
            />
          </Pressable>
        </View>

        {/* Instruction Text */}
        <Text style={styles.textSmallStyle}>
          Choose a lesson to build your wildfire readiness step by step.
        </Text>
        </View>

        {/* Prepare Tasks List */}
        <View style={styles.flatContainer}>
          <FlatList
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
              >
                <ImageBackground
                  source={PREPARE_TASK_IMAGES[item.id - 1]}
                  resizeMode="cover"
                  style={styles.backgroundImage}
                >
                  <LinearGradient
                    colors={["transparent", Colors.transparentM]}
                    style={styles.gradient}
                  >
                    <Text style={styles.textListStyle}>
                      {item.title}
                    </Text>
                  </LinearGradient>
                </ImageBackground>
              </Pressable>
            )}
          />
        </View>
      </CustomGradient>

      {/* Status Bar */}
      <StatusBar style="light" />
    </View>
  );
};

export default Home;
