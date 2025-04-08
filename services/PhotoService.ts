import { auth, db, storage } from "./_Config";
import { ref as dbRef, set, get, child, push, update } from "firebase/database";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import * as FileSystem from "expo-file-system";

export async function uploadImage(image: string, path: string) {
  try {
    const { uri } = await FileSystem.getInfoAsync(image);
    const blob = await new Promise<Blob>((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.onload = () => {
        resolve(xhr.response as Blob);
      };
      xhr.onerror = (e: any) => {
        reject(new TypeError("Network request failed: " + e.message));
      };
      xhr.responseType = "blob";
      xhr.open("GET", uri, true);
      xhr.send(null);
    });

    const filename = image.substring(image.lastIndexOf("/") + 1);
    const imageRef = ref(storage, `${path}/${filename}`);

    await uploadBytes(imageRef, blob);

    return await getDownloadURL(imageRef);
  } catch (e: any) {
    throw new Error("Error uploading image", e.message);
  }
}

export async function uploadProfilePicture(image: string) {
  const currentUser = auth.currentUser;
  if (!currentUser) {
    throw new Error("User not found");
  }

  try {
    const url = await uploadImage(image, "profilePictures");
    const userRef = dbRef(db, `users/${currentUser.uid}`);
    await update(userRef, { profilePicture: url });
  } catch (e: any) {
    throw new Error("Error uploading profile picture", e.message);
  }
}







export async function uploadPhotosToEvent(eventId: string, images: string[]) {
  try {
    await Promise.all(
      images.map(async (image) => {
        const url = await uploadImage(image, `events/${eventId}`);

        const imageRef = ref(storage, `events/${eventId}/${image.substring(image.lastIndexOf("/") + 1)}`);
        let downloadUrl = await getDownloadURL(imageRef);
      
        const parts = downloadUrl.split('/o/');
        if (parts.length === 2) {
          const [base, rest] = parts;
          const [filePath, query] = rest.split('?');
          const encodedPath = encodeURIComponent(filePath);
          downloadUrl = `${base}/o/${encodedPath}?${query}`;
        }
        
        const timestamp = new Date().getTime();
        const photoRef = dbRef(db, `events/${eventId}/photos/${timestamp}`);
        await set(photoRef, downloadUrl);
      })
    );
  } catch (e: any) {
    console.error("Error in uploadPhotosToEvent:", e);
    throw new Error("Error uploading photos to event");
  }
}
