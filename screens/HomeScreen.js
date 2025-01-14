import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Modal,
  TouchableWithoutFeedback,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import Icon from "react-native-vector-icons/Feather";
import axios from "axios";
import { Picker } from "@react-native-picker/picker";

const { width } = Dimensions.get("window");

const HomeScreen = () => {
  const navigation = useNavigation();

  const [notes, setNotes] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [sortOption, setSortOption] = useState("Date");
  const [showFilterModal, setShowFilterModal] = useState(false);

  const categories = ["All", "Work", "Personal", "Ideas"];

  // Fetch notes from backend on component mount
  useEffect(() => {
    axios
      .get("http://localhost:8080/get_notes.php") // Your PHP API URL
      .then((response) => {
        setNotes(response.data); // Set fetched notes in state
      })
      .catch((error) => {
        console.error("Error fetching notes:", error);
      });
  }, []);

  // Filter notes by category
  const filteredNotes =
    selectedCategory === "All"
      ? notes
      : notes.filter((note) => note.category === selectedCategory);

  // Sort notes based on the selected option
  const sortedNotes = [...filteredNotes].sort((a, b) => {
    if (sortOption === "Title") {
      return a.title.localeCompare(b.title);
    } else if (sortOption === "Date") {
      return new Date(b.date) - new Date(a.date); // Compare dates
    }
    return 0;
  });

  // Render each note in the FlatList
  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.noteCard}
      onPress={
        () => navigation.navigate("ViewNote", { note: item }) // Pass the selected note to ViewNoteScreen
      }
    >
      <Text style={styles.noteTitle}>{item.title}</Text>
      <Text style={styles.noteCategory}>{item.category}</Text>
      <Text style={styles.noteContent} numberOfLines={2}>
        {item.content}
      </Text>
      <Text style={styles.noteDate}>
        {new Date(item.date).toLocaleDateString()}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.header}>My Notes</Text>

      {/* Filter Button */}
      <TouchableOpacity
        style={styles.filterButton}
        onPress={() => setShowFilterModal(true)}
      >
        <Icon name="filter" size={20} color="#fff" />
        <Text style={styles.filterButtonText}>Filter</Text>
      </TouchableOpacity>

      {/* Modal for category and sorting options */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={showFilterModal}
        onRequestClose={() => setShowFilterModal(false)}
      >
        <TouchableWithoutFeedback onPress={() => setShowFilterModal(false)}>
          <View style={styles.modalOverlay} />
        </TouchableWithoutFeedback>

        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Filter & Sort Notes</Text>

          <Text style={styles.modalLabel}>Category</Text>
          <Picker
            selectedValue={selectedCategory}
            onValueChange={(itemValue) => setSelectedCategory(itemValue)}
            style={styles.picker}
          >
            {categories.map((category) => (
              <Picker.Item label={category} value={category} key={category} />
            ))}
          </Picker>

          <Text style={styles.modalLabel}>Sort By</Text>
          <Picker
            selectedValue={sortOption}
            onValueChange={(itemValue) => setSortOption(itemValue)}
            style={styles.picker}
          >
            <Picker.Item label="Sort by Date" value="Date" />
            <Picker.Item label="Sort by Title" value="Title" />
          </Picker>

          <TouchableOpacity
            style={styles.modalCloseButton}
            onPress={() => setShowFilterModal(false)}
          >
            <Text style={styles.modalCloseButtonText}>Close</Text>
          </TouchableOpacity>
        </View>
      </Modal>

      <FlatList
        data={sortedNotes}
        renderItem={renderItem}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
      />

      {/* Floating Button to Add New Note */}
      <TouchableOpacity
        style={styles.floatingButton}
        onPress={() => navigation.navigate("CreateNote")}
      >
        <Text style={styles.floatingButtonText}>+</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#f0f4f8",
  },
  header: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
    color: "#333",
  },
  filterButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#007bff",
    padding: 10,
    borderRadius: 8,
    marginBottom: 20,
    alignSelf: "flex-start",
  },
  filterButtonText: {
    marginLeft: 8,
    fontSize: 16,
    color: "#fff",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.3)",
  },
  modalContent: {
    backgroundColor: "#fff",
    padding: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 10,
    textAlign: "center",
  },
  modalLabel: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
  },
  picker: {
    height: 50,
    backgroundColor: "#f0f4f8",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ddd",
    marginBottom: 15,
  },
  modalCloseButton: {
    backgroundColor: "#007bff",
    padding: 12,
    borderRadius: 8,
    marginTop: 20,
    alignItems: "center",
  },
  modalCloseButtonText: {
    fontSize: 16,
    color: "#fff",
    fontWeight: "600",
  },
  listContainer: {
    paddingBottom: 100, // Space for the floating button
  },
  noteCard: {
    backgroundColor: "#ffffff",
    padding: 20,
    borderRadius: 12,
    marginBottom: 15,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4, // For Android shadow
    width: width * 0.9, // Card width
    alignSelf: "center",
  },
  noteTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 8,
    color: "#007bff",
  },
  noteCategory: {
    fontSize: 14,
    color: "#666",
    marginBottom: 4,
    fontStyle: "italic",
  },
  noteContent: {
    fontSize: 16,
    color: "#555",
    marginBottom: 8,
  },
  noteDate: {
    fontSize: 12,
    color: "#999",
  },
  floatingButton: {
    backgroundColor: "#007bff",
    height: 60,
    width: 60,
    borderRadius: 30,
    position: "absolute",
    bottom: 30,
    right: 30,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5, // For Android shadow
  },
  floatingButtonText: {
    fontSize: 30,
    color: "#ffffff",
    fontWeight: "bold",
    textAlign: "center",
  },
});

export default HomeScreen;
