export enum AppView {
  HOME = 'HOME',
  LOGIN = 'LOGIN',
  CATEGORIES = 'CATEGORIES',
  LEVEL_SELECT = 'LEVEL_SELECT',
  PRACTICE = 'PRACTICE',
  LEADERBOARD = 'LEADERBOARD',
  ACHIEVEMENTS = 'ACHIEVEMENTS',
}

export interface Level {
  id: string;
  word: string; // The word to sign (e.g., "Hello")
  thaiWord: string; // Thai translation
  description: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  videoPlaceholderColor: string; // To simulate different videos
}

export interface Category {
  id: string;
  title: string;
  thaiTitle: string;
  description: string;
  icon: string;
  levels: Level[];
}

export interface Badge {
  id: string;
  title: string;
  description: string;
  icon: string;
}

export interface UserProgress {
  unlockedLevelIds: string[];
  stars: Record<string, number>; // levelId -> stars (1-3)
  badges: string[]; // ids of unlocked badges
  totalScore: number;
}

export interface FeedbackData {
  stars: number;
  feedback: string;
  passed: boolean;
}

export interface LeaderboardEntry {
  id: string;
  username: string;
  score: number;
  avatar: string;
  rank?: number;
}