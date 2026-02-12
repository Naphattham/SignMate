import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { UserProgress } from './types';
import { CATEGORIES } from './constants';
import LoadingScreen from './components/LoadingScreen';
import { authHelpers, dbHelpers, onAuthStateChanged, auth, type User } from './services/firebase';
import Home from './src/pages/Home';
import Login from './src/pages/Login';
import Categories from './src/pages/Categories';
import LevelSelect from './src/pages/LevelSelect';
import Practice from './src/pages/Practice';
import LeaderboardPage from './src/pages/LeaderboardPage';
import Profile from './src/pages/Profile';

export default function App() {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get all level IDs from CATEGORIES
  const allLevelIds = CATEGORIES.flatMap(cat => cat.levels.map(level => level.id));
  
  // Auth State
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isPageLoading, setIsPageLoading] = useState(false);

  // App Data State
  const [userProgress, setUserProgress] = useState<UserProgress>({
    unlockedLevelIds: allLevelIds,
    stars: {},
    badges: [],
    totalScore: 0
  });
  
  // --- Firebase Auth State Listener ---
  useEffect(() => {
    // Set minimum loading time to 3 seconds to show animation
    const minLoadingTime = 3000;
    const startTime = Date.now();
    
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      
      if (firebaseUser) {
        // Load user progress from Firebase
        const result = await dbHelpers.readData(`users/${firebaseUser.uid}/progress`);
        if (result.success && result.data) {
          setUserProgress(result.data);
        } else {
          // Initialize new user progress
          const initialProgress: UserProgress = {
            unlockedLevelIds: allLevelIds,
            stars: {},
            badges: [],
            totalScore: 0
          };
          await dbHelpers.writeData(`users/${firebaseUser.uid}/progress`, initialProgress);
          setUserProgress(initialProgress);
        }
      } else {
        // Reset to initial progress when logged out
        setUserProgress({
          unlockedLevelIds: allLevelIds,
          stars: {},
          badges: [],
          totalScore: 0
        });
      }
      
      // Ensure loading screen shows for at least 3 seconds
      const elapsedTime = Date.now() - startTime;
      const remainingTime = Math.max(0, minLoadingTime - elapsedTime);
      
      setTimeout(() => {
        setLoading(false);
      }, remainingTime);
    });

    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    setIsPageLoading(true);
    await authHelpers.signOutUser();
    // Show loading animation for 3 seconds
    setTimeout(() => {
      setIsPageLoading(false);
      navigate('/');
    }, 3000);
  };

  const handleUpdateUsername = async (newUsername: string) => {
    if (user) {
      await dbHelpers.writeData(`users/${user.uid}/username`, newUsername);
    }
  };

  return (
    <>
      {isPageLoading && <LoadingScreen />}
      
      <div className="h-full w-full flex flex-col bg-purple-600 relative overflow-hidden">
        {/* Background Patterns */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0 opacity-20">
          <div className="absolute top-10 left-10 w-64 h-64 bg-purple-400 rounded-full mix-blend-multiply filter blur-3xl animate-blob"></div>
          <div className="absolute top-10 right-10 w-64 h-64 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-2000"></div>
          <div className="absolute -bottom-32 left-20 w-80 h-80 bg-pink-400 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-4000"></div>
        </div>

      <main className="flex-1 overflow-auto flex flex-col relative z-10">
        {loading ? (
          <LoadingScreen />
        ) : (
          <Routes>
            {/* Home routes */}
            <Route path="/" element={<Home user={user} setIsPageLoading={setIsPageLoading} />} />
            <Route path="/home" element={<Home user={user} setIsPageLoading={setIsPageLoading} />} />
            
            {/* Login route */}
            <Route path="/login" element={<Login user={user} />} />
            
            {/* Categories Dashboard */}
            <Route path="/categories" element={<Categories userProgress={userProgress} user={user} onLogout={handleLogout} />} />
            
            {/* Level Select for a category */}
            <Route path="/category/:categoryId" element={<LevelSelect userProgress={userProgress} user={user} onLogout={handleLogout} />} />
            
            {/* Practice Arena */}
            <Route 
              path="/practice/:categoryId/:levelId" 
              element={<Practice user={user} userProgress={userProgress} setUserProgress={setUserProgress} />} 
            />
            
            {/* Leaderboard */}
            <Route path="/leaderboard" element={<LeaderboardPage user={user} userProgress={userProgress} />} />
            
            {/* Profile */}
            <Route 
              path="/profile" 
              element={<Profile username={user?.email?.split('@')[0] || 'User'} onUpdateUsername={handleUpdateUsername} onLogout={handleLogout} />} 
            />
          </Routes>
        )}
      </main>
      </div>
    </>
  );
}