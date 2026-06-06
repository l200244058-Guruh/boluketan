import React from "react";
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TextInputProps,
  StyleProp,
  ViewStyle,
  TextStyle,
} from "react-native";

export interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  containerStyle?: StyleProp<ViewStyle>;
  wrapperStyle?: StyleProp<ViewStyle>;
  inputStyle?: StyleProp<TextStyle>;
  labelStyle?: StyleProp<TextStyle>;
  errorStyle?: StyleProp<TextStyle>;
}

export const Input = React.forwardRef<TextInput, InputProps>(
  (
    {
      label,
      error,
      leftIcon,
      rightIcon,
      containerStyle,
      wrapperStyle,
      inputStyle,
      labelStyle,
      errorStyle,
      ...props
    },
    ref
  ) => {
    return (
      <View style={[styles.container, containerStyle]}>
        {label && <Text style={[styles.label, labelStyle]}>{label}</Text>}
        
        <View
          style={[
            styles.wrapper,
            error ? styles.wrapperError : null,
            wrapperStyle,
          ]}
        >
          {leftIcon && <View style={styles.leftIconContainer}>{leftIcon}</View>}
          
          <TextInput
            ref={ref}
            style={[styles.input, inputStyle]}
            placeholderTextColor="#A8A8A8"
            {...props}
          />
          
          {rightIcon && <View style={styles.rightIconContainer}>{rightIcon}</View>}
        </View>

        {error ? <Text style={[styles.errorText, errorStyle]}>{error}</Text> : null}
      </View>
    );
  }
);

Input.displayName = "Input";

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
    width: "100%",
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333333",
    marginBottom: 8,
  },
  wrapper: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E5E5EA",
    borderRadius: 10,
    backgroundColor: "#F9F9F9",
    height: 50,
    paddingHorizontal: 12,
  },
  wrapperError: {
    borderColor: "#FF3B30",
    backgroundColor: "#FFF2F2",
  },
  input: {
    flex: 1,
    color: "#000000",
    fontSize: 16,
    height: "100%",
    paddingVertical: 0,
  },
  leftIconContainer: {
    marginRight: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  rightIconContainer: {
    marginLeft: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  errorText: {
    color: "#FF3B30",
    fontSize: 12,
    marginTop: 4,
    fontWeight: "500",
  },
});
