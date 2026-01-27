import React from "react";
import { Text, TextStyle, StyleProp } from "react-native";

type Props = {
  text: string;
  highlights: string[]; // words to highlight
  style?: StyleProp<TextStyle>;
  highlightStyle?: StyleProp<TextStyle>;
};

/**
 * HighlightedText
 *
 * Usage:
 * <HighlightedText
 *   text={item.body}
 *   highlights={["wind", "slope", "fuel"]}
 *   style={styles.pixelPrepareTaskSubtleText}
 *   highlightStyle={{ color: Colors.yellow, fontWeight: "700" }}
 * />
 */
export default function HighlightedText({
  text,
  highlights,
  style,
  highlightStyle,
}: Props) {
  if (!text) return null;

  // escape special regex chars in keywords
  const escaped = highlights
    .filter(Boolean)
    .map((h) => h.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));

  if (escaped.length === 0) {
    return <Text style={style}>{text}</Text>;
  }

  // match any of the highlighted terms (case-insensitive)
  const regex = new RegExp(`(${escaped.join("|")})`, "gi");

  // split into parts, preserving matches
  const parts = text.split(regex);

  return (
    <Text style={style}>
      {parts.map((part, idx) => {
        const isHighlighted = highlights.some(
          (h) => h.toLowerCase() === part.toLowerCase()
        );

        return (
          <Text key={idx} style={isHighlighted ? highlightStyle : undefined}>
            {part}
          </Text>
        );
      })}
    </Text>
  );
}
