import React from "react";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  StyleProp,
  ViewStyle,
  TextStyle,
} from "react-native";

export interface SegmentedControlOption<T extends string | number> {
  label: string;
  value: T;
  icon?: React.ReactNode;
}

export interface SegmentedControlProps<T extends string | number> {
  options: SegmentedControlOption<T>[];
  selectedValue: T;
  onValueChange: (value: T) => void;
  containerStyle?: StyleProp<ViewStyle>;
  tabStyle?: StyleProp<ViewStyle>;
  activeTabStyle?: StyleProp<ViewStyle>;
  labelStyle?: StyleProp<TextStyle>;
  activeLabelStyle?: StyleProp<TextStyle>;
}

export function SegmentedControl<T extends string | number>({
  options,
  selectedValue,
  onValueChange,
  containerStyle,
  tabStyle,
  activeTabStyle,
  labelStyle,
  activeLabelStyle,
}: SegmentedControlProps<T>) {
  return (
    <View style={[styles.container, containerStyle]}>
      {options.map((option) => {
        const isActive = option.value === selectedValue;
        return (
          <TouchableOpacity
            key={option.value}
            style={[
              styles.tab,
              tabStyle,
              isActive ? [styles.tabActive, activeTabStyle] : null,
            ]}
            onPress={() => onValueChange(option.value)}
            activeOpacity={0.8}
          >
            {option.icon && <View style={styles.iconContainer}>{option.icon}</View>}
            <Text
              style={[
                styles.label,
                labelStyle,
                isActive ? [styles.labelActive, activeLabelStyle] : null,
              ]}
            >
              {option.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    backgroundColor: "rgba(255, 255, 255, 0.06)",
    borderRadius: 14,
    padding: 4,
    marginHorizontal: 16,
    marginVertical: 12,
  },
  tab: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "transparent",
  },
  tabActive: {
    backgroundColor: "rgba(255, 255, 255, 0.12)",
    borderColor: "rgba(255, 255, 255, 0.08)",
  },
  iconContainer: {
    marginRight: 6,
  },
  label: {
    fontSize: 14,
    fontWeight: "500",
    color: "rgba(255, 255, 255, 0.6)",
  },
  labelActive: {
    color: "#FFFFFF",
    fontWeight: "bold",
  },
});
