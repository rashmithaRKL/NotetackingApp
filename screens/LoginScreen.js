import React, { useState } from "react";
import {
  View,
  TextInput,
  TouchableOpacity,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import Icon from "react-native-vector-icons/Feather";
import AsyncStorage from "@react-native-async-storage/async-storage";

const { width } = Dimensions.get("window");
const API_URL = 'http://localhost:8080'; // Update with your API URL

const LoginScreen = () => {
  const navigation = useNavigation();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);

  // Validate email format
  const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!isValidEmail(formData.email)) {
      newErrors.email = "Please enter a valid email";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle login
  const handleLogin = async () => {
    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      // For demo purposes, we'll just simulate a successful login
      // In a real app, you would make an API call here
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Store auth token (in a real app, this would come from your API)
      await AsyncStorage.setItem('userToken', 'demo-token');
      
      // Navigate to Home screen
      navigation.reset({
        index: 0,
        routes: [{ name: 'Home' }],
      });
    } catch (error) {
      Alert.alert(
        "Error",
        error.message || "Failed to login. Please try again."
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
      style={styles.container}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.formContainer}>
          <Icon name="book-open" size={60} color="#007bff" style={styles.logo} />
          <Text style={styles.header}>Welcome Back</Text>
          <Text style={styles.subHeader}>Sign in to continue</Text>

          {/* Email Input */}
          <View style={styles.inputContainer}>
            <Icon name="mail" size={20} color="#666" style={styles.inputIcon} />
            <TextInput
              style={[styles.input, errors.email && styles.inputError]}
              placeholder="Email"
              value={formData.email}
              onChangeText={(text) => handleChange("email", text)}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>
          {errors.email && (
            <Text style={styles.errorText}>{errors.email}</Text>
          )}

          {/* Password Input */}
          <View style={styles.inputContainer}>
            <Icon name="lock" size={20} color="#666" style={styles.inputIcon} />
            <TextInput
              style={[
                styles.input,
                styles.passwordInput,
                errors.password && styles.inputError,
              ]}
              placeholder="Password"
              value={formData.password}
              onChangeText={(text) => handleChange("password", text)}
              secureTextEntry={!showPassword}
            />
            <TouchableOpacity
              style={styles.showPasswordButton}
              onPress={() => setShowPassword(!showPassword)}
            >
              <Icon
                name={showPassword ? "eye-off" : "eye"}
                size={20}
                color="#666"
              />
            </TouchableOpacity>
          </View>
          {errors.password && (
            <Text style={styles.errorText}>{errors.password}</Text>
          )}

          {/* Login Button */}
          <TouchableOpacity
            style={[styles.loginButton, loading && styles.loginButtonDisabled]}
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Icon name="log-in" size={20} color="#fff" />
                <Text style={styles.loginButtonText}>Login</Text>
              </>
            )}
          </TouchableOpacity>

          {/* Sign Up Link */}
          <View style={styles.signupContainer}>
            <Text style={styles.signupText}>Don't have an account? </Text>
            <TouchableOpacity onPress={() => navigation.navigate("SignUp")}>
              <Text style={styles.signupLink}>Sign Up</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9f9f9",
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: "center",
    padding: 20,
  },
  formContainer: {
    width: width * 0.9,
    alignSelf: "center",
    backgroundColor: "#ffffff",
    borderRadius: 20,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  logo: {
    alignSelf: "center",
    marginBottom: 20,
  },
  header: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#333",
    textAlign: "center",
    marginBottom: 10,
  },
  subHeader: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginBottom: 30,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
    backgroundColor: "#f5f5f5",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  inputIcon: {
    padding: 10,
  },
  input: {
    flex: 1,
    height: 50,
    fontSize: 16,
    color: "#333",
    paddingHorizontal: 10,
  },
  passwordInput: {
    paddingRight: 50, // Space for the show/hide password button
  },
  inputError: {
    borderColor: "#ff4444",
  },
  errorText: {
    color: "#ff4444",
    fontSize: 14,
    marginTop: -10,
    marginBottom: 10,
    marginLeft: 10,
  },
  showPasswordButton: {
    padding: 10,
    position: "absolute",
    right: 0,
  },
  loginButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#007bff",
    paddingVertical: 15,
    borderRadius: 8,
    marginTop: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  loginButtonDisabled: {
    backgroundColor: "#ccc",
  },
  loginButtonText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#fff",
    marginLeft: 10,
  },
  signupContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 20,
  },
  signupText: {
    fontSize: 16,
    color: "#666",
  },
  signupLink: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#007bff",
  },
});

export default LoginScreen;
