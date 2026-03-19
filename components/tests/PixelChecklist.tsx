import React, { useMemo } from "react";
import { View, Text, Pressable } from "react-native";

import Colors from "@/constants/Colors";

import LottieView from "lottie-react-native";
import { Feather } from "@expo/vector-icons";

import { styles } from "@/styles/App.styles";

import { useOrientation } from "@/hooks/useOrientation";

// The individual checklist item
type Item = { id: string; label: string; done: boolean };
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

  const doneCount = useMemo(() => items.filter((i) => i.done).length, [items]);
  const pct = Math.round((doneCount / Math.max(1, items.length)) * 100);
  const allDone = doneCount === items.length && items.length > 0;

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
          {doneCount}/{items.length}
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
