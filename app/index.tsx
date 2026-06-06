import React from "react";
import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  StatusBar,
  Dimensions,
  Platform,
  TouchableOpacity,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

export default function WelcomeScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      {/* Soft light-blue background blob decor matching the screenshot */}
      <View style={styles.backgroundBlob} />

      {/* Top Header - Skip Button */}
      <View style={styles.topHeader}>
        <TouchableOpacity
          onPress={() => router.replace("/(tabs)/home")}
          style={styles.skipButton}
          activeOpacity={0.7}
        >
          <Text style={styles.skipText}>Lewati</Text>
          <Ionicons name="arrow-forward" size={16} color="#1B5A7A" style={styles.skipIcon} />
        </TouchableOpacity>
      </View>

      {/* Center Logo and Brand row */}
      <View style={styles.centerContainer}>
        <View style={styles.logoRow}>
          {/* MASA Branding Logo */}
          <View style={styles.logoCircle}>
            <View style={styles.logoDot} />
          </View>
          <Text style={styles.logoText}>MASA</Text>
        </View>
      </View>

      {/* Bottom Actions Card Container */}
      <View style={styles.bottomContainer}>
        <Card style={styles.bottomCard}>
          {/* Sign Up Button */}
          <Button
            label="Daftar"
            onPress={() => router.push("/auth/sign-up")}
            style={styles.signUpBtn}
            textStyle={styles.signUpText}
          />
          
          {/* Sign In Link */}
          <TouchableOpacity
            onPress={() => router.push("/auth/sign-in")}
            style={styles.signInBtn}
            activeOpacity={0.6}
          >
            <Text style={styles.signInText}>Sudah memiliki akun</Text>
          </TouchableOpacity>
        </Card>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  backgroundBlob: {
    position: "absolute",
    top: 0,
    right: -100,
    width: 320,
    height: SCREEN_HEIGHT * 0.75,
    borderBottomLeftRadius: 180,
    borderTopLeftRadius: 180,
    backgroundColor: "#F2F7FA",
    opacity: 0.8,
  },
  topHeader: {
    flexDirection: "row",
    justifyContent: "flex-end",
    paddingHorizontal: 24,
    paddingTop: 12,
  },
  skipButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  skipText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#1B5A7A",
    marginRight: 4,
  },
  skipIcon: {
    marginTop: 1,
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  logoRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  logoCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 5,
    borderColor: "#0B1A30",
    position: "relative",
    justifyContent: "center",
    alignItems: "center",
  },
  logoDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: "#2F58E8",
    position: "absolute",
    bottom: -8,
    left: -4,
    borderWidth: 2.5,
    borderColor: "#FFFFFF",
  },
  logoText: {
    fontSize: 38,
    fontWeight: "bold",
    color: "#0B1A30",
    marginLeft: 16,
    letterSpacing: 2,
  },
  bottomContainer: {
    paddingHorizontal: 24,
    paddingBottom: Platform.OS === "ios" ? 40 : 24,
  },
  bottomCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: "#EBF0F5",
    shadowColor: "#0D1B2A",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 12,
    elevation: 3,
  },
  signUpBtn: {
    backgroundColor: "#1B5A7A",
    height: 52,
    borderRadius: 26,
    justifyContent: "center",
    alignItems: "center",
  },
  signUpText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },
  signInBtn: {
    alignItems: "center",
    marginTop: 18,
    paddingVertical: 4,
  },
  signInText: {
    color: "#0B1A30",
    fontSize: 14.5,
    fontWeight: "600",
  },
});
