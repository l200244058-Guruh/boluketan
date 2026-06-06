import React from "react";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableOpacityProps,
  ActivityIndicator,
  StyleProp,
  ViewStyle,
  TextStyle,
  View,
} from "react-native";

export interface ButtonProps extends TouchableOpacityProps {
  label?: string;
  variant?: "primary" | "secondary" | "outline" | "text";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
  icon?: React.ReactNode;
  iconPosition?: "left" | "right";
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  loadingColor?: string;
  children?: React.ReactNode;
}

export function Button({
  label = "",
  variant = "primary",
  size = "md",
  loading = false,
  icon,
  iconPosition = "left",
  style,
  textStyle,
  loadingColor,
  disabled,
  children,
  ...props
}: ButtonProps) {
  const getButtonStyles = () => {
    const stylesList: StyleProp<ViewStyle>[] = [styles.base];
    
    // Variant styles
    if (variant === "primary") {
      stylesList.push(styles.primary);
    } else if (variant === "secondary") {
      stylesList.push(styles.secondary);
    } else if (variant === "outline") {
      stylesList.push(styles.outline);
    } else if (variant === "text") {
      stylesList.push(styles.text);
    }

    // Size styles
    if (size === "sm") {
      stylesList.push(styles.sizeSm);
    } else if (size === "md") {
      stylesList.push(styles.sizeMd);
    } else if (size === "lg") {
      stylesList.push(styles.sizeLg);
    }

    if (disabled || loading) {
      stylesList.push(styles.disabled);
    }

    return stylesList;
  };

  const getLabelStyles = () => {
    const stylesList: StyleProp<TextStyle>[] = [styles.labelTextBase];

    if (variant === "primary") {
      stylesList.push(styles.labelTextPrimary);
    } else if (variant === "secondary") {
      stylesList.push(styles.labelTextSecondary);
    } else if (variant === "outline") {
      stylesList.push(styles.labelTextOutline);
    } else if (variant === "text") {
      stylesList.push(styles.labelTextText);
    }

    if (size === "sm") {
      stylesList.push(styles.labelTextSm);
    } else if (size === "md") {
      stylesList.push(styles.labelTextMd);
    } else if (size === "lg") {
      stylesList.push(styles.labelTextLg);
    }

    return stylesList;
  };

  const defaultLoadingColor = variant === "primary" ? "#FFFFFF" : "#2F58E8";

  return (
    <TouchableOpacity
      style={[getButtonStyles(), style]}
      disabled={disabled || loading}
      activeOpacity={0.7}
      {...props}
    >
      {loading ? (
        <ActivityIndicator color={loadingColor || defaultLoadingColor} size="small" />
      ) : children ? (
        children
      ) : (
        <View style={styles.contentContainer}>
          {icon && iconPosition === "left" && <View style={styles.leftIconContainer}>{icon}</View>}
          <Text style={[getLabelStyles(), textStyle]}>{label}</Text>
          {icon && iconPosition === "right" && <View style={styles.rightIconContainer}>{icon}</View>}
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 10,
    flexDirection: "row",
  },
  primary: {
    backgroundColor: "#2F58E8",
    shadowColor: "#2F58E8",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 3,
  },
  secondary: {
    backgroundColor: "#F0F3FF",
  },
  outline: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E5E5EA",
  },
  text: {
    backgroundColor: "transparent",
  },
  sizeSm: {
    height: 38,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  sizeMd: {
    height: 50,
    paddingHorizontal: 20,
    borderRadius: 10,
  },
  sizeLg: {
    height: 56,
    paddingHorizontal: 24,
    borderRadius: 12,
  },
  disabled: {
    opacity: 0.6,
  },
  contentContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  leftIconContainer: {
    marginRight: 8,
  },
  rightIconContainer: {
    marginLeft: 8,
  },
  labelTextBase: {
    fontWeight: "bold",
    textAlign: "center",
  },
  labelTextPrimary: {
    color: "#FFFFFF",
  },
  labelTextSecondary: {
    color: "#2F58E8",
  },
  labelTextOutline: {
    color: "#333333",
  },
  labelTextText: {
    color: "#2F58E8",
  },
  labelTextSm: {
    fontSize: 13,
  },
  labelTextMd: {
    fontSize: 16,
  },
  labelTextLg: {
    fontSize: 18,
  },
});
