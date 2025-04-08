// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { initializeAuth, getReactNativePersistence } from "firebase/auth";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getDatabase } from "firebase/database";
import { getStorage } from "firebase/storage";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

const config = {
  apiKey: "AIzaSyBYu62_bFWi0Oz9jWxknmjQGclCQmJhF9Q",
  authDomain: "candid-capture-878ec.firebaseapp.com",
  databaseURL: "https://candid-capture-878ec-default-rtdb.firebaseio.com",
  projectId: "candid-capture-878ec",
  storageBucket: "candid-capture-878ec.firebasestorage.app",
  messagingSenderId: "739952523732",
  appId: "1:739952523732:web:18422e6623bd847d327e41",
  measurementId: "G-NJQRNF3HR4",
};

// Initialize Firebase and Auth
const app = initializeApp(config);
const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage),
});
const db = getDatabase(app);
const storage = getStorage(app);

export { app, auth, db, storage };
