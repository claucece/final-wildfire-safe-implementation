import React, { useContext } from "react";
import { Text, View } from "react-native";
import { TimerContext } from "@/context/Timer";
import { router } from "expo-router";

// Custom hooks
import { useOrientation } from "@/hooks/useOrientation";

import CustomGradient from "@/components/CustomGradient";
import CustomAnimatedButton from "@/components/CustomAnimatedButton";
import BackButton from "@/components/CustomBackButton";

// Custom styles
import Colors from "@/constants/Colors";
import { styles } from "@/styles/App.styles";

const SECONDS = 60;

const BUTTON_TIMES = [
  { label: "5 minutes", duration: 5 * SECONDS },
  { label: "10 minutes", duration: 10 * SECONDS },
  { label: "15 minutes", duration: 15 * SECONDS },
  { label: "30 minutes", duration: 30 * SECONDS },
];

const AdjustMeditation = () => {
  const isPresented = router.canGoBack();
  const orientation = useOrientation();
  const { setDuration } = useContext(TimerContext);

  // Handler to set duration and navigate back
  const handlePress = (duration: number) => {
    setDuration(duration);
    setTimeout(() => {
      router.back();
    }, 50); // Small delay to allow state propagation
  };

  return (
    <View style={styles.container}>
      <CustomGradient colors={[Colors.gradientMain, Colors.gradientMain, Colors.gradientMainDark]}>
        {/* Back Button */}
        {isPresented && <BackButton orientation={orientation} size={orientation === 'PORTRAIT' ? 40 : 20} customStyle={styles.meditationPressableBack} />}

        {/* Main Content */}
        <View style={styles.changeDurContainer}>
          <Text
            style={[
              orientation === "PORTRAIT" ? styles.headerText : styles.headerTextLandscape
            ]}
            className="font-rpixel"
          > Change your duration!</Text>
          {/* Buttons */}
          <View
            style={[
              orientation === "PORTRAIT" ? styles.buttonGroup : styles.buttonGroupLandscape
            ]}
          >
            {BUTTON_TIMES.map(({ label, duration }) => (
              <CustomAnimatedButton
                key={label}
                title={label}
                onPress={() => handlePress(duration)}
                containerStyles={
                  [
                    orientation === "PORTRAIT" ? styles.button : styles.buttonLandscape
                  ]
                }
              />
            ))}
          </View>
        </View>
      </CustomGradient>
    </View>
  );
};

export default AdjustMeditation;
