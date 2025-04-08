import { auth, db, storage } from "./_Config";
import { ref as dbRef, set, get, child, push, update } from "firebase/database";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { uploadImage } from "./PhotoService";
import * as FileSystem from "expo-file-system";

export async function createAlbum(albumName: string, eventId: string) {
    try {
      const albumId = new Date().getTime().toString();
      const albumRef = dbRef(db, `albums/${albumId}`);
      const newAlbum = {
        albumName,
        createdAt: new Date().toISOString(),
        owner: eventId,
        numberOfPhotos: 0,
      };
      await set(albumRef, newAlbum);
      return albumId;
    } catch (error: any) {
      throw new Error("Error creating album", error.message);
    }
  }

/*export async function uploadImage(image: string, path: string) {
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
}*/

export async function uploadPhotosToAlbum(albumId: string, photos: string[]) {
  try {
    const albumRef = dbRef(db, `albums/${albumId}`);
    const albumSnapshot = await get(albumRef);
    if (!albumSnapshot.exists()) {
      throw new Error("Album does not exist");
    }
    const albumData = albumSnapshot.val();
    const existingPhotos = albumData.photos ? Object.values(albumData.photos) : [];
    
    const downloadUrls = await Promise.all(
      photos.map(async (photoUri) => {
        if (photoUri.startsWith("http://") || photoUri.startsWith("https://")) {
          const parts = photoUri.split('/o/');
          if (parts.length === 2) {
            const [base, rest] = parts;
            const [filePath, query] = rest.split('?');
            const decodedPath = decodeURIComponent(filePath);
            const encodedPath =
              decodedPath === filePath ? encodeURIComponent(filePath) : filePath;
            return `${base}/o/${encodedPath}?${query}`;
          }
          return photoUri;
        }
        return await uploadImage(photoUri, `albumPhotos/${albumId}`);
      })
    );
    
    const updatedPhotos = [...existingPhotos, ...downloadUrls];
    await update(albumRef, { photos: updatedPhotos });
    console.log("Photos uploaded successfully");
  } catch (error) {
    console.error("Error in uploadPhotosToAlbum:", error);
    throw new Error("Error uploading photos to album");
  }
}