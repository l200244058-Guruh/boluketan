import React from "react";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Platform,
  StatusBar,
  StyleProp,
  ViewStyle,
  TextStyle,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

export interface HeaderProps {
  title: string;
  subtitle?: string;
  onBackPress?: () => void;
  rightComponent?: React.ReactNode;
  theme?: "light" | "dark";
  containerStyle?: StyleProp<ViewStyle>;
  titleStyle?: StyleProp<TextStyle>;
  subtitleStyle?: StyleProp<TextStyle>;
  customContent?: React.ReactNode; // For overriding header layout entirely in search mode
}

export function Header({
  title,
  subtitle,
  onBackPress,
  rightComponent,
  theme = "light",
  containerStyle,
  titleStyle,
  subtitleStyle,
  customContent,
}: HeaderProps) {
  const isDark = theme === "dark";

  if (customContent) {
    return (
      <View style={[styles.header, isDark ? styles.headerDark : styles.headerLight, containerStyle]}>
        {customContent}
      </View>
    );
  }

  const textColor = isDark ? "#FFFFFF" : "#1C1C1E";
  const subtitleColor = isDark ? "rgba(255, 255, 255, 0.7)" : "#666666";

  return (
    <View style={[styles.header, isDark ? styles.headerDark : styles.headerLight, containerStyle]}>
      <View style={styles.leftContainer}>
        {onBackPress ? (
          <TouchableOpacity
            style={styles.backButton}
            onPress={onBackPress}
            activeOpacity={0.7}
          >
            <Ionicons name="arrow-back" size={24} color={textColor} />
          </TouchableOpacity>
        ) : null}
        
        <View style={styles.titleContainer}>
          <Text style={[styles.headerTitle, { color: textColor }, titleStyle]}>
            {title}
          </Text>
          {subtitle ? (
            <Text style={[styles.headerSubtitle, { color: subtitleColor }, subtitleStyle]}>
              {subtitle}
            </Text>
          ) : null}
        </View>
      </View>

      <View style={styles.rightContainer}>
        {rightComponent}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    ...Platform.select({
      ios: {
        borderBottomWidth: 1,
      },
      android: {
        elevation: 0,
      },
    }),
  },
  headerLight: {
    backgroundColor: "#FFFFFF",
    borderBottomColor: "#EBF0F6",
    ...Platform.select({
      ios: {
        borderBottomWidth: 1,
      },
    }),
  },
  headerDark: {
    backgroundColor: "transparent",
    borderBottomColor: "rgba(255, 255, 255, 0.05)",
    ...Platform.select({
      ios: {
        borderBottomWidth: 1,
      },
    }),
  },
  leftContainer: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  backButton: {
    padding: 4,
    marginRight: 8,
  },
  titleContainer: {
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
  },
  headerSubtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  rightContainer: {
    justifyContent: "center",
    alignItems: "flex-end",
  },
});
