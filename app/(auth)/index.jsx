import { useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const { width, height } = Dimensions.get("window");
const slides = [
  { title: "Hey there!", subtitle: "Ready to take control of your day?" },
  { title: "Your Tasks", subtitle: "Organize daily goals in a breeze." },
  { title: "Mind & Journal", subtitle: "Capture thoughts and track mood." },
];

export default function Swiper() {
  const router = useRouter();
  const scrollX = useRef(new Animated.Value(0)).current;
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const listener = scrollX.addListener(({ value }) => {
      const index = Math.round(value / width);
      setCurrentIndex(index);
    });
    return () => scrollX.removeListener(listener);
  }, []);

  return (
    <View style={styles.container}>
      <Animated.ScrollView
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { x: scrollX } } }],
          { useNativeDriver: false }
        )}
      >
        {slides.map((slide, i) => (
          <View style={styles.slide} key={i}>
            <Text style={styles.title}>{slide.title}</Text>
            <Text style={styles.subtitle}>{slide.subtitle}</Text>
            {i === slides.length - 1 && (
              <TouchableOpacity
                style={styles.button}
                onPress={() => router.push("/signin")}
                activeOpacity={0.8}
              >
                <Text style={styles.buttonText}>Get Started</Text>
              </TouchableOpacity>
            )}
          </View>
        ))}
      </Animated.ScrollView>
      <View style={styles.indicatorContainer}>
        {slides.map((_, i) => (
          <View
            key={i}
            style={[
              styles.indicator,
              currentIndex === i && styles.activeIndicator,
            ]}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f2f2f2" },
  slide: {
    width,
    height,
    justifyContent: "center",
    alignItems: "center",
    padding: 30,
  },
  title: {
    fontSize: 30,
    fontWeight: "700",
    color: "#4cb8f2",
    marginBottom: 15,
  },
  subtitle: {
    fontSize: 18,
    color: "#333",
    textAlign: "center",
    lineHeight: 24,
    marginBottom: 40,
  },
  button: {
    backgroundColor: "#f2a365",
    paddingVertical: 16,
    paddingHorizontal: 50,
    borderRadius: 30,
    elevation: 3,
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
  },
  indicatorContainer: {
    position: "absolute",
    bottom: height * 0.1,
    flexDirection: "row",
    alignSelf: "center",
  },
  indicator: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#bbb",
    margin: 8,
  },
  activeIndicator: {
    backgroundColor: "#4cb8f2",
    width: 12,
    height: 12,
  },
});
