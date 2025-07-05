import { Slot, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, View } from "react-native";
import Toast from "react-native-toast-message";
import { supabase } from "./lib/supabase";

export const unstable_settings = {
  initialRouteName: "tabs",
  groups: {
    auth: "(auth)/*",
    tabs: "(tabs)/*",
  },
};

export default function RootLayout() {
  const router = useRouter();
  const [checkingSession, setCheckingSession] = useState(true);

  useEffect(() => {
    const checkSession = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        console.log("Supabase session on mount:", session);
        if (session) {
          // Already logged in, go to home
          router.replace("/(tabs)");
        }
      } catch (error) {
        console.error("Error checking session:", error);
        // Continue to auth screen even if there's an error
      } finally {
        setCheckingSession(false);
      }
    };
    checkSession();
  }, []);

  if (checkingSession) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#E41E5C" />
      </View>
    );
  }

  return (
    <>
      <Slot />
      <Toast />
    </>
  );
}
