import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Trophy, LogOut } from 'lucide-react';
import { type User as FirebaseUser, dbHelpers } from '../services/firebase';
import logoSignMate from '/src/assets/images/LOGO_SignMate.png';
import trophyImage from '/src/assets/images/Trophy.png';
import ProfileCard from './ProfileCard';

interface NavbarProps {
  totalStars: number;
  user: FirebaseUser | null;
  onLogout?: () => void;
  showBackButton?: boolean;
  onBack?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ 
  totalStars, 
  user, 
  onLogout, 
  showBackButton = false,
  onBack 
}) => {
  const navigate = useNavigate();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showProfileEdit, setShowProfileEdit] = useState(false);
  const [username, setUsername] = useState('USER');
  const [avatarUrl, setAvatarUrl] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const menuRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load user profile from Firebase
  useEffect(() => {
    const loadUserProfile = async () => {
      if (!user?.uid) {
        setLoading(false);
        return;
      }

      try {
        const result = await dbHelpers.readData(`users/${user.uid}/profile`);
        if (result.success && result.data) {
          setUsername(result.data.username || user?.email?.split('@')[0].toUpperCase() || 'USER');
          setAvatarUrl(result.data.avatar || '');
        } else {
          // Use email as fallback if no profile exists
          setUsername(user?.email?.split('@')[0].toUpperCase() || 'USER');
        }
      } catch (error) {
        console.error('Error loading user profile:', error);
        setUsername(user?.email?.split('@')[0].toUpperCase() || 'USER');
      } finally {
        setLoading(false);
      }
    };

    loadUserProfile();

    // Listen for profile updates
    const handleProfileUpdate = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail?.userId === user?.uid) {
        loadUserProfile();
      }
    };

    window.addEventListener('profileUpdated', handleProfileUpdate);

    return () => {
      window.removeEventListener('profileUpdated', handleProfileUpdate);
    };
  }, [user?.uid, user?.email]);

  // Get avatar URL with fallback
  const getAvatarUrl = () => {
    if (avatarUrl) return avatarUrl; // Custom uploaded image from Firebase
    if (user?.photoURL) return user.photoURL; // Google photo
    if (user?.email) return `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.email}`; // Generated
    return 'https://api.dicebear.com/7.x/avataaars/svg?seed=User'; // Default
  };

  const displayAvatar = getAvatarUrl();

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleLogout = () => {
    if (onLogout) {
      onLogout();
    }
    navigate('/');
  };

  const handleSave = async () => {
    if (!user?.uid) return;

    try {
      // Save to Firebase
      const profileData = {
        username: username,
        avatar: avatarUrl || '',
        lastUpdated: new Date().toISOString()
      };

      const result = await dbHelpers.updateData(`users/${user.uid}/profile`, profileData);
      
      if (result.success) {
        // Dispatch event to notify other components
        const event = new CustomEvent('profileUpdated', {
          detail: { userId: user.uid }
        });
        window.dispatchEvent(event);
        
        setShowProfileEdit(false);
      } else {
        console.error('Failed to save profile:', result.error);
      }
    } catch (error) {
      console.error('Error saving profile:', error);
    }
  };

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowProfileMenu(false);
        setShowProfileEdit(false);
      }
    };

    if (showProfileMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showProfileMenu]);

  return (
    <>
    {/* Backdrop Blur Overlay - covers card area only */}
    {showProfileMenu && (
      <div 
        className="absolute inset-0 backdrop-blur-sm z-30 rounded-[3rem]"
        style={{ margin: '-8rem -12rem', padding: '8rem 12rem' }}
        onClick={() => {
          setShowProfileMenu(false);
          setShowProfileEdit(false);
        }}
      />
    )}
    
    <header className="relative flex justify-end items-center mb-6 z-40">
      {/* Back Button (Optional) */}
      {showBackButton && (
        <button
          onClick={onBack}
          className="
            group
            absolute left-0
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
      )}

      {/* Logo Title - อยู่ตรงกลาง */}
      <div className="absolute left-1/2 transform -translate-x-1/2 flex items-end gap-3">
        <div className="relative">
          <img src={logoSignMate} alt="SignMate Logo" className="w-16 h-16" />
        </div>
        <h1 className="text-4xl md:text-5xl font-black text-gray-900 tracking-tight" style={{ fontFamily: 'monospace, sans-serif' }}>
          SignMate
        </h1>
      </div>

      {/* Icon ด้านขวา (ถ้วยรางวัล + โปรไฟล์) */}
      <div className="flex items-center gap-4">
        <button 
          onClick={() => navigate('/leaderboard')}
          className="flex flex-col items-center justify-center cursor-pointer hover:scale-105 transition-transform"
        >
          <img src={trophyImage} alt="Trophy" className="w-8 h-8" />
          {/* <div className="h-1 w-8 bg-yellow-700 rounded-full"></div> */}
          {/* <span className="text-xs font-bold text-gray-800 mt-1">{totalStars}</span> */}
        </button>
        <div className="h-8 w-[2px] bg-gray-300 mx-2"></div>
        <div className="relative" ref={menuRef}>
          {/* --- ปุ่ม Trigger (รูป Profile) --- */}
          <button 
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="flex items-center justify-center w-12 h-12 rounded-full bg-blue-100 border-2 border-transparent hover:border-red-400 transition-all focus:outline-none"
          >
            {/* Avatar Image */}
            <img 
              src={displayAvatar} 
              alt="User Avatar" 
              className="w-full h-full rounded-full object-cover"
            />
          </button>
          
          {/* --- Dropdown Menu --- */}
          {showProfileMenu && (
            <div 
              className="absolute right-0 mt-3 w-80 bg-[#F08E88] rounded-[1.2rem] shadow-xl p-4 z-50 animate-fade-in-up origin-top-right border-2 border-white/20"
              style={{ fontFamily: '"VT323", monospace' }}
            >
              {!showProfileEdit ? (
                <>
                  {/* Header: HI, USERNAME! */}
                  <div className="mb-3 pl-1">
                    <h3 className="text-white text-lg tracking-widest uppercase drop-shadow-md">
                      HI, {username}!
                    </h3>
                  </div>

                  {/* Menu Items */}
                  <div className="flex flex-col gap-2">
                    
                    {/* Item 1: Profile */}
                    <button 
                      onClick={() => setShowProfileEdit(true)}
                      className="flex items-center gap-3 group cursor-pointer hover:bg-white/10 p-2 rounded-lg transition-colors w-full text-left"
                    >
                      <div className="w-7 h-7 bg-[#FACC15] rounded-full flex items-center justify-center border-2 border-[#Eab308] overflow-hidden">
                        <img 
                          src={displayAvatar} 
                          alt="Profile" 
                          className="w-full h-full rounded-full object-cover"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.email || 'User'}`;
                          }}
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
                </>
              ) : (
                <>
                  {/* Profile Edit Form */}
                  <style>
                    {`
                      @import url('https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap');
                    `}
                  </style>
                  
                  {/* Header with Back Button */}
                  <div className="flex items-center justify-between mb-4">
                    <button 
                      onClick={() => setShowProfileEdit(false)}
                      className="text-white hover:text-black transition-colors"
                    >
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M19 12H5M12 19l-7-7 7-7"/>
                      </svg>
                    </button>
                    <h2 className="text-white text-base font-bold tracking-wider">PROFILE</h2>
                    <div className="w-5"></div>
                  </div>

                  {/* Avatar Section */}
                  <div className="flex justify-center mb-4">
                    <div className="relative">
                      <div className="w-24 h-24 bg-[#FAD556] rounded-full flex items-center justify-center overflow-hidden">
                        <img 
                          src={displayAvatar} 
                          alt="Avatar" 
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.email || 'User'}`;
                          }}
                        />
                      </div>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleAvatarChange}
                        className="hidden"
                      />
                      <div 
                        onClick={() => fileInputRef.current?.click()}
                        className="absolute bottom-0 right-0 bg-black rounded-lg p-1.5 cursor-pointer border-2 border-black hover:bg-gray-800 transition-colors"
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#F08080" strokeWidth="2">
                          <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path>
                          <circle cx="12" cy="13" r="4"></circle>
                        </svg>
                      </div>
                    </div>
                  </div>

                  {/* Username Input */}
                  <div className="mb-4">
                    <label className="block text-white text-xs font-bold mb-2 tracking-wider">USERNAME</label>
                    <input 
                      type="text" 
                      value={username} 
                      onChange={(e) => setUsername(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border-none bg-[#FFF5E6] text-gray-700 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-white/50"
                      style={{ fontFamily: 'monospace' }}
                    />
                  </div>

                  {/* Save Button */}
                  <button 
                    onClick={handleSave}
                    className="w-full bg-[#EBCFB6] hover:bg-[#D4B89E] text-black font-bold py-2.5 px-4 rounded-xl transition-colors text-sm tracking-wider"
                  >
                    SAVE
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
    </>
  );
};