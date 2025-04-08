import { View, Text, Alert, ScrollView, FlatList, Image, TextInput } from "react-native";
import React, { useState, useMemo } from "react";
import { router, useLocalSearchParams } from "expo-router";
import { CustomButton, FormField } from "../../../components";
import * as ImagePicker from "expo-image-picker";
import { uploadPhotosToAlbum, createAlbum} from "../../../services/AlbumService";
import { auth } from "../../../services/_Config"

const newAlbumPage = () => {
const userId = auth.currentUser?.uid;
  const [uploading, setUploading] = useState(false);
  const [images, setImages] = useState<string[]>([]);
  const [albumName, setAlbumName] = useState("");

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
    if (!albumName) {
        Alert.alert("Album Name is require", "Please name your albumName.");
        return;
    }

    if (!userId) {
        Alert.alert("Error", "User ID is not available.");
        return;
      }

    if (!images) {
      Alert.alert("No Image Selected", "Please select an image first.");
      return;
    }

    try {
      setUploading(true);
      const albumId = await createAlbum(albumName, userId.toString());
      await uploadPhotosToAlbum(albumId, images);
      Alert.alert("Success", "Photos uploaded!");
      //router.replace("/home");
    } catch (error: any) {
      Alert.alert("Upload Failed", error.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <View className="p-5 flex-1">
      <TextInput
        placeholder="Enter album name"
        value={albumName}
        onChangeText={setAlbumName}
        className="border p-3 rounded-md mb-5"
      />
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
              <Image
                source={{ uri }}
                className="w-full aspect-[1/1]"
              />
            </View>
          ))}
        </View>
      </ScrollView>
      <CustomButton
        title="Create Album"
        handlePress={uploadImages}
        containerStyles="mt-5"
        textStyles="font-bold text-lg"
      />
    </View>
  );
};

export default newAlbumPage;