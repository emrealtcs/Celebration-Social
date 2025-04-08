import React, { useState } from "react";
import { View, Text, ScrollView, Alert, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons"; // for the eye icon
import { CustomButton, FormField } from "../../../components";
import { useAuth } from "../../../services/AuthService";
import { auth } from "../../../services/_Config";
import { EmailAuthProvider, reauthenticateWithCredential } from "firebase/auth";
import { update } from "firebase/database";

export default function ChangePasswordPage() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSubmitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const { updatePassword } = useAuth();

  const handleChangePassword = async () => {
    if (newPassword !== confirmPassword) {
      Alert.alert(
        "Passwords do not match",
        "Please ensure both passwords are the same."
      );
      return;
    }

    const user = auth.currentUser;
    if (user && user.email) {
      const credential = EmailAuthProvider.credential(
        user.email,
        currentPassword
      );
      setSubmitting(true);
      try {
        await reauthenticateWithCredential(user, credential);
        await updatePassword(newPassword);
        Alert.alert("Success", "Your password has been changed.");
      } catch (error: any) {
        Alert.alert(
          "Error",
          error.message || "Something happpened, cannot change password"
        );
      } finally {
        setSubmitting(false);
      }
    } else {
      Alert.alert("Error", "No user is logged in.");
    }
  };

  return (
    <ScrollView
      className="bg-white h-full"
      contentContainerStyle={{ padding: 16 }}
    >
      {/* Current Password Field */}
      <FormField
        title="Current Password"
        value={currentPassword}
        handleChangeText={setCurrentPassword}
        otherStyles="mt-1"
        autoCapitalize="none"
      />

      {/* New Password Field */}
      <FormField
        title="New Password"
        value={newPassword}
        handleChangeText={setNewPassword}
        otherStyles="mt-5"
        autoCapitalize="none"
      />

      {/* Confirm New Password Field */}
      <FormField
        title="Confirm New Password"
        value={confirmPassword}
        handleChangeText={setConfirmPassword}
        otherStyles="mt-5"
        autoCapitalize="none"
      />

      <CustomButton
        title="Change Password"
        handlePress={handleChangePassword}
        containerStyles="mt-5"
        isLoading={isSubmitting}
      />
    </ScrollView>
  );
}
