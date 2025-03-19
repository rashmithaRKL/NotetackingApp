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
  TextInput,
  Animated,
  Platform,
} from "react-native";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import Icon from "react-native-vector-icons/Feather";
import axios from "axios";
import { Picker } from "@react-native-picker/picker";

const { width, height } = Dimensions.get("window");
const API_URL = 'http://localhost:8080';

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
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const [fadeAnim] = useState(new Animated.Value(1));

  const categories = ["All", "Work", "Personal", "Ideas", "Important"];

  // Animation for note cards
  const fadeIn = () => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  };

  const fadeOut = () => {
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  // Fetch notes function with search and filters
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
          order: sortOrder,
          search: searchQuery,
        }
      });

      if (response.data.status === 'success') {
        const newNotes = response.data.data.notes;
        fadeIn();
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

  // Search handler with debounce
  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      if (searchQuery !== "") {
        setPage(1);
        fetchNotes(1);
      }
    }, 500);

    return () => clearTimeout(debounceTimer);
  }, [searchQuery]);

  // Refresh handler
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setPage(1);
    fetchNotes(1, true);
  }, [selectedCategory, sortOption, sortOrder, searchQuery]);

  // Load more handler
  const loadMore = () => {
    if (!loading && hasMore) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchNotes(nextPage);
    }
  };

  // Delete note handler with animation
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
              fadeOut();
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

  // Render note card
  const renderNoteCard = ({ item, index }) => {
    const cardColor = getCategoryColor(item.category);
    return (
      <Animated.View
        style={[
          styles.noteCard,
          { opacity: fadeAnim },
          { transform: [{ scale: fadeAnim }] },
          { backgroundColor: cardColor.background }
        ]}
      >
        <TouchableOpacity
          onPress={() => navigation.navigate("ViewNote", { note: item })}
          style={styles.noteCardContent}
        >
          <View style={styles.noteHeader}>
            <Text style={[styles.noteTitle, { color: cardColor.text }]}>
              {item.title}
            </Text>
            <TouchableOpacity
              onPress={() => handleDeleteNote(item.id)}
              style={styles.deleteButton}
            >
              <Icon name="trash-2" size={20} color="#ff4444" />
            </TouchableOpacity>
          </View>

          <View style={styles.categoryChip}>
            <Icon name="tag" size={14} color={cardColor.text} />
            <Text style={[styles.noteCategory, { color: cardColor.text }]}>
              {item.category}
            </Text>
          </View>

          <Text style={styles.noteContent} numberOfLines={2}>
            {item.content}
          </Text>

          <View style={styles.noteFooter}>
            <Text style={styles.noteDate}>
              {new Date(item.date).toLocaleDateString()}
            </Text>
            <Icon name="chevron-right" size={20} color="#666" />
          </View>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  // Get category-specific colors
  const getCategoryColor = (category) => {
    const colors = {
      Work: { background: '#e3f2fd', text: '#1976d2' },
      Personal: { background: '#f3e5f5', text: '#7b1fa2' },
      Ideas: { background: '#e8f5e9', text: '#388e3c' },
      Important: { background: '#ffebee', text: '#c62828' },
      default: { background: '#ffffff', text: '#333333' }
    };
    return colors[category] || colors.default;
  };

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
        <Icon name="alert-circle" size={50} color="#ff4444" />
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={onRefresh}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Notes</Text>
        <View style={styles.headerButtons}>
          <TouchableOpacity
            style={styles.iconButton}
            onPress={() => setShowSearch(!showSearch)}
          >
            <Icon name="search" size={24} color="#007bff" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.iconButton}
            onPress={() => setShowFilterModal(true)}
          >
            <Icon name="sliders" size={24} color="#007bff" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Search Bar */}
      {showSearch && (
        <View style={styles.searchContainer}>
          <Icon name="search" size={20} color="#666" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search notes..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoFocus
          />
          {searchQuery !== "" && (
            <TouchableOpacity
              onPress={() => {
                setSearchQuery("");
                setPage(1);
                fetchNotes(1);
              }}
              style={styles.clearSearch}
            >
              <Icon name="x" size={20} color="#666" />
            </TouchableOpacity>
          )}
        </View>
      )}

      {/* Filter Modal */}
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
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Filter & Sort Notes</Text>
            <TouchableOpacity
              onPress={() => setShowFilterModal(false)}
              style={styles.modalCloseButton}
            >
              <Icon name="x" size={24} color="#666" />
            </TouchableOpacity>
          </View>

          <Text style={styles.modalLabel}>Category</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={selectedCategory}
              onValueChange={setSelectedCategory}
              style={styles.picker}
            >
              {categories.map((category) => (
                <Picker.Item
                  label={category}
                  value={category}
                  key={category}
                  color={getCategoryColor(category).text}
                />
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
              <Picker.Item label="Newest First" value="DESC" />
              <Picker.Item label="Oldest First" value="ASC" />
            </Picker>
          </View>

          <TouchableOpacity
            style={styles.applyButton}
            onPress={() => {
              setShowFilterModal(false);
              setPage(1);
              fetchNotes(1);
            }}
          >
            <Text style={styles.applyButtonText}>Apply Filters</Text>
          </TouchableOpacity>
        </View>
      </Modal>

      {/* Notes List */}
      <FlatList
        data={notes}
        renderItem={renderNoteCard}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={["#007bff"]}
          />
        }
        onEndReached={loadMore}
        onEndReachedThreshold={0.5}
        ListFooterComponent={() =>
          loading && notes.length > 0 ? (
            <ActivityIndicator
              style={styles.loadingMore}
              size="small"
              color="#007bff"
            />
          ) : null
        }
        ListEmptyComponent={() => (
          <View style={styles.emptyContainer}>
            <Icon name="file-text" size={60} color="#ccc" />
            <Text style={styles.emptyText}>No notes found</Text>
            <Text style={styles.emptySubText}>
              {searchQuery
                ? "Try a different search term"
                : "Tap the + button to create a note"}
            </Text>
          </View>
        )}
      />

      {/* Floating Action Button */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate("CreateNote")}
      >
        <Icon name="plus" size={24} color="#fff" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f0f4f8",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: Platform.OS === "ios" ? 50 : 20,
    paddingBottom: 10,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#e1e8ed",
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#333",
  },
  headerButtons: {
    flexDirection: "row",
  },
  iconButton: {
    padding: 8,
    marginLeft: 10,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#e1e8ed",
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: "#333",
  },
  clearSearch: {
    padding: 5,
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f0f4f8",
    padding: 20,
  },
  listContainer: {
    padding: 15,
    paddingBottom: 100,
  },
  noteCard: {
    borderRadius: 15,
    marginBottom: 15,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    backgroundColor: "#fff",
  },
  noteCardContent: {
    padding: 15,
  },
  noteHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  noteTitle: {
    fontSize: 18,
    fontWeight: "bold",
    flex: 1,
  },
  deleteButton: {
    padding: 5,
  },
  categoryChip: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  noteCategory: {
    fontSize: 14,
    marginLeft: 5,
    fontStyle: "italic",
  },
  noteContent: {
    fontSize: 16,
    color: "#666",
    marginBottom: 10,
    lineHeight: 22,
  },
  noteFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  noteDate: {
    fontSize: 12,
    color: "#999",
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
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#333",
  },
  modalCloseButton: {
    padding: 5,
  },
  modalLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#555",
    marginBottom: 8,
  },
  pickerContainer: {
    backgroundColor: "#f5f5f5",
    borderRadius: 8,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  picker: {
    height: 50,
  },
  applyButton: {
    backgroundColor: "#007bff",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 10,
  },
  applyButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  fab: {
    position: "absolute",
    right: 20,
    bottom: 20,
    backgroundColor: "#007bff",
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    padding: 40,
  },
  emptyText: {
    fontSize: 18,
    color: "#666",
    marginTop: 10,
    fontWeight: "600",
  },
  emptySubText: {
    fontSize: 14,
    color: "#999",
    marginTop: 5,
    textAlign: "center",
  },
  errorText: {
    fontSize: 16,
    color: "#ff4444",
    marginTop: 10,
    marginBottom: 20,
    textAlign: "center",
  },
  retryButton: {
    backgroundColor: "#007bff",
    paddingHorizontal: 20,
    paddingVertical: 10,
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
