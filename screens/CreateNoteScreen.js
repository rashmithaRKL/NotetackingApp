import React, { useState, useEffect } from "react";
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
  Animated,
  Keyboard,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Picker } from "@react-native-picker/picker";
import Icon from "react-native-vector-icons/Feather";
import axios from "axios";

const API_URL = 'http://localhost:8080';

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
  const [isKeyboardVisible, setKeyboardVisible] = useState(false);
  const [saveButtonAnim] = useState(new Animated.Value(1));
  const [characterCount, setCharacterCount] = useState(0);

  const categories = [
    { id: "Personal", color: "#7b1fa2" },
    { id: "Work", color: "#1976d2" },
    { id: "Ideas", color: "#388e3c" },
    { id: "Important", color: "#c62828" },
  ];

  // Keyboard listeners for animation
  useEffect(() => {
    const keyboardWillShow = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      () => {
        setKeyboardVisible(true);
        Animated.timing(saveButtonAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }).start();
      }
    );

    const keyboardWillHide = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      () => {
        setKeyboardVisible(false);
        Animated.timing(saveButtonAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }).start();
      }
    );

    return () => {
      keyboardWillShow.remove();
      keyboardWillHide.remove();
    };
  }, []);

  // Validate form
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
    // Update character count for content
    if (field === 'content') {
      setCharacterCount(value.length);
    }
  };

  // Get category color
  const getCategoryColor = (categoryId) => {
    const category = categories.find(cat => cat.id === categoryId);
    return category ? category.color : '#333';
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1 }}
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => {
              if (formData.title.trim() || formData.content.trim()) {
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
            <Icon name="x" size={24} color="#666" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>New Note</Text>
          <View style={{ width: 40 }} /> {/* Placeholder for alignment */}
        </View>

        <ScrollView style={styles.formContainer}>
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
              maxLength={100}
            />
            {errors.title && (
              <Text style={styles.errorText}>{errors.title}</Text>
            )}
            <Text style={styles.characterCount}>
              {formData.title.length}/100
            </Text>
          </View>

          {/* Category Picker */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Category</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={formData.category}
                onValueChange={(value) => handleChange("category", value)}
                style={[styles.picker, { color: getCategoryColor(formData.category) }]}
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

          {/* Content Input */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Content</Text>
            <TextInput
              placeholder="Write your note here..."
              value={formData.content}
              onChangeText={(text) => handleChange("content", text)}
              style={[
                styles.input,
                styles.textArea,
                errors.content && styles.inputError
              ]}
              multiline
              textAlignVertical="top"
              maxLength={2000}
            />
            {errors.content && (
              <Text style={styles.errorText}>{errors.content}</Text>
            )}
            <Text style={styles.characterCount}>
              {characterCount}/2000
            </Text>
          </View>
        </ScrollView>

        {/* Save Button */}
        <Animated.View
          style={[
            styles.saveButtonContainer,
            { transform: [{ translateY: saveButtonAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [100, 0]
            })}] }
          ]}
        >
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
                <Icon name="check" size={24} color="#fff" />
                <Text style={styles.saveButtonText}>Save Note</Text>
              </>
            )}
          </TouchableOpacity>
        </Animated.View>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
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
  formContainer: {
    flex: 1,
    padding: 20,
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
    marginLeft: 5,
  },
  characterCount: {
    fontSize: 12,
    color: "#999",
    textAlign: "right",
    marginTop: 5,
  },
  textArea: {
    height: 200,
    textAlignVertical: "top",
  },
  pickerContainer: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  picker: {
    height: 50,
  },
  saveButtonContainer: {
    padding: 20,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#e1e8ed",
  },
  saveButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#007bff",
    paddingVertical: 15,
    borderRadius: 12,
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
    fontWeight: "600",
    color: "#fff",
    marginLeft: 10,
  },
});

export default CreateNoteScreen;
