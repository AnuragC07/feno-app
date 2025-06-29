import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
} from "react-native";
import { supabase } from "../lib/supabase";

export default function AuthScreen() {
  const [mode, setMode] = useState("signin"); // 'signin' or 'signup'
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

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
  }, [router]);

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
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <Text style={styles.header}>
        {mode === "signin" ? "Welcome Back 👋" : "Create Account"}
      </Text>

      <TextInput
        placeholder="Email"
        autoCapitalize="none"
        keyboardType="email-address"
        style={styles.input}
        value={email}
        onChangeText={setEmail}
        editable={!loading}
      />

      <TextInput
        placeholder="Password"
        secureTextEntry
        style={styles.input}
        value={password}
        onChangeText={setPassword}
        editable={!loading}
      />

      <TouchableOpacity
        style={[styles.button, loading && styles.buttonDisabled]}
        onPress={handleAuth}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" size="small" />
        ) : (
          <Text style={styles.buttonText}>
            {mode === "signin" ? "Sign In" : "Sign Up"}
          </Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => setMode(mode === "signin" ? "signup" : "signin")}
        disabled={loading}
      >
        <Text style={styles.toggleText}>
          {mode === "signin"
            ? "Don't have an account? Sign up"
            : "Already have an account? Sign in"}
        </Text>
      </TouchableOpacity>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 24,
    backgroundColor: "#fff",
  },
  header: {
    fontSize: 28,
    fontWeight: "700",
    marginBottom: 24,
    textAlign: "center",
    color: "#4cb8f2",
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    paddingHorizontal: 16,
    marginBottom: 16,
    fontSize: 16,
  },
  button: {
    backgroundColor: "#4cb8f2",
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 16,
  },
  buttonText: { color: "#fff", fontSize: 16, fontWeight: "600" },
  toggleText: {
    fontSize: 15,
    color: "#666",
    textAlign: "center",
    textDecorationLine: "underline",
  },
  buttonDisabled: {
    backgroundColor: "#ccc",
  },
});
