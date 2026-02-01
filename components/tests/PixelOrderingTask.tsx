import React, { useState, useMemo } from "react";
import { View, Text, Pressable } from "react-native";

import { Feather } from "@expo/vector-icons";
import DraggableFlatList, { RenderItemParams } from "react-native-draggable-flatlist";

import Colors from "@/constants/Colors";
import { styles } from "@/styles/App.styles";

type Row = { key: string; label: string };

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
  const [data, setData] = useState<Row[]>(initial);

  const isCorrect = useMemo(() => {
    const keys = data.map(d => d.key);
    return keys.length === correctOrderKeys.length && keys.every((k, i) => k === correctOrderKeys[i]);
  }, [data, correctOrderKeys]);

  const renderItem = ({ item, drag, isActive }: RenderItemParams<Row>) => (
    <Pressable
      onLongPress={drag}
      delayLongPress={100}
      disabled={isActive}
      style={[
        styles.pixelOrderRow,
        isActive && { opacity: 0.85 },
      ]}
      accessibilityHint="Press and hold, then drag to reorder"
    >
      <Feather
        name="menu"
	style={styles.menuHamburger}
        size={16}
        color={Colors.pink}
      />
      <Text style={styles.pixelOrderLabel}>{item.label}</Text>
    </Pressable>
  );

  return (
    <View style={[styles.pixelCheckListPanel]}>
      <Text style={[styles.pixelCheckListTitle]} >
        {title}
      </Text>

      <View style={styles.checkList}>
        <DraggableFlatList
          data={data}
          keyExtractor={(item) => item.key}
          onDragEnd={({ data }) => setData(data)}
          renderItem={renderItem}
          activationDistance={12}
          containerStyle={{ flexGrow: 0 }}
        />
      </View>

      <Pressable
        onPress={() => onComplete?.(isCorrect)}
        style={[styles.pixelOrderCheckButton]}
        accessibilityRole="button"
      >
        <Feather
          name={isCorrect ? "check-circle" : "x-circle"}
          size={18}
          color={styles.pixelOrderCheckText?.color ?? "#ffffff"}
          style={{ marginRight: 8 }}
        />
        <Text style={[styles.pixelOrderCheckText]}>
	  {isCorrect ? "Looks good" : "Check order"}
        </Text>
      </Pressable>

      {!isCorrect && (
        <Text style={styles.pixelInfoText}>
          Tip: prioritize safety and information before "nice-to-have" actions.
        </Text>
      )}
    </View>
  );
}
