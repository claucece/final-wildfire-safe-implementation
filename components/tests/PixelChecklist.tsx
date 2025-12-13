import React, { useMemo } from "react";
import { View, Text, Pressable } from "react-native";
import LottieView from "lottie-react-native";
import Colors from "@/constants/Colors";
import { styles } from "@/styles/App.styles";

type Item = { id: string; label: string; done: boolean };
type Props = {
  title: string;
  items: Item[];
  onToggle: (id: string) => void;
  reduceMotion?: boolean;
};

export function PixelChecklist({ title, items, onToggle, reduceMotion }: Props) {
  const doneCount = useMemo(() => items.filter(i => i.done).length, [items]);
  const pct = Math.round((doneCount / Math.max(1, items.length)) * 100);
  const allDone = doneCount === items.length && items.length > 0;

  return (
    <View style={[styles.pixelCheckListPanel]}>
      <Text style={[styles.pixelCheckListTitle]}>
        {title}
      </Text>

      <Text style={[styles.pixelSubtleText, { marginTop: 6 }]}>
        {doneCount}/{items.length} • {pct}%
      </Text>

      {/* Progress bar */}
      <View style={styles.progressBarOuter}>
        <View style={[styles.progressBarFill, { width: `${pct}%`, backgroundColor: Colors.indexPrimary }]} />
      </View>

      {/* Items */}
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
            <Text style={[styles.pixelChecklistBox]}>{it.done ? "■" : "□"}</Text>
            <Text style={[styles.pixelChecklistLabel]}>{it.label}</Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}
