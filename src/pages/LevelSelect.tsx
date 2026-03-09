import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { CATEGORIES } from '../../constants';
import { UserProgress } from '../../types';
import { StarRating } from '../../components/StarRating';
import { type User as FirebaseUser } from '../../services/firebase';
import { Navbar } from '../../components/Navbar'; 

interface LevelSelectProps {
  userProgress: UserProgress;
  user: FirebaseUser | null;
  onLogout?: () => void;
}

export default function LevelSelect({ userProgress, user, onLogout }: LevelSelectProps) {
  const navigate = useNavigate();
  const { categoryId } = useParams<{ categoryId: string }>();

  const selectedCategory = CATEGORIES.find(cat => cat.id === categoryId);

  if (!selectedCategory) {
    return (
      <div className="flex items-center justify-center flex-1 bg-[#FFF9EF]">
        <div className="text-gray-500 text-2xl font-bold">Category not found</div>
      </div>
    );
  }

  const handleSelectLevel = (levelId: string) => {
    const isUnlocked = userProgress.unlockedLevelIds.includes(levelId);
    if (isUnlocked) {
      navigate(`/practice/${categoryId}/${levelId}`);
    }
  };

  const totalStars = Object.values(userProgress.stars).reduce((a: number, b: number) => a + b, 0);

  return (
    <div className="min-h-screen bg-[#ef4848] flex items-center justify-center p-4 font-sans">
      <div className="relative bg-[#FFF9F0] w-full max-w-7xl aspect-[16/10] md:aspect-video rounded-[3rem] border-2 border-black shadow-2xl p-8 md:p-12 overflow-hidden">

        <Navbar 
          totalStars={totalStars}
          user={user}
          onLogout={onLogout}
        />

        {/* --- Navigation Bar (Purple Section) --- */}
        <div className="bg-[#D0C3F1] rounded-3xl p-4 md:py-6 md:px-8 mb-8 flex items-center relative shadow-sm">
          {/* Back Button */}
          <div className="absolute left-6 flex items-center gap-3">
            {/* ส่วนที่ 1: วงกลมสีดำ + ลูกศร (กดได้) */}
            <button
              onClick={() => navigate('/categories')}
              className="w-14 h-14 bg-black rounded-full flex items-center justify-center shadow-lg cursor-pointer"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={3}
                stroke="#D8B4FE"
                className="w-7 h-7"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
              </svg>
            </button>

            {/* ส่วนที่ 2: ตัวหนังสือแยกออกมาข้างนอก (ไม่กดได้) */}
            <span className="text-2xl font-black text-black tracking-wide">
              ย้อนกลับ
            </span>
          </div>

          {/* Title Center */}
          <div className="mx-auto flex items-center gap-3">
            <img src={selectedCategory.icon} alt={selectedCategory.thaiTitle} className="w-16 h-16 object-contain drop-shadow-md" />
            <h2 className="text-3xl font-black text-gray-800">{selectedCategory.thaiTitle}</h2>
          </div>
        </div>

        {/* --- Level Grid (Yellow Buttons) --- */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4">
          {selectedCategory.levels.map((level) => {
            const isUnlocked = userProgress.unlockedLevelIds.includes(level.id);
            const stars = userProgress.stars[level.id] || 0;

            return (
              <div
                key={level.id}
                onClick={() => isUnlocked && handleSelectLevel(level.id)}
                className={`
          relative flex items-center justify-between px-10 py-8 rounded-[20px] transition-all duration-150 select-none
          ${isUnlocked
                    ? "bg-[#F4CF4D] shadow-[0_8px_0_#EA6AA8] cursor-pointer active:shadow-none active:translate-y-[8px]"
                    : "bg-[#E5E5E5] shadow-[0_8px_0_#C0C0C0] cursor-not-allowed text-gray-400"
                  }
        `}
              >
                {/* Left: Text */}
                <div className="flex flex-col">
                  {/* ใช้ font-pixel และสีดำสนิท */}
                  <h3 className="font-pixel text-3xl md:text-4xl text-black tracking-wide">
                    {level.thaiWords.join(' | ')}
                  </h3>
                </div>

                {/* Right: Stars */}
                <div className="flex items-center gap-2">
                  {isUnlocked ? (
                    [1, 2, 3].map((starIndex) => (
                      <svg
                        key={starIndex}
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                        className={`w-10 h-10 ${starIndex <= stars
                          ? "text-white" // ดาวที่ได้แล้วเป็นสีขาว
                          : "text-white/40" // ดาวที่ยังไม่ได้จางลง
                          }`}
                      >
                        {/* Path ทรงดาวแบบมน (Rounded Star) ให้ดูนุ่มนวลเหมือนในภาพ */}
                        <path
                          fillRule="evenodd"
                          d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z"
                          clipRule="evenodd"
                        />
                      </svg>
                    ))
                  ) : (
                    <span className="text-4xl opacity-40">🔒</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </div>
  );
}