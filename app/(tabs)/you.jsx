"use client";

import { Ionicons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import {
  Image,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import Toast from "react-native-toast-message";
import excited from "../../assets/images/excitedmood.png";
import good from "../../assets/images/goodmood.png";
import meh from "../../assets/images/mehmood.png";
import sad from "../../assets/images/sadmood.png";
import stressful from "../../assets/images/stressfullmood.png";
import { supabase } from "../lib/supabase";

// Enhanced color palette (consistent with other screens)
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
    gold: "#C2A94B",
    coral: "#A0472A",
    peach: "#FFC7B5",
    sage: "#B6D7A8",
    lightPeach: "#fff8f7",
  },
};

export default function YouScreen() {
  const [tasks, setTasks] = useState([]);
  const [mood, setMood] = useState(null);
  const [loadingMood, setLoadingMood] = useState(true);
  const [journal, setJournal] = useState(null);
  const [user, setUser] = useState(null);
  const [isModalVisible, setModalVisible] = useState(false);
  const [newUsername, setNewUsername] = useState("");
  const [loading, setLoading] = useState(false);
  const [journalModalVisible, setJournalModalVisible] = useState(false);

  // Get today's date in YYYY-MM-DD
  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, "0");
  const dd = String(today.getDate()).padStart(2, "0");
  const todayStr = `${yyyy}-${mm}-${dd}`;

  // For display: e.g. 22nd June, 2025
  const displayDate = today.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUser(user);
      if (user) {
        setNewUsername(user.user_metadata?.display_name || "");
      }
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
    if (!user) return;
    const fetchTasks = async () => {
      try {
        const res = await fetch(
          `http://192.168.0.101:8000/api/tasks/by-date/${todayStr}?userId=${user.id}`
        );
        if (!res.ok) {
          setTasks([]);
        } else {
          const data = await res.json();
          setTasks(data);
        }
      } catch (e) {
        setTasks([]);
      }
    };
    fetchTasks();
  }, [todayStr, user]);

  useEffect(() => {
    if (!user) return;
    const fetchJournal = async () => {
      try {
        const res = await fetch(
          `http://192.168.0.101:8000/api/journals/by-date/${todayStr}?userId=${user.id}`
        );
        if (!res.ok) {
          setJournal(null);
        } else {
          const data = await res.json();
          setJournal(data);
        }
      } catch (e) {
        setJournal(null);
      }
    };
    fetchJournal();
  }, [todayStr, user]);

  const handleDeleteTask = async (id) => {
    try {
      const res = await fetch(`http://192.168.0.101:8000/api/tasks/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setTasks((prev) => prev.filter((task) => task._id !== id));
        Toast.show({
          type: "success",
          text1: "Task deleted successfully",
          position: "bottom",
        });
      }
    } catch (e) {
      Toast.show({
        type: "error",
        text1: "Failed to delete task",
        position: "bottom",
      });
    }
  };

  const handleToggleComplete = async (id, currentStatus) => {
    try {
      const res = await fetch(`http://192.168.0.101:8000/api/tasks/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ done: !currentStatus }),
      });
      if (res.ok) {
        setTasks((prev) =>
          prev.map((task) =>
            task._id === id ? { ...task, done: !currentStatus } : task
          )
        );
      }
    } catch (e) {}
  };

  const handleUpdateUsername = async () => {
    if (!newUsername.trim()) {
      Toast.show({
        type: "error",
        text1: "Username cannot be empty",
        position: "top",
      });
      return;
    }

    setLoading(true);
    const { data, error } = await supabase.auth.updateUser({
      data: { display_name: newUsername },
    });

    if (error) {
      Toast.show({
        type: "error",
        text1: "Error updating username",
        text2: error.message,
        position: "top",
      });
    } else {
      setUser(data.user);
      Toast.show({
        type: "success",
        text1: "Username updated successfully!",
        position: "top",
      });
      setModalVisible(false);
    }
    setLoading(false);
  };

  const handleSignOut = async () => {
    setModalVisible(false);
    await supabase.auth.signOut();
    Toast.show({
      type: "success",
      text1: "Signed out successfully",
      position: "top",
    });
  };

  const getMoodEmoji = () => {
    if (!mood || !mood.mood) return null;

    switch (mood.mood) {
      case "Happy":
        return good;
      case "Excited":
        return excited;
      case "Meh":
        return meh;
      case "Sad":
        return sad;
      case "Stressful":
        return stressful;
      default:
        return null;
    }
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Enhanced Profile Header */}
      <View style={styles.profileHeader}>
        <View style={styles.profileInfo}>
          <Text style={styles.greeting}>At a glance</Text>
          <TouchableOpacity
            style={styles.editNameButton}
            onPress={() => setModalVisible(true)}
            activeOpacity={0.7}
          >
            <Text style={styles.editNameText}>Edit profile</Text>
            <Ionicons
              name="pencil-outline"
              size={14}
              color={colors.primary[600]}
            />
          </TouchableOpacity>
        </View>
        <TouchableOpacity
          style={styles.settingsButton}
          onPress={() => setModalVisible(true)}
          activeOpacity={0.7}
        >
          <Ionicons
            name="settings-outline"
            size={22}
            color={colors.neutral[700]}
          />
        </TouchableOpacity>
      </View>

      {/* Enhanced Date Display */}
      <View style={styles.dateContainer}>
        <View style={styles.dateContent}>
          <View style={styles.dateIconContainer}>
            <Ionicons
              name="calendar-outline"
              size={20}
              color={colors.primary[600]}
            />
          </View>
          <View style={styles.dateTextContainer}>
            <Text style={styles.date}>{displayDate}</Text>
            <Text style={styles.atGlance}>Your daily summary</Text>
          </View>
        </View>
      </View>

      {/* Fixed Cards Row */}
      <View style={styles.rowCards}>
        {/* Fixed Mood Card */}
        <View style={styles.moodCard}>
          <View style={styles.moodCardMood}>
            {getMoodEmoji() ? (
              <Image source={getMoodEmoji()} style={styles.moodEmoji} />
            ) : (
              <View style={styles.placeholderEmoji}>
                <Ionicons
                  name="help-circle-outline"
                  size={32}
                  color={colors.neutral[400]}
                />
              </View>
            )}
          </View>
          <View style={styles.moodCardText}>
            <Text style={styles.moodLabel}>
              {loadingMood ? "..." : mood && mood.mood ? mood.mood : "Not set"}
            </Text>
            <Text style={styles.moodSub}>Your mood today</Text>
          </View>
        </View>

        {/* Fixed Quote Card */}
        <View style={styles.quoteCard}>
          <View style={styles.quoteIconContainer}>
            <Image
              source={require("../../assets/images/quotepng.png")}
              style={styles.quotes}
            />
          </View>
          <View style={styles.quoteCardText}>
            <Text style={styles.quoteText}>
              We write to taste life twice, in the moment and in retrospect.
            </Text>
            <Text style={styles.quoteAuthor}>Anaïs Nin</Text>
          </View>
        </View>
      </View>

      {/* Enhanced Todo Section */}
      <View style={styles.todoSection}>
        <View style={styles.todoHeader}>
          <View style={styles.todoTitleContainer}>
            <View style={styles.todoIconContainer}>
              <Ionicons
                name="list-outline"
                size={20}
                color={colors.primary[600]}
              />
            </View>
            <Text style={styles.todoTitle}>Things to do</Text>
          </View>
          <View style={styles.todoProgressContainer}>
            <Text style={styles.todoProgress}>
              {tasks.filter((t) => t.done).length}/{tasks.length}
            </Text>
          </View>
        </View>

        {tasks.length > 0 ? (
          <ScrollView
            style={styles.tasksList}
            showsVerticalScrollIndicator={false}
            nestedScrollEnabled={true}
          >
            {tasks.map((task, idx) => (
              <View style={styles.todoItem} key={task._id || idx}>
                <Text style={[styles.todoText, task.done && styles.todoDone]}>
                  {task.content}
                </Text>
                <View style={styles.todoActions}>
                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => handleToggleComplete(task._id, task.done)}
                    activeOpacity={0.7}
                  >
                    <Ionicons
                      name={
                        task.done
                          ? "checkmark-circle"
                          : "checkmark-circle-outline"
                      }
                      size={22}
                      color={
                        task.done ? colors.success[500] : colors.neutral[400]
                      }
                    />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => handleDeleteTask(task._id)}
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
            ))}
          </ScrollView>
        ) : (
          <View style={styles.emptyTasksContainer}>
            <Ionicons
              name="clipboard-outline"
              size={40}
              color={colors.neutral[300]}
            />
            <Text style={styles.emptyTasksText}>No tasks for today</Text>
            <Text style={styles.emptyTasksSubtext}>
              Add tasks from the home screen
            </Text>
          </View>
        )}
      </View>

      {/* Enhanced Journal Section */}
      {journal && (
        <View style={styles.journalSection}>
          <View style={styles.journalHeader}>
            {/* <View style={styles.journalTitleContainer}>
              <View style={styles.journalIconContainer}>
                <Ionicons
                  name="book-outline"
                  size={20}
                  color={colors.accent.coral}
                />
              </View>
              <Text style={styles.journalTitle}>Today's Reflection</Text>
            </View> */}
          </View>
          <Pressable
            onPress={() => setJournalModalVisible(true)}
            style={styles.journalPressable}
          >
            <View style={styles.journalItem}>
              <View style={styles.journalHeaderRow}>
                <View style={styles.journalTitleContainerRow}>
                  <View style={styles.journalIconContainerRow}>
                    <Ionicons
                      name="book"
                      size={20}
                      color={colors.accent.coral}
                    />
                  </View>
                  <Text style={styles.journalTitleRow}>Daily Reflection</Text>
                </View>
              </View>
              <Text style={styles.journalContent} numberOfLines={3}>
                {journal.content}
              </Text>
              <View style={styles.journalFooter}>
                <Text style={styles.journalDate}>{displayDate}</Text>
                <Text style={styles.readMoreText}>Tap to read more</Text>
              </View>
            </View>
          </Pressable>
        </View>
      )}

      <View style={styles.bottomSpacing} />

      {/* Enhanced Settings Modal */}
      <Modal
        visible={isModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlayAnalytics}>
          <View style={styles.modalContentAnalytics}>
            <View style={styles.modalHandle} />
            <Pressable
              style={styles.closeButton}
              onPress={() => setModalVisible(false)}
            >
              <Ionicons
                name="close-circle"
                size={28}
                color={colors.accent.coral}
              />
            </Pressable>
            <ScrollView
              style={{ flex: 1 }}
              contentContainerStyle={styles.settingsModalScrollContent}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
              <View style={styles.settingsProfileHeader}>
                <View style={styles.settingsAvatar}>
                  <Ionicons
                    name="person-circle"
                    size={64}
                    color={colors.primary[400]}
                  />
                </View>
                <Text style={styles.settingsTitle}>Profile Settings</Text>
              </View>
              <View style={styles.settingsDivider} />
              <View style={styles.inputGroupSettings}>
                <Text style={styles.inputLabel}>Display Name</Text>
                <TextInput
                  style={styles.input}
                  value={newUsername}
                  onChangeText={setNewUsername}
                  placeholder="How should we call you?"
                  placeholderTextColor={colors.neutral[400]}
                />
              </View>
              <TouchableOpacity
                style={[
                  styles.button,
                  styles.updateButton,
                  loading && styles.buttonDisabled,
                ]}
                onPress={handleUpdateUsername}
                disabled={loading}
                activeOpacity={0.8}
              >
                <Text style={styles.buttonText}>
                  {loading ? "Updating..." : "Update Username"}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.button, styles.signOutButton]}
                onPress={handleSignOut}
                activeOpacity={0.8}
              >
                <Ionicons
                  name="log-out-outline"
                  size={20}
                  color={colors.error[600]}
                  style={styles.buttonIcon}
                />
                <Text style={[styles.buttonText, styles.signOutButtonText]}>
                  Sign Out
                </Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Journal Modal (analytics style) */}
      <Modal
        visible={journalModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setJournalModalVisible(false)}
      >
        <View style={styles.modalOverlayAnalytics}>
          <View style={styles.modalContentAnalytics}>
            <View style={styles.modalHandle} />
            <Pressable
              style={styles.closeButton}
              onPress={() => setJournalModalVisible(false)}
            >
              <Ionicons
                name="close-circle"
                size={28}
                color={colors.accent.coral}
              />
            </Pressable>
            <View style={styles.modalHeaderAnalytics}>
              <View style={styles.modalTitleContainer}>
                <View style={styles.modalIconContainer}>
                  <Ionicons name="book" size={24} color={colors.accent.coral} />
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
                <Text style={styles.modalDate}>{displayDate}</Text>
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
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.neutral[50],
  },

  // Enhanced Profile Header
  profileHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingTop: 48,
    paddingBottom: 16,
  },
  profileInfo: {
    flex: 1,
  },
  greeting: {
    fontSize: 28,
    color: colors.neutral[800],
    marginBottom: 4,
    fontFamily: "Sora-Bold",
    letterSpacing: -0.5,
  },
  editNameButton: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
  },
  editNameText: {
    fontSize: 14,
    color: colors.primary[600],
    marginRight: 4,
    fontFamily: "Ubuntu-Regular",
  },
  settingsButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.neutral[100],
    alignItems: "center",
    justifyContent: "center",
    shadowColor: colors.neutral[400],
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },

  // Enhanced Date Display
  dateContainer: {
    paddingHorizontal: 24,
    marginBottom: 20,
  },
  dateContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  dateIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary[100],
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  dateTextContainer: {
    flex: 1,
  },
  date: {
    fontSize: 18,
    color: colors.neutral[800],
    marginBottom: 2,
    fontFamily: "Sora-Bold",
  },
  atGlance: {
    fontSize: 14,
    color: colors.neutral[500],
    fontFamily: "Ubuntu-Regular",
  },

  // Fixed Cards Row
  rowCards: {
    flexDirection: "row",
    paddingHorizontal: 24,
    marginBottom: 24,
    gap: 12,
  },

  // Fixed Mood Card
  moodCard: {
    backgroundColor: colors.accent.lightPeach,
    borderRadius: 18,
    padding: 16,
    alignItems: "center",
    flex: 1,
    height: 140, // Fixed height
    justifyContent: "center",
    shadowColor: colors.primary[300],
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 1,
    borderColor: colors.primary[100],
  },
  moodCardMood: {
    marginBottom: 12,
  },
  moodEmoji: {
    width: 40,
    height: 40,
  },
  placeholderEmoji: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.neutral[100],
    alignItems: "center",
    justifyContent: "center",
  },
  moodCardText: {
    alignItems: "center",
  },
  moodLabel: {
    fontSize: 16,
    color: colors.accent.gold,
    marginBottom: 4,
    fontFamily: "Sora-Bold",
    textAlign: "center",
  },
  moodSub: {
    fontSize: 12,
    color: colors.neutral[500],
    fontFamily: "Ubuntu-Regular",
    textAlign: "center",
  },

  // Fixed Quote Card
  quoteCard: {
    backgroundColor: colors.accent.peach,
    borderRadius: 18,
    padding: 16,
    flex: 1.2,
    height: 140, // Fixed height
    justifyContent: "space-between",
    shadowColor: colors.accent.coral,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  quoteIconContainer: {
    alignItems: "flex-start",
    marginBottom: 8,
  },
  quotes: {
    width: 30,
    height: 20,
    tintColor: colors.accent.coral,
  },
  quoteCardText: {
    flex: 1,
    justifyContent: "space-between",
  },
  quoteText: {
    fontSize: 13,
    color: colors.accent.coral,
    marginBottom: 8,
    fontFamily: "Ubuntu-Regular",
    lineHeight: 18,
  },
  quoteAuthor: {
    fontSize: 11,
    color: colors.accent.coral,
    opacity: 0.8,
    alignSelf: "flex-end",
    fontFamily: "Ubuntu-Regular",
    fontStyle: "italic",
  },

  // Enhanced Todo Section
  todoSection: {
    backgroundColor: colors.neutral[50],
    borderRadius: 20,
    marginHorizontal: 24,
    marginBottom: 24,
    padding: 20,
    shadowColor: colors.neutral[400],
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1,
    borderColor: colors.neutral[200],
  },
  todoHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  todoTitleContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  todoIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.primary[100],
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
  },
  todoTitle: {
    fontSize: 20,
    color: colors.neutral[800],
    fontFamily: "Sora-Bold",
  },
  todoProgressContainer: {
    backgroundColor: colors.neutral[100],
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  todoProgress: {
    fontSize: 13,
    color: colors.neutral[600],
    fontFamily: "Ubuntu-Regular",
  },
  tasksList: {
    maxHeight: 180,
    minHeight: 100,
  },
  todoItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral[100],
  },
  todoText: {
    fontSize: 15,
    flex: 1,
    color: colors.neutral[700],
    fontFamily: "Ubuntu-Regular",
    lineHeight: 22,
  },
  todoDone: {
    color: colors.accent.sage,
    textDecorationLine: "line-through",
  },
  todoActions: {
    flexDirection: "row",
    alignItems: "center",
  },
  actionButton: {
    padding: 8,
    borderRadius: 8,
  },
  emptyTasksContainer: {
    alignItems: "center",
    paddingVertical: 32,
  },
  emptyTasksText: {
    fontSize: 16,
    color: colors.neutral[500],
    marginTop: 12,
    marginBottom: 4,
    fontFamily: "Ubuntu-Regular",
  },
  emptyTasksSubtext: {
    fontSize: 14,
    color: colors.neutral[400],
    fontFamily: "Ubuntu-Regular",
  },

  // Enhanced Journal Section
  journalSection: {
    marginHorizontal: 24,
    marginBottom: 24,
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
  },
  journalIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.accent.peach,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
  },
  journalTitle: {
    fontSize: 20,
    color: colors.neutral[800],
    fontFamily: "Sora-Bold",
  },
  journalPressable: {
    borderRadius: 16,
  },
  journalItem: {
    backgroundColor: colors.accent.peach,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: colors.accent.lightPeach,
    shadowColor: colors.accent.coral,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  journalHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  journalTitleContainerRow: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  journalIconContainerRow: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.accent.lightPeach,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  journalTitleRow: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.accent.coral,
    fontFamily: "Sora-Bold",
  },
  journalContent: {
    fontSize: 15,
    color: colors.accent.coral,
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
    color: colors.accent.coral,
    fontFamily: "Ubuntu-Regular",
    fontStyle: "italic",
  },
  readMoreText: {
    fontSize: 12,
    color: colors.accent.coral,
    fontFamily: "Ubuntu-Regular",
    fontWeight: "500",
  },

  // Bottom Spacing
  bottomSpacing: {
    height: 32,
  },

  // Enhanced Modal Styles
  modalOverlayAnalytics: {
    flex: 1,
    justifyContent: "flex-end",
    // backgroundColor: "rgba(0, 0, 0, 0.4)",
  },
  modalContentAnalytics: {
    backgroundColor: colors.neutral[50],
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    width: "100%",
    minHeight: "60%",
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
    backgroundColor: colors.accent.peach,
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
  modalHeaderAnalytics: {
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
    backgroundColor: colors.accent.lightPeach,
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
  button: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonIcon: {
    marginRight: 8,
  },
  updateButton: {
    backgroundColor: colors.primary[600],
    shadowColor: colors.primary[600],
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  signOutButton: {
    backgroundColor: colors.error[50],
    borderWidth: 1,
    borderColor: colors.error[200],
  },
  buttonText: {
    color: colors.neutral[50],
    fontSize: 16,
    fontFamily: "Sora-Bold",
  },
  signOutButtonText: {
    color: colors.error[600],
  },
  settingsModalScrollContent: {
    paddingHorizontal: 24,
    paddingTop: 32,
    paddingBottom: 32,
    alignItems: "center",
  },
  settingsProfileHeader: {
    alignItems: "center",
    marginBottom: 16,
  },
  settingsAvatar: {
    marginBottom: 8,
  },
  settingsTitle: {
    fontSize: 22,
    color: colors.neutral[800],
    fontFamily: "Sora-Bold",
    marginBottom: 4,
    textAlign: "center",
  },
  settingsDivider: {
    width: "100%",
    height: 1,
    backgroundColor: colors.neutral[200],
    marginVertical: 16,
    borderRadius: 1,
  },
  inputGroupSettings: {
    width: "100%",
    marginBottom: 24,
  },
  inputLabel: {
    fontSize: 16,
    color: colors.neutral[800],
    fontFamily: "Sora-Bold",
    marginBottom: 8,
  },
  input: {
    width: "100%",
    padding: 12,
    borderWidth: 1,
    borderColor: colors.neutral[200],
    borderRadius: 8,
  },
});
