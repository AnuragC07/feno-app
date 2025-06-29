import { Ionicons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import excited from "../../assets/images/excitedmood.png";
import good from "../../assets/images/goodmood.png";
import meh from "../../assets/images/mehmood.png";
import sad from "../../assets/images/sadmood.png";
import stressful from "../../assets/images/stressfullmood.png";

export default function YouScreen() {
  const [tasks, setTasks] = useState([]);
  const [mood, setMood] = useState(null);
  const [loadingMood, setLoadingMood] = useState(true);
  const [journal, setJournal] = useState(null);

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
    const fetchMood = async () => {
      setLoadingMood(true);
      try {
        const res = await fetch(
          `http://192.168.0.11:8000/api/moods/by-date/${todayStr}`
        );
        if (!res.ok) {
          setMood(null);
        } else {
          const data = await res.json();
          console.log("Fetched mood data:", data);
          setMood(data);
        }
      } catch (e) {
        setMood(null);
      } finally {
        setLoadingMood(false);
      }
    };
    fetchMood();
  }, [todayStr]);

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const res = await fetch(
          `http://192.168.0.11:8000/api/tasks/by-date/${todayStr}`
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
  }, [todayStr]);

  useEffect(() => {
    const fetchJournal = async () => {
      try {
        const res = await fetch(
          `http://192.168.0.11:8000/api/journals/by-date/${todayStr}`
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
  }, [todayStr]);

  const handleDeleteTask = async (id) => {
    try {
      const res = await fetch(`http://192.168.0.11:8000/api/tasks/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setTasks((prev) => prev.filter((task) => task._id !== id));
      }
    } catch (e) {}
  };

  const handleToggleComplete = async (id, currentStatus) => {
    try {
      const res = await fetch(`http://192.168.0.11:8000/api/tasks/${id}`, {
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

  const completedCount = tasks.filter((t) => t.done).length;

  return (
    <View style={styles.container}>
      <View style={styles.profileHeader}>
        <Image
          source={require("../../assets/images/pexels-stefanstefancik-91227.jpg")}
          style={styles.avatar}
        />
        <View>
          <Text style={styles.greeting}>Hello, Adrian</Text>
        </View>
      </View>
      <View style={styles.greeting2}>
        <Text style={styles.date}>{displayDate}</Text>
        <Text style={styles.atGlance}>At a glance</Text>
      </View>
      <View style={styles.rowCards}>
        <View style={styles.moodCard}>
          <View style={styles.moodCardMood}>
            {mood && mood.mood === "Happy" && (
              <Image source={good} style={styles.moodEmoji} />
            )}
            {mood && mood.mood === "Excited" && (
              <Image source={excited} style={styles.moodEmoji} />
            )}
            {mood && mood.mood === "Meh" && (
              <Image source={meh} style={styles.moodEmoji} />
            )}
            {mood && mood.mood === "Sad" && (
              <Image source={sad} style={styles.moodEmoji} />
            )}
            {mood && mood.mood === "Stressful" && (
              <Image source={stressful} style={styles.moodEmoji} />
            )}
          </View>
          <View style={styles.moodCardText}>
            <Text style={styles.moodLabel}>
              {loadingMood
                ? "..."
                : mood && mood.mood
                ? mood.mood
                : "How are you today?"}
            </Text>
            <Text style={styles.moodSub}>Your mood today</Text>
          </View>
        </View>
        <View style={styles.quoteCard}>
          <View style={styles.quoteCardMood}>
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

      <View style={styles.todoSection}>
        <View style={styles.todoHeader}>
          <Text style={styles.todoTitle}>Things to do</Text>
          <Text style={styles.todoProgress}>
            {tasks.filter((t) => t.done).length}/{tasks.length}
          </Text>
        </View>
        <ScrollView
          style={styles.tasksList}
          showsVerticalScrollIndicator={true}
        >
          {tasks.map((task, idx) => (
            <View style={styles.todoItem} key={task._id || idx}>
              <Text style={[styles.todoText, task.done && styles.todoDone]}>
                {task.content}
              </Text>
              <Pressable
                style={styles.checkbox}
                onPress={() => handleToggleComplete(task._id, task.done)}
              >
                <Ionicons
                  name={
                    task.done ? "checkmark-circle" : "checkmark-circle-outline"
                  }
                  size={22}
                  color={task.done ? "#4CAF50" : "#ccc"}
                />
              </Pressable>
              <Pressable
                style={styles.checkbox}
                onPress={() => handleDeleteTask(task._id)}
              >
                <Ionicons name="trash-outline" size={22} color="#ccc" />
              </Pressable>
            </View>
          ))}
        </ScrollView>

        {journal && (
          <>
            <Text style={styles.journalTitle}>Reflections for today</Text>
            <View
              style={[styles.journalCard, { marginTop: 8, marginBottom: 0 }]}
            >
              <Image
                source={require("../../assets/images/quotepng.png")}
                style={styles.quotes}
              />
              <Text style={styles.journalText}>{journal.content}</Text>
            </View>
          </>
        )}
      </View>

      {/* <View style={styles.journalCard}>
        <Image
          source={require("../assets/images/quotepng.png")}
          style={styles.quotes}
        />
        <Text style={styles.journalText}>
          {journal ? journal.content : "No journal entry for today."}
        </Text>
      </View> */}

      {/* <View style={styles.bottomNav}>
        <Ionicons name="home" size={28} color="#222" />
        <View style={styles.navCenter}>
          <Ionicons name="apps" size={28} color="#fff" />
        </View>
        <Ionicons name="checkmark-done" size={28} color="#222" />
      </View> */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    paddingHorizontal: 0,
  },
  profileHeader: {
    flexDirection: "row",
    alignItems: "center",
    padding: 20,
    paddingBottom: 10,
    marginTop: 20,
    gap: 10,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 24,
    marginRight: 10,
  },
  greeting: {
    fontSize: 24,
    fontWeight: "600",
    marginBottom: 2,
    fontFamily: "Sora-Bold",
  },
  date: {
    fontSize: 18,
    color: "black",
    fontWeight: 600,
    marginBottom: 2,
    marginTop: 10,
    fontFamily: "Sora-Bold",
  },
  atGlance: {
    fontSize: 14,
    color: "gray",
    fontFamily: "Ubuntu-Regular",
  },
  rowCards: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    marginBottom: 5,
    gap: 10,
    marginTop: 15,
  },
  moodCard: {
    backgroundColor: "#fff8f7",
    borderRadius: 18,
    padding: 16,
    alignItems: "center",
    flex: 1,
    display: "flex",
    flexDirection: "col",
    justifyContent: "space-between",
    marginRight: 5,
  },
  moodCardText: {
    display: "flex",
    flexDirection: "col",
    justifyContent: "space-between",
    alignItems: "center",
  },
  moodEmoji: {
    width: 36,
    height: 36,
    marginBottom: 6,
  },
  moodLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#C2A94B",
    fontFamily: "Sora-Bold",
  },
  moodSub: {
    fontSize: 12,
    color: "#e0d6bd",
    fontWeight: 600,
    marginTop: 2,
    fontFamily: "Ubuntu-Regular",
  },
  quoteCard: {
    backgroundColor: "#FFC7B5",
    borderRadius: 18,
    padding: 16,
    flex: 1.2,
    marginLeft: 5,
    justifyContent: "center",
  },
  moodCardMood: {
    // borderWidth: 2,
    // borderColor: "red",
    marginTop: 20,
  },
  quoteMark: {
    fontSize: 22,
    color: "#D1613D",
    fontWeight: "bold",
    marginBottom: 2,
    fontFamily: "Sora-Bold",
  },
  quoteText: {
    fontSize: 14,
    color: "#A0472A",
    // fontStyle: "italic",
    marginBottom: 6,
    marginTop: 10,
    // fontWeight: 600,
    fontFamily: "Ubuntu-Regular",
  },
  quoteAuthor: {
    fontSize: 12,
    color: "#c66a4d",
    alignSelf: "flex-end",
    fontFamily: "Ubuntu-Regular",
  },
  todoSection: {
    backgroundColor: "#fff",
    borderRadius: 18,
    margin: 20,
    marginTop: 4,
    marginBottom: 5,
    padding: 4,
  },
  todoHeader: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  todoTitle: {
    fontSize: 20,
    fontWeight: "600",
    marginBottom: 14,
    fontFamily: "Sora-Bold",
  },
  todoProgress: {
    fontSize: 13,
    color: "#bbb",
    marginBottom: 10,
    alignSelf: "flex-end",
    fontFamily: "Ubuntu-Regular",
  },
  todoItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
  },
  todoText: {
    fontSize: 15,
    flex: 1,
    color: "gray",
    fontFamily: "Ubuntu-Regular",
  },
  todoDone: {
    color: "#B6D7A8",
    textDecorationLine: "line-through",
  },
  checkbox: {
    marginLeft: 10,
  },
  tasksList: {
    maxHeight: 170,
    minHeight: 170,
    // borderWidth: 2,
    // borderColor: "red",
  },
  journalCard: {
    backgroundColor: "#FFC7B5",
    borderRadius: 18,
    marginHorizontal: 0,
    marginBottom: 20,
    padding: 18,
    minHeight: 90,
    justifyContent: "center",
  },
  journalTitle: {
    fontSize: 20,
    fontWeight: "600",
    marginBottom: 4,
    marginTop: 20,
    fontFamily: "Sora-Bold",
  },
  journalText: {
    fontSize: 15,
    color: "#A0472A",
    fontStyle: "italic",
    marginTop: 10,
    fontFamily: "Ubuntu-Regular",
  },
  bottomNav: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 16,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 8,
    height: 64,
  },
  navCenter: {
    backgroundColor: "#222",
    borderRadius: 16,
    padding: 8,
    marginHorizontal: 8,
  },
  greeting2: {
    fontSize: 20,
    fontWeight: "600",
    marginBottom: 2,
    marginLeft: 25,
    fontFamily: "Sora-Bold",
  },
});
