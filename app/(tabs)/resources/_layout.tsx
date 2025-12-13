import "@/global.css";

import React from "react";
import { Stack } from "expo-router";

const QuotesLayout = () => {
  return (
    <Stack>
      {/* Main screen */}
      <Stack.Screen
        name="index"
        options={{
          headerShown: false,
          accessibilityLabel: "Main screen for displaying a list of quotes",
        }}
      />
    </Stack>
  );
};

export default QuotesLayout;
