import { router, useLocalSearchParams } from "expo-router";

import React, { useContext, useEffect, useState } from "react";
import {
  ImageBackground, Text, View, Dimensions, SafeAreaView, AccessibilityInfo
} from "react-native";

import { Audio } from "expo-av";

import CustomGradient from "@/components/CustomGradient";
import CustomNavigationButton from "@/components/CustomNavigationButton";
import BackButton from "@/components/CustomBackButton";

import { TimerContext } from "@/context/Timer";

// Custom Styles
import LottieView from 'lottie-react-native';
import Colors from "@/constants/Colors";
import { styles } from "@/styles/App.styles";

// Constants
import PREPARE_TASK_IMAGES from "@/constants/prepare-tasks-images";
import { PREPARE_TASK_DATA } from "@/constants/prepare-tasks-data";

// Custom hooks
import { useOrientation } from "@/hooks/useOrientation";
import { useBrightness } from "@/hooks/useBrightness";

const PrepareTask = () => {
  const { width, height } = Dimensions.get('window');
  const { id } = useLocalSearchParams();

  const orientation = useOrientation();
  const screenBrightness = useBrightness();

  const [reduceMotion, setReduceMotion] = useState(false);
  // Reduce motion if enabled by the user for accesibility
  useEffect(() => {
    AccessibilityInfo.isReduceMotionEnabled().then(setReduceMotion);
  }, []);

  // Set gradient depending on brightness
  const gradientColors =
    screenBrightness > 0.5
      ? ["transparent", Colors.transparentMid] // Lighter gradient for bright screens
      : ["transparent", Colors.transparantF]; // Darker gradient for dim screens

  // Set animation sizes
  const animationSize = Math.min(width, height) * 0.9;
  const animationSizeLanSc = Math.min(width, height) * 0.5;

  return (
    <View style={styles.container} >
      <ImageBackground
        source={PREPARE_TASK_IMAGES[Number(id) - 1]}
        resizeMode="cover"
        style={styles.prepareBackground}
        accessibilityRole="image"
      >
        <CustomGradient colors={gradientColors}>
          <SafeAreaView style={[styles.safeAreaContainer, styles.safeAreaContainerAuth]}>
            {/* Back Button */}
            <BackButton
              orientation={orientation}
              size={orientation === 'PORTRAIT' ? 60 : 40}
              accessibilityLabel="Go back"
            />

            <View style={[
              orientation === 'PORTRAIT' ? styles.prepareContainer : styles.prepareContainerLandscape
            ]}>
              {!reduceMotion && (
                <LottieView
                  source={require('../../assets/animations/animation.json')}
                  loop
                  autoPlay
                  style={
                    orientation === 'PORTRAIT'
                      ? { width: animationSize, height: animationSize, position: 'absolute' }
                      : { width: animationSizeLanSc, height: animationSizeLanSc, position: 'absolute' }
                  }
                  accessibilityLabel="Breathing animation"
                />
              )}
            </View>
          </SafeAreaView>
        </CustomGradient>
      </ImageBackground>
    </View>
  );
};

export default PrepareTask;
