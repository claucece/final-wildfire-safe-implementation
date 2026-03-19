import React, { useState, useMemo, useCallback } from "react";
import { View, Text, Pressable } from "react-native";

import { Feather } from "@expo/vector-icons";

import DraggableFlatList, {
  RenderItemParams,
} from "react-native-draggable-flatlist";

import { useOrientation } from "@/hooks/useOrientation";

// Styles
import Colors from "@/constants/Colors";
import { styles } from "@/styles/App.styles";

// Each row
type Row = { key: string; label: string };

// The ordering task
export function PixelOrderingTask({
  title,
  prompt,
  initial,
  correctOrderKeys,
  onComplete,
}: {
  title: string;
  prompt: string;
  initial: Row[];
  correctOrderKeys: string[];
  onComplete?: (isCorrect: boolean) => void;
}) {
  const orientation = useOrientation();
  // Determine if portrait
  const isPortrait = orientation === "PORTRAIT";

  // The data
  const [data, setData] = useState<Row[]>(initial);

  // Check if correct
  const isCorrect = useMemo(() => {
    const keys = data.map((d) => d.key);
    return (
      keys.length === correctOrderKeys.length &&
      keys.every((k, i) => k === correctOrderKeys[i])
    );
  }, [data, correctOrderKeys]);

  const OrderRow = React.memo(
    ({ item, drag, isActive }: RenderItemParams<Row>) => (
      <Pressable
        onLongPress={drag}
        delayLongPress={100}
        disabled={isActive}
        style={[styles.pixelOrderRow, isActive && { opacity: 0.85 }]}
        accessibilityHint="Press and hold, then drag to reorder"
        accessibilityLabel={`${item.label}, draggable row`}
      >
        <Feather
          name="menu"
          style={styles.menuHamburger}
          size={16}
          color={Colors.pink}
        />
        <Text style={styles.pixelOrderLabel}>{item.label}</Text>
      </Pressable>
    ),
  );

  const renderItem = useCallback(
    (params: RenderItemParams<Row>) => <OrderRow {...params} />,
    [],
  );

  return (
    <View
      style={[
        isPortrait
          ? styles.pixelCheckListPanel
          : styles.pixelCheckListPanelLand,
      ]}
    >
      <Text style={styles.pixelCheckListTitle}>{title}</Text>

      {/* The dragable elements */}
      <View style={styles.checkList}>
        <DraggableFlatList
          data={data}
          keyExtractor={(item) => item.key}
          onDragEnd={({ data: reordered }) => setData(reordered)}
          renderItem={renderItem}
          activationDistance={12}
          containerStyle={{ flexGrow: 0 }}
        />
      </View>

      <Pressable
        onPress={() => onComplete?.(isCorrect)}
        style={styles.pixelOrderCheckButton}
        accessibilityRole="button"
        accessibilityLabel={
          isCorrect ? "Order is correct" : "Check current order"
        }
      >
        <Feather
          name={isCorrect ? "check-circle" : "x-circle"}
          size={18}
          color={styles.pixelOrderCheckText?.color ?? Colors.subtitlePrimary}
          style={{ marginRight: 8 }}
        />
        <Text style={styles.pixelOrderCheckText}>
          {isCorrect ? "Looks good" : "Check order"}
        </Text>
      </Pressable>

      {/* Check if order is correct */}
      {!isCorrect && (
        <Text style={styles.pixelInfoText}>
          Tip: think safety first, evacuation and alerts before supplies or
          documents.
        </Text>
      )}
    </View>
  );
}
