import { auth, db } from "./_Config";
import { ref, set, get, child, push, update } from "firebase/database";

import { User } from "./_Model";

export async function getUserProfile(): Promise<User | undefined> {
  try {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      throw new Error("User not found");
    }

    const dbRef = ref(db);
    const snapshot = await get(child(dbRef, `users/${currentUser.uid}`));
    if (snapshot.exists()) {
      return snapshot.val() as User;
    }

    return undefined;
  } catch (error: any) {
    throw new Error(error);
  }
}

export async function getUsername(): Promise<string> {
  try {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      throw new Error("User not found");
    }

    const usernameRef = ref(db, `users/${currentUser.uid}/username`);
    const snapshot = await get(usernameRef);
    if (snapshot.exists()) {
      return snapshot.val();
    }

    return "";
  } catch (error: any) {
    throw new Error(error);
  }
}

export async function updateBio(newBio: string) {
  try {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      throw new Error("User not found");
    }

    const userRef = ref(db, `users/${currentUser.uid}`);
    await update(userRef, { bio: newBio });
  } catch (error) {
    throw new Error("Bio Update Failed");
  }
}

export async function getFriends(): Promise<
  Array<Record<string, string>> | undefined
> {
  try {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      throw new Error("User not found");
    }

    const friendsRef = ref(db, `users/${currentUser.uid}/friends`);
    const snapshot = await get(friendsRef);
    if (!snapshot.exists()) {
      return undefined;
    }

    const friendsArray: Array<Record<string, string>> = [];
    snapshot.forEach((friend) => {
      const friendUid = friend.key;
      const friendUsername = friend.val();

      if (friendUid && friendUsername) {
        friendsArray.push({ [friendUid]: friendUsername });
      }
    });

    return friendsArray;
  } catch (e: any) {
    throw new Error("Error retrieving friends");
  }
}

export async function updateUserProfile(updatedData: {
  name?: string;
  username?: string;
  bio?: string;
  city?: string;
  state?: string;
}) {
  try {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      throw new Error("User not found");
    }
    const userRef = ref(db, `users/${currentUser.uid}`);
    await update(userRef, updatedData);
  } catch (error) {
    throw new Error("Profile update failed");
  }
}

export async function updateUserEmail(updatedData: { email?: string }) {
  try {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      throw new Error("User not found");
    }
    const userRef = ref(db, `users/${currentUser.uid}`);
    await update(userRef, updatedData);
  } catch (error) {
    throw new Error("Profile update failed");
  }
}
