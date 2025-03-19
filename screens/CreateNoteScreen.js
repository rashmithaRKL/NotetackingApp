import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Picker } from "@react-native-picker/picker";
import Icon from "react-native-vector-icons/Feather";
import axios from "axios";

const API_URL = 'http://localhost:8080'; // Update with your API URL

const CreateNoteScreen = () => {
  const navigation = useNavigation();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    category: "Personal",
    date: new Date().toISOString().split('T')[0]
  });
  const [errors, setErrors] = useState({});

  const categories = ["Personal", "Work", "Ideas"];

  // Validate form data
  const validateForm = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = "Title is required";
    }

    if (!formData.content.trim()) {
      newErrors.content = "Content is required";
    }

    if (!formData.category) {
      newErrors.category = "Category is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSaveNote = async () => {
    if (!validateForm()) {
      Alert.alert("Error", "Please fill in all required fields");
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post(`${API_URL}/add_note.php`, formData);

      if (response.data.status === 'success') {
        Alert.alert(
          "Success",
          "Note created successfully",
          [
            {
              text: "OK",
              onPress: () => navigation.goBack()
            }
          ]
        );
      } else {
        throw new Error(response.data.message || 'Failed to create note');
      }
    } catch (error) {
      Alert.alert(
        "Error",
        error.message || "Failed to create note. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  // Handle input changes
  const handleChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: null
      }));
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1 }}
    >
      <ScrollView style={styles.container}>
        <Text style={styles.header}>Create New Note</Text>

        {/* Title Input */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Title</Text>
          <TextInput
            placeholder="Enter note title"
            value={formData.title}
            onChangeText={(text) => handleChange("title", text)}
            style={[
              styles.input,
              errors.title && styles.inputError
            ]}
          />
          {errors.title && (
            <Text style={styles.errorText}>{errors.title}</Text>
          )}
        </View>

        {/* Category Picker */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Category</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={formData.category}
              onValueChange={(value) => handleChange("category", value)}
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

        {/* Content Input */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Content</Text>
          <TextInput
            placeholder="Write your note here"
            value={formData.content}
            onChangeText={(text) => handleChange("content", text)}
            style={[
              styles.input,
              styles.textArea,
              errors.content && styles.inputError
            ]}
            multiline
            textAlignVertical="top"
          />
          {errors.content && (
            <Text style={styles.errorText}>{errors.content}</Text>
          )}
        </View>

        {/* Save Button */}
        <TouchableOpacity
          style={[
            styles.saveButton,
            loading && styles.saveButtonDisabled
          ]}
          onPress={handleSaveNote}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Icon name="save" size={20} color="#fff" />
              <Text style={styles.saveButtonText}>Save Note</Text>
            </>
          )}
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
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
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  inputError: {
    borderColor: "#ff4444",
  },
  errorText: {
    color: "#ff4444",
    fontSize: 14,
    marginTop: 5,
  },
  textArea: {
    height: 150,
    textAlignVertical: "top",
  },
  pickerContainer: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  picker: {
    height: 50,
  },
  saveButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#007bff",
    paddingVertical: 15,
    paddingHorizontal: 25,
    borderRadius: 8,
    marginTop: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  saveButtonDisabled: {
    backgroundColor: "#ccc",
  },
  saveButtonText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#fff",
    marginLeft: 10,
  },
});

export default CreateNoteScreen;
