import React, { useState } from "react";
import {
  View,
  ScrollView,
  Text,
  Image,
  Alert,
  TouchableWithoutFeedback,
  Keyboard,
} from "react-native";
import { Link, router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

import { images } from "../../constants";
import { CustomButton, FormField } from "../../components";
import { useAuth } from "../../services/AuthService";

export default function LoginPage() {
  const [isSubmitting, setSubmitting] = useState(false);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const { signIn } = useAuth(); //goes to services->AuthService

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Please enter both email and password.");
      return;
    }

    setSubmitting(true);

    try {
      await signIn(email, password);
      router.replace("/home");
    } catch (error: any) {
      let errorMessage = "An error occurred. Please try again.";

      if (error.code === "auth/invalid-email") {
        errorMessage = "Invalid email format.";
      } else if (error.code === "auth/user-not-found") {
        errorMessage = "No account found with this email.";
      } else if (error.code === "auth/wrong-password") {
        errorMessage = "Incorrect password.";
      }

      Alert.alert(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <SafeAreaView className="bg-white h-full">
        <ScrollView>
          <View className="w-full justify-center h-full px-4 my-6">
            <Text className="text-4xl font-bold text-center text-black  font-pbold">
              Candid Capture
            </Text>
            <Image
              source={images.login}
              resizeMode="contain"
              className="w-[380px] h-[200px]"
            ></Image>

            <Text className="text-2xl font-semibold text-black mt-10 font-psemibold">
              Log in to Capture every moment!
            </Text>

            {/* components */}
            <FormField
              title="Email"
              value={email}
              handleChangeText={setEmail}
              otherStyles="mt-7"
              placeholder={"Email..."}
              keyboardType="email-address"
              autoCapitalize="none"
            />

            <FormField
              title="Password"
              value={password}
              handleChangeText={setPassword}
              otherStyles="mt-7"
              autoCapitalize="none"
            />

            <CustomButton
              title="Sign In"
              handlePress={handleLogin}
              containerStyles="mt-7"
              isLoading={isSubmitting}
            />

            <View className="flex justify-center pt-5 flex-row gap-2">
              <Text className="text-lg text-gray-400 font-pregular">
                Don't have an account?
              </Text>
              <Link
                href="/signup"
                className="text-lg font-psemibold text-blue-500"
              >
                Signup
              </Link>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </TouchableWithoutFeedback>
  );
}
