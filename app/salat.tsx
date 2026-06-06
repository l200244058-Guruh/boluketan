import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Platform,
  Dimensions,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Header } from "@/components/ui/header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

interface Prayer {
  name: string;
  baseTime: string;
  icon: keyof typeof Ionicons.glyphMap;
}

export default function SalatScreen() {
  const router = useRouter();

  // Baseline prayer times for 3 June 2026
  const basePrayers: Prayer[] = [
    { name: "Subuh", baseTime: "04:30", icon: "cloudy-night" },
    { name: "Terbit", baseTime: "05:43", icon: "sunny-outline" },
    { name: "Zuhur", baseTime: "11:36", icon: "sunny" },
    { name: "Asar", baseTime: "14:57", icon: "partly-sunny" },
    { name: "Magrib", baseTime: "17:27", icon: "sunny-outline" },
    { name: "Isya", baseTime: "18:42", icon: "moon" },
  ];

  // Selected date state (defaults to 3 June 2026 to match screenshot)
  const [selectedDate, setSelectedDate] = useState<Date>(new Date(2026, 5, 3));
  const [prayers, setPrayers] = useState<any[]>([]);
  const [timeLeft, setTimeLeft] = useState("07:29:14");
  const [nextPrayer, setNextPrayer] = useState("Subuh");

  // Format date helper: "Rabu, 3 Juni 2026"
  const getFormattedDate = (date: Date) => {
    const days = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
    const months = [
      "Januari",
      "Februari",
      "Maret",
      "April",
      "Mei",
      "Juni",
      "Juli",
      "Agustus",
      "September",
      "Oktober",
      "November",
      "Desember",
    ];
    const dayName = days[date.getDay()];
    const day = date.getDate();
    const monthName = months[date.getMonth()];
    const year = date.getFullYear();
    return `${dayName}, ${day} ${monthName} ${year}`;
  };

  // Format Hijri date helper: "17 Zulhijah 1447 H"
  const getHijriDate = (date: Date) => {
    // 3 June 2026 is 17 Zulhijah 1447
    const baseDate = new Date(2026, 5, 3);
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

    return `${hijriDay} ${hijriMonth} ${hijriYear} H`;
  };

  // Adjust prayer times slightly for different dates to make it look realistic
  const calculatePrayersForDate = (date: Date) => {
    const baseDate = new Date(2026, 5, 3);
    const diffTime = date.getTime() - baseDate.getTime();
    const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

    // Shift by a pseudo-random offset (e.g. sine wave variation of up to 4 minutes)
    const minutesOffset = Math.round(Math.sin(diffDays * 0.1) * 3);

    return basePrayers.map((p) => {
      const [h, m] = p.baseTime.split(":").map(Number);
      let newM = m + minutesOffset;
      let newH = h;
      if (newM >= 60) {
        newM -= 60;
        newH += 1;
      } else if (newM < 0) {
        newM += 60;
        newH -= 1;
      }
      const timeStr = `${newH.toString().padStart(2, "0")}:${newM.toString().padStart(2, "0")}`;
      return {
        ...p,
        time: timeStr,
      };
    });
  };

  // Handle Date Navigation
  const changeDate = (days: number) => {
    const nextDate = new Date(selectedDate);
    nextDate.setDate(nextDate.getDate() + days);
    setSelectedDate(nextDate);
  };

  // Update prayers when date changes
  useEffect(() => {
    setPrayers(calculatePrayersForDate(selectedDate));
  }, [selectedDate]);

  // Real-time Countdown Timer logic
  useEffect(() => {
    if (prayers.length === 0) return;

    const updateCountdown = () => {
      const now = new Date();
      const currentHours = now.getHours();
      const currentMinutes = now.getMinutes();
      const currentSeconds = now.getSeconds();
      const currentTotalSeconds = currentHours * 3600 + currentMinutes * 60 + currentSeconds;

      // Find the next prayer time
      let next = prayers[0];
      let nextTotalSeconds = 0;
      let found = false;

      for (let i = 0; i < prayers.length; i++) {
        const [pHours, pMinutes] = prayers[i].time.split(":").map(Number);
        const pTotalSeconds = pHours * 3600 + pMinutes * 60;
        if (pTotalSeconds > currentTotalSeconds) {
          next = prayers[i];
          nextTotalSeconds = pTotalSeconds;
          found = true;
          break;
        }
      }

      if (!found) {
        const [pHours, pMinutes] = prayers[0].time.split(":").map(Number);
        nextTotalSeconds = (pHours + 24) * 3600 + pMinutes * 60;
        next = prayers[0];
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
  }, [prayers]);

  // Determine if a prayer time has already passed
  const isPrayerPassed = (prayerTimeStr: string) => {
    // Only check if it's the current real date
    const today = new Date();
    if (
      selectedDate.getDate() !== today.getDate() ||
      selectedDate.getMonth() !== today.getMonth() ||
      selectedDate.getFullYear() !== today.getFullYear()
    ) {
      // If it's a past date, all prayers are complete. If future, none are.
      return selectedDate.getTime() < today.getTime();
    }

    const now = new Date();
    const currentTotalSeconds = now.getHours() * 3600 + now.getMinutes() * 60 + now.getSeconds();
    const [h, m] = prayerTimeStr.split(":").map(Number);
    const prayerTotalSeconds = h * 3600 + m * 60;

    return currentTotalSeconds >= prayerTotalSeconds;
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" />
      <LinearGradient
        colors={["#0E1A39", "#0B0F1C"]}
        style={StyleSheet.absoluteFillObject}
      />

      {/* Header Bar */}
      <Header
        title="Waktu Salat"
        theme="dark"
        onBackPress={() => router.back()}
        titleStyle={styles.headerTitle}
        containerStyle={styles.header}
      />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Location & Qibla Row */}
        <View style={styles.infoRow}>
          <TouchableOpacity style={styles.locationButton} activeOpacity={0.8}>
            <Text style={styles.locationText} numberOfLines={1}>Kabupaten Sukoharjo</Text>
            <Ionicons name="chevron-forward" size={14} color="#FFFFFF" style={styles.locationIcon} />
          </TouchableOpacity>

          <Button
            label="Kiblat"
            onPress={() => router.push("/kiblat")}
            icon={<Ionicons name="compass-outline" size={16} color="#FFFFFF" />}
            style={styles.kiblatButton}
            textStyle={styles.kiblatButtonText}
          />
        </View>

        {/* Hero Section: Moon Graphic */}
        <View style={styles.heroSection}>
          <View style={styles.moonGlow}>
            <Ionicons name="moon" size={72} color="#E2E8F0" style={styles.moonIcon} />
          </View>
          <Text style={styles.timerText}>{timeLeft}</Text>
          <Text style={styles.timerLabel}>Waktu tersisa sebelum salat {nextPrayer}</Text>
        </View>

        {/* Date Navigation & Prayer List Card */}
        <Card variant="elevated" style={styles.prayerCard}>
          {/* Date Selector Row */}
          <View style={styles.dateSelectorRow}>
            <TouchableOpacity onPress={() => changeDate(-1)} style={styles.dateNavButton}>
              <Ionicons name="chevron-back" size={20} color="#FFFFFF" />
            </TouchableOpacity>
            <View style={styles.dateTextContainer}>
              <Text style={styles.dateText}>{getFormattedDate(selectedDate)}</Text>
              <Text style={styles.hijriText}>({getHijriDate(selectedDate)})</Text>
            </View>
            <TouchableOpacity onPress={() => changeDate(1)} style={styles.dateNavButton}>
              <Ionicons name="chevron-forward" size={20} color="#FFFFFF" />
            </TouchableOpacity>
          </View>

          {/* Vertical Prayer Times List */}
          <View style={styles.prayerListContainer}>
            {prayers.map((item, idx) => {
              const passed = isPrayerPassed(item.time);
              const isActive = item.name === nextPrayer;

              return (
                <View key={idx} style={[styles.prayerRow, isActive && styles.prayerRowActive]}>
                  <View style={styles.prayerLeftContainer}>
                    {/* Checkmark Status indicator */}
                    <Ionicons
                      name={passed ? "checkmark-circle" : "ellipse-outline"}
                      size={24}
                      color={passed ? "#34C759" : "rgba(255,255,255,0.2)"}
                      style={styles.checkmarkIcon}
                    />
                    <View style={styles.prayerInfoContainer}>
                      <Text style={styles.prayerName}>{item.name}</Text>
                      <Text style={styles.prayerTime}>{item.time}</Text>
                    </View>
                  </View>

                  {/* Prayer Icon */}
                  <Ionicons
                      name={item.icon}
                      size={24}
                      color={isActive ? "#FFD60A" : "rgba(255,255,255,0.7)"}
                      style={styles.prayerIcon}
                    />
                </View>
              );
            })}
          </View>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#0B0F1C",
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255, 255, 255, 0.05)",
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  headerRightPlaceholder: {
    width: 32,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    marginTop: 16,
  },
  locationButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 14,
    maxWidth: "60%",
  },
  locationText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "600",
  },
  locationIcon: {
    marginLeft: 6,
  },
  kiblatButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
  },
  kiblatIcon: {
    marginRight: 6,
  },
  kiblatButtonText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "600",
  },
  heroSection: {
    alignItems: "center",
    marginVertical: 24,
  },
  moonIcon: {
    textShadowColor: "rgba(226, 232, 240, 0.3)",
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 20,
  },
  moonGlow: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: "rgba(255, 255, 255, 0.02)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.05)",
  },
  timerText: {
    fontSize: 44,
    fontWeight: "bold",
    color: "#FFFFFF",
    letterSpacing: 1,
  },
  timerLabel: {
    fontSize: 13,
    color: "rgba(255, 255, 255, 0.75)",
    marginTop: 6,
    textAlign: "center",
    paddingHorizontal: 30,
  },
  prayerCard: {
    backgroundColor: "#131C38",
    marginHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.06)",
    padding: 16,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 4,
  },
  dateSelectorRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255, 255, 255, 0.08)",
    paddingBottom: 16,
    marginBottom: 8,
  },
  dateNavButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.05)",
    justifyContent: "center",
    alignItems: "center",
  },
  dateTextContainer: {
    alignItems: "center",
    flex: 1,
  },
  dateText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "700",
  },
  hijriText: {
    color: "rgba(255, 255, 255, 0.6)",
    fontSize: 12,
    marginTop: 2,
    fontWeight: "500",
  },
  prayerListContainer: {
    marginTop: 8,
  },
  prayerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 12,
    marginBottom: 6,
  },
  prayerRowActive: {
    backgroundColor: "rgba(255, 255, 255, 0.06)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.08)",
  },
  prayerLeftContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  checkmarkIcon: {
    marginRight: 14,
  },
  prayerInfoContainer: {
    justifyContent: "center",
  },
  prayerName: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
  },
  prayerTime: {
    color: "rgba(255, 255, 255, 0.5)",
    fontSize: 13,
    marginTop: 2,
    fontWeight: "600",
  },
  prayerIcon: {
    marginRight: 4,
  },
});
