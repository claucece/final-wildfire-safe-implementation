import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  ImageBackground,
  Text,
  View,
  SafeAreaView,
  AccessibilityInfo,
  FlatList,
  NativeScrollEvent,
  NativeSyntheticEvent,
  useWindowDimensions,
  ScrollView,
} from "react-native";

import { useLocalSearchParams } from "expo-router";

import LottieView from "lottie-react-native";

// Icons
import { Feather, Ionicons } from "@expo/vector-icons";

import CustomGradient from "@/components/CustomGradient";
import BackButton from "@/components/CustomBackButton";
import HighlightedText from "@/components/HighlightedText";

// Custom styles
import Colors from "@/constants/Colors";
import { styles } from "@/styles/App.styles";

import PREPARE_TASK_IMAGES from "@/constants/prepare-tasks-images";
import { PREPARE_TASK_DATA } from "@/constants/prepare-tasks-data";

// Custom hooks
import { useOrientation } from "@/hooks/useOrientation";
import { useBrightness } from "@/hooks/useBrightness";

// Each session as a page
type Page = { key: string; title: string; body: string };

// The individual prepare task
const PrepareTask = () => {
  const orientation = useOrientation();
  // Determine if portrait
  const isPortrait = orientation === "PORTRAIT";

  // Get width and height
  const { width, height: screenHeight } = useWindowDimensions();

  const { id } = useLocalSearchParams<{ id: string }>();
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
    [id],
  );

  // The individual page information template
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

  // Page total and id
  const total = Math.max(1, pages.length);
  const [pageIndex, setPageIndex] = useState(0);

  // The concrete list reference
  const listRef = useRef<FlatList<Page>>(null);

  const onMomentumEnd = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const idx = Math.round(e.nativeEvent.contentOffset.x / width);
    setPageIndex(Math.max(0, Math.min(idx, total - 1)));
  };

  // Progress info
  const progress = (pageIndex + 1) / total; // 0..1
  const progressPct = Math.round(progress * 100);

  // "time left" estimate: 1 min per page remaining
  const minutesLeft = Math.max(0, (total - (pageIndex + 1)) * 1);

  // Lottie inside the bar: position it at the end of the filled portion
  const BAR_WIDTH = width - 24 - 24; // content width-ish
  const lottieSize = 26;
  const lottieLeft = Math.max(
    0,
    Math.min(BAR_WIDTH - lottieSize, BAR_WIDTH * progress - lottieSize / 2),
  );

  // In case there is no task
  if (!task) {
    return (
      <View style={styles.container}>
        <SafeAreaView
          style={[styles.safeAreaContainer, styles.safeAreaContainerAuth]}
        >
          <BackButton
            orientation={orientation}
            size={isPortrait ? 50 : 30}
          />
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
          <SafeAreaView
            style={[styles.safeAreaContainer, styles.safeAreaContainerAuth]}
          >
            <BackButton
              orientation={orientation}
              size={isPortrait ? 40 : 30}
              customStyle={isPortrait ? styles.buttonNorm : styles.buttonLand}
              accessibilityLabel="Go back"
            />

            {/* Top panel: title and progress */}
            <View style={[styles.pixelPreparePanel]}>
              <Text style={[styles.pixelPrepareTitle]}>{task.title}</Text>
              <Text
                testID="progress-meta"
                style={styles.pixelPrepareSubtleText}
              >
                {pageIndex + 1}/{total}{" "}
                <Feather name="chevrons-right" size={14} color={Colors.orangeLogo} />{" "}
                {progressPct}%{" "}
                <Feather name="clock" size={14} color={Colors.orangeLogo} /> {minutesLeft}{" "}
                min left
              </Text>

              {/* Progress bar */}
              <View style={styles.progressBarOuter}>
                <View
                  style={[styles.progressBarFill, { width: `${progressPct}%` }]}
                />

                {!reduceMotion && (
                  <View
                    style={[styles.progressLottieWrap, { left: lottieLeft }]}
                  >
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
              testID="pages-list"
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
                    {
                      width: isPortrait
		        ? width / 1.1
			: width / 1.3,
                      height: isPortrait
                        ? screenHeight * 0.6
                        : screenHeight * 0.75,
                    },
                  ]}
                >
                  <ScrollView
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={{ flexGrow: 1 }}
                  >
                    <View
                      style={[styles.pixelPrepareTaskPanel]}
                    >
                      <Text style={[styles.pixelPrepareTaskTitle]}>
                        {item.title}
                      </Text>

                      <HighlightedText
                        text={item.body}
                        highlights={[
                          "wind",
                          "wildfires",
                          "wildfire",
                          "evacuations",
                          "evacuation",
                          "alerts",
                          "slopes",
                          "slope",
                          "fuels",
                          "fuel",
                          "medication",
                          "firefighters",
                        ]}
                        style={styles.pixelPrepareTaskSubtleText}
                        highlightStyle={{ fontWeight: "800" }}
                      />
                      {index < 3 && (
                        <View style={styles.swipeRow}>
                          <Text style={styles.prepareTaskSwipeText}>
                            Swipe left to continue
                          </Text>
                          <Ionicons
                            name="arrow-forward"
                            size={18}
                            color={Colors.subtitlePrimary}
                          />
                        </View>
                      )}
                      {index === pages.length - 1 && (
                        <View style={styles.swipeRow}>
                          <Text style={styles.prepareTaskSwipeText}>
                            End of the task!{"\n"}You can return to the main
                            screen!
                          </Text>
                          <Feather
                            name="home"
                            size={18}
                            color={Colors.subtitlePrimary}
                            style={styles.homeIconSwipe}
                          />
                        </View>
                      )}
                    </View>
                  </ScrollView>
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
