import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { CATEGORIES } from '../../constants';
import { PracticeArena } from '../../components/PracticeArena';
import { dbHelpers, type User } from '../../services/firebase';
import { UserProgress } from '../../types';

interface PracticeProps {
  user: User | null;
  userProgress: UserProgress;
  setUserProgress: (progress: UserProgress) => void;
}

export default function Practice({ user, userProgress, setUserProgress }: PracticeProps) {
  const navigate = useNavigate();
  const { categoryId, levelId } = useParams<{ categoryId: string; levelId: string }>();

  const category = CATEGORIES.find(cat => cat.id === categoryId);
  const level = category?.levels.find(lvl => lvl.id === levelId);

  if (!category || !level) {
    return (
      <div className="flex items-center justify-center flex-1">
        <div className="text-white text-2xl font-bold">Level not found</div>
      </div>
    );
  }

  const handleLevelComplete = async (stars: number) => {
    const currentLevelIndex = category.levels.findIndex(l => l.id === level.id);
    const nextLevel = category.levels[currentLevelIndex + 1];
    
    const prev = userProgress;
    const newUnlocked = [...prev.unlockedLevelIds];
    if (stars >= 2 && nextLevel && !newUnlocked.includes(nextLevel.id)) {
      newUnlocked.push(nextLevel.id);
    }
    
    // Update stars
    const newStars = {
      ...prev.stars,
      [level.id]: Math.max(prev.stars[level.id] || 0, stars)
    };

    // Calculate Total Score (Stars * 100)
    const newTotalScore = Object.values(newStars).reduce((acc: number, s: number) => acc + (s * 100), 0);

    // Check for new Badges
    const newBadges = [...(prev.badges || [])];
    
    // 1. First Win
    if (stars >= 2 && !newBadges.includes('badge_first_win')) {
       newBadges.push('badge_first_win');
    }
    // 2. Perfectionist
    if (stars === 3 && !newBadges.includes('badge_3_stars')) {
       newBadges.push('badge_3_stars');
    }
    // 3. Collector (3 unique levels completed)
    const passedCount = Object.values(newStars).filter((s: number) => s >= 2).length;
    if (passedCount >= 3 && !newBadges.includes('badge_collector')) {
       newBadges.push('badge_collector');
    }
    // 4. Master (10 stars total)
    const totalStars: number = (Object.values(newStars) as number[]).reduce((a, b) => a + b, 0);
    if (totalStars >= 10 && !newBadges.includes('badge_master')) {
       newBadges.push('badge_master');
    }

    const newProgress = {
      unlockedLevelIds: newUnlocked,
      stars: newStars,
      badges: newBadges,
      totalScore: newTotalScore
    };

    // Save to Firebase
    if (user) {
      await dbHelpers.writeData(`users/${user.uid}/progress`, newProgress);
    }
    
    setUserProgress(newProgress);
    navigate(`/category/${categoryId}`);
  };

  const handleBack = () => {
    navigate(`/category/${categoryId}`);
  };

  return (
    <PracticeArena 
      level={level} 
      onBack={handleBack}
      onComplete={handleLevelComplete}
    />
  );
}
