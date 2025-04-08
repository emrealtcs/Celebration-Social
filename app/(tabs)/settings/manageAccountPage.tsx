import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Button,
  Alert,
  StyleSheet,
  TouchableWithoutFeedback,
  Keyboard,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Link, router } from "expo-router";
import { getUserProfile, updateUserEmail } from "../../../services/UserService";
import { CustomButton, FormField } from "../../../components";

export default function EditProfile() {
  const [email, setEmail] = useState("");
  const [confirmEmail, setConfirmEmail] = useState("");

  const handleChangePasswordPress = () => {
    router.push("/settings/changePasswordPage");
  };
  /*Needs to be changed*/
  const handleDeleteAccountPress = () => {
    router.push("/settings/changePasswordPage");
  };

  useFocusEffect(
    React.useCallback(() => {
      const fetchUserData = async () => {
        try {
          const user = await getUserProfile();
          if (user) {
            setEmail(user.email || "");
            setConfirmEmail("");
          }
        } catch (error) {
          Alert.alert("Error", "Unable to fetch user profile.");
        }
      };

      fetchUserData();
    }, [])
  );

  const handleSaveEmail = async () => {
    if (email !== confirmEmail) {
      Alert.alert("Error", "Emails do not match.");
      return;
    }
    try {
      await updateUserEmail({ email });
      Alert.alert("Success", "User credentials updated successfully.");
      router.back();
    } catch (error) {
      Alert.alert("Error", "Failed to update user credentials.");
    }
  };

  return (
    <ScrollView className="bg-white h-full">
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View className="flex-1 p-5 bg-white">
          <FormField
            title="Email"
            value={email}
            handleChangeText={setEmail}
            otherStyles="mt-1"
            placeholder={"Your Email"}
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <FormField
            title="Confirm Email"
            value={confirmEmail}
            handleChangeText={setConfirmEmail}
            otherStyles="mt-5"
            placeholder={"Re-enter Your Email"}
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <CustomButton
            title="Save Email"
            handlePress={handleSaveEmail}
            containerStyles="mt-4"
            textStyles="font-bold text-lg"
          />
          <CustomButton
            title="Change Password"
            handlePress={handleChangePasswordPress}
            containerStyles="mt-4"
            textStyles="font-bold text-lg"
          />
          <CustomButton
            title="Delete Account"
            handlePress={handleDeleteAccountPress}
            containerStyles="mt-4 bg-red-500"
            textStyles="font-bold text-lg"
          />
        </View>
      </TouchableWithoutFeedback>
    </ScrollView>
  );
}
