import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { useRoute, useNavigation } from "@react-navigation/native";

const ViewNoteScreen = () => {
  const route = useRoute(); // To access the data passed from the HomeScreen
  const navigation = useNavigation();

  const { note } = route.params; // Retrieve the note data passed through navigation

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.header}>{note.title}</Text>
      <Text style={styles.category}>{note.category}</Text>
      <Text style={styles.date}>{note.date.toLocaleDateString()}</Text>

      <View style={styles.contentContainer}>
        <Text style={styles.content}>{note.content}</Text>
      </View>

      {/* Back Button */}
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.goBack()}
      >
        <Text style={styles.backButtonText}>Back</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#f9f9f9",
  },
  header: {
    fontSize: 32,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#007bff",
  },
  category: {
    fontSize: 18,
    color: "#666",
    marginBottom: 5,
  },
  date: {
    fontSize: 14,
    color: "#999",
    marginBottom: 20,
  },
  contentContainer: {
    marginBottom: 20,
  },
  content: {
    fontSize: 18,
    color: "#333",
    lineHeight: 25,
  },
  backButton: {
    backgroundColor: "#007bff",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 30,
  },
  backButtonText: {
    fontSize: 18,
    color: "#fff",
    fontWeight: "bold",
  },
});

export default ViewNoteScreen;
