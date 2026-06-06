import React from "react";
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Platform,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Header } from "@/components/ui/header";
import { Card } from "@/components/ui/card";
import { useAppAuth, hasClerkKey } from "@/hooks/use-app-auth";
import { useUser } from "@clerk/clerk-expo";

interface ProfileItem {
  id: string;
  title: string;
  iconName: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
}

interface ProfileSection {
  title: string;
  items: ProfileItem[];
}

export default function ProfileScreen() {
  const router = useRouter();
  const { isSignedIn, signOut } = useAppAuth();
  const clerkUser = hasClerkKey ? useUser() : { user: null };
  const user = clerkUser.user;

  const userName = isSignedIn
    ? (user?.fullName || user?.username || "Onic Agustino")
    : "Tamu MASA";

  const userEmail = isSignedIn
    ? (user?.primaryEmailAddress?.emailAddress || "onicagustino304@gmail.com")
    : "Ketuk untuk masuk ke akun M-ID";

  const handleSignOut = async () => {
    try {
      await signOut();
      router.replace("/auth/sign-in");
    } catch (e) {
      router.replace("/auth/sign-in");
    }
  };

  const sections: ProfileSection[] = [
    {
      title: "Akun",
      items: [
        {
          id: "pribadi",
          title: "Informasi Pribadi",
          iconName: "person-outline",
          onPress: () => {
            if (!isSignedIn) {
              router.push("/auth/sign-in");
            } else {
              Alert.alert(
                "Informasi Pribadi",
                "Detail profil Anda terverifikasi dengan M-ID."
              );
            }
          },
        },
      ],
    },
    {
      title: "Pengaturan",
      items: [
        {
          id: "notifikasi",
          title: "Notifikasi",
          iconName: "time-outline",
          onPress: () => {
            Alert.alert("Pengaturan Notifikasi", "Fitur notifikasi sedang disiapkan.");
          },
        },
        {
          id: "quran-setting",
          title: "Al-Quran",
          iconName: "book-outline",
          onPress: () => router.push("/quran"),
        },
      ],
    },
    {
      title: "Lainnya",
      items: [
        {
          id: "helpdesk",
          title: "Hubungi Helpdesk",
          iconName: "call-outline",
          onPress: () => {
            Alert.alert("Hubungi Kami", "Layanan bantuan MASA dapat dihubungi melalui email ke support@masa.id");
          },
        },
        {
          id: "pedoman",
          title: "Pedoman Aplikasi",
          iconName: "document-text-outline",
          onPress: () => {
            Alert.alert("Pedoman Aplikasi", "Pedoman penggunaan aplikasi MASA tersedia di website resmi kami.");
          },
        },
        {
          id: "rate",
          title: "Nilai Aplikasi Masa",
          iconName: "star-outline",
          onPress: () => {
            Alert.alert("Beri Nilai", "Terima kasih atas dukungannya! Fitur rating App Store/Play Store akan segera aktif.");
          },
        },
        isSignedIn
          ? {
              id: "keluar",
              title: "Keluar",
              iconName: "log-out-outline",
              onPress: handleSignOut,
            }
          : {
              id: "masuk",
              title: "Masuk / Login",
              iconName: "log-in-outline",
              onPress: () => router.push("/auth/sign-in"),
            },
      ],
    },
  ];

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />

      {/* Main Title Header */}
      <Header
        title="Profil"
        titleStyle={styles.headerTitle}
        containerStyle={styles.header}
      />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* User Card */}
        <TouchableOpacity
          activeOpacity={!isSignedIn ? 0.7 : 1}
          onPress={() => {
            if (!isSignedIn) {
              router.push("/auth/sign-in");
            }
          }}
        >
          <Card style={styles.userCard}>
            <View style={styles.avatarContainer}>
              <Ionicons name="person" size={28} color="#A0AEC0" />
            </View>
            <View style={styles.userInfo}>
              <Text style={styles.userName}>
                {userName}
              </Text>
              <Text style={styles.userEmail}>
                {userEmail}
              </Text>
            </View>
            {!isSignedIn && (
              <Ionicons name="chevron-forward" size={20} color="#8E8E93" />
            )}
          </Card>
        </TouchableOpacity>

        {/* Sections List */}
        {sections.map((section, sectionIdx) => (
          <View key={sectionIdx} style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            <Card style={styles.sectionCard}>
              {section.items.map((item, itemIdx) => {
                const isLastItem = itemIdx === section.items.length - 1;
                return (
                  <TouchableOpacity
                    key={item.id}
                    style={styles.itemRow}
                    onPress={item.onPress}
                    activeOpacity={0.6}
                  >
                    <View style={styles.itemLeft}>
                      {/* Round Bordered Icon Container */}
                      <View style={styles.iconCircle}>
                        <Ionicons name={item.iconName} size={20} color="#1C1C1E" />
                      </View>
                      <Text style={styles.itemTitle}>{item.title}</Text>
                    </View>
                    
                    <Ionicons name="chevron-forward" size={18} color="#8E8E93" />

                    {/* Divider Line (Except for last item in section) */}
                    {!isLastItem && <View style={styles.itemDivider} />}
                  </TouchableOpacity>
                );
              })}
            </Card>
          </View>
        ))}
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
  scrollContent: {
    paddingBottom: 110, // clear the floating bottom tab bar
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
  userCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    marginHorizontal: 16,
    marginVertical: 12,
    padding: 16,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "#E5E5EA",
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.02,
    shadowRadius: 10,
    elevation: 2,
  },
  avatarContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#EBF3FE",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  userInfo: {
    flex: 1,
    justifyContent: "center",
  },
  userName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1C1C1E",
  },
  userEmail: {
    fontSize: 14,
    color: "#8E8E93",
    marginTop: 4,
  },
  sectionContainer: {
    marginTop: 12,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#8E8E93",
    marginBottom: 8,
    marginLeft: 4,
  },
  sectionCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#E5E5EA",
    overflow: "hidden",
  },
  itemRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    paddingHorizontal: 16,
    position: "relative",
  },
  itemLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  iconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    borderWidth: 1,
    borderColor: "#E5E5EA",
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  itemTitle: {
    fontSize: 15,
    fontWeight: "500",
    color: "#1C1C1E",
  },
  itemDivider: {
    position: "absolute",
    bottom: 0,
    left: 66, // aligns line past the icon container
    right: 0,
    height: 1,
    backgroundColor: "#F2F2F7",
  },
});