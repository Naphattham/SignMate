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
  words: string[]; // Array of words/signs (e.g., ["กิน", "ข้าว", "แล้ว", "ยัง?"])
  thaiWords: string[]; // Array of Thai translations (could have alternatives with |)
  wordOptions?: string[][]; // Optional: Array of word arrays for multiple choices (e.g., [["กิน", "แล้ว"], ["ฉัน", "ไม่", "ได้", "กิน"]])
  buttonLabels?: string[]; // Optional: Labels for buttons in PracticeArena (if different from thaiWords)
  description: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  videoPlaceholderColor: string; // To simulate different videos
  modelLabel: string; // Label ที่ model ทำนายออกมา (ต้องตรงกับ label_encoder ใน decision_model)
  modelLabels?: string[]; // Array of model labels (ใช้กับ wordOptions เพื่อเช็คแต่ละตัวเลือก)
  tutorialVideoUrl?: string; // URL ของวิดีโอสอนท่ามือแต่ละคำ (ถ้ามี)
  tutorialVideoUrls?: string[] | string[][]; // Array of URLs หรือ 2D array สำหรับหลายวิดีโอ (ใช้กับ wordOptions)
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
  score: number; // totalScore from Firestore
  totalScore?: number; // Optional: keep both for backward compatibility
  avatar: string;
  photoURL?: string; // Google profile photo URL
  rank?: number;
}

export interface UserProfile {
  username: string;
  avatar: string;
  lastUpdated: string;
  rank: number;
  totalScore: number;
  totalStars: number;
}