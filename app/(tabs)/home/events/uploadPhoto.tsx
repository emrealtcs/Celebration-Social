import { View, Text, Alert, ScrollView, FlatList, Image } from "react-native";
import React, { useState, useMemo } from "react";
import { router, useLocalSearchParams } from "expo-router";
import { CustomButton, FormField } from "../../../../components";
import * as ImagePicker from "expo-image-picker";
import { uploadPhotosToEvent } from "../../../../services/PhotoService";

const uploadPhotoPage = () => {
  const { id, title } = useLocalSearchParams();
  const [uploading, setUploading] = useState(false);
  const [images, setImages] = useState<string[]>([]);

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      base64: true,
      allowsMultipleSelection: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      const selectedImageUris = result.assets.map((asset) => asset.uri);
      setImages(selectedImageUris);
    }
  };

  const uploadImages = async () => {
    if (!images) {
      Alert.alert("No Image Selected", "Please select an image first.");
      return;
    }

    try {
      setUploading(true);
      await uploadPhotosToEvent(id.toString(), images);
      Alert.alert("Success", "Photos uploaded!");
      router.replace("/home");
    } catch (error: any) {
      Alert.alert("Upload Failed", error.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <View className="p-5 flex-1">
      <CustomButton
        title="Select Images"
        handlePress={pickImage}
        containerStyles="mb-5"
        textStyles="font-bold text-lg"
      />
      <ScrollView showsVerticalScrollIndicator={false}>
        <View className="flex flex-wrap flex-row justify-between mt-3">
          {images.map((uri, index) => (
            <View key={index} className="w-1/2 mb-3 px-1">
              {/* 50% width per image */}
              <Image
                source={{ uri }}
                className="w-full aspect-[1/1]" // Ensures images are square with rounded corners
              />
            </View>
          ))}
        </View>
      </ScrollView>

      <CustomButton
        title="Upload Photos"
        handlePress={uploadImages}
        containerStyles="mt-5"
        textStyles="font-bold text-lg"
      />
    </View>
  );
};

export default uploadPhotoPage;
