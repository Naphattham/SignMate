import React from 'react';
import { useNavigate } from 'react-router-dom';
import { CATEGORIES } from '../../constants';
import { UserProgress } from '../../types';

interface CategoriesProps {
  userProgress: UserProgress;
}

export default function Categories({ userProgress }: CategoriesProps) {
  const navigate = useNavigate();

  const handleSelectCategory = (categoryId: string) => {
    navigate(`/category/${categoryId}`);
  };

  // Array of card colors for cycling
  const colors = [
    { bg: 'bg-red-500', border: 'border-red-700', shadow: 'shadow-red-900/20' },
    { bg: 'bg-blue-500', border: 'border-blue-700', shadow: 'shadow-blue-900/20' },
    { bg: 'bg-green-500', border: 'border-green-700', shadow: 'shadow-green-900/20' },
  ];

  return (
    <div className="p-6 max-w-6xl mx-auto flex-1 w-full overflow-y-auto">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
        <div className="bg-white/10 backdrop-blur-sm p-6 rounded-3xl border border-white/20">
          <h1 className="text-4xl font-black text-white drop-shadow-md">Dashboard</h1>
          <p className="text-purple-100 font-bold">Pick a challenge to earn stars!</p>
        </div>
        <div className="flex items-center gap-4 bg-white/10 backdrop-blur-sm p-4 rounded-3xl border border-white/20">
          <div className="text-4xl">⭐</div>
          <div>
            <span className="block text-3xl font-black text-yellow-300 drop-shadow-sm">
              {Object.values(userProgress.stars).reduce((a: number, b: number) => a + b, 0)}
            </span>
            <span className="text-white text-xs font-bold uppercase tracking-widest">Total Stars</span>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {CATEGORIES.map((cat, idx) => {
          const color = colors[idx % colors.length];
          return (
            <button
              key={cat.id}
              onClick={() => handleSelectCategory(cat.id)}
              className={`group relative overflow-hidden ${color.bg} border-b-8 ${color.border} rounded-[2rem] p-8 text-left transition-transform duration-200 hover:-translate-y-2 active:translate-y-1 active:border-b-4 shadow-xl flex flex-col gap-4`}
            >
              <div className="bg-white/20 w-20 h-20 rounded-3xl flex items-center justify-center text-5xl shadow-inner mb-2 group-hover:scale-110 transition-transform duration-300">
                {cat.icon}
              </div>
              <div>
                <h3 className="text-3xl font-black text-white mb-1 drop-shadow-sm">{cat.thaiTitle}</h3>
                <h4 className="text-lg text-white/80 font-bold uppercase tracking-wider">{cat.title}</h4>
              </div>
              <p className="text-sm text-white font-medium opacity-90">{cat.description}</p>
            </button>
          );
        })}
      </div>
    </div>
  );
}
