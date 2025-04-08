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
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { Picker } from "@react-native-picker/picker";
import {
  getUserProfile,
  updateUserProfile,
} from "../../../services/UserService";
import { states } from "../../../constants";
import { CustomButton, FormField } from "../../../components";

export default function EditProfile() {
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [bio, setBio] = useState<string | "">("");
  const [city, setCity] = useState("");
  const [selectedState, setSelectedState] = useState("AL");

  useFocusEffect(
    React.useCallback(() => {
      const fetchUserData = async () => {
        try {
          const user = await getUserProfile();
          if (user) {
            setName(user.name || "");
            setUsername(user.username || "");
            setBio(user.bio || "");
            setCity(user.city || "");
            setSelectedState(user.state || "AL");
          }
        } catch (error) {
          Alert.alert("Error", "Unable to fetch user profile.");
        }
      };

      fetchUserData();
    }, [])
  );

  const handleSaveProfile = async () => {
    try {
      await updateUserProfile({
        name,
        username,
        bio,
        city,
        state: selectedState,
      });
      Alert.alert("Success", "Profile updated successfully.");
      router.back();
    } catch (error) {
      Alert.alert("Error", "Failed to update profile.");
    }
  };

  return (
    <ScrollView className="bg-white h-full">
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View className="flex-1 p-5 bg-white">
          <FormField
            title="Name"
            value={name}
            handleChangeText={setName}
            otherStyles="mt-1"
            placeholder={"Your Name"}
            autoCapitalize="none"
          />

          <FormField
            title="Username"
            value={username}
            handleChangeText={setUsername}
            otherStyles="mt-3"
            placeholder={"Your Username"}
            autoCapitalize="none"
          />

          <FormField
            title="Bio"
            value={bio}
            handleChangeText={setBio}
            otherStyles="mt-3"
            placeholder={"Your Bio"}
            autoCapitalize="none"
          />

          <FormField
            title="City"
            value={city}
            handleChangeText={setCity}
            otherStyles="mt-3"
            placeholder={"Your City"}
            autoCapitalize="none"
          />

          <View className="space-y-2 mt-5 ">
            <Text className="text-lg text-black font-pmedium">State</Text>
            <View
              style={{
                borderRadius: 15,
                borderWidth: 2,
                borderColor: "black",
              }}
            >
              <Picker
                itemStyle={{
                  color: "black",
                  fontSize: 18,
                  height: 150,
                }}
                mode={"dropdown"}
                selectedValue={selectedState}
                onValueChange={(state: string) => setSelectedState(state)}
              >
                {states.map((state) => (
                  <Picker.Item
                    key={state.label}
                    label={state.label}
                    value={state.value}
                  />
                ))}
              </Picker>
            </View>
          </View>

          <CustomButton
            title="Save Profile"
            handlePress={handleSaveProfile}
            containerStyles="mt-5"
            textStyles="font-bold text-lg"
          />
        </View>
      </TouchableWithoutFeedback>
    </ScrollView>
  );
}
