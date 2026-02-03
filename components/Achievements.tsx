import React from 'react';
import { Badge } from '../types';
import { BADGES } from '../constants';

interface AchievementsProps {
  unlockedBadgeIds: string[];
}

export const Achievements: React.FC<AchievementsProps> = ({ unlockedBadgeIds }) => {
  return (
    <div className="p-6 max-w-5xl mx-auto flex-1 w-full overflow-y-auto">
      <header className="text-center mb-10">
        <h1 className="text-4xl font-black text-white drop-shadow-md mb-2">ACHIEVEMENTS</h1>
        <p className="text-purple-200 font-bold text-lg">Collect badges by mastering signs!</p>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {BADGES.map((badge) => {
          const isUnlocked = unlockedBadgeIds.includes(badge.id);
          
          return (
            <div 
              key={badge.id}
              className={`relative p-6 rounded-[2rem] border-b-8 flex flex-col items-center text-center transition-all duration-300
                ${isUnlocked 
                  ? 'bg-white border-yellow-400 shadow-xl scale-100' 
                  : 'bg-purple-800/40 border-purple-900 shadow-none grayscale opacity-60'
                }`}
            >
              {/* Icon Circle */}
              <div className={`w-24 h-24 rounded-full flex items-center justify-center text-5xl mb-4 shadow-inner 
                 ${isUnlocked ? 'bg-yellow-100 animate-bounce-slow' : 'bg-gray-700'}`}>
                {badge.icon}
              </div>

              <h3 className={`text-xl font-black mb-1 ${isUnlocked ? 'text-gray-800' : 'text-gray-400'}`}>
                {badge.title}
              </h3>
              
              <p className={`text-sm font-bold leading-tight ${isUnlocked ? 'text-gray-500' : 'text-gray-500'}`}>
                {badge.description}
              </p>

              {!isUnlocked && (
                <div className="absolute top-4 right-4 text-2xl opacity-50">🔒</div>
              )}
              
              {isUnlocked && (
                <div className="absolute -top-3 -right-3 bg-red-500 text-white text-xs font-black px-3 py-1 rounded-full transform rotate-12 shadow-md">
                   UNLOCKED!
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};