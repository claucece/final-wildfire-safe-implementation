import React, { useCallback, useMemo, useState, useEffect } from "react";
import { View, Text } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { Image } from "expo-image";

import TESTS_DATA from "@/constants/tests-data";
import Colors from "@/constants/Colors";

import { styles } from "@/styles/App.styles";
import BackButton from "@/components/CustomBackButton";
import { useOrientation } from "@/hooks/useOrientation";

import { PixelChecklist } from "@/components/tests/PixelChecklist";
import { PixelOrderingTask } from "@/components/tests/PixelOrderingTask";

import { useBadges } from "@/components/badges/BadgeSystem";

// Constants and assets
// Blurhash placeholder for progressive image loading
import { BLUR_HASH_DATA } from "@/constants/blur-hash-data";
import aboutImage from "@/assets/app-images/about-image.webp";

export default function TestDetail() {
  const orientation = useOrientation();
  const { itemId } = useLocalSearchParams<{ itemId: string }>();

  // Load the test data
  const test = useMemo(() => {
    for (const section of TESTS_DATA) {
      const found = section.data.find(
        (x: any) => String(x.id) === String(itemId)
      );
      if (found) return found;
    }
    return null;
  }, [itemId]);

  // checklist state. We need this in order to be able to assign badges
  const [checklist, setChecklist] = useState(test?.checklistItems ?? []);

  // keep checklist in sync when test changes
  useEffect(() => {
    setChecklist(test?.checklistItems ?? []);
  }, [test?.id]);

  // Toggle functionality
  const toggleItem = (id: string) => {
    setChecklist((prev: any[]) =>
      prev.map((it) => (it.id === id ? { ...it, done: !it.done } : it))
    );
  };

  // For badges
  const { awardBadge, hasBadge } = useBadges();
  const awardTestBadge = useCallback(
    async (description: string) => {
      if (!test) return;

      const badgeId = `task:${test.id}`;
      if (hasBadge(badgeId)) return;

      await awardBadge({
        id: badgeId,
        title: `${test.title}`,
        description,
      });
    },
    [test, hasBadge, awardBadge]
  );

  // Keep track if checklist is done and correct
  const checklistCorrect = useMemo(() => {
    // no items: can't be "correct"
    if (checklist.length === 0) return false;

    return checklist.every((item: any) => {
      // if isCorrect is missing, treat it as "correct"
      const isCorrect = item.isCorrect ?? true;

      // correct items must be checked, incorrect items must not be checked
      return isCorrect ? item.done === true : item.done === false;
    });
  }, [checklist]);

  useEffect(() => {
    if (!test) return;
    if (test.type !== "Checklist") return;
    if (!checklistCorrect) return;

    awardTestBadge("Checklist finished");
  }, [checklistCorrect, test, awardTestBadge]);

  // In case the test does not exist
  if (!test) {
    return (
      <View style={[styles.container]}>
        <Text style={{ color: Colors.subtitlePrimary }}>Test not found.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Image
        source={aboutImage}
        contentFit="cover"
        placeholder={{
          blurhash:
            BLUR_HASH_DATA[3]?.hash || "L39[3oI8tuN84?tMIK?Z*F.O4V4Y",
        }}
        accessibilityLabel="Cozy background image depicting a fire environment"
        accessible
        accessibilityRole="image"
        style={[
          styles.imageContainer,
          orientation === "PORTRAIT"
            ? styles.portraitImage
            : styles.landscapeImage,
        ]}
      />
      <View contentContainerStyle={{ flex: 1, padding: 12 }}>
        <BackButton
          orientation={orientation}
          size={orientation === "PORTRAIT" ? 50 : 30}
          customStyle={{ marginTop: 100 }}
        />

        <View style={[styles.pixelTestPanel]}>
          <Text style={[styles.pixelPrepareTitle]}>{test.title}</Text>
          <Text style={[styles.pixelPrepareSubtleText]}>{test.prompt}</Text>
        </View>

        <View>
          {test.type === "Checklist" && (
            <PixelChecklist
              title="Checklist"
              items={checklist}
              onToggle={toggleItem}
            />
          )}

          {test.type === "Drag" && (
            <PixelOrderingTask
              title="Ordering"
              prompt={test.prompt}
              initial={test.dragItems}
              correctOrderKeys={test.correctOrderKeys}
              onComplete={(ok) => {
                console.log("Ordering correct?", ok);
                if (!ok) return;
                awardTestBadge("Ordering task finished");
              }}
            />
          )}
        </View>
      </View>
    </View>
  );
}
