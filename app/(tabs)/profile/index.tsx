import React, { useEffect, useState, useRef } from "react";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useFocusEffect } from "@react-navigation/native";
import { useNavigation } from "@react-navigation/native";
import {
  View,
  Text,
  Alert,
  Image,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Button,
  TouchableWithoutFeedback,
  Keyboard,
} from "react-native";

import images from "../../../constants/images";
import { Event, User } from "../../../services/_Model";
import { getUserProfile, updateBio } from "../../../services/UserService";
import {
  listenForUserEvents,
  listenForSharedEvents,
  isOwnEvent,
  isFriendEvent,
  listenForNewEventsAfterAccept,
} from "../../../services/EventService";

import { CustomButton, EventCard } from "../../../components";
import { ScrollView } from "react-native-gesture-handler";

export default function ProfilePage() {
  const navigation = useNavigation();

  const [userData, setUserData] = useState<User | undefined>();
  const [bio, setBio] = useState<string | "">("");
  const [showEditImage, setShowEditImage] = useState(false);

  const [events, setEvents] = useState<Array<Record<string, Event>> | any>([]);
  const [friendStatus, setFriendStatus] = useState<Record<string, boolean>>({});
  const [checkedOwners, setCheckedOwners] = useState<Set<string>>(new Set()); // Track owners we've already checked

  const [sharedEvents, setSharedEvents] = useState<
    Array<Record<string, Event>> | any
  >([]);

  const handleEditProfilePress = () => {
    router.push("/profile/editProfile");
  };

  const handleMyEventsPagePress = () => {
    router.push("/profile/editMyEventsPage");
  };

  const handleAddFriendsPagePress = () => {
    router.push("/profile/friendsPage");
  }

  useFocusEffect(
    React.useCallback(() => {
      const fetchUser = async () => {
        try {
          const user = await getUserProfile();
          setUserData(user);
          const bio = user?.bio || "";
          setBio(bio);

          if (user?.name) {
            navigation.setOptions({
              title: `Hello ${user.name}!`,
            });
          }
        } catch (error) {
          Alert.alert("Error fetching user profile");
        }
      };

      fetchUser();
    }, [navigation]) // Ensure dependencies are correct
  );

  // User Events Real-time update
  useEffect(() => {
    const unsubscribe = listenForUserEvents(setEvents); // Real-time updates

    // Cleanup when the component unmounts
    return () => unsubscribe();
  }, []); // Empty dependency array to only run once

  // User Events Real-time update
  useEffect(() => {
    const unsubscribe = listenForNewEventsAfterAccept(setEvents); // Real-time updates

    // Cleanup when the component unmounts
    return () => unsubscribe();
  }, []); // Empty dependency array to only run once

  useEffect(() => {
    const unsubscribe = listenForSharedEvents(setSharedEvents); // Real-time updates

    // Cleanup when the component unmounts
    return () => unsubscribe();
  }, []); // Empty dependency array to only run once

  const handleIsFriendEvent = async (owner: string) => {
    const result = await isFriendEvent(owner);
    setFriendStatus((prevState) => ({
      ...prevState,
      [owner]: result,
    }));
  };

  useEffect(() => {
    // Loop over events and check the owner status, but only if we haven't checked it yet
    events.forEach((event: Record<string, Event>) => {
      const eventId = Object.keys(event)[0];
      const eventData = event[eventId];
      const owner = eventData.owner;

      if (!checkedOwners.has(owner)) {
        // Call the async function to check if the event owner is a friend
        handleIsFriendEvent(owner);
        setCheckedOwners((prevChecked) => new Set(prevChecked).add(owner));
      }
    });
  }, [events, checkedOwners]); // Only run when events change or owners haven't been checked

  const handleProfilePicturePress = () => {
    if (!showEditImage) {
      setShowEditImage(true);
      setTimeout(() => setShowEditImage(false), 3000);
    } else {
      router.push("/profile/uploadProfilePicture");
      setShowEditImage(false);
    }
  };

  return (
    <View className="flex-1 bg-white">
      <View className="flex-row justify-start mx-5 mt-5">
        <TouchableOpacity
          className="w-3/12 mr-6"
          onPress={handleProfilePicturePress}
        >
          <Image
            className=" w-[100px] h-[100px] rounded-full mb-5 bg-gray-300"
            source={
              showEditImage
                ? images.editProfilePicture
                : userData?.profilePicture
                ? { uri: userData.profilePicture }
                : images.placeholder
            }
          />
        </TouchableOpacity>
        <TextInput
          className="w-8/12 h-[100px] mr-10 border border-black-200 rounded-xl pl-2.5 pr-10 text-lg"
          placeholder="..."
          value={bio}
          multiline
          editable={false}
          textAlignVertical="top"
        />
      </View>

      <View className="flex-row justify-around ">
        <CustomButton
          title="Edit My Profile"
          handlePress={handleEditProfilePress}
          containerStyles="w-"
          textStyles="font-bold text-lg"
        />

        <CustomButton
          title="Edit My Events"
          handlePress={handleMyEventsPagePress}
          containerStyles="w"
          textStyles="font-bold text-lg"
        />

        <CustomButton
          title="Add Friends"
          handlePress={handleAddFriendsPagePress}
          containerStyles="w"
          textStyles="font-bold text-lg"
        />
      </View>
      <Text className="text-2xl font-semibold mt-5 mx-7">My Events</Text>
      <ScrollView className="">
        <View className="w-full  justify-start items-center px-4 my-3 ">
          {sharedEvents.map((event: Record<string, Event>) => {
            const eventId = Object.keys(event)[0];
            const eventData = event[eventId];

            // Get the friend status for this event owner
            const isFriend = friendStatus[eventData.owner];
            const isOwn = isOwnEvent(eventData.owner);

            return (
              <EventCard
                key={eventId}
                event={eventData}
                isOwn={isOwn}
                isFriend={isFriend}
                fromProfile={true}
                isShared={true}
              />
            );
          })}
          {events.map((event: Record<string, Event>) => {
            const eventId = Object.keys(event)[0];
            const eventData = event[eventId];

            // Get the friend status for this event owner
            const isFriend = friendStatus[eventData.owner];
            const isOwn = isOwnEvent(eventData.owner);

            return (
              <EventCard
                key={eventId}
                event={eventData}
                isOwn={isOwn}
                isFriend={isFriend}
                fromProfile={true}
              />
            );
          })}
        </View>
      </ScrollView>
    </View>
  );
}
