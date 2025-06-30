import { Ionicons } from "@expo/vector-icons";
import { useFonts } from "expo-font";
import { useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
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
import { Circle, Svg } from "react-native-svg";
import Toast from "react-native-toast-message";
import excited from "../../assets/images/excitedmood.png";
import good from "../../assets/images/goodmood.png";
import meh from "../../assets/images/mehmood.png";
import sad from "../../assets/images/sadmood.png";
import stressful from "../../assets/images/stressfullmood.png";
import { supabase } from "../lib/supabase";

// IMPORTANT: Replace with your computer's local IP address
const TASK_API_URL = "http://192.168.0.11:8000/api/tasks";
const JOURNAL_API_URL = "http://192.168.0.11:8000/api/journals";
const MOOD_API_URL = "http://192.168.0.11:8000/api/moods";

export default function Home() {
  const [user, setUser] = useState(null);
  const router = useRouter();
  const [selectedMood, setSelectedMood] = useState(null);
  const [task, setTask] = useState("");
  const [todos, setTodos] = useState([]);
  const [journalContent, setJournalContent] = useState("");
  const [isJournalModalVisible, setJournalModalVisible] = useState(false);
  const [journalMood, setJournalMood] = useState(null);

  // Pomodoro State
  const [isPomodoroVisible, setPomodoroVisible] = useState(false);
  const [duration, setDuration] = useState("25");
  const [timerCount, setTimerCount] = useState(25 * 60);
  const [timerActive, setTimerActive] = useState(false);
  const [pomodoroStatus, setPomodoroStatus] = useState("idle"); // idle, running, finished

  const timerRef = useRef(null);

  const [fontsLoaded] = useFonts({
    "Ubuntu-Regular": require("../../assets/fonts/Ubuntu-Regular.ttf"),
    "Sora-Bold": require("../../assets/fonts/Sora-Bold.ttf"),
  });

  // Get current user
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
    if (user) {
      fetchTasks();
    }
  }, [user]);

  useEffect(() => {
    if (!timerActive) return;

    timerRef.current = setInterval(() => {
      setTimerCount((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timerRef.current);
  }, [timerActive]);

  useEffect(() => {
    if (timerCount === 0) {
      clearInterval(timerRef.current);
      setTimerActive(false);
      setPomodoroStatus("finished");
      Toast.show({
        type: "success",
        text1: "Timer Finished!",
        text2: "Great focus session!",
      });
    }
  }, [timerCount]);

  const moods = [
    {
      label: "Excited",
      emoji: <Image source={excited} style={styles.moodEmoji} />,
    },
    {
      label: "Happy",
      emoji: <Image source={good} style={styles.moodEmoji} />,
    },
    {
      label: "Meh",
      emoji: <Image source={meh} style={styles.moodEmoji} />,
    },
    {
      label: "Sad",
      emoji: <Image source={sad} style={styles.moodEmoji} />,
    },
    {
      label: "Stressful",
      emoji: <Image source={stressful} style={styles.moodEmoji} />,
    },
  ];

  const fetchTasks = async () => {
    if (!user) return;
    try {
      const response = await fetch(`${TASK_API_URL}?userId=${user.id}`);
      if (!response.ok) {
        throw new Error("Failed to fetch tasks");
      }
      const data = await response.json();
      setTodos(data);
    } catch (error) {
      console.error(error);
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Could not fetch tasks from the server.",
      });
    }
  };

  const handleSelectMood = async (moodLabel) => {
    setSelectedMood(moodLabel); // Update UI immediately for responsiveness
    // Get local date in YYYY-MM-DD
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, "0");
    const dd = String(today.getDate()).padStart(2, "0");
    const localDate = `${yyyy}-${mm}-${dd}`;
    try {
      const response = await fetch(MOOD_API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ mood: moodLabel, localDate, userId: user.id }),
      });
      if (!response.ok) {
        throw new Error("Failed to save mood");
      }
      Toast.show({
        type: "success",
        text1: "Success",
        text2: "Mood status updated.",
      });
    } catch (error) {
      console.error(error);
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Could not save your mood. Please try again.",
      });
      setSelectedMood(null); // Revert UI if the API call fails
    }
  };

  const handleAddTask = async () => {
    if (task.trim() !== "") {
      // Get local date in YYYY-MM-DD
      const today = new Date();
      const yyyy = today.getFullYear();
      const mm = String(today.getMonth() + 1).padStart(2, "0");
      const dd = String(today.getDate()).padStart(2, "0");
      const localDate = `${yyyy}-${mm}-${dd}`;

      try {
        const response = await fetch(TASK_API_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ content: task, localDate, userId: user.id }), // include localDate
        });
        if (!response.ok) {
          throw new Error("Failed to add task");
        }
        setTask("");
        fetchTasks(); // Refetch tasks to update the list
      } catch (error) {
        console.error(error);
        Toast.show({
          type: "error",
          text1: "Error",
          text2: "Could not add task.",
        });
      }
    }
  };

  const getTodayDate = () => {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, "0");
    const dd = String(today.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  };

  const fetchTodayMood = async () => {
    if (!user) return;
    const today = getTodayDate();
    try {
      const response = await fetch(
        `${MOOD_API_URL}/by-date/${today}?userId=${user.id}`
      );
      if (!response.ok) {
        setJournalMood(null);
        return;
      }
      const data = await response.json();
      setJournalMood(data.mood);
    } catch (error) {
      setJournalMood(null);
    }
  };

  const openJournalModal = () => {
    setJournalModalVisible(true);
    fetchTodayMood();
  };

  const handleSaveJournal = async () => {
    if (journalContent.trim() !== "" && journalMood) {
      const today = new Date();
      const yyyy = today.getFullYear();
      const mm = String(today.getMonth() + 1).padStart(2, "0");
      const dd = String(today.getDate()).padStart(2, "0");
      const localDate = `${yyyy}-${mm}-${dd}`;
      try {
        const response = await fetch(JOURNAL_API_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            content: journalContent,
            mood: journalMood,
            localDate,
            userId: user.id,
          }),
        });

        if (!response.ok) {
          throw new Error("Failed to save journal entry");
        }
        setJournalContent(""); // Clear input after saving
        Toast.show({
          type: "success",
          text1: "Success",
          text2: "Your journal entry has been saved.",
        });
      } catch (error) {
        console.error(error);
        Toast.show({
          type: "error",
          text1: "Error",
          text2: "Could not save journal entry.",
        });
      }
    } else {
      Toast.show({
        type: "info",
        text1: "Can't Save",
        text2:
          "Please make sure your mood is set for today and write something in your journal before saving.",
      });
    }
  };

  const handleDelete = async (id) => {
    try {
      const response = await fetch(`${TASK_API_URL}/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        throw new Error("Failed to delete task");
      }
      fetchTasks(); // Refetch
    } catch (error) {
      console.error(error);
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Could not delete task.",
      });
    }
  };

  const handleToggleComplete = async (id, currentStatus) => {
    try {
      const response = await fetch(`${TASK_API_URL}/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ done: !currentStatus }),
      });
      if (!response.ok) {
        throw new Error("Failed to update task");
      }
      fetchTasks(); // Refetch
    } catch (error) {
      console.error(error);
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Could not update task.",
      });
    }
  };

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      Toast.show({
        type: "success",
        text1: "Success",
        text2: "Signed out successfully!",
      });
    } catch (error) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Failed to sign out",
      });
    }
  };

  const startPomodoro = () => {
    const mins = parseInt(duration, 10);
    if (mins > 0) {
      setPomodoroStatus("running");
      setTimerCount(mins * 60);
      setTimerActive(true);
    } else {
      Toast.show({
        type: "error",
        text1: "Invalid Duration",
        text2: "Duration must be greater than 0.",
      });
    }
  };

  const resetPomodoro = () => {
    clearInterval(timerRef.current);
    setTimerActive(false);
    setPomodoroStatus("idle");
    const mins = parseInt(duration, 10) || 25;
    setTimerCount(mins * 60);
  };

  const handleClosePomodoro = () => {
    resetPomodoro();
    setPomodoroVisible(false);
  };

  const formatTime = (time) => {
    const minutes = Math.floor(time / 60);
    const seconds = time % 60;
    return `${minutes.toString().padStart(2, "0")}:${seconds
      .toString()
      .padStart(2, "0")}`;
  };

  if (!fontsLoaded) {
    return null; // or <AppLoading />
  }
  return (
    <>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View style={styles.greet}>
            <View style={{ flex: 1 }}>
              <Text style={styles.title}>
                Heya, {user?.user_metadata?.display_name || "User"}!
              </Text>
              {!user?.user_metadata?.display_name && user && (
                <TouchableOpacity onPress={() => router.push("/(tabs)/you")}>
                  <View style={styles.editUsernameContainer}>
                    <Ionicons name="pencil-outline" size={16} color="#916354" />
                    <Text style={styles.editUsernameText}>Set a username</Text>
                  </View>
                </TouchableOpacity>
              )}
            </View>
          </View>
          <View style={styles.moodTracker}>
            <Text style={styles.moodask}>How are you feeling today?</Text>
            <View style={styles.moodRow}>
              {moods.map((mood, idx) => (
                <Pressable
                  key={mood.label}
                  style={[
                    styles.moodButton,
                    selectedMood === mood.label && styles.moodButtonSelected,
                  ]}
                  onPress={() => handleSelectMood(mood.label)}
                >
                  <Text style={styles.moodEmoji}>{mood.emoji}</Text>
                  <View style={styles.moodLabelContainer}>
                    <Text style={styles.moodLabel}>{mood.label}</Text>
                  </View>
                </Pressable>
              ))}
            </View>
          </View>
        </View>

        <View style={styles.tasksContainer}>
          <Text style={styles.tasktitle}>Got things to do?</Text>
          <View style={styles.taskInputContainer}>
            <TextInput
              style={styles.taskInput}
              placeholder="List down your tasks"
              value={task}
              onChangeText={setTask}
            />
            <Pressable style={styles.taskInputSendBtn} onPress={handleAddTask}>
              <Ionicons name="paper-plane-outline" size={24} color="#916354" />
            </Pressable>
          </View>
        </View>

        <View style={styles.tasksListContainer}>
          <ScrollView
            style={styles.tasksList}
            showsVerticalScrollIndicator={true}
            nestedScrollEnabled={true}
          >
            {todos.map((todo) => (
              <View key={todo._id} style={styles.todoItem}>
                <Text
                  style={[
                    styles.todoText,
                    todo.done && styles.todoTextCompleted,
                  ]}
                >
                  {todo.content}
                </Text>
                <View style={styles.todoActions}>
                  <Pressable
                    onPress={() => handleToggleComplete(todo._id, todo.done)}
                    style={styles.actionButton}
                  >
                    <Ionicons
                      name={
                        todo.done
                          ? "checkmark-circle"
                          : "checkmark-circle-outline"
                      }
                      size={24}
                      color={todo.done ? "#4CAF50" : "#BDBDBD"}
                    />
                  </Pressable>
                  <Pressable
                    onPress={() => handleDelete(todo._id)}
                    style={styles.actionButton}
                  >
                    <Ionicons name="trash-outline" size={22} color="#BDBDBD" />
                  </Pressable>
                </View>
              </View>
            ))}
          </ScrollView>
        </View>

        <Pressable
          style={styles.journalTriggerContainer}
          onPress={() => setPomodoroVisible(true)}
        >
          <Text style={styles.journalTriggerTitle}>
            Lets do things one at a time
          </Text>
          <Text style={styles.journalTriggerSubtitle}>
            Pomodoro timer for your tasks
          </Text>
        </Pressable>

        {/* Journal Entry Section - Now a Modal Trigger */}
        <Pressable
          style={styles.journalTriggerContainer}
          onPress={openJournalModal}
        >
          <Text style={styles.journalTriggerTitle}>
            Reflect on your feelings
          </Text>
          <Text style={styles.journalTriggerSubtitle}>
            Write in your journal
          </Text>
        </Pressable>

        {/* Journal Entry Modal */}
        <Modal
          animationType="slide"
          transparent={true}
          visible={isJournalModalVisible}
          onRequestClose={() => {
            setJournalModalVisible(!isJournalModalVisible);
          }}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.journalEntryContainer}>
              {/* Modal Handle */}
              <View style={styles.modalHandle} />

              <Pressable
                style={({ pressed }) => [
                  styles.closeButton,
                  pressed && styles.closeButtonPressed,
                ]}
                onPress={() => setJournalModalVisible(false)}
              >
                <Ionicons name="close-circle" size={28} color="#A0472A" />
              </Pressable>

              <View style={styles.journalHeader}>
                <Text style={styles.journaltitle}>
                  Reflect on your feelings
                </Text>
                <View style={styles.moodContainer}>
                  <View style={styles.moodBadge}>
                    <Text style={styles.moodLabelCnt}>Today&apos;s Mood:</Text>
                    <Text style={styles.moodValue}>
                      {journalMood ? journalMood : "No mood set for today"}
                    </Text>
                  </View>
                </View>
              </View>

              <View style={styles.journalContentArea}>
                <View style={styles.journalInputContainer}>
                  <TextInput
                    style={styles.journalTextInput}
                    placeholder="What's on your mind today? Share your thoughts, feelings, and reflections..."
                    value={journalContent}
                    onChangeText={setJournalContent}
                    multiline
                    textAlignVertical="top"
                    placeholderTextColor="rgba(90, 87, 86, 0.6)"
                  />
                </View>
              </View>

              <View style={styles.journalBottomSection}>
                <View style={styles.quickInputContainer}>
                  <TextInput
                    style={styles.quickInput}
                    placeholder="Start typing..."
                    value={journalContent}
                    onChangeText={setJournalContent}
                    placeholderTextColor="rgba(90, 87, 86, 0.5)"
                  />
                  <Pressable
                    style={({ pressed }) => [
                      styles.journalInputSendBtn,
                      pressed && styles.sendButtonPressed,
                      !journalContent.trim() && styles.sendButtonDisabled,
                    ]}
                    onPress={() => {
                      handleSaveJournal();
                      setJournalModalVisible(false);
                    }}
                    disabled={!journalContent.trim()}
                  >
                    <Ionicons
                      name="paper-plane"
                      size={20}
                      color={
                        journalContent.trim()
                          ? "#FFFFFF"
                          : "rgba(255, 255, 255, 0.5)"
                      }
                    />
                  </Pressable>
                </View>
              </View>
            </View>
          </View>
        </Modal>
      </ScrollView>

      {/* Pomodoro Modal */}
      <Modal
        visible={isPomodoroVisible}
        animationType="slide"
        transparent={false}
        onRequestClose={handleClosePomodoro}
      >
        <View style={styles.pomodoroContainer}>
          <TouchableOpacity
            style={styles.pomodoroCloseButton}
            onPress={handleClosePomodoro}
          >
            <Ionicons name="close" size={32} color="#333" />
          </TouchableOpacity>

          {pomodoroStatus === "idle" && (
            <View style={styles.pomodoroSettings}>
              <Text style={styles.pomodoroTitle}>Focus Timer</Text>
              <View style={styles.pomodoroInputGroup}>
                <Text style={styles.pomodoroLabel}>Duration (minutes)</Text>
                <TextInput
                  style={styles.pomodoroInput}
                  value={duration}
                  onChangeText={setDuration}
                  keyboardType="numeric"
                />
              </View>
              <TouchableOpacity
                style={styles.pomodoroStartButton}
                onPress={startPomodoro}
              >
                <Text style={styles.pomodoroStartButtonText}>
                  Start Focusing
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {pomodoroStatus === "running" && (
            <View style={styles.pomodoroTimer}>
              <Text style={styles.pomodoroSessionText}>Focusing...</Text>
              <View style={styles.timerWrapper}>
                <Svg width={300} height={300} viewBox="0 0 300 300">
                  <Circle
                    cx="150"
                    cy="150"
                    r="140"
                    stroke="#e6e6e6"
                    strokeWidth="15"
                    fill="none"
                  />
                  <Circle
                    cx="150"
                    cy="150"
                    r="140"
                    stroke="#A0472A"
                    strokeWidth="15"
                    fill="none"
                    strokeDasharray={2 * Math.PI * 140}
                    strokeDashoffset={
                      2 *
                      Math.PI *
                      140 *
                      (1 - timerCount / ((parseInt(duration, 10) || 25) * 60))
                    }
                    strokeLinecap="round"
                    transform="rotate(-90 150 150)"
                  />
                </Svg>
                <Text style={styles.timerText}>{formatTime(timerCount)}</Text>
              </View>
              <TouchableOpacity
                style={styles.pomodoroResetButton}
                onPress={resetPomodoro}
              >
                <Text style={styles.pomodoroResetButtonText}>Stop & Reset</Text>
              </TouchableOpacity>
            </View>
          )}

          {pomodoroStatus === "finished" && (
            <View style={styles.pomodoroFinished}>
              <Text style={styles.pomodoroFinishedText}>
                Great focus session!
              </Text>
              <TouchableOpacity
                style={styles.pomodoroStartButton}
                onPress={resetPomodoro}
              >
                <Text style={styles.pomodoroStartButtonText}>
                  Set Another Timer
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "white",
    flex: 1,
  },
  content: {
    padding: 0,
    backgroundColor: "white",
    height: "100%",
  },
  greet: {
    flexDirection: "row",
    gap: 10,
    marginTop: 20,
    alignItems: "center",
  },
  header: {
    backgroundColor: "#ffe6de",
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
    padding: 20,
  },
  logo: {
    width: 40,
    height: 40,
    borderRadius: 50,
  },
  title: {
    fontSize: 24,
    fontWeight: "600",
    fontFamily: "Sora-Bold",
    marginTop: 2,
  },
  tasktitle: {
    fontSize: 24,
    fontFamily: "Sora-Bold",
    fontWeight: "600",
    marginBottom: 10,
    marginTop: 4,
  },
  journaltitle: {
    fontSize: 24,
    fontFamily: "Sora-Bold",
    fontWeight: "600",
    marginBottom: 10,
    marginTop: 4,
  },
  moodask: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 10,
    fontFamily: "Sora-Bold",
    color: "#916354",
    marginTop: 4,
    marginLeft: 10,
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
  },
  moodTracker: {
    marginTop: 10,
  },
  moodRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 15,
    width: "100%",
  },
  moodButton: {
    alignItems: "center",
    borderRadius: 10,
    marginHorizontal: 5,
    width: "fit-content",
    flex: 1,
  },
  moodLabelContainer: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 3,
    fontFamily: "Ubuntu-Regular",
  },
  moodEmoji: {
    fontSize: 28,
  },
  tasksContainer: {
    padding: 20,
  },
  taskInputContainer: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    paddingLeft: 10,
    height: 60,
    backgroundColor: "#f4edec",
    alignItems: "center",
    borderRadius: 20,
    paddingRight: 10,
  },
  taskInput: {
    width: "85%",
    fontFamily: "Ubuntu-Regular",
  },
  taskInputSendBtn: {
    backgroundColor: "#f0dfdf",
    width: 40,
    height: 40,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 50,
  },
  tasksListContainer: {
    paddingHorizontal: 20,
    marginTop: 0,
  },
  tasksList: {
    maxHeight: 185,
    minHeight: 170,
  },
  todoItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
    marginBottom: 4,
  },
  todoText: {
    flex: 1,
    fontSize: 16,
    fontFamily: "Ubuntu-Regular",
    color: "#787878",
  },
  todoTextCompleted: {
    textDecorationLine: "line-through",
    color: "#888",
  },
  todoActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    color: "#736f6e",
  },
  actionButton: {
    padding: 8,
  },
  journalTriggerContainer: {
    borderRadius: 20,
    marginHorizontal: 20,
    backgroundColor: "#FFC7B5",
    padding: 10,
    marginTop: 10,
    alignItems: "center",
  },
  journalTriggerTitle: {
    color: "#A0472A",
    fontSize: 20,
    fontFamily: "Sora-Bold",
    fontWeight: 600,
  },
  journalTriggerSubtitle: {
    color: "#D1613D",
    fontSize: 16,
    marginTop: 5,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "flex-end",
  },
  journalEntryContainer: {
    backgroundColor: "white",
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    minHeight: "75%",
    maxHeight: "85%",
    shadowColor: "#000",
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
    backgroundColor: "rgba(160, 71, 42, 0.3)",
    borderRadius: 3,
    alignSelf: "center",
    marginBottom: 8,
  },
  closeButton: {
    position: "absolute",
    top: 16,
    right: 20,
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 10,
  },
  closeButtonPressed: {
    backgroundColor: "rgba(160, 71, 42, 0.2)",
    transform: [{ scale: 0.92 }],
    shadowOpacity: 0.05,
  },
  journalHeader: {
    paddingHorizontal: 24,
    paddingTop: 28,
    paddingBottom: 20,
  },
  journalTitle: {
    color: "#A0472A",
    fontSize: 26,
    fontWeight: "700",
    marginBottom: 16,
    letterSpacing: -0.3,
    lineHeight: 32,
  },
  moodContainer: {
    marginBottom: 4,
    fontFamily: "Ubuntu-Regular",
  },
  moodLabelCnt: {
    color: "#D1613D",
    fontSize: 15,
    fontWeight: "500",
    fontFamily: "Ubuntu-Regular",
  },
  moodBadge: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
  },
  moodLabel: {
    fontWeight: "600",
    color: "#A0472A",
    fontSize: 10,
    marginRight: 8,
    marginTop: 5,
  },
  moodValue: {
    color: "#D1613D",
    fontSize: 15,
    fontWeight: "500",
    fontFamily: "Ubuntu-Regular",
    marginLeft: 8,
  },
  journalQuote: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 24,
    marginBottom: 24,
    backgroundColor: "rgba(209, 97, 61, 0.08)",
    marginHorizontal: 20,
    paddingVertical: 16,
    borderRadius: 18,
    borderLeftWidth: 4,
    borderLeftColor: "#D1613D",
  },
  quoteIconWrapper: {
    marginRight: 12,
    opacity: 0.8,
  },
  quotes: {
    width: 31,
    height: 20,
    tintColor: "#D1613D",
  },
  quoteTitle: {
    color: "#D1613D",
    fontSize: 16,
    fontWeight: "500",
    fontStyle: "italic",
    flex: 1,
    lineHeight: 22,
    opacity: 0.9,
  },
  journalContentArea: {
    flex: 1,
    paddingHorizontal: 20,
  },
  journalInputContainer: {
    flex: 1,
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: "rgba(160, 71, 42, 0.08)",
    marginBottom: 10,
  },
  journalTextInput: {
    flex: 1,
    fontSize: 16,
    lineHeight: 24,
    color: "#5a5756",
    textAlignVertical: "top",
    minHeight: 120,
    fontFamily: "Ubuntu-Regular",
  },
  journalBottomSection: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    backgroundColor: "#FFE6DE",
    borderTopWidth: 1,
    borderTopColor: "rgba(160, 71, 42, 0.08)",
  },
  quickInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    borderRadius: 25,
    paddingHorizontal: 18,
    paddingVertical: 6,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
    borderWidth: 1,
    borderColor: "rgba(160, 71, 42, 0.05)",
  },
  quickInput: {
    flex: 1,
    fontSize: 16,
    color: "#5a5756",
    paddingVertical: 12,
    paddingRight: 12,
  },
  journalInputSendBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#A0472A",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#A0472A",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  sendButtonPressed: {
    transform: [{ scale: 0.94 }],
    backgroundColor: "#8A3E24",
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
  },
  sendButtonDisabled: {
    backgroundColor: "rgba(160, 71, 42, 0.4)",
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  editUsernameContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    marginTop: 4,
  },
  editUsernameText: {
    color: "#916354",
    fontFamily: "Ubuntu-Regular",
    fontSize: 14,
    textDecorationLine: "underline",
  },
  pomodoroContainer: {
    flex: 1,
    backgroundColor: "#fff8f7",
    alignItems: "center",
    justifyContent: "center",
  },
  pomodoroCloseButton: {
    position: "absolute",
    top: 50,
    right: 20,
    padding: 10,
  },
  pomodoroSettings: {
    width: "80%",
    alignItems: "center",
  },
  pomodoroTitle: {
    fontSize: 32,
    fontFamily: "Sora-Bold",
    color: "#333",
    marginBottom: 40,
  },
  pomodoroInputGroup: {
    marginBottom: 20,
    width: "100%",
  },
  pomodoroLabel: {
    fontSize: 18,
    fontFamily: "Ubuntu-Regular",
    color: "#666",
    marginBottom: 10,
  },
  pomodoroInput: {
    backgroundColor: "white",
    borderRadius: 10,
    padding: 15,
    fontSize: 18,
    textAlign: "center",
    fontFamily: "Sora-Bold",
    color: "#333",
  },
  pomodoroStartButton: {
    backgroundColor: "#A0472A",
    paddingVertical: 15,
    paddingHorizontal: 60,
    borderRadius: 30,
    marginTop: 20,
  },
  pomodoroStartButtonText: {
    color: "white",
    fontSize: 20,
    fontFamily: "Sora-Bold",
  },
  pomodoroTimer: {
    alignItems: "center",
    justifyContent: "center",
  },
  timerWrapper: {
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 40,
  },
  timerText: {
    position: "absolute",
    fontSize: 64,
    fontFamily: "Sora-Bold",
    color: "#333",
  },
  pomodoroSessionText: {
    fontSize: 24,
    fontFamily: "Ubuntu-Regular",
    color: "#666",
    textTransform: "capitalize",
  },
  pomodoroResetButton: {
    marginTop: 20,
    backgroundColor: "#f0f0f0",
    paddingVertical: 10,
    paddingHorizontal: 40,
    borderRadius: 20,
  },
  pomodoroResetButtonText: {
    color: "#333",
    fontSize: 16,
    fontFamily: "Sora-Bold",
  },
  pomodoroFinished: {
    alignItems: "center",
  },
  pomodoroFinishedText: {
    fontSize: 28,
    fontFamily: "Sora-Bold",
    color: "#333",
    marginBottom: 40,
    textAlign: "center",
  },
});
