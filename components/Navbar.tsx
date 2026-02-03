import React from 'react';
import { Button } from './Button';
import { AppView } from '../types';

interface NavbarProps {
  isLoggedIn: boolean;
  username?: string;
  onNavigate: (view: AppView) => void;
  onLogout: () => void;
  currentView: AppView;
}

export const Navbar: React.FC<NavbarProps> = ({ isLoggedIn, username, onNavigate, onLogout, currentView }) => {
  const getLinkClass = (view: AppView) => 
    `px-4 py-2 rounded-xl font-bold transition-all ${currentView === view ? 'bg-white text-purple-600 shadow-sm' : 'text-white hover:bg-white/10'}`;

  return (
    <nav className="pt-4 px-6 relative z-50">
      <div className="max-w-7xl mx-auto flex justify-between items-center bg-white/10 backdrop-blur-md border border-white/20 rounded-3xl p-3 shadow-lg">
        {/* Logo */}
        <div 
          onClick={() => onNavigate(AppView.HOME)} 
          className="cursor-pointer flex items-center gap-2 group ml-2"
        >
          <div className="bg-white p-2 rounded-xl shadow-sm group-hover:rotate-12 transition-transform duration-300">
            <span className="text-2xl">🤟</span>
          </div>
          <span className="text-2xl font-black text-white tracking-tight drop-shadow-md hidden md:block">
            SignLingo
          </span>
        </div>

        {/* Links */}
        <div className="flex items-center gap-1 md:gap-2">
          <button onClick={() => onNavigate(AppView.HOME)} className={getLinkClass(AppView.HOME)}>
            Home
          </button>
          
          {isLoggedIn && (
            <>
              <button onClick={() => onNavigate(AppView.CATEGORIES)} className={getLinkClass(AppView.CATEGORIES)}>
                Play
              </button>
              <button onClick={() => onNavigate(AppView.LEADERBOARD)} className={getLinkClass(AppView.LEADERBOARD)}>
                <span className="mr-1">🏆</span><span className="hidden sm:inline">Rank</span>
              </button>
              <button onClick={() => onNavigate(AppView.ACHIEVEMENTS)} className={getLinkClass(AppView.ACHIEVEMENTS)}>
                <span className="mr-1">🎖️</span><span className="hidden sm:inline">Badges</span>
              </button>
            </>
          )}

          <div className="h-6 w-px bg-white/20 mx-2"></div>

          {isLoggedIn ? (
            <div className="flex items-center gap-3">
              <div className="hidden lg:flex flex-col items-end leading-tight">
                 <span className="text-white font-bold text-sm">{username}</span>
                 <span className="text-purple-200 text-xs font-bold">Player</span>
              </div>
              <Button onClick={onLogout} variant="danger" className="py-2 px-4 text-sm">
                Exit
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Button 
                onClick={() => onNavigate(AppView.LOGIN)} 
                variant="warning" 
                className="py-2 px-4 text-sm"
              >
                Login
              </Button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};