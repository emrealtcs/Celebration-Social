import React, { useState, useEffect } from "react";
import { View, Text, ScrollView, Alert, Image, TouchableOpacity } from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { ref as dbRef, query, orderByChild, equalTo, onValue, off } from "firebase/database";
import { auth, db } from "../../../services/_Config";
import { uploadPhotosToAlbum } from "../../../services/AlbumService";



/*
Note, the add friend's to album feature (redirected from friendsPage) is not fully implemented yet
Currently, when redirected here, it just says "Success, added photos to album"

This error is not specific to just adding friends: it occurs when simply trying to view an album sometimes.
*/

const SelectAlbumPage = () => {
  const { selectedPhotos } = useLocalSearchParams();
  let parsedPhotos: string[] = [];

if (Array.isArray(selectedPhotos)) {
    parsedPhotos = selectedPhotos;
} else if (typeof selectedPhotos === "string") {
    parsedPhotos = JSON.parse(selectedPhotos);
}
  
  const userId = auth.currentUser?.uid;
  const [albums, setAlbums] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const albumsRef = dbRef(db, "albums");
    const userAlbumsQuery = query(albumsRef, orderByChild("owner"), equalTo(userId!));
    const listener = onValue(
      userAlbumsQuery,
      (snapshot) => {
        const data = snapshot.val();
        const albumsList: any[] = [];
        if (data) {
          for (let id in data) {
            albumsList.push({ id, ...data[id] });
          }
        }
        setAlbums(albumsList);
        setLoading(false);
      },
      (error) => {
        Alert.alert("Error", error.message);
        setLoading(false);
      }
    );
    return () => {
      off(userAlbumsQuery);
    };
  }, [userId]);

  const handleAlbumSelect = async (albumId: string) => {
    console.log("Selected albumId:", albumId);
    console.log("Photos to upload:", parsedPhotos);
    try {
      await uploadPhotosToAlbum(albumId, parsedPhotos);
      Alert.alert("Success", "Photos added to album!");
      //router.replace("/home");
    } catch (error: any) {
    console.error("Error uploading photos:", error);
      Alert.alert("Error", error.message);
    }
  };

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center">
        <Text>Loading Albums...</Text>
      </View>
    );
  }

  if (!albums) {
    return (
      <View className="flex-1 justify-center items-center">
        <Text>No album found.</Text>
      </View>
    );
  }

  const nonNullAlbums = albums.filter(album => album && album.albumName);

if (nonNullAlbums.length === 0) {
  return (
    <View className="flex-1 justify-center items-center">
      <Text>No album found.</Text>
    </View>
  );
}

  return (
    <ScrollView className="bg-white h-full p-4">

      <Text className="text-xl font-bold mb-4">Select an Album</Text>

      {albums.filter((album) => album !== null).length > 0 ? (
      albums
        .filter((album) => album !== null)
        .map((album) => (
          <TouchableOpacity
            key={album.id}
            onPress={() => handleAlbumSelect(album.id)}
            className="mb-5"
          >
            {album.photos && Object.values(album.photos)[0] ? (
               
              <Image
              source={{ uri: decodeURI(Object.values(album.photos)[0] as string) }}
                className="w-full h-40 rounded-md"
              />
            ) : (
              <View className="w-full h-40 bg-gray-300 rounded-md justify-center items-center">
                <Text>No Cover</Text>
              </View>
            )}
            <Text className="mt-2 text-lg font-bold">{album.albumName}</Text>
          </TouchableOpacity>
        ))
      ) : (
        <Text className="text-center mt-5">You have no albums yet.</Text>
      )}
    </ScrollView>
  );
};

export default SelectAlbumPage;