"use client"

import { Ionicons } from "@expo/vector-icons"
import { useFonts } from "expo-font"
import { useRouter } from "expo-router"
import { useEffect, useRef, useState } from "react"
import { Image, Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native"
import { Circle, Svg } from "react-native-svg"
import Toast from "react-native-toast-message"
import excited from "../../assets/images/excitedmood.png"
import good from "../../assets/images/goodmood.png"
import meh from "../../assets/images/mehmood.png"
import sad from "../../assets/images/sadmood.png"
import stressful from "../../assets/images/stressfullmood.png"
import { supabase } from "../lib/supabase"

// Enhanced color palette
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
}

// IMPORTANT: Replace with your computer's local IP address
const TASK_API_URL = "http://192.168.0.101:8000/api/tasks"
const JOURNAL_API_URL = "http://192.168.0.101:8000/api/journals"
const MOOD_API_URL = "http://192.168.0.101:8000/api/moods"

export default function Home() {
  const [user, setUser] = useState(null)
  const router = useRouter()
  const [selectedMood, setSelectedMood] = useState(null)
  const [task, setTask] = useState("")
  const [todos, setTodos] = useState([])
  const [journalContent, setJournalContent] = useState("")
  const [isJournalModalVisible, setJournalModalVisible] = useState(false)
  const [journalMood, setJournalMood] = useState(null)

  // Pomodoro State
  const [isPomodoroVisible, setPomodoroVisible] = useState(false)
  const [duration, setDuration] = useState("25")
  const [timerCount, setTimerCount] = useState(25 * 60)
  const [timerActive, setTimerActive] = useState(false)
  const [pomodoroStatus, setPomodoroStatus] = useState("idle") // idle, running, finished
  const timerRef = useRef(null)

  const [fontsLoaded] = useFonts({
    "Ubuntu-Regular": require("../../assets/fonts/Ubuntu-Regular.ttf"),
    "Sora-Bold": require("../../assets/fonts/Sora-Bold.ttf"),
  })

  // Get current user
  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      setUser(user)
    }
    getUser()
  }, [])

  useEffect(() => {
    if (user) {
      fetchTasks()
    }
  }, [user])

  useEffect(() => {
    if (!timerActive) return

    timerRef.current = setInterval(() => {
      setTimerCount((prev) => prev - 1)
    }, 1000)

    return () => clearInterval(timerRef.current)
  }, [timerActive])

  useEffect(() => {
    if (timerCount === 0) {
      clearInterval(timerRef.current)
      setTimerActive(false)
      setPomodoroStatus("finished")
      Toast.show({
        type: "success",
        text1: "Timer Finished!",
        text2: "Great focus session!",
      })
    }
  }, [timerCount])

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
  ]

  const fetchTasks = async () => {
    if (!user) return

    try {
      const response = await fetch(`${TASK_API_URL}?userId=${user.id}`)
      if (!response.ok) {
        throw new Error("Failed to fetch tasks")
      }
      const data = await response.json()
      setTodos(data)
    } catch (error) {
      console.error(error)
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Could not fetch tasks from the server.",
      })
    }
  }

  const handleSelectMood = async (moodLabel) => {
    setSelectedMood(moodLabel) // Update UI immediately for responsiveness

    // Get local date in YYYY-MM-DD
    const today = new Date()
    const yyyy = today.getFullYear()
    const mm = String(today.getMonth() + 1).padStart(2, "0")
    const dd = String(today.getDate()).padStart(2, "0")
    const localDate = `${yyyy}-${mm}-${dd}`

    try {
      const response = await fetch(MOOD_API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ mood: moodLabel, localDate, userId: user.id }),
      })

      if (!response.ok) {
        throw new Error("Failed to save mood")
      }

      Toast.show({
        type: "success",
        text1: "Success",
        text2: "Mood status updated.",
      })
    } catch (error) {
      console.error(error)
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Could not save your mood. Please try again.",
      })
      setSelectedMood(null) // Revert UI if the API call fails
    }
  }

  const handleAddTask = async () => {
    if (task.trim() !== "") {
      // Get local date in YYYY-MM-DD
      const today = new Date()
      const yyyy = today.getFullYear()
      const mm = String(today.getMonth() + 1).padStart(2, "0")
      const dd = String(today.getDate()).padStart(2, "0")
      const localDate = `${yyyy}-${mm}-${dd}`

      try {
        const response = await fetch(TASK_API_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ content: task, localDate, userId: user.id }), // include localDate
        })

        if (!response.ok) {
          throw new Error("Failed to add task")
        }

        setTask("")
        fetchTasks() // Refetch tasks to update the list
      } catch (error) {
        console.error(error)
        Toast.show({
          type: "error",
          text1: "Error",
          text2: "Could not add task.",
        })
      }
    }
  }

  const getTodayDate = () => {
    const today = new Date()
    const yyyy = today.getFullYear()
    const mm = String(today.getMonth() + 1).padStart(2, "0")
    const dd = String(today.getDate()).padStart(2, "0")
    return `${yyyy}-${mm}-${dd}`
  }

  const fetchTodayMood = async () => {
    if (!user) return

    const today = getTodayDate()

    try {
      const response = await fetch(`${MOOD_API_URL}/by-date/${today}?userId=${user.id}`)
      if (!response.ok) {
        setJournalMood(null)
        return
      }
      const data = await response.json()
      setJournalMood(data.mood)
    } catch (error) {
      setJournalMood(null)
    }
  }

  const openJournalModal = () => {
    setJournalModalVisible(true)
    fetchTodayMood()
  }

  const handleSaveJournal = async () => {
    if (journalContent.trim() !== "" && journalMood) {
      const today = new Date()
      const yyyy = today.getFullYear()
      const mm = String(today.getMonth() + 1).padStart(2, "0")
      const dd = String(today.getDate()).padStart(2, "0")
      const localDate = `${yyyy}-${mm}-${dd}`

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
        })

        if (!response.ok) {
          throw new Error("Failed to save journal entry")
        }

        setJournalContent("") // Clear input after saving
        Toast.show({
          type: "success",
          text1: "Success",
          text2: "Your journal entry has been saved.",
        })
      } catch (error) {
        console.error(error)
        Toast.show({
          type: "error",
          text1: "Error",
          text2: "Could not save journal entry.",
        })
      }
    } else {
      Toast.show({
        type: "info",
        text1: "Can't Save",
        text2: "Please make sure your mood is set for today and write something in your journal before saving.",
      })
    }
  }

  const handleDelete = async (id) => {
    try {
      const response = await fetch(`${TASK_API_URL}/${id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Failed to delete task")
      }

      fetchTasks() // Refetch
    } catch (error) {
      console.error(error)
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Could not delete task.",
      })
    }
  }

  const handleToggleComplete = async (id, currentStatus) => {
    try {
      const response = await fetch(`${TASK_API_URL}/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ done: !currentStatus }),
      })

      if (!response.ok) {
        throw new Error("Failed to update task")
      }

      fetchTasks() // Refetch
    } catch (error) {
      console.error(error)
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Could not update task.",
      })
    }
  }

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut()
      Toast.show({
        type: "success",
        text1: "Success",
        text2: "Signed out successfully!",
      })
    } catch (error) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Failed to sign out",
      })
    }
  }

  const startPomodoro = () => {
    const mins = Number.parseInt(duration, 10)
    if (mins > 0) {
      setPomodoroStatus("running")
      setTimerCount(mins * 60)
      setTimerActive(true)
    } else {
      Toast.show({
        type: "error",
        text1: "Invalid Duration",
        text2: "Duration must be greater than 0.",
      })
    }
  }

  const resetPomodoro = () => {
    clearInterval(timerRef.current)
    setTimerActive(false)
    setPomodoroStatus("idle")
    const mins = Number.parseInt(duration, 10) || 25
    setTimerCount(mins * 60)
  }

  const handleClosePomodoro = () => {
    resetPomodoro()
    setPomodoroVisible(false)
  }

  const formatTime = (time) => {
    const minutes = Math.floor(time / 60)
    const seconds = time % 60
    return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`
  }

  if (!fontsLoaded) {
    return null // or <AppLoading />
  }

  return (
    <>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View style={styles.greet}>
            <View style={{ flex: 1 }}>
              <Text style={styles.title}>Heya, {user?.user_metadata?.display_name || "User"}!</Text>
              {!user?.user_metadata?.display_name && user && (
                <TouchableOpacity onPress={() => router.push("/(tabs)/you")} activeOpacity={0.7}>
                  <View style={styles.editUsernameContainer}>
                    <Ionicons name="pencil-outline" size={16} color={colors.secondary[600]} />
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
                  style={[styles.moodButton, selectedMood === mood.label && styles.moodButtonSelected]}
                  onPress={() => handleSelectMood(mood.label)}
                >
                  <View style={styles.moodEmojiContainer}>{mood.emoji}</View>
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
              placeholderTextColor={colors.neutral[400]}
              value={task}
              onChangeText={setTask}
            />
            <Pressable style={styles.taskInputSendBtn} onPress={handleAddTask}>
              <Ionicons name="paper-plane-outline" size={20} color={colors.secondary[600]} />
            </Pressable>
          </View>
        </View>

        <View style={styles.tasksListContainer}>
          <ScrollView style={styles.tasksList} showsVerticalScrollIndicator={true} nestedScrollEnabled={true}>
            {todos.map((todo) => (
              <View key={todo._id} style={styles.todoItem}>
                <Text style={[styles.todoText, todo.done && styles.todoTextCompleted]}>{todo.content}</Text>
                <View style={styles.todoActions}>
                  <Pressable onPress={() => handleToggleComplete(todo._id, todo.done)} style={styles.actionButton}>
                    <Ionicons
                      name={todo.done ? "checkmark-circle" : "checkmark-circle-outline"}
                      size={24}
                      color={todo.done ? colors.success[500] : colors.neutral[400]}
                    />
                  </Pressable>
                  <Pressable onPress={() => handleDelete(todo._id)} style={styles.actionButton}>
                    <Ionicons name="trash-outline" size={20} color={colors.neutral[400]} />
                  </Pressable>
                </View>
              </View>
            ))}
          </ScrollView>
        </View>

        <View style={styles.actionContainer}>
          <Pressable style={styles.pomodoroTriggerContainer} onPress={() => setPomodoroVisible(true)}>
            <View style={styles.actionIconContainer}>
              <Ionicons name="timer-outline" size={21} color={colors.primary[600]} />
            </View>
            <Text style={styles.pomodoroTriggerTitle}>Focus Time</Text>
            <Text style={styles.pomodoroTriggerSubtitle}>Pomodoro timer for deep work</Text>
          </Pressable>

          <Pressable style={styles.journalTriggerContainer} onPress={openJournalModal}>
            <View style={styles.actionIconContainer}>
              <Ionicons name="book-outline" size={21} color={colors.secondary[600]} />
            </View>
            <Text style={styles.journalTriggerTitle}>Daily Reflection</Text>
            <Text style={styles.journalTriggerSubtitle}>Write in your journal</Text>
          </Pressable>
        </View>

        {/* Journal Entry Modal */}
        <Modal
          animationType="slide"
          transparent={true}
          visible={isJournalModalVisible}
          onRequestClose={() => {
            setJournalModalVisible(!isJournalModalVisible)
          }}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.journalEntryContainer}>
              {/* Modal Handle */}
              <View style={styles.modalHandle} />
              <Pressable
                style={({ pressed }) => [styles.closeButton, pressed && styles.closeButtonPressed]}
                onPress={() => setJournalModalVisible(false)}
              >
                <Ionicons name="close-circle" size={28} color={colors.secondary[600]} />
              </Pressable>

              <View style={styles.journalHeader}>
                <Text style={styles.journaltitle}>Daily Reflection</Text>
                <View style={styles.moodContainer}>
                  <View style={styles.moodBadge}>
                    <Text style={styles.moodLabelCnt}>Today's Mood:</Text>
                    <Text style={styles.moodValue}>{journalMood ? journalMood : "No mood set for today"}</Text>
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
                    placeholderTextColor={colors.neutral[400]}
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
                    placeholderTextColor={colors.neutral[400]}
                  />
                  <Pressable
                    style={({ pressed }) => [
                      styles.journalInputSendBtn,
                      pressed && styles.sendButtonPressed,
                      !journalContent.trim() && styles.sendButtonDisabled,
                    ]}
                    onPress={() => {
                      handleSaveJournal()
                      setJournalModalVisible(false)
                    }}
                    disabled={!journalContent.trim()}
                  >
                    <Ionicons
                      name="paper-plane"
                      size={18}
                      color={journalContent.trim() ? "#FFFFFF" : "rgba(255, 255, 255, 0.5)"}
                    />
                  </Pressable>
                </View>
              </View>
            </View>
          </View>
        </Modal>
      </ScrollView>

      {/* Pomodoro Modal */}
      <Modal visible={isPomodoroVisible} animationType="slide" transparent={false} onRequestClose={handleClosePomodoro}>
        <View style={styles.pomodoroContainer}>
          <TouchableOpacity style={styles.pomodoroCloseButton} onPress={handleClosePomodoro}>
            <Ionicons name="close" size={28} color={colors.neutral[600]} />
          </TouchableOpacity>

          {pomodoroStatus === "idle" && (
            <View style={styles.pomodoroSettings}>
              <View style={styles.pomodoroIconContainer}>
                <Ionicons name="timer" size={64} color={colors.primary[500]} />
              </View>
              <Text style={styles.pomodoroTitle}>Focus Timer</Text>
              <Text style={styles.pomodoroDescription}>Set your focus duration and start a productive session</Text>

              <View style={styles.pomodoroInputGroup}>
                <Text style={styles.pomodoroLabel}>Duration (minutes)</Text>
                <TextInput
                  style={styles.pomodoroInput}
                  value={duration}
                  onChangeText={setDuration}
                  keyboardType="numeric"
                  placeholderTextColor={colors.neutral[400]}
                />
              </View>

              <TouchableOpacity style={styles.pomodoroStartButton} onPress={startPomodoro}>
                <Text style={styles.pomodoroStartButtonText}>Start Focusing</Text>
              </TouchableOpacity>
            </View>
          )}

          {pomodoroStatus === "running" && (
            <View style={styles.pomodoroTimer}>
              <Text style={styles.pomodoroSessionText}>Focus session in progress</Text>

              <View style={styles.timerWrapper}>
                <Svg width={280} height={280} viewBox="0 0 280 280">
                  <Circle cx="140" cy="140" r="120" stroke={colors.neutral[200]} strokeWidth="12" fill="none" />
                  <Circle
                    cx="140"
                    cy="140"
                    r="120"
                    stroke={colors.primary[500]}
                    strokeWidth="12"
                    fill="none"
                    strokeDasharray={2 * Math.PI * 120}
                    strokeDashoffset={
                      2 * Math.PI * 120 * (1 - timerCount / ((Number.parseInt(duration, 10) || 25) * 60))
                    }
                    strokeLinecap="round"
                    transform="rotate(-90 140 140)"
                  />
                </Svg>
                <Text style={styles.timerText}>{formatTime(timerCount)}</Text>
              </View>

              <TouchableOpacity style={styles.pomodoroResetButton} onPress={resetPomodoro}>
                <Text style={styles.pomodoroResetButtonText}>Stop & Reset</Text>
              </TouchableOpacity>
            </View>
          )}

          {pomodoroStatus === "finished" && (
            <View style={styles.pomodoroFinished}>
              <View style={styles.pomodoroSuccessIcon}>
                <Ionicons name="checkmark-circle" size={80} color={colors.success[500]} />
              </View>
              <Text style={styles.pomodoroFinishedText}>Excellent focus session!</Text>
              <Text style={styles.pomodoroFinishedSubtext}>You've completed your focused work time</Text>

              <TouchableOpacity style={styles.pomodoroStartButton} onPress={resetPomodoro}>
                <Text style={styles.pomodoroStartButtonText}>Start Another Session</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </Modal>
    </>
  )
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.neutral[50],
    flex: 1,
  },
  content: {
    padding: 0,
    backgroundColor: colors.neutral[50],
    height: "100%",
  },
  greet: {
    flexDirection: "row",
    gap: 10,
    marginTop: 20,
    alignItems: "center",
  },
  header: {
    backgroundColor: colors.primary[100],
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    paddingVertical: 20,
    paddingHorizontal: 8,
    shadowColor: colors.primary[300],
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  logo: {
    width: 40,
    height: 40,
    borderRadius: 50,
  },
  title: {
    fontSize: 28,
    fontWeight: "600",
    fontFamily: "Sora-Bold",
    marginTop: 2,
    marginLeft: 10,
    color: colors.neutral[800],
    letterSpacing: -0.5,
  },
  tasktitle: {
    fontSize: 24,
    fontFamily: "Sora-Bold",
    fontWeight: "600",
    marginBottom: 16,
    marginTop: 1,
    marginLeft: 4,
    color: colors.neutral[800],
  },
  journaltitle: {
    fontSize: 26,
    fontFamily: "Sora-Bold",
    fontWeight: "600",
    marginBottom: 12,
    marginTop: 4,
    color: colors.secondary[700],
  },
  moodask: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 1,
    fontFamily: "Sora-Bold",
    color: colors.secondary[700],
    marginTop: 2,
    marginLeft: 10,
  },
  subtitle: {
    fontSize: 16,
    color: colors.neutral[600],
  },
  moodTracker: {
    marginTop: 20,
  },
  moodRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 20,
    width: "100%",
    paddingHorizontal: 4,
  },
  moodButton: {
    alignItems: "center",
    borderRadius: 16,
    marginHorizontal: 2,
    width: "fit-content",
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 8,
    backgroundColor: "rgba(255, 255, 255, 0.6)",
    borderWidth: 2,
    borderColor: "transparent",
    shadowColor: colors.primary[200],
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  moodButtonSelected: {
    backgroundColor: colors.primary[50],
    borderColor: colors.primary[300],
    shadowColor: colors.primary[400],
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
    transform: [{ scale: 1.02 }],
  },
  moodEmojiContainer: {
    marginBottom: 6,
  },
  moodLabelContainer: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 3,
    fontFamily: "Ubuntu-Regular",
  },
  moodEmoji: {
    width: 32,
    height: 32,
  },
  tasksContainer: {
    padding: 15,
  },
  taskInputContainer: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    paddingLeft: 20,
    height: 56,
    backgroundColor: colors.neutral[100],
    alignItems: "center",
    borderRadius: 16,
    paddingRight: 8,
    borderWidth: 1,
    borderColor: colors.neutral[200],
    shadowColor: colors.neutral[300],
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  taskInput: {
    width: "85%",
    fontFamily: "Ubuntu-Regular",
    fontSize: 16,
    color: colors.neutral[700],
  },
  taskInputSendBtn: {
    backgroundColor: colors.primary[100],
    width: 40,
    height: 40,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 20,
    shadowColor: colors.primary[300],
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  tasksListContainer: {
    paddingHorizontal: 24,
    marginTop: 0,
  },
  tasksList: {
    maxHeight: 170,
    minHeight: 170,
  },
  todoItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 5,
    paddingVertical: 5,
    borderRadius: 12,
    marginBottom: 2,
    backgroundColor: colors.neutral[50],
    // borderWidth: 1,
    // borderColor: colors.neutral[200],
    // shadowColor: colors.neutral[300],
    // shadowOffset: {
    //   width: 0,
    //   height: 1,
    // },
    // shadowOpacity: 0.05,
    // shadowRadius: 2,
    // elevation: 1,
  },
  todoText: {
    flex: 1,
    fontSize: 16,
    fontFamily: "Ubuntu-Regular",
    color: colors.neutral[700],
    lineHeight: 22,
  },
  todoTextCompleted: {
    textDecorationLine: "line-through",
    color: colors.neutral[400],
  },
  todoActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  actionButton: {
    padding: 8,
    borderRadius: 8,
  },

  /* Action Container Styles */
  actionContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 16,
    marginHorizontal: 24,
    marginBottom: 42,
  },

  /* Enhanced Action Icon Container */
  actionIconContainer: {
    width: 46,
    height: 46,
    borderRadius: 28,
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
    shadowColor: colors.primary[300],
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },

  /* Enhanced Pomodoro Container */
  pomodoroTriggerContainer: {
    width: "47%",
    height: 160,
    borderRadius: 20,
    backgroundColor: colors.primary[50],
    padding: 20,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: colors.primary[400],
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
    borderWidth: 1,
    borderColor: colors.primary[200],
  },

  pomodoroTriggerTitle: {
    color: colors.primary[700],
    fontSize: 15,
    fontFamily: "Sora-Bold",
    textAlign: "center",
    marginBottom: 6,
  },

  pomodoroTriggerSubtitle: {
    color: colors.primary[600],
    fontSize: 12,
    fontFamily: "Ubuntu-Regular",
    textAlign: "center",
    lineHeight: 20,
  },

  /* Enhanced Journal Container */
  journalTriggerContainer: {
    width: "47%",
    height: 160,
    borderRadius: 20,
    backgroundColor: colors.secondary[50],
    padding: 20,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: colors.secondary[400],
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
    borderWidth: 1,
    borderColor: colors.secondary[200],
  },

  journalTriggerTitle: {
    color: colors.secondary[700],
    fontSize: 15,
    fontFamily: "Sora-Bold",
    textAlign: "center",
    marginBottom: 6,
  },

  journalTriggerSubtitle: {
    color: colors.secondary[600],
    fontSize: 12,
    fontFamily: "Ubuntu-Regular",
    textAlign: "center",
    lineHeight: 20,
  },

  /* Enhanced Modal Styles */
  modalOverlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0, 0, 0, 0.4)",
  },

  journalEntryContainer: {
    backgroundColor: colors.neutral[50],
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
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
    backgroundColor: "rgba(255, 255, 255, 0.8)",
  },

  closeButtonPressed: {
    backgroundColor: colors.secondary[100],
    transform: [{ scale: 0.92 }],
  },

  journalHeader: {
    paddingHorizontal: 24,
    paddingTop: 28,
    paddingBottom: 20,
  },

  moodContainer: {
    marginBottom: 4,
    fontFamily: "Ubuntu-Regular",
  },

  moodLabelCnt: {
    color: colors.secondary[600],
    fontSize: 15,
    fontWeight: "500",
    fontFamily: "Ubuntu-Regular",
  },

  moodBadge: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    backgroundColor: colors.secondary[100],
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },

  moodLabel: {
    fontWeight: "600",
    color: colors.secondary[700],
    fontSize: 8,
    marginRight: 8,
    marginTop: 5,
  },

  moodValue: {
    color: colors.secondary[700],
    fontSize: 15,
    fontWeight: "500",
    fontFamily: "Ubuntu-Regular",
    marginLeft: 8,
  },

  journalContentArea: {
    flex: 1,
    paddingHorizontal: 20,
  },

  journalInputContainer: {
    flex: 1,
    backgroundColor: colors.neutral[50],
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: colors.neutral[200],
    marginBottom: 10,
    shadowColor: colors.neutral[300],
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },

  journalTextInput: {
    flex: 1,
    fontSize: 16,
    lineHeight: 24,
    color: colors.neutral[700],
    textAlignVertical: "top",
    minHeight: 120,
    fontFamily: "Ubuntu-Regular",
  },

  journalBottomSection: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    backgroundColor: colors.secondary[50],
    borderTopWidth: 1,
    borderTopColor: colors.secondary[200],
  },

  quickInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.neutral[50],
    borderRadius: 25,
    paddingHorizontal: 18,
    paddingVertical: 6,
    shadowColor: colors.neutral[400],
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
    borderWidth: 1,
    borderColor: colors.neutral[200],
  },

  quickInput: {
    flex: 1,
    fontSize: 16,
    color: colors.neutral[700],
    paddingVertical: 12,
    paddingRight: 12,
    fontFamily: "Ubuntu-Regular",
  },

  journalInputSendBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.secondary[600],
    alignItems: "center",
    justifyContent: "center",
    shadowColor: colors.secondary[600],
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
    backgroundColor: colors.secondary[700],
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
  },

  sendButtonDisabled: {
    backgroundColor: colors.neutral[400],
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },

  editUsernameContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    marginTop: 4,
    marginLeft: 10,
  },

  editUsernameText: {
    color: colors.secondary[600],
    fontFamily: "Ubuntu-Regular",
    fontSize: 14,
    textDecorationLine: "underline",
  },

  /* Enhanced Pomodoro Modal Styles */
  pomodoroContainer: {
    flex: 1,
    backgroundColor: colors.neutral[50],
    paddingTop: 60,
  },

  pomodoroCloseButton: {
    position: "absolute",
    top: 50,
    right: 20,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.neutral[100],
    alignItems: "center",
    justifyContent: "center",
    zIndex: 10,
    shadowColor: colors.neutral[400],
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },

  /* Enhanced Setup View */
  pomodoroSettings: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 32,
  },

  pomodoroIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: colors.primary[100],
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
    shadowColor: colors.primary[400],
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },

  pomodoroTitle: {
    fontFamily: "Sora-Bold",
    fontSize: 32,
    color: colors.neutral[800],
    textAlign: "center",
    marginBottom: 8,
  },

  pomodoroDescription: {
    fontFamily: "Ubuntu-Regular",
    fontSize: 16,
    color: colors.neutral[600],
    textAlign: "center",
    marginBottom: 40,
    lineHeight: 24,
  },

  pomodoroInputGroup: {
    width: "100%",
    alignItems: "center",
    marginBottom: 40,
  },

  pomodoroLabel: {
    fontFamily: "Sora-Bold",
    fontSize: 16,
    fontWeight: "600",
    color: colors.neutral[700],
    marginBottom: 16,
  },

  pomodoroInput: {
    backgroundColor: colors.neutral[50],
    borderRadius: 16,
    paddingHorizontal: 24,
    paddingVertical: 18,
    fontFamily: "Ubuntu-Regular",
    fontSize: 24,
    fontWeight: "600",
    color: colors.neutral[800],
    textAlign: "center",
    shadowColor: colors.neutral[400],
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 2,
    borderColor: colors.neutral[200],
    width: 120,
  },

  pomodoroStartButton: {
    backgroundColor: colors.primary[500],
    paddingHorizontal: 32,
    paddingVertical: 18,
    borderRadius: 16,
    shadowColor: colors.primary[500],
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },

  pomodoroStartButtonText: {
    fontFamily: "Sora-Bold",
    fontSize: 18,
    color: colors.neutral[50],
    textAlign: "center",
  },

  /* Enhanced Timer Running View */
  pomodoroTimer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 32,
  },

  pomodoroSessionText: {
    fontFamily: "Sora-Bold",
    fontSize: 24,
    color: colors.neutral[700],
    marginBottom: 40,
    textAlign: "center",
  },

  timerWrapper: {
    position: "relative",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 60,
  },

  timerText: {
    position: "absolute",
    fontFamily: "Sora-Bold",
    fontSize: 48,
    fontWeight: "700",
    color: colors.primary[600],
    textAlign: "center",
  },

  pomodoroResetButton: {
    backgroundColor: colors.neutral[100],
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.neutral[200],
  },

  pomodoroResetButtonText: {
    fontFamily: "Sora-Bold",
    fontSize: 16,
    fontWeight: "600",
    color: colors.error[600],
    textAlign: "center",
  },

  /* Enhanced Finished View */
  pomodoroFinished: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 32,
  },

  pomodoroSuccessIcon: {
    marginBottom: 24,
  },

  pomodoroFinishedText: {
    fontFamily: "Sora-Bold",
    fontSize: 28,
    color: colors.neutral[800],
    textAlign: "center",
    marginBottom: 8,
  },

  pomodoroFinishedSubtext: {
    fontFamily: "Ubuntu-Regular",
    fontSize: 16,
    color: colors.neutral[600],
    textAlign: "center",
    marginBottom: 40,
    lineHeight: 24,
  },
})
