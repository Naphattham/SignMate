import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from './Button';
import logo from '../src/assets/images/LOGO SignMate.png';

interface NavbarProps {
  isLoggedIn: boolean;
  username?: string;
  onLogout: () => void;
  setIsPageLoading?: (loading: boolean) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ isLoggedIn, username, onLogout, setIsPageLoading }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const handlePlayClick = () => {
    if (setIsPageLoading) {
      setIsPageLoading(true);
      setTimeout(() => {
        navigate('/categories');
        setIsPageLoading(false);
      }, 3000);
    } else {
      navigate('/categories');
    }
  };

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
            <img src={logo} alt="SignMate Logo" className="w-8 h-8 object-contain" />
          </div>
          <span className="text-2xl font-black text-white tracking-tight drop-shadow-md hidden md:block">
            SignMate
          </span>
        </div>

        {/* Links */}
        <div className="flex items-center gap-1 md:gap-2">
          <button onClick={() => navigate('/')} className={getLinkClass('/')}>
            Home
          </button>
          
          {isLoggedIn && (
            <>
              <button onClick={handlePlayClick} className={getLinkClass('/categories')}>
                Play
              </button>
              <button onClick={() => navigate('/leaderboard')} className={getLinkClass('/leaderboard')}>
                <span className="mr-1">🏆</span><span className="hidden sm:inline">Rank</span>
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