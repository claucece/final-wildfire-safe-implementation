import * as ScreenOrientation from "expo-screen-orientation";
import { useState, useEffect } from "react";

export const useOrientation = () => {
  const [orientation, setOrientation] = useState<string>("PORTRAIT");

  useEffect(() => {
    // Unlock screen orientation s
    const unlockScreenOrientation = async () => {
      try {
        await ScreenOrientation.unlockAsync();
      } catch (error) {
        console.error("Failed to unlock screen orientation:", error);
      }
    };
    unlockScreenOrientation();

    // Get initial orientation
    const checkOrientation = async () => {
      try {
        const currentOrientation =
          await ScreenOrientation.getOrientationAsync();
        // Determine if it's portrait or landscape
        if (
          currentOrientation === ScreenOrientation.Orientation.PORTRAIT_UP ||
          currentOrientation === ScreenOrientation.Orientation.PORTRAIT_DOWN
        ) {
          setOrientation("PORTRAIT");
        } else {
          setOrientation("LANDSCAPE");
        }
      } catch (error) {
        console.error("Error detecting initial orientation:", error);
      }
    };

    // Event listener to detect orientation changes
    const orientationListener = ScreenOrientation.addOrientationChangeListener(
      (event) => {
        try {
          const { orientation } = event;
          // Update orientation based on change
          if (
            orientation === ScreenOrientation.Orientation.PORTRAIT_UP ||
            orientation === ScreenOrientation.Orientation.PORTRAIT_DOWN
          ) {
            setOrientation("PORTRAIT");
          } else {
            setOrientation("LANDSCAPE");
          }
        } catch (error) {
          console.error("Error processing orientation change:", error);
        }
      },
    );

    // Initial orientation check
    checkOrientation();

    // Cleanup listener on unmount
    return () => {
      try {
        ScreenOrientation.removeOrientationChangeListener(orientationListener);
      } catch (error) {
        console.error("Failed to remove orientation listener:", error);
      }
    };
  }, []);

  return orientation;
};
