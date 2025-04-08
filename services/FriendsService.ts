import { auth, db } from "./_Config";
import { ref, set, get, push, onValue, update, remove } from "firebase/database";
import { getUsername } from "./UserService";

// Friend request statuses
export enum FriendStatus {
  PENDING = "pending",
  ACCEPTED = "accepted"
}

// Friend request types
export enum RequestType {
  SENT = "sent",
  RECEIVED = "received"
}

// User type with minimal info needed for friend components
export interface FriendUser {
  uid: string;
  username: string;
  name: string;
  profilePictureURL: string;
}

// Search for users by username prefix
export async function searchUsersByUsername(searchTerm: string): Promise<FriendUser[]> {
  try {
    if (!searchTerm.trim()) {
      return [];
    }

    const usersRef = ref(db, "users");
    const snapshot = await get(usersRef);
    
    if (!snapshot.exists()) {
      return [];
    }

    const currentUser = auth.currentUser;
    if (!currentUser) {
      throw new Error("User not authenticated");
    }

    const users: FriendUser[] = [];
    
    // Filter users based on the search term (case-insensitive prefix match)
    snapshot.forEach((childSnapshot) => {
      const userData = childSnapshot.val();
      const uid = childSnapshot.key;
      
      // Skip the current user
      if (uid === currentUser.uid) {
        return;
      }
      
      const username = userData.username?.toLowerCase() || "";
      
      if (username.startsWith(searchTerm.toLowerCase())) {
        users.push({
          uid: uid || "",
          username: userData.username || "",
          name: userData.name || "",
          profilePictureURL: userData.profilePicture || ""
        });
      }
    });
    
    return users;
  } catch (error: any) {
    console.error("Error searching users:", error);
    throw new Error(`Error searching users: ${error.message}`);
  }
}

// Send a friend request to another user
export async function sendFriendRequest(friendUid: string): Promise<void> {
  try {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      throw new Error("User not authenticated");
    }

    // Check if friend request already exists
    const friendRequestsRef = ref(db, `friendRequests/${currentUser.uid}_${friendUid}`);
    const snapshot = await get(friendRequestsRef);
    
    if (snapshot.exists()) {
      throw new Error("Friend request already exists");
    }

    // Check if they're already friends
    const alreadyFriends = await checkIfFriends(friendUid);
    if (alreadyFriends) {
      throw new Error("Already friends with this user");
    }

    // Create the friend request
    await set(friendRequestsRef, {
      sender: currentUser.uid,
      receiver: friendUid,
      status: FriendStatus.PENDING,
      timestamp: Date.now()
    });

    // Add to sender's sent requests list
    const sentRequestsRef = ref(db, `users/${currentUser.uid}/friendRequests/sent/${friendUid}`);
    await set(sentRequestsRef, true);

    // Add to receiver's received requests list
    const receivedRequestsRef = ref(db, `users/${friendUid}/friendRequests/received/${currentUser.uid}`);
    await set(receivedRequestsRef, true);

  } catch (error: any) {
    console.error("Error sending friend request:", error);
    throw new Error(`Error sending friend request: ${error.message}`);
  }
}

// Accept a friend request
export async function acceptFriendRequest(friendUid: string): Promise<void> {
  try {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      throw new Error("User not authenticated");
    }

    // Update request status
    const friendRequestRef = ref(db, `friendRequests/${friendUid}_${currentUser.uid}`);
    const snapshot = await get(friendRequestRef);
    
    if (!snapshot.exists()) {
      throw new Error("Friend request not found");
    }

    await update(friendRequestRef, {
      status: FriendStatus.ACCEPTED,
      acceptedAt: Date.now()
    });

    // Add to both users' friends lists
    const currentUserFriendsRef = ref(db, `users/${currentUser.uid}/friends/${friendUid}`);
    await set(currentUserFriendsRef, true);

    const friendUserFriendsRef = ref(db, `users/${friendUid}/friends/${currentUser.uid}`);
    await set(friendUserFriendsRef, true);

    // Remove from received requests
    const receivedRequestRef = ref(db, `users/${currentUser.uid}/friendRequests/received/${friendUid}`);
    await remove(receivedRequestRef);

    // Remove from sent requests
    const sentRequestRef = ref(db, `users/${friendUid}/friendRequests/sent/${currentUser.uid}`);
    await remove(sentRequestRef);

  } catch (error: any) {
    console.error("Error accepting friend request:", error);
    throw new Error(`Error accepting friend request: ${error.message}`);
  }
}

// Reject a friend request
export async function rejectFriendRequest(friendUid: string): Promise<void> {
  try {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      throw new Error("User not authenticated");
    }

    // Delete the friend request
    const friendRequestRef = ref(db, `friendRequests/${friendUid}_${currentUser.uid}`);
    await remove(friendRequestRef);

    // Remove from received requests
    const receivedRequestRef = ref(db, `users/${currentUser.uid}/friendRequests/received/${friendUid}`);
    await remove(receivedRequestRef);

    // Remove from sent requests
    const sentRequestRef = ref(db, `users/${friendUid}/friendRequests/sent/${currentUser.uid}`);
    await remove(sentRequestRef);

  } catch (error: any) {
    console.error("Error rejecting friend request:", error);
    throw new Error(`Error rejecting friend request: ${error.message}`);
  }
}

// Cancel a sent friend request
export async function cancelFriendRequest(friendUid: string): Promise<void> {
  try {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      throw new Error("User not authenticated");
    }

    // Delete the friend request
    const friendRequestRef = ref(db, `friendRequests/${currentUser.uid}_${friendUid}`);
    await remove(friendRequestRef);

    // Remove from sent requests
    const sentRequestRef = ref(db, `users/${currentUser.uid}/friendRequests/sent/${friendUid}`);
    await remove(sentRequestRef);

    // Remove from received requests
    const receivedRequestRef = ref(db, `users/${friendUid}/friendRequests/received/${currentUser.uid}`);
    await remove(receivedRequestRef);

  } catch (error: any) {
    console.error("Error canceling friend request:", error);
    throw new Error(`Error canceling friend request: ${error.message}`);
  }
}

// Remove a friend
export async function removeFriend(friendUid: string): Promise<void> {
  try {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      throw new Error("User not authenticated");
    }

    // Remove from current user's friends list
    const currentUserFriendsRef = ref(db, `users/${currentUser.uid}/friends/${friendUid}`);
    await remove(currentUserFriendsRef);

    // Remove from friend's friends list
    const friendUserFriendsRef = ref(db, `users/${friendUid}/friends/${currentUser.uid}`);
    await remove(friendUserFriendsRef);

  } catch (error: any) {
    console.error("Error removing friend:", error);
    throw new Error(`Error removing friend: ${error.message}`);
  }
}

// Get a user's friends with detailed info
export async function getFriendsList(): Promise<FriendUser[]> {
  try {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      throw new Error("User not authenticated");
    }

    const friendsRef = ref(db, `users/${currentUser.uid}/friends`);
    const snapshot = await get(friendsRef);
    
    if (!snapshot.exists()) {
      return [];
    }

    const friends: FriendUser[] = [];
    const friendPromises: Promise<void>[] = [];

    snapshot.forEach((childSnapshot) => {
      const friendUid = childSnapshot.key;
      if (!friendUid) return;

      const promise = get(ref(db, `users/${friendUid}`))
        .then((userSnapshot) => {
          if (userSnapshot.exists()) {
            const userData = userSnapshot.val();
            friends.push({
              uid: friendUid,
              username: userData.username || "",
              name: userData.name || "",
              profilePictureURL: userData.profilePicture || ""
            });
          }
        });

      friendPromises.push(promise);
    });

    await Promise.all(friendPromises);
    return friends;
  } catch (error: any) {
    console.error("Error getting friends list:", error);
    throw new Error(`Error getting friends list: ${error.message}`);
  }
}

// Get pending friend requests
export async function getPendingRequests(type: RequestType): Promise<FriendUser[]> {
  try {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      throw new Error("User not authenticated");
    }

    const path = type === RequestType.SENT ? 'sent' : 'received';
    const requestsRef = ref(db, `users/${currentUser.uid}/friendRequests/${path}`);
    const snapshot = await get(requestsRef);
    
    if (!snapshot.exists()) {
      return [];
    }

    const requests: FriendUser[] = [];
    const requestPromises: Promise<void>[] = [];

    snapshot.forEach((childSnapshot) => {
      const userUid = childSnapshot.key;
      if (!userUid) return;

      const promise = get(ref(db, `users/${userUid}`))
        .then((userSnapshot) => {
          if (userSnapshot.exists()) {
            const userData = userSnapshot.val();
            requests.push({
              uid: userUid,
              username: userData.username || "",
              name: userData.name || "",
              profilePictureURL: userData.profilePicture || ""
            });
          }
        });

      requestPromises.push(promise);
    });

    await Promise.all(requestPromises);
    return requests;
  } catch (error: any) {
    console.error(`Error getting ${type} requests:`, error);
    throw new Error(`Error getting ${type} requests: ${error.message}`);
  }
}

// Check if a user is already friends with another user
export async function checkIfFriends(friendUid: string): Promise<boolean> {
  try {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      throw new Error("User not authenticated");
    }

    const friendRef = ref(db, `users/${currentUser.uid}/friends/${friendUid}`);
    const snapshot = await get(friendRef);
    
    return snapshot.exists();
  } catch (error: any) {
    console.error("Error checking if friends:", error);
    throw new Error(`Error checking if friends: ${error.message}`);
  }
}

// Check if a request exists between two users and get its status
export async function checkFriendRequestStatus(friendUid: string): Promise<{exists: boolean, type?: RequestType, status?: FriendStatus}> {
  try {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      throw new Error("User not authenticated");
    }

    // Check if the current user sent a request
    const sentRequestRef = ref(db, `users/${currentUser.uid}/friendRequests/sent/${friendUid}`);
    const sentSnapshot = await get(sentRequestRef);
    
    if (sentSnapshot.exists()) {
      return {
        exists: true,
        type: RequestType.SENT,
        status: FriendStatus.PENDING // For sent requests, always pending from our perspective
      };
    }

    // Check if the current user received a request
    const receivedRequestRef = ref(db, `users/${currentUser.uid}/friendRequests/received/${friendUid}`);
    const receivedSnapshot = await get(receivedRequestRef);
    
    if (receivedSnapshot.exists()) {
      return {
        exists: true,
        type: RequestType.RECEIVED,
        status: FriendStatus.PENDING
      };
    }

    return { exists: false };
  } catch (error: any) {
    console.error("Error checking friend request status:", error);
    throw new Error(`Error checking friend request status: ${error.message}`);
  }
}

// Listen for changes in the user's friends list
export function listenForFriendsChanges(callback: (friends: FriendUser[]) => void): () => void {
  const currentUser = auth.currentUser;
  if (!currentUser) {
    console.error("User not authenticated");
    return () => {};
  }

  const friendsRef = ref(db, `users/${currentUser.uid}/friends`);
  
  const unsubscribe = onValue(friendsRef, async (snapshot) => {
    try {
      if (!snapshot.exists()) {
        callback([]);
        return;
      }

      const friends: FriendUser[] = [];
      const friendPromises: Promise<void>[] = [];

      snapshot.forEach((childSnapshot) => {
        const friendUid = childSnapshot.key;
        if (!friendUid) return;

        const promise = get(ref(db, `users/${friendUid}`))
          .then((userSnapshot) => {
            if (userSnapshot.exists()) {
              const userData = userSnapshot.val();
              friends.push({
                uid: friendUid,
                username: userData.username || "",
                name: userData.name || "",
                profilePictureURL: userData.profilePicture || ""
              });
            }
          });

        friendPromises.push(promise);
      });

      await Promise.all(friendPromises);
      callback(friends);
    } catch (error) {
      console.error("Error in friends listener:", error);
    }
  });

  return unsubscribe;
}

// Listen for changes in received friend requests
export function listenForReceivedRequests(callback: (requests: FriendUser[]) => void): () => void {
  const currentUser = auth.currentUser;
  if (!currentUser) {
    console.error("User not authenticated");
    return () => {};
  }

  const requestsRef = ref(db, `users/${currentUser.uid}/friendRequests/received`);
  
  const unsubscribe = onValue(requestsRef, async (snapshot) => {
    try {
      if (!snapshot.exists()) {
        callback([]);
        return;
      }

      const requests: FriendUser[] = [];
      const requestPromises: Promise<void>[] = [];

      snapshot.forEach((childSnapshot) => {
        const userUid = childSnapshot.key;
        if (!userUid) return;

        const promise = get(ref(db, `users/${userUid}`))
          .then((userSnapshot) => {
            if (userSnapshot.exists()) {
              const userData = userSnapshot.val();
              requests.push({
                uid: userUid,
                username: userData.username || "",
                name: userData.name || "",
                profilePictureURL: userData.profilePicture || ""
              });
            }
          });

        requestPromises.push(promise);
      });

      await Promise.all(requestPromises);
      callback(requests);
    } catch (error) {
      console.error("Error in received requests listener:", error);
    }
  });

  return unsubscribe;
}