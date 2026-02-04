import React from 'react';
import { Leaderboard as LeaderboardComponent } from '../../components/Leaderboard';
import { type User } from '../../services/firebase';
import { UserProgress } from '../../types';

interface LeaderboardPageProps {
  user: User | null;
  userProgress: UserProgress;
}

export default function LeaderboardPage({ user, userProgress }: LeaderboardPageProps) {
  return (
    <LeaderboardComponent 
      currentUser={{
        id: user?.uid || '', 
        username: user?.email?.split('@')[0] || 'User', 
        score: userProgress.totalScore, 
        avatar: '😎' 
      }} 
    />
  );
}
