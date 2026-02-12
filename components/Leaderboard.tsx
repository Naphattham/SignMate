import React from 'react';
import { useNavigate } from 'react-router-dom';
import { LeaderboardEntry } from '../types';
import { MOCK_LEADERBOARD } from '../constants';
import { Navbar } from './Navbar';

interface LeaderboardProps {
  currentUser: LeaderboardEntry;
}

export const Leaderboard: React.FC<LeaderboardProps> = ({ currentUser }) => {
  const navigate = useNavigate();

  // Mock data for demo
  const user = { email: currentUser.username + '@example.com' };
  const totalStars = currentUser.score;

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
    let heightClass = 'h-20';
    let orderClass = 'order-3';
    let zIndex = 'z-0';
    let label = '3';
    
    // รูปมงกุฎสำหรับที่ 1
    const showCrown = position === 1;

    if (position === 1) {
      heightClass = 'h-28';
      orderClass = 'order-2';
      zIndex = 'z-10';
      label = '1';
    } else if (position === 2) {
      heightClass = 'h-24';
      orderClass = 'order-1';
      zIndex = 'z-0';
      label = '2';
    }

    return (
      <div key={player.id} className={`flex flex-col items-center ${orderClass} ${zIndex} -mx-1`}>
        {/* Avatar Section */}
        <div className="relative mb-2 flex flex-col items-center">
          {showCrown && (
            <div className="absolute -top-8 text-3xl animate-bounce">
              👑
            </div>
          )}
          
          <div className={`
            w-16 h-16 rounded-full border-3 flex items-center justify-center overflow-hidden bg-white
            ${position === 1 ? 'border-yellow-400 w-20 h-20' : 'border-[#A67C52]'}
          `}>
            {/* ใส่รูป Avatar หรือ Placeholder */}
            {player.avatar ? (
              <span className="text-2xl">{player.avatar}</span> 
            ) : (
              <div className="w-full h-full bg-gray-200" />
            )}
          </div>
          
          <div className="mt-1 text-center leading-tight">
            <div className="font-bold text-gray-800 text-xs font-mono uppercase tracking-tighter">
              {player.username}
            </div>
            <div className="font-bold text-gray-600 text-[10px] font-mono">
              {player.score} PTS
            </div>
          </div>
        </div>

        {/* The Block (แท่นยืน) */}
        <div className={`
          ${heightClass} w-20 sm:w-24
          bg-[#B07656] border-b-[6px] border-[#8B5A36]
          shadow-lg rounded-t-lg
          flex items-center justify-center
          relative
        `}>
          {/* Top highlight of the block for 3D effect */}
          <div className="absolute top-0 w-full h-1.5 bg-[#C68E6D] rounded-t-lg" />
          
          {/* Number on the block */}
          <span className="text-white font-black text-4xl drop-shadow-md font-mono mt-1">
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
        
        <Navbar 
          totalStars={totalStars}
          user={{ email: user.email } as any}
        />

        {/* --- Podium Section --- */}
        <div className="relative">
          {/* Back Button */}
          <button
            onClick={() => navigate(-1)}
            className="
              group
              absolute left-0 top-0
              flex items-center gap-3
              px-5 py-2
              bg-[#d1bbf9] 
              rounded-2xl 
              shadow-[5px_5px_0px_0px_rgba(0,0,0,1)] 
              hover:translate-x-[2px] hover:translate-y-[2px] 
              hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] 
              active:translate-x-[5px] active:translate-y-[5px] 
              active:shadow-none
              transition-all duration-200
            "
          >
            {/* Icon Wrapper (Black Circle) */}
            <div className="flex items-center justify-center w-10 h-10 bg-black rounded-xl">
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                fill="none" 
                viewBox="0 0 24 24" 
                strokeWidth={4} 
                stroke="#d1bbf9"
                className="w-6 h-6"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
              </svg>
            </div>

            {/* Text */}
            <span className="text-black font-bold text-lg tracking-wide pt-1">
              ย้อนกลับ
            </span>
          </button>

          <div className="flex items-end justify-center mt-8 mb-4 pb-1">
            {/* เรียงลำดับการ Render ให้แสดงผลถูกต้อง: ที่ 2, ที่ 1, ที่ 3 */}
            {top3.length > 1 && renderPodiumPlace(top3[1], 2)}
            {top3.length > 0 && renderPodiumPlace(top3[0], 1)}
            {top3.length > 2 && renderPodiumPlace(top3[2], 3)}
          </div>
        </div>

        {/* --- List Section --- */}
        <div className="flex-1 bg-[#EFA49A] rounded-[20px] p-2 shadow-[inset_0_2px_4px_rgba(0,0,0,0.1)] relative flex flex-col overflow-hidden border-2 border-[#E58B80] min-h-[290px] max-w-4xl mx-auto w-full">
          
          {/* Scrollable Area */}
          <div className="overflow-y-auto overflow-x-hidden px-2 custom-scrollbar flex-1 space-y-3 py-2">
            {rest.map((player) => {
              // ตรวจสอบว่าเป็น User ปัจจุบันหรือไม่
              const isCurrentUser = player.username === currentUser.username;

              return (
                <div
                  key={player.id}
                  className={`
                    flex items-center w-full h-20 px-4 rounded-[20px] shadow-sm transition-transform hover:scale-[1.01]
                    ${
                      isCurrentUser
                        ? "bg-[#F4C15B]" // สีส้มสำหรับ User ปัจจุบัน (เหมือนในรูป)
                        : "bg-[#F9E3E3]" // สีชมพูอ่อนสำหรับคนอื่น (เหมือนในรูป)
                    }
                  `}
                >
                  {/* Rank Number (Pixel Style) */}
                  <div className="w-12 font-pixel text-4xl text-black flex justify-start">
                    {player.rank}
                  </div>

                  {/* Avatar */}
                  {/* ในรูป Avatar เป็นวงกลมที่มีพื้นหลังสีสดใส */}
                  <div className={`
                    w-12 h-12 rounded-full flex-shrink-0 mr-4 overflow-hidden border-2 border-white/30
                    ${isCurrentUser ? 'bg-[#E0A040]' : 'bg-[#EF9C92]'} 
                  `}>
                     {/* ใส่รูปภาพ Avatar ตรงนี้ */}
                     <img 
                       src={player.avatar || "https://api.dicebear.com/7.x/avataaars/svg?seed=" + player.username} 
                       alt="avatar" 
                       className="w-full h-full object-cover" 
                     />
                  </div>

                  {/* Username */}
                  <div className="flex-1 min-w-0">
                    <div className="font-pixel text-xl md:text-2xl text-black tracking-widest uppercase truncate pt-1">
                      {player.username}
                    </div>
                  </div>

                  {/* Score */}
                  <div className="font-pixel text-xl md:text-2xl text-black whitespace-nowrap pt-1">
                    {player.score} PTS
                  </div>
                </div>
              );
            })}
          </div>

          {/* Scrollbar CSS Customization (Retro Style) */}
          <style>{`
            .font-pixel {
              /* อย่าลืม import ฟอนต์ Pixel เช่น 'Press Start 2P' หรือ 'VT323' มาใช้นะครับ */
              font-family: 'VT323', monospace; 
            }

            /* Scrollbar Track */
            .custom-scrollbar::-webkit-scrollbar {
              width: 12px;
            }
            .custom-scrollbar::-webkit-scrollbar-track {
              background: #D67E73; /* สีแดงเข้มขึ้นมาหน่อย */
              border-radius: 4px;
              margin: 4px;
            }
            /* Scrollbar Thumb (ตัวเลื่อน) */
            .custom-scrollbar::-webkit-scrollbar-thumb {
              background: #333333; /* สีดำ/เทาเข้ม แบบในรูป */
              border-radius: 4px;
              border: 2px solid #D67E73; /* ขอบเพื่อให้ดูมีมิติ */
            }
            .custom-scrollbar::-webkit-scrollbar-thumb:hover {
              background: #000000;
            }
          `}</style>

        </div>
      </div>
    </div>
  );
};