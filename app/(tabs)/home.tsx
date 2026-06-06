import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Image,
  SafeAreaView,
  StatusBar,
  Dimensions,
  Platform,
  Alert,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons, FontAwesome5, MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Card } from "@/components/ui/card";
import { useAppAuth, hasClerkKey } from "@/hooks/use-app-auth";
import { useUser } from "@clerk/clerk-expo";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Location from "expo-location";
import { Modal, ActivityIndicator } from "react-native";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

interface PrayerTime {
  name: string;
  time: string;
  icon: keyof typeof Ionicons.glyphMap;
}

export default function HomeScreen() {
  const router = useRouter();
  const { isSignedIn } = useAppAuth();
  const clerkUser = hasClerkKey ? useUser() : { user: null };
  const user = clerkUser.user;
  const userName = isSignedIn ? (user?.firstName || "Onic") : "Tamu";

  // 6 Islamic Prayer Times
  const prayerTimes: PrayerTime[] = [
    { name: "Subuh", time: "04:30", icon: "cloudy-night-outline" },
    { name: "Terbit", time: "05:41", icon: "sunny-outline" },
    { name: "Zuhur", time: "11:36", icon: "sunny" },
    { name: "Asar", time: "14:57", icon: "partly-sunny-outline" },
    { name: "Magrib", time: "17:28", icon: "sunny-outline" },
    { name: "Isya", time: "18:41", icon: "moon-outline" },
  ];

  const [timeLeft, setTimeLeft] = useState("00:08:40");
  const [nextPrayer, setNextPrayer] = useState("Magrib");
  const [islamicDate, setIslamicDate] = useState("19 Zulhijah 1447");
  const [gregorianDate, setGregorianDate] = useState("Jumat, 5 Juni 2026");
  const [showHijri, setShowHijri] = useState(true);
  const [location, setLocation] = useState("Kabupaten Sukoharjo");
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [gpsLoading, setGpsLoading] = useState(false);

  const manualCities = [
    "Kabupaten Sukoharjo",
    "Kota Surakarta",
    "Kabupaten Karanganyar",
    "Kota Yogyakarta",
    "DKI Jakarta",
    "Kota Bandung",
    "Kota Surabaya",
  ];

  const toggleDateFormat = () => {
    setShowHijri((prev) => !prev);
  };

  const selectManualLocation = async (city: string) => {
    setLocation(city);
    await AsyncStorage.setItem("user_location", city);
    setShowLocationModal(false);
    Alert.alert("Lokasi Diperbarui", `Jadwal salat telah disesuaikan dengan wilayah ${city}.`);
  };

  const handleGPSLocation = async () => {
    setGpsLoading(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Izin Lokasi Ditolak",
          "Aplikasi membutuhkan izin akses lokasi untuk menentukan wilayah Anda secara otomatis."
        );
        return;
      }

      const currentLoc = await Location.getCurrentPositionAsync({});
      const geocode = await Location.reverseGeocodeAsync({
        latitude: currentLoc.coords.latitude,
        longitude: currentLoc.coords.longitude,
      });

      if (geocode && geocode.length > 0) {
        const address = geocode[0];
        const detectedCity = address.subregion || address.city || address.district || address.region || "Kabupaten Sukoharjo";
        setLocation(detectedCity);
        await AsyncStorage.setItem("user_location", detectedCity);
        setShowLocationModal(false);
        Alert.alert("Lokasi Otomatis Aktif", `Lokasi Anda berhasil diatur ke: ${detectedCity}`);
      } else {
        throw new Error("Gagal mendapatkan nama wilayah.");
      }
    } catch (err) {
      console.warn("GPS Location error:", err);
      Alert.alert(
        "GPS Gagal",
        "Gagal mendapatkan lokasi GPS Anda. Silakan pilih lokasi secara manual."
      );
    } finally {
      setGpsLoading(false);
    }
  };

  useEffect(() => {
    // Load saved location on mount
    AsyncStorage.getItem("user_location")
      .then((savedLoc) => {
        if (savedLoc) setLocation(savedLoc);
      })
      .catch(() => {});

    // Dynamic Hijri Date calculation (matches salat.tsx algorithm)
    const getIslamicDate = (date: Date) => {
      const baseDate = new Date(2026, 5, 3); // 3 June 2026 is 17 Zulhijah 1447
      const diffTime = date.getTime() - baseDate.getTime();
      const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

      let hijriDay = 17 + diffDays;
      let hijriMonth = "Zulhijah";
      let hijriYear = 1447;

      if (hijriDay > 30) {
        hijriDay = hijriDay - 30;
        hijriMonth = "Muharam";
        hijriYear = 1448;
      } else if (hijriDay <= 0) {
        hijriDay = 29 + hijriDay;
        hijriMonth = "Zulkaidah";
      }

      return `${hijriDay} ${hijriMonth} ${hijriYear}`;
    };

    const getGregorianDate = (date: Date) => {
      const days = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
      const months = [
        "Januari", "Februari", "Maret", "April", "Mei", "Juni",
        "Juli", "Agustus", "September", "Oktober", "November", "Desember"
      ];
      const dayName = days[date.getDay()];
      const day = date.getDate();
      const monthName = months[date.getMonth()];
      const year = date.getFullYear();
      return `${dayName}, ${day} ${monthName} ${year}`;
    };

    const today = new Date();
    setIslamicDate(getIslamicDate(today));
    setGregorianDate(getGregorianDate(today));

    const updateCountdown = () => {
      const now = new Date();
      const currentHours = now.getHours();
      const currentMinutes = now.getMinutes();
      const currentSeconds = now.getSeconds();
      const currentTotalSeconds = currentHours * 3600 + currentMinutes * 60 + currentSeconds;

      // Find the next prayer time
      let next = prayerTimes[0];
      let nextTotalSeconds = 0;
      let found = false;

      for (let i = 0; i < prayerTimes.length; i++) {
        const [pHours, pMinutes] = prayerTimes[i].time.split(":").map(Number);
        const pTotalSeconds = pHours * 3600 + pMinutes * 60;
        if (pTotalSeconds > currentTotalSeconds) {
          next = prayerTimes[i];
          nextTotalSeconds = pTotalSeconds;
          found = true;
          break;
        }
      }

      // If no prayer time is left today, next prayer is Subuh of tomorrow
      if (!found) {
        const [pHours, pMinutes] = prayerTimes[0].time.split(":").map(Number);
        nextTotalSeconds = (pHours + 24) * 3600 + pMinutes * 60;
        next = prayerTimes[0];
      }

      const diffSeconds = nextTotalSeconds - currentTotalSeconds;
      const hours = Math.floor(diffSeconds / 3600);
      const minutes = Math.floor((diffSeconds % 3600) / 60);
      const seconds = diffSeconds % 60;

      const formatted = [
        hours.toString().padStart(2, "0"),
        minutes.toString().padStart(2, "0"),
        seconds.toString().padStart(2, "0"),
      ].join(":");

      setTimeLeft(formatted);
      setNextPrayer(next.name);
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, []);

  // Features Grid Data (8 items)
  const menuFeatures = [
    {
      id: "salat",
      label: "Salat",
      iconType: "font-awesome",
      iconName: "pray",
      iconColor: "#4B6BF9",
      onPress: () => router.push("/salat"),
    },
    {
      id: "quran",
      label: "Al-Quran",
      iconType: "font-awesome",
      iconName: "book-open",
      iconColor: "#41C1A6",
      onPress: () => router.push("/quran"),
    },
    {
      id: "doa",
      label: "Doa",
      iconType: "material-community",
      iconName: "hands-pray",
      iconColor: "#8E5CF6",
      onPress: () => router.push("/doa" as any),
    },
    {
      id: "kalender",
      label: "Kalender",
      iconType: "ionicons",
      iconName: "calendar-outline",
      iconColor: "#FFB302",
      onPress: () => router.push("/kalender"),
    },
  ];

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        
        {/* Header Section */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greetingText}>
              {isSignedIn ? `Assalamualaikum ${userName}` : "Assalamualaikum Tamu"}
            </Text>
            <View style={styles.logoRow}>
              <View style={styles.logoIcon}>
                <View style={styles.logoCircle}>
                  <View style={styles.logoDot} />
                </View>
              </View>
              <Text style={styles.logoText}>MASA</Text>
            </View>
          </View>
        </View>

        {/* Card Container */}
        <View style={styles.cardContainer}>
          {/* Blue Gradient Prayer Card */}
          <LinearGradient
            colors={["#3574FC", "#153EE0"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.prayerCard}
          >
            {/* Top row inside card */}
            <View style={styles.cardHeader}>
              <TouchableOpacity
                style={styles.locationButton}
                activeOpacity={0.8}
                onPress={() => setShowLocationModal(true)}
              >
                <Text style={styles.locationText} numberOfLines={1}>{location}</Text>
                <Ionicons name="chevron-forward" size={14} color="#FFFFFF" style={styles.locationIcon} />
              </TouchableOpacity>
              <TouchableOpacity onPress={toggleDateFormat} activeOpacity={0.75}>
                <Text style={styles.islamicDate}>
                  {showHijri ? islamicDate : gregorianDate}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Countdown layout */}
            <View style={styles.countdownRow}>
              <View style={styles.countdownLeft}>
                <Text style={styles.timerText}>{timeLeft}</Text>
                <Text style={styles.timerSubtitle}>Waktu tersisa sebelum salat {nextPrayer}</Text>
              </View>

              {/* Weather Graphic (Sun path & Cloud) */}
              <View style={styles.weatherContainer}>
                {/* Dashed sun path arc */}
                <View style={styles.dashedArc} />
                {/* Sun */}
                <View style={styles.sunGraphic} />
                {/* Cloud */}
                <Ionicons name="cloud" size={44} color="rgba(255,255,255,0.7)" style={styles.cloudGraphic} />
              </View>
            </View>

            {/* Prayer Times Row */}
            <View style={styles.prayerTimesDivider} />
            <View style={styles.prayerTimesRow}>
              {prayerTimes.map((item, idx) => {
                const isUpcoming = item.name === nextPrayer;
                return (
                  <View key={idx} style={[styles.prayerItem, isUpcoming && styles.prayerItemActive]}>
                    <View style={[styles.prayerIconContainer, isUpcoming && styles.prayerIconActive]}>
                      <Ionicons name={item.icon} size={18} color="#FFFFFF" />
                    </View>
                    <Text style={styles.prayerTimeText}>{item.time}</Text>
                    <Text style={styles.prayerLabelText}>{item.name}</Text>
                  </View>
                );
              })}
            </View>
          </LinearGradient>
        </View>

        {/* Feature Grid Menu */}
        <View style={styles.gridContainer}>
          {menuFeatures.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={styles.gridItem}
              onPress={item.onPress}
              activeOpacity={0.7}
            >
              <View style={[styles.iconWrapper, { backgroundColor: "#FFFFFF" }]}>
                {item.iconType === "font-awesome" && (
                  <FontAwesome5 name={item.iconName} size={24} color={item.iconColor} />
                )}
                {item.iconType === "material-community" && (
                  <MaterialCommunityIcons name={item.iconName as any} size={26} color={item.iconColor} />
                )}
                {item.iconType === "ionicons" && (
                  <Ionicons name={item.iconName as any} size={26} color={item.iconColor} />
                )}

              </View>
              <Text style={styles.gridLabel}>{item.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Idul Adha Quote Section */}
        <View style={styles.quoteSection}>
          <Text style={styles.quoteSectionTitle}>Pesan Hari Ini</Text>
          <Card style={styles.quoteCard}>
            {/* Grid Pattern Background */}
            <View style={styles.quoteGridBackground}>
              <View style={styles.quoteGridCol} />
              <View style={styles.quoteGridCol} />
              <View style={styles.quoteGridCol} />
              <View style={styles.quoteGridRow} />
              <View style={styles.quoteGridRow} />
            </View>

            {/* Arabic Verse */}
            <Text style={styles.arabicText}>إِنَّ مَعَ الْعُسْرِ يُسْرًا</Text>
            {/* Translation */}
            <Text style={styles.translationText}>
              "Sesungguhnya beserta kesulitan ada kemudahan."
            </Text>
            <Text style={styles.citationText}>Al-Insyirah ayat 6</Text>
          </Card>
        </View>

      </ScrollView>

      {/* Location Picker Modal */}
      <Modal
        visible={showLocationModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowLocationModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {/* Handle bar */}
            <View style={styles.modalHandle} />

            <Text style={styles.modalTitle}>Pilih Lokasi</Text>
            <Text style={styles.modalSubtitle}>
              Tentukan wilayah Anda untuk menyesuaikan jadwal waktu salat
            </Text>

            {/* GPS Option */}
            <TouchableOpacity
              style={[styles.gpsButton, gpsLoading && styles.gpsButtonLoading]}
              onPress={handleGPSLocation}
              disabled={gpsLoading}
              activeOpacity={0.8}
            >
              {gpsLoading ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <>
                  <Ionicons name="location" size={20} color="#FFFFFF" style={{ marginRight: 8 }} />
                  <Text style={styles.gpsButtonText}>Gunakan Lokasi Saat Ini (GPS)</Text>
                </>
              )}
            </TouchableOpacity>

            <View style={styles.modalDividerContainer}>
              <View style={styles.modalDividerLine} />
              <Text style={styles.modalDividerText}>atau pilih manual</Text>
              <View style={styles.modalDividerLine} />
            </View>

            {/* Manual cities list */}
            <ScrollView style={styles.cityList} showsVerticalScrollIndicator={false}>
              {manualCities.map((city) => {
                const isSelected = city === location;
                return (
                  <TouchableOpacity
                    key={city}
                    style={[styles.cityItem, isSelected && styles.cityItemActive]}
                    onPress={() => selectManualLocation(city)}
                    activeOpacity={0.6}
                  >
                    <Text style={[styles.cityItemText, isSelected && styles.cityItemTextActive]}>
                      {city}
                    </Text>
                    {isSelected && (
                      <Ionicons name="checkmark" size={18} color="#2F58E8" />
                    )}
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            {/* Close Button */}
            <TouchableOpacity
              style={styles.closeModalButton}
              onPress={() => setShowLocationModal(false)}
              activeOpacity={0.8}
            >
              <Text style={styles.closeModalButtonText}>Batal</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F4F6F9",
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
  },
  container: {
    paddingBottom: 110,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  greetingText: {
    fontSize: 14,
    color: "#5F6C7D",
    fontWeight: "500",
  },
  logoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
  },
  logoIcon: {
    marginRight: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  logoCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2.5,
    borderColor: "#0E153A",
    position: "relative",
  },
  logoDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#007AFF",
    position: "absolute",
    bottom: -4,
    left: -2,
  },
  logoText: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#0E153A",
    letterSpacing: 1,
  },
  cardContainer: {
    position: "relative",
    marginHorizontal: 16,
    marginTop: 15,
  },
  prayerCard: {
    borderRadius: 18,
    padding: 16,
    shadowColor: "#153EE0",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 15,
    elevation: 8,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  locationButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 12,
    maxWidth: "55%",
  },
  locationText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "600",
  },
  locationIcon: {
    marginLeft: 4,
  },
  islamicDate: {
    color: "#FFFFFF",
    opacity: 0.85,
    fontSize: 12,
    fontWeight: "500",
  },
  countdownRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 18,
    marginBottom: 8,
  },
  countdownLeft: {
    flex: 1,
  },
  timerText: {
    color: "#FFFFFF",
    fontSize: 38,
    fontWeight: "bold",
    letterSpacing: 1,
  },
  timerSubtitle: {
    color: "#FFFFFF",
    opacity: 0.85,
    fontSize: 11,
    marginTop: 4,
    lineHeight: 15,
  },
  weatherContainer: {
    width: 90,
    height: 70,
    position: "relative",
    justifyContent: "center",
    alignItems: "center",
  },
  dashedArc: {
    position: "absolute",
    width: 70,
    height: 70,
    borderRadius: 35,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.35)",
    borderStyle: "dashed",
    bottom: -15,
    left: 5,
  },
  sunGraphic: {
    position: "absolute",
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#FFD60A",
    top: 5,
    right: 15,
    shadowColor: "#FFD60A",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 10,
  },
  cloudGraphic: {
    position: "absolute",
    bottom: 5,
    left: 10,
  },
  prayerTimesDivider: {
    height: 1,
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    marginVertical: 14,
  },
  prayerTimesRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  prayerItem: {
    alignItems: "center",
    flex: 1,
    paddingVertical: 4,
    borderRadius: 8,
  },
  prayerItemActive: {
    backgroundColor: "rgba(255, 255, 255, 0.08)",
  },
  prayerIconContainer: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 4,
  },
  prayerIconActive: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.3)",
  },
  prayerTimeText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "bold",
  },
  prayerLabelText: {
    color: "#FFFFFF",
    opacity: 0.75,
    fontSize: 10,
    marginTop: 2,
  },
  gridContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: 10,
    marginTop: 24,
    justifyContent: "space-between",
  },
  gridItem: {
    width: (SCREEN_WIDTH - 20) / 4 - 10,
    alignItems: "center",
    marginBottom: 16,
  },
  iconWrapper: {
    width: 62,
    height: 62,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 3,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#F0F2F6",
  },
  gridLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: "#3F4E60",
    marginTop: 8,
    textAlign: "center",
  },

  quoteSection: {
    paddingHorizontal: 16,
    marginTop: 16,
  },
  quoteSectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#0E153A",
    marginBottom: 10,
  },
  quoteCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    paddingVertical: 24,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: "#EBF0F5",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 2,
    position: "relative",
    overflow: "hidden",
  },
  quoteGridBackground: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.25,
  },
  quoteGridCol: {
    position: "absolute",
    width: 1,
    height: "100%",
    backgroundColor: "#D3D9E2",
    left: "25%",
  },
  quoteGridRow: {
    position: "absolute",
    height: 1,
    width: "100%",
    backgroundColor: "#D3D9E2",
    top: "33%",
  },
  arabicText: {
    fontSize: 28,
    fontWeight: "700",
    color: "#0E153A",
    textAlign: "right",
    lineHeight: 38,
    marginBottom: 12,
    paddingHorizontal: 8,
  },
  translationText: {
    fontSize: 12.5,
    fontStyle: "italic",
    color: "#5F6C7D",
    textAlign: "center",
    lineHeight: 18,
    paddingHorizontal: 16,
  },
  citationText: {
    fontSize: 11,
    color: "#8E8E93",
    textAlign: "right",
    marginTop: 12,
    marginRight: 8,
    fontWeight: "600",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: Platform.OS === "ios" ? 40 : 24,
    maxHeight: "80%",
  },
  modalHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#E5E5EA",
    alignSelf: "center",
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#0E153A",
    textAlign: "center",
  },
  modalSubtitle: {
    fontSize: 13,
    color: "#8E8E93",
    textAlign: "center",
    marginTop: 6,
    marginBottom: 20,
    lineHeight: 18,
  },
  gpsButton: {
    flexDirection: "row",
    backgroundColor: "#2F58E8",
    height: 50,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#2F58E8",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 3,
  },
  gpsButtonLoading: {
    backgroundColor: "#7D9DFF",
  },
  gpsButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "bold",
  },
  modalDividerContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 20,
  },
  modalDividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: "#F2F2F7",
  },
  modalDividerText: {
    marginHorizontal: 12,
    color: "#8E8E93",
    fontSize: 12,
    fontWeight: "500",
  },
  cityList: {
    maxHeight: 250,
  },
  cityItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#F2F2F7",
  },
  cityItemActive: {
    borderBottomColor: "#E5EDFF",
  },
  cityItemText: {
    fontSize: 15,
    color: "#1C1C1E",
    fontWeight: "500",
  },
  cityItemTextActive: {
    color: "#2F58E8",
    fontWeight: "bold",
  },
  closeModalButton: {
    height: 50,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 16,
    borderWidth: 1,
    borderColor: "#E5E5EA",
  },
  closeModalButtonText: {
    color: "#8E8E93",
    fontSize: 15,
    fontWeight: "600",
  },
});