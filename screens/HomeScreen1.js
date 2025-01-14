import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Modal,
  TextInput,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import Icon from "react-native-vector-icons/Feather"; // Icon for better interaction

const HomeScreen = () => {
  const navigation = useNavigation();

  // State to hold the fetched notes
  const [notes, setNotes] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [newNote, setNewNote] = useState({
    title: "",
    content: "",
    category: "",
    date: new Date().toISOString(),
  });

  // Fetch notes from the backend
  useEffect(() => {
    fetchNotes();
  }, []);

  const fetchNotes = async () => {
    try {
      const response = await fetch("http://localhost:8080/get_notes.php");
      const data = await response.json();
      if (data.error) {
        alert(data.error);
      } else {
        setNotes(data); // Update state with fetched notes
      }
    } catch (error) {
      console.error("Error fetching notes:", error);
      alert("Failed to fetch notes");
    }
  };

  // Handle note submission to the backend
  const addNote = async () => {
    try {
      const response = await fetch("http://localhost:8080/add_note.php", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newNote),
      });

      const data = await response.json();
      if (data.success) {
        alert(data.success);
        setShowModal(false);
        fetchNotes(); // Refresh the list of notes
      } else {
        alert(data.error);
      }
    } catch (error) {
      console.error("Error adding note:", error);
      alert("Failed to add note");
    }
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.noteCard}
      onPress={() => alert(`Selected: ${item.title}`)}
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

      <TouchableOpacity
        style={styles.filterButton}
        onPress={() => setShowModal(true)}
      >
        <Icon name="plus" size={20} color="#fff" />
        <Text style={styles.filterButtonText}>Add Note</Text>
      </TouchableOpacity>

      <FlatList
        data={notes}
        renderItem={renderItem}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContainer}
      />

      {/* Modal to add a new note */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={showModal}
        onRequestClose={() => setShowModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Add New Note</Text>
            <TextInput
              style={styles.input}
              placeholder="Title"
              value={newNote.title}
              onChangeText={(text) => setNewNote({ ...newNote, title: text })}
            />
            <TextInput
              style={styles.input}
              placeholder="Content"
              value={newNote.content}
              onChangeText={(text) => setNewNote({ ...newNote, content: text })}
            />
            <TextInput
              style={styles.input}
              placeholder="Category"
              value={newNote.category}
              onChangeText={(text) =>
                setNewNote({ ...newNote, category: text })
              }
            />
            <TouchableOpacity style={styles.addButton} onPress={addNote}>
              <Text style={styles.addButtonText}>Save Note</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setShowModal(false)}
            >
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
  listContainer: {
    paddingBottom: 100,
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
    elevation: 4,
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
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.3)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 12,
    width: "80%",
    elevation: 5,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 15,
    textAlign: "center",
  },
  input: {
    height: 40,
    borderColor: "#ddd",
    borderWidth: 1,
    borderRadius: 5,
    marginBottom: 10,
    paddingLeft: 10,
  },
  addButton: {
    backgroundColor: "#007bff",
    padding: 10,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 10,
  },
  addButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  closeButton: {
    backgroundColor: "#ccc",
    padding: 10,
    borderRadius: 8,
    alignItems: "center",
  },
  closeButtonText: {
    color: "#333",
    fontSize: 16,
  },
});

export default HomeScreen;
