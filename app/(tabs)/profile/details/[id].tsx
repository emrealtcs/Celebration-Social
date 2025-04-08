import { useLocalSearchParams, router } from "expo-router";
import React, { useState, useEffect } from "react";
import { useNavigation } from "@react-navigation/native";
import { View, Text, ScrollView, Image, TouchableOpacity } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import QRCode from "react-native-qrcode-svg"; // Import QR Code library
import { Event } from "../../../../services/_Model";
import { CustomButton } from "../../../../components";

const DetailsPage = () => {
  const { id, event } = useLocalSearchParams(); // Extract event details from URL
  const navigation = useNavigation();

  // Parse event details
  const eventDetails: Event | null = event ? JSON.parse(event as string) : null;

  const [selectedPhotos, setSelectedPhotos] = useState<string[]>([]);

  useEffect(() => {
    if (eventDetails) {
      navigation.setOptions({ title: eventDetails.eventTitle }); // Set page header to event title
    }
  }, [navigation]);

  let photoUrls: string[] = [];
  if (eventDetails?.photos) {
    photoUrls = Object.values(eventDetails?.photos);
  }

  if (!eventDetails) {
    return (
      <View className="flex-1 p-4">
        <Text>No event details found.</Text>
      </View>
    );
  }

  const togglePhotoSelection = (uri: string) => {
    setSelectedPhotos((prev) =>
      prev.includes(uri) ? prev.filter((item) => item !== uri) : [...prev, uri]
    );
  };

  return (
    <View className="flex-1 p-4 bg-white">
      {/* Event Details */}
      <Text className="text-2xl font-bold">{eventDetails.eventTitle}</Text>
      <Text className="text-md text-gray-600">
        {eventDetails.eventDateTime?.date} ·{" "}
        {eventDetails.eventDateTime?.startTime} - {eventDetails.eventDateTime?.endTime}
      </Text>
      <Text className="text-md text-gray-800">
        {eventDetails.location?.streetAddress}, {eventDetails.location?.city}
      </Text>

      <Text className="text-2xl font-semibold mt-5">Photos</Text>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View className="flex flex-wrap flex-row justify-between mt-3">
          {photoUrls.map((uri, index) => (
            <TouchableOpacity key={index} onPress={() => togglePhotoSelection(uri)}>
              <View className="w-1/2 mb-3 px-1">
                <Image
                  source={{ uri }}
                  className="w-full aspect-[1/1]"
                />
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
                    }}
                  >
                    <Text style={{ color: "white", fontSize: 24 }}>✓</Text>
                  </View>
                )}
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      {/* Button to add selected photos to an album */}
      {selectedPhotos.length > 0 && (
        <View className="mt-4">
          <CustomButton
            title="Add selected photos to album"
            handlePress={() =>
              router.push({
                pathname: "/(tabs)/albums/selectAlbumPage",
                params: { selectedPhotos: JSON.stringify(selectedPhotos) },
              })
            }
          />
        </View>
      )}
    </View>
  );
};
  

export default DetailsPage;
