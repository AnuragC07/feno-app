import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

import { Redirect, Tabs } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { Animated, StyleSheet } from "react-native";
import { supabase } from "../lib/supabase";

import { GestureHandlerRootView } from "react-native-gesture-handler";

export default function TabLayout() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  // Move all hooks to the top before any conditional returns
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const opacityAnim = useRef(new Animated.Value(0.7)).current;

  useEffect(() => {
    // Check current session
    const getSession = async () => {
      const { data, error } = await supabase.auth.getSession();
      setSession(data.session);
      setLoading(false);
    };

    getSession();

    // Listen to auth changes
    const { data: authListener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
      }
    );

    return () => {
      authListener.subscription?.unsubscribe();
    };
  }, []);

  if (loading) return null;

  if (!session) {
    return <Redirect href="/signin" />;
  }

  const animateTab = (focused) => {
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: focused ? 1.2 : 1,
        useNativeDriver: true,
        tension: 150,
        friction: 8,
      }),
      Animated.timing(opacityAnim, {
        toValue: focused ? 1 : 0.7,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const TabIcon = ({
    name,
    color,
    focused,
    size = 30,
    iconSet = Ionicons,
    gradient = false,
  }) => {
    const iconScale = useRef(new Animated.Value(1)).current;
    const iconOpacity = useRef(new Animated.Value(0.7)).current;

    useEffect(() => {
      Animated.parallel([
        Animated.spring(iconScale, {
          toValue: focused ? 1.15 : 1,
          useNativeDriver: true,
          tension: 120,
          friction: 7,
        }),
        Animated.timing(iconOpacity, {
          toValue: focused ? 1 : 0.7,
          duration: 150,
          useNativeDriver: true,
        }),
      ]).start();
    }, [focused]);

    const iconElement =
      iconSet === Ionicons ? (
        <Ionicons
          name={name}
          size={size}
          color={focused ? "#fff" : color}
          style={styles.icon}
        />
      ) : (
        <MaterialCommunityIcons
          name={name}
          size={size}
          color={focused ? "#fff" : color}
          style={styles.icon}
        />
      );

    if (gradient && focused) {
      return (
        <Animated.View
          style={[
            styles.iconContainer,
            { transform: [{ scale: iconScale }], opacity: iconOpacity },
          ]}
        >
          <LinearGradient
            colors={["#ff6fcb", "#ffb6ea"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.gradientBackground}
          >
            {iconElement}
          </LinearGradient>
        </Animated.View>
      );
    }

    return (
      <Animated.View
        style={[
          styles.iconContainer,
          focused && styles.activeIconContainer,
          { transform: [{ scale: iconScale }], opacity: iconOpacity },
        ]}
      >
        {iconElement}
      </Animated.View>
    );
  };

  return (
    <GestureHandlerRootView style={styles.container}>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarShowLabel: false,
          tabBarStyle: styles.tabBar,
          tabBarItemStyle: styles.tabBarItem,
          tabBarBackground: () => (
            <Animated.View style={styles.tabBarBackground} />
          ),
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: "Home",
            tabBarIcon: ({ color, focused }) => (
              <TabIcon
                name={focused ? "home" : "home-outline"}
                color={color}
                focused={focused}
                size={28}
              />
            ),
          }}
        />
        <Tabs.Screen
          name="sanctuary"
          options={{
            title: "Sanctuary",
            tabBarIcon: ({ color, focused }) => (
              <TabIcon
                name="brain"
                color={color}
                focused={focused}
                size={28}
                iconSet={MaterialCommunityIcons}
                gradient={true}
              />
            ),
          }}
        />

        <Tabs.Screen
          name="analytics"
          options={{
            title: "Analytics",
            tabBarIcon: ({ color, focused }) => (
              <TabIcon
                name={focused ? "stats-chart" : "stats-chart-outline"}
                color={color}
                focused={focused}
                size={28}
              />
            ),
          }}
        />

        <Tabs.Screen
          name="you"
          options={{
            title: "You",
            tabBarIcon: ({ color, focused }) => (
              <TabIcon
                name={focused ? "person" : "person-outline"}
                color={color}
                focused={focused}
                size={28}
              />
            ),
          }}
        />
      </Tabs>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  tabBar: {
    position: "absolute",
    bottom: 25,
    marginHorizontal: 20,
    height: 70,
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    borderRadius: 25,
    elevation: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    paddingBottom: 8,
    paddingTop: 8,
    paddingHorizontal: 10,
  },
  tabBarBackground: {
    flex: 1,
    borderRadius: 25,
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    shadowColor: "#916354",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 15,
    elevation: 15,
    overflow: "hidden",
  },
  tabBarItem: {
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 5,
    marginHorizontal: 5,
    borderRadius: 20,
    flex: 1,
  },
  iconContainer: {
    alignItems: "center",
    justifyContent: "center",
    width: 48,
    height: 48,
    borderRadius: 24,
    position: "relative",
    marginBottom: 2,
  },
  activeIconContainer: {
    backgroundColor: "#000",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  icon: {
    textShadowColor: "rgba(0, 0, 0, 0.1)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  gradientBackground: {
    flex: 1,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    width: 48,
    height: 48,
  },
});
