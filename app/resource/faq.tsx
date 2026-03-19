import React, { useMemo, useState } from "react";
import { ScrollView, Text, View, Platform, Pressable } from "react-native";

import { StatusBar } from "expo-status-bar";
import { Feather } from "@expo/vector-icons";

import { useSafeAreaInsets } from "react-native-safe-area-context";

import BackButton from "@/components/CustomBackButton";
import CustomGradient from "@/components/CustomGradient";
import { useOrientation } from "@/hooks/useOrientation";

import { styles } from "@/styles/App.styles";
import Colors from "@/constants/Colors";

// The data for the faq
import { FAQ_DATA } from "@/constants/faq-data";

// The faw
const FAQ = () => {
  const insets = useSafeAreaInsets();
  const orientation = useOrientation();
  // Determine if portrait
  const isPortrait = orientation === "PORTRAIT";

  const [openId, setOpenId] = useState<string | null>(null);

  // Get the faq items
  const flatItems = useMemo(() => {
    return FAQ_DATA.flatMap((s) => s.items);
  }, []);

  return (
    <View style={styles.container}>
      <CustomGradient
        colors={[Colors.pink, Colors.gradientTest, Colors.gradientTestDark]}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollViewContainer}
        >
          {/* Header */}
          <BackButton
            orientation={orientation}
            size={isPortrait ? 40 : 30}
            customStyle={isPortrait ? styles.buttonAltNorm : styles.buttonAltLand}
            accessibilityLabel="Go back"
          />
          <View style={styles.faqHeaderPanel}>
            <View style={styles.textContainerTest}>
              <Text
                style={styles.textTestStyle}
                accessible
                accessibilityLabel="FAQ main text"
              >
                FAQ
              </Text>
              <Text
                style={styles.textTestSmallStyle}
                accessible
                accessibilityLabel="FAQ subtitle text"
              >
                Quick answers to common questions for you!
              </Text>
            </View>
          </View>

          {/* Sections */}
          <View style={{ paddingTop: insets.top - 30 }}>
            {FAQ_DATA.map((section) => (
              <View key={section.title}>
                <Text
                  style={[styles.testsTitle, styles.faqItemTitle]}
                  accessibilityRole="header"
                  accessibilityLabel={`FAQ section: ${section.title}`}
                >
                  {section.title}
                </Text>

                <View>
                  {section.items.map((item) => {
                    const isOpen = openId === item.id;

                    return (
                      <Pressable
                        key={item.id}
                        onPress={() => setOpenId(isOpen ? null : item.id)}
                        accessibilityRole="button"
                        accessibilityLabel={`FAQ: ${item.question}`}
                        accessibilityHint={
                          isOpen ? "Collapse answer" : "Expand answer"
                        }
                        style={styles.resource}
                      >
                        {/* Row: question and chevron */}
                        <View style={styles.faqItemRow}>
                          <View style={styles.faqItemBox}>
                            {!!item.tag && (
                              <Text
                                style={[
                                  styles.pixelPrepareSubtleText,
                                  styles.faqItemTag,
                                ]}
                              >
                                {item.tag}
                              </Text>
                            )}
                            <Text
                              style={[
                                styles.pixelPrepareTitle,
                                styles.faqItemInTitle,
                              ]}
                            >
                              {item.question}
                            </Text>
                          </View>

                          <Feather
                            name={isOpen ? "chevron-up" : "chevron-down"}
                            size={20}
                            color={Colors.subtitlePrimary}
                          />
                        </View>

                        {/* Answer */}
                        {isOpen && (
                          <Text
                            style={[
                              styles.pixelPrepareSubtleText,
                              styles.faqItemAnswer,
                            ]}
                          >
                            {item.answer}
                          </Text>
                        )}
                      </Pressable>
                    );
                  })}
                </View>
              </View>
            ))}
          </View>
        </ScrollView>
      </CustomGradient>

      <StatusBar style={Platform.OS === "ios" ? "light" : "auto"} />
    </View>
  );
};

export default FAQ
