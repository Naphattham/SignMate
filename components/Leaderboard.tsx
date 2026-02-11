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
          showBackButton={true}
          onBack={() => navigate(-1)}
        />

        {/* --- Podium Section --- */}
        <div className="flex items-end justify-center mt-2 mb-4 pb-1">
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