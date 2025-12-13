import "@/global.css";

import React from "react";
import { Stack } from "expo-router";

const TestLayout = () => {
  return (
    <Stack>
      {/* Main screen */}
      <Stack.Screen
        name="index"
        options={{
          headerShown: false,
          accessibilityLabel: "Main screen for displaying a list of tests",
        }}
      />
    </Stack>
  );
};

export default TestLayout;
