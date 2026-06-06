import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Platform,
  TextInput,
  ScrollView,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { DOA_CATEGORIES, DoaItem } from "../../constants/doa-data";
import { Header } from "@/components/ui/header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function CategoryDetailScreen() {
  const { category: categoryId } = useLocalSearchParams();
  const router = useRouter();

  // Search inside the category
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Tasbih counts state: { [prayerId]: count }
  const [counts, setCounts] = useState<Record<string, number>>({});

  // Find the current category
  const currentCategory = DOA_CATEGORIES.find((cat) => cat.id === categoryId);

  if (!currentCategory) {
    return (
      <SafeAreaView style={styles.centeredContainer}>
        <StatusBar barStyle="dark-content" />
        <Ionicons name="alert-circle-outline" size={60} color="#FF3B30" />
        <Text style={styles.errorText}>Kategori tidak ditemukan</Text>
        <TouchableOpacity style={styles.backLink} onPress={() => router.back()}>
          <Text style={styles.backLinkText}>Kembali</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  // Filter items based on search query
  const filteredItems = currentCategory.items.filter(
    (item) =>
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.translation.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.latin.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Handle counter tap
  const handleCounterTap = async (itemId: string, maxCount: number) => {
    const currentVal = counts[itemId] || 0;
    
    try {
      if (currentVal >= maxCount) {
        // Reset to 0
        setCounts((prev) => ({ ...prev, [itemId]: 0 }));
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      } else {
        const newVal = currentVal + 1;
        setCounts((prev) => ({ ...prev, [itemId]: newVal }));
        
        if (newVal === maxCount) {
          // Success haptic when complete
          await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        } else {
          // Light tick haptic for counting
          await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }
      }
    } catch (e) {
      // Haptics might fail on simulator/web, ignore silently
      if (currentVal >= maxCount) {
        setCounts((prev) => ({ ...prev, [itemId]: 0 }));
      } else {
        setCounts((prev) => ({ ...prev, [itemId]: currentVal + 1 }));
      }
    }
  };

  // Reset counter manually
  const handleReset = async (itemId: string) => {
    setCounts((prev) => ({ ...prev, [itemId]: 0 }));
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch (e) {}
  };

  const renderPrayerItem = ({ item, index }: { item: DoaItem; index: number }) => {
    const currentCount = counts[item.id] || 0;
    const isCompleted = currentCount >= item.count;
    const isMultiCount = item.count > 1;

    return (
      <Card style={styles.prayerCard}>
        {/* Card Header */}
        <View style={styles.cardHeader}>
          <View style={styles.numberBadge}>
            <Text style={styles.numberText}>{index + 1}</Text>
          </View>
          <Text style={styles.prayerTitle}>{item.title}</Text>
        </View>

        {/* Arabic Script */}
        <View style={styles.arabicContainer}>
          <Text style={styles.arabicText}>{item.arabic}</Text>
        </View>

        {/* Latin Transliteration */}
        <Text style={styles.sectionLabel}>Latin</Text>
        <Text style={styles.latinText}>{item.latin}</Text>

        {/* Translation */}
        <Text style={styles.sectionLabel}>Terjemahan</Text>
        <Text style={styles.translationText}>{item.translation}</Text>

        {/* Fadhilah / Benefits */}
        {item.fadhilah && (
          <View style={styles.fadhilahContainer}>
            <View style={styles.fadhilahHeader}>
              <Ionicons name="information-circle-outline" size={16} color="#1B6A9C" />
              <Text style={styles.fadhilahTitle}>Fadhilah</Text>
            </View>
            <Text style={styles.fadhilahText}>{item.fadhilah}</Text>
          </View>
        )}

        {/* Source/Reference */}
        {item.source && (
          <Text style={styles.sourceText}>Sumber: {item.source}</Text>
        )}

        {/* Tasbih/Dhikr Counter (Only for counts > 1) */}
        {isMultiCount ? (
          <View style={styles.counterWrapper}>
            <TouchableOpacity
              activeOpacity={0.8}
              style={[
                styles.counterButton,
                isCompleted ? styles.counterButtonCompleted : styles.counterButtonCounting,
              ]}
              onPress={() => handleCounterTap(item.id, item.count)}
            >
              <View style={styles.counterContent}>
                <Ionicons 
                  name={isCompleted ? "checkmark-circle" : "finger-print-outline"} 
                  size={20} 
                  color={isCompleted ? "#2E7D32" : "#1B6A9C"} 
                  style={styles.counterIcon}
                />
                <Text style={[
                  styles.counterCountText,
                  isCompleted ? styles.counterCountTextCompleted : styles.counterCountTextCounting
                ]}>
                  {currentCount} / {item.count}
                </Text>
                <Text style={styles.counterTapHint}>
                  {isCompleted ? "(Selesai - Ketuk untuk Ulang)" : "(Ketuk untuk Hitung)"}
                </Text>
              </View>
            </TouchableOpacity>

            {currentCount > 0 && (
              <Button
                label="Reset"
                variant="outline"
                onPress={() => handleReset(item.id)}
                icon={<Ionicons name="refresh" size={20} color="#8E8E93" />}
                style={styles.resetButton}
                textStyle={styles.resetText}
              />
            )}
          </View>
        ) : (
          // For count == 1, show a simple "Mark Read" checkmark toggle to help the user keep track
          <View style={styles.singleCheckWrapper}>
            <TouchableOpacity
              activeOpacity={0.7}
              style={[
                styles.checkToggleButton,
                currentCount === 1 ? styles.checkToggleChecked : styles.checkToggleUnchecked
              ]}
              onPress={() => setCounts(prev => ({ ...prev, [item.id]: currentCount === 1 ? 0 : 1 }))}
            >
              <Ionicons 
                name={currentCount === 1 ? "checkmark-circle" : "ellipse-outline"} 
                size={22} 
                color={currentCount === 1 ? "#2E7D32" : "#8E8E93"} 
              />
              <Text style={[
                styles.checkToggleText,
                currentCount === 1 ? styles.checkToggleTextChecked : styles.checkToggleTextUnchecked
              ]}>
                {currentCount === 1 ? "Sudah Dibaca" : "Tandai Dibaca"}
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </Card>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <Header
        title={currentCategory.title}
        onBackPress={() => router.back()}
        rightComponent={
          <TouchableOpacity onPress={() => setShowSearch(true)} style={styles.headerButton}>
            <Ionicons name="search-outline" size={24} color="#1C1C1E" />
          </TouchableOpacity>
        }
        containerStyle={styles.header}
        titleStyle={styles.headerTitle}
        customContent={
          showSearch ? (
            <View style={styles.searchBarContainer}>
              <Ionicons name="search-outline" size={20} color="#8E8E93" style={styles.searchIcon} />
              <TextInput
                style={styles.searchInput}
                placeholder={`Cari di ${currentCategory.title}...`}
                placeholderTextColor="#8E8E93"
                value={searchQuery}
                onChangeText={setSearchQuery}
                autoFocus
                clearButtonMode="while-editing"
              />
              <TouchableOpacity 
                onPress={() => {
                  setSearchQuery("");
                  setShowSearch(false);
                }} 
                style={styles.closeSearchButton}
              >
                <Text style={styles.closeSearchText}>Batal</Text>
              </TouchableOpacity>
            </View>
          ) : undefined
        }
      />

      {/* List of Prayers */}
      <FlatList
        data={filteredItems}
        keyExtractor={(item) => item.id}
        renderItem={renderPrayerItem}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="search-outline" size={48} color="#C7C7CC" />
            <Text style={styles.emptyText}>Tidak ada doa yang ditemukan</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F4F6F9",
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#EBF0F6",
    height: 56,
  },
  headerButton: {
    padding: 4,
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1C1C1E",
  },
  searchBarContainer: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: "#1C1C1E",
    paddingVertical: 4,
  },
  closeSearchButton: {
    paddingLeft: 12,
  },
  closeSearchText: {
    fontSize: 15,
    color: "#007AFF",
    fontWeight: "500",
  },
  listContent: {
    padding: 16,
    paddingBottom: 40,
  },
  prayerCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#EBF0F6",
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.02,
    shadowRadius: 8,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  numberBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#E2EFFB",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  numberText: {
    fontSize: 13,
    fontWeight: "bold",
    color: "#1B6A9C",
  },
  prayerTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#1C1C1E",
    flex: 1,
  },
  arabicContainer: {
    backgroundColor: "#F8F9FB",
    borderRadius: 12,
    padding: 18,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#F0F2F5",
  },
  arabicText: {
    fontSize: 24,
    color: "#1C1C1E",
    textAlign: "right",
    lineHeight: 44,
    writingDirection: "rtl",
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#1B6A9C",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 4,
    marginTop: 10,
  },
  latinText: {
    fontSize: 14.5,
    fontStyle: "italic",
    color: "#48484A",
    lineHeight: 22,
    marginBottom: 10,
  },
  translationText: {
    fontSize: 14.5,
    color: "#1C1C1E",
    lineHeight: 22,
    marginBottom: 10,
  },
  fadhilahContainer: {
    backgroundColor: "#F4F9FC",
    borderRadius: 12,
    padding: 14,
    marginTop: 12,
    borderWidth: 1,
    borderColor: "#D2E7F4",
  },
  fadhilahHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  fadhilahTitle: {
    fontSize: 12.5,
    fontWeight: "bold",
    color: "#1B6A9C",
    marginLeft: 6,
  },
  fadhilahText: {
    fontSize: 13,
    color: "#3A3A3C",
    lineHeight: 18,
  },
  sourceText: {
    fontSize: 12,
    color: "#8E8E93",
    fontStyle: "italic",
    marginTop: 12,
    marginBottom: 4,
  },
  counterWrapper: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 18,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "#F2F4F7",
  },
  counterButton: {
    flex: 1,
    height: 52,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
  },
  counterButtonCounting: {
    backgroundColor: "#F4F9FC",
    borderColor: "#B9D8EE",
  },
  counterButtonCompleted: {
    backgroundColor: "#E8F5E9",
    borderColor: "#A5D6A7",
  },
  counterContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    flexWrap: "wrap",
    paddingHorizontal: 8,
  },
  counterIcon: {
    marginRight: 8,
  },
  counterCountText: {
    fontSize: 16,
    fontWeight: "bold",
  },
  counterCountTextCounting: {
    color: "#1B6A9C",
  },
  counterCountTextCompleted: {
    color: "#2E7D32",
  },
  counterTapHint: {
    fontSize: 11,
    color: "#8E8E93",
    marginLeft: 8,
  },
  resetButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 16,
    height: 52,
    marginLeft: 12,
    borderRadius: 12,
    backgroundColor: "#F2F4F7",
  },
  resetText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#8E8E93",
    marginLeft: 6,
  },
  singleCheckWrapper: {
    marginTop: 14,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: "#F2F4F7",
  },
  checkToggleButton: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  checkToggleUnchecked: {
    backgroundColor: "#F2F4F7",
  },
  checkToggleChecked: {
    backgroundColor: "#E8F5E9",
  },
  checkToggleText: {
    fontSize: 13,
    fontWeight: "600",
    marginLeft: 8,
  },
  checkToggleTextUnchecked: {
    color: "#5F6C7D",
  },
  checkToggleTextChecked: {
    color: "#2E7D32",
  },
  centeredContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F4F6F9",
    padding: 20,
  },
  errorText: {
    marginTop: 12,
    fontSize: 16,
    color: "#FF3B30",
    fontWeight: "600",
    textAlign: "center",
    marginBottom: 20,
  },
  backLink: {
    backgroundColor: "#1B6A9C",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  backLinkText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 80,
  },
  emptyText: {
    marginTop: 12,
    fontSize: 16,
    color: "#8E8E93",
    textAlign: "center",
  },
});
