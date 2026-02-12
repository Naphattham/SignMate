import { Category, Badge, LeaderboardEntry } from './types';

export const CATEGORIES: Category[] = [
  {
    id: 'cat_greetings',
    title: 'Greetings',
    thaiTitle: 'บทสนทนาทั่วไป',
    description: 'Basic ways to say hello and goodbye.',
    icon: '/src/assets/images/dialogue.png',
    levels: [
      { id: 'lvl_hello', word: 'Hello', thaiWord: 'สวัสดี (ผู้ใหญ่ | เพื่อน)', description: 'Wave hand near forehead.', difficulty: 'Easy', videoPlaceholderColor: 'bg-blue-500' },
      { id: 'lvl_goodbye', word: 'Goodbye', thaiWord: 'ลาก่อน', description: 'Wave hand side to side.', difficulty: 'Easy', videoPlaceholderColor: 'bg-green-500' },
      { id: 'lvl_howareyou', word: 'How are you?', thaiWord: 'สบายดีไหม?', description: 'Sign for asking about wellbeing.', difficulty: 'Easy', videoPlaceholderColor: 'bg-red-500' },
      { id: 'lvl_fine', word: 'Fine', thaiWord: 'สบายดี | ไม่สบายดี', description: 'Sign for good or not good.', difficulty: 'Easy', videoPlaceholderColor: 'bg-teal-500' },
      { id: 'lvl_eaten', word: 'Have you eaten?', thaiWord: 'กินข้าวแล้วหรือยัง?', description: 'Common greeting question.', difficulty: 'Easy', videoPlaceholderColor: 'bg-cyan-500' },
      { id: 'lvl_eaten_response', word: 'Eaten', thaiWord: 'กินแล้ว | ยังไม่ได้กิน', description: 'Response about eating.', difficulty: 'Medium', videoPlaceholderColor: 'bg-amber-500' },
    ]
  },
  {
    id: 'cat_basic',
    title: 'Basic Conversation',
    thaiTitle: 'อาการเจ็บป่วย',
    description: 'Essential words for daily chat.',
    icon: '/src/assets/images/Pain.png',
    levels: [
      { id: 'lvl_cold', word: 'Cold', thaiWord: 'เป็นหวัด', description: 'Sign for having a cold.', difficulty: 'Easy', videoPlaceholderColor: 'bg-yellow-500' },
      { id: 'lvl_sore_throat', word: 'Sore Throat', thaiWord: 'เจ็บคอ', description: 'Sign for throat pain.', difficulty: 'Easy', videoPlaceholderColor: 'bg-orange-500' },
      { id: 'lvl_stomachache', word: 'Stomachache', thaiWord: 'ปวดท้อง', description: 'Sign for stomach pain.', difficulty: 'Medium', videoPlaceholderColor: 'bg-purple-500' },
      { id: 'lvl_headache', word: 'Headache', thaiWord: 'ปวดหัว', description: 'Sign for head pain.', difficulty: 'Easy', videoPlaceholderColor: 'bg-red-500' },
      { id: 'lvl_fever', word: 'Fever', thaiWord: 'เป็นไข้', description: 'Sign for having fever.', difficulty: 'Medium', videoPlaceholderColor: 'bg-pink-500' },
    ]
  },
  {
    id: 'cat_questions',
    title: 'Questions',
    thaiTitle: 'คำถาม-คำตอบ',
    description: 'Who, what, where, when, why.',
    icon: '/src/assets/images/Question.png',
    levels: [
      { id: 'lvl_what', word: 'What', thaiWord: 'อะไร ?', description: 'Sign for asking what.', difficulty: 'Easy', videoPlaceholderColor: 'bg-indigo-500' },
      { id: 'lvl_howmuch', word: 'How much', thaiWord: 'เท่าไหร่ ?', description: 'Sign for asking how much.', difficulty: 'Medium', videoPlaceholderColor: 'bg-pink-500' },
      { id: 'lvl_why', word: 'Why', thaiWord: 'ทำไม ?', description: 'Sign for asking why.', difficulty: 'Medium', videoPlaceholderColor: 'bg-purple-500' },
      { id: 'lvl_yes', word: 'Yes', thaiWord: 'ใช่', description: 'Nod your fist like a head.', difficulty: 'Easy', videoPlaceholderColor: 'bg-green-500' },
      { id: 'lvl_no', word: 'No', thaiWord: 'ไม่', description: 'Tap index and middle finger to thumb.', difficulty: 'Easy', videoPlaceholderColor: 'bg-red-500' },
    ]
  },
  {
    id: 'cat_emotional',
    title: 'Emotional',
    thaiTitle: 'อารมณ์',
    description: 'Expressing feelings and emotions.',
    icon: '/src/assets/images/Emotional.png',
    levels: [
      { id: 'lvl_happy', word: 'Happy', thaiWord: 'สบายดี', description: 'Sign for feeling good.', difficulty: 'Easy', videoPlaceholderColor: 'bg-yellow-500' },
      { id: 'lvl_angry', word: 'Angry', thaiWord: 'โกรธ', description: 'Sign for anger.', difficulty: 'Easy', videoPlaceholderColor: 'bg-red-500' },
      { id: 'lvl_love', word: 'Love', thaiWord: 'รัก', description: 'Sign for love.', difficulty: 'Medium', videoPlaceholderColor: 'bg-pink-500' },
      { id: 'lvl_scared', word: 'Scared', thaiWord: 'กลัว', description: 'Sign for being afraid.', difficulty: 'Easy', videoPlaceholderColor: 'bg-purple-500' },
      { id: 'lvl_tired', word: 'Tired', thaiWord: 'เหนื่อย', description: 'Sign for being tired.', difficulty: 'Medium', videoPlaceholderColor: 'bg-blue-500' },
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
  { id: 'u6', username: 'QuickLearner', score: 85, avatar: '🐯' },
  { id: 'u7', username: 'SignMaster88', score: 75, avatar: '🐨' },
  { id: 'u8', username: 'HandTalker', score: 65, avatar: '🐸' },
  { id: 'u9', username: 'GestureKing', score: 55, avatar: '🐷' },
  { id: 'u10', username: 'SignBeginner', score: 45, avatar: '🐵' },
];