import { Category, Badge, LeaderboardEntry } from './types';

export const CATEGORIES: Category[] = [
  {
    id: 'cat_greetings',
    title: 'Greetings',
    thaiTitle: 'การทักทาย',
    description: 'Basic ways to say hello and goodbye.',
    icon: '👋',
    levels: [
      { id: 'lvl_hello', word: 'Hello', thaiWord: 'สวัสดี', description: 'Wave hand near forehead.', difficulty: 'Easy', videoPlaceholderColor: 'bg-blue-500' },
      { id: 'lvl_thanks', word: 'Thank You', thaiWord: 'ขอบคุณ', description: 'Touch chin and move hand forward.', difficulty: 'Easy', videoPlaceholderColor: 'bg-green-500' },
      { id: 'lvl_sorry', word: 'Sorry', thaiWord: 'ขอโทษ', description: 'Rub fist in a circle on chest.', difficulty: 'Easy', videoPlaceholderColor: 'bg-red-500' },
    ]
  },
  {
    id: 'cat_basic',
    title: 'Basic Conversation',
    thaiTitle: 'บทสนทนาพื้นฐาน',
    description: 'Essential words for daily chat.',
    icon: '💬',
    levels: [
      { id: 'lvl_yes', word: 'Yes', thaiWord: 'ใช่', description: 'Nod your fist like a head.', difficulty: 'Easy', videoPlaceholderColor: 'bg-yellow-500' },
      { id: 'lvl_no', word: 'No', thaiWord: 'ไม่', description: 'Tap index and middle finger to thumb.', difficulty: 'Easy', videoPlaceholderColor: 'bg-orange-500' },
      { id: 'lvl_help', word: 'Help', thaiWord: 'ช่วยด้วย', description: 'Fist with thumb up on flat palm, lift up.', difficulty: 'Medium', videoPlaceholderColor: 'bg-purple-500' },
    ]
  },
  {
    id: 'cat_questions',
    title: 'Questions',
    thaiTitle: 'คำถาม',
    description: 'Who, what, where, when, why.',
    icon: '❓',
    levels: [
      { id: 'lvl_who', word: 'Who', thaiWord: 'ใคร', description: 'Draw a circle with finger around mouth.', difficulty: 'Medium', videoPlaceholderColor: 'bg-indigo-500' },
      { id: 'lvl_where', word: 'Where', thaiWord: 'ที่ไหน', description: 'Shake index finger side to side.', difficulty: 'Medium', videoPlaceholderColor: 'bg-pink-500' },
    ]
  }
];

export const BADGES: Badge[] = [
  { id: 'badge_first_win', title: 'First Steps', description: 'Complete your first level.', icon: '🥉' },
  { id: 'badge_3_stars', title: 'Perfectionist', description: 'Get 3 stars on any level.', icon: '🌟' },
  { id: 'badge_collector', title: 'Collector', description: 'Unlock 3 different levels.', icon: '🎒' },
  { id: 'badge_master', title: 'Sign Master', description: 'Earn 10 total stars.', icon: '👑' },
];

export const MOCK_LEADERBOARD: LeaderboardEntry[] = [
  { id: 'u1', username: 'SignPro_Max', score: 250, avatar: '🦁' },
  { id: 'u2', username: 'LilyHands', score: 210, avatar: '🦊' },
  { id: 'u3', username: 'TechSigner', score: 180, avatar: '🤖' },
  { id: 'u4', username: 'NewbieJohn', score: 120, avatar: '🐼' },
  { id: 'u5', username: 'AliceWonder', score: 95, avatar: '🐰' },
];