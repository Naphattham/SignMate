import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from './Button';

interface NavbarProps {
  isLoggedIn: boolean;
  username?: string;
  onLogout: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ isLoggedIn, username, onLogout }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const getLinkClass = (path: string) => 
    `px-4 py-2 rounded-xl font-bold transition-all ${location.pathname === path ? 'bg-white text-purple-600 shadow-sm' : 'text-white hover:bg-white/10'}`;

  return (
    <nav className="pt-4 px-6 relative z-50">
      <div className="max-w-7xl mx-auto flex justify-between items-center bg-white/10 backdrop-blur-md border border-white/20 rounded-3xl p-3 shadow-lg">
        {/* Logo */}
        <div 
          onClick={() => navigate('/')} 
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
          <button onClick={() => navigate('/')} className={getLinkClass('/')}>
            Home
          </button>
          
          {isLoggedIn && (
            <>
              <button onClick={() => navigate('/categories')} className={getLinkClass('/categories')}>
                Play
              </button>
              <button onClick={() => navigate('/leaderboard')} className={getLinkClass('/leaderboard')}>
                <span className="mr-1">🏆</span><span className="hidden sm:inline">Rank</span>
              </button>
              <button onClick={() => navigate('/achievements')} className={getLinkClass('/achievements')}>
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
                onClick={() => navigate('/login')} 
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