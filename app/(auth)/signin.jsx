"use client";

import { useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Animated,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Defs, LinearGradient, Path, Stop, Svg } from "react-native-svg";
import { supabase } from "../lib/supabase";

const { width, height } = Dimensions.get("window");

// Feno SVG Component
const FenoLogo = ({ size = 80 }) => (
  <Svg width={size} height={size * 0.55} viewBox="0 0 89 49" fill="none">
    <Path
      d="M10.472 32.704C12.328 31.776 14.072 31.04 15.704 30.496C17.336 29.952 18.2 29.68 18.296 29.68C19.256 29.68 19.736 30.16 19.736 31.12C19.736 31.824 19.256 32.336 18.296 32.656C15.8 33.488 13.528 34.416 11.48 35.44C12.12 37.232 12.44 39.088 12.44 41.008C12.44 42.928 11.816 44.736 10.568 46.432C9.32 48.128 7.864 48.976 6.2 48.976C4.536 48.976 3.24 48.4 2.312 47.248C1.384 46.096 0.92 44.56 0.92 42.64C0.92 41.296 1.064 40.336 1.352 39.76C1.672 39.216 1.896 38.784 2.024 38.464C2.152 38.176 2.424 37.84 2.84 37.456C3.256 37.072 3.528 36.784 3.656 36.592C3.816 36.432 4.184 36.176 4.76 35.824C5.336 35.472 5.656 35.264 5.72 35.2C5.816 35.168 6.2 34.96 6.872 34.576L7.88 34C5.48 27.76 4.28 20.56 4.28 12.4C4.28 10.064 4.744 7.696 5.672 5.296C6.152 4.048 6.856 3.024 7.784 2.224C8.712 1.392 9.704 0.975999 10.76 0.975999C11.848 0.975999 12.76 1.264 13.496 1.84C14.2 2.384 14.744 3.088 15.128 3.952C15.896 5.712 16.28 7.296 16.28 8.704C16.28 10.112 16.104 11.36 15.752 12.448C15.4 13.536 14.968 14.368 14.456 14.944C13.432 16.128 12.6 16.72 11.96 16.72C11 16.72 10.52 16.24 10.52 15.28C10.52 14.992 10.664 14.704 10.952 14.416C11.272 14.096 11.608 13.776 11.96 13.456C12.312 13.136 12.632 12.576 12.92 11.776C13.24 10.944 13.4 10 13.4 8.944C13.4 7.888 13.144 6.784 12.632 5.632C12.152 4.448 11.608 3.856 11 3.856C9.912 3.856 9 4.8 8.264 6.688C7.528 8.544 7.16 10.448 7.16 12.4C7.16 20.208 8.264 26.976 10.472 32.704ZM6.056 46.096C6.984 46.096 7.8 45.504 8.504 44.32C9.208 43.136 9.56 41.92 9.56 40.672C9.56 39.424 9.336 38.128 8.888 36.784L8.12 37.168C7.672 37.392 7.352 37.568 7.16 37.696C6.968 37.824 6.648 38.016 6.2 38.272C5.784 38.528 5.464 38.784 5.24 39.04C5.048 39.328 4.824 39.648 4.568 40C4.056 40.64 3.8 41.52 3.8 42.64C3.8 44.944 4.552 46.096 6.056 46.096ZM21.3867 31.216C21.3548 31.216 21.1148 31.344 20.6668 31.6C19.5148 32.24 18.6668 32.56 18.1227 32.56C17.1627 32.56 16.6827 32.08 16.6827 31.12C16.6827 30.512 17.1627 30.016 18.1227 29.632C18.2827 29.568 18.6668 29.376 19.2748 29.056C19.8828 28.736 20.2348 28.544 20.3308 28.48C20.2028 28.192 20.1388 27.76 20.1388 27.184C20.1388 24.304 21.1468 21.84 23.1628 19.792C25.1788 17.744 27.0188 16.72 28.6828 16.72C30.3468 16.72 31.6588 17.12 32.6188 17.92C33.5788 18.688 34.0588 19.632 34.0588 20.752C34.0588 21.84 33.8028 22.784 33.2908 23.584C32.7788 24.384 31.9788 25.168 30.8907 25.936C29.3868 27.024 27.1948 28.288 24.3148 29.728C25.5948 30.656 27.3708 31.12 29.6428 31.12C31.9148 31.12 34.1548 30.752 36.3628 30.016C37.0348 29.792 37.4188 29.68 37.5148 29.68C38.4748 29.68 38.9548 30.16 38.9548 31.12C38.9548 31.824 38.4748 32.336 37.5148 32.656C34.8268 33.552 32.2348 34 29.7388 34C26.1868 34 23.4028 33.072 21.3867 31.216ZM23.0188 27.184C28.4588 24.464 31.1788 22.416 31.1788 21.04C31.1788 20.08 30.3788 19.6 28.7788 19.6C27.8188 19.6 26.6188 20.368 25.1788 21.904C23.7388 23.408 23.0188 25.168 23.0188 27.184ZM73.9175 24.4L73.4375 26.848C73.4375 28.096 73.9655 29.12 75.0215 29.92C76.1095 30.72 77.4055 31.12 78.9095 31.12C80.4455 31.12 81.9975 30.608 83.5655 29.584C85.1335 28.528 85.9175 27.232 85.9175 25.696C85.9175 24.16 85.3895 22.928 84.3335 22C83.2775 21.04 82.0455 20.56 80.6375 20.56C79.8695 20.56 79.0855 20.8 78.2855 21.28C77.5175 21.76 77.0215 22 76.7975 22C75.8375 22 75.3575 21.52 75.3575 20.56C75.3575 19.952 75.9015 19.328 76.9895 18.688C78.1095 18.016 79.3255 17.68 80.6375 17.68C82.8455 17.68 84.7495 18.432 86.3495 19.936C87.9815 21.44 88.7975 23.376 88.7975 25.744C88.7975 28.112 87.7415 30.08 85.6295 31.648C83.5495 33.216 81.3895 34 79.1495 34C76.9095 34 75.0055 33.44 73.4375 32.32C71.9015 31.2 70.9735 29.792 70.6535 28.096C69.1175 29.472 67.3255 30.16 65.2775 30.16C64.0935 30.16 63.1015 29.664 62.3015 28.672C61.5335 27.68 61.0055 26.576 60.7175 25.36C60.4615 24.144 60.1895 23.04 59.9015 22.048C59.6455 21.056 59.3575 20.56 59.0375 20.56C58.7815 20.56 58.5735 20.704 58.4135 20.992C58.2535 21.28 58.1255 21.52 58.0295 21.712C57.9655 21.904 57.8855 22.176 57.7895 22.528C57.7255 22.848 57.6615 23.136 57.5975 23.392C57.5335 23.616 57.4535 23.952 57.3575 24.4C56.6855 27.44 55.8375 29.408 54.8135 30.304C53.8215 31.168 52.8295 31.6 51.8375 31.6C50.3335 31.6 49.2295 30.944 48.5255 29.632C47.8535 28.288 47.5175 26.544 47.5175 24.4C47.5175 21.2 47.0375 19.6 46.0775 19.6C45.3095 19.6 44.3975 20.944 43.3415 23.632C42.2855 26.32 41.7575 28.816 41.7575 31.12C41.7575 31.536 41.6135 31.888 41.3255 32.176C41.0695 32.432 40.7335 32.56 40.3175 32.56C39.3575 32.56 38.8775 32.08 38.8775 31.12C38.8775 29.104 39.1975 26.992 39.8375 24.784C40.5095 22.576 41.4055 20.688 42.5255 19.12C43.6775 17.52 44.8615 16.72 46.0775 16.72C48.9575 16.72 50.3975 19.28 50.3975 24.4C50.3975 27.28 50.8775 28.72 51.8375 28.72C52.7975 28.72 53.6295 27.328 54.3335 24.544C55.0375 21.76 55.6135 20 56.0615 19.264C56.7335 18.208 57.6615 17.68 58.8455 17.68C60.0615 17.68 61.0055 18.176 61.6775 19.168C62.3495 20.16 62.7815 21.264 62.9735 22.48C63.5175 25.68 64.2855 27.28 65.2775 27.28C66.5575 27.28 67.6935 26.832 68.6855 25.936L71.5175 23.392C71.8695 23.104 72.1895 22.96 72.4775 22.96C73.4375 22.96 73.9175 23.44 73.9175 24.4Z"
      fill="url(#paint0_linear_35_3)"
    />
    <Defs>
      <LinearGradient
        id="paint0_linear_35_3"
        x1="76.4865"
        y1="5.28571"
        x2="70.865"
        y2="52.0114"
        gradientUnits="userSpaceOnUse"
      >
        <Stop stopColor="#E41E5C" />
        <Stop offset="1" stopColor="#FEA68A" />
      </LinearGradient>
    </Defs>
  </Svg>
);

export default function AuthScreen() {
  const [mode, setMode] = useState("signin"); // 'signin' or 'signup'
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const particleAnim = useRef(new Animated.Value(0)).current;
  const modeTransition = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Check if user is already signed in
    const checkUser = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (session) {
        console.log("✅ User already signed in, going to home");
        router.replace("/(tabs)");
      }
    };

    checkUser();

    // Entrance animations
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();

    // Continuous particle animation
    Animated.loop(
      Animated.timing(particleAnim, {
        toValue: 1,
        duration: 15000,
        useNativeDriver: true,
      })
    ).start();
  }, [router]);

  useEffect(() => {
    // Mode transition animation
    Animated.timing(modeTransition, {
      toValue: mode === "signin" ? 0 : 1,
      duration: 300,
      useNativeDriver: false,
    }).start();
  }, [mode]);

  const handleAuth = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    setLoading(true);

    try {
      let result;
      if (mode === "signin") {
        console.log("🔐 Attempting sign in...");
        result = await supabase.auth.signInWithPassword({ email, password });
      } else {
        console.log("📝 Attempting sign up...");
        result = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: "feno://login-callback",
            data: {
              email_confirmed: true,
            },
          },
        });
      }

      if (result.error) {
        console.error("Auth error:", result.error);
        // Handle email confirmation error as success for signup
        if (
          mode === "signup" &&
          result.error.message === "Email not confirmed"
        ) {
          console.log(
            "✅ Signup successful (email confirmation required but disabled)"
          );
          Alert.alert(
            "Success",
            "Account created! Please check your email to confirm, or try signing in directly."
          );
          setMode("signin"); // Switch to signin mode
          setLoading(false);
          return;
        }
        Alert.alert("Error", result.error.message);
        setLoading(false);
        return;
      }

      if (result.data?.user) {
        console.log("✅ Auth successful, user:", result.data.user.email);
        Alert.alert(
          "Success",
          `${mode === "signin" ? "Signed in" : "Signed up"} successfully!`
        );
        router.replace("/(tabs)");
      } else {
        console.log("❌ No user data returned");
        Alert.alert("Error", "Authentication failed");
      }
    } catch (error) {
      console.error("Auth exception:", error);
      Alert.alert("Error", "Something went wrong: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor="transparent"
        translucent
      />

      {/* Background Particles */}
      <View style={styles.particleContainer}>
        {[...Array(6)].map((_, i) => (
          <Animated.View
            key={i}
            style={[
              styles.particle,
              {
                left: `${15 + i * 15}%`,
                top: `${10 + (i % 3) * 30}%`,
                transform: [
                  {
                    translateY: particleAnim.interpolate({
                      inputRange: [0, 0.5, 1],
                      outputRange: [0, -30 - i * 4, 0],
                    }),
                  },
                  {
                    rotate: particleAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: ["0deg", `${360 + i * 45}deg`],
                    }),
                  },
                ],
                opacity: particleAnim.interpolate({
                  inputRange: [0, 0.5, 1],
                  outputRange: [0.08, 0.15, 0.08],
                }),
              },
            ]}
          />
        ))}
      </View>

      <KeyboardAvoidingView
        style={styles.keyboardContainer}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <Animated.View
          style={[
            styles.contentContainer,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          {/* Welcome Section */}
          <View style={styles.welcomeSection}>
            <View style={styles.iconContainer}>
              <FenoLogo size={80} />
            </View>
            <Animated.Text
              style={[
                styles.header,
                // {
                //   color: modeTransition.interpolate({
                //     inputRange: [0, 1],
                //     outputRange: ["#8B7355", "#6B5B47"],
                //   }),
                // },
              ]}
            >
              {mode === "signin" ? "Welcome back" : "Little about yourself"}
            </Animated.Text>
            <Text style={styles.subtitle}>
              {mode === "signin"
                ? "Your mindful space awaits you"
                : "So we can keep things secure"}
            </Text>
          </View>

          {/* Form Section */}
          <View style={styles.formSection}>
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Email</Text>
              <TextInput
                placeholder="Enter your email"
                placeholderTextColor="#A0958B"
                autoCapitalize="none"
                keyboardType="email-address"
                style={styles.input}
                value={email}
                onChangeText={setEmail}
                editable={!loading}
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Password</Text>
              <TextInput
                placeholder="Enter your password"
                placeholderTextColor="#A0958B"
                secureTextEntry
                style={styles.input}
                value={password}
                onChangeText={setPassword}
                editable={!loading}
              />
            </View>

            <TouchableOpacity
              style={[styles.button, loading && styles.buttonDisabled]}
              onPress={handleAuth}
              disabled={loading}
              activeOpacity={0.8}
            >
              {loading ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <Text style={styles.buttonText}>
                  {mode === "signin" ? "Continue Home" : "Create Account"}
                </Text>
              )}
              <View style={styles.buttonGlow} />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setMode(mode === "signin" ? "signup" : "signin")}
              disabled={loading}
              style={styles.toggleContainer}
            >
              <Text style={styles.toggleText}>
                {mode === "signin"
                  ? "New to mindful living? "
                  : "Already have an account? "}
                <Text style={styles.toggleLink}>
                  {mode === "signin" ? "Create Account" : "Sign In"}
                </Text>
              </Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FEFDFB",
  },
  particleContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    pointerEvents: "none",
  },
  particle: {
    position: "absolute",
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#D4C4B0",
  },
  keyboardContainer: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 32,
    paddingTop: Platform.OS === "ios" ? 60 : 40,
  },
  contentContainer: {
    alignItems: "center",
  },
  welcomeSection: {
    alignItems: "center",
    marginBottom: 50,
  },
  iconContainer: {
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
  },
  header: {
    fontSize: 30,
    // fontWeight: "800",
    marginBottom: 12,
    textAlign: "center",
    letterSpacing: -0.5,
    fontFamily: "Sora-Bold",
    color: "#3c3b3b",
  },
  subtitle: {
    fontSize: 16,
    color: "#8B7355",
    textAlign: "center",
    fontFamily: "Ubuntu-Regular",
    lineHeight: 22,
  },
  formSection: {
    width: "100%",
    maxWidth: 340,
  },
  inputContainer: {
    marginBottom: 24,
    fontFamily: "Ubuntu-Regular",
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#6B5B47",
    marginBottom: 8,
    marginLeft: 4,
    fontFamily: "Ubuntu-Regular",
  },
  input: {
    height: 56,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    paddingHorizontal: 20,
    fontSize: 16,
    color: "#3D2914",
    borderWidth: 2,
    borderColor: "#E8DDD1",
    shadowColor: "#8B7355",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    fontFamily: "Ubuntu-Regular",
  },
  button: {
    backgroundColor: "#8B7355",
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 32,
    shadowColor: "#8B7355",
    shadowOffset: {
      width: 0,
      height: 12,
    },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 12,
    position: "relative",
    overflow: "hidden",
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontFamily: "Sora-Bold",
    letterSpacing: 0.5,
  },
  buttonGlow: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    borderRadius: 28,
  },
  buttonDisabled: {
    backgroundColor: "#C4B5A0",
    shadowOpacity: 0.1,
  },
  toggleContainer: {
    alignItems: "center",
    paddingVertical: 8,
  },
  toggleText: {
    fontSize: 15,
    color: "#8B7355",
    fontFamily: "Ubuntu-Regular",
    textAlign: "center",
  },
  toggleLink: {
    // fontWeight: "600",
    color: "#6B5B47",
    fontFamily: "Sora-Bold",
  },
});
