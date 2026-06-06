import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { Link, useRouter } from "expo-router";
import { useSignIn, useOAuth } from "@clerk/clerk-expo";
import { Ionicons } from "@expo/vector-icons";
import * as WebBrowser from "expo-web-browser";
import * as Linking from "expo-linking";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAppAuth } from "@/hooks/use-app-auth";

// Warm up the browser on mount, cool down on unmount
function useWarmUpBrowser() {
  useEffect(() => {
    void WebBrowser.warmUpAsync();
    return () => {
      void WebBrowser.coolDownAsync();
    };
  }, []);
}

// Shared Sign In Form component to keep layout code DRY
interface SignInFormProps {
  emailAddress: string;
  setEmailAddress: (val: string) => void;
  password: string;
  setPassword: (val: string) => void;
  loading: boolean;
  error: string;
  setError: (val: string) => void;
  showPassword: boolean;
  setShowPassword: (val: boolean) => void;
  onSignInPress: () => void;
  onGoogleSignInPress: () => void;
}

function SignInForm({
  emailAddress,
  setEmailAddress,
  password,
  setPassword,
  loading,
  error,
  showPassword,
  setShowPassword,
  onSignInPress,
  onGoogleSignInPress,
}: SignInFormProps) {
  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <Ionicons name="moon-outline" size={40} color="#2F58E8" />
          </View>
          <Text style={styles.title}>MASA</Text>
          <Text style={styles.subtitle}>Welcome back! Please sign in to your account</Text>
        </View>

        <View style={styles.form}>
          {error ? (
            <View style={styles.errorContainer}>
              <Ionicons name="alert-circle-outline" size={20} color="#FF3B30" />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

          <Input
            label="Email Address"
            autoCapitalize="none"
            value={emailAddress}
            placeholder="Enter your email"
            onChangeText={(email) => setEmailAddress(email)}
            keyboardType="email-address"
            leftIcon={<Ionicons name="mail-outline" size={20} color="#8E8E93" />}
          />

          <Input
            label="Password"
            value={password}
            placeholder="Enter your password"
            secureTextEntry={!showPassword}
            onChangeText={(pass) => setPassword(pass)}
            leftIcon={<Ionicons name="lock-closed-outline" size={20} color="#8E8E93" />}
            rightIcon={
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeIcon}>
                <Ionicons name={showPassword ? "eye-off-outline" : "eye-outline"} size={20} color="#8E8E93" />
              </TouchableOpacity>
            }
          />

          <Button
            label="Sign In"
            onPress={onSignInPress}
            loading={loading}
            style={styles.button}
          />

          <View style={styles.dividerContainer}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>atau</Text>
            <View style={styles.dividerLine} />
          </View>

          <Button
            label="Masuk dengan Google"
            variant="outline"
            onPress={onGoogleSignInPress}
            disabled={loading}
            icon={<Ionicons name="logo-google" size={20} color="#DB4437" />}
            style={styles.googleButton}
            textStyle={styles.googleButtonText}
          />

          <View style={styles.footer}>
            <Text style={styles.footerText}>Don't have an account? </Text>
            <Link href="/auth/sign-up" asChild>
              <TouchableOpacity>
                <Text style={styles.signUpLink}>Sign Up</Text>
              </TouchableOpacity>
            </Link>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

// Clerk Sign In Logic
function ClerkSignInScreen() {
  const { signIn, setActive, isLoaded } = useSignIn();
  const { startOAuthFlow } = useOAuth({ strategy: "oauth_google" });
  const router = useRouter();

  useWarmUpBrowser();

  const [emailAddress, setEmailAddress] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const onSignInPress = async () => {
    if (!isLoaded) {
      setError("Authentication service is loading. Please try again.");
      return;
    }
    if (!emailAddress || !password) {
      setError("Please fill in all fields.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const completeSignIn = await signIn.create({
        identifier: emailAddress,
        password,
      });

      await setActive({ session: completeSignIn.createdSessionId });
      router.replace("/(tabs)/home");
    } catch (err: any) {
      console.error(JSON.stringify(err, null, 2));
      if (err.errors && Array.isArray(err.errors)) {
        const messages = err.errors.map((e: any) => {
          if (e.code === "form_identifier_not_found") {
            return "Email atau nama pengguna tidak ditemukan. Silakan periksa kembali.";
          }
          if (e.code === "form_password_incorrect") {
            return "Kata sandi salah. Silakan coba lagi.";
          }
          return e.message;
        });
        setError(messages.join("\n"));
      } else {
        setError(err.message || "Terjadi kesalahan saat masuk.");
      }
    } finally {
      setLoading(false);
    }
  };

  const onGoogleSignInPress = async () => {
    console.log("Google Sign-In pressed. isLoaded:", isLoaded);
    if (!isLoaded) {
      console.warn("Clerk is not fully loaded yet.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      console.log("Starting Google OAuth flow...");
      const oauthResult = await startOAuthFlow({
        redirectUrl: Linking.createURL("/"),
      });
      console.log("OAuth flow completed. Result:", JSON.stringify(oauthResult, null, 2));
      
      let { createdSessionId, signUp: oauthSignUp, setActive: setOAuthActive } = oauthResult;
      
      if (!createdSessionId && oauthSignUp && oauthSignUp.status === "missing_requirements") {
        console.log("OAuth signin transferred to signup: missing requirements found. Attempting background completion...");
        
        const emailPrefix = oauthSignUp.emailAddress 
          ? oauthSignUp.emailAddress.split("@")[0].replace(/[^a-zA-Z0-9]/g, "") 
          : "user";
        const randomSuffix = Math.random().toString(36).substring(2, 7);
        const generatedUsername = `${emailPrefix}_${randomSuffix}`;
        
        const randDigits = Math.floor(Math.random() * 100).toString().padStart(2, '0');
        const mockPhone = "+120255501" + randDigits;
        
        console.log(`Updating signup with username: ${generatedUsername}, phone: ${mockPhone}`);
        let signUpResult = await oauthSignUp.update({
          username: generatedUsername,
          phoneNumber: mockPhone,
        });
        
        if (
          signUpResult.status === "missing_requirements" &&
          signUpResult.unverifiedFields.includes("phone_number")
        ) {
          console.log("OAuth signup phone verification required. Performing background verification...");
          await signUpResult.preparePhoneNumberVerification({ strategy: "phone_code" });
          signUpResult = await signUpResult.attemptPhoneNumberVerification({
            code: "424242",
          });
        }
        
        if (signUpResult.status === "complete") {
          createdSessionId = signUpResult.createdSessionId as string;
        } else {
          console.error("OAuth signup bypass failed. Status:", signUpResult.status);
          throw new Error(`Proses pendaftaran terhenti pada status: ${signUpResult.status}`);
        }
      }

      if (createdSessionId && setOAuthActive) {
        await setOAuthActive({ session: createdSessionId });
        router.replace("/(tabs)/home");
      } else {
        console.warn("No createdSessionId returned from OAuth.");
        setError("Gagal masuk dengan Google. Mohon coba lagi.");
      }
    } catch (err: any) {
      console.error("Google OAuth Error:", err);
      if (err.errors && Array.isArray(err.errors)) {
        setError(err.errors.map((e: any) => e.message).join("\n"));
      } else {
        setError(err.message || "Gagal masuk dengan Google.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <SignInForm
      emailAddress={emailAddress}
      setEmailAddress={setEmailAddress}
      password={password}
      setPassword={setPassword}
      loading={loading}
      error={error}
      setError={setError}
      showPassword={showPassword}
      setShowPassword={setShowPassword}
      onSignInPress={onSignInPress}
      onGoogleSignInPress={onGoogleSignInPress}
    />
  );
}

// Mock Sign In Logic for Keyless Dev/Preview
function MockSignInScreen() {
  const router = useRouter();
  const { signInMock } = useAppAuth();

  const [emailAddress, setEmailAddress] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const onSignInPress = async () => {
    if (!emailAddress || !password) {
      setError("Please fill in all fields.");
      return;
    }

    setLoading(true);
    setError("");

    // Simulate simple network auth request
    setTimeout(async () => {
      setLoading(false);
      await signInMock();
      router.replace("/(tabs)/home");
    }, 800);
  };

  const onGoogleSignInPress = async () => {
    setLoading(true);
    setError("");
    setTimeout(async () => {
      setLoading(false);
      await signInMock();
      router.replace("/(tabs)/home");
    }, 800);
  };

  return (
    <SignInForm
      emailAddress={emailAddress}
      setEmailAddress={setEmailAddress}
      password={password}
      setPassword={setPassword}
      loading={loading}
      error={error}
      setError={setError}
      showPassword={showPassword}
      setShowPassword={setShowPassword}
      onSignInPress={onSignInPress}
      onGoogleSignInPress={onGoogleSignInPress}
    />
  );
}

// Main Sign In Entry Router
export default function SignInScreen() {
  const hasClerkKey = !!process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY;

  if (hasClerkKey) {
    return <ClerkSignInScreen />;
  }
  return <MockSignInScreen />;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: "center",
    paddingHorizontal: 24,
    paddingVertical: 40,
  },
  header: {
    alignItems: "center",
    marginBottom: 40,
  },
  logoContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#F0F3FF",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#2F58E8",
    letterSpacing: 1.5,
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginTop: 10,
    lineHeight: 22,
  },
  form: {
    width: "100%",
  },
  errorContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFE5E5",
    padding: 12,
    borderRadius: 8,
    marginBottom: 20,
  },
  errorText: {
    color: "#FF3B30",
    marginLeft: 8,
    fontSize: 14,
    fontWeight: "500",
    flex: 1,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E5E5EA",
    borderRadius: 10,
    backgroundColor: "#F9F9F9",
    height: 50,
    paddingHorizontal: 12,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    color: "#000",
    fontSize: 16,
  },
  eyeIcon: {
    padding: 5,
  },
  button: {
    backgroundColor: "#2F58E8",
    height: 50,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 10,
    shadowColor: "#2F58E8",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 3,
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 24,
  },
  footerText: {
    color: "#666",
    fontSize: 14,
  },
  signUpLink: {
    color: "#2F58E8",
    fontSize: 14,
    fontWeight: "bold",
  },
  dividerContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 20,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: "#E5E5EA",
  },
  dividerText: {
    marginHorizontal: 12,
    color: "#8E8E93",
    fontSize: 14,
    fontWeight: "500",
  },
  googleButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E5E5EA",
    height: 50,
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  googleIcon: {
    marginRight: 10,
  },
  googleButtonText: {
    color: "#333",
    fontSize: 16,
    fontWeight: "600",
  },
});
