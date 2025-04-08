import React, { useState, useEffect } from "react";
import { View, Text, ScrollView, Alert, Image, TouchableOpacity, Button } from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { ref as dbRef, onValue, off, remove } from "firebase/database";
import { db, storage } from "../../../services/_Config";
import * as FileSystem from "expo-file-system";
import { getDownloadURL, ref as storageRef, deleteObject } from "firebase/storage";
import * as ImagePicker from "expo-image-picker";
import { uploadPhotosToAlbum } from "../../../services/AlbumService"
import { CustomButton } from "../../../components";

export default function AlbumDetailsPage() {

  const { id } = useLocalSearchParams();
  const albumId = id;
  const [album, setAlbum] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [photos, setPhotos] = useState<any[]>([]);

  useEffect(() => {
    const albumRef = dbRef(db, `albums/${albumId}`);
    const listener = onValue(
      albumRef,
      (snapshot) => {
        const data = snapshot.val();
        if (data) {
          setAlbum(data);
          const albumPhotos = data.photos
            ? Object.entries(data.photos).map(([photoId, url]) => ({ id: photoId, url }))
            : [];
          setPhotos(albumPhotos);
        }
        setLoading(false);
      },
      (error) => {
        Alert.alert("Error", error.message);
        setLoading(false);
      }
    );

    return () => {
      off(albumRef);
    };
  }, [albumId]);

  const handlePhotoPress = (photoId: string, photoUrl: string) => {
    Alert.alert(
      "Photo Options",
      "Choose an action:",
      [
        {
          text: "Delete",
          onPress: () => deletePhoto(photoId, photoUrl),
          style: "destructive",
        },
        {
          text: "Download",
          onPress: () => downloadPhoto(photoUrl),
        },
        {
          text: "Cancel",
          style: "cancel",
        },
      ],
      { cancelable: true }
    );
  };

  const deletePhoto = async (photoId: string, photoUrl: string) => {
    try {
      const photoRef = dbRef(db, `albums/${albumId}/photos/${photoId}`);
      await remove(photoRef);

      const fileRef = storageRef(storage, decodeURI(photoUrl));
      await deleteObject(fileRef).catch((err) => console.log("Storage delete error:", err));

      Alert.alert("Success", "Photo deleted.");
    } catch (error: any) {
      Alert.alert("Error", error.message);
    }
  };

  const downloadPhoto = async (photoUrl: string) => {
    try {
      const fileUri = FileSystem.documentDirectory + "downloadedImage.jpg";
      const downloadResumable = FileSystem.createDownloadResumable(photoUrl, fileUri);
      const result = await downloadResumable.downloadAsync();
      if (result && result.uri) {
        Alert.alert("Download complete", "Image saved to: " + result.uri);
      }
    } catch (error: any) {
      Alert.alert("Error", error.message);
    }
  };

  const handleAddPhotos = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsMultipleSelection: true,
        quality: 1,
      });

      if (!result.canceled) {
        const imageUris = result.assets.map(asset => asset.uri)
        const albumIdString = typeof albumId === "string" ? albumId : albumId[0];
        await uploadPhotosToAlbum(albumIdString, imageUris);
        Alert.alert("Success", "Photos uploaded successfully!");
      }
    } catch (error: any) {
      Alert.alert("Error", error.message);
    }
  };

  const handleShareWithFriends = () => {
    router.push("/profile/friendsPage");
  }

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center">
        <Text>Loading album details...</Text>
      </View>
    );
  }

  return (
    <ScrollView className="p-4 bg-white">
      <Text className="text-2xl font-bold mb-4">{album.albumName}</Text>
      <View className="flex-row space-x-2 mb-4">
      <View className="w-full justify-center px-4 my-5">
        <CustomButton
          title="Share Album with Friends"
          handlePress={handleShareWithFriends}
          containerStyles="mt-7"
        />
        <CustomButton
          title="Add Photos to This Album"
          handlePress={handleAddPhotos}
          containerStyles="mt-7"
        />
      </View>
      </View>
      <View className="grid grid-cols-2 gap-4 mt-3">
        {photos.length > 0 ? (
          photos.map((photo) => (
            <TouchableOpacity key={photo.id} onPress={() => handlePhotoPress(photo.id, photo.url)}>
              <Image source={{ uri: photo.url }} 
              className="w-full aspect-square m-1 rounded-md"
              resizeMode="cover"
              />
              
            </TouchableOpacity>
          ))
        ) : (
          <Text>No photos available.</Text>
        )}
      </View>
    </ScrollView>
  );
}