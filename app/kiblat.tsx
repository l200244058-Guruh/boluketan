import React, { useState, useRef, useEffect } from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Platform,
  Animated,
  PanResponder,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Header } from "@/components/ui/header";
import { Magnetometer } from "expo-sensors";

export default function KiblatScreen() {
  const router = useRouter();

  // Angle of Qibla for Indonesia (Kabupaten Sukoharjo) is ~294 degrees
  const QIBLA_ANGLE = 294;

  // Animation values for compass rotation
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const currentRotation = useRef(0);
  const [rotationDegrees, setRotationDegrees] = useState(0);

  // Magnetometer sensor states
  const [isSensorAvailable, setIsSensorAvailable] = useState(false);
  const [useSensor, setUseSensor] = useState(true);

  // Check Magnetometer availability and register listener
  useEffect(() => {
    let subscription: any = null;

    Magnetometer.isAvailableAsync().then((available) => {
      setIsSensorAvailable(available);

      if (available && useSensor) {
        Magnetometer.setUpdateInterval(100);
        subscription = Magnetometer.addListener((data) => {
          let { x, y } = data;
          let angle = 0;
          if (Math.atan2(y, x) >= 0) {
            angle = Math.atan2(y, x) * (180 / Math.PI);
          } else {
            angle = (Math.atan2(y, x) + 2 * Math.PI) * (180 / Math.PI);
          }
          const heading = Math.round(angle);

          // Compass rotation target is 360 - heading
          const targetRotation = 360 - heading;

          // Set the animated value directly
          rotateAnim.setValue(targetRotation);
          currentRotation.current = targetRotation;
        });
      } else {
        // Run standard settling simulation on mount if sensor is not available
        Animated.sequence([
          Animated.timing(rotateAnim, {
            toValue: 80,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(rotateAnim, {
            toValue: -30,
            duration: 600,
            useNativeDriver: true,
          }),
          Animated.timing(rotateAnim, {
            toValue: 45,
            duration: 500,
            useNativeDriver: true,
          }),
        ]).start(() => {
          currentRotation.current = 45;
          setRotationDegrees(45);
        });
      }
    });

    // Listen to changes to determine alignment state
    const listenerId = rotateAnim.addListener(({ value }) => {
      let normalized = Math.round(value) % 360;
      if (normalized < 0) normalized += 360;
      setRotationDegrees(normalized);
    });

    return () => {
      if (subscription) subscription.remove();
      rotateAnim.removeListener(listenerId);
    };
  }, [useSensor]);

  // PanResponder to allow users to drag/rotate the compass manually to simulate orientation alignment
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => !(isSensorAvailable && useSensor),
      onMoveShouldSetPanResponder: () => !(isSensorAvailable && useSensor),
      onPanResponderMove: (evt, gestureState) => {
        if (isSensorAvailable && useSensor) return;
        const deltaRotation = gestureState.dx * 0.5; // Scale speed of rotation
        const newRotation = currentRotation.current + deltaRotation;
        rotateAnim.setValue(newRotation);
      },
      onPanResponderRelease: (evt, gestureState) => {
        if (isSensorAvailable && useSensor) return;
        const deltaRotation = gestureState.dx * 0.5;
        currentRotation.current = currentRotation.current + deltaRotation;
      },
    })
  ).current;

  // Qibla is aligned when the Kaaba pin is pointing straight UP (0° relative to screen).
  // The Kaaba pin is at QIBLA_ANGLE (294°) relative to North.
  // The dial's North is rotated by `rotationDegrees` relative to the screen top (0°).
  // Thus, Qibla pin screen angle = rotationDegrees + QIBLA_ANGLE.
  // When this sum (mod 360) is close to 360 (or 0), it is aligned!
  const pinScreenAngle = (rotationDegrees + QIBLA_ANGLE) % 360;
  const isAligned = Math.abs(pinScreenAngle - 360) < 6 || pinScreenAngle < 6;

  // Format rotation to degrees format for display
  const displayRotate = rotateAnim.interpolate({
    inputRange: [-3600, 3600],
    outputRange: ["-3600deg", "3600deg"],
  });

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />

      {/* Header Bar */}
      <Header
        title="Kiblat"
        onBackPress={() => router.back()}
        titleStyle={styles.headerTitle}
        containerStyle={styles.header}
      />

      <View style={styles.content}>
        {/* Alignment instructions & Mode toggle */}
        <View style={styles.instructionContainer}>
          <Text style={styles.instructionText}>
            {isAligned
              ? "Kiblat Terbimbing! Posisi Anda sudah sejajar."
              : isSensorAvailable && useSensor
              ? "Arahkan ponsel Anda sampai tanda Kaabah sejajar di atas."
              : "Putar kompas secara manual agar tanda Kaabah berada di atas."}
          </Text>
          
          {isSensorAvailable && (
            <TouchableOpacity
              style={[styles.modeToggle, useSensor ? styles.modeToggleActive : styles.modeToggleInactive]}
              onPress={() => setUseSensor(prev => !prev)}
              activeOpacity={0.7}
            >
              <Ionicons
                name={useSensor ? "compass" : "hand-right-outline"}
                size={14}
                color={useSensor ? "#34C759" : "#8E8E93"}
                style={{ marginRight: 4 }}
              />
              <Text style={[styles.modeToggleText, { color: useSensor ? "#34C759" : "#8E8E93" }]}>
                {useSensor ? "Sensor Otomatis Aktif" : "Mode Simulasi Manual"}
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Compass Dial Area */}
        <View style={styles.compassContainer}>
          {/* Central alignment guide pointer (Stays fixed pointing UP) */}
          <View style={[styles.fixedPointerContainer, isAligned && styles.fixedPointerAligned]}>
            <View style={[styles.fixedPointerArrow, isAligned && styles.fixedPointerArrowAligned]} />
          </View>

          {/* Rotating Compass Dial */}
          <Animated.View
            {...panResponder.panHandlers}
            style={[
              styles.rotatingDial,
              { transform: [{ rotate: displayRotate }] },
              isAligned && styles.rotatingDialAligned,
            ]}
          >
            {/* Outer Blue Ring with N, E, S, W */}
            <View style={styles.outerRing}>
              <Text style={[styles.directionLabel, styles.northLabel]}>N</Text>
              <Text style={[styles.directionLabel, styles.eastLabel]}>E</Text>
              <Text style={[styles.directionLabel, styles.southLabel]}>S</Text>
              <Text style={[styles.directionLabel, styles.westLabel]}>W</Text>
            </View>

            {/* Inner White Disk */}
            <View style={styles.innerDisk}>
              {/* Concentric rings decor */}
              <View style={styles.decorCircle1} />
              <View style={styles.decorCircle2} />
              
              {/* Central Arrow inside dial (indicates North reference) */}
              <Ionicons
                name="chevron-up"
                size={32}
                color="rgba(14, 46, 80, 0.15)"
                style={styles.northIndicatorArrow}
              />
            </View>

            {/* Kaaba Pin Wrapper (positioned at 294 degrees relative to North) */}
            <View style={styles.kaabaPinWrapper}>
              <View style={styles.kaabaPin}>
                <View style={styles.kaabaPinCircle}>
                  <View style={styles.kaabaCube}>
                    <View style={styles.kaabaGoldBand} />
                  </View>
                </View>
                <View style={styles.kaabaPinTip} />
              </View>
            </View>
          </Animated.View>
        </View>

        {/* Info Box at Bottom */}
        <View style={styles.bottomInfoContainer}>
          <Text style={styles.qiblaDegreesText}>KIBLAT {QIBLA_ANGLE}°</Text>
          <View style={styles.locationRow}>
            <Ionicons name="location" size={18} color="#FF3B30" style={styles.locationIcon} />
            <Text style={styles.locationText}>Kabupaten Sukoharjo</Text>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F8F9FE",
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E5EA",
    backgroundColor: "#FFFFFF",
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1C1C1E",
  },
  headerRightPlaceholder: {
    width: 32,
  },
  content: {
    flex: 1,
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  instructionContainer: {
    alignItems: "center",
    width: "100%",
  },
  instructionText: {
    fontSize: 14,
    color: "#8E8E93",
    textAlign: "center",
    lineHeight: 20,
    paddingHorizontal: 30,
    minHeight: 40,
  },
  modeToggle: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 14,
    marginTop: 8,
    borderWidth: 1,
  },
  modeToggleActive: {
    backgroundColor: "rgba(52, 199, 89, 0.1)",
    borderColor: "rgba(52, 199, 89, 0.2)",
  },
  modeToggleInactive: {
    backgroundColor: "#F2F2F7",
    borderColor: "#E5E5EA",
  },
  modeToggleText: {
    fontSize: 11,
    fontWeight: "600",
  },
  compassContainer: {
    width: 290,
    height: 290,
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  fixedPointerContainer: {
    position: "absolute",
    top: 0,
    zIndex: 20,
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#0D1B2A",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
    borderWidth: 1,
    borderColor: "rgba(14, 46, 80, 0.05)",
  },
  fixedPointerAligned: {
    borderColor: "#34C759",
    shadowColor: "#34C759",
    shadowOpacity: 0.3,
  },
  fixedPointerArrow: {
    width: 0,
    height: 0,
    borderLeftWidth: 10,
    borderLeftColor: "transparent",
    borderRightWidth: 10,
    borderRightColor: "transparent",
    borderBottomWidth: 26,
    borderBottomColor: "#0E2E50",
    transform: [{ translateY: -2 }],
  },
  fixedPointerArrowAligned: {
    borderBottomColor: "#34C759",
  },
  rotatingDial: {
    width: 260,
    height: 260,
    borderRadius: 130,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    shadowColor: "#0D1B2A",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.08,
    shadowRadius: 20,
    elevation: 5,
    position: "relative",
    borderWidth: 1.5,
    borderColor: "rgba(14, 46, 80, 0.04)",
  },
  rotatingDialAligned: {
    borderColor: "rgba(52, 199, 89, 0.3)",
    shadowColor: "#34C759",
    shadowOpacity: 0.15,
  },
  outerRing: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 130,
    borderWidth: 16,
    borderColor: "#0E2E50",
    justifyContent: "center",
    alignItems: "center",
  },
  directionLabel: {
    position: "absolute",
    fontSize: 14,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  northLabel: {
    top: -12,
  },
  eastLabel: {
    right: -10,
  },
  southLabel: {
    bottom: -12,
  },
  westLabel: {
    left: -12,
  },
  innerDisk: {
    width: 198,
    height: 198,
    borderRadius: 99,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  decorCircle1: {
    width: 150,
    height: 150,
    borderRadius: 75,
    borderWidth: 1,
    borderColor: "rgba(14, 46, 80, 0.03)",
    position: "absolute",
  },
  decorCircle2: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 1,
    borderColor: "rgba(14, 46, 80, 0.03)",
    position: "absolute",
  },
  northIndicatorArrow: {
    position: "absolute",
    top: 10,
  },
  kaabaPinWrapper: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    transform: [{ rotate: "294deg" }], // places the pin at 294 degrees relative to North
  },
  kaabaPin: {
    position: "absolute",
    top: -15, // offsets slightly outside the dial
    alignSelf: "center",
    alignItems: "center",
  },
  kaabaPinCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#FF3B30",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#FF3B30",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
    zIndex: 10,
  },
  kaabaCube: {
    width: 14,
    height: 14,
    backgroundColor: "#1A1A1A",
    borderRadius: 2,
    borderWidth: 1,
    borderColor: "#000000",
    justifyContent: "flex-start",
    position: "relative",
  },
  kaabaGoldBand: {
    position: "absolute",
    top: 3,
    left: 0,
    right: 0,
    height: 1.5,
    backgroundColor: "#FFD60A",
  },
  kaabaPinTip: {
    width: 0,
    height: 0,
    borderLeftWidth: 6,
    borderLeftColor: "transparent",
    borderRightWidth: 6,
    borderRightColor: "transparent",
    borderTopWidth: 8,
    borderTopColor: "#FF3B30",
    marginTop: -2,
  },
  bottomInfoContainer: {
    alignItems: "center",
  },
  qiblaDegreesText: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#1C1C1E",
    letterSpacing: 0.5,
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
  },
  locationIcon: {
    marginRight: 6,
  },
  locationText: {
    fontSize: 14,
    color: "#8E8E93",
    fontWeight: "500",
  },
});
