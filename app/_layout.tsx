import { Stack, useRouter, useSegments } from "expo-router";
import { ClerkProvider } from "@clerk/clerk-expo";
import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { useEffect } from "react";
import * as WebBrowser from "expo-web-browser";
import { AppAuthProvider, useAppAuth } from "@/hooks/use-app-auth";

// Handle OAuth redirects natively
WebBrowser.maybeCompleteAuthSession();

const CLERK_PUBLISHABLE_KEY = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY;

const tokenCache = {
  async getToken(key: string) {
    try {
      const item = await AsyncStorage.getItem(key);
      return item;
    } catch (error) {
      return null;
    }
  },
  async saveToken(key: string, value: string) {
    try {
      await AsyncStorage.setItem(key, value);
    } catch (err) {
      return;
    }
  },
};

function InitialLayout() {
  const { isLoaded, isSignedIn } = useAppAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (!isLoaded) return;

    // Check if the user is currently navigating within the auth routes (login/register)
    const inAuthGroup = segments[0] === "auth";

    if (isSignedIn && inAuthGroup) {
      // Redirect to home if already authenticated and trying to view sign-in/up screens
      router.replace("/(tabs)/home");
    }
  }, [isSignedIn, isLoaded, segments]);

  return <Stack screenOptions={{ headerShown: false }} />;
}

export default function RootLayout() {
  const innerStack = <InitialLayout />;

  if (!CLERK_PUBLISHABLE_KEY) {
    // If the Clerk Publishable Key is not configured in the environment,
    // render the Stack router directly wrapped in our AppAuthProvider.
    return (
      <AppAuthProvider>
        {innerStack}
      </AppAuthProvider>
    );
  }

  return (
    <ClerkProvider publishableKey={CLERK_PUBLISHABLE_KEY} tokenCache={tokenCache}>
      <AppAuthProvider>
        {innerStack}
      </AppAuthProvider>
    </ClerkProvider>
  );
}