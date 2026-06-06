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
  Dimensions,
  TextInput,
  FlatList,
  Modal,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { DOA_CATEGORIES, DoaItem } from "../../constants/doa-data";
import { Header } from "@/components/ui/header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

export default function DoaScreen() {
  const router = useRouter();
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<DoaItem[]>([]);
  
  // Selected prayer for detail modal
  const [selectedPrayer, setSelectedPrayer] = useState<DoaItem | null>(null);

  const handleSearch = (text: string) => {
    setSearchQuery(text);
    if (!text.trim()) {
      setSearchResults([]);
      return;
    }
    
    // Search across all items in all categories
    const results: DoaItem[] = [];
    DOA_CATEGORIES.forEach((category) => {
      category.items.forEach((item) => {
        if (
          item.title.toLowerCase().includes(text.toLowerCase()) ||
          item.translation.toLowerCase().includes(text.toLowerCase()) ||
          item.latin.toLowerCase().includes(text.toLowerCase())
        ) {
          results.push(item);
        }
      });
    });
    setSearchResults(results);
  };

  const clearSearch = () => {
    setSearchQuery("");
    setSearchResults([]);
    setShowSearch(false);
  };

  // Find the category of a searched prayer
  const getCategoryOfPrayer = (prayerId: string) => {
    for (const cat of DOA_CATEGORIES) {
      if (cat.items.some((item) => item.id === prayerId)) {
        return cat.title;
      }
    }
    return "";
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      {/* Header */}
      <Header
        title="Doa - doa"
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
                placeholder="Cari doa..."
                placeholderTextColor="#8E8E93"
                value={searchQuery}
                onChangeText={handleSearch}
                autoFocus
                clearButtonMode="while-editing"
              />
              <TouchableOpacity onPress={clearSearch} style={styles.closeSearchButton}>
                <Text style={styles.closeSearchText}>Batal</Text>
              </TouchableOpacity>
            </View>
          ) : undefined
        }
      />

      {/* Main Content */}
      {showSearch && searchQuery.trim() !== "" ? (
        // Search Results Screen
        <FlatList
          data={searchResults}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.searchList}
          renderItem={({ item }) => (
            <TouchableOpacity 
              onPress={() => setSelectedPrayer(item)}
            >
              <Card style={styles.searchResultCard}>
                <View style={styles.searchResultHeader}>
                  <Text style={styles.searchResultTitle}>{item.title}</Text>
                  <Text style={styles.searchResultCategory}>
                    {getCategoryOfPrayer(item.id)}
                  </Text>
                </View>
                <Text style={styles.searchResultSnippet} numberOfLines={2}>
                  {item.translation}
                </Text>
              </Card>
            </TouchableOpacity>
          )}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="search-outline" size={48} color="#C7C7CC" />
              <Text style={styles.emptyText}>Tidak ada doa yang cocok</Text>
            </View>
          }
        />
      ) : (
        // Category Grid Screen
        <ScrollView contentContainerStyle={styles.gridContainer} showsVerticalScrollIndicator={false}>
          {DOA_CATEGORIES.map((category) => (
            <TouchableOpacity
              key={category.id}
              onPress={() => router.push(`/doa/${category.id}` as any)}
              activeOpacity={0.7}
            >
              <Card style={styles.gridCard}>
                <View style={styles.iconOutlineCircle}>
                  <Ionicons name={category.icon as any} size={24} color="#1B6A9C" />
                </View>
                <Text style={styles.cardLabel}>{category.title}</Text>
              </Card>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}

      {/* Prayer Detail Modal (used for search results) */}
      <Modal
        visible={selectedPrayer !== null}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setSelectedPrayer(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {/* Modal Header */}
            <View style={styles.modalHeader}>
              <Text style={styles.modalCategoryTitle}>
                {selectedPrayer ? getCategoryOfPrayer(selectedPrayer.id) : ""}
              </Text>
              <TouchableOpacity
                onPress={() => setSelectedPrayer(null)}
                style={styles.modalCloseButton}
              >
                <Ionicons name="close" size={24} color="#3A3A3C" />
              </TouchableOpacity>
            </View>

            {selectedPrayer && (
              <ScrollView 
                contentContainerStyle={styles.modalScrollContent}
                showsVerticalScrollIndicator={false}
              >
                <Text style={styles.modalTitle}>{selectedPrayer.title}</Text>
                
                {/* Arabic Script */}
                <View style={styles.arabicBox}>
                  <Text style={styles.modalArabicText}>{selectedPrayer.arabic}</Text>
                </View>

                {/* Latin Transliteration */}
                <Text style={styles.modalSectionLabel}>Latin</Text>
                <Text style={styles.modalLatinText}>{selectedPrayer.latin}</Text>

                {/* Indonesian Translation */}
                <Text style={styles.modalSectionLabel}>Terjemahan</Text>
                <Text style={styles.modalTranslationText}>{selectedPrayer.translation}</Text>

                {/* Fadhilah / Benefits (if available) */}
                {selectedPrayer.fadhilah && (
                  <View style={styles.fadhilahBox}>
                    <View style={styles.fadhilahHeader}>
                      <Ionicons name="information-circle" size={18} color="#1B6A9C" />
                      <Text style={styles.fadhilahTitle}>Fadhilah / Keutamaan</Text>
                    </View>
                    <Text style={styles.fadhilahText}>{selectedPrayer.fadhilah}</Text>
                  </View>
                )}

                {/* Source/Reference */}
                {selectedPrayer.source && (
                  <Text style={styles.modalSourceText}>Sumber: {selectedPrayer.source}</Text>
                )}
                
                <View style={{ height: 20 }} />
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>
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
  gridContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    padding: 12,
    justifyContent: "space-between",
  },
  gridCard: {
    width: (SCREEN_WIDTH - 36) / 2,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 20,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#EBF0F6",
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 2,
  },
  iconOutlineCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: "#D2E1EF",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
  },
  cardLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1C1C1E",
    marginTop: 16,
  },
  searchList: {
    padding: 16,
  },
  searchResultCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#EBF0F6",
  },
  searchResultHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  searchResultTitle: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#1C1C1E",
    flex: 1,
    marginRight: 8,
  },
  searchResultCategory: {
    fontSize: 11,
    color: "#1B6A9C",
    fontWeight: "600",
    backgroundColor: "#E2EFFB",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    overflow: "hidden",
  },
  searchResultSnippet: {
    fontSize: 13,
    color: "#8E8E93",
    lineHeight: 18,
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
  },
  emptyText: {
    marginTop: 12,
    fontSize: 16,
    color: "#8E8E93",
    textAlign: "center",
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
    maxHeight: "85%",
    paddingBottom: Platform.OS === "ios" ? 30 : 16,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#EBF0F6",
  },
  modalCategoryTitle: {
    fontSize: 13,
    fontWeight: "bold",
    color: "#8E8E93",
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  modalCloseButton: {
    padding: 4,
  },
  modalScrollContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1C1C1E",
    marginBottom: 16,
  },
  arabicBox: {
    backgroundColor: "#F8F9FB",
    borderRadius: 16,
    padding: 20,
    marginVertical: 8,
    borderWidth: 1,
    borderColor: "#F0F2F5",
  },
  modalArabicText: {
    fontSize: 24,
    color: "#1C1C1E",
    textAlign: "right",
    lineHeight: 44,
    writingDirection: "rtl",
  },
  modalSectionLabel: {
    fontSize: 13,
    fontWeight: "bold",
    color: "#1B6A9C",
    marginTop: 18,
    marginBottom: 6,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  modalLatinText: {
    fontSize: 14.5,
    fontStyle: "italic",
    color: "#48484A",
    lineHeight: 22,
  },
  modalTranslationText: {
    fontSize: 14.5,
    color: "#1C1C1E",
    lineHeight: 22,
  },
  fadhilahBox: {
    backgroundColor: "#F4F9FC",
    borderRadius: 12,
    padding: 14,
    marginTop: 20,
    borderWidth: 1,
    borderColor: "#D2E7F4",
  },
  fadhilahHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  fadhilahTitle: {
    fontSize: 13,
    fontWeight: "bold",
    color: "#1B6A9C",
    marginLeft: 6,
  },
  fadhilahText: {
    fontSize: 13,
    color: "#3A3A3C",
    lineHeight: 18,
  },
  modalSourceText: {
    fontSize: 12,
    color: "#8E8E93",
    fontStyle: "italic",
    marginTop: 16,
  },
});
