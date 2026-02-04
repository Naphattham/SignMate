import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { CATEGORIES } from '../../constants';
import { UserProgress } from '../../types';
import { Button } from '../../components/Button';
import { StarRating } from '../../components/StarRating';

interface LevelSelectProps {
  userProgress: UserProgress;
}

export default function LevelSelect({ userProgress }: LevelSelectProps) {
  const navigate = useNavigate();
  const { categoryId } = useParams<{ categoryId: string }>();

  const selectedCategory = CATEGORIES.find(cat => cat.id === categoryId);

  if (!selectedCategory) {
    return (
      <div className="flex items-center justify-center flex-1">
        <div className="text-white text-2xl font-bold">Category not found</div>
      </div>
    );
  }

  const handleSelectLevel = (levelId: string) => {
    const isUnlocked = userProgress.unlockedLevelIds.includes(levelId);
    if (isUnlocked) {
      navigate(`/practice/${categoryId}/${levelId}`);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto flex-1 w-full overflow-y-auto">
      <Button onClick={() => navigate('/categories')} variant="secondary" className="mb-8">
        ← BACK TO MENU
      </Button>
      
      <div className="flex items-center gap-6 mb-10 bg-white p-6 rounded-[2rem] shadow-xl border-b-8 border-gray-200">
        <div className="bg-purple-100 w-24 h-24 rounded-3xl flex items-center justify-center text-6xl">
          {selectedCategory.icon}
        </div>
        <div>
          <h1 className="text-4xl font-black text-gray-800">{selectedCategory.thaiTitle}</h1>
          <p className="text-gray-500 font-bold text-lg">{selectedCategory.title}</p>
        </div>
      </div>

      <div className="space-y-4">
        {selectedCategory.levels.map((level, index) => {
          const isUnlocked = userProgress.unlockedLevelIds.includes(level.id);
          const stars = userProgress.stars[level.id] || 0;
          
          return (
            <div 
              key={level.id}
              onClick={() => handleSelectLevel(level.id)}
              className={`relative flex items-center p-6 rounded-3xl border-b-8 transition-all duration-200 
                ${isUnlocked 
                  ? 'bg-white border-gray-200 hover:border-purple-300 cursor-pointer hover:-translate-y-1 shadow-lg' 
                  : 'bg-purple-800/50 border-purple-900 cursor-not-allowed opacity-70'
                }`}
            >
              <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-black mr-6 shadow-inner ${isUnlocked ? 'bg-purple-600 text-white' : 'bg-gray-700 text-gray-500'}`}>
                {index + 1}
              </div>

              <div className="flex-1">
                <h3 className={`text-2xl font-black ${isUnlocked ? 'text-gray-800' : 'text-gray-300'}`}>{level.thaiWord}</h3>
                <p className={`text-sm font-bold uppercase tracking-wider ${isUnlocked ? 'text-gray-400' : 'text-gray-500'}`}>{level.word}</p>
              </div>

              <div className="flex flex-col items-end gap-2">
                {isUnlocked ? (
                  <>
                    <StarRating stars={stars} size="md" />
                    <span className={`text-xs font-black px-3 py-1 rounded-full uppercase tracking-wide ${
                      level.difficulty === 'Easy' ? 'bg-green-100 text-green-700' : 
                      level.difficulty === 'Medium' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'
                    }`}>
                      {level.difficulty}
                    </span>
                  </>
                ) : (
                  <span className="bg-gray-700 text-gray-400 px-4 py-2 rounded-xl font-bold text-xs uppercase">Locked 🔒</span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
