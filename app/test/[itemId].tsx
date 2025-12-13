import React, { useMemo, useState } from "react";
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

// Constants and assets
// Blurhash placeholder for progressive image loading
import { BLUR_HASH_DATA } from "@/constants/blur-hash-data";
import aboutImage from "@/assets/app-images/about-image.webp";

export default function TestDetail() {
  const { itemId } = useLocalSearchParams<{ itemId: string }>();
  const orientation = useOrientation();

  const test = useMemo(() => {
    for (const section of TESTS_DATA) {
      const found = section.data.find((x: any) => String(x.id) === String(itemId));
      if (found) return found;
    }
    return null;
  }, [itemId]);

  // checklist state
  const [checklist, setChecklist] = useState(test?.checklistItems ?? []);

  const toggleItem = (id: string) => {
    setChecklist((prev: any[]) =>
      prev.map((it) => (it.id === id ? { ...it, done: !it.done } : it))
    );
  };

  if (!test) {
    return (
      <View style={[styles.container, { padding: 16 }]}>
        <Text style={{ color: Colors.subtitlePrimary }}>Test not found.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Image
        source={aboutImage}
        contentFit="cover"
        placeholder={{ blurhash: BLUR_HASH_DATA[3]?.hash || "L39[3oI8tuN84?tMIK?Z*F.O4V4Y" }}
        accessibilityLabel="Cozy background image depicting a fire environment"
        accessible
        accessibilityRole="image"
        style={[
          styles.imageContainer,
          orientation === 'PORTRAIT' ? styles.portraitImage : styles.landscapeImage
        ]}
      />
      <View contentContainerStyle={{ flex: 1, padding: 12 }}>
        <BackButton orientation={orientation} size={orientation === "PORTRAIT" ? 50 : 30} />

        <View style={[styles.pixelTestPanel]}>
          <Text style={[styles.pixelPrepareTitle]}>
            {test.title}
          </Text>
          <Text style={[styles.pixelPrepareSubtleText]}>
            {test.prompt}
          </Text>
        </View>

        <View style={{ marginTop: 12 }}>
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
                // TODO: add an animation
                console.log("Ordering correct?", ok);
              }}
            />
          )}
        </View>
      </View>
    </View>
  );
}
