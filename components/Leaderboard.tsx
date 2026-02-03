import React, { useState } from 'react';
import { LeaderboardEntry } from '../types';
import { MOCK_LEADERBOARD } from '../constants';

interface LeaderboardProps {
  currentUser: LeaderboardEntry;
}

export const Leaderboard: React.FC<LeaderboardProps> = ({ currentUser }) => {
  const [timeframe, setTimeframe] = useState<'ALL_TIME' | 'WEEKLY'>('ALL_TIME');

  // Combine mock data with current user and sort
  const allPlayers = [...MOCK_LEADERBOARD];
  // Check if current user is already in mock (by username) to avoid dupe, else add
  if (!allPlayers.find(p => p.username === currentUser.username)) {
    allPlayers.push(currentUser);
  } else {
    // Update score of existing mock user if it matches current user
    const idx = allPlayers.findIndex(p => p.username === currentUser.username);
    allPlayers[idx] = currentUser;
  }

  // Sort descending by score
  const sortedPlayers = allPlayers.sort((a, b) => b.score - a.score).map((p, i) => ({ ...p, rank: i + 1 }));

  const top3 = sortedPlayers.slice(0, 3);
  const rest = sortedPlayers.slice(3);

  // Podium Helper
  const renderPodiumPlace = (player: LeaderboardEntry, position: number) => {
    let height = 'h-32';
    let color = 'bg-gray-400';
    let label = '3rd';
    let order = 'order-3';
    let scale = 'scale-90';

    if (position === 1) {
      height = 'h-48';
      color = 'bg-yellow-400';
      label = '1st';
      order = 'order-2';
      scale = 'scale-110 z-10';
    } else if (position === 2) {
      height = 'h-40';
      color = 'bg-gray-300';
      label = '2nd';
      order = 'order-1';
      scale = 'scale-100';
    }

    return (
      <div key={player.id} className={`flex flex-col items-center ${order} ${scale} transition-transform`}>
        <div className="relative mb-2">
          <div className="w-20 h-20 rounded-full bg-white border-4 border-white shadow-lg flex items-center justify-center text-4xl overflow-hidden relative z-10">
            {player.avatar}
          </div>
          <div className="absolute -top-6 left-1/2 transform -translate-x-1/2">
             {position === 1 && <span className="text-4xl drop-shadow-md">👑</span>}
          </div>
        </div>
        
        <div className="text-white font-bold text-lg mb-1 drop-shadow-md">{player.username}</div>
        <div className="text-purple-200 font-bold text-sm mb-2">{player.score} pts</div>
        
        <div className={`${height} w-24 ${color} rounded-t-lg shadow-2xl flex items-end justify-center pb-4 border-b-8 border-black/10`}>
          <span className="text-4xl font-black text-white/50">{label}</span>
        </div>
      </div>
    );
  };

  return (
    <div className="flex-1 overflow-hidden flex flex-col items-center p-4 w-full max-w-4xl mx-auto">
      <header className="text-center mb-6">
        <h1 className="text-4xl font-black text-white drop-shadow-lg mb-2">LEADERBOARD</h1>
        
        {/* Timeframe Toggle */}
        <div className="inline-flex bg-black/20 p-1 rounded-xl">
          <button 
            onClick={() => setTimeframe('WEEKLY')}
            className={`px-6 py-2 rounded-lg font-bold transition-all ${timeframe === 'WEEKLY' ? 'bg-white text-purple-600 shadow-md' : 'text-purple-200 hover:text-white'}`}
          >
            Weekly
          </button>
          <button 
            onClick={() => setTimeframe('ALL_TIME')}
            className={`px-6 py-2 rounded-lg font-bold transition-all ${timeframe === 'ALL_TIME' ? 'bg-white text-purple-600 shadow-md' : 'text-purple-200 hover:text-white'}`}
          >
            All Time
          </button>
        </div>
      </header>

      {/* Podium */}
      <div className="flex items-end justify-center gap-4 mb-8 w-full px-4">
        {/* We need to map manually to ensure correct order in flex: 2nd, 1st, 3rd */}
        {top3.length > 1 && renderPodiumPlace(top3[1], 2)}
        {top3.length > 0 && renderPodiumPlace(top3[0], 1)}
        {top3.length > 2 && renderPodiumPlace(top3[2], 3)}
      </div>

      {/* List */}
      <div className="w-full bg-white/10 backdrop-blur-md rounded-3xl border border-white/20 p-4 shadow-xl flex-1 overflow-y-auto custom-scrollbar">
        {rest.map((player) => (
          <div 
            key={player.id} 
            className={`flex items-center p-4 mb-2 rounded-2xl border-b-4 transition-transform hover:scale-[1.01] ${player.username === currentUser.username ? 'bg-yellow-100 border-yellow-300' : 'bg-white/80 border-gray-200'}`}
          >
            <div className="w-8 font-black text-gray-400 text-xl">{player.rank}</div>
            <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center text-2xl mr-4 border-2 border-white shadow-sm">
              {player.avatar}
            </div>
            <div className="flex-1">
              <div className="font-bold text-gray-800 text-lg">{player.username}</div>
              <div className="text-xs text-gray-500 font-bold uppercase">Beginner League</div>
            </div>
            <div className="font-black text-purple-600 text-xl">{player.score} pts</div>
          </div>
        ))}
      </div>
    </div>
  );
};