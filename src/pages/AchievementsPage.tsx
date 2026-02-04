import React from 'react';
import { Achievements as AchievementsComponent } from '../../components/Achievements';
import { UserProgress } from '../../types';

interface AchievementsPageProps {
  userProgress: UserProgress;
}

export default function AchievementsPage({ userProgress }: AchievementsPageProps) {
  return (
    <AchievementsComponent unlockedBadgeIds={userProgress.badges || []} />
  );
}
