// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getDatabase, ref, set, get, update, remove, onValue } from "firebase/database";
import { getAuth } from "firebase/auth";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAMwl8Lm9dTrt8rHluQLLgrMnicrrjhYks",
  authDomain: "signmate-cbe60.firebaseapp.com",
  databaseURL: "https://signmate-cbe60-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "signmate-cbe60",
  storageBucket: "signmate-cbe60.firebasestorage.app",
  messagingSenderId: "905415148267",
  appId: "1:905415148267:web:225243b5d9937bba5934ae",
  measurementId: "G-XWM7ZWP8WL"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
const analytics = getAnalytics(app);
const database = getDatabase(app);
const auth = getAuth(app);

// Export Firebase services and utilities
export { 
  app, 
  analytics, 
  database, 
  auth,
  ref,
  set,
  get,
  update,
  remove,
  onValue
};

// Helper functions for database operations
export const dbHelpers = {
  // Write data to a specific path
  writeData: async (path: string, data: any) => {
    try {
      await set(ref(database, path), data);
      return { success: true };
    } catch (error) {
      console.error("Error writing data:", error);
      return { success: false, error };
    }
  },

  // Read data from a specific path
  readData: async (path: string) => {
    try {
      const snapshot = await get(ref(database, path));
      if (snapshot.exists()) {
        return { success: true, data: snapshot.val() };
      } else {
        return { success: false, message: "No data available" };
      }
    } catch (error) {
      console.error("Error reading data:", error);
      return { success: false, error };
    }
  },

  // Update specific fields at a path
  updateData: async (path: string, updates: any) => {
    try {
      await update(ref(database, path), updates);
      return { success: true };
    } catch (error) {
      console.error("Error updating data:", error);
      return { success: false, error };
    }
  },

  // Delete data at a specific path
  deleteData: async (path: string) => {
    try {
      await remove(ref(database, path));
      return { success: true };
    } catch (error) {
      console.error("Error deleting data:", error);
      return { success: false, error };
    }
  },

  // Listen to real-time updates at a path
  listenToData: (path: string, callback: (data: any) => void) => {
    const dataRef = ref(database, path);
    return onValue(dataRef, (snapshot) => {
      callback(snapshot.val());
    });
  }
};
