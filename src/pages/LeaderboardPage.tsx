import React, { useState, useEffect } from 'react';
import { Leaderboard as LeaderboardComponent } from '../../components/Leaderboard';
import { type User, dbHelpers } from '../../services/firebase';
import { UserProgress } from '../../types';

interface LeaderboardPageProps {
  user: User | null;
  userProgress: UserProgress;
  onLogout?: () => void;
}

export default function LeaderboardPage({ user, userProgress, onLogout }: LeaderboardPageProps) {
  const [avatarUrl, setAvatarUrl] = useState<string>('');
  const [photoURL, setPhotoURL] = useState<string>(''); // เพิ่ม photoURL state
  const [username, setUsername] = useState<string>(''); // เพิ่ม username state

  // ดึง avatar URL จาก Firebase
  useEffect(() => {
    const loadUserAvatar = async () => {
      if (!user?.uid) return;
      
      try {
        const result = await dbHelpers.readData('users', user.uid);
        if (result.success && result.data) {
          setAvatarUrl(result.data.avatar || '');
          setPhotoURL(result.data.photoURL || ''); // ดึง photoURL จาก Firestore
          setUsername(result.data.username || user?.displayName || user?.email?.split('@')[0] || 'User'); // ดึง username จาก Firestore
        }
      } catch (error) {
        console.error('Error loading user avatar:', error);
      }
    };

    loadUserAvatar();

    // Listen for profile updates
    const handleProfileUpdate = (event: any) => {
      if (event.detail?.userId === user?.uid) {
        loadUserAvatar();
      }
    };

    window.addEventListener('profileUpdated', handleProfileUpdate);
    
    return () => {
      window.removeEventListener('profileUpdated', handleProfileUpdate);
    };
  }, [user?.uid]);

  return (
    <LeaderboardComponent 
      currentUser={{
        id: user?.uid || '', 
        username: username || user?.displayName || user?.email?.split('@')[0] || 'User', // ใช้ username จาก Firestore
        score: userProgress.totalScore, 
        avatar: avatarUrl || '',
        photoURL: photoURL || user?.photoURL || undefined // ใช้ photoURL จาก Firestore ก่อน
      }}
      user={user}
      onLogout={onLogout}
      userProgress={userProgress}
    />
  );
}
