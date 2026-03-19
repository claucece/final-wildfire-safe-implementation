import React, { useMemo } from "react";
import { View, Text, Pressable } from "react-native";

import Colors from "@/constants/Colors";

import LottieView from "lottie-react-native";
import { Feather } from "@expo/vector-icons";

import { styles } from "@/styles/App.styles";

import { useOrientation } from "@/hooks/useOrientation";

// The individual checklist item
type Item = { id: string; label: string; done: boolean, isCorrect?: boolean };
type Props = {
  title: string;
  items: Item[];
  onToggle: (id: string) => void;
  reduceMotion?: boolean;
};

// The re-usable checklist component
export function PixelChecklist({
  title,
  items,
  onToggle,
  reduceMotion,
}: Props) {
  const orientation = useOrientation();
  // Determine if portrait
  const isPortrait = orientation === "PORTRAIT";

  // We count only the correct items
  const correctItems = useMemo(() => items.filter((i) => (i.isCorrect ?? true)), [items]);
  const doneCorrect = useMemo(() => correctItems.filter((i) => i.done).length, [correctItems]);
  const pct = Math.round((doneCorrect / Math.max(1, correctItems.length)) * 100);

  return (
    <View
      style={[
        isPortrait
          ? styles.pixelCheckListPanel
          : styles.pixelCheckListPanelLand,
      ]}
    >
      <Text style={[styles.pixelCheckListTitle]}>{title}</Text>

      <Text style={[styles.pixelSubtleText, { marginTop: 6 }]}>
        <Text testID="progress-meta" style={styles.pixelPrepareSubtleText}>
          {doneCorrect}/{items.length}
          <Feather
            name="chevrons-right"
            size={14}
            color={Colors.orangeLogo}
          />{" "}
          {pct}%
        </Text>
      </Text>

      {/* Progress bar */}
      <View style={styles.progressBarOuter}>
        <View style={[styles.progressBarFill, { width: `${pct}%` }]} />
      </View>

      {/* Checklist items */}
      <View style={styles.checkList}>
        {items.map((it) => (
          <Pressable
            key={it.id}
            onPress={() => onToggle(it.id)}
            accessibilityRole="checkbox"
            accessibilityState={{ checked: it.done }}
            style={[
              styles.pixelChecklistRow,
              it.done && styles.pixelChecklistRowDone,
            ]}
          >
            <Feather
              name={it.done ? "check-square" : "square"}
              size={20}
              color={it.done ? Colors.orangeTitle : Colors.subtitlePrimary}
            />
            <Text style={[styles.pixelChecklistLabel]}>{it.label}</Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}
