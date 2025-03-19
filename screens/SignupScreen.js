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

const { width } = Dimensions.get("window");
const API_URL = 'http://localhost:8080'; // Update with your API URL

const SignUpScreen = () => {
  const navigation = useNavigation();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Validate email format
  const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    }

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

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle sign up
  const handleSignUp = async () => {
    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      // For demo purposes, we'll just simulate a successful signup
      // In a real app, you would make an API call here
      await new Promise(resolve => setTimeout(resolve, 1000));

      Alert.alert(
        "Success",
        "Account created successfully!",
        [
          {
            text: "OK",
            onPress: () => navigation.navigate("Login")
          }
        ]
      );
    } catch (error) {
      Alert.alert(
        "Error",
        error.message || "Failed to create account. Please try again."
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
          <Icon name="user-plus" size={60} color="#007bff" style={styles.logo} />
          <Text style={styles.header}>Create Account</Text>
          <Text style={styles.subHeader}>Sign up to get started</Text>

          {/* Name Input */}
          <View style={styles.inputContainer}>
            <Icon name="user" size={20} color="#666" style={styles.inputIcon} />
            <TextInput
              style={[styles.input, errors.name && styles.inputError]}
              placeholder="Full Name"
              value={formData.name}
              onChangeText={(text) => handleChange("name", text)}
            />
          </View>
          {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}

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
          {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}

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

          {/* Confirm Password Input */}
          <View style={styles.inputContainer}>
            <Icon name="lock" size={20} color="#666" style={styles.inputIcon} />
            <TextInput
              style={[
                styles.input,
                styles.passwordInput,
                errors.confirmPassword && styles.inputError,
              ]}
              placeholder="Confirm Password"
              value={formData.confirmPassword}
              onChangeText={(text) => handleChange("confirmPassword", text)}
              secureTextEntry={!showConfirmPassword}
            />
            <TouchableOpacity
              style={styles.showPasswordButton}
              onPress={() => setShowConfirmPassword(!showConfirmPassword)}
            >
              <Icon
                name={showConfirmPassword ? "eye-off" : "eye"}
                size={20}
                color="#666"
              />
            </TouchableOpacity>
          </View>
          {errors.confirmPassword && (
            <Text style={styles.errorText}>{errors.confirmPassword}</Text>
          )}

          {/* Sign Up Button */}
          <TouchableOpacity
            style={[styles.signUpButton, loading && styles.signUpButtonDisabled]}
            onPress={handleSignUp}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Icon name="user-plus" size={20} color="#fff" />
                <Text style={styles.signUpButtonText}>Sign Up</Text>
              </>
            )}
          </TouchableOpacity>

          {/* Login Link */}
          <View style={styles.loginContainer}>
            <Text style={styles.loginText}>Already have an account? </Text>
            <TouchableOpacity onPress={() => navigation.navigate("Login")}>
              <Text style={styles.loginLink}>Login</Text>
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
    paddingRight: 50,
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
  signUpButton: {
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
  signUpButtonDisabled: {
    backgroundColor: "#ccc",
  },
  signUpButtonText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#fff",
    marginLeft: 10,
  },
  loginContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 20,
  },
  loginText: {
    fontSize: 16,
    color: "#666",
  },
  loginLink: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#007bff",
  },
});

export default SignUpScreen;
