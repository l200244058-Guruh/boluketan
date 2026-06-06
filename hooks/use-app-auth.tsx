import React, { createContext, useContext, useState, useEffect } from "react";
import { useAuth as useClerkAuth } from "@clerk/clerk-expo";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface AuthContextType {
  isSignedIn: boolean;
  isLoaded: boolean;
  signInMock: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const hasClerkKey = !!process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY;

export function AppAuthProvider({ children }: { children: React.ReactNode }) {
  const [mockSignedIn, setMockSignedIn] = useState(false);
  const [mockLoaded, setMockLoaded] = useState(false);

  // Clerk auth hooks (only if key exists)
  let clerkAuth: any = null;
  if (hasClerkKey) {
    try {
      clerkAuth = useClerkAuth();
    } catch (e) {
      console.warn("Clerk useAuth failed:", e);
    }
  }

  useEffect(() => {
    if (!hasClerkKey) {
      // Check mock sign in status
      AsyncStorage.getItem("mock_signed_in")
        .then((val) => {
          setMockSignedIn(val === "true");
          setMockLoaded(true);
        })
        .catch(() => {
          setMockLoaded(true);
        });
    }
  }, []);

  const signInMock = async () => {
    await AsyncStorage.setItem("mock_signed_in", "true");
    setMockSignedIn(true);
  };

  const signOut = async () => {
    if (hasClerkKey && clerkAuth?.signOut) {
      await clerkAuth.signOut();
    } else {
      await AsyncStorage.removeItem("mock_signed_in");
      setMockSignedIn(false);
    }
  };

  const isSignedIn = hasClerkKey ? !!clerkAuth?.isSignedIn : mockSignedIn;
  const isLoaded = hasClerkKey ? !!clerkAuth?.isLoaded : mockLoaded;

  return (
    <AuthContext.Provider value={{ isSignedIn, isLoaded, signInMock, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAppAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    // Fallback if not wrapped in provider (e.g. during transitions)
    return {
      isSignedIn: false,
      isLoaded: true,
      signInMock: async () => {},
      signOut: async () => {},
    };
  }
  return context;
}
