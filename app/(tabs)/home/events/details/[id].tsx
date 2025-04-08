import { useLocalSearchParams, router } from "expo-router";
import React, { useState, useEffect } from "react";
import { useNavigation } from "@react-navigation/native";
import { View, Text, Share, TouchableOpacity, Alert, Image, ScrollView } from "react-native";
import { Share2 } from "lucide-react-native";
import QRCode from "react-native-qrcode-svg";
import { ref, onValue } from "firebase/database";
import { db } from "../../../../../services/_Config";
import { getAuth } from "firebase/auth";
import { addEventToUser } from "../../../../../services/EventService";

const DetailsPage = () => {
  const { id, event } = useLocalSearchParams(); 
  const navigation = useNavigation();


  const [setEventDetails] = useState<any>(null);
  const [selectedPhotos, setSelectedPhotos] = useState<string[]>([]);

  const eventDetails = event ? JSON.parse((event as string)) : null;

  useEffect(() => {
    const fetchEvent = async () => {
      if (event) {
        const parsed = JSON.parse(decodeURIComponent(event as string));
        const isOwner = parsed.owner === getAuth().currentUser?.uid;

        if (isOwner || parsed.photos) {
          setEventDetails(parsed);
        } else {
          const eventRef = ref(db, `events/${parsed.id}`);
          onValue(eventRef, (snapshot) => {
            const fullEvent = snapshot.val();
            if (fullEvent) setEventDetails(fullEvent);
          });
        }
      }
    };

    fetchEvent();
  }, [event]);

  useEffect(() => {
    if (eventDetails) {
      navigation.setOptions({ title: eventDetails.eventTitle });
    }
  }, [eventDetails]);

  const togglePhotoSelection = (uri: string) => {
    setSelectedPhotos((prev) =>
      prev.includes(uri) ? prev.filter((item) => item !== uri) : [...prev, uri]
    );
  };

  const photoUrls: string[] = eventDetails?.photos ? Object.values(eventDetails.photos) : [];

  const currentUser = getAuth().currentUser;
  const isOwner = eventDetails?.owner === currentUser?.uid;
  const eventUrl = `myapp://home/events/details/${id}`;

  const handleAddToMyEvents = async () => {
    if (!currentUser || !eventDetails?.id || !eventDetails?.owner) return;
    try {
      await addEventToUser(currentUser.uid, eventDetails.id, eventDetails.owner);
      Alert.alert("Success", "Event added to your events.");
    } catch (err) {
      console.error("Failed to add event:", err);
      Alert.alert("Error", "Failed to add event.");
    }
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Check out this event on our app!\n${eventUrl}`,
      });
    } catch (error) {
      console.error("Error sharing event:", error);
    }
  };

  if (!eventDetails) {
    return (
      <View className="flex-1 p-4">
        <Text>No event details found.</Text>
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 p-4 bg-white">
      <Text className="text-2xl font-bold mb-2">{eventDetails.eventTitle}</Text>

      <Text className="text-md text-gray-600 mb-1">
        {eventDetails.eventDateTime?.date} · {eventDetails.eventDateTime?.startTime} - {eventDetails.eventDateTime?.endTime}
      </Text>

      {eventDetails.eventType === "Birthday" && eventDetails.celebrant && (
        <Text className="text-md text-gray-700 mb-1">🎉 Celebrant: {eventDetails.celebrant}</Text>
      )}

      {eventDetails.eventType === "Graduation" && eventDetails.graduate && (
        <Text className="text-md text-gray-700 mb-1">🎓 Graduate: {eventDetails.graduate}</Text>
      )}

      {eventDetails.eventType === "Wedding" && (
        <Text className="text-md text-gray-700 mb-1">
          💍 {eventDetails.brideName && `Bride: ${eventDetails.brideName}`}{" "}
          {eventDetails.groomName && `Groom: ${eventDetails.groomName}`}
        </Text>
      )}

      {eventDetails.eventType === "Other" && eventDetails.host && (
        <Text className="text-md text-gray-700 mb-1">👤 Hosted by: {eventDetails.host}</Text>
      )}

      <Text className="text-md text-gray-700 mb-1">
        🧑‍🤝‍🧑 Guests Invited: {eventDetails.numberOfGuests}
      </Text>

      <Text className="text-md text-gray-800 mb-1">
        📍 {eventDetails.location?.streetAddress}, {eventDetails.location?.city}, {eventDetails.location?.state} {eventDetails.location?.zip}
      </Text>

      {eventDetails.description?.trim() !== "" && (
        <Text className="text-md text-gray-700 mt-2">📝 {eventDetails.description}</Text>
      )}

      {eventDetails.info?.trim() !== "" && (
        <Text className="text-md text-gray-600 mt-1 italic">ℹ️ {eventDetails.info}</Text>
      )}

      {/* QR Code & Sharing */}
      <View className="mt-6 flex items-center">
        <Text className="text-md font-semibold mb-2">Share this event</Text>
        <QRCode value={eventUrl} size={200} />
        <Text className="text-xs text-gray-500 mt-2">Scan to view this event</Text>

        <TouchableOpacity
          onPress={handleShare}
          className="mt-4 flex-row items-center bg-blue-500 px-4 py-2 rounded-full"
        >
          <Share2 size={18} color="white" style={{ marginRight: 8 }} />
          <Text className="text-white text-sm font-semibold">Share Link</Text>
        </TouchableOpacity>
      </View>

      {/* Photos */}
      {photoUrls.length > 0 && (
        <>
          <Text className="text-2xl font-semibold mt-8 mb-2">📸 Photos</Text>
          <View className="flex flex-wrap flex-row justify-between">
            {photoUrls.map((uri, index) => (
              <TouchableOpacity key={index} onPress={() => togglePhotoSelection(uri)}>
                <View className="w-1/2 mb-3 px-1">
                  <Image source={{ uri }} className="w-full aspect-[1/1] rounded-lg" />
                  {selectedPhotos.includes(uri) && (
                    <View
                      style={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundColor: "rgba(0,0,0,0.3)",
                        justifyContent: "center",
                        alignItems: "center",
                        borderRadius: 8,
                      }}
                    >
                      <Text style={{ color: "white", fontSize: 24 }}>✓</Text>
                    </View>
                  )}
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </>
      )}

            {/* Conditional Buttons */}
            {!isOwner && (
        <TouchableOpacity
        onPress={handleAddToMyEvents}
        className="mt-4 bg-green-600 px-4 py-2 rounded-lg w-full"
      >
        <Text className="text-white text-center font-semibold">Add to My Events</Text>
      </TouchableOpacity>
      )}

      {selectedPhotos.length > 0 && (
        <TouchableOpacity
          onPress={() =>
            router.push({
              pathname: "/(tabs)/albums",
              params: { selectedPhotos: JSON.stringify(selectedPhotos) },
            })
          }
          className="mt-4 bg-purple-600 px-4 py-2 rounded-lg"
        >
          <Text className="text-white text-center font-semibold">Add to Album</Text>
        </TouchableOpacity>
      )}

    </ScrollView>
  );
};

export default DetailsPage;
