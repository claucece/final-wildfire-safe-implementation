import "@/global.css";
import { useLocalSearchParams } from "expo-router";
import { View, Text, ImageBackground, ScrollView, Animated, SafeAreaView } from "react-native";

import { LinearGradient } from "expo-linear-gradient";

import React, { useEffect, useState } from "react";

import { GalleryData } from "@/constants/models/Category";
import QUOTES_DATA from "@/constants/quotes-data.ts";

// Custom hooks
import { useOrientation } from "@/hooks/useOrientation";
import { useBrightness } from "@/hooks/useBrightness";

// Custom components
import CustomGradient from "@/components/CustomGradient";
import BackButton from "@/components/CustomBackButton";

// Custom styles
import Colors from "@/constants/Colors";
import { styles } from "@/styles/App.styles";

const Quote = () => {
  const orientation = useOrientation();
  const screenBrightness = useBrightness();

  // Set variables
  const { itemId } = useLocalSearchParams(); // Retrieve itemId from URL parameters
  const [quote, setQuote] = useState<GalleryData>(); // To hold the selected quote
  const [sentences, setSentences] = useState<string[]>([]);
  const fadeAnim = useState(new Animated.Value(0))[0]; // Animation for fade-in effect

  // For when the itemId changes
  useEffect(() => {
    for (let idx = 0; idx < QUOTES_DATA.length; idx++) {
      const quoteData = QUOTES_DATA[idx].data;
      const quoteToStart = quoteData.find((a) => a.id === Number(itemId));

      if (quoteToStart) {
        setQuote(quoteToStart);
        const quotesArray = quoteToStart.text.split(".");
        if (quotesArray[quotesArray.length - 1] === "") {
          quotesArray.pop();
        }
        setSentences(quotesArray);
        return;
      }
    }
  }, [itemId]);

  // Fade-in effect when the component mounts
  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1000, // 1 second
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

  // Set gradient depending on brightness
  const gradientColors =
    screenBrightness > 0.5
      ? ["transparent", Colors.transparentMid] // Lighter gradient for bright screens
      : ["transparent", Colors.transparantF]; // Darker gradient for dim screens

  return (
    <View style={styles.container}>
      {/* Background image with blur effect */}
      <ImageBackground
        source={quote?.image}
        resizeMode="cover"
        style={styles.container}
        blurRadius={2}
      >
        <CustomGradient
          colors={gradientColors} // Gradient effect
        >
          <SafeAreaView style={[styles.safeAreaContainer, styles.safeAreaContainerAuth]}>
            {/* Back button */}
            <BackButton
              orientation={orientation}
              size={orientation === 'PORTRAIT' ? 60 : 40}
            />
            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.quoteContainer}
              accessibilityLabel="Quote text content scroll view"
            >
              <View style={styles.quoteTextContainer}>
                {/* Map through each sentence and animate the fade-in effect */}
                {sentences.map((sentence, idx) => (
                  <Animated.View key={idx} style={{ opacity: fadeAnim }}>
                    <LinearGradient
                      colors={[Colors.gradientQuoteLight, Colors.gradientQuoteDark]}
                      style={styles.quoteLinear}
                    >
                      <Text
                        key={idx}
                        numberOfLines={10} // Limit text to 10 lines
                        adjustsFontSizeToFit // Adjust font size to fit text in container
                        style={styles.quoteText}
                        className="font-rpixel"
                        accessibilityLabel={`Quote sentence: ${sentence.trim()}`}
                      >
                        {sentence.trim()}.
                      </Text>
                    </LinearGradient>
                  </Animated.View>
                ))}
              </View>
              {/* Quote credit */}
              <Text
                style={styles.quoteCredit}
                className="font-rpixel"
                accessibilityLabel="Quote credit text"
              >
                Credit: Lord of the Rings by J. R. R. Tolkien.
              </Text>
            </ScrollView>
          </SafeAreaView>
        </CustomGradient>
      </ImageBackground>
    </View>
  );
};

export default Quote;
