// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { 
  getFirestore, 
  doc, 
  collection, 
  setDoc, 
  getDoc, 
  getDocs,
  updateDoc, 
  deleteDoc, 
  onSnapshot,
  query,
  where,
  orderBy,
  limit,
  Timestamp
} from "firebase/firestore";
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
import { 
  getStorage, 
  ref, 
  uploadBytes, 
  getDownloadURL,
  deleteObject
} from "firebase/storage";

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
const db = getFirestore(app);
const auth = getAuth(app);
const storage = getStorage(app);

// Initialize Google Auth Provider
const googleProvider = new GoogleAuthProvider();

// Export Firebase services and utilities
export { 
  app, 
  analytics, 
  db, 
  auth,
  storage,
  googleProvider,
  doc,
  collection,
  setDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  where,
  orderBy,
  limit,
  Timestamp,
  onAuthStateChanged,
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
  type User
};

// Helper functions for database operations
export const dbHelpers = {
  // Write data to a specific document
  writeData: async (collectionPath: string, docId: string, data: any, merge: boolean = false) => {
    try {
      await setDoc(doc(db, collectionPath, docId), data, { merge });
      return { success: true };
    } catch (error) {
      console.error("Error writing data:", error);
      return { success: false, error };
    }
  },

  // Read data from a specific document
  readData: async (collectionPath: string, docId: string) => {
    try {
      const docSnap = await getDoc(doc(db, collectionPath, docId));
      if (docSnap.exists()) {
        return { success: true, data: docSnap.data() };
      } else {
        return { success: false, message: "No data available" };
      }
    } catch (error) {
      console.error("Error reading data:", error);
      return { success: false, error };
    }
  },

  // Update specific fields in a document
  updateData: async (collectionPath: string, docId: string, updates: any) => {
    try {
      await updateDoc(doc(db, collectionPath, docId), updates);
      return { success: true };
    } catch (error) {
      console.error("Error updating data:", error);
      return { success: false, error };
    }
  },

  // Delete a document
  deleteData: async (collectionPath: string, docId: string) => {
    try {
      await deleteDoc(doc(db, collectionPath, docId));
      return { success: true };
    } catch (error) {
      console.error("Error deleting data:", error);
      return { success: false, error };
    }
  },

  // Listen to real-time updates on a document
  listenToData: (collectionPath: string, docId: string, callback: (data: any) => void) => {
    const docRef = doc(db, collectionPath, docId);
    return onSnapshot(docRef, (docSnap) => {
      callback(docSnap.exists() ? docSnap.data() : null);
    });
  },

  // Get all documents from a collection
  getCollection: async (collectionPath: string) => {
    try {
      const querySnapshot = await getDocs(collection(db, collectionPath));
      const data: any[] = [];
      querySnapshot.forEach((doc) => {
        data.push({ id: doc.id, ...doc.data() });
      });
      return { success: true, data };
    } catch (error) {
      console.error("Error getting collection:", error);
      return { success: false, error };
    }
  },

  // Upload image to Firebase Storage and return download URL
  uploadImage: async (file: File, path: string) => {
    try {
      // Compress image if it's too large
      const compressedFile = await compressImage(file, 800, 0.8);
      
      const storageRef = ref(storage, path);
      const snapshot = await uploadBytes(storageRef, compressedFile);
      const downloadURL = await getDownloadURL(snapshot.ref);
      
      return { success: true, url: downloadURL };
    } catch (error) {
      console.error("Error uploading image:", error);
      return { success: false, error };
    }
  },

  // Delete image from Firebase Storage
  deleteImage: async (path: string) => {
    try {
      const storageRef = ref(storage, path);
      await deleteObject(storageRef);
      return { success: true };
    } catch (error) {
      console.error("Error deleting image:", error);
      return { success: false, error };
    }
  }
};

// Helper function to compress images before upload
const compressImage = (file: File, maxWidth: number, quality: number): Promise<File> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        // Calculate new dimensions
        if (width > height) {
          if (width > maxWidth) {
            height *= maxWidth / width;
            width = maxWidth;
          }
        } else {
          if (height > maxWidth) {
            width *= maxWidth / height;
            height = maxWidth;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            if (blob) {
              const compressedFile = new File([blob], file.name, {
                type: 'image/jpeg',
                lastModified: Date.now(),
              });
              resolve(compressedFile);
            } else {
              reject(new Error('Canvas to Blob conversion failed'));
            }
          },
          'image/jpeg',
          quality
        );
      };
      img.onerror = reject;
    };
    reader.onerror = reject;
  });
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
    return await dbHelpers.readData('users', userId);
  },

  // Create or update user profile
  saveUserProfile: async (userId: string, profileData: any) => {
    const profile = {
      ...profileData,
      lastUpdated: Timestamp.now()
    };
    return await dbHelpers.writeData('users', userId, profile, true);
  },

  // Update user stats (score, stars, rank)
  updateUserStats: async (userId: string, stats: { totalScore?: number; totalStars?: number; rank?: number }) => {
    const updates = {
      ...stats,
      lastUpdated: Timestamp.now()
    };
    return await dbHelpers.updateData('users', userId, updates);
  },

  // Increment user score
  incrementScore: async (userId: string, points: number) => {
    const result = await dbHelpers.readData('users', userId);
    if (result.success && result.data) {
      const currentScore = result.data.totalScore || 0;
      return await dbHelpers.updateData('users', userId, {
        totalScore: currentScore + points,
        lastUpdated: Timestamp.now()
      });
    }
    return { success: false, error: "Profile not found" };
  },

  // Increment user stars
  incrementStars: async (userId: string, stars: number) => {
    const result = await dbHelpers.readData('users', userId);
    if (result.success && result.data) {
      const currentStars = result.data.totalStars || 0;
      return await dbHelpers.updateData('users', userId, {
        totalStars: currentStars + stars,
        lastUpdated: Timestamp.now()
      });
    }
    return { success: false, error: "Profile not found" };
  },

  // Update avatar
  updateAvatar: async (userId: string, avatar: string) => {
    return await dbHelpers.updateData('users', userId, {
      avatar,
      lastUpdated: Timestamp.now()
    });
  },

  // Update username
  updateUsername: async (userId: string, username: string) => {
    return await dbHelpers.updateData('users', userId, {
      username,
      lastUpdated: Timestamp.now()
    });
  },

  // Get all users for leaderboard (sorted by totalScore)
  getAllUsersForLeaderboard: async () => {
    try {
      console.log('🔍 getAllUsersForLeaderboard: Starting query...');
      const usersCollection = collection(db, 'users');
      const q = query(usersCollection, orderBy('totalScore', 'desc'));
      const querySnapshot = await getDocs(q);
      
      console.log('📊 Query completed. Document count:', querySnapshot.size);
      
      const users: any[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        console.log('👤 User doc:', doc.id, data);
        users.push({
          id: doc.id,
          username: data.username || data.email?.split('@')[0] || 'User',
          score: data.totalScore || 0, // map totalScore to score for display
          totalScore: data.totalScore || 0, // keep original for clarity
          avatar: data.avatar || '',
          photoURL: data.photoURL || undefined, // เก็บ Google photoURL ด้วย
          totalStars: data.totalStars || 0
        });
      });
      
      console.log('✅ Processed users:', users);
      return { success: true, data: users };
    } catch (error) {
      console.error("❌ Error getting users for leaderboard:", error);
      return { success: false, error };
    }
  }
};