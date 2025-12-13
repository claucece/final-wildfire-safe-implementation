import "@/global.css";

import React from "react";
import { Stack } from "expo-router";

const RecommendationsLayout = () => {
  return (
    <Stack>
      {/* Main screen */}
      <Stack.Screen
        name="index"
        options={{
          headerShown: false,
          accessibilityLabel: "Main screen for displaying a list of recommendations",
        }}
      />
    </Stack>
  );
};

export default RecommendationsLayout;
