import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from "react-native";
import Icon from "react-native-vector-icons/Feather"; // Optional, if you want to add an icon to the button

const AddNoteScreen = () => {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  const handleSaveNote = () => {
    // Save the note to your data store (e.g., database or local storage)
    console.log("Note saved:", { title, content });
    // Optionally navigate back to the home screen after saving
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>Add New Note</Text>

      {/* Title Input */}
      <TextInput
        placeholder="Enter note title"
        value={title}
        onChangeText={setTitle}
        style={styles.input}
      />

      {/* Content Input */}
      <TextInput
        placeholder="Write your note here"
        value={content}
        onChangeText={setContent}
        style={[styles.input, styles.textArea]}
        multiline
      />

      {/* Save Button */}
      <TouchableOpacity style={styles.saveButton} onPress={handleSaveNote}>
        <Icon name="save" size={20} color="#fff" />
        <Text style={styles.saveButtonText}>Save Note</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#f4f7fb",
  },
  header: {
    fontSize: 30,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 20,
    textAlign: "center",
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderRadius: 8,
    borderColor: "#ddd",
    paddingHorizontal: 12,
    fontSize: 16,
    marginBottom: 15,
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3, // For Android shadow
  },
  textArea: {
    height: 150,
    textAlignVertical: "top", // Makes the content input behave like a textarea
  },
  saveButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#007bff",
    paddingVertical: 15,
    paddingHorizontal: 25,
    borderRadius: 8,
    marginTop: 20,
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5, // For Android shadow
  },
  saveButtonText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#fff",
    marginLeft: 10,
  },
});

export default AddNoteScreen;
