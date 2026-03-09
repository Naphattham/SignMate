import { Category, Badge } from './types';

export const CATEGORIES: Category[] = [
  {
    id: 'cat_greetings',
    title: 'Greetings',
    thaiTitle: 'บทสนทนาทั่วไป',
    description: 'Basic ways to say hello and goodbye.',
    icon: '/src/assets/images/dialogue.png',
    levels: [
      { id: 'lvl_hello', words: ['สวัสดี'], thaiWords: ['สวัสดี (ผู้ใหญ่ | เพื่อน)'], wordOptions: [['สวัสดีผู้ใหญ่'], ['สวัสดีเพื่อน']], buttonLabels: ['สวัสดี (ผู้ใหญ่)', 'สวัสดี (เพื่อน)'], description: 'Greeting for adults and friends.', difficulty: 'Easy', videoPlaceholderColor: 'bg-blue-500', modelLabel: 'hello_adult', modelLabels: ['hello_adult', 'hello_friend'], tutorialVideoUrls: ['/videos/tutorials/greetings/สวัสดี (ผู้ใหญ่).mp4', '/videos/tutorials/greetings/สวัสดี (เพื่อน).mp4'] },
      { id: 'lvl_goodbye', words: ['ฉัน', 'ไป'], thaiWords: ['ลาก่อน'], description: 'Say goodbye.', difficulty: 'Easy', videoPlaceholderColor: 'bg-green-500', modelLabel: 'bye_go', tutorialVideoUrls: ['/videos/tutorials/greetings/ลาก่อน (ฉัน).mp4', '/videos/tutorials/greetings/ลาก่อน (ไป).mp4'] },
      { id: 'lvl_eaten_yet', words: ['ข้าว', 'กิน', 'หรือยัง?'], thaiWords: ['กินข้าวแล้วหรือยัง?'], description: 'Common greeting question.', difficulty: 'Easy', videoPlaceholderColor: 'bg-amber-500', modelLabel: 'eaten_yet', tutorialVideoUrls: ['/videos/tutorials/greetings/กินข้าวหรือยัง (ข้าว).mp4', '/videos/tutorials/greetings/กินข้าวหรือยัง (กิน).mp4', '/videos/tutorials/greetings/กินข้าวหรือยัง (หรือยัง).mp4'] },
      { id: 'lvl_ate_response', words: ['กิน', 'แล้ว'], thaiWords: ['กินแล้ว', 'ยังไม่ได้กิน'], wordOptions: [['กิน', 'แล้ว'], ['กิน','ยัง']], buttonLabels: ['กินแล้ว', 'ยังไม่ได้กิน'], description: 'Response to eaten question.', difficulty: 'Easy', videoPlaceholderColor: 'bg-orange-500', modelLabel: 'ate_already', tutorialVideoUrls: [['/videos/tutorials/greetings/กินแล้ว (กิน).mp4', '/videos/tutorials/greetings/กินแล้ว (แล้ว).mp4'], ['/videos/tutorials/greetings/ยังไม่ได้กิน (กิน).mp4', '/videos/tutorials/greetings/ยังไม่ได้กิน (ยัง).mp4']] },
      { id: 'lvl_howareyou', words: ['สบายดีไหม?'], thaiWords: ['สบายดีไหม?'], description: 'Ask about wellbeing.', difficulty: 'Easy', videoPlaceholderColor: 'bg-red-500', modelLabel: 'how_are_you', tutorialVideoUrls: ['/videos/tutorials/greetings/สบายดีไหม.mp4'] },
      { id: 'lvl_fine', words: ['สบายดี'], thaiWords: ['สบายดี'], description: 'Sign for feeling good.', difficulty: 'Easy', videoPlaceholderColor: 'bg-yellow-500', modelLabel: 'fine', tutorialVideoUrls: ['/videos/tutorials/greetings/สบายดี.mp4'] },
    ]
  },
  {
    id: 'cat_illness',
    title: 'Illness',
    thaiTitle: 'อาการเจ็บป่วย',
    description: 'Signs for health and sickness.',
    icon: '/src/assets/images/Pain.png',
    levels: [
      { id: 'lvl_cold', words: ['เป็นหวัด'], thaiWords: ['เป็นหวัด'], description: 'Sign for having a cold.', difficulty: 'Easy', videoPlaceholderColor: 'bg-blue-500', modelLabel: 'cold', tutorialVideoUrl: '/videos/tutorials/illness/เป็นหวัด.mp4' },
      { id: 'lvl_sore_throat', words: ['เจ็บคอ'], thaiWords: ['เจ็บคอ'], description: 'Sign for throat pain.', difficulty: 'Easy', videoPlaceholderColor: 'bg-orange-500', modelLabel: 'sore_throat', tutorialVideoUrl: '/videos/tutorials/illness/เจ็บคอ.mp4' },
      { id: 'lvl_stomachache', words: ['ปวดท้อง'], thaiWords: ['ปวดท้อง'], description: 'Sign for stomach pain.', difficulty: 'Medium', videoPlaceholderColor: 'bg-purple-500', modelLabel: 'stomachache', tutorialVideoUrl: '/videos/tutorials/illness/ปวดท้อง.mp4' },
      { id: 'lvl_headache', words: ['ปวดหัว'], thaiWords: ['ปวดหัว'], description: 'Sign for head pain.', difficulty: 'Easy', videoPlaceholderColor: 'bg-red-500', modelLabel: 'headache', tutorialVideoUrl: '/videos/tutorials/illness/ปวดหัว.mp4' },
      { id: 'lvl_fever', words: ['เป็นไข้'], thaiWords: ['เป็นไข้'], description: 'Sign for having fever.', difficulty: 'Medium', videoPlaceholderColor: 'bg-pink-500', modelLabel: 'fever', tutorialVideoUrl: '/videos/tutorials/illness/เป็นไข้.mp4' },
    ]
  },
  {
    id: 'cat_questions',
    title: 'Questions',
    thaiTitle: 'คำถาม-คำตอบ',
    description: 'Question words and answers.',
    icon: '/src/assets/images/Question.png',
    levels: [
      { id: 'lvl_what', words: ['อะไร'], thaiWords: ['อะไร?'], description: 'Sign for asking what.', difficulty: 'Easy', videoPlaceholderColor: 'bg-indigo-500', modelLabel: 'what', tutorialVideoUrl: '/videos/tutorials/questions/อะไร.mp4' },
      { id: 'lvl_why', words: ['ทำไม'], thaiWords: ['ทำไม?'], description: 'Sign for asking why.', difficulty: 'Medium', videoPlaceholderColor: 'bg-purple-500', modelLabel: 'why', tutorialVideoUrl: '/videos/tutorials/questions/ทำไม.mp4' },
      { id: 'lvl_howmuch', words: ['เท่าไหร่'], thaiWords: ['เท่าไหร่?'], description: 'Sign for asking how much.', difficulty: 'Medium', videoPlaceholderColor: 'bg-pink-500', modelLabel: 'how_much', tutorialVideoUrl: '/videos/tutorials/questions/เท่าไหร่.mp4' },
      { id: 'lvl_yes', words: ['ใช่'], thaiWords: ['ใช่'], description: 'Nod your fist like a head.', difficulty: 'Easy', videoPlaceholderColor: 'bg-green-500', modelLabel: 'yes', tutorialVideoUrl: '/videos/tutorials/questions/ใช่.mp4' },
      { id: 'lvl_no', words: ['ไม่'], thaiWords: ['ไม่'], description: 'Tap fingers to thumb.', difficulty: 'Easy', videoPlaceholderColor: 'bg-red-500', modelLabel: 'no', tutorialVideoUrl: '/videos/tutorials/questions/ไม่.mp4' },
    ]
  },
  {
    id: 'cat_emotional',
    title: 'Emotions',
    thaiTitle: 'อารมณ์',
    description: 'Expressing feelings and emotions.',
    icon: '/src/assets/images/Emotional.png',
    levels: [
      { id: 'lvl_angry', words: ['โกรธ'], thaiWords: ['โกรธ'], description: 'Sign for anger.', difficulty: 'Easy', videoPlaceholderColor: 'bg-red-500', modelLabel: 'angry', tutorialVideoUrl: '/videos/tutorials/emotions/โกรธ.mp4' },
      { id: 'lvl_fear', words: ['กลัว'], thaiWords: ['กลัว'], description: 'Sign for being afraid.', difficulty: 'Easy', videoPlaceholderColor: 'bg-purple-500', modelLabel: 'fear', tutorialVideoUrl: '/videos/tutorials/emotions/กลัว.mp4' },
      { id: 'lvl_love', words: ['รัก'], thaiWords: ['รัก'], description: 'Sign for love.', difficulty: 'Medium', videoPlaceholderColor: 'bg-pink-500', modelLabel: 'love', tutorialVideoUrl: '/videos/tutorials/emotions/รัก.mp4' },
      { id: 'lvl_unhappy', words: ['ไม่สบายใจ'], thaiWords: ['ไม่สบายใจ'], description: 'Sign for sadness.', difficulty: 'Easy', videoPlaceholderColor: 'bg-gray-500', modelLabel: 'unhappy', tutorialVideoUrl: '/videos/tutorials/emotions/ไม่สบายใจ.mp4' },
      { id: 'lvl_tired', words: ['เหนื่อย'], thaiWords: ['เหนื่อย'], description: 'Sign for being tired.', difficulty: 'Medium', videoPlaceholderColor: 'bg-blue-500', modelLabel: 'tired', tutorialVideoUrl: '/videos/tutorials/emotions/เหนื่อย.mp4' },
    ]
  }
];

export const BADGES: Badge[] = [
  { id: 'badge_first_win', title: 'First Steps', description: 'Complete your first level.', icon: '🥉' },
  { id: 'badge_3_stars', title: 'Perfectionist', description: 'Get 3 stars on any level.', icon: '🌟' },
  { id: 'badge_collector', title: 'Collector', description: 'Unlock 3 different levels.', icon: '🎒' },
  { id: 'badge_master', title: 'Sign Master', description: 'Earn 10 total stars.', icon: '👑' },
];