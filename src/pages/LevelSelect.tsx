import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Trophy, LogOut } from 'lucide-react';
import { CATEGORIES } from '../../constants';
import { UserProgress } from '../../types';
import { StarRating } from '../../components/StarRating';
import { type User as FirebaseUser } from '../../services/firebase';
import logoSignMate from '../assets/images/LOGO_SignMate.png';
// หมายเหตุ: อาจต้อง import ไอคอนเพิ่มเติมจาก library เช่น lucide-react หรือ heroicons
// import { ArrowLeft, Trophy, User } from 'lucide-react'; 

interface LevelSelectProps {
  userProgress: UserProgress;
  user: FirebaseUser | null;
  onLogout?: () => void;
}

export default function LevelSelect({ userProgress, user, onLogout }: LevelSelectProps) {
  const navigate = useNavigate();
  const { categoryId } = useParams<{ categoryId: string }>();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

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

  const handleLogout = () => {
    if (onLogout) {
      onLogout();
    }
    navigate('/');
  };

  const totalStars = Object.values(userProgress.stars).reduce((a: number, b: number) => a + b, 0);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowProfileMenu(false);
      }
    };

    if (showProfileMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showProfileMenu]);

  return (
    <div className="min-h-screen bg-[#E5625E] flex items-center justify-center p-4 font-sans">
      <div className="relative bg-[#FFF9F0] w-full max-w-7xl aspect-[16/10] md:aspect-video rounded-[3rem] border-2 border-black shadow-2xl p-8 md:p-12 overflow-hidden">

        {/* --- Header Section: Logo & User Stats --- */}
        <header className="relative flex justify-end items-center mb-6">
          {/* Logo Title - อยู่ตรงกลาง */}
          <div className="absolute left-1/2 transform -translate-x-1/2 flex items-center gap-3">
            <div className="relative">
              <img src={logoSignMate} alt="SignMate Logo" className="w-12 h-12" />
              <div className="absolute -top-1 -right-1 text-red-500 text-xs">❤️</div>
            </div>
            {/* ใช้ Font ที่มีความหนาและดู Pixel นิดๆ ถ้ามี */}
            <h1 className="text-4xl md:text-5xl font-black text-gray-900 tracking-tight" style={{ fontFamily: 'monospace, sans-serif' }}>
              SignMate
            </h1>
          </div>

          {/* Icon ด้านขวา (ถ้วยรางวัล + โปรไฟล์) */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/leaderboard')}
              className="flex flex-col items-center justify-center cursor-pointer hover:scale-105 transition-transform"
            >
              <Trophy className="w-8 h-8 text-yellow-600 mb-1" />
              <div className="h-1 w-8 bg-yellow-700 rounded-full"></div>
              <span className="text-xs font-bold text-gray-800 mt-1">{totalStars}</span>
            </button>
            <div className="h-8 w-[2px] bg-gray-300 mx-2"></div>
            <div className="relative" ref={menuRef}>
              {/* --- ปุ่ม Trigger (รูป Profile) --- */}
              <button
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="flex items-center justify-center w-12 h-12 rounded-full bg-blue-100 border-2 border-transparent hover:border-red-400 transition-all focus:outline-none"
              >
                {/* Avatar Image */}
                <img
                  src="https://api.dicebear.com/7.x/avataaars/svg?seed=User"
                  alt="User Avatar"
                  className="w-10 h-10 rounded-full"
                />
              </button>

              {/* --- Dropdown Menu --- */}
              {showProfileMenu && (
                <div
                  className="absolute right-0 mt-3 w-64 bg-[#F08E88] rounded-[1.2rem] shadow-xl p-3 z-50 animate-fade-in-up origin-top-right border-2 border-white/20"
                  style={{ fontFamily: '"VT323", monospace' }}
                >
                  {/* Header: HI, USER! */}
                  <div className="mb-3 pl-1">
                    <h3 className="text-white text-lg tracking-widest uppercase drop-shadow-md">
                      HI, {user?.email?.split('@')[0].toUpperCase() || 'USER'}!
                    </h3>
                  </div>

                  {/* Menu Items */}
                  <div className="flex flex-col gap-2">

                    {/* Item 1: Profile */}
                    <button
                      onClick={() => navigate('/profile')}
                      className="flex items-center gap-3 group cursor-pointer hover:bg-white/10 p-2 rounded-lg transition-colors w-full text-left"
                    >
                      <div className="w-7 h-7 bg-[#FACC15] rounded-full flex items-center justify-center border-2 border-[#Eab308]">
                        <img
                          src="https://api.dicebear.com/7.x/avataaars/svg?seed=User"
                          alt="Profile"
                          className="w-6 h-6 rounded-full"
                        />
                      </div>
                      <span className="text-black text-xl uppercase tracking-wider group-hover:text-white transition-colors">
                        Profile
                      </span>
                    </button>

                    {/* Item 2: Log Out */}
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-3 group w-full text-left hover:bg-white/10 p-2 rounded-lg transition-colors"
                    >
                      <div className="w-7 h-7 flex items-center justify-center">
                        <LogOut className="w-6 h-6 text-black group-hover:text-white transition-colors stroke-[2.5]" />
                      </div>
                      <span className="text-black text-xl uppercase tracking-wider group-hover:text-white transition-colors">
                        Log Out
                      </span>
                    </button>

                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

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
            <span className="text-4xl drop-shadow-md">{selectedCategory.icon}</span>
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
          relative flex items-center justify-between px-6 py-5 rounded-2xl border-b-[6px] transition-all duration-100 select-none
          ${isUnlocked
                    ? "bg-[#FCD04E] border-[#E57A94] cursor-pointer active:border-b-0 active:translate-y-[6px]"
                    : "bg-gray-300 border-gray-400 cursor-not-allowed opacity-80"
                  }
        `}
              >
                {/* Left: Text */}
                <div className="flex flex-col">
                  {/* หมายเหตุ: ต้องใช้ฟอนต์ Pixel เพื่อให้เหมือนรูปเป๊ะๆ */}
                  <h3 className="text-2xl font-black text-[#1A1A1A] tracking-tight truncate">
                    {level.thaiWord}
                  </h3>
                </div>

                {/* Right: Stars or Lock */}
                <div className="flex items-center">
                  {isUnlocked ? (
                    <div className="flex gap-1">
                      {[1, 2, 3].map((starIndex) => (
                        <svg
                          key={starIndex}
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          fill="currentColor"
                          className={`w-8 h-8 drop-shadow-sm ${starIndex <= stars
                            ? "text-white" // ดาวที่ได้แล้วเป็นสีขาว
                            : "text-white/40" // ดาวที่ยังไม่ได้จางลง
                            }`}
                        >
                          {/* ใช้ Path ทรงดาวที่มนขึ้นเล็กน้อยเพื่อให้ดูนุ่มนวลเหมือนในภาพ */}
                          <path
                            fillRule="evenodd"
                            d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z"
                            clipRule="evenodd"
                          />
                        </svg>
                      ))}
                    </div>
                  ) : (
                    <span className="text-2xl opacity-50">🔒</span>
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