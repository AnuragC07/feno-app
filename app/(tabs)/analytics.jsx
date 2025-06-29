import { Ionicons } from "@expo/vector-icons";
import { useFonts } from "expo-font";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
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

const API_BASE = "http://192.168.0.11:8000/api"; // Change if needed

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
  const [confirmDeleteVisible, setConfirmDeleteVisible] = useState(false);
  const [fontsLoaded] = useFonts({
    "Ubuntu-Regular": require("../../assets/fonts/Ubuntu-Regular.ttf"),
    "Sora-Bold": require("../../assets/fonts/Sora-Bold.ttf"),
  });
  // Fetch all dates with todos and journals for calendar dots
  const fetchDates = useCallback(async () => {
    setLoadingDates(true);
    try {
      const [todoRes, journalRes] = await Promise.all([
        fetch(`${API_BASE}/tasks/dates`),
        fetch(`${API_BASE}/journals/dates`),
      ]);
      let todoDatesRaw = await todoRes.json();
      let journalDatesRaw = await journalRes.json();
      const todoDates = Array.isArray(todoDatesRaw) ? todoDatesRaw : [];
      const journalDates = Array.isArray(journalDatesRaw)
        ? journalDatesRaw
        : [];
      setTodoDates(todoDates);
      setJournalDates(journalDates);
      // console.log("todoDates", todoDates);
      // console.log("journalDates", journalDates);
    } catch (e) {
      // handle error
      setTodoDates([]);
      setJournalDates([]);
      // console.log("Error fetching dates", e);
    } finally {
      setLoadingDates(false);
    }
  }, []);

  // Fetch todos and journal for selected date
  const fetchDataForDate = useCallback(async (date) => {
    setLoading(true);
    try {
      const [todosRes, journalRes] = await Promise.all([
        fetch(`${API_BASE}/tasks/by-date/${date}`),
        fetch(`${API_BASE}/journals/by-date/${date}`),
      ]);
      let todosRaw = await todosRes.json();
      let journal = null;
      if (journalRes.status === 200) {
        journal = await journalRes.json();
      }
      const todos = Array.isArray(todosRaw) ? todosRaw : [];
      setTodos(todos);
      setJournal(journal);
      // console.log("todos", todos);
      // console.log("journal", journal);
    } catch (e) {
      setTodos([]);
      setJournal(null);
      // console.log("Error fetching data for date", e);
    } finally {
      setLoading(false);
    }
  }, []);

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
        color: "#007AFF",
        selectedDotColor: "#ffffff",
      });
    });

    // Add dots for dates with journals
    journalDates.forEach((date) => {
      if (!marked[date]) {
        marked[date] = { dots: [] };
      }
      marked[date].dots.push({
        color: "#FF8C00",
        selectedDotColor: "#ffffff",
      });
    });

    // Mark selected date
    if (marked[selectedDate]) {
      marked[selectedDate].selected = true;
      marked[selectedDate].selectedColor = "#ffe6de";
    } else {
      marked[selectedDate] = {
        selected: true,
        selectedColor: "#2d4150",
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
    Alert.alert("Delete Todo", "Are you sure you want to delete this todo?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            await fetch(`${API_BASE}/tasks/${id}`, { method: "DELETE" });
            fetchDataForDate(selectedDate);
            fetchDates();
          } catch (e) {}
        },
      },
    ]);
  };

  // Delete journal
  const deleteJournal = (id) => {
    Alert.alert(
      "Delete Journal",
      "Are you sure you want to delete this journal entry?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await fetch(`${API_BASE}/journals/${id}`, { method: "DELETE" });
              fetchDataForDate(selectedDate);
              fetchDates();
            } catch (e) {}
          },
        },
      ]
    );
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

  const handleDeleteJournal = () => {
    if (journal && journal._id) {
      setConfirmDeleteVisible(true);
    }
  };

  const confirmDeleteJournal = async () => {
    setConfirmDeleteVisible(false);
    if (journal && journal._id) {
      try {
        await fetch(`${API_BASE}/journals/${journal._id}`, {
          method: "DELETE",
        });
        setJournalModalVisible(false);
        fetchDataForDate(selectedDate);
        fetchDates();
      } catch (e) {}
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
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Let&apos;s have a look</Text>
          <Text style={styles.subtitle}>How you&apos;ve been lately</Text>
        </View>

        {/* Calendar */}
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
              backgroundColor: "#ffffff",
              calendarBackground: "#ffffff",
              textSectionTitleColor: "#916354",
              selectedDayBackgroundColor: "#4A90E2",
              selectedDayTextColor: "#ffffff",
              todayTextColor: "#916354",
              dayTextColor: "#2d3748",
              textDisabledColor: "#d9e1e8",
              dotColor: "#007AFF",
              selectedDotColor: "#ffffff",
              arrowColor: "#916354",
              disabledArrowColor: "#d9e1e8",
              monthTextColor: "#2d4150",
              indicatorColor: "#4A90E2",
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

        {/* Selected Date Display */}
        <View style={styles.youContainer}>
          <View style={styles.dateHeader}>
            <Text style={styles.selectedDate}>
              You on {formatDate(selectedDate)}
            </Text>
            <View style={styles.legend}>
              <View style={styles.legendItem}>
                <View
                  style={[styles.legendDot, { backgroundColor: "#007AFF" }]}
                />
                <Text style={styles.legendText}>Todos</Text>
              </View>
              <View style={styles.legendItem}>
                <View
                  style={[styles.legendDot, { backgroundColor: "#FF8C00" }]}
                />
                <Text style={styles.legendText}>Journal</Text>
              </View>
            </View>
          </View>

          {/* Todos Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Todos ({todos.length})</Text>
            </View>
            <View style={styles.itemsList}>
              {loading ? (
                <ActivityIndicator size="small" color="#4A90E2" />
              ) : todos.length === 0 ? (
                <Text style={styles.emptyText}>No todos for this date</Text>
              ) : (
                todos.map((todo) => (
                  <View key={todo._id} style={styles.todoItem}>
                    <Text
                      style={[
                        styles.todoText,
                        todo.done && styles.todoTextCompleted,
                      ]}
                    >
                      {todo.content}
                    </Text>
                    <TouchableOpacity
                      style={styles.checkbox}
                      onPress={() => toggleTodo(todo._id, todo.done)}
                    >
                      <Ionicons
                        name={
                          todo.done
                            ? "checkmark-circle"
                            : "checkmark-circle-outline"
                        }
                        size={22}
                        color={todo.done ? "#4CAF50" : "#787878"}
                      />
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.checkbox}
                      onPress={() => deleteTodo(todo._id)}
                    >
                      <Ionicons
                        name="trash-outline"
                        size={22}
                        color="#787878"
                      />
                    </TouchableOpacity>
                  </View>
                ))
              )}
            </View>
          </View>

          {/* Journal Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>
                Journal ({journal ? 1 : 0})
              </Text>
            </View>
            <View style={styles.itemsList}>
              {loading ? (
                <ActivityIndicator size="small" color="#4A90E2" />
              ) : !journal ? (
                <Text style={styles.emptyText}>
                  No journal entries for this date
                </Text>
              ) : (
                <Pressable onPress={() => setJournalModalVisible(true)}>
                  <View style={styles.journalItem}>
                    <View style={styles.journalHeader}>
                      <View style={styles.journalTitleContainer}>
                        <Ionicons
                          name="book-outline"
                          size={20}
                          color="#2d3748"
                          style={styles.journalIcon}
                        />
                      </View>
                      <TouchableOpacity
                        style={styles.deleteButton}
                        onPress={handleDeleteJournal}
                      >
                        <Ionicons
                          name="trash-outline"
                          size={20}
                          color="#e53e3e"
                        />
                      </TouchableOpacity>
                    </View>
                    <Text style={styles.journalContent} numberOfLines={2}>
                      {journal.content}
                    </Text>
                    <Text style={styles.journalDate}>
                      {formatDate(selectedDate)}
                    </Text>
                  </View>
                </Pressable>
              )}
            </View>
          </View>
        </View>
      </ScrollView>
      {/* Journal Modal */}
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
              <Ionicons name="close-circle" size={28} color="#A0472A" />
            </Pressable>

            <View style={styles.modalHeader}>
              <View style={styles.modalTitleContainer}>
                <Ionicons
                  name="book"
                  size={24}
                  color="#2d3748"
                  style={styles.modalIcon}
                />
                <Text style={styles.modalTitle}>
                  {journal?.title || "Journal Entry"}
                </Text>
              </View>
            </View>

            <View style={styles.modalDateContainer}>
              <View style={styles.modalDateWrapper}>
                <Ionicons name="calendar-outline" size={16} color="#718096" />
                <Text style={styles.modalDate}>{formatDate(selectedDate)}</Text>
              </View>
            </View>

            <View style={styles.modalBodyContainer}>
              <Ionicons
                name="chatbubble-outline"
                size={20}
                color="#4a5568"
                style={styles.modalBodyIcon}
              />
              <Text style={styles.modalBody}>{journal?.content}</Text>
            </View>

            <View style={styles.modalBottomSection}>
              <TouchableOpacity
                onPress={handleDeleteJournal}
                style={styles.modalDeleteButton}
              >
                <Ionicons name="trash-outline" size={20} color="#e53e3e" />
                <Text style={styles.deleteButtonText}>Delete Entry</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
      {/* Confirm Delete Modal */}
      <Modal
        visible={confirmDeleteVisible}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setConfirmDeleteVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.confirmModalContent}>
            <Text style={styles.confirmText}>
              Are you sure you want to delete this journal entry?
            </Text>
            <View style={styles.confirmButtons}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setConfirmDeleteVisible(false)}
              >
                <Text style={styles.cancelButtonText}>Nope</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.deleteButton}
                onPress={confirmDeleteJournal}
              >
                <Text style={styles.deleteButtonText}>Delete</Text>
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
    backgroundColor: "#f8f9fa",
  },
  scrollView: {
    flex: 1,
  },
  header: {
    padding: 20,
    paddingBottom: 10,
  },
  title: {
    fontSize: 28,
    // fontWeight: "bold",
    color: "black",
    marginBottom: 5,
    fontFamily: "Sora-Bold",
  },
  subtitle: {
    fontSize: 16,
    color: "#718096",
    fontFamily: "Ubuntu-Regular",
  },
  calendarContainer: {
    margin: 20,
    backgroundColor: "#ffffff",
    borderRadius: 15,
    padding: 10,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
    fontFamily: "Ubuntu-Regular",
  },
  dateHeader: {
    paddingHorizontal: 20,
    paddingVertical: 1,
    // backgroundColor: "#ffffff",
    marginHorizontal: 0,
    marginBottom: 10,
    // borderRadius: 15,
    // shadowColor: "#000",
    // shadowOffset: {
    //   width: 0,
    //   height: 1,
    // },
    // shadowOpacity: 0.05,
    // shadowRadius: 2,
    // elevation: 2,
  },
  selectedDate: {
    fontSize: 20,
    fontWeight: "600",
    color: "#2d3748",
    marginBottom: 10,
    fontFamily: "Sora-Bold",
  },
  legend: {
    flexDirection: "row",
    justifyContent: "flex-start",
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 20,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  legendText: {
    fontSize: 14,
    color: "#718096",
  },
  section: {
    marginHorizontal: 20,
    marginBottom: 20,
    // borderWidth: 2,
    // borderColor: "red",
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 20,
    color: "#2d3748",
    fontFamily: "Sora-Bold",
  },
  itemsList: {
    // backgroundColor: "#ffffff",
    // borderRadius: 15,
    // padding: 15,
    // shadowColor: "#000",
    // shadowOffset: {
    //   width: 0,
    //   height: 1,
    // },
    // shadowOpacity: 0.05,
    // shadowRadius: 2,
    // elevation: 2,
  },
  emptyText: {
    textAlign: "center",
    color: "#718096",
    fontSize: 16,
    paddingVertical: 20,
    fontFamily: "Ubuntu-Regular",
  },
  todoItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
    paddingVertical: 8,
  },
  todoText: {
    flex: 1,
    fontSize: 15,
    fontFamily: "Ubuntu-Regular",
    color: "#787878",
  },
  todoTextCompleted: {
    color: "#787878",
    textDecorationLine: "line-through",
  },
  checkbox: {
    marginLeft: 10,
  },
  deleteButton: {
    padding: 5,
  },
  journalItem: {
    backgroundColor: "#FFC7B5",
    borderRadius: 18,
    padding: 18,
    marginBottom: 10,
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
  journalIcon: {
    marginRight: 8,
  },
  journalTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#2d3748",
    flex: 1,
  },
  journalContent: {
    fontSize: 15,
    color: "#A0472A",
    lineHeight: 22,
    marginBottom: 8,
    fontFamily: "Ubuntu-Regular",
  },
  journalDate: {
    fontSize: 12,
    color: "#c66a4d",
    fontFamily: "Ubuntu-Regular",
    fontStyle: "italic",
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "white",
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    width: "100%",
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
  modalIcon: {
    marginRight: 10,
  },
  modalTitle: {
    fontSize: 26,
    color: "#2d3748",
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
  },
  modalDate: {
    fontSize: 14,
    color: "#718096",
    marginLeft: 6,
    fontStyle: "italic",
    fontFamily: "Ubuntu-Regular",
  },
  modalBodyContainer: {
    flexDirection: "row",
    marginBottom: 24,
    paddingHorizontal: 24,
    flex: 1,
  },
  modalBodyIcon: {
    marginRight: 12,
    marginTop: 2,
  },
  modalBody: {
    fontSize: 16,
    color: "#4a5568",
    lineHeight: 24,
    flex: 1,
    fontFamily: "Ubuntu-Regular",
  },
  modalBottomSection: {
    paddingHorizontal: 24,
    paddingVertical: 20,
    borderTopWidth: 1,
    borderTopColor: "#f1f5f9",
  },
  modalDeleteButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fef2f2",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#fecaca",
  },
  deleteButtonText: {
    color: "#e53e3e",
    fontSize: 16,
    marginLeft: 8,
    fontFamily: "Sora-Bold",
  },
  confirmModalContent: {
    backgroundColor: "#fff",
    borderRadius: 15,
    padding: 24,
    width: "100%",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  confirmText: {
    fontSize: 16,
    color: "#2d3748",
    marginBottom: 20,
    textAlign: "center",
    fontFamily: "Sora-Bold",
  },
  confirmButtons: {
    flexDirection: "row",
    justifyContent: "flex-end",
    width: "100%",
  },
  cancelButton: {
    // backgroundColor: "#e53e3e",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    marginRight: 10,
  },
  cancelButtonText: {
    color: "#718096",
    fontSize: 16,
    fontWeight: "600",
    fontFamily: "Sora-Bold",
  },

  //
  youContainer: {
    // borderWidth: 2,
    // borderColor: "red",
    padding: 2,
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
    backgroundColor: "#ffe6de",
    paddingTop: 25,
    paddingBottom: 65,
  },
});
