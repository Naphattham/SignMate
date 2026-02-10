import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Trophy, LogOut } from 'lucide-react';
import { LeaderboardEntry } from '../types';
import { MOCK_LEADERBOARD } from '../constants';
import logoSignMate from '../src/assets/images/LOGO_SignMate.png';

interface LeaderboardProps {
  currentUser: LeaderboardEntry;
}

export const Leaderboard: React.FC<LeaderboardProps> = ({ currentUser }) => {
  const navigate = useNavigate();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Mock data for demo
  const user = { email: currentUser.username + '@example.com' };
  const totalStars = currentUser.score;

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowProfileMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    // Add your logout logic here
    navigate('/login');
  };

  // 1. Logic รวมข้อมูล Mock กับ User ปัจจุบัน
  const allPlayers = [...MOCK_LEADERBOARD];
  if (!allPlayers.find(p => p.username === currentUser.username)) {
    allPlayers.push(currentUser);
  } else {
    const idx = allPlayers.findIndex(p => p.username === currentUser.username);
    allPlayers[idx] = currentUser;
  }

  // 2. Sort คะแนนจากมากไปน้อย
  const sortedPlayers = allPlayers
    .sort((a, b) => b.score - a.score)
    .map((p, i) => ({ ...p, rank: i + 1 }));

  const top3 = sortedPlayers.slice(0, 3);
  const rest = sortedPlayers.slice(3);

  // ---------------------------------------------
  // Helper Component: แท่นรางวัล (Podium)
  // ---------------------------------------------
  const renderPodiumPlace = (player: LeaderboardEntry, position: number) => {
    // กำหนดความสูงและลำดับการจัดวาง (2, 1, 3)
    let heightClass = 'h-28';
    let orderClass = 'order-3';
    let zIndex = 'z-0';
    let label = '3';
    
    // รูปมงกุฎสำหรับที่ 1
    const showCrown = position === 1;

    if (position === 1) {
      heightClass = 'h-40';
      orderClass = 'order-2';
      zIndex = 'z-10';
      label = '1';
    } else if (position === 2) {
      heightClass = 'h-32';
      orderClass = 'order-1';
      zIndex = 'z-0';
      label = '2';
    }

    return (
      <div key={player.id} className={`flex flex-col items-center ${orderClass} ${zIndex} -mx-2`}>
        {/* Avatar Section */}
        <div className="relative mb-3 flex flex-col items-center">
          {showCrown && (
            <div className="absolute -top-10 text-4xl animate-bounce">
              👑
            </div>
          )}
          
          <div className={`
            w-20 h-20 rounded-full border-4 flex items-center justify-center overflow-hidden bg-white
            ${position === 1 ? 'border-yellow-400 w-24 h-24' : 'border-[#A67C52]'}
          `}>
            {/* ใส่รูป Avatar หรือ Placeholder */}
            {player.avatar ? (
              <span className="text-3xl">{player.avatar}</span> 
            ) : (
              <div className="w-full h-full bg-gray-200" />
            )}
          </div>
          
          <div className="mt-2 text-center leading-tight">
            <div className="font-bold text-gray-800 text-sm font-mono uppercase tracking-tighter">
              {player.username}
            </div>
            <div className="font-bold text-gray-600 text-xs font-mono">
              {player.score} PTS
            </div>
          </div>
        </div>

        {/* The Block (แท่นยืน) */}
        <div className={`
          ${heightClass} w-28 sm:w-32
          bg-[#B07656] border-b-[8px] border-[#8B5A36]
          shadow-lg rounded-t-lg
          flex items-center justify-center
          relative
        `}>
          {/* Top highlight of the block for 3D effect */}
          <div className="absolute top-0 w-full h-2 bg-[#C68E6D] rounded-t-lg" />
          
          {/* Number on the block */}
          <span className="text-white font-black text-5xl drop-shadow-md font-mono mt-2">
            {label}
          </span>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#D85D5D] p-4 flex items-center justify-center font-sans">
      {/* Main Card Container */}
      <div className="relative bg-[#FFF9F0] w-full max-w-7xl aspect-[16/10] md:aspect-video rounded-[3rem] border-2 border-black shadow-2xl p-8 md:p-12 overflow-hidden flex flex-col">
        
        <header className="relative flex justify-between items-center mb-4">
          {/* ปุ่มย้อนกลับ (ซ้าย) */}
          <button
            onClick={() => navigate(-1)}
            className="flex items-center justify-center w-10 h-10 bg-black rounded-full hover:scale-105 transition-transform shadow-md"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="white" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
            </svg>
          </button>

          {/* Logo Title - อยู่ตรงกลาง */}
          <div className="absolute left-1/2 transform -translate-x-1/2 flex items-center gap-2">
            <div className="relative">
              <img src={logoSignMate} alt="SignMate Logo" className="w-8 h-8" />
              <div className="absolute -top-1 -right-1 text-red-500 text-[10px]">❤️</div>
            </div>
            {/* ใช้ Font ที่มีความหนาและดู Pixel นิดๆ ถ้ามี */}
            <h1 className="text-2xl md:text-3xl font-black text-gray-900 tracking-tight" style={{ fontFamily: 'monospace, sans-serif' }}>
              SignMate
            </h1>
          </div>

          {/* Icon ด้านขวา (ถ้วยรางวัล + โปรไฟล์) */}
          <div className="flex items-center gap-2">
            <button 
              onClick={() => navigate('/leaderboard')}
              className="flex flex-col items-center justify-center cursor-pointer hover:scale-105 transition-transform"
            >
              <Trophy className="w-6 h-6 text-yellow-600 mb-0.5" />
              <div className="h-0.5 w-6 bg-yellow-700 rounded-full"></div>
              <span className="text-[10px] font-bold text-gray-800 mt-0.5">{totalStars}</span>
            </button>
            <div className="h-6 w-[2px] bg-gray-300 mx-1"></div>
            <div className="relative" ref={menuRef}>
              {/* --- ปุ่ม Trigger (รูป Profile) --- */}
              <button 
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-100 border-2 border-transparent hover:border-red-400 transition-all focus:outline-none"
              >
                {/* Avatar Image */}
                <img 
                  src="https://api.dicebear.com/7.x/avataaars/svg?seed=User" 
                  alt="User Avatar" 
                  className="w-8 h-8 rounded-full"
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

        {/* --- Podium Section --- */}
        <div className="flex items-end justify-center mt-4 mb-6 pb-2">
          {/* เรียงลำดับการ Render ให้แสดงผลถูกต้อง: ที่ 2, ที่ 1, ที่ 3 */}
          {top3.length > 1 && renderPodiumPlace(top3[1], 2)}
          {top3.length > 0 && renderPodiumPlace(top3[0], 1)}
          {top3.length > 2 && renderPodiumPlace(top3[2], 3)}
        </div>

        {/* --- List Section --- */}
        <div className="flex-1 bg-[#EF9C92] rounded-[20px] p-3 shadow-inner relative flex flex-col overflow-hidden border-2 border-[#E58B80] min-h-0">

          {/* Scrollable Area */}
          <div className="overflow-y-auto overflow-x-hidden pr-1 custom-scrollbar flex-1 space-y-2">
            {rest.map((player) => {
              const isCurrentUser = player.username === currentUser.username;
              
              return (
                <div 
                  key={player.id} 
                  className={`
                    flex items-center px-4 py-2 rounded-full shadow-sm border-b-2 transition-transform hover:scale-[1.01]
                    ${isCurrentUser 
                      ? 'bg-[#F4C65D] border-[#D9AB42]' // สีส้มสำหรับ User ปัจจุบัน
                      : 'bg-[#FADADD] border-[#E8C1C4]' // สีชมพูสำหรับคนอื่น
                    }
                  `}
                >
                  {/* Rank */}
                  <div className="w-8 font-black text-black text-lg font-mono">
                    {player.rank}
                  </div>

                  {/* Avatar */}
                  <div className={`
                    w-9 h-9 rounded-full flex items-center justify-center text-base mr-3 border-2
                    ${isCurrentUser ? 'bg-orange-100 border-orange-300' : 'bg-pink-100 border-pink-300'}
                  `}>
                    {player.avatar}
                  </div>

                  {/* Name */}
                  <div className="flex-1">
                    <div className="font-bold text-black text-sm font-mono tracking-wide uppercase">
                      {player.username}
                    </div>
                  </div>

                  {/* Score */}
                  <div className="font-black text-black text-base font-mono">
                    {player.score} PTS
                  </div>
                </div>
              );
            })}
          </div>
          
          {/* Scrollbar CSS Customization */}
          <style>{`
            .custom-scrollbar::-webkit-scrollbar {
              width: 8px;
            }
            .custom-scrollbar::-webkit-scrollbar-track {
              background: rgba(0,0,0,0.1);
              border-radius: 10px;
              margin: 10px 0;
            }
            .custom-scrollbar::-webkit-scrollbar-thumb {
              background: rgba(0,0,0,0.3);
              border-radius: 10px;
            }
            .custom-scrollbar::-webkit-scrollbar-thumb:hover {
              background: rgba(0,0,0,0.5);
            }
          `}</style>

        </div>
      </div>
    </div>
  );
};