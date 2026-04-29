import * as SecureStore from "expo-secure-store";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { TokenStorage } from "@convex-dev/auth/react";
import { Platform } from "react-native";

export const tokenStorage: TokenStorage = {
  async getItem(key: string): Promise<string | null> {
    if (Platform.OS === "web") {
      return await AsyncStorage.getItem(key);
    } else {
      const value = await SecureStore.getItemAsync(key);
      return value ?? null;
    }
  },
  async setItem(key: string, value: string): Promise<void> {
    if (Platform.OS === "web") {
      await AsyncStorage.setItem(key, value);
    } else {
      await SecureStore.setItemAsync(key, value, {
        keychainAccessible: SecureStore.WHEN_UNLOCKED,
      });
    }
  },
  async removeItem(key: string): Promise<void> {
    if (Platform.OS === "web") {
      await AsyncStorage.removeItem(key);
    } else {
      await SecureStore.deleteItemAsync(key);
    }
  },
};
