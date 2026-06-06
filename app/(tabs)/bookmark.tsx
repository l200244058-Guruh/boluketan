import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Header } from "@/components/ui/header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function BookmarkScreen() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"Semua" | "Al-Quran" | "EventMu" | "Berita">("Semua");

  const tabs: ("Semua" | "Al-Quran" | "EventMu" | "Berita")[] = [
    "Semua",
    "Al-Quran",
    "EventMu",
    "Berita",
  ];

  const handleTabPress = (tab: typeof activeTab) => {
    setActiveTab(tab);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />

      {/* Main Title Header */}
      <Header
        title="Bookmark"
        titleStyle={styles.headerTitle}
        containerStyle={styles.header}
      />

      {/* Horizontal Category Switcher */}
      <View style={styles.tabBarContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabBarScroll}
        >
          {tabs.map((tab) => {
            const isActive = activeTab === tab;
            return (
              <TouchableOpacity
                key={tab}
                style={[styles.tabItem, isActive && styles.tabItemActive]}
                onPress={() => handleTabPress(tab)}
                activeOpacity={0.8}
              >
                <Text style={[styles.tabLabel, isActive && styles.tabLabelActive]}>
                  {tab}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Render content based on selected tab */}
        {(activeTab === "Semua" || activeTab === "Al-Quran") && (
          <View style={styles.sectionContainer}>
            {/* Section Header */}
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Al-Quran</Text>
              <TouchableOpacity
                onPress={() => router.push("/quran")}
                activeOpacity={0.7}
              >
                <Text style={styles.seeAllText}>Lihat Semua</Text>
              </TouchableOpacity>
            </View>

            {/* Quran Progress Card with Grid Pattern */}
            <TouchableOpacity
              onPress={() => router.push("/quran")}
              activeOpacity={0.9}
            >
              <Card style={styles.quranCard}>
                {/* Grid Background Overlay */}
                <View style={styles.gridBackground}>
                  <View style={styles.gridCol} />
                  <View style={styles.gridCol} />
                  <View style={styles.gridCol} />
                  <View style={styles.gridRow} />
                  <View style={styles.gridRow} />
                </View>

                {/* Card Contents */}
                <Text style={styles.cardSubtitle}>Yuk mulai baca dari Al-Fatihah</Text>
                <Text style={styles.cardTitle}>Al-Fatihah</Text>

                {/* Progress bar */}
                <View style={styles.progressBarContainer}>
                  <View style={styles.progressBarActive} />
                </View>

                {/* Action Link */}
                <View style={styles.actionLinkRow}>
                  <Text style={styles.actionLinkText}>Baca Al-Qur'an Sekarang</Text>
                  <Ionicons name="chevron-forward" size={14} color="#1C1C1E" style={styles.actionLinkChevron} />
                </View>
              </Card>
            </TouchableOpacity>
          </View>
        )}

        {/* Empty States for EventMu / Berita / Semua (if we want empty states under Semua eventually) */}
        {(activeTab === "EventMu" || activeTab === "Berita") && (
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIconCircle}>
              <Ionicons
                name={activeTab === "EventMu" ? "calendar-outline" : "newspaper-outline"}
                size={48}
                color="#A0AEC0"
              />
            </View>
            <Text style={styles.emptyTitle}>Belum Ada Bookmark</Text>
            <Text style={styles.emptySubtitle}>
              Simpan {activeTab === "EventMu" ? "event menarik" : "berita penting"} yang ingin Anda kunjungi kembali di sini.
            </Text>
            <Button
              label={`Temukan ${activeTab}`}
              style={styles.exploreButton}
              textStyle={styles.exploreButtonText}
            />
          </View>
        )}
      </ScrollView>
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
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#1C1C1E",
  },
  tabBarContainer: {
    borderBottomWidth: 1,
    borderBottomColor: "#E5E5EA",
    backgroundColor: "#F8F9FE",
  },
  tabBarScroll: {
    paddingHorizontal: 16,
  },
  tabItem: {
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderBottomWidth: 2,
    borderBottomColor: "transparent",
  },
  tabItemActive: {
    borderBottomColor: "#2F58E8",
  },
  tabLabel: {
    fontSize: 15,
    fontWeight: "500",
    color: "#8E8E93",
  },
  tabLabelActive: {
    color: "#2F58E8",
    fontWeight: "700",
  },
  scrollContent: {
    paddingBottom: 110, // clear the floating bottom tab bar
  },
  sectionContainer: {
    marginTop: 20,
    paddingHorizontal: 16,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1C1C1E",
  },
  seeAllText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#2F58E8",
  },
  quranCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#EBF0F5",
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.02,
    shadowRadius: 12,
    elevation: 2,
    position: "relative",
    overflow: "hidden",
  },
  gridBackground: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.25,
  },
  gridCol: {
    position: "absolute",
    width: 1,
    height: "100%",
    backgroundColor: "#D3D9E2",
    left: "25%",
  },
  gridRow: {
    position: "absolute",
    height: 1,
    width: "100%",
    backgroundColor: "#D3D9E2",
    top: "33%",
  },
  cardSubtitle: {
    fontSize: 13,
    color: "#8E8E93",
    fontWeight: "500",
    marginBottom: 6,
  },
  cardTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1C1C1E",
    marginBottom: 16,
  },
  progressBarContainer: {
    height: 6,
    width: "60%",
    backgroundColor: "#E5E5EA",
    borderRadius: 3,
    marginBottom: 20,
  },
  progressBarActive: {
    height: "100%",
    width: "15%", // mock progress
    backgroundColor: "#2F58E8",
    borderRadius: 3,
  },
  actionLinkRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  actionLinkText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#1C1C1E",
  },
  actionLinkChevron: {
    marginLeft: 4,
    top: 0.5,
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
    paddingHorizontal: 32,
  },
  emptyIconCircle: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E5E5EA",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.02,
    shadowRadius: 10,
    elevation: 1,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1C1C1E",
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 13,
    color: "#8E8E93",
    textAlign: "center",
    lineHeight: 18,
    marginBottom: 24,
  },
  exploreButton: {
    backgroundColor: "#2F58E8",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 12,
  },
  exploreButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
  },
});