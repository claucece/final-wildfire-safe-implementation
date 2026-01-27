import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  ImageBackground,
  Text,
  View,
  Dimensions,
  SafeAreaView,
  AccessibilityInfo,
  FlatList,
  NativeScrollEvent,
  NativeSyntheticEvent,
} from "react-native";

import { useLocalSearchParams } from "expo-router";
import LottieView from "lottie-react-native";

import CustomGradient from "@/components/CustomGradient";
import BackButton from "@/components/CustomBackButton";
import HighlightedText from "@/components/HighlightedText";

import Colors from "@/constants/Colors";
import { styles } from "@/styles/App.styles";

import PREPARE_TASK_IMAGES from "@/constants/prepare-tasks-images";
import { PREPARE_TASK_DATA } from "@/constants/prepare-tasks-data";

import { useOrientation } from "@/hooks/useOrientation";
import { useBrightness } from "@/hooks/useBrightness";

// Get width and height
const { width } = Dimensions.get("window");
const { height: screenHeight } = Dimensions.get("window");

// Each session
type Page = { key: string; title: string; body: string };

const PrepareTask = () => {
  const { id } = useLocalSearchParams<{ id: string }>();
  const orientation = useOrientation();
  const screenBrightness = useBrightness();

  const [reduceMotion, setReduceMotion] = useState(false);
  useEffect(() => {
    AccessibilityInfo.isReduceMotionEnabled().then(setReduceMotion);
  }, []);

  // Background overlay gradient depending on brightness
  const gradientColors =
    screenBrightness > 0.5
      ? ["transparent", Colors.transparentMid]
      : ["transparent", Colors.transparantF];

  const task = useMemo(
    () => PREPARE_TASK_DATA.find((t) => String(t.id) === String(id)),
    [id]
  );

  const pages: Page[] = useMemo(() => {
    if (!task) return [];
    return [
      { key: "overview", title: "Overview", body: task.description ?? "" },
      { key: "why", title: "Why it matters", body: task.why ?? "" },
      {
        key: "steps",
        title: "Steps",
        body: task.steps?.length ? `• ${task.steps.join("\n• ")}` : "",
      },
      {
        key: "tips",
        title: "Tips",
        body: task.tips?.length ? `• ${task.tips.join("\n• ")}` : "",
      },
    ];
  }, [task]);

  const total = Math.max(1, pages.length);
  const [pageIndex, setPageIndex] = useState(0);
  const listRef = useRef<FlatList<Page>>(null);

  const onMomentumEnd = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const idx = Math.round(e.nativeEvent.contentOffset.x / width);
    setPageIndex(Math.max(0, Math.min(idx, total - 1)));
  };

  const progress = (pageIndex + 1) / total; // 0..1
  const progressPct = Math.round(progress * 100);

  // "time left" estimate: 1 min per page remaining
  const minutesLeft = Math.max(0, (total - (pageIndex + 1)) * 1);

  // Lottie inside the bar: position it at the end of the filled portion
  const BAR_WIDTH = width - 24 - 24; // content width-ish
  const lottieSize = 26;
  const lottieLeft = Math.max(
    0,
    Math.min(BAR_WIDTH - lottieSize, BAR_WIDTH * progress - lottieSize / 2)
  );

  if (!task) {
    return (
      <View style={styles.container}>
        <SafeAreaView style={[styles.safeAreaContainer, styles.safeAreaContainerAuth]}>
          <BackButton orientation={orientation} size={orientation === "PORTRAIT" ? 60 : 40} />
          <View style={[styles.pixelPanel, { marginTop: 12 }]}>
            <Text style={[styles.pixelSubtleText, { textAlign: "center" }]}>
              Task not found.
            </Text>
          </View>
        </SafeAreaView>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ImageBackground
        source={PREPARE_TASK_IMAGES[Number(id) - 1]}
        resizeMode="cover"
        style={styles.prepareBackground}
        accessibilityRole="image"
      >
        <CustomGradient colors={gradientColors}>
          <SafeAreaView style={[styles.safeAreaContainer, styles.safeAreaContainerAuth]}>
            <BackButton
              orientation={orientation}
              size={orientation === "PORTRAIT" ? 60 : 40}
              accessibilityLabel="Go back"
            />

            {/* Top panel: Title and Progress */}
            <View style={[styles.pixelPreparePanel]}>
              <Text style={[styles.pixelPrepareTitle]}>
                {task.title}
              </Text>

              <Text style={[styles.pixelPrepareSubtleText]}>
                {pageIndex + 1}/{total} • {progressPct}% • {minutesLeft} min left
              </Text>

              {/* Progress bar */}
              <View style={styles.progressBarOuter}>
                <View style={[styles.progressBarFill, { width: `${progressPct}%` }]} />

                {!reduceMotion && (
                  <View style={[styles.progressLottieWrap, { left: lottieLeft }]}>
                    <LottieView
                      source={require("../../assets/animations/animation.json")}
                      autoPlay
                      loop
                      style={{ width: lottieSize, height: lottieSize }}
                      accessibilityLabel="Progress bar animation"
                    />
                  </View>
                )}
              </View>
            </View>

            {/* Horizontal pages that the user scrolls left */}
            <FlatList
              ref={listRef}
              data={pages}
              keyExtractor={(p) => p.key}
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              onMomentumScrollEnd={onMomentumEnd}
              contentContainerStyle={{ paddingTop: 12 }}
              renderItem={({ item, index }) => (
                <View
                  style={[
                    styles.preparePage,
                    { width: width / 1.1, height: screenHeight * 0.55 }
                    ]}
>
                  <View style={[styles.pixelPrepareTaskPanel, { height: "100%" }]}>
                    <Text style={[styles.pixelPrepareTaskTitle]}>
                      {item.title}
                    </Text>

<HighlightedText
  text={item.body}
  highlights={["wind", "wildfires", "wildfire", "evacuations", "evacuation", "alerts", "slopes", "slope", "fuels", "fuel", "medication", "firefighters"]}
  style={styles.pixelPrepareTaskSubtleText}
  highlightStyle={{ fontWeight: "800" }}
/>
{index < 3 && (
                    <Text style={[styles.prepareTaskSwipeText]}>
                      Swipe left to continue →
                    </Text>
)}
{index == 3 && (
                    <Text style={[styles.prepareTaskSwipeText]}>
                      End of the task!{"\n"}You can return to the main screen!
                    </Text>
)}
                  </View>
                </View>
              )}
            />
          </SafeAreaView>
        </CustomGradient>
      </ImageBackground>
    </View>
  );
};

export default PrepareTask;
