import React from "react";
import { StyleSheet, View, ViewProps, StyleProp, ViewStyle } from "react-native";

export interface CardProps extends ViewProps {
  children: React.ReactNode;
  variant?: "default" | "flat" | "outline" | "elevated";
  style?: StyleProp<ViewStyle>;
}

export function Card({ children, variant = "default", style, ...props }: CardProps) {
  const getCardStyles = () => {
    const stylesList: StyleProp<ViewStyle>[] = [styles.base];

    if (variant === "default") {
      stylesList.push(styles.defaultCard);
    } else if (variant === "flat") {
      stylesList.push(styles.flatCard);
    } else if (variant === "outline") {
      stylesList.push(styles.outlineCard);
    } else if (variant === "elevated") {
      stylesList.push(styles.elevatedCard);
    }

    return stylesList;
  };

  return (
    <View style={[getCardStyles(), style]} {...props}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: 16,
    overflow: "hidden",
  },
  defaultCard: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#EBF0F5",
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 2,
  },
  flatCard: {
    backgroundColor: "#F8F9FB",
    borderWidth: 1,
    borderColor: "#F0F2F5",
  },
  outlineCard: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: "#E5E5EA",
  },
  elevatedCard: {
    backgroundColor: "#131C38",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.06)",
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 4,
  },
});
