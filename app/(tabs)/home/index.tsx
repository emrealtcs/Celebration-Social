import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  Keyboard,
  ScrollView,
} from "react-native";
import { Link, router } from "expo-router";

import { images } from "../../../constants";
import { CustomButton, FormField, CustomButtonTwo } from "../../../components";
import { SafeAreaView } from "react-native-safe-area-context";

const HomePage = () => {
  const handleChooseEventPress = () => {
    router.push("/home/events/chooseEvent");
  };

  const handleViewEventsPress = () => {
    router.push("/home/events/viewEvents");
  };

  const handleCreateEventPress = () => {
    router.push("/home/events/createEvent");
  };

  return (
    <View className="w-full h-full bg-[#f5f5f5] justify-center my-6 ">
      <Image
        source={images.flowerBanner}
        //resizeMode="contain"
        className="w-[390px] h-[150px]"
      ></Image>
      <CustomButtonTwo
        title="Upload Photo"
        handlePress={handleChooseEventPress}
        containerStyles="h-1/4 mt-7 bg-red-500 mx-7"
        textStyles="text-3xl"
        icon={images.upload}
      />
      <CustomButton
        title="View Upcoming Events"
        handlePress={handleViewEventsPress}
        containerStyles="h-1/9 mt-7 bg-blue-500 mx-7"
        textStyles="text-3xl"
        icon={images.eye}
      />
      <CustomButton
        title="Create New Event"
        handlePress={handleCreateEventPress}
        containerStyles="h-1/9 mt-7 bg-green-400 mx-7 mb-12"
        textStyles="text-3xl"
        icon={images.plus}
      />
    </View>
  );
};

export default HomePage;
