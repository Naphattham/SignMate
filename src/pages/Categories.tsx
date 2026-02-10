import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Trophy, User, LogOut } from 'lucide-react';
import { CATEGORIES } from '../../constants';
import { UserProgress } from '../../types';
import { type User as FirebaseUser } from '../../services/firebase';
import logoHeader from '../assets/images/logo header.png';
import logoSignMate from '../assets/images/LOGO_SignMate.png';

interface CategoriesProps {
  userProgress: UserProgress;
  user: FirebaseUser | null;
  onLogout?: () => void;
}

export default function Categories({ userProgress, user, onLogout }: CategoriesProps) {
  const navigate = useNavigate();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const handleSelectCategory = (categoryId: string) => {
    navigate(`/category/${categoryId}`);
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
    // พื้นหลังสีแดงอมส้มเหมือนในรูป
    <div className="min-h-screen bg-[#E5625E] flex items-center justify-center p-4 font-sans">
      
      {/* การ์ดหลักสีครีม */}
      <div className="relative bg-[#FFF9F0] w-full max-w-7xl aspect-[16/10] md:aspect-video rounded-[3rem] border-2 border-black shadow-2xl p-8 md:p-12 overflow-hidden">
        
        {/* ส่วนหัว (Header) */}
        <header className="relative flex justify-end items-center mb-12">
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

        {/* Grid เมนู */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-10">
          
          {CATEGORIES.map((cat) => (
            <MenuCard
              key={cat.id}
              icon={cat.icon}
              title={cat.thaiTitle}
              onClick={() => handleSelectCategory(cat.id)}
            />
          ))}

        </div>
      </div>
    </div>
  );
}

// Component ย่อยสำหรับการ์ดเมนู
interface MenuCardProps {
  icon: string;
  title: string;
  onClick: () => void;
}

const MenuCard = ({ icon, title, onClick }: MenuCardProps) => {
  return (
    <button 
      onClick={onClick}
      className="
        relative w-full h-40 md:h-48 rounded-[2rem] 
        flex items-center justify-start px-8 gap-6
        bg-[#FACC15] shadow-[8px_5px_0_#F472B6]
        transition-all duration-150 ease-in-out
        active:translate-x-2 active:shadow-none
        hover:brightness-105 border-2 border-transparent hover:border-white/20
      "
    >
      {/* Icon วงกลมหรือรูปภาพ */}
      <div className="transform scale-150 md:scale-[2.0]">
        {icon}
      </div>
      
      {/* Text */}
      <span className="text-2xl md:text-3xl font-bold text-gray-800 tracking-wide text-left">
        {title}
      </span>
    </button>
  );
};
