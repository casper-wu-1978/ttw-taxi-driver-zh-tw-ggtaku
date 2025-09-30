
import "react-native-reanimated";
import { useEffect } from "react";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { SystemBars } from "react-native-edge-to-edge";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { useColorScheme } from "react-native";
import {
  DarkTheme,
  DefaultTheme,
  Theme,
  ThemeProvider,
} from "@react-navigation/native";
import { StatusBar } from "expo-status-bar";

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export const unstable_settings = {
  initialRouteName: "(index)",
};

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
  });

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  const CustomLightTheme: Theme = {
    ...DefaultTheme,
    dark: false,
    colors: {
      primary: "#2196F3", // Blue for taxi theme
      background: "#F5F5F5", // Light gray background
      card: "#FFFFFF", // White cards/surfaces
      text: "#333333", // Dark text for light mode
      border: "#E0E0E0", // Light gray for separators/borders
      notification: "#FF9500", // Orange for notifications
    },
  };

  const CustomDarkTheme: Theme = {
    ...DarkTheme,
    colors: {
      primary: "#64B5F6", // Light Blue for dark mode
      background: "#121212", // Dark background
      card: "#1E1E1E", // Dark card/surface color
      text: "#FFFFFF", // White text for dark mode
      border: "#333333", // Dark gray for separators/borders
      notification: "#FF9500", // Orange for notifications
    },
  };

  return (
    <>
      <StatusBar style="auto" animated />
      <ThemeProvider
        value={colorScheme === "dark" ? CustomDarkTheme : CustomLightTheme}
      >
        <GestureHandlerRootView style={{ flex: 1 }}>
          <Stack
            screenOptions={{
              headerShown: false,
            }}
          >
            <Stack.Screen name="(index)" />
          </Stack>
          <SystemBars style="auto" />
        </GestureHandlerRootView>
      </ThemeProvider>
    </>
  );
}
