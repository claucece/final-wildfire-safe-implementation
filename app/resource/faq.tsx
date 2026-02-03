import React, { useMemo, useState } from "react";
import { ScrollView, Text, View, Platform, Pressable } from "react-native";
import { StatusBar } from "expo-status-bar";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";

import BackButton from "@/components/CustomBackButton";
import CustomGradient from "@/components/CustomGradient";
import { useOrientation } from "@/hooks/useOrientation";

import { styles } from "@/styles/App.styles";
import Colors from "@/constants/Colors";

type FAQItem = {
  id: string;
  question: string;
  answer: string;
  tag?: string; // optional label
};

const FAQ_DATA: { title: string; items: FAQItem[] }[] = [
  {
    title: "Alerts & Evacuation",
    items: [
      {
        id: "evac-when",
        question: "When should I evacuate?",
        answer:
          "Evacuate immediately if authorities issue an evacuation order. If you feel unsafe (fast smoke, embers, strong wind), leave early—don’t wait. Keep your go-bag ready and know at least two routes out.",
        tag: "Evacuation",
      },
      {
        id: "alerts-where",
        question: "Where do I get official alerts?",
        answer:
          "Use your local emergency authority (municipality/civil protection), local fire service, and official emergency alert systems. If you’re traveling, check the region’s official alerts and road closures.",
        tag: "Alerts",
      },
      {
        id: "roads",
        question: "What if my planned route is blocked?",
        answer:
          "Don’t drive through smoke or flames. Use your backup route, follow official detours, and keep your car headlights on. If visibility is very low, pull over in a safe place and wait for instructions.",
        tag: "Evacuation",
      },
    ],
  },
  {
    title: "Go-Bag & Home Preparation",
    items: [
      {
        id: "gobag",
        question: "What should be in a wildfire go-bag?",
        answer:
          "Water, masks (N95/FFP2), key documents/ID, phone charger/power bank, medications, basic clothing, flashlight, and a small first-aid kit. Add pet supplies if needed.",
        tag: "Go-Bag",
      },
      {
        id: "home",
        question: "What quick steps help protect my home?",
        answer:
          "Clear leaves from gutters and the roof, move flammable items away from windows, close windows/doors, and remove outdoor furniture or doormats if time allows. Follow local guidance—don’t stay behind to defend property.",
        tag: "Home",
      },
    ],
  },
  {
    title: "Smoke & Air Quality",
    items: [
      {
        id: "mask",
        question: "Which masks work for wildfire smoke?",
        answer:
          "Use a well-fitted N95/FFP2 (or better). Cloth masks and surgical masks don’t filter fine smoke particles well. Fit matters: gaps reduce protection.",
        tag: "Smoke",
      },
      {
        id: "indoors",
        question: "How can I improve air indoors?",
        answer:
          "Keep windows/doors closed, run a HEPA air purifier if you have one, and avoid activities that add indoor pollution (candles, incense, frying). If you must go out, limit time and wear a proper mask.",
        tag: "Air Quality",
      },
      {
        id: "aqi",
        question: "What is AQI and what should I do when it’s high?",
        answer:
          "AQI is Air Quality Index. As AQI rises, reduce outdoor activity, stay indoors with clean air, and use filtration. If you’re sensitive (asthma, heart/lung conditions), take extra precautions and follow medical advice.",
        tag: "Air Quality",
      },
    ],
  },
{
    title: "App & Privacy",
    items: [
      {
        id: "privacy-policy",
        question: "Do you store my data?",
        answer:
          "No. The app does not retain any personal data. We don’t store your searches, alerts, or usage history. Your information stays on your device and is not saved on our servers.",
        tag: "Privacy",
      },
      {
        id: "location-use",
        question: "How does the app use my location?",
        answer:
          "Location is only used to show relevant information for your area (nearby fires). You can choose to share with us your location.",
        tag: "Privacy",
      },
      {
        id: "change-location-preferences",
        question: "How do I change location preferences in the Your Space tab?",
        answer:
          "Open the Space tab. You can toggle on/off location sharing. Changes apply immediately.",
        tag: "Space",
      },
    ],
  },
];

const FAQ = () => {
  const insets = useSafeAreaInsets();
  const orientation = useOrientation();
  const [openId, setOpenId] = useState<string | null>(null);

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
          size={orientation === "PORTRAIT" ? 50 : 30}
          customStyle={{ left: 290, marginTop: 20 }}
        />
          <View style={styles.homeHeaderPanel}>
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
                Quick answers to common Wildfire safety questions.
              </Text>
            </View>
          </View>

          {/* Sections */}
          <View style={{ paddingTop: insets.top - 30 }}>
            {FAQ_DATA.map((section) => (
              <View key={section.title}>
                <Text
                  style={[
                    styles.testsTitle,
                    {
                      fontSize: 18,
                      backgroundColor: Colors.pinkMuted,
                      marginTop: 8,
                    },
                  ]}
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
                        <View
                          style={{
                            flexDirection: "row",
                            alignItems: "center",
                            justifyContent: "space-between",
                          }}
                        >
                          <View style={{ flex: 1, paddingRight: 10 }}>
                            {!!item.tag && (
                              <Text
                                style={[
                                  styles.pixelPrepareSubtleText,
                                  { opacity: 0.9, marginBottom: 2 },
                                ]}
                              >
                                {item.tag}
                              </Text>
                            )}
                            <Text
                              style={[
                                styles.pixelPrepareTitle,
                                { fontSize: 18 },
                              ]}
                            >
                              {item.question}
                            </Text>
                          </View>

                          <Feather
                            name={isOpen ? "chevron-up" : "chevron-down"}
                            size={18}
                            color={Colors.subtitlePrimary}
                          />
                        </View>

                        {/* Answer */}
                        {isOpen && (
                          <Text
                            style={[
                              styles.pixelPrepareSubtleText,
                              { marginTop: 10, lineHeight: 20 },
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

export default FAQ;
