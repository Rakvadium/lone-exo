import "react-native-get-random-values";
import { useEffect, useCallback } from "react";
import { Platform, View } from "react-native";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { ConvexProvider } from "convex/react";
import { ConvexAuthProvider } from "@convex-dev/auth/react";
import { convex } from "@/lib/convex";
import { tokenStorage } from "@/lib/tokenStorage";
import {
  useFonts,
  Cormorant_400Regular,
  Cormorant_500Medium,
  Cormorant_600SemiBold,
  Cormorant_700Bold,
} from "@expo-google-fonts/cormorant";
import {
  DMSans_400Regular,
  DMSans_500Medium,
  DMSans_700Bold_Italic,
  DMSans_700Bold,
} from "@expo-google-fonts/dm-sans";
import * as SplashScreen from "expo-splash-screen";
import * as SecureStore from "expo-secure-store";


SplashScreen.preventAutoHideAsync().catch(() => { });

const secureStorage = {
  getItem: SecureStore.getItemAsync,
  setItem: SecureStore.setItemAsync,
  removeItem: SecureStore.deleteItemAsync,
};

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    "Cormorant-Regular": Cormorant_400Regular,
    "Cormorant-Medium": Cormorant_500Medium,
    "Cormorant-SemiBold": Cormorant_600SemiBold,
    "Cormorant-Bold": Cormorant_700Bold,
    "DMSans-Regular": DMSans_400Regular,
    "DMSans-Medium": DMSans_500Medium,
    "DMSans-SemiBold": DMSans_700Bold_Italic,
    "DMSans-Bold": DMSans_700Bold,
  });


  const onLayoutRootView = useCallback(async () => {
    if (fontsLoaded || fontError) {
      await SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  useEffect(() => {
    onLayoutRootView();
  }, [onLayoutRootView]);

  if (!fontsLoaded && !fontError) {
    return null;
  }

  return (

    <ConvexAuthProvider
      client={convex}
      storage={
        Platform.OS === "android" || Platform.OS === "ios"
          ? secureStorage
          : undefined
      }
    >
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: "#1a1a1a" },
        }}
      >
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        <Stack.Screen
          name="product/[slug]"
          options={{
            headerShown: true,
            headerStyle: { backgroundColor: "#1a1a1a" },
            headerTintColor: "#f5f0eb",
            headerTitle: "",
          }}
        />
        <Stack.Screen
          name="checkout"
          options={{
            headerShown: true,
            headerStyle: { backgroundColor: "#1a1a1a" },
            headerTintColor: "#f5f0eb",
            headerTitle: "Checkout",
          }}
        />
      </Stack>
    </ConvexAuthProvider>
  );
}
