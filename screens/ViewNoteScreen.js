import React, { useState, useRef } from "react";
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
  Animated,
  Share,
} from "react-native";
import { useRoute, useNavigation } from "@react-navigation/native";
import { Picker } from "@react-native-picker/picker";
import Icon from "react-native-vector-icons/Feather";
import axios from "axios";

const API_URL = 'http://localhost:8080';

const ViewNoteScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { note: initialNote } = route.params;
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [note, setNote] = useState(initialNote);
  const [editedNote, setEditedNote] = useState({
    ...initialNote,
    date: initialNote.date.split('T')[0],
  });
  const [errors, setErrors] = useState({});

  const categories = [
    { id: "Personal", color: "#7b1fa2" },
    { id: "Work", color: "#1976d2" },
    { id: "Ideas", color: "#388e3c" },
    { id: "Important", color: "#c62828" },
  ];

  // Animations
  const animateNote = (toValue) => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();
  };

  // Share note
  const handleShare = async () => {
    try {
      await Share.share({
        title: note.title,
        message: `${note.title}\n\n${note.content}\n\nCategory: ${note.category}\nDate: ${new Date(note.date).toLocaleDateString()}`,
      });
    } catch (error) {
      Alert.alert("Error", "Failed to share note");
    }
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};

    if (!editedNote.title.trim()) {
      newErrors.title = "Title is required";
    }

    if (!editedNote.content.trim()) {
      newErrors.content = "Content is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle note update
  const handleUpdateNote = async () => {
    if (!validateForm()) {
      Alert.alert("Error", "Please fill in all required fields");
      return;
    }

    setLoading(true);
    animateNote(0.8);

    try {
      const response = await axios.post(`${API_URL}/update_note.php`, editedNote);

      if (response.data.status === 'success') {
        setNote(editedNote);
        setIsEditing(false);
        Alert.alert("Success", "Note updated successfully");
        animateNote(1);
      } else {
        throw new Error(response.data.message || 'Failed to update note');
      }
    } catch (error) {
      Alert.alert("Error", error.message || "Failed to update note");
      animateNote(1);
    } finally {
      setLoading(false);
    }
  };

  // Handle note deletion
  const handleDeleteNote = () => {
    Alert.alert(
      "Delete Note",
      "Are you sure you want to delete this note? This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            setLoading(true);
            animateNote(0);

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
              animateNote(1);
              setLoading(false);
            }
          }
        }
      ]
    );
  };

  // Get category color
  const getCategoryColor = (categoryId) => {
    const category = categories.find(cat => cat.id === categoryId);
    return category ? category.color : '#333';
  };

  const renderViewMode = () => (
    <Animated.View style={[styles.container, { opacity: fadeAnim, transform: [{ scale: scaleAnim }] }]}>
      <ScrollView style={styles.contentContainer}>
        <View style={styles.header}>
          <Text style={styles.title}>{note.title}</Text>
          <View style={[styles.categoryChip, { backgroundColor: `${getCategoryColor(note.category)}20` }]}>
            <Icon name="tag" size={16} color={getCategoryColor(note.category)} style={styles.categoryIcon} />
            <Text style={[styles.category, { color: getCategoryColor(note.category) }]}>
              {note.category}
            </Text>
          </View>
        </View>

        <Text style={styles.date}>
          Created on {new Date(note.date).toLocaleDateString()}
        </Text>

        <View style={styles.contentBox}>
          <Text style={styles.content}>{note.content}</Text>
        </View>
      </ScrollView>

      <View style={styles.actionButtonsContainer}>
        <TouchableOpacity
          style={[styles.actionButton, styles.editButton]}
          onPress={() => setIsEditing(true)}
        >
          <Icon name="edit-2" size={20} color="#fff" />
          <Text style={styles.actionButtonText}>Edit</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, styles.shareButton]}
          onPress={handleShare}
        >
          <Icon name="share-2" size={20} color="#fff" />
          <Text style={styles.actionButtonText}>Share</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, styles.deleteButton]}
          onPress={handleDeleteNote}
        >
          <Icon name="trash-2" size={20} color="#fff" />
          <Text style={styles.actionButtonText}>Delete</Text>
        </TouchableOpacity>
      </View>
    </Animated.View>
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
            onChangeText={(text) => {
              setEditedNote({ ...editedNote, title: text });
              if (errors.title) setErrors({ ...errors, title: null });
            }}
            style={[styles.input, errors.title && styles.inputError]}
            placeholder="Note title"
          />
          {errors.title && <Text style={styles.errorText}>{errors.title}</Text>}
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Category</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={editedNote.category}
              onValueChange={(value) => setEditedNote({ ...editedNote, category: value })}
              style={[styles.picker, { color: getCategoryColor(editedNote.category) }]}
            >
              {categories.map((category) => (
                <Picker.Item
                  label={category.id}
                  value={category.id}
                  key={category.id}
                  color={category.color}
                />
              ))}
            </Picker>
          </View>
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Content</Text>
          <TextInput
            value={editedNote.content}
            onChangeText={(text) => {
              setEditedNote({ ...editedNote, content: text });
              if (errors.content) setErrors({ ...errors, content: null });
            }}
            style={[styles.input, styles.contentInput, errors.content && styles.inputError]}
            multiline
            textAlignVertical="top"
            placeholder="Note content"
          />
          {errors.content && <Text style={styles.errorText}>{errors.content}</Text>}
        </View>
      </ScrollView>

      <View style={styles.editActionButtons}>
        <TouchableOpacity
          style={[styles.actionButton, styles.saveButton]}
          onPress={handleUpdateNote}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Icon name="check" size={20} color="#fff" />
              <Text style={styles.actionButtonText}>Save</Text>
            </>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, styles.cancelButton]}
          onPress={() => {
            Alert.alert(
              "Discard Changes",
              "Are you sure you want to discard your changes?",
              [
                { text: "Cancel", style: "cancel" },
                { 
                  text: "Discard",
                  style: "destructive",
                  onPress: () => {
                    setEditedNote({ ...note, date: note.date.split('T')[0] });
                    setIsEditing(false);
                    setErrors({});
                  }
                }
              ]
            );
          }}
          disabled={loading}
        >
          <Icon name="x" size={20} color="#fff" />
          <Text style={styles.actionButtonText}>Cancel</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );

  return (
    <View style={styles.mainContainer}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => {
            if (isEditing) {
              Alert.alert(
                "Discard Changes",
                "Are you sure you want to discard your changes?",
                [
                  { text: "Cancel", style: "cancel" },
                  { text: "Discard", style: "destructive", onPress: () => navigation.goBack() }
                ]
              );
            } else {
              navigation.goBack();
            }
          }}
        >
          <Icon name="arrow-left" size={24} color="#666" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {isEditing ? "Edit Note" : "View Note"}
        </Text>
        <View style={{ width: 40 }} />
      </View>

      {isEditing ? renderEditMode() : renderViewMode()}
    </View>
  );
};

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: "#f4f7fb",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 15,
    paddingTop: Platform.OS === "ios" ? 50 : 20,
    paddingBottom: 15,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#e1e8ed",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#333",
  },
  backButton: {
    padding: 8,
  },
  container: {
    flex: 1,
    padding: 20,
  },
  contentContainer: {
    flex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 10,
  },
  categoryChip: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: 10,
  },
  categoryIcon: {
    marginRight: 5,
  },
  category: {
    fontSize: 14,
    fontWeight: "600",
  },
  date: {
    fontSize: 14,
    color: "#666",
    marginBottom: 20,
    fontStyle: "italic",
  },
  contentBox: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 12,
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
  actionButtonsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 20,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#e1e8ed",
  },
  editActionButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 20,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#e1e8ed",
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    flex: 1,
    marginHorizontal: 5,
  },
  actionButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },
  editButton: {
    backgroundColor: "#007bff",
  },
  shareButton: {
    backgroundColor: "#28a745",
  },
  deleteButton: {
    backgroundColor: "#dc3545",
  },
  saveButton: {
    backgroundColor: "#28a745",
    flex: 2,
  },
  cancelButton: {
    backgroundColor: "#6c757d",
    flex: 1,
    marginLeft: 10,
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
    borderRadius: 12,
    padding: 15,
    fontSize: 16,
    color: "#333",
  },
  contentInput: {
    height: 200,
    textAlignVertical: "top",
  },
  inputError: {
    borderColor: "#dc3545",
  },
  errorText: {
    color: "#dc3545",
    fontSize: 14,
    marginTop: 5,
  },
  pickerContainer: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 12,
  },
  picker: {
    height: 50,
  },
});

export default ViewNoteScreen;
