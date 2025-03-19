import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Modal,
  TouchableWithoutFeedback,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from "react-native";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import Icon from "react-native-vector-icons/Feather";
import axios from "axios";
import { Picker } from "@react-native-picker/picker";

const { width } = Dimensions.get("window");
const API_URL = 'http://localhost:8080'; // Update this with your actual API URL

const HomeScreen = () => {
  const navigation = useNavigation();
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [sortOption, setSortOption] = useState("date");
  const [sortOrder, setSortOrder] = useState("DESC");
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const categories = ["All", "Work", "Personal", "Ideas"];

  // Fetch notes function
  const fetchNotes = async (pageNum = 1, shouldRefresh = false) => {
    try {
      setError(null);
      if (pageNum === 1) {
        setLoading(true);
      }

      const response = await axios.get(`${API_URL}/get_notes.php`, {
        params: {
          page: pageNum,
          limit: 10,
          category: selectedCategory !== "All" ? selectedCategory : null,
          sort: sortOption,
          order: sortOrder
        }
      });

      if (response.data.status === 'success') {
        const newNotes = response.data.data.notes;
        setNotes(prevNotes => 
          pageNum === 1 ? newNotes : [...prevNotes, ...newNotes]
        );
        setHasMore(pageNum < response.data.data.pagination.total_pages);
      } else {
        throw new Error(response.data.message || 'Failed to fetch notes');
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch notes');
      Alert.alert('Error', err.message || 'Failed to fetch notes');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Refresh handler
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setPage(1);
    fetchNotes(1, true);
  }, [selectedCategory, sortOption, sortOrder]);

  // Load more handler
  const loadMore = () => {
    if (!loading && hasMore) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchNotes(nextPage);
    }
  };

  // Delete note handler
  const handleDeleteNote = async (noteId) => {
    Alert.alert(
      "Delete Note",
      "Are you sure you want to delete this note?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              const response = await axios.delete(`${API_URL}/delete_note.php`, {
                data: { id: noteId }
              });

              if (response.data.status === 'success') {
                setNotes(prevNotes => prevNotes.filter(note => note.id !== noteId));
                Alert.alert('Success', 'Note deleted successfully');
              } else {
                throw new Error(response.data.message || 'Failed to delete note');
              }
            } catch (err) {
              Alert.alert('Error', err.message || 'Failed to delete note');
            }
          }
        }
      ]
    );
  };

  // Fetch notes when screen comes into focus or filters change
  useFocusEffect(
    useCallback(() => {
      setPage(1);
      fetchNotes(1);
    }, [selectedCategory, sortOption, sortOrder])
  );

  // Render each note in the FlatList
  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.noteCard}
      onPress={() => navigation.navigate("ViewNote", { note: item })}
    >
      <View style={styles.noteHeader}>
        <Text style={styles.noteTitle}>{item.title}</Text>
        <TouchableOpacity
          onPress={() => handleDeleteNote(item.id)}
          style={styles.deleteButton}
        >
          <Icon name="trash-2" size={20} color="#ff4444" />
        </TouchableOpacity>
      </View>
      <Text style={styles.noteCategory}>{item.category}</Text>
      <Text style={styles.noteContent} numberOfLines={2}>
        {item.content}
      </Text>
      <Text style={styles.noteDate}>
        {new Date(item.date).toLocaleDateString()}
      </Text>
    </TouchableOpacity>
  );

  // Render loading state
  if (loading && !refreshing && notes.length === 0) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#007bff" />
      </View>
    );
  }

  // Render error state
  if (error && notes.length === 0) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={onRefresh}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>My Notes</Text>

      {/* Filter Button */}
      <TouchableOpacity
        style={styles.filterButton}
        onPress={() => setShowFilterModal(true)}
      >
        <Icon name="filter" size={20} color="#fff" />
        <Text style={styles.filterButtonText}>Filter & Sort</Text>
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
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={selectedCategory}
              onValueChange={setSelectedCategory}
              style={styles.picker}
            >
              {categories.map((category) => (
                <Picker.Item label={category} value={category} key={category} />
              ))}
            </Picker>
          </View>

          <Text style={styles.modalLabel}>Sort By</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={sortOption}
              onValueChange={setSortOption}
              style={styles.picker}
            >
              <Picker.Item label="Date" value="date" />
              <Picker.Item label="Title" value="title" />
              <Picker.Item label="Category" value="category" />
            </Picker>
          </View>

          <Text style={styles.modalLabel}>Order</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={sortOrder}
              onValueChange={setSortOrder}
              style={styles.picker}
            >
              <Picker.Item label="Descending" value="DESC" />
              <Picker.Item label="Ascending" value="ASC" />
            </Picker>
          </View>

          <TouchableOpacity
            style={styles.modalCloseButton}
            onPress={() => setShowFilterModal(false)}
          >
            <Text style={styles.modalCloseButtonText}>Apply Filters</Text>
          </TouchableOpacity>
        </View>
      </Modal>

      <FlatList
        data={notes}
        renderItem={renderItem}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        onEndReached={loadMore}
        onEndReachedThreshold={0.5}
        ListFooterComponent={() =>
          loading && notes.length > 0 ? (
            <ActivityIndicator style={styles.loadingMore} color="#007bff" />
          ) : null
        }
        ListEmptyComponent={() => (
          <View style={styles.emptyContainer}>
            <Icon name="file-text" size={50} color="#ccc" />
            <Text style={styles.emptyText}>No notes found</Text>
          </View>
        )}
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
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
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
    backgroundColor: "rgba(0, 0, 0, 0.5)",
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
    marginBottom: 20,
    textAlign: "center",
    color: "#333",
  },
  modalLabel: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
    color: "#555",
  },
  pickerContainer: {
    backgroundColor: "#f0f4f8",
    borderRadius: 8,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  picker: {
    height: 50,
  },
  modalCloseButton: {
    backgroundColor: "#007bff",
    padding: 15,
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
    width: width * 0.9,
    alignSelf: "center",
  },
  noteHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  noteTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#007bff",
    flex: 1,
  },
  deleteButton: {
    padding: 5,
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
    elevation: 5,
  },
  floatingButtonText: {
    fontSize: 30,
    color: "#ffffff",
    fontWeight: "bold",
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  emptyText: {
    fontSize: 16,
    color: "#666",
    marginTop: 10,
  },
  errorText: {
    fontSize: 16,
    color: "#ff4444",
    marginBottom: 20,
    textAlign: "center",
  },
  retryButton: {
    backgroundColor: "#007bff",
    padding: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  loadingMore: {
    padding: 10,
  },
});

export default HomeScreen;
