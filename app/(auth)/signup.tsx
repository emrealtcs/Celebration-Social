import React, { useState } from "react";
import {
  View,
  ScrollView,
  Text,
  TouchableOpacity,
  Alert,
  TouchableWithoutFeedback,
  Keyboard,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Picker } from "@react-native-picker/picker";
import { Link, router } from "expo-router";

import { states } from "../../constants";
import { CustomButton, FormField } from "../../components";
import { useAuth } from "../../services/AuthService";
import { User } from "../../services/_Model";

export default function SignupPage() {
  const [isSubmitting, setSubmitting] = useState(false);

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("AL");

  const { register } = useAuth();

  const handleSignup = async () => {
    if (!username || !email || !password || !name || !city) {
      Alert.alert("Username, password, name, or country must be entered");
      return;
    }

    const user: User = {
      name: name,
      username: username,
      email: email,
      city: city,
      state: state,
    };

    setSubmitting(true);

    try {
      await register(user, password);
      router.replace("/login");
      Alert.alert("Account Created");
    } catch (e: any) {
      let error = e.toString();
      error = error.substring(error.indexOf("]") + 1);
      Alert.alert(error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView className="bg-white3">
      <ScrollView>
        <View className="w-full flex justify-start px-4 my-3">
          <Text className="text-2xl font-semibold text-black font-psemibold">
            Sign up to Candid Capture
          </Text>

          <FormField
            title="Username"
            value={username}
            handleChangeText={setUsername}
            placeholder={"Username..."}
            otherStyles="mt-5"
            autoCapitalize="none"
          />

          <FormField
            title="Email"
            value={email}
            handleChangeText={setEmail}
            placeholder={"Email..."}
            otherStyles="mt-7"
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <FormField
            title="Password"
            value={password}
            handleChangeText={setPassword}
            placeholder={"Password..."}
            otherStyles="mt-7"
            autoCapitalize="none"
          />

          <FormField
            title="Name"
            value={name}
            handleChangeText={setName}
            placeholder={"Name..."}
            otherStyles="mt-7"
          />

          <FormField
            title="City"
            value={city}
            handleChangeText={setCity}
            placeholder={"City..."}
            otherStyles="mt-7"
          />

          <View className="space-y-2 mt-7 ">
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
                selectedValue={state}
                onValueChange={(state: string) => setState(state)}
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
            title="Sign Up"
            handlePress={handleSignup}
            containerStyles="mt-7"
            isLoading={isSubmitting}
          />

          <View className="flex justify-center pt-5 flex-row gap-2">
            <Text className="text-lg text-gray-400 font-pregular">
              Have an account already?
            </Text>
            <Link
              href="/login"
              className="text-lg font-psemibold text-blue-500"
            >
              Login
            </Link>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
