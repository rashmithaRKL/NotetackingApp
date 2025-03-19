import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useRoute, useNavigation } from "@react-navigation/native";
import { Picker } from "@react-native-picker/picker";
import Icon from "react-native-vector-icons/Feather";
import axios from "axios";

const API_URL = 'http://localhost:8080'; // Update with your API URL

const ViewNoteScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { note: initialNote } = route.params;

  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [note, setNote] = useState(initialNote);
  const [editedNote, setEditedNote] = useState({
    ...initialNote,
    date: initialNote.date.split('T')[0], // Format date for input
  });

  const categories = ["Personal", "Work", "Ideas"];

  // Handle note update
  const handleUpdateNote = async () => {
    if (!editedNote.title.trim() || !editedNote.content.trim()) {
      Alert.alert("Error", "Title and content are required");
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post(`${API_URL}/update_note.php`, {
        id: editedNote.id,
        title: editedNote.title,
        content: editedNote.content,
        category: editedNote.category,
        date: editedNote.date,
      });

      if (response.data.status === 'success') {
        setNote(editedNote);
        setIsEditing(false);
        Alert.alert("Success", "Note updated successfully");
      } else {
        throw new Error(response.data.message || 'Failed to update note');
      }
    } catch (error) {
      Alert.alert("Error", error.message || "Failed to update note");
    } finally {
      setLoading(false);
    }
  };

  // Handle note deletion
  const handleDeleteNote = () => {
    Alert.alert(
      "Delete Note",
      "Are you sure you want to delete this note?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            setLoading(true);
            try {
              const response = await axios.delete(`${API_URL}/delete_note.php`, {
                data: { id: note.id }
              });

              if (response.data.status === 'success') {
                navigation.goBack();
                Alert.alert("Success", "Note deleted successfully");
              } else {
                throw new Error(response.data.message || 'Failed to delete note');
              }
            } catch (error) {
              Alert.alert("Error", error.message || "Failed to delete note");
              setLoading(false);
            }
          }
        }
      ]
    );
  };

  const renderViewMode = () => (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{note.title}</Text>
        <View style={styles.categoryContainer}>
          <Icon name="tag" size={16} color="#666" style={styles.categoryIcon} />
          <Text style={styles.category}>{note.category}</Text>
        </View>
      </View>

      <Text style={styles.date}>
        {new Date(note.date).toLocaleDateString()}
      </Text>

      <View style={styles.contentContainer}>
        <Text style={styles.content}>{note.content}</Text>
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.button, styles.editButton]}
          onPress={() => setIsEditing(true)}
        >
          <Icon name="edit-2" size={20} color="#fff" />
          <Text style={styles.buttonText}>Edit</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.deleteButton]}
          onPress={handleDeleteNote}
        >
          <Icon name="trash-2" size={20} color="#fff" />
          <Text style={styles.buttonText}>Delete</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );

  const renderEditMode = () => (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1 }}
    >
      <ScrollView style={styles.container}>
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Title</Text>
          <TextInput
            value={editedNote.title}
            onChangeText={(text) => setEditedNote({ ...editedNote, title: text })}
            style={styles.input}
            placeholder="Note title"
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Category</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={editedNote.category}
              onValueChange={(value) =>
                setEditedNote({ ...editedNote, category: value })
              }
              style={styles.picker}
            >
              {categories.map((category) => (
                <Picker.Item
                  label={category}
                  value={category}
                  key={category}
                />
              ))}
            </Picker>
          </View>
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Content</Text>
          <TextInput
            value={editedNote.content}
            onChangeText={(text) =>
              setEditedNote({ ...editedNote, content: text })
            }
            style={[styles.input, styles.contentInput]}
            multiline
            textAlignVertical="top"
            placeholder="Note content"
          />
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.button, styles.saveButton]}
            onPress={handleUpdateNote}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Icon name="check" size={20} color="#fff" />
                <Text style={styles.buttonText}>Save</Text>
              </>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.cancelButton]}
            onPress={() => setIsEditing(false)}
            disabled={loading}
          >
            <Icon name="x" size={20} color="#fff" />
            <Text style={styles.buttonText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );

  return (
    <View style={styles.mainContainer}>
      {isEditing ? renderEditMode() : renderViewMode()}
    </View>
  );
};

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: "#f4f7fb",
  },
  container: {
    flex: 1,
    padding: 20,
  },
  header: {
    marginBottom: 15,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#007bff",
    marginBottom: 10,
  },
  categoryContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  categoryIcon: {
    marginRight: 5,
  },
  category: {
    fontSize: 16,
    color: "#666",
    fontStyle: "italic",
  },
  date: {
    fontSize: 14,
    color: "#999",
    marginBottom: 20,
  },
  contentContainer: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  content: {
    fontSize: 16,
    color: "#333",
    lineHeight: 24,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
  },
  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 12,
    borderRadius: 8,
    flex: 1,
    marginHorizontal: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  editButton: {
    backgroundColor: "#007bff",
  },
  deleteButton: {
    backgroundColor: "#dc3545",
  },
  saveButton: {
    backgroundColor: "#28a745",
  },
  cancelButton: {
    backgroundColor: "#6c757d",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
    marginLeft: 8,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    color: "#555",
    marginBottom: 8,
  },
  input: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: "#333",
  },
  contentInput: {
    height: 200,
    textAlignVertical: "top",
  },
  pickerContainer: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
  },
  picker: {
    height: 50,
  },
});

export default ViewNoteScreen;
