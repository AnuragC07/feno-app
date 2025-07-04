"use client";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import Ionicons from "@expo/vector-icons/Ionicons";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { LinearGradient } from "expo-linear-gradient";
import { useEffect, useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  Modal,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SvgXml } from "react-native-svg";
import { useTimer } from "react-timer-hook";
import { supabase } from "../lib/supabase";

const { width, height } = Dimensions.get("window");

// Enhanced color palette
const colors = {
  primary: {
    50: "#f0f9ff",
    100: "#e0f2fe",
    200: "#bae6fd",
    300: "#7dd3fc",
    400: "#38bdf8",
    500: "#0ea5e9",
    600: "#0284c7",
    700: "#0369a1",
    800: "#075985",
    900: "#0c4a6e",
  },
  secondary: {
    50: "#fdf4ff",
    100: "#fae8ff",
    200: "#f5d0fe",
    300: "#f0abfc",
    400: "#e879f9",
    500: "#d946ef",
    600: "#c026d3",
    700: "#a21caf",
    800: "#86198f",
    900: "#701a75",
  },
  success: {
    50: "#f0fdf4",
    100: "#dcfce7",
    200: "#bbf7d0",
    300: "#86efac",
    400: "#4ade80",
    500: "#22c55e",
    600: "#16a34a",
    700: "#15803d",
    800: "#166534",
    900: "#14532d",
  },
  warning: {
    50: "#fffbeb",
    100: "#fef3c7",
    200: "#fde68a",
    300: "#fcd34d",
    400: "#fbbf24",
    500: "#f59e0b",
    600: "#d97706",
    700: "#b45309",
    800: "#92400e",
    900: "#78350f",
  },
  error: {
    50: "#fef2f2",
    100: "#fee2e2",
    200: "#fecaca",
    300: "#fca5a5",
    400: "#f87171",
    500: "#ef4444",
    600: "#dc2626",
    700: "#b91c1c",
    800: "#991b1b",
    900: "#7f1d1d",
  },
  neutral: {
    50: "#fafafa",
    100: "#f5f5f5",
    200: "#e5e5e5",
    300: "#d4d4d4",
    400: "#a3a3a3",
    500: "#737373",
    600: "#525252",
    700: "#404040",
    800: "#262626",
    900: "#171717",
  },
  gradient: {
    wellness: ["#f0f9ff", "#e0f2fe", "#fdf4ff"],
    calm: ["#f0fdf4", "#dcfce7", "#f0f9ff"],
    energy: ["#fef3c7", "#fde68a", "#fee2e2"],
    focus: ["#e0f2fe", "#f0abfc", "#fae8ff"],
  },
};

// Typography system
const typography = {
  fontFamily: {
    primary: "System", // Using system font for better compatibility
    secondary: "System",
  },
  fontSize: {
    xs: 12,
    sm: 14,
    base: 16,
    lg: 18,
    xl: 20,
    "2xl": 24,
    "3xl": 30,
    "4xl": 36,
  },
  fontWeight: {
    normal: "400",
    medium: "500",
    semibold: "600",
    bold: "700",
  },
  lineHeight: {
    tight: 1.25,
    normal: 1.5,
    relaxed: 1.75,
  },
};

// Spacing system
const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  "2xl": 48,
  "3xl": 64,
};

// Feno SVG logo as XML
const fenoLogoXml = `<svg width="89" height="49" viewBox="0 0 89 49" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M10.472 32.704C12.328 31.776 14.072 31.04 15.704 30.496C17.336 29.952 18.2 29.68 18.296 29.68C19.256 29.68 19.736 30.16 19.736 31.12C19.736 31.824 19.256 32.336 18.296 32.656C15.8 33.488 13.528 34.416 11.48 35.44C12.12 37.232 12.44 39.088 12.44 41.008C12.44 42.928 11.816 44.736 10.568 46.432C9.32 48.128 7.864 48.976 6.2 48.976C4.536 48.976 3.24 48.4 2.312 47.248C1.384 46.096 0.92 44.56 0.92 42.64C0.92 41.296 1.064 40.336 1.352 39.76C1.672 39.216 1.896 38.784 2.024 38.464C2.152 38.176 2.424 37.84 2.84 37.456C3.256 37.072 3.528 36.784 3.656 36.592C3.816 36.432 4.184 36.176 4.76 35.824C5.336 35.472 5.656 35.264 5.72 35.2C5.816 35.168 6.2 34.96 6.872 34.576L7.88 34C5.48 27.76 4.28 20.56 4.28 12.4C4.28 10.064 4.744 7.696 5.672 5.296C6.152 4.048 6.856 3.024 7.784 2.224C8.712 1.392 9.704 0.975999 10.76 0.975999C11.848 0.975999 12.76 1.264 13.496 1.84C14.2 2.384 14.744 3.088 15.128 3.952C15.896 5.712 16.28 7.296 16.28 8.704C16.28 10.112 16.104 11.36 15.752 12.448C15.4 13.536 14.968 14.368 14.456 14.944C13.432 16.128 12.6 16.72 11.96 16.72C11 16.72 10.52 16.24 10.52 15.28C10.52 14.992 10.664 14.704 10.952 14.416C11.272 14.096 11.608 13.776 11.96 13.456C12.312 13.136 12.632 12.576 12.92 11.776C13.24 10.944 13.4 10 13.4 8.944C13.4 7.888 13.144 6.784 12.632 5.632C12.152 4.448 11.608 3.856 11 3.856C9.912 3.856 9 4.8 8.264 6.688C7.528 8.544 7.16 10.448 7.16 12.4C7.16 20.208 8.264 26.976 10.472 32.704ZM6.056 46.096C6.984 46.096 7.8 45.504 8.504 44.32C9.208 43.136 9.56 41.92 9.56 40.672C9.56 39.424 9.336 38.128 8.888 36.784L8.12 37.168C7.672 37.392 7.352 37.568 7.16 37.696C6.968 37.824 6.648 38.016 6.2 38.272C5.784 38.528 5.464 38.784 5.24 39.04C5.048 39.328 4.824 39.648 4.568 40C4.056 40.64 3.8 41.52 3.8 42.64C3.8 44.944 4.552 46.096 6.056 46.096ZM21.3867 31.216C21.3548 31.216 21.1148 31.344 20.6668 31.6C19.5148 32.24 18.6668 32.56 18.1227 32.56C17.1627 32.56 16.6827 32.08 16.6827 31.12C16.6827 30.512 17.1627 30.016 18.1227 29.632C18.2827 29.568 18.6668 29.376 19.2748 29.056C19.8828 28.736 20.2348 28.544 20.3308 28.48C20.2028 28.192 20.1388 27.76 20.1388 27.184C20.1388 24.304 21.1468 21.84 23.1628 19.792C25.1788 17.744 27.0188 16.72 28.6828 16.72C30.3468 16.72 31.6588 17.12 32.6188 17.92C33.5788 18.688 34.0588 19.632 34.0588 20.752C34.0588 21.84 33.8028 22.784 33.2908 23.584C32.7788 24.384 31.9788 25.168 30.8907 25.936C29.3868 27.024 27.1948 28.288 24.3148 29.728C25.5948 30.656 27.3708 31.12 29.6428 31.12C31.9148 31.12 34.1548 30.752 36.3628 30.016C37.0348 29.792 37.4188 29.68 37.5148 29.68C38.4748 29.68 38.9548 30.16 38.9548 31.12C38.9548 31.824 38.4748 32.336 37.5148 32.656C34.8268 33.552 32.2348 34 29.7388 34C26.1868 34 23.4028 33.072 21.3867 31.216ZM23.0188 27.184C28.4588 24.464 31.1788 22.416 31.1788 21.04C31.1788 20.08 30.3788 19.6 28.7788 19.6C27.8188 19.6 26.6188 20.368 25.1788 21.904C23.7388 23.408 23.0188 25.168 23.0188 27.184ZM73.9175 24.4L73.4375 26.848C73.4375 28.096 73.9655 29.12 75.0215 29.92C76.1095 30.72 77.4055 31.12 78.9095 31.12C80.4455 31.12 81.9975 30.608 83.5655 29.584C85.1335 28.528 85.9175 27.232 85.9175 25.696C85.9175 24.16 85.3895 22.928 84.3335 22C83.2775 21.04 82.0455 20.56 80.6375 20.56C79.8695 20.56 79.0855 20.8 78.2855 21.28C77.5175 21.76 77.0215 22 76.7975 22C75.8375 22 75.3575 21.52 75.3575 20.56C75.3575 19.952 75.9015 19.328 76.9895 18.688C78.1095 18.016 79.3255 17.68 80.6375 17.68C82.8455 17.68 84.7495 18.432 86.3495 19.936C87.9815 21.44 88.7975 23.376 88.7975 25.744C88.7975 28.112 87.7415 30.08 85.6295 31.648C83.5495 33.216 81.3895 34 79.1495 34C76.9095 34 75.0055 33.44 73.4375 32.32C71.9015 31.2 70.9735 29.792 70.6535 28.096C69.1175 29.472 67.3255 30.16 65.2775 30.16C64.0935 30.16 63.1015 29.664 62.3015 28.672C61.5335 27.68 61.0055 26.576 60.7175 25.36C60.4615 24.144 60.1895 23.04 59.9015 22.048C59.6455 21.056 59.3575 20.56 59.0375 20.56C58.7815 20.56 58.5735 20.704 58.4135 20.992C58.2535 21.28 58.1255 21.52 58.0295 21.712C57.9655 21.904 57.8855 22.176 57.7895 22.528C57.7255 22.848 57.6615 23.136 57.5975 23.392C57.5335 23.616 57.4535 23.952 57.3575 24.4C56.6855 27.44 55.8375 29.408 54.8135 30.304C53.8215 31.168 52.8295 31.6 51.8375 31.6C50.3335 31.6 49.2295 30.944 48.5255 29.632C47.8535 28.288 47.5175 26.544 47.5175 24.4C47.5175 21.2 47.0375 19.6 46.0775 19.6C45.3095 19.6 44.3975 20.944 43.3415 23.632C42.2855 26.32 41.7575 28.816 41.7575 31.12C41.7575 31.536 41.6135 31.888 41.3255 32.176C41.0695 32.432 40.7335 32.56 40.3175 32.56C39.3575 32.56 38.8775 32.08 38.8775 31.12C38.8775 29.104 39.1975 26.992 39.8375 24.784C40.5095 22.576 41.4055 20.688 42.5255 19.12C43.6775 17.52 44.8615 16.72 46.0775 16.72C48.9575 16.72 50.3975 19.28 50.3975 24.4C50.3975 27.28 50.8775 28.72 51.8375 28.72C52.7975 28.72 53.6295 27.328 54.3335 24.544C55.0375 21.76 55.6135 20 56.0615 19.264C56.7335 18.208 57.6615 17.68 58.8455 17.68C60.0615 17.68 61.0055 18.176 61.6775 19.168C62.3495 20.16 62.7815 21.264 62.9735 22.48C63.5175 25.68 64.2855 27.28 65.2775 27.28C66.5575 27.28 67.6935 26.832 68.6855 25.936L71.5175 23.392C71.8695 23.104 72.1895 22.96 72.4775 22.96C73.4375 22.96 73.9175 23.44 73.9175 24.4Z" fill="url(#paint0_linear_35_3)"/><defs><linearGradient id="paint0_linear_35_3" x1="76.4865" y1="5.28571" x2="70.865" y2="52.0114" gradientUnits="userSpaceOnUse"><stop stopColor="#E41E5C"/><stop offset="1" stopColor="#FEA68A"/></linearGradient></defs></svg>`;

const WellBeingSanctuary = () => {
  const [breathingAnimation] = useState(new Animated.Value(1));
  const [waveAnimation] = useState(new Animated.Value(0));
  const [modalVisible, setModalVisible] = useState(false);
  const [breathingModalAnimation] = useState(new Animated.Value(1));
  const [colorAnimation] = useState(new Animated.Value(0));
  const [breathingPhase, setBreathingPhase] = useState("inhale");
  const [isBreathing, setIsBreathing] = useState(false);
  const [isSessionComplete, setIsSessionComplete] = useState(false);
  const [displayText, setDisplayText] = useState("");
  const phaseTimeoutRef = useRef(null);
  const [sessionInterval, setSessionInterval] = useState(null);
  const [currentMood, setCurrentMood] = useState("stressful");
  const [chatModalVisible, setChatModalVisible] = useState(false);
  const [chatMessages, setChatMessages] = useState([]);
  const [selectedSample, setSelectedSample] = useState(null);
  const [meditationStarted, setMeditationStarted] = useState(false);
  const [user, setUser] = useState(null);
  const [mood, setMood] = useState(null);
  const [loadingMood, setLoadingMood] = useState(true);
  const [duration, setDuration] = useState(5);
  const [timer, setTimer] = useState(duration * 60);
  const [sessionStart, setSessionStart] = useState(null);
  const [revealed, setRevealed] = useState(false);
  const [quoteIdx, setQuoteIdx] = useState(null);
  const [revealCount, setRevealCount] = useState(0);
  const [animDone, setAnimDone] = useState(false);
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const { seconds, minutes, isRunning, start, pause, restart } = useTimer({
    expiryTimestamp: sessionStart || new Date(),
    autoStart: false,
    onExpire: () => {},
  });

  const revealQuote = () => {
    if (revealCount >= 2) return;
    const idx = Math.floor(Math.random() * QUOTES.length);
    setQuoteIdx(idx);
    setRevealed(true);
    setRevealCount((c) => c + 1);

    scaleAnim.setValue(0.95);
    fadeAnim.setValue(0);
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 100,
        friction: 8,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start(() => setAnimDone(true));
  };

  const showAnother = () => {
    setAnimDone(false);
    setRevealed(false);
    setTimeout(revealQuote, 300);
  };

  const Sparkle = () =>
    animDone ? (
      <Animated.Text
        style={[
          styles.sparkle,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        ✨
      </Animated.Text>
    ) : null;

  const [particleAnimations] = useState([
    new Animated.Value(0),
    new Animated.Value(0),
    new Animated.Value(0),
    new Animated.Value(0),
  ]);

  const affirmations = [
    "You are worthy of love and kindness.",
    "Today brings new opportunities for growth.",
    "You have the strength to overcome any challenge.",
    "Your presence makes a positive difference.",
    "You are exactly where you need to be right now.",
    "You are enough, just as you are.",
    "Every day is a fresh start.",
    "You are resilient and can handle anything that comes your way.",
    "Your feelings are valid and important.",
    "You are a unique and valuable part of the universe.",
    "You are allowed to take up space and rest.",
    "You are making progress, even if it doesn't feel like it.",
    "You are the author of your own story.",
    "You are surrounded by love and support.",
    "You are capable of amazing things.",
    "You are not your thoughts; you are the awareness behind them.",
    "You are a light in the world.",
    "You are free to be yourself.",
    "You are growing and evolving every day.",
    "You are deserving of happiness and peace.",
  ];

  const wisdomQuotes = [
    "Peace comes from within. Do not seek it without. - Buddha",
    "The present moment is the only time over which we have dominion. - Thich Nhat Hanh",
    "Wherever you are, be there totally. - Eckhart Tolle",
    "Happiness is not something ready made. It comes from your own actions. - Dalai Lama",
    "The mind is everything. What you think you become. - Buddha",
  ];

  const QUOTES = [
    { text: "You're doing better than you think.", emoji: "✨" },
    { text: "Rest is productive.", emoji: "🌤️" },
    { text: "You are allowed to slow down.", emoji: "🌱" },
    { text: "You are not behind. You're on your own timeline.", emoji: "💛" },
    { text: "You've survived 100% of your hardest days.", emoji: "🌈" },
    { text: "The obstacle is the way.", emoji: "🪨" },
    {
      text: "You are the sky. Everything else is just the weather.",
      emoji: "☁️",
    },
    { text: "What you do today can improve all your tomorrows.", emoji: "🌅" },
    { text: "No feeling is final.", emoji: "🌀" },
    { text: "You are stardust, a miracle of the cosmos.", emoji: "🌌" },
    { text: "Let go of what you can't control.", emoji: "🍃" },
    { text: "Be present. The present is all you ever have.", emoji: "🕰️" },
    { text: "Your value is not measured by productivity.", emoji: "🧡" },
    { text: "You are enough, always.", emoji: "🌻" },
    {
      text: "Difficult roads often lead to beautiful destinations.",
      emoji: "🏞️",
    },
  ];

  // Get today's date in YYYY-MM-DD
  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, "0");
  const dd = String(today.getDate()).padStart(2, "0");
  const todayStr = `${yyyy}-${mm}-${dd}`;

  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUser(user);
    };
    getUser();
  }, []);

  useEffect(() => {
    if (!user) return;
    const fetchMood = async () => {
      setLoadingMood(true);
      try {
        const res = await fetch(
          `http://192.168.0.101:8000/api/moods/by-date/${todayStr}?userId=${user.id}`
        );
        if (!res.ok) {
          setMood(null);
        } else {
          const data = await res.json();
          setMood(data);
        }
      } catch (e) {
        setMood(null);
      } finally {
        setLoadingMood(false);
      }
    };
    fetchMood();
  }, [todayStr, user]);

  useEffect(() => {
    // Enhanced breathing animation
    const breathingLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(breathingAnimation, {
          toValue: 1.15,
          duration: 3500,
          useNativeDriver: true,
        }),
        Animated.timing(breathingAnimation, {
          toValue: 1,
          duration: 3500,
          useNativeDriver: true,
        }),
      ])
    );

    const waveLoop = Animated.loop(
      Animated.timing(waveAnimation, {
        toValue: 1,
        duration: 8000,
        useNativeDriver: true,
      })
    );

    breathingLoop.start();
    waveLoop.start();

    return () => {
      breathingLoop.stop();
      waveLoop.stop();
    };
  }, []);

  useEffect(() => {
    if (modalVisible) {
      const breathingModalLoop = Animated.loop(
        Animated.sequence([
          Animated.timing(breathingModalAnimation, {
            toValue: 1.3,
            duration: 4000,
            useNativeDriver: true,
          }),
          Animated.timing(breathingModalAnimation, {
            toValue: 1,
            duration: 4000,
            useNativeDriver: true,
          }),
        ])
      );

      const colorLoop = Animated.loop(
        Animated.sequence([
          Animated.timing(colorAnimation, {
            toValue: 1,
            duration: 4000,
            useNativeDriver: false,
          }),
          Animated.timing(colorAnimation, {
            toValue: 0,
            duration: 4000,
            useNativeDriver: false,
          }),
        ])
      );

      const particleLoops = particleAnimations.map((anim, index) =>
        Animated.loop(
          Animated.sequence([
            Animated.delay(index * 1000),
            Animated.timing(anim, {
              toValue: 1,
              duration: 6000,
              useNativeDriver: true,
            }),
            Animated.timing(anim, {
              toValue: 0,
              duration: 0,
              useNativeDriver: true,
            }),
          ])
        )
      );

      const phaseInterval = setInterval(() => {
        setBreathingPhase((prev) => (prev === "inhale" ? "exhale" : "inhale"));
      }, 4000);

      breathingModalLoop.start();
      colorLoop.start();
      particleLoops.forEach((loop) => loop.start());

      return () => {
        breathingModalLoop.stop();
        colorLoop.stop();
        particleLoops.forEach((loop) => loop.stop());
        clearInterval(phaseInterval);
      };
    }
  }, [modalVisible]);

  const inhaleMessages = [
    "Breathe in… let calm enter.",
    "Fill your lungs with ease.",
    "Feel the air nourish you.",
    "Breathe in… you are safe.",
    "Draw in light and presence.",
  ];

  const exhaleMessages = [
    "Exhale… let tension go.",
    "Breathe out slowly.",
    "Release the stress.",
    "Let it all go.",
    "Feel your body soften.",
  ];

  const handleNext = () => {
    if (breathingPhase === "inhale") {
      setBreathingPhase("hold");
      setTimeout(() => setBreathingPhase("exhale"), 4000);
    } else if (breathingPhase === "hold") {
      setBreathingPhase("exhale");
    } else if (breathingPhase === "exhale") {
      setBreathingPhase("inhale");
      setTimer((prev) => prev - 1);
    }
  };

  const BreathingCircle = () => (
    <Animated.View
      style={[
        styles.breathingCircle,
        {
          transform: [{ scale: breathingAnimation }],
        },
      ]}
    >
      <View style={styles.breathingInner}>
        <Text style={styles.breathingText}>Breathe</Text>
      </View>
    </Animated.View>
  );

  const FloatingParticle = ({ animationValue, delay = 0 }) => {
    const translateY = animationValue.interpolate({
      inputRange: [0, 1],
      outputRange: [height, -100],
    });

    const opacity = animationValue.interpolate({
      inputRange: [0, 0.1, 0.9, 1],
      outputRange: [0, 1, 1, 0],
    });

    return (
      <Animated.View
        style={[
          styles.particle,
          {
            transform: [{ translateY }],
            opacity,
            left: Math.random() * (width - 20),
          },
        ]}
      >
        <View style={styles.particleDot} />
      </Animated.View>
    );
  };

  // Enhanced dynamic content for stress relief
  const stressReliefContent = (
    <LinearGradient colors={colors.gradient.energy} style={styles.cardGradient}>
      <View style={styles.cardHeader}>
        <View style={styles.cardIconContainer}>
          <Text style={styles.cardEmoji}>🧘‍♀️</Text>
        </View>
        <Text style={styles.cardTitle}>Stress Relief</Text>
      </View>
      <Text style={styles.cardSubtitle}>
        Feeling stressed? Try these mindful solutions:
      </Text>
      <View style={styles.affirmationContainer}>
        <Text style={styles.affirmationQuote}>
          "You are stronger than you think. This moment will pass."
        </Text>
      </View>
      <View style={styles.tipsList}>
        <View style={styles.tipItem}>
          <Text style={styles.tipBullet}>•</Text>
          <Text style={styles.tipText}>
            5-4-3-2-1 Grounding: Name 5 things you see, 4 you can touch, 3 you
            hear, 2 you smell, 1 you taste.
          </Text>
        </View>
        <View style={styles.tipItem}>
          <Text style={styles.tipBullet}>•</Text>
          <Text style={styles.tipText}>
            Take 3 deep breaths, slowly and mindfully.
          </Text>
        </View>
        <View style={styles.tipItem}>
          <Text style={styles.tipBullet}>•</Text>
          <Text style={styles.tipText}>
            Drink water and do gentle stretches.
          </Text>
        </View>
      </View>
      <View style={styles.factContainer}>
        <Text style={styles.factText}>
          💡 Stress is a normal response. Taking a mindful pause can help reset
          your mind and body.
        </Text>
      </View>
    </LinearGradient>
  );

  // Expanded bot responses with stoic and varied advice
  const botResponseByMood = {
    excited: [
      "You're radiating positive energy today! Remember to celebrate your achievements, practice gratitude, and share your joy with others.",
      "Let your excitement fuel your creativity. Channel it into something meaningful!",
      "Happiness is only real when shared. Spread your joy!",
      "The joy you feel is a sign of alignment with your true self.",
    ],
    happy: [
      "Today you did good! Make the most out of today by sharing your happiness and doing something kind for yourself or others.",
      "Happiness is a journey, not a destination. Savor every moment.",
      "Let your happiness inspire those around you.",
      "Gratitude turns what we have into enough.",
    ],
    meh: [
      "Unsure about today? There's always a way you can make your day better. Start with a small positive action.",
      "Every day is a blank page. You can write a new story, even if you start small.",
      "It's okay to feel 'meh'. Sometimes, just being is enough.",
      "Small steps can lead to meaningful changes.",
    ],
    sad: [
      "It's okay to feel sad. Accept your emotions and let them flow. You are not alone.",
      "You are a unique part of the universe. Your feelings are valid and important.",
      "Your emotions are not a burden, but a part of your human experience. Let yourself feel and heal.",
      "Remember, you are stardust—your existence is a miracle.",
    ],
    stressful: [
      "I sense you're feeling stressed. Let's take a moment to breathe together. Remember, you have the strength to navigate through this.",
      "This too shall pass. Focus on what you can control, and let go of the rest.",
      "You have overcome challenges before. Trust in your resilience.",
      "The obstacle is the way. Use this moment to grow stronger.",
    ],
    null: [
      "How are you feeling today? I'm here to provide personalized guidance based on your current mood.",
      "Share your mood to unlock personalized wellness insights!",
      "Your feelings matter. Let me know how you're doing.",
    ],
  };

  // Helper to pick a random bot response for the mood
  function getRandomBotResponse(moodKey) {
    const arr = botResponseByMood[moodKey] || botResponseByMood.null;
    return arr[Math.floor(Math.random() * arr.length)];
  }

  // Enhanced dynamic content for excited mood
  const excitedContent = (
    <LinearGradient colors={colors.gradient.energy} style={styles.cardGradient}>
      <View style={styles.cardHeader}>
        <View style={styles.cardIconContainer}>
          <MaterialIcons name="celebration" size={24} color="black" />
          {/* <Text style={styles.cardEmoji}>🎉</Text> */}
        </View>
        <Text style={styles.cardTitle}>Celebrate Your Energy</Text>
      </View>
      <Text style={styles.cardSubtitle}>
        You&apos;re feeling excited! Here are ways to channel that positive
        energy:
      </Text>
      <View style={styles.affirmationContainer}>
        <Text style={styles.affirmationQuote}>
          "Gratitude turns what we have into enough."
        </Text>
      </View>
      <View style={styles.tipsList}>
        <View style={styles.tipItem}>
          <Text style={styles.tipBullet}>•</Text>
          <Text style={styles.tipText}>
            Take a moment to celebrate your wins
          </Text>
        </View>
        <View style={styles.tipItem}>
          <Text style={styles.tipBullet}>•</Text>
          <Text style={styles.tipText}>
            Share your joy with someone special
          </Text>
        </View>
        <View style={styles.tipItem}>
          <Text style={styles.tipBullet}>•</Text>
          <Text style={styles.tipText}>
            Practice gratitude and savor the moment
          </Text>
        </View>
      </View>
    </LinearGradient>
  );

  // Enhanced dynamic content for happy mood
  const happyContent = (
    <LinearGradient colors={colors.gradient.calm} style={styles.cardGradient}>
      <View style={styles.cardHeader}>
        <View style={styles.cardIconContainer}>
          <Ionicons name="sunny" size={24} color="gold" />
        </View>
        <Text style={styles.cardTitle}>Make the Most of Today</Text>
      </View>
      <Text style={styles.cardSubtitle}>
        Today you did good! Here are ways to make the most out of your
        happiness:
      </Text>
      <View style={styles.affirmationContainer}>
        <Text style={styles.affirmationQuote}>
          "Happiness is a journey, not a destination."
        </Text>
      </View>
      <View style={styles.tipsList}>
        <View style={styles.tipItem}>
          <Text style={styles.tipBullet}>•</Text>
          <Text style={styles.tipText}>
            Share your happiness with someone you care about.
          </Text>
        </View>
        <View style={styles.tipItem}>
          <Text style={styles.tipBullet}>•</Text>
          <Text style={styles.tipText}>
            Do something kind for yourself or others.
          </Text>
        </View>
        <View style={styles.tipItem}>
          <Text style={styles.tipBullet}>•</Text>
          <Text style={styles.tipText}>
            Reflect on what made you happy today and express gratitude.
          </Text>
        </View>
      </View>
    </LinearGradient>
  );

  // Enhanced dynamic content for meh mood
  const mehContent = (
    <LinearGradient
      colors={colors.gradient.wellness}
      style={styles.cardGradient}
    >
      <View style={styles.cardHeader}>
        <View style={styles.cardIconContainer}>
          <Ionicons name="cloud-outline" size={24} color="#a3a3a3" />
        </View>
        <Text style={styles.cardTitle}>Not Sure About Today?</Text>
      </View>
      <Text style={styles.cardSubtitle}>
        There&apos;s always a way you can make your day better. Start with a
        small positive action.
      </Text>
      <View style={styles.affirmationContainer}>
        <Text style={styles.affirmationQuote}>
          "Every day is a blank page. You can write a new story."
        </Text>
      </View>
      <View style={styles.tipsList}>
        <View style={styles.tipItem}>
          <Text style={styles.tipBullet}>•</Text>
          <Text style={styles.tipText}>
            Try a new activity or revisit an old hobby.
          </Text>
        </View>
        <View style={styles.tipItem}>
          <Text style={styles.tipBullet}>•</Text>
          <Text style={styles.tipText}>
            Take a short walk and notice your surroundings.
          </Text>
        </View>
        <View style={styles.tipItem}>
          <Text style={styles.tipBullet}>•</Text>
          <Text style={styles.tipText}>
            Reach out to a friend or write down your thoughts.
          </Text>
        </View>
      </View>
    </LinearGradient>
  );

  // Enhanced dynamic content for sad mood
  const sadContent = (
    <LinearGradient colors={colors.gradient.calm} style={styles.cardGradient}>
      <View style={styles.cardHeader}>
        <View style={styles.cardIconContainer}>
          <Ionicons name="rainy-outline" size={24} color="#4ade80" />
        </View>
        <Text style={styles.cardTitle}>Gentle Guidance for Sadness</Text>
      </View>
      <Text style={styles.cardSubtitle}>
        It&apos;s okay to feel sad. Here are some ways to accept your emotions
        and feel grounded:
      </Text>
      <View style={styles.affirmationContainer}>
        <Text style={styles.affirmationQuote}>
          "You are a unique part of the universe. Your feelings are valid."
        </Text>
      </View>
      <View style={styles.tipsList}>
        <View style={styles.tipItem}>
          <Text style={styles.tipBullet}>•</Text>
          <Text style={styles.tipText}>
            Allow yourself to feel and express your emotions without judgment.
          </Text>
        </View>
        <View style={styles.tipItem}>
          <Text style={styles.tipBullet}>•</Text>
          <Text style={styles.tipText}>
            Practice grounding: notice your breath, your body, and your place in
            the world.
          </Text>
        </View>
        <View style={styles.tipItem}>
          <Text style={styles.tipBullet}>•</Text>
          <Text style={styles.tipText}>
            Remember, you are stardust—a miracle of the cosmos. Your emotions
            are not a burden but a part of your journey.
          </Text>
        </View>
      </View>
    </LinearGradient>
  );

  // Sample questions for chat
  const sampleQuestions = [
    {
      q: "I'm feeling anxious",
      a: "It's okay to feel anxious. Try grounding yourself with deep breaths and remind yourself that this feeling will pass.",
    },
    {
      q: "I'm feeling nervous",
      a: "Nerves are natural before something important. Focus on what you can control and let go of the rest.",
    },
    {
      q: "I'm overthinking",
      a: "Pause and take a deep breath. Write down your thoughts and challenge any negative patterns.",
    },
  ];

  // Enhanced Chat modal
  const ChatModal = () => (
    <Modal
      animationType="slide"
      transparent={false}
      visible={chatModalVisible}
      onRequestClose={() => setChatModalVisible(false)}
    >
      <LinearGradient
        colors={colors.gradient.focus}
        style={styles.fullChatModal}
      >
        <View style={styles.chatHeader}>
          <View style={styles.fenoLogoContainer}>
            <SvgXml xml={fenoLogoXml} width={70} height={38} />
          </View>
          <TouchableOpacity
            style={styles.fullChatCloseButton}
            onPress={() => setChatModalVisible(false)}
          >
            <Text style={styles.closeButtonText}>✕</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.fullChatContent}>
          <Text style={styles.fullChatMood}>
            {loadingMood
              ? "Loading your mood..."
              : moodKey
              ? `Today's mood: ${mood.mood}`
              : "How are you feeling today?"}
          </Text>

          <View style={styles.fullChatBubbles}>
            <View style={styles.fullChatBubbleBot}>
              <Text style={styles.fullChatText}>
                {selectedSample
                  ? selectedSample.a
                  : getRandomBotResponse(moodKey)}
              </Text>
            </View>

            <View style={styles.fullChatSampleList}>
              {sampleQuestions.map((item, idx) => (
                <TouchableOpacity
                  key={idx}
                  style={[
                    styles.fullChatSampleBubble,
                    selectedSample?.q === item.q && styles.selectedSampleBubble,
                  ]}
                  onPress={() => setSelectedSample(item)}
                >
                  <Text
                    style={[
                      styles.fullChatSampleText,
                      selectedSample?.q === item.q && styles.selectedSampleText,
                    ]}
                  >
                    {item.q}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>
      </LinearGradient>
    </Modal>
  );

  useEffect(() => {
    if (isBreathing && !isSessionComplete) {
      if (breathingPhase === "inhale") {
        setDisplayText(
          inhaleMessages[Math.floor(Math.random() * inhaleMessages.length)]
        );
        phaseTimeoutRef.current = setTimeout(
          () => setBreathingPhase("exhale"),
          4000
        );
      } else if (breathingPhase === "exhale") {
        setDisplayText(
          exhaleMessages[Math.floor(Math.random() * exhaleMessages.length)]
        );
        phaseTimeoutRef.current = setTimeout(
          () => setBreathingPhase("inhale"),
          4000
        );
      }
    }

    return () => {
      if (phaseTimeoutRef.current) {
        clearTimeout(phaseTimeoutRef.current);
        phaseTimeoutRef.current = null;
      }
    };
  }, [isBreathing, breathingPhase, isSessionComplete]);

  const formatTime = (seconds) => {
    const mm = String(Math.floor(seconds / 60)).padStart(2, "0");
    const ss = String(seconds % 60).padStart(2, "0");
    return `${mm}:${ss}`;
  };

  // Enhanced Breathing Modal
  const BreathingModal = () => (
    <Modal
      animationType="fade"
      transparent={false}
      visible={modalVisible}
      onRequestClose={() => setModalVisible(false)}
    >
      <StatusBar
        backgroundColor={colors.success[600]}
        barStyle="light-content"
      />
      <LinearGradient
        colors={colors.gradient.calm}
        style={styles.modalContainer}
      >
        <TouchableOpacity
          style={styles.closeButton}
          onPress={() => setModalVisible(false)}
        >
          <Text style={styles.closeButtonText}>✕</Text>
        </TouchableOpacity>

        <View style={styles.modalContent}>
          {!isBreathing && !isSessionComplete && (
            <>
              <Text style={styles.modalTitle}>Mindful Breathing</Text>
              <Text style={styles.modalSubtitle}>
                Find a comfortable position and prepare for a moment of peace.
              </Text>
              <TouchableOpacity
                style={styles.beginButton}
                onPress={() => {
                  setIsBreathing(true);
                  setBreathingPhase("inhale");
                  setDisplayText(
                    inhaleMessages[
                      Math.floor(Math.random() * inhaleMessages.length)
                    ]
                  );
                  const time = new Date();
                  setSessionStart(time);
                  restart(time, true);
                }}
              >
                <Text style={styles.beginButtonText}>Begin Session</Text>
              </TouchableOpacity>
            </>
          )}

          {isBreathing && !isSessionComplete && (
            <>
              <Text style={styles.breathingPhaseText}>
                {breathingPhase === "inhale" ? "Inhale" : "Exhale"}
              </Text>
              <Text style={styles.displayText}>{displayText}</Text>
              <TouchableOpacity
                onPress={() => {
                  setIsSessionComplete(false);
                  setIsBreathing(false);
                  setModalVisible(false);
                  pause();
                }}
                style={styles.stopButton}
              >
                <Text style={styles.stopButtonText}>End Session</Text>
              </TouchableOpacity>
            </>
          )}

          {isSessionComplete && (
            <>
              <Text style={styles.congratulatoryMessage}>
                Beautiful work. Your mind and body thank you for this moment of
                peace.
              </Text>
              <TouchableOpacity
                style={styles.stopButton}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.stopButtonText}>Close</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </LinearGradient>
    </Modal>
  );

  const getMoodKey = (moodObj) => {
    if (!moodObj || !moodObj.mood) return null;
    const m = moodObj.mood.toLowerCase();
    if (m.includes("stress")) return "stressful";
    if (m.includes("excite")) return "excited";
    if (m.includes("sad")) return "sad";
    return m;
  };

  const moodKey = getMoodKey(mood);

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor={colors.neutral[50]} barStyle="dark-content" />

      <View style={styles.header}>
        <Text style={styles.title}>Wellness Sanctuary</Text>
        <Text style={styles.subtitle}>
          Your daily companion for mindful living
        </Text>
      </View>

      <ChatModal />

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Mood selection prompt */}
        {!moodKey && (
          <View style={styles.promptCard}>
            <View style={styles.promptIconContainer}>
              <Text style={styles.promptIcon}>💭</Text>
            </View>
            <Text style={styles.promptTitle}>Share Your Mood</Text>
            <Text style={styles.promptText}>
              Let us know how you're feeling today to receive personalized
              guidance and support.
            </Text>
          </View>
        )}

        {/* Dynamic mood-based content */}
        {moodKey === "stressful" && (
          <View style={styles.card}>{stressReliefContent}</View>
        )}
        {moodKey === "excited" && (
          <View style={styles.card}>{excitedContent}</View>
        )}
        {moodKey === "happy" && <View style={styles.card}>{happyContent}</View>}
        {moodKey === "meh" && <View style={styles.card}>{mehContent}</View>}
        {moodKey === "sad" && <View style={styles.card}>{sadContent}</View>}

        {/* Enhanced Chat with Feno Widget */}
        <TouchableOpacity
          style={styles.chatCard}
          onPress={() => {
            setChatModalVisible(true);
            setSelectedSample(null);
          }}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={colors.gradient.focus}
            style={styles.cardGradient}
          >
            <View style={styles.chatCardHeader}>
              <View style={styles.chatIconContainer}>
                <Ionicons
                  name="chatbubble-ellipses-outline"
                  size={24}
                  color="#862ec2"
                />
              </View>
              <View style={styles.chatTitleContainer}>
                <Text style={styles.chatTitle}>Chat with</Text>
                <SvgXml xml={fenoLogoXml} width={50} height={28} />
              </View>
            </View>
            <Text style={styles.chatDescription}>
              Get personalized guidance and support based on your current mood
              and feelings
            </Text>
            <View style={styles.chatCTA}>
              <Text style={styles.chatCTAText}>
                Tap to start conversation →
              </Text>
            </View>
          </LinearGradient>
        </TouchableOpacity>

        {/* Enhanced Daily Affirmation */}
        <View style={styles.card}>
          <LinearGradient
            colors={colors.gradient.wellness}
            style={styles.cardGradient}
          >
            <View style={styles.cardHeader}>
              <View style={styles.cardIconContainer}>
                <Ionicons name="sparkles" size={24} color="black" />
              </View>
              <Text style={styles.cardTitle}>Daily Affirmation</Text>
            </View>
            <View style={styles.affirmationContainer}>
              <Text style={styles.affirmationText}>
                {
                  affirmations[
                    (new Date().getFullYear() * 366 + new Date().getDate()) %
                      affirmations.length
                  ]
                }
              </Text>
            </View>
          </LinearGradient>
        </View>

        {/* Enhanced Today's Mood */}
        <View style={styles.card}>
          <LinearGradient
            colors={colors.gradient.energy}
            style={styles.cardGradient}
          >
            <View style={styles.cardHeader}>
              <View style={styles.cardIconContainer}>
                <FontAwesome6 name="masks-theater" size={24} color="black" />
              </View>
              <Text style={styles.cardTitle}>Today's Mood</Text>
            </View>
            <View style={styles.moodContainer}>
              <Text style={styles.moodText}>
                {loadingMood
                  ? "Loading..."
                  : mood && mood.mood
                  ? mood.mood
                  : "No mood recorded today"}
              </Text>
              <Text style={styles.moodMotivation}>
                {(() => {
                  if (loadingMood) return "";
                  if (!mood || !mood.mood)
                    return "Share your mood to unlock personalized wellness insights!";
                  const m = mood.mood.toLowerCase();
                  if (m.includes("stress"))
                    return "Remember to pause and breathe. You are resilient and this feeling is temporary.";
                  if (m.includes("excite"))
                    return "Channel your excitement into positive action! Celebrate your wins and spread joy.";
                  if (m.includes("sad"))
                    return "It's okay to feel sad. Be gentle with yourself and take things one step at a time.";
                  if (m.includes("happy"))
                    return "Your happiness is contagious! Keep shining and sharing your light.";
                  if (m.includes("meh"))
                    return "Every day is a fresh start. Small steps can lead to meaningful changes.";
                  return "Whatever you're feeling, remember that you're doing your best.";
                })()}
              </Text>
            </View>
          </LinearGradient>
        </View>

        {/* Enhanced Quote Card */}
        <View style={styles.card}>
          <LinearGradient
            colors={colors.gradient.focus}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.cardGradient}
          >
            <TouchableOpacity
              activeOpacity={0.9}
              style={styles.quoteCardContent}
              onPress={!revealed ? revealQuote : undefined}
              disabled={revealed}
            >
              {!revealed ? (
                <View style={styles.quoteRevealContainer}>
                  <FontAwesome6 name="gift" size={24} color="black" />
                  <Text style={styles.quoteRevealText}>
                    Tap to reveal your daily inspiration
                  </Text>
                </View>
              ) : (
                <Animated.View
                  style={[
                    styles.quoteContentContainer,
                    {
                      opacity: fadeAnim,
                      transform: [{ scale: scaleAnim }],
                    },
                  ]}
                >
                  <Text style={styles.quoteEmoji}>
                    {
                      QUOTES[
                        quoteIdx ||
                          (new Date().getFullYear() * 366 +
                            new Date().getDate()) %
                            QUOTES.length
                      ]?.emoji
                    }
                  </Text>
                  <Text style={styles.quoteText}>
                    {
                      QUOTES[
                        quoteIdx ||
                          (new Date().getFullYear() * 366 +
                            new Date().getDate()) %
                            QUOTES.length
                      ]?.text
                    }
                  </Text>

                  <View style={styles.quoteActions}>
                    <TouchableOpacity
                      style={styles.copyButton}
                      onPress={() => {
                        if (
                          QUOTES[
                            quoteIdx ||
                              (new Date().getFullYear() * 366 +
                                new Date().getDate()) %
                                QUOTES.length
                          ]?.text
                        ) {
                          // Copy functionality would go here
                        }
                      }}
                    >
                      <Text style={styles.copyButtonText}>Copy Quote</Text>
                    </TouchableOpacity>

                    {revealCount < 2 && (
                      <TouchableOpacity
                        style={styles.showAnotherButton}
                        onPress={showAnother}
                      >
                        <Text style={styles.showAnotherText}>Show Another</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </Animated.View>
              )}
              <Sparkle />
            </TouchableOpacity>
          </LinearGradient>
        </View>

        <View style={styles.bottomSpacing} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.neutral[50],
  },
  header: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing["2xl"],
    paddingBottom: spacing.md,
  },
  title: {
    fontSize: typography.fontSize["2xl"],
    // fontWeight: typography.fontWeight.bold,
    color: colors.neutral[900],
    marginBottom: spacing.xs,
    letterSpacing: -0.5,
    fontFamily: "Sora-Bold",
  },
  subtitle: {
    fontSize: typography.fontSize.sm,
    color: colors.neutral[500],
    fontFamily: "Ubuntu-Regular",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing["2xl"],
  },

  // Card Styles
  card: {
    marginBottom: spacing.lg,
    borderRadius: 24,
    overflow: "hidden",
    shadowColor: colors.neutral[900],
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  cardGradient: {
    padding: spacing.lg,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: spacing.md,
  },
  cardIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: spacing.sm,
  },
  cardEmoji: {
    fontSize: 20,
  },
  cardTitle: {
    fontSize: typography.fontSize.xl,
    // fontWeight: typography.fontWeight.bold,
    color: colors.neutral[800],
    fontFamily: "Sora-Bold",
  },
  cardSubtitle: {
    fontSize: typography.fontSize.base,
    color: colors.neutral[700],
    lineHeight: typography.lineHeight.relaxed * typography.fontSize.base,
    marginBottom: spacing.md,
    fontFamily: "Ubuntu-Regular",
  },

  // Prompt Card
  promptCard: {
    backgroundColor: colors.primary[50],
    borderRadius: 20,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: colors.primary[200],
    alignItems: "center",
  },
  promptIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.primary[100],
    justifyContent: "center",
    alignItems: "center",
    marginBottom: spacing.md,
  },
  promptIcon: {
    fontSize: 28,
  },
  promptTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.primary[800],
    marginBottom: spacing.sm,
  },
  promptText: {
    fontSize: typography.fontSize.base,
    color: colors.primary[700],
    textAlign: "center",
    lineHeight: typography.lineHeight.relaxed * typography.fontSize.base,
  },

  // Chat Card
  chatCard: {
    marginBottom: spacing.lg,
    borderRadius: 24,
    overflow: "hidden",
    shadowColor: colors.secondary[500],
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 6,
  },
  chatCardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: spacing.md,
  },
  chatIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(255, 255, 255, 0.3)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: spacing.sm,
  },
  chatEmoji: {
    fontSize: 22,
  },
  chatTitleContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  chatTitle: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.secondary[800],
  },
  chatDescription: {
    fontSize: typography.fontSize.base,
    color: colors.secondary[700],
    lineHeight: typography.lineHeight.relaxed * typography.fontSize.base,
    marginBottom: spacing.md,
    fontFamily: "Ubuntu-Regular",
  },
  chatCTA: {
    alignSelf: "flex-start",
  },
  chatCTAText: {
    fontSize: typography.fontSize.sm,
    // fontWeight: typography.fontWeight.medium,
    color: colors.secondary[700],
    fontFamily: "Ubuntu-Regular",
  },

  // Affirmation Styles
  affirmationContainer: {
    backgroundColor: "rgba(255, 255, 255, 0.3)",
    borderRadius: 16,
    padding: spacing.md,
    // borderLeftWidth: 4,
    // borderLeftColor: colors.success[500],
  },
  affirmationText: {
    fontSize: typography.fontSize.lg,
    // fontWeight: typography.fontWeight.medium,
    color: colors.neutral[800],
    lineHeight: typography.lineHeight.relaxed * typography.fontSize.lg,
    textAlign: "center",
    fontFamily: "Ubuntu-Regular",
  },
  affirmationQuote: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.medium,
    color: colors.neutral[700],
    // fontStyle: "italic",
    textAlign: "center",
    lineHeight: typography.lineHeight.relaxed * typography.fontSize.base,
    fontFamily: "Ubuntu-Regular",
  },

  // Tips List
  tipsList: {
    marginTop: spacing.md,
  },
  tipItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: spacing.sm,
  },
  tipBullet: {
    fontSize: typography.fontSize.base,
    color: colors.warning[600],
    fontWeight: typography.fontWeight.bold,
    marginRight: spacing.sm,
    marginTop: 2,
  },
  tipText: {
    flex: 1,
    fontSize: typography.fontSize.sm,
    color: colors.neutral[700],
    fontFamily: "Ubuntu-Regular",
    lineHeight: typography.lineHeight.normal * typography.fontSize.sm,
  },

  // Fact Container
  factContainer: {
    backgroundColor: "rgba(255, 255, 255, 0.4)",
    borderRadius: 12,
    padding: spacing.md,
    marginTop: spacing.md,
  },
  factText: {
    fontSize: typography.fontSize.sm,
    color: colors.neutral[600],
    textAlign: "center",
    lineHeight: typography.lineHeight.normal * typography.fontSize.sm,
  },

  // Mood Styles
  moodContainer: {
    alignItems: "center",
  },
  moodText: {
    fontSize: typography.fontSize.xl,
    // fontWeight: typography.fontWeight.bold,
    color: colors.warning[800],
    marginBottom: spacing.sm,
    textAlign: "center",
    fontFamily: "Sora-Bold",
  },
  moodMotivation: {
    fontSize: typography.fontSize.base,
    color: colors.warning[700],
    textAlign: "center",
    fontFamily: "Ubuntu-Regular",
    lineHeight: typography.lineHeight.relaxed * typography.fontSize.base,
  },

  // Quote Card Styles
  quoteCardContent: {
    minHeight: 160,
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  quoteRevealContainer: {
    alignItems: "center",
  },
  quoteRevealEmoji: {
    fontSize: 32,
    marginBottom: spacing.sm,
  },
  quoteRevealText: {
    fontSize: typography.fontSize.lg,
    color: colors.secondary[700],
    textAlign: "center",
    fontFamily: "Ubuntu-Regular",
    marginTop: 8,
  },
  quoteContentContainer: {
    alignItems: "center",
    width: "100%",
  },
  quoteEmoji: {
    fontSize: 36,
    marginBottom: spacing.sm,
  },
  quoteText: {
    fontSize: typography.fontSize.lg,
    // fontWeight: typography.fontWeight.semibold,
    fontFamily: "Ubuntu-Regular",
    color: colors.neutral[800],
    textAlign: "center",
    marginBottom: spacing.lg,
    lineHeight: typography.lineHeight.relaxed * typography.fontSize.lg,
  },
  quoteActions: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  copyButton: {
    backgroundColor: "rgba(255, 255, 255, 0.4)",
    borderRadius: 12,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  copyButtonText: {
    fontSize: typography.fontSize.sm,
    fontFamily: "Ubuntu-Regular",
    color: colors.secondary[700],
  },
  showAnotherButton: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 12,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.3)",
  },
  showAnotherText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: colors.secondary[600],
  },
  sparkle: {
    fontSize: 28,
    position: "absolute",
    top: spacing.md,
    right: spacing.md,
  },

  // Chat Modal Styles
  fullChatModal: {
    flex: 1,
    paddingTop: spacing["2xl"],
  },
  chatHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.lg,
  },
  fenoLogoContainer: {
    flex: 1,
    alignItems: "center",
  },
  fullChatCloseButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: colors.neutral[900],
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  closeButtonText: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.medium,
    color: colors.neutral[600],
  },
  fullChatContent: {
    flex: 1,
    paddingHorizontal: spacing.lg,
  },
  fullChatMood: {
    fontSize: typography.fontSize.xl,
    // fontWeight: typography.fontWeight.bold,
    color: colors.secondary[800],
    textAlign: "center",
    marginBottom: spacing.lg,
    fontFamily: "Ubuntu-Regular",
  },
  fullChatBubbles: {
    flex: 1,
    justifyContent: "flex-end",
  },
  fullChatBubbleBot: {
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    borderRadius: 20,
    padding: spacing.lg,
    marginBottom: spacing.md,
    alignSelf: "flex-start",
    maxWidth: "85%",
    shadowColor: colors.neutral[900],
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  fullChatText: {
    fontSize: typography.fontSize.base,
    color: colors.secondary[800],
    lineHeight: typography.lineHeight.relaxed * typography.fontSize.base,
    fontFamily: "Ubuntu-Regular",
  },
  fullChatSampleList: {
    gap: spacing.sm,
  },
  fullChatSampleBubble: {
    backgroundColor: "rgba(255, 255, 255, 0.7)",
    borderRadius: 16,
    padding: spacing.md,
    alignSelf: "flex-end",
    maxWidth: "80%",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.3)",
  },
  selectedSampleBubble: {
    backgroundColor: colors.secondary[100],
    borderColor: colors.secondary[300],
  },
  fullChatSampleText: {
    fontSize: typography.fontSize.sm,
    color: colors.secondary[700],
    fontFamily: "Ubuntu-Regular",
  },
  selectedSampleText: {
    color: colors.secondary[800],
    fontWeight: typography.fontWeight.medium,
  },

  // Modal Styles
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: spacing.lg,
  },
  closeButton: {
    position: "absolute",
    top: spacing["2xl"],
    right: spacing.lg,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 10,
  },
  modalContent: {
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    borderRadius: 28,
    padding: spacing.xl,
    alignItems: "center",
    width: "100%",
    maxWidth: 400,
    shadowColor: colors.neutral[900],
    shadowOffset: {
      width: 0,
      height: 12,
    },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 12,
  },
  modalTitle: {
    fontSize: typography.fontSize["3xl"],
    fontWeight: typography.fontWeight.bold,
    color: colors.success[700],
    marginBottom: spacing.sm,
    textAlign: "center",
  },
  modalSubtitle: {
    fontSize: typography.fontSize.base,
    color: colors.neutral[600],
    marginBottom: spacing.xl,
    textAlign: "center",
    lineHeight: typography.lineHeight.relaxed * typography.fontSize.base,
  },
  beginButton: {
    backgroundColor: colors.success[600],
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: 50,
    shadowColor: colors.success[600],
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  beginButtonText: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.neutral[50],
    letterSpacing: 0.5,
  },
  breathingPhaseText: {
    fontSize: typography.fontSize["2xl"],
    fontWeight: typography.fontWeight.bold,
    color: colors.success[700],
    textAlign: "center",
    marginBottom: spacing.md,
  },
  displayText: {
    fontSize: typography.fontSize.lg,
    color: colors.success[600],
    textAlign: "center",
    marginBottom: spacing.xl,
    fontStyle: "italic",
    lineHeight: typography.lineHeight.relaxed * typography.fontSize.lg,
  },
  stopButton: {
    backgroundColor: colors.neutral[600],
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: 12,
  },
  stopButtonText: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.medium,
    color: colors.neutral[50],
  },
  congratulatoryMessage: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.semibold,
    color: colors.success[700],
    textAlign: "center",
    marginBottom: spacing.xl,
    lineHeight: typography.lineHeight.relaxed * typography.fontSize.xl,
  },

  // Breathing Animation Styles
  breathingCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: `${colors.success[200]}40`,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: spacing.md,
  },
  breathingInner: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: `${colors.success[300]}60`,
    justifyContent: "center",
    alignItems: "center",
  },
  breathingText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: colors.success[700],
  },

  // Particle Animation Styles
  particle: {
    position: "absolute",
    width: 6,
    height: 6,
  },
  particleDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "rgba(255, 255, 255, 0.6)",
  },

  // Bottom Spacing
  bottomSpacing: {
    height: spacing.xl,
  },
});

export default WellBeingSanctuary;
