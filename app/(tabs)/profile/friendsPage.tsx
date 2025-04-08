import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Image,
  ScrollView,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { getFirestore } from "firebase/firestore";

import images from "../../../constants/images";
import FriendComponent from "../../../components/FriendComponent";
import {
  searchUsersByUsername,
  sendFriendRequest,
  acceptFriendRequest,
  rejectFriendRequest,
  removeFriend,
  getFriendsList,
  getPendingRequests,
  RequestType,
  checkFriendRequestStatus,
  checkIfFriends,
  listenForFriendsChanges,
  listenForReceivedRequests,
  FriendUser,
} from "../../../services/FriendsService";

const db = getFirestore();

const FriendsPage: React.FC = () => {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [searchResults, setSearchResults] = useState<FriendUser[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>("");

  const [friends, setFriends] = useState<FriendUser[]>([]);
  const [receivedRequests, setReceivedRequests] = useState<FriendUser[]>([]);
  const [sentRequests, setSentRequests] = useState<FriendUser[]>([]);

  const [selectedFriends, setSelectedFriends] = useState<string[]>([]);

  // Initialize listeners for friends and requests
  useEffect(() => {
    // Listen for friends changes
    const unsubscribeFriends = listenForFriendsChanges((updatedFriends) => {
      setFriends(updatedFriends);
    });

    // Listen for received requests
    const unsubscribeRequests = listenForReceivedRequests((updatedRequests) => {
      setReceivedRequests(updatedRequests);
    });

    // Load sent requests
    const loadSentRequests = async () => {
      try {
        const sentRequestsList = await getPendingRequests(RequestType.SENT);
        setSentRequests(sentRequestsList);
      } catch (error) {
        console.error("Error loading sent requests:", error);
      }
    };

    loadSentRequests();

    // Cleanup listeners on unmount
    return () => {
      unsubscribeFriends();
      unsubscribeRequests();
    };
  }, []);

  // Function to handle user search
  const handleSearch = async () => {
    setLoading(true);
    setErrorMessage("");
    setSearchResults([]);

    try {
      if (!searchQuery.trim()) {
        setErrorMessage("Please enter a username to search");
        setLoading(false);
        return;
      }

      const results = await searchUsersByUsername(searchQuery);

      if (results.length === 0) {
        setErrorMessage(
          `No users found with username starting with '${searchQuery}'`
        );
      } else {
        setSearchResults(results);
      }
    } catch (error: any) {
      console.error("Search error:", error);
      setErrorMessage(error.message || "An error occurred during search");
    }

    setLoading(false);
  };

  // Handle friend request
  const handleFriendRequest = async (user: FriendUser) => {
    try {
      setLoading(true);

      // Check if already friends
      const isAlreadyFriends = await checkIfFriends(user.uid);
      if (isAlreadyFriends) {
        Alert.alert(
          "Already Friends",
          `You are already friends with ${user.username}`
        );
        setLoading(false);
        return;
      }

      // Check request status
      const requestStatus = await checkFriendRequestStatus(user.uid);

      if (requestStatus.exists) {
        if (requestStatus.type === RequestType.SENT) {
          Alert.alert(
            "Request Pending",
            `You already sent a friend request to ${user.username}`
          );
        } else if (requestStatus.type === RequestType.RECEIVED) {
          Alert.alert(
            "Request Received",
            `${user.username} sent you a friend request. Accept it from your received requests.`
          );
        }
      } else {
        // Send new friend request
        await sendFriendRequest(user.uid);
        Alert.alert("Request Sent", `Friend request sent to ${user.username}`);

        // Refresh sent requests
        const updatedSentRequests = await getPendingRequests(RequestType.SENT);
        setSentRequests(updatedSentRequests);
      }
    } catch (error: any) {
      console.error("Friend request error:", error);
      Alert.alert(
        "Error",
        error.message || "An error occurred while sending friend request"
      );
    }

    setLoading(false);
  };

  // Handle accepting a friend request
  const handleAcceptRequest = async (user: FriendUser) => {
    try {
      setLoading(true);
      await acceptFriendRequest(user.uid);

      // Remove from received requests list
      setReceivedRequests((prev) => prev.filter((req) => req.uid !== user.uid));

      Alert.alert("Friend Added", `You are now friends with ${user.username}`);
    } catch (error: any) {
      console.error("Accept request error:", error);
      Alert.alert(
        "Error",
        error.message || "An error occurred while accepting friend request"
      );
    }

    setLoading(false);
  };

  // Handle rejecting a friend request
  const handleRejectRequest = async (user: FriendUser) => {
    try {
      setLoading(true);
      await rejectFriendRequest(user.uid);

      // Remove from received requests list
      setReceivedRequests((prev) => prev.filter((req) => req.uid !== user.uid));

      Alert.alert(
        "Request Rejected",
        `Friend request from ${user.username} was rejected`
      );
    } catch (error: any) {
      console.error("Reject request error:", error);
      Alert.alert(
        "Error",
        error.message || "An error occurred while rejecting friend request"
      );
    }

    setLoading(false);
  };

  const handleFriendPress = (uid: string) => {
    setSelectedFriends((prevSelected) => {
      if (prevSelected.includes(uid)) {
        // If already selected, remove from selection
        return prevSelected.filter((id) => id !== uid);
      } else {
        // If not selected, add to selection
        return [...prevSelected, uid];
      }
    });
  }

  // Function to navigate to album selection page with selected friends
  const navigateToAlbumSelection = () => {
    if (selectedFriends.length === 0) {
      Alert.alert("No Friends Selected", "Please select at least one friend to add to an album.");
      return;
    }
    
    // Navigate to album selection page with selected friends as params
    router.push({
      pathname: "/albums/selectAlbumPage",
      params: { selectedFriends: JSON.stringify(selectedFriends) }
    });
  };

  // Render search result item
  const renderSearchResultItem = ({ item }: { item: FriendUser }) => (
    <TouchableOpacity style={styles.userItem}>
      <Image
        source={
          item.profilePictureURL
            ? { uri: item.profilePictureURL }
            : images.friends
        }
        style={styles.friendIcon}
      />
      <View style={styles.userInfo}>
        <Text style={styles.userName}>{item.name}</Text>
        <Text style={styles.userUsername}>@{item.username}</Text>
      </View>
      <TouchableOpacity
        style={styles.addButton}
        onPress={() => handleFriendRequest(item)}
      >
        <Ionicons name="person-add-outline" size={20} color="white" />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  // Render received request item
  const renderReceivedRequestItem = ({ item }: { item: FriendUser }) => (
    <View style={styles.requestItem}>
      <Image
        source={
          item.profilePictureURL
            ? { uri: item.profilePictureURL }
            : images.friends
        }
        style={styles.friendIcon}
      />
      <View style={styles.userInfo}>
        <Text style={styles.userName}>{item.name}</Text>
        <Text style={styles.userUsername}>@{item.username}</Text>
      </View>
      <View style={styles.requestActions}>
        <TouchableOpacity
          style={[styles.actionButton, styles.acceptButton]} 
          onPress={() => handleAcceptRequest(item)} 
        >
          <Text style={styles.actionButtonText}>Accept</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionButton, styles.rejectButton]} 
          onPress={() => handleRejectRequest(item)}
        >
          <Text style={styles.actionButtonText}>Decline</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  // Render friend item
  // Render friend item with selection capability
  const renderFriendItem = ({ item }: { item: FriendUser }) => {
    const isSelected = selectedFriends.includes(item.uid);
    
    return (
      <TouchableOpacity 
        style={[
          styles.userItem, 
          isSelected && styles.selectedUserItem
        ]}
        onPress={() => handleFriendPress(item.uid)}
      >
        <Image
          source={
            item.profilePictureURL
              ? { uri: item.profilePictureURL }
              : images.friends
          }
          style={styles.friendIcon}
        />
        <View style={styles.userInfo}>
          <Text style={styles.userName}>{item.name}</Text>
          <Text style={styles.userUsername}>@{item.username}</Text>
        </View>
        {isSelected && (
          <View style={styles.selectedIndicator}>
            <Ionicons name="checkmark-circle" size={24} color="#007AFF" />
          </View>
        )}
      </TouchableOpacity>
    );
  };

  // Render sent request item
  const renderSentRequestItem = ({ item }: { item: FriendUser }) => (
    <TouchableOpacity style={styles.userItem}>
      <Image
        source={
          item.profilePictureURL
            ? { uri: item.profilePictureURL }
            : images.friends
        }
        style={styles.friendIcon}
      />
      <View style={styles.userInfo}>
        <Text style={styles.userName}>{item.name}</Text>
        <Text style={styles.userUsername}>@{item.username}</Text>
      </View>
      <Text style={styles.pendingText}>Pending</Text>
    </TouchableOpacity>
  );


  return (
    <View style={styles.pageContainer}>
      <ScrollView style={styles.container}>
        <Image source={images.friends} style={styles.bannerImage} />

        {/* Search Section */}
        <Text style={styles.header}>Search Friends</Text>
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color="gray" style={styles.icon} />
          <TextInput
            style={styles.input}
            placeholder="Enter username..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            returnKeyType="search"
            onSubmitEditing={handleSearch}
          />
        </View>

        <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
          <Text style={styles.searchButtonText}>Search</Text>
        </TouchableOpacity>

        {loading && <ActivityIndicator size="large" color="#007AFF" />}

        {errorMessage ? (
          <Text style={styles.errorMessage}>{errorMessage}</Text>
        ) : (
          searchResults.length > 0 && (
            <View style={styles.sectionContainer}>
              <Text style={styles.sectionHeader}>Search Results</Text>
              <FlatList
                data={searchResults}
                keyExtractor={(item) => item.uid}
                renderItem={renderSearchResultItem}
                scrollEnabled={false}
              />
            </View>
          )
        )}

        {/* Friend Requests Section */}
        {receivedRequests.length > 0 && (
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionHeader}>Friend Requests</Text>
            <FlatList
              data={receivedRequests}
              keyExtractor={(item) => item.uid}
              renderItem={renderReceivedRequestItem}
              scrollEnabled={false}
            />
          </View>
        )}

        {/* Friends List Section */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionHeader}>Friends - (Press Friend to share album)</Text>
          {friends.length > 0 ? (
            <FlatList
              data={friends}
              keyExtractor={(item) => item.uid}
              renderItem={renderFriendItem}
              scrollEnabled={false}
            />
          ) : (
            <Text style={styles.emptyText}>
              No friends yet. Search for users to add friends!
            </Text>
          )}
        </View>

        {/* Sent Requests Section */}
        {sentRequests.length > 0 && (
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionHeader}>Sent Requests</Text>
            <FlatList
              data={sentRequests}
              keyExtractor={(item) => item.uid}
              renderItem={renderSentRequestItem}
              scrollEnabled={false}
            />
          </View>
        )}
        
        {/* Add extra space at the bottom for floating button */}
        <View style={styles.bottomSpacer} />
      </ScrollView>
      
      {/* Floating button to add selected friends to album */}
      {selectedFriends.length > 0 && (
        <View style={styles.floatingButtonContainer}>
          <TouchableOpacity
            style={styles.floatingButton}
            onPress={navigateToAlbumSelection}
          >
            <Ionicons name="images-outline" size={24} color="white" style={styles.buttonIcon} />
            <Text style={styles.floatingButtonText}>
              Add {selectedFriends.length} {selectedFriends.length === 1 ? 'friend' : 'friends'} to album
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};
export default FriendsPage;

const styles = StyleSheet.create({
  pageContainer: {
    flex: 1,
    backgroundColor: "#fff",
  },
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  bannerImage: {
    width: "100%",
    height: 150,
    resizeMode: "contain",
    marginBottom: 10,
  },
  header: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 15,
    textAlign: "center",
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 10,
    marginHorizontal: 20,
    marginBottom: 10,
  },
  input: {
    flex: 1,
    marginLeft: 10,
  },
  icon: {
    marginRight: 5,
  },
  searchButton: {
    backgroundColor: "#007AFF",
    padding: 10,
    borderRadius: 8,
    marginVertical: 10,
    alignItems: "center",
    marginHorizontal: 20,
  },
  searchButtonText: {
    color: "white",
    fontSize: 18,
  },
  errorMessage: {
    color: "red",
    fontSize: 16,
    textAlign: "center",
    marginTop: 10,
    marginHorizontal: 20,
  },
  userItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  friendIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 10,
  },
  selectedUserItem: {
    backgroundColor: "#E8F4FD",
    borderLeftWidth: 3,
    borderLeftColor: "#007AFF",
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: "bold",
  },
  userUsername: {
    fontSize: 14,
    color: "#666",
  },
  addButton: {
    backgroundColor: "#007AFF",
    padding: 8,
    borderRadius: 5,
  },
  sectionContainer: {
    marginTop: 20,
    marginHorizontal: 20,
  },
  selectedIndicator: {
    marginLeft: 10,
  },
  sectionHeader: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    paddingBottom: 5,
  },
  requestItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#E8E8E8",
  },
  requestActions: {
    flexDirection: "row",
  },
  actionButton: {
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 20,
    marginLeft: 8,
  },
  acceptButton: {
    backgroundColor: "#4CAF50",
  },
  rejectButton: {
    backgroundColor: "#F44336",
  },
  actionButtonText: {
    color: "white",
    fontWeight: "bold",
  },
  pendingText: {
    color: "gray",
  },
  emptyText: {
    color: "lightGray",
  },
  floatingButtonContainer: {
    position: "absolute",
    bottom: 20,
    left: 0,
    right: 0,
    alignItems: "center",
  },
  floatingButton: {
    backgroundColor: "#007AFF",
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 30,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  buttonIcon: {
    marginRight: 8,
  },
  floatingButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  bottomSpacer: {
    height: 80,
  },
});
