import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  ActivityIndicator,
  SafeAreaView,
  StatusBar,
  Platform,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Header } from "@/components/ui/header";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface Surah {
  nomor: number;
  nama: string;
  namaLatin: string;
  jumlahAyat: number;
  tempatTurun: string;
  arti: string;
  deskripsi: string;
}

export default function QuranScreen() {
  const router = useRouter();
  const [surahs, setSurahs] = useState<Surah[]>([]);
  const [filteredSurahs, setFilteredSurahs] = useState<Surah[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchSurahs = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await fetch("https://equran.id/api/v2/surat");
      if (!response.ok) {
        throw new Error("Failed to fetch Surah list");
      }
      const json = await response.json();
      if (json.code === 200) {
        setSurahs(json.data);
        setFilteredSurahs(json.data);
      } else {
        throw new Error(json.message || "Failed to load data");
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Something went wrong. Please check your internet connection.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSurahs();
  }, []);

  const handleSearch = (text: string) => {
    setSearchQuery(text);
    if (!text.trim()) {
      setFilteredSurahs(surahs);
      return;
    }
    const filtered = surahs.filter(
      (surah) =>
        surah.namaLatin.toLowerCase().includes(text.toLowerCase()) ||
        surah.arti.toLowerCase().includes(text.toLowerCase())
    );
    setFilteredSurahs(filtered);
  };

  const renderSurahItem = ({ item }: { item: Surah }) => {
    return (
      <Button
        label=""
        variant="text"
        style={styles.surahCard}
        onPress={() => router.push(`/surah/${item.nomor}`)}
      >
        <View style={styles.leftContainer}>
          <View style={styles.numberBadge}>
            <Text style={styles.numberText}>{item.nomor}</Text>
          </View>
          <View style={styles.infoContainer}>
            <Text style={styles.latinName}>{item.namaLatin}</Text>
            <Text style={styles.metaText}>
              {item.tempatTurun} • {item.jumlahAyat} Verses
            </Text>
          </View>
        </View>
        <View style={styles.rightContainer}>
          <Text style={styles.arabicName}>{item.nama}</Text>
          <Text style={styles.translationText}>{item.arti}</Text>
        </View>
      </Button>
    );
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#2F58E8" />
        <Text style={styles.loadingText}>Loading Al-Qur'an...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Ionicons name="alert-circle-outline" size={60} color="#FF3B30" />
        <Text style={styles.errorText}>{error}</Text>
        <Button
          label="Retry"
          onPress={fetchSurahs}
          style={styles.retryButton}
          textStyle={styles.retryButtonText}
        />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      {/* Header */}
      <Header
        title="Al-Qur'an"
        subtitle="Digital Quran Translation"
        titleStyle={styles.title}
        subtitleStyle={styles.subtitle}
        containerStyle={styles.header}
      />

      {/* Search Bar */}
      <Input
        placeholder="Search Surah..."
        value={searchQuery}
        onChangeText={handleSearch}
        clearButtonMode="while-editing"
        leftIcon={<Ionicons name="search-outline" size={20} color="#8E8E93" />}
        containerStyle={{ marginHorizontal: 20, marginVertical: 12, marginBottom: 0 }}
        wrapperStyle={{ backgroundColor: "#FFFFFF", height: 48, borderRadius: 12, borderWidth: 1, borderColor: "#E5E5EA" }}
        inputStyle={styles.searchInput}
      />

      {/* Surah List */}
      <FlatList
        data={filteredSurahs}
        keyExtractor={(item) => item.nomor.toString()}
        renderItem={renderSurahItem}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="search-outline" size={48} color="#C7C7CC" />
            <Text style={styles.emptyText}>No Surahs match your search</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F9FE",
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#2F58E8",
  },
  subtitle: {
    fontSize: 14,
    color: "#666666",
    marginTop: 4,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    marginHorizontal: 20,
    marginVertical: 12,
    paddingHorizontal: 12,
    height: 48,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5E5EA",
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: "#1C1C1E",
  },
  listContainer: {
    paddingHorizontal: 20,
    paddingBottom: 110,
  },
  surahCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#E5E5EA",
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  leftContainer: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  numberBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#F0F3FF",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  numberText: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#2F58E8",
  },
  infoContainer: {
    justifyContent: "center",
  },
  latinName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#1C1C1E",
  },
  metaText: {
    fontSize: 12,
    color: "#8E8E93",
    marginTop: 4,
  },
  rightContainer: {
    alignItems: "flex-end",
  },
  arabicName: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#2F58E8",
    marginBottom: 4,
  },
  translationText: {
    fontSize: 12,
    color: "#8E8E93",
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F8F9FE",
    padding: 20,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: "#666666",
  },
  errorText: {
    marginTop: 12,
    fontSize: 16,
    color: "#FF3B30",
    textAlign: "center",
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: "#2F58E8",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
  },
  emptyText: {
    marginTop: 12,
    fontSize: 16,
    color: "#8E8E93",
    textAlign: "center",
  },
});