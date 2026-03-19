import { useEffect, useState } from "react";
import * as Brightness from "expo-brightness";

export const useBrightness = () => {
  const [screenBrightness, setScreenBrightness] = useState<number>(1); // Default to maximum brightness

  useEffect(() => {
    const getBrightness = async () => {
      try {
        // Request permission for accessing brightness settings
        const { status } = await Brightness.requestPermissionsAsync();
        if (status === "granted") {
          const brightness = await Brightness.getBrightnessAsync();
          setScreenBrightness(brightness); // Set the retrieved brightness value
        } else {
          console.warn("Brightness permission not granted");
        }
      } catch (error) {
        console.error("Error trying to get screen brightness:", error);
      }
    };

    getBrightness();
  }, []);

  return screenBrightness;
};
