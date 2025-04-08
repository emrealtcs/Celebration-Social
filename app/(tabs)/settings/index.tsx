import React, { useState } from "react";
import { View, Text, ScrollView, Alert } from "react-native";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

import { CustomButton } from "../../../components";
import { useAuth } from "../../../services/AuthService";

export default function SettingsPage() {
  const [isSubmitting, setSubmitting] = useState(false);

  const { signOut } = useAuth();

  const handleManageAccountPress = () => {
    router.push("/settings/manageAccountPage");
  };

  const handleLogoutPress = async () => {
    setSubmitting(true);

    try {
      await signOut();
      router.replace("/login");
      Alert.alert("You have been logged out!");
    } catch (error: any) {
      Alert.alert("Error logging out!");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ScrollView className="bg-white h-full">
      <View className="w-full justify-center px-4 my-5 ">
        <CustomButton
          title="Manage Account"
          handlePress={handleManageAccountPress}
          containerStyles="mt-7"
          isLoading={isSubmitting}
        />
        <CustomButton
          title="Log out"
          handlePress={handleLogoutPress}
          containerStyles="mt-7"
          isLoading={isSubmitting}
        />
      </View>
    </ScrollView>
  );
}
