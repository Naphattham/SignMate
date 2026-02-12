// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getDatabase, ref, set, get, update, remove, onValue } from "firebase/database";
import { 
  getAuth, 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  onAuthStateChanged,
  User
} from "firebase/auth";

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

// Initialize Google Auth Provider
const googleProvider = new GoogleAuthProvider();

// Export Firebase services and utilities
export { 
  app, 
  analytics, 
  database, 
  auth,
  googleProvider,
  ref,
  set,
  get,
  update,
  remove,
  onValue,
  onAuthStateChanged,
  type User
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

// Authentication helper functions
export const authHelpers = {
  // Sign up with email and password
  signUpWithEmail: async (email: string, password: string) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      return { success: true, user: userCredential.user };
    } catch (error: any) {
      console.error("Error signing up:", error);
      return { success: false, error: error.message };
    }
  },

  // Sign in with email and password
  signInWithEmail: async (email: string, password: string) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      return { success: true, user: userCredential.user };
    } catch (error: any) {
      console.error("Error signing in:", error);
      return { success: false, error: error.message };
    }
  },

  // Sign in with Google
  signInWithGoogle: async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      return { success: true, user: result.user };
    } catch (error: any) {
      console.error("Error signing in with Google:", error);
      return { success: false, error: error.message };
    }
  },

  // Sign out
  signOutUser: async () => {
    try {
      await signOut(auth);
      return { success: true };
    } catch (error: any) {
      console.error("Error signing out:", error);
      return { success: false, error: error.message };
    }
  },

  // Get current user
  getCurrentUser: () => {
    return auth.currentUser;
  }
};
// User Profile helper functions
export const profileHelpers = {
  // Get user profile
  getUserProfile: async (userId: string) => {
    return await dbHelpers.readData(`users/${userId}/profile`);
  },

  // Create or update user profile
  saveUserProfile: async (userId: string, profileData: any) => {
    const profile = {
      ...profileData,
      lastUpdated: new Date().toLocaleString()
    };
    return await dbHelpers.writeData(`users/${userId}/profile`, profile);
  },

  // Update user stats (score, stars, rank)
  updateUserStats: async (userId: string, stats: { totalScore?: number; totalStars?: number; rank?: number }) => {
    const updates = {
      ...stats,
      lastUpdated: new Date().toLocaleString()
    };
    return await dbHelpers.updateData(`users/${userId}/profile`, updates);
  },

  // Increment user score
  incrementScore: async (userId: string, points: number) => {
    const result = await dbHelpers.readData(`users/${userId}/profile`);
    if (result.success && result.data) {
      const currentScore = result.data.totalScore || 0;
      return await dbHelpers.updateData(`users/${userId}/profile`, {
        totalScore: currentScore + points,
        lastUpdated: new Date().toLocaleString()
      });
    }
    return { success: false, error: "Profile not found" };
  },

  // Increment user stars
  incrementStars: async (userId: string, stars: number) => {
    const result = await dbHelpers.readData(`users/${userId}/profile`);
    if (result.success && result.data) {
      const currentStars = result.data.totalStars || 0;
      return await dbHelpers.updateData(`users/${userId}/profile`, {
        totalStars: currentStars + stars,
        lastUpdated: new Date().toLocaleString()
      });
    }
    return { success: false, error: "Profile not found" };
  },

  // Update avatar
  updateAvatar: async (userId: string, avatar: string) => {
    return await dbHelpers.updateData(`users/${userId}/profile`, {
      avatar,
      lastUpdated: new Date().toLocaleString()
    });
  },

  // Update username
  updateUsername: async (userId: string, username: string) => {
    return await dbHelpers.updateData(`users/${userId}/profile`, {
      username,
      lastUpdated: new Date().toLocaleString()
    });
  }
};