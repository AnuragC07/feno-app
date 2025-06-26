import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import React, { useEffect, useRef } from "react";
import { Animated, StyleSheet } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";

export default function Layout() {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const opacityAnim = useRef(new Animated.Value(0.7)).current;

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

  const TabIcon = ({ name, color, focused, size = 30 }) => {
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

    return (
      <Animated.View
        style={[
          styles.iconContainer,
          focused && styles.activeIconContainer, // 🔥 Adds black background when active
          {
            transform: [{ scale: iconScale }],
            opacity: iconOpacity,
          },
        ]}
      >
        <Ionicons
          name={name}
          size={size}
          color={focused ? "#fff" : color}
          style={styles.icon}
        />
      </Animated.View>
    );
  };

  return (
    <GestureHandlerRootView style={styles.container}>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarShowLabel: false, // 🔥 Hide labels
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
  tabBar: {
    position: "absolute",
    bottom: 25,
    marginHorizontal: 20, // Gives spacing from screen edges
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
    backgroundColor: "#000", // 🔥 Active icon circle background color
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
});
