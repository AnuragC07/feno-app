import { Ionicons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import {
  Alert,
  Image,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import excited from "../assets/images/excitedmood.png";
import good from "../assets/images/goodmood.png";
import meh from "../assets/images/mehmood.png";
import sad from "../assets/images/sadmood.png";
import stressful from "../assets/images/stressfullmood.png";

// IMPORTANT: Replace with your computer's local IP address
const TASK_API_URL = "http://192.168.0.11:8000/api/tasks";
const JOURNAL_API_URL = "http://192.168.0.11:8000/api/journals";
const MOOD_API_URL = "http://192.168.0.11:8000/api/moods";

export default function Home() {
  const [selectedMood, setSelectedMood] = useState(null);
  const [task, setTask] = useState("");
  const [todos, setTodos] = useState([]);
  const [journalContent, setJournalContent] = useState("");
  const [isJournalModalVisible, setJournalModalVisible] = useState(false);
  const [journalMood, setJournalMood] = useState(null);
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

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const response = await fetch(TASK_API_URL);
      if (!response.ok) {
        throw new Error("Failed to fetch tasks");
      }
      const data = await response.json();
      setTodos(data);
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "Could not fetch tasks from the server.");
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
        body: JSON.stringify({ mood: moodLabel, localDate }),
      });
      if (!response.ok) {
        throw new Error("Failed to save mood");
      }
      Alert.alert("Success", "Mood status updated.");
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "Could not save your mood. Please try again.");
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
          body: JSON.stringify({ content: task, localDate }), // include localDate
        });
        if (!response.ok) {
          throw new Error("Failed to add task");
        }
        setTask("");
        fetchTasks(); // Refetch tasks to update the list
      } catch (error) {
        console.error(error);
        Alert.alert("Error", "Could not add task.");
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
    const today = getTodayDate();
    try {
      const response = await fetch(`${MOOD_API_URL}/by-date/${today}`);
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
          }),
        });

        if (!response.ok) {
          throw new Error("Failed to save journal entry");
        }
        setJournalContent(""); // Clear input after saving
        Alert.alert("Success", "Your journal entry has been saved.");
      } catch (error) {
        console.error(error);
        Alert.alert("Error", "Could not save journal entry.");
      }
    } else {
      Alert.alert(
        "Can't Save",
        "Please make sure your mood is set for today and write something in your journal before saving."
      );
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
      Alert.alert("Error", "Could not delete task.");
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
      Alert.alert("Error", "Could not update task.");
    }
  };

  return (
    <>
      <View style={styles.content}>
        <View style={styles.header}>
          <View style={styles.greet}>
            <Image
              source={require("../assets/images/pexels-stefanstefancik-91227.jpg")}
              style={styles.logo}
            />
            <Text style={styles.title}>Hello, Adrian</Text>
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
                  <Text style={styles.moodLabel}>{mood.label}</Text>
                </Pressable>
              ))}
            </View>
          </View>
        </View>

        <View style={styles.tasksContainer}>
          <Text style={styles.title}>Got things to do?</Text>
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
                <Text style={styles.title}>Reflect on your feelings</Text>
                <View style={styles.moodContainer}>
                  <View style={styles.moodBadge}>
                    <Text style={styles.moodLabel}>Today's Mood:</Text>
                    <Text style={styles.moodValue}>
                      {journalMood ? journalMood : "No mood set for today"}
                    </Text>
                  </View>
                </View>
              </View>

              <View style={styles.journalQuote}>
                <View style={styles.quoteIconWrapper}>
                  <Image
                    source={require("../assets/images/quotepng.png")}
                    style={styles.quotes}
                  />
                </View>
                <Text style={styles.quoteTitle}>
                  Your thoughts matter, let them flow
                </Text>
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
                    placeholder="Quick thought..."
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
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: 0,
    backgroundColor: "white",
    height: "100%",
  },
  greet: {
    flexDirection: "row",
    gap: 10,
    marginTop: 20,
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
    marginBottom: 10,
    marginTop: 4,
  },
  moodask: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 10,
    color: "#916354",
    marginTop: 4,
    marginLeft: 10,
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
  },
  moodTracker: {
    marginTop: 30,
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
  moodEmoji: {
    fontSize: 28,
  },
  // moodLabel: {
  //   fontSize: 12,
  //   marginTop: 4,
  //   color: "#333",
  // },

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
    maxHeight: 300,
    minHeight: 170,
    // borderWidth: 2,
    // borderColor: "red",
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
    color: "#5a5756",
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

  // Styles for the Modal Trigger
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
    fontWeight: "600",
  },
  journalTriggerSubtitle: {
    color: "#D1613D",
    fontSize: 16,
    marginTop: 5,
  },

  // Styles for the Modal
  // modalOverlay: {
  //   flex: 1,
  //   justifyContent: "center",
  //   alignItems: "center",
  //   backgroundColor: "rgba(0, 0, 0, 0.5)",
  // },
  // journalEntryContainer: {
  //   borderTopLeftRadius: 20,
  //   borderTopRightRadius: 20,
  //   marginHorizontal: 20,
  //   backgroundColor: "#FFC7B5",
  //   padding: 20,
  //   height: "70%",
  //   marginTop: "400",
  //   width: "100%",
  // },
  // closeButton: {
  //   position: "absolute",
  //   top: 10,
  //   right: 10,
  // },
  // journalTitle: {
  //   color: "#A0472A",
  //   fontSize: 20,
  //   fontWeight: "600",
  //   marginBottom: 10,
  //   marginTop: 4,
  //   marginLeft: 4,
  // },
  // journalQuote: {
  //   display: "flex",
  //   flexDirection: "row",
  //   gap: 8,
  //   paddingHorizontal: 8,
  //   marginTop: 10,
  // },
  // quoteTitle: {
  //   color: "#D1613D",
  //   fontSize: 20,
  //   fontWeight: "400",
  //   marginBottom: 10,
  //   marginTop: 4,
  //   marginLeft: 4,
  //   fontStyle: "italic",
  // },
  // journalInputContainer: {
  //   display: "flex",
  //   flexDirection: "row",
  //   justifyContent: "space-between",
  //   paddingLeft: 10,
  //   minHeight: 100, // Increased height for multiline
  //   backgroundColor: "#F8D6CC",
  //   alignItems: "flex-start", // Align items to the top
  //   borderRadius: 20,
  //   paddingRight: 10,
  //   paddingTop: 10, // Add padding to the top
  // },
  // journalInputSendBtn: {
  //   backgroundColor: "#ECC1B3",
  //   width: 40,
  //   height: 40,
  //   display: "flex",
  //   alignItems: "center",
  //   justifyContent: "center",
  //   borderRadius: 50,
  // },

  //

  modalOverlay: {
    flex: 1,
    // backgroundColor: "rgba(0, 0, 0, 0.65)",
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
    // backgroundColor: "rgba(160, 71, 42, 0.1)",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 10,
    // shadowColor: "#A0472A",
    // shadowOffset: {
    //   width: 0,
    //   height: 2,
    // },
    // shadowOpacity: 0.1,
    // shadowRadius: 4,
    // elevation: 3,
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
  },
  moodBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 199, 181, 0.25)",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    alignSelf: "flex-start",
    borderWidth: 1,
    borderColor: "rgba(160, 71, 42, 0.1)",
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
    // shadowColor: "#000",
    // shadowOffset: {
    //   width: 0,
    //   height: 2,
    // },
    // shadowOpacity: 0.05,
    // shadowRadius: 8,
    // elevation: 2,
  },
  journalTextInput: {
    flex: 1,
    fontSize: 16,
    lineHeight: 24,
    color: "#5a5756",
    textAlignVertical: "top",
    minHeight: 120,
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
});
