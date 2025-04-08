import React, { useState, useEffect, useCallback } from "react";
import { View, Text, ScrollView, Alert, Image, TouchableOpacity } from "react-native";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { ref as dbRef, query, orderByChild, equalTo, onValue, off } from "firebase/database";
import { auth, db } from "../../../services/_Config"
import { Album } from "../../../services/_Model";
import { useFocusEffect } from '@react-navigation/native';

import { CustomButton } from "../../../components";

export default function AlbumsPage() {
  const userId = auth.currentUser?.uid;

  if (!userId) {
    Alert.alert("Error", "User not logged in.");
    return;
  }

  const [albums, setAlbums] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);


  /*useEffect(() => {
    const albumsRef = dbRef(db, "albums");
    const userAlbumsQuery = query(albumsRef, orderByChild("owner"), equalTo(userId));

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
  }, [userId]);*/

  useFocusEffect(
    useCallback(() => {
      const albumsRef = dbRef(db, "albums");
      const userAlbumsQuery = query(albumsRef, orderByChild("owner"), equalTo(userId));
      
      setLoading(true);
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
    }, [userId])
  );



  const handleNewAlbumPress = () => {
    router.push(`/albums/newAlbumPage?id=${userId}`);
  }; 

  const handleAlbumDetailsPress = () => {
    router.push(`/albums/albumDetailsPage?id=${userId}`);
  };

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center">
        <Text>Getting the Memories Ready! Loading albums...</Text>
      </View>
    );
  }

  return (
    <ScrollView className="bg-white h-full">
      <View className="w-full justify-center px-4 my-5">
        <CustomButton
          title="Create a New Album"
          handlePress={handleNewAlbumPress}
          containerStyles="mt-7"
        />
      </View>

      <View className="px-4">
        {albums.length > 0 ? (
          albums.map((album) => {
            const rawCoverUrl = album.photos ? Object.values(album.photos)[0] : "";
            const coverUrl = typeof rawCoverUrl === "string" ? decodeURI(rawCoverUrl) : "";
            return (
              <View key={album.id} className="mb-5">
                <TouchableOpacity onPress={() => router.push(`/albums/albumDetailsPage?id=${album.id}`)}>
                {coverUrl ? (
                  <Image
                    source={{ uri: decodeURI(coverUrl) }}
                    className="w-full h-40 rounded-md"
                  />
                ) : (
                  <View className="w-full h-40 bg-gray-300 rounded-md justify-center items-center">
                    <Text>No Cover</Text>
                  </View>
                )}
                </TouchableOpacity>
                <Text className="mt-2 text-lg font-bold">{album.albumName}</Text>
              </View>
            );
          })
        ) : (
          <Text className="text-center mt-5">You have no albums yet.</Text>
        )}
      </View>
    </ScrollView>
  );
}

