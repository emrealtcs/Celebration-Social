import { useEffect, useState } from "react";
import { View, ActivityIndicator } from "react-native";
import { SplashScreen, Stack, router } from "expo-router";
import { useFonts } from "expo-font";
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Slot } from "expo-router";
import "../global.css";
import AuthProvider, { useAuth } from "../services/AuthService";

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function Layout() {

  return (
    <AuthProvider>
      <RootLayout />
    </AuthProvider>
  );

}

const RootLayout = () => {
  const [fontsLoaded, error] = useFonts({
    "Poppins-Black": require("../assets/fonts/Poppins-Black.ttf"),
    "Poppins-Bold": require("../assets/fonts/Poppins-Bold.ttf"),
    "Poppins-ExtraBold": require("../assets/fonts/Poppins-ExtraBold.ttf"),
    "Poppins-ExtraLight": require("../assets/fonts/Poppins-ExtraLight.ttf"),
    "Poppins-Light": require("../assets/fonts/Poppins-Light.ttf"),
    "Poppins-Medium": require("../assets/fonts/Poppins-Medium.ttf"),
    "Poppins-Regular": require("../assets/fonts/Poppins-Regular.ttf"),
    "Poppins-SemiBold": require("../assets/fonts/Poppins-SemiBold.ttf"),
    "Poppins-Thin": require("../assets/fonts/Poppins-Thin.ttf"),
  });

  const { isLoggedIn } = useAuth();
  const [appReady, setAppReady] = useState(false);

  useEffect(() => {
    if (error) throw error;

    if (fontsLoaded && isLoggedIn !== undefined) {
      SplashScreen.hideAsync();
      setAppReady(true);
    }
  }, [fontsLoaded, error, isLoggedIn]);

  useEffect(() => {
    if (appReady) {
      if (isLoggedIn) {
        router.replace("/home");
      } else {
        router.replace("/login");
      }
    }
  }, [appReady, isLoggedIn]);

  // Show a loading screen until everything is ready
  if (!appReady) {
    return (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" />
      </View>
    );
  }
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="(auth)" />
      </Stack>
    </GestureHandlerRootView>
  );
};
