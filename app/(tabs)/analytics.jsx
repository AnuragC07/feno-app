"use client";

import { Ionicons } from "@expo/vector-icons";
import { useFonts } from "expo-font";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Calendar } from "react-native-calendars";
import { SafeAreaView } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";
import excited from "../../assets/images/excitedmood.png";
import good from "../../assets/images/goodmood.png";
import meh from "../../assets/images/mehmood.png";
import sad from "../../assets/images/sadmood.png";
import stressful from "../../assets/images/stressfullmood.png";
import { supabase } from "../lib/supabase";

// Enhanced color palette (consistent with home screen)
const colors = {
  primary: {
    50: "#fef7f0",
    100: "#feeee0",
    200: "#fdd9c1",
    300: "#fbbf96",
    400: "#f89d69",
    500: "#f47c3c",
    600: "#e55a1f",
    700: "#c44518",
    800: "#9d3818",
    900: "#7f2f17",
  },
  secondary: {
    50: "#f8f6f4",
    100: "#f0ebe6",
    200: "#e0d5cc",
    300: "#cbb8a8",
    400: "#b59985",
    500: "#a0826c",
    600: "#916354",
    700: "#785347",
    800: "#62453d",
    900: "#523a35",
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
  accent: {
    blue: "#3b82f6",
    orange: "#f97316",
    purple: "#8b5cf6",
    teal: "#14b8a6",
  },
};

const API_BASE = "http://192.168.0.101:8000/api"; // Change if needed

// Mood mapping for analytics
const moodMap = [
  { label: "Excited", icon: excited, score: 5, color: "#15803d" }, // dark green
  { label: "Happy", icon: good, score: 4, color: "#4ade80" }, // light green
  { label: "Meh", icon: meh, score: 3, color: "#fde047" }, // yellow
  { label: "Sad", icon: sad, score: 2, color: "#fb923c" }, // orange
  { label: "Stressful", icon: stressful, score: 1, color: "#ef4444" }, // red
];

export default function AnalyticsScreen() {
  const [selectedDate, setSelectedDate] = useState(() => {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, "0");
    const dd = String(today.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  });

  const [todos, setTodos] = useState([]);
  const [journal, setJournal] = useState(null);
  const [todoDates, setTodoDates] = useState([]);
  const [journalDates, setJournalDates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingDates, setLoadingDates] = useState(true);
  const [journalModalVisible, setJournalModalVisible] = useState(false);
  const [confirmJournalDeleteVisible, setConfirmJournalDeleteVisible] =
    useState(false);
  const [confirmTodoDeleteVisible, setConfirmTodoDeleteVisible] =
    useState(false);
  const [todoIdToDelete, setTodoIdToDelete] = useState(null);
  const [moodModalVisible, setMoodModalVisible] = useState(false);
  const [moodStats, setMoodStats] = useState(null);
  const [moodLoading, setMoodLoading] = useState(false);

  const [fontsLoaded] = useFonts({
    "Ubuntu-Regular": require("../../assets/fonts/Ubuntu-Regular.ttf"),
    "Sora-Bold": require("../../assets/fonts/Sora-Bold.ttf"),
  });

  const [user, setUser] = useState(null);

  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUser(user);
    };
    getUser();
  }, []);

  // Fetch all dates with todos and journals for calendar dots
  const fetchDates = useCallback(async () => {
    if (!user) return;
    setLoadingDates(true);
    try {
      const [todoRes, journalRes] = await Promise.all([
        fetch(`${API_BASE}/tasks/dates?userId=${user.id}`),
        fetch(`${API_BASE}/journals/dates?userId=${user.id}`),
      ]);

      const todoDatesRaw = await todoRes.json();
      const journalDatesRaw = await journalRes.json();

      const todoDates = Array.isArray(todoDatesRaw) ? todoDatesRaw : [];
      const journalDates = Array.isArray(journalDatesRaw)
        ? journalDatesRaw
        : [];

      setTodoDates(todoDates);
      setJournalDates(journalDates);
    } catch (e) {
      setTodoDates([]);
      setJournalDates([]);
    } finally {
      setLoadingDates(false);
    }
  }, [user]);

  // Fetch todos and journal for selected date
  const fetchDataForDate = useCallback(
    async (date) => {
      if (!user) return;
      setLoading(true);
      try {
        const [todosRes, journalRes] = await Promise.all([
          fetch(`${API_BASE}/tasks/by-date/${date}?userId=${user.id}`),
          fetch(`${API_BASE}/journals/by-date/${date}?userId=${user.id}`),
        ]);

        const todosRaw = await todosRes.json();
        let journal = null;

        if (journalRes.status === 200) {
          journal = await journalRes.json();
        }

        const todos = Array.isArray(todosRaw) ? todosRaw : [];
        setTodos(todos);
        setJournal(journal);
      } catch (e) {
        setTodos([]);
        setJournal(null);
      } finally {
        setLoading(false);
      }
    },
    [user]
  );

  useEffect(() => {
    fetchDates();
  }, [fetchDates]);

  useEffect(() => {
    fetchDataForDate(selectedDate);
  }, [selectedDate, fetchDataForDate]);

  // Calendar dots logic
  const getMarkedDates = useCallback(() => {
    const marked = {};

    // Add dots for dates with todos
    todoDates.forEach((date) => {
      if (!marked[date]) {
        marked[date] = { dots: [] };
      }
      marked[date].dots.push({
        color: colors.accent.blue,
        selectedDotColor: "#ffffff",
      });
    });

    // Add dots for dates with journals
    journalDates.forEach((date) => {
      if (!marked[date]) {
        marked[date] = { dots: [] };
      }
      marked[date].dots.push({
        color: colors.accent.orange,
        selectedDotColor: "#ffffff",
      });
    });

    // Mark selected date
    if (marked[selectedDate]) {
      marked[selectedDate].selected = true;
      marked[selectedDate].selectedColor = colors.primary[500];
    } else {
      marked[selectedDate] = {
        selected: true,
        selectedColor: colors.primary[500],
        disableTouchEvent: true,
        selectedTextColor: "white",
      };
    }

    return marked;
  }, [todoDates, journalDates, selectedDate]);

  // Toggle todo completed
  const toggleTodo = async (id, completed) => {
    try {
      await fetch(`${API_BASE}/tasks/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ done: !completed }),
      });
      fetchDataForDate(selectedDate);
    } catch (e) {}
  };

  // Delete todo
  const deleteTodo = (id) => {
    setTodoIdToDelete(id);
    setConfirmTodoDeleteVisible(true);
  };

  const confirmDeleteTodo = async () => {
    if (!todoIdToDelete) return;

    try {
      await fetch(`${API_BASE}/tasks/${todoIdToDelete}`, { method: "DELETE" });
      fetchDataForDate(selectedDate);
      fetchDates();
      Toast.show({
        type: "success",
        text1: "Todo Deleted",
      });
    } catch (e) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Could not delete todo.",
      });
    } finally {
      setTodoIdToDelete(null);
      setConfirmTodoDeleteVisible(false);
    }
  };

  // Delete journal
  const handleDeleteJournal = () => {
    if (journal && journal._id) {
      setConfirmJournalDeleteVisible(true);
    }
  };

  const confirmDeleteJournal = async () => {
    setConfirmJournalDeleteVisible(false);
    if (journal && journal._id) {
      try {
        await fetch(`${API_BASE}/journals/${journal._id}`, {
          method: "DELETE",
        });
        setJournalModalVisible(false);
        fetchDataForDate(selectedDate);
        fetchDates();
        Toast.show({
          type: "success",
          text1: "Journal entry deleted.",
        });
      } catch (e) {
        Toast.show({
          type: "error",
          text1: "Error",
          text2: "Could not delete journal entry.",
        });
      }
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // Fetch all moods for the user
  const fetchMoodStats = async () => {
    if (!user) return;
    setMoodLoading(true);
    try {
      const res = await fetch(`${API_BASE}/moods?userId=${user.id}`);
      const moods = await res.json();
      // Count each mood
      const counts = {};
      let totalScore = 0;
      moods.forEach((entry) => {
        counts[entry.mood] = (counts[entry.mood] || 0) + 1;
        const moodObj = moodMap.find((m) => m.label === entry.mood);
        if (moodObj) totalScore += moodObj.score;
      });
      // Prepare data for chart
      const chartData = moodMap.map((m) => ({
        ...m,
        count: counts[m.label] || 0,
      }));
      // Calculate average mood
      const avgScore = moods.length ? totalScore / moods.length : 0;
      let avgMood = null;
      if (avgScore > 0) {
        // Find the closest mood by score
        avgMood = moodMap.reduce((prev, curr) =>
          Math.abs(curr.score - avgScore) < Math.abs(prev.score - avgScore)
            ? curr
            : prev
        );
      }
      setMoodStats({ chartData, avgMood, total: moods.length });
    } catch (e) {
      setMoodStats(null);
    } finally {
      setMoodLoading(false);
    }
  };

  if (!fontsLoaded) {
    return null; // or <AppLoading />
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {/* Enhanced Header */}
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <Text style={styles.title}>Your Journey</Text>
            <Text style={styles.subtitle}>
              Reflecting on your daily progress
            </Text>
          </View>
          <View style={styles.headerIcon}>
            <Ionicons
              name="analytics-outline"
              size={32}
              color={colors.primary[500]}
            />
          </View>
        </View>
        {/* Mood at a Glance Container (moved below header) */}
        <Pressable
          style={styles.moodGlanceContainer}
          onPress={() => {
            setMoodModalVisible(true);
            fetchMoodStats();
          }}
        >
          <View style={styles.moodGlanceHeader}>
            <View style={styles.moodGlanceIconContainer}>
              <Ionicons
                name="analytics-outline"
                size={20}
                color={colors.primary[600]}
              />
            </View>
            <View style={styles.moodGlanceTextContainer}>
              <Text style={styles.moodGlanceTitle}>Mood Insights</Text>
              <Text style={styles.moodGlanceSub}>
                Tap to explore your emotional journey
              </Text>
            </View>
            <Ionicons
              name="chevron-forward"
              size={20}
              color={colors.primary[500]}
            />
          </View>
        </Pressable>
        {/* Mood Modal */}
        <Modal
          visible={moodModalVisible}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setMoodModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.moodModalContent}>
              <View style={styles.modalHandle} />
              <Pressable
                style={styles.closeButton}
                onPress={() => setMoodModalVisible(false)}
              >
                <Ionicons name="close-circle" size={28} color={"#171717"} />
              </Pressable>
              <Text style={styles.moodModalTitle}>Mood History</Text>
              {moodLoading ? (
                <ActivityIndicator
                  size="large"
                  color={"#171717"}
                  style={{ marginTop: 32 }}
                />
              ) : moodStats ? (
                <>
                  {/* Bar Chart */}
                  <View style={styles.moodChartContainer}>
                    {moodStats.chartData.map((m, idx) => (
                      <View key={m.label} style={styles.moodBarWrapper}>
                        <Image source={m.icon} style={styles.moodBarIcon} />
                        <View style={styles.moodBarTrack}>
                          <View
                            style={[
                              styles.moodBarFill,
                              {
                                width: `${Math.max(
                                  (m.count / (moodStats.total || 1)) * 100,
                                  6
                                )}%`,
                                backgroundColor: m.color,
                              },
                            ]}
                          />
                        </View>
                        <Text style={styles.moodBarCount}>{m.count}</Text>
                      </View>
                    ))}
                  </View>
                  {/* Average Mood */}
                  <View style={styles.moodAvgContainer}>
                    <Text style={styles.moodAvgLabel}>Average Mood:</Text>
                    {moodStats.avgMood ? (
                      <>
                        <Image
                          source={moodStats.avgMood.icon}
                          style={styles.moodAvgIcon}
                        />
                        <Text
                          style={[
                            styles.moodAvgText,
                            { color: moodStats.avgMood.color },
                          ]}
                        >
                          {moodStats.avgMood.label}
                        </Text>
                      </>
                    ) : (
                      <Text style={styles.moodAvgText}>No data</Text>
                    )}
                  </View>
                </>
              ) : (
                <Text style={styles.moodAvgText}>No mood data found.</Text>
              )}
            </View>
          </View>
        </Modal>
        {/* Enhanced Calendar */}
        <View style={styles.calendarContainer}>
          <Calendar
            current={selectedDate}
            onDayPress={(day) => setSelectedDate(day.dateString)}
            markedDates={getMarkedDates()}
            markingType="multi-dot"
            enableSwipeMonths={true}
            hideExtraDays={true}
            disableMonthChange={false}
            firstDay={1}
            hideDayNames={false}
            showWeekNumbers={false}
            disableArrowLeft={false}
            disableArrowRight={false}
            disableAllTouchEventsForDisabledDays={true}
            theme={{
              backgroundColor: colors.neutral[50],
              calendarBackground: colors.neutral[50],
              textSectionTitleColor: colors.secondary[600],
              selectedDayBackgroundColor: colors.primary[500],
              selectedDayTextColor: colors.neutral[50],
              todayTextColor: colors.primary[600],
              dayTextColor: colors.neutral[700],
              textDisabledColor: colors.neutral[300],
              dotColor: colors.accent.blue,
              selectedDotColor: colors.neutral[50],
              arrowColor: colors.primary[500],
              disabledArrowColor: colors.neutral[300],
              monthTextColor: colors.neutral[800],
              indicatorColor: colors.primary[500],
              textDayFontWeight: "500",
              textMonthFontWeight: "600",
              textDayHeaderFontWeight: "600",
              textDayFontSize: 16,
              textMonthFontSize: 18,
              textDayHeaderFontSize: 14,
              textDayFontFamily: "Ubuntu-Regular",
              textMonthFontFamily: "Ubuntu-Regular",
              textDayHeaderFontFamily: "Ubuntu-Regular",
              "stylesheet.calendar.header": {
                dayHeader: {
                  fontFamily: "Ubuntu-Regular",
                },
              },
              "stylesheet.calendar.main": {
                monthText: {
                  fontFamily: "Ubuntu-Regular",
                },
              },
            }}
          />
        </View>
        {/* Enhanced Selected Date Display */}
        <View style={styles.contentContainer}>
          <View style={styles.dateHeader}>
            <View style={styles.dateHeaderContent}>
              <Text style={styles.selectedDate}>
                {formatDate(selectedDate)}
              </Text>
              {/* <View style={styles.legend}>
                <View style={styles.legendItem}>
                  <View
                    style={[
                      styles.legendDot,
                      { backgroundColor: colors.accent.blue },
                    ]}
                  />
                  <Text style={styles.legendText}>Tasks</Text>
                </View>
                <View style={styles.legendItem}>
                  <View
                    style={[
                      styles.legendDot,
                      { backgroundColor: colors.accent.orange },
                    ]}
                  />
                  <Text style={styles.legendText}>Journal</Text>
                </View>
              </View> */}
            </View>
          </View>

          {/* Enhanced Todos Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionTitleContainer}>
                <View style={styles.sectionIcon}>
                  <Ionicons
                    name="checkmark-circle-outline"
                    size={24}
                    color={colors.accent.blue}
                  />
                </View>
                <Text style={styles.sectionTitle}>Tasks ({todos.length})</Text>
              </View>
            </View>

            <View style={styles.itemsList}>
              {loading ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="small" color={colors.primary[500]} />
                  <Text style={styles.loadingText}>Loading tasks...</Text>
                </View>
              ) : todos.length === 0 ? (
                <View style={styles.emptyContainer}>
                  <Ionicons
                    name="clipboard-outline"
                    size={48}
                    color={colors.neutral[300]}
                  />
                  <Text style={styles.emptyText}>No tasks for this date</Text>
                  <Text style={styles.emptySubtext}>
                    Tasks you create will appear here
                  </Text>
                </View>
              ) : (
                todos.map((todo) => (
                  <View key={todo._id} style={styles.todoItem}>
                    <View style={styles.todoContent}>
                      <Text
                        style={[
                          styles.todoText,
                          todo.done && styles.todoTextCompleted,
                        ]}
                      >
                        {todo.content}
                      </Text>
                    </View>
                    <View style={styles.todoActions}>
                      <TouchableOpacity
                        style={styles.actionButton}
                        onPress={() => toggleTodo(todo._id, todo.done)}
                        activeOpacity={0.7}
                      >
                        <Ionicons
                          name={
                            todo.done
                              ? "checkmark-circle"
                              : "checkmark-circle-outline"
                          }
                          size={24}
                          color={
                            todo.done
                              ? colors.success[500]
                              : colors.neutral[400]
                          }
                        />
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.actionButton}
                        onPress={() => deleteTodo(todo._id)}
                        activeOpacity={0.7}
                      >
                        <Ionicons
                          name="trash-outline"
                          size={20}
                          color={colors.error[500]}
                        />
                      </TouchableOpacity>
                    </View>
                  </View>
                ))
              )}
            </View>
          </View>

          {/* Enhanced Journal Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionTitleContainer}>
                <View style={styles.sectionIcon}>
                  <Ionicons
                    name="book-outline"
                    size={24}
                    color={colors.accent.orange}
                  />
                </View>
                <Text style={styles.sectionTitle}>
                  Journal ({journal ? 1 : 0})
                </Text>
              </View>
            </View>

            <View style={styles.itemsList}>
              {loading ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="small" color={colors.primary[500]} />
                  <Text style={styles.loadingText}>Loading journal...</Text>
                </View>
              ) : !journal ? (
                <View style={styles.emptyContainer}>
                  <Ionicons
                    name="book-outline"
                    size={48}
                    color={colors.neutral[300]}
                  />
                  <Text style={styles.emptyText}>
                    No journal entry for this date
                  </Text>
                  <Text style={styles.emptySubtext}>
                    Your reflections will appear here
                  </Text>
                </View>
              ) : (
                <Pressable
                  onPress={() => setJournalModalVisible(true)}
                  style={styles.journalPressable}
                >
                  <View style={styles.journalItem}>
                    <View style={styles.journalHeader}>
                      <View style={styles.journalTitleContainer}>
                        <View style={styles.journalIconContainer}>
                          <Ionicons
                            name="book"
                            size={20}
                            color={colors.secondary[600]}
                          />
                        </View>
                        <Text style={styles.journalTitle}>
                          Daily Reflection
                        </Text>
                      </View>
                      <TouchableOpacity
                        style={styles.deleteButton}
                        onPress={handleDeleteJournal}
                        activeOpacity={0.7}
                      >
                        <Ionicons
                          name="trash-outline"
                          size={18}
                          color={colors.error[500]}
                        />
                      </TouchableOpacity>
                    </View>
                    <Text style={styles.journalContent} numberOfLines={3}>
                      {journal.content}
                    </Text>
                    <View style={styles.journalFooter}>
                      <Text style={styles.journalDate}>
                        {formatDate(selectedDate)}
                      </Text>
                      <Text style={styles.readMoreText}>Tap to read more</Text>
                    </View>
                  </View>
                </Pressable>
              )}
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Enhanced Journal Modal */}
      <Modal
        visible={journalModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setJournalModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {/* Modal Handle */}
            <View style={styles.modalHandle} />
            <Pressable
              style={({ pressed }) => [
                styles.closeButton,
                pressed && styles.closeButtonPressed,
              ]}
              onPress={() => setJournalModalVisible(false)}
            >
              <Ionicons
                name="close-circle"
                size={28}
                color={colors.secondary[600]}
              />
            </Pressable>

            <View style={styles.modalHeader}>
              <View style={styles.modalTitleContainer}>
                <View style={styles.modalIconContainer}>
                  <Ionicons
                    name="book"
                    size={24}
                    color={colors.secondary[600]}
                  />
                </View>
                <Text style={styles.modalTitle}>Daily Reflection</Text>
              </View>
            </View>

            <View style={styles.modalDateContainer}>
              <View style={styles.modalDateWrapper}>
                <Ionicons
                  name="calendar-outline"
                  size={16}
                  color={colors.neutral[500]}
                />
                <Text style={styles.modalDate}>{formatDate(selectedDate)}</Text>
              </View>
            </View>

            <ScrollView
              style={styles.modalBodyContainer}
              showsVerticalScrollIndicator={false}
            >
              <View style={styles.modalBodyContent}>
                <Ionicons
                  name="chatbubble-outline"
                  size={20}
                  color={colors.neutral[600]}
                  style={styles.modalBodyIcon}
                />
                <Text style={styles.modalBody}>{journal?.content}</Text>
              </View>
            </ScrollView>

            <View style={styles.modalBottomSection}>
              <TouchableOpacity
                onPress={handleDeleteJournal}
                style={styles.modalDeleteButton}
                activeOpacity={0.8}
              >
                <Ionicons
                  name="trash-outline"
                  size={20}
                  color={colors.error[600]}
                />
                <Text style={styles.deleteButtonText}>Delete Entry</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Enhanced Confirm Delete Modal */}
      <Modal
        visible={confirmJournalDeleteVisible || confirmTodoDeleteVisible}
        animationType="fade"
        transparent={true}
        onRequestClose={() => {
          setConfirmJournalDeleteVisible(false);
          setConfirmTodoDeleteVisible(false);
        }}
      >
        <View style={styles.centeredModalOverlay}>
          <View style={styles.confirmModalContent}>
            <View style={styles.confirmIconContainer}>
              <Ionicons
                name="warning-outline"
                size={48}
                color={colors.error[500]}
              />
            </View>
            <Text style={styles.confirmTitle}>
              {confirmTodoDeleteVisible
                ? "Delete Task"
                : "Delete Journal Entry"}
            </Text>
            <Text style={styles.confirmText}>
              Are you sure you want to delete this{" "}
              {confirmTodoDeleteVisible ? "task" : "journal entry"}? This action
              cannot be undone.
            </Text>

            <View style={styles.confirmButtons}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => {
                  setConfirmJournalDeleteVisible(false);
                  setConfirmTodoDeleteVisible(false);
                  setTodoIdToDelete(null);
                }}
                activeOpacity={0.8}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.confirmDeleteButton}
                onPress={
                  confirmTodoDeleteVisible
                    ? confirmDeleteTodo
                    : confirmDeleteJournal
                }
                activeOpacity={0.8}
              >
                <Text style={styles.confirmDeleteButtonText}>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.neutral[50],
  },
  scrollView: {
    flex: 1,
  },

  // Enhanced Header
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 24,
    paddingBottom: 16,
  },
  headerContent: {
    flex: 1,
  },
  headerIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary[100],
    alignItems: "center",
    justifyContent: "center",
    shadowColor: colors.primary[300],
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  title: {
    fontSize: 32,
    color: colors.neutral[900],
    marginBottom: 4,
    fontFamily: "Sora-Bold",
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 16,
    color: colors.neutral[600],
    fontFamily: "Ubuntu-Regular",
    lineHeight: 24,
  },

  // Enhanced Calendar
  calendarContainer: {
    margin: 20,
    backgroundColor: colors.neutral[50],
    borderRadius: 20,
    padding: 16,
    shadowColor: colors.neutral[400],
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
    borderWidth: 1,
    borderColor: colors.neutral[200],
  },

  // Enhanced Content Container
  contentContainer: {
    backgroundColor: colors.primary[50],
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingTop: 24,
    paddingBottom: 32,
    minHeight: 400,
  },

  // Enhanced Date Header
  dateHeader: {
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  dateHeaderContent: {
    backgroundColor: colors.neutral[50],
    borderRadius: 16,
    padding: 20,
    shadowColor: colors.neutral[400],
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  selectedDate: {
    fontSize: 20,
    fontWeight: "600",
    color: colors.neutral[800],
    marginBottom: 12,
    fontFamily: "Sora-Bold",
  },
  legend: {
    flexDirection: "row",
    justifyContent: "flex-start",
    gap: 20,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 8,
  },
  legendText: {
    fontSize: 14,
    color: colors.neutral[600],
    fontFamily: "Ubuntu-Regular",
  },

  // Enhanced Section Styles
  section: {
    marginHorizontal: 24,
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  sectionTitleContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  sectionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.neutral[50],
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
    shadowColor: colors.neutral[400],
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 20,
    color: colors.neutral[800],
    fontFamily: "Sora-Bold",
  },

  // Enhanced Items List
  itemsList: {
    backgroundColor: colors.neutral[50],
    borderRadius: 16,
    padding: 16,
    shadowColor: colors.neutral[400],
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },

  // Enhanced Loading and Empty States
  loadingContainer: {
    alignItems: "center",
    paddingVertical: 32,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: colors.neutral[500],
    fontFamily: "Ubuntu-Regular",
  },
  emptyContainer: {
    alignItems: "center",
    paddingVertical: 40,
  },
  emptyText: {
    textAlign: "center",
    color: colors.neutral[500],
    fontSize: 16,
    marginTop: 12,
    marginBottom: 4,
    fontFamily: "Ubuntu-Regular",
  },
  emptySubtext: {
    textAlign: "center",
    color: colors.neutral[400],
    fontSize: 14,
    fontFamily: "Ubuntu-Regular",
  },

  // Enhanced Todo Styles
  todoItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: colors.neutral[50],
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.neutral[200],
    shadowColor: colors.neutral[300],
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  todoContent: {
    flex: 1,
  },
  todoText: {
    fontSize: 15,
    fontFamily: "Ubuntu-Regular",
    color: colors.neutral[700],
    lineHeight: 22,
  },
  todoTextCompleted: {
    color: colors.neutral[400],
    textDecorationLine: "line-through",
  },
  todoActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  actionButton: {
    padding: 8,
    borderRadius: 8,
  },

  // Enhanced Journal Styles
  journalPressable: {
    borderRadius: 16,
  },
  journalItem: {
    backgroundColor: colors.secondary[100],
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: colors.secondary[200],
    shadowColor: colors.secondary[400],
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  journalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  journalTitleContainer: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  journalIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.neutral[50],
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  journalTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.secondary[700],
    fontFamily: "Sora-Bold",
  },
  deleteButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: colors.error[50],
  },
  journalContent: {
    fontSize: 15,
    color: colors.secondary[700],
    lineHeight: 22,
    marginBottom: 12,
    fontFamily: "Ubuntu-Regular",
  },
  journalFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  journalDate: {
    fontSize: 12,
    color: colors.secondary[500],
    fontFamily: "Ubuntu-Regular",
    fontStyle: "italic",
  },
  readMoreText: {
    fontSize: 12,
    color: colors.secondary[600],
    fontFamily: "Ubuntu-Regular",
    fontWeight: "500",
  },

  // Enhanced Modal Styles
  modalOverlay: {
    flex: 1,
    justifyContent: "flex-end",
    // backgroundColor: "rgba(0, 0, 0, 0.4)",
  },
  modalContent: {
    backgroundColor: colors.neutral[50],
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    width: "100%",
    minHeight: "75%",
    maxHeight: "85%",
    shadowColor: colors.neutral[900],
    shadowOffset: {
      width: 0,
      height: -8,
    },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 25,
    paddingTop: 12,
  },
  modalHandle: {
    width: 50,
    height: 5,
    backgroundColor: colors.secondary[300],
    borderRadius: 3,
    alignSelf: "center",
    marginBottom: 8,
  },
  closeButton: {
    position: "absolute",
    top: 16,
    right: 20,
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 10,
    backgroundColor: colors.neutral[100],
  },
  closeButtonPressed: {
    backgroundColor: colors.secondary[100],
    transform: [{ scale: 0.92 }],
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
    paddingHorizontal: 24,
    paddingTop: 28,
    paddingBottom: 20,
  },
  modalTitleContainer: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  modalIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.secondary[100],
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  modalTitle: {
    fontSize: 24,
    color: colors.neutral[800],
    flex: 1,
    letterSpacing: -0.3,
    lineHeight: 32,
    fontFamily: "Sora-Bold",
  },
  modalDateContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
    paddingHorizontal: 24,
  },
  modalDateWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.neutral[100],
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  modalDate: {
    fontSize: 14,
    color: colors.neutral[600],
    marginLeft: 6,
    fontStyle: "italic",
    fontFamily: "Ubuntu-Regular",
  },
  modalBodyContainer: {
    flex: 1,
    paddingHorizontal: 24,
  },
  modalBodyContent: {
    flexDirection: "row",
    marginBottom: 24,
  },
  modalBodyIcon: {
    marginRight: 12,
    marginTop: 2,
  },
  modalBody: {
    fontSize: 16,
    color: colors.neutral[700],
    lineHeight: 24,
    flex: 1,
    fontFamily: "Ubuntu-Regular",
  },
  modalBottomSection: {
    paddingHorizontal: 24,
    paddingVertical: 20,
    borderTopWidth: 1,
    borderTopColor: colors.neutral[200],
  },
  modalDeleteButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.error[50],
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.error[200],
  },
  deleteButtonText: {
    color: colors.error[600],
    fontSize: 16,
    marginLeft: 8,
    fontFamily: "Sora-Bold",
  },

  // Enhanced Confirm Modal
  centeredModalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  confirmModalContent: {
    backgroundColor: colors.neutral[50],
    borderRadius: 20,
    padding: 24,
    width: "85%",
    alignItems: "center",
    shadowColor: colors.neutral[900],
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 12,
  },
  confirmIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.error[50],
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  confirmTitle: {
    fontSize: 20,
    color: colors.neutral[800],
    marginBottom: 8,
    textAlign: "center",
    fontFamily: "Sora-Bold",
  },
  confirmText: {
    fontSize: 16,
    color: colors.neutral[600],
    marginBottom: 24,
    textAlign: "center",
    lineHeight: 24,
    fontFamily: "Ubuntu-Regular",
  },
  confirmButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    gap: 12,
  },
  cancelButton: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    flex: 1,
    alignItems: "center",
    backgroundColor: colors.neutral[100],
    borderWidth: 1,
    borderColor: colors.neutral[200],
  },
  cancelButtonText: {
    color: colors.neutral[600],
    fontSize: 16,
    fontFamily: "Sora-Bold",
  },
  confirmDeleteButton: {
    backgroundColor: colors.error[500],
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    flex: 1,
    alignItems: "center",
    shadowColor: colors.error[500],
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  confirmDeleteButtonText: {
    color: colors.neutral[50],
    fontSize: 16,
    fontFamily: "Sora-Bold",
  },

  // Mood styles
  // Container Styles
  moodGlanceContainer: {
    backgroundColor: "#ffffff",
    borderRadius: 20,
    padding: 20,
    margin: 20,
    marginBottom: 0,
    shadowColor: "#a3a3a3",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
    borderWidth: 1,
    borderColor: "#e5e5e5",
  },

  moodGlanceHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
  },

  moodGlanceIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#feeee0",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#fbbf96",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 2,
  },

  moodGlanceTextContainer: {
    flex: 1,
    marginLeft: 16,
  },

  moodGlanceTitle: {
    fontSize: 18,
    color: "#262626",
    fontFamily: "Sora-Bold",
    marginBottom: 2,
    letterSpacing: -0.3,
  },

  moodGlanceSub: {
    fontSize: 14,
    color: "#737373",
    fontFamily: "Ubuntu-Regular",
    lineHeight: 20,
  },

  // Modal Styles
  modalOverlay: {
    flex: 1,
    justifyContent: "flex-end",
    // backgroundColor: "rgba(0, 0, 0, 0.4)",
  },

  moodModalContent: {
    backgroundColor: "#fafafa",
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    width: "100%",
    minHeight: "65%",
    maxHeight: "85%",
    shadowColor: "#171717",
    shadowOffset: { width: 0, height: -12 },
    shadowOpacity: 0.2,
    shadowRadius: 32,
    elevation: 25,
    paddingTop: 12,
    paddingHorizontal: 24,
  },

  modalHandle: {
    width: 50,
    height: 5,
    backgroundColor: "#d4d4d4",
    borderRadius: 3,
    alignSelf: "center",
    marginBottom: 8,
  },

  closeButton: {
    position: "absolute",
    top: 16,
    right: 20,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#f5f5f5",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 10,
    shadowColor: "#a3a3a3",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },

  moodModalTitle: {
    fontSize: 26,
    color: "#262626",
    fontFamily: "Sora-Bold",
    marginBottom: 32,
    marginTop: 24,
    textAlign: "center",
    letterSpacing: -0.5,
  },

  // Chart Styles
  moodChartContainer: {
    width: "100%",
    backgroundColor: "#ffffff",
    borderRadius: 20,
    padding: 20,
    marginBottom: 24,
    shadowColor: "#d4d4d4",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: "#f5f5f5",
  },

  moodBarWrapper: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
    paddingVertical: 4,
  },

  moodBarIcon: {
    width: 36,
    height: 36,
    marginRight: 16,
    borderRadius: 18,
    shadowColor: "#a3a3a3",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },

  moodBarTrack: {
    flex: 1,
    height: 24,
    backgroundColor: "#f5f5f5",
    borderRadius: 12,
    overflow: "hidden",
    marginRight: 16,
    shadowColor: "#d4d4d4",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },

  moodBarFill: {
    height: 24,
    borderRadius: 12,
    shadowColor: "rgba(0, 0, 0, 0.2)",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 2,
  },

  moodBarCount: {
    fontSize: 16,
    color: "#404040",
    fontFamily: "Sora-Bold",
    minWidth: 32,
    textAlign: "center",
    backgroundColor: "#f5f5f5",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },

  // Average Mood Styles
  moodAvgContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fef7f0",
    borderRadius: 16,
    padding: 20,
    marginTop: 8,
    borderWidth: 1,
    borderColor: "#feeee0",
    shadowColor: "#fbbf96",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 2,
  },

  moodAvgLabel: {
    fontSize: 16,
    color: "#525252",
    fontFamily: "Sora-Bold",
    marginRight: 12,
  },

  moodAvgIcon: {
    width: 40,
    height: 40,
    marginRight: 12,
    borderRadius: 20,
    shadowColor: "#a3a3a3",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 2,
  },

  moodAvgText: {
    fontSize: 18,
    color: "#e55a1f",
    fontFamily: "Sora-Bold",
    letterSpacing: -0.3,
  },
});
