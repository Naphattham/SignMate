import React, { useState } from 'react';
import { AppView, Category, Level, UserProgress, Badge } from './types';
import { CATEGORIES, BADGES } from './constants';
import { Button } from './components/Button';
import { PracticeArena } from './components/PracticeArena';
import { StarRating } from './components/StarRating';
import { Navbar } from './components/Navbar';
import { LandingPage } from './components/LandingPage';
import { Leaderboard } from './components/Leaderboard';
import { Achievements } from './components/Achievements';

export default function App() {
  const [view, setView] = useState<AppView>(AppView.HOME);
  
  // Auth State
  const [isSignup, setIsSignup] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  // App Data State
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [selectedLevel, setSelectedLevel] = useState<Level | null>(null);
  const [userProgress, setUserProgress] = useState<UserProgress>({
    unlockedLevelIds: ['lvl_hello', 'lvl_yes', 'lvl_who'],
    stars: {},
    badges: [],
    totalScore: 0
  });

  const isLoggedIn = !!username && view !== AppView.LOGIN && view !== AppView.HOME;

  // --- Authentication Logic ---

  const handleAuth = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!username.trim() || !password.trim()) {
      setError('Please fill in all fields');
      return;
    }

    const users = JSON.parse(localStorage.getItem('signlingo_users') || '{}');

    if (isSignup) {
      if (users[username]) {
        setError('Username already exists');
        return;
      }
      
      users[username] = password;
      localStorage.setItem('signlingo_users', JSON.stringify(users));
      
      const initialProgress: UserProgress = {
        unlockedLevelIds: ['lvl_hello', 'lvl_yes', 'lvl_who'],
        stars: {},
        badges: [],
        totalScore: 0
      };
      localStorage.setItem(`signlingo_progress_${username}`, JSON.stringify(initialProgress));
      
      setUserProgress(initialProgress);
      setView(AppView.CATEGORIES);
    } else {
      if (users[username] && users[username] === password) {
        const savedProgress = localStorage.getItem(`signlingo_progress_${username}`);
        if (savedProgress) {
          setUserProgress(JSON.parse(savedProgress));
        } else {
          const initialProgress = {
            unlockedLevelIds: ['lvl_hello', 'lvl_yes', 'lvl_who'],
            stars: {},
            badges: [],
            totalScore: 0
          };
          setUserProgress(initialProgress);
        }
        setView(AppView.CATEGORIES);
      } else {
        setError('Invalid username or password');
      }
    }
  };

  const handleLogout = () => {
    setUsername('');
    setPassword('');
    setError('');
    setIsSignup(false);
    setView(AppView.HOME);
  };

  // --- Navigation & Gameplay Logic ---

  const handleNavigate = (targetView: AppView) => {
    if (targetView === AppView.CATEGORIES && !username) {
      setView(AppView.LOGIN);
    } else {
      setView(targetView);
    }
  };

  const handleStartFromLanding = () => {
    if (username) {
      setView(AppView.CATEGORIES);
    } else {
      setView(AppView.LOGIN);
    }
  };

  const handleSelectCategory = (cat: Category) => {
    setSelectedCategory(cat);
    setView(AppView.LEVEL_SELECT);
  };

  const handleSelectLevel = (lvl: Level) => {
    if (userProgress.unlockedLevelIds.includes(lvl.id)) {
      setSelectedLevel(lvl);
      setView(AppView.PRACTICE);
    }
  };

  const handleLevelComplete = (stars: number) => {
    if (selectedLevel) {
      const currentLevelIndex = selectedCategory?.levels.findIndex(l => l.id === selectedLevel.id) ?? -1;
      const nextLevel = selectedCategory?.levels[currentLevelIndex + 1];
      
      setUserProgress(prev => {
        const newUnlocked = [...prev.unlockedLevelIds];
        if (stars >= 2 && nextLevel && !newUnlocked.includes(nextLevel.id)) {
          newUnlocked.push(nextLevel.id);
        }
        
        // Update stars
        const newStars = {
          ...prev.stars,
          [selectedLevel.id]: Math.max(prev.stars[selectedLevel.id] || 0, stars)
        };

        // Calculate Total Score (Stars * 100)
        const newTotalScore = Object.values(newStars).reduce((acc, s) => acc + (s * 100), 0);

        // Check for new Badges
        const newBadges = [...(prev.badges || [])];
        
        // 1. First Win
        if (stars >= 2 && !newBadges.includes('badge_first_win')) {
           newBadges.push('badge_first_win');
        }
        // 2. Perfectionist
        if (stars === 3 && !newBadges.includes('badge_3_stars')) {
           newBadges.push('badge_3_stars');
        }
        // 3. Collector (3 unique levels completed)
        const passedCount = Object.values(newStars).filter(s => s >= 2).length;
        if (passedCount >= 3 && !newBadges.includes('badge_collector')) {
           newBadges.push('badge_collector');
        }
        // 4. Master (10 stars total)
        const totalStars = Object.values(newStars).reduce((a, b) => a + b, 0);
        if (totalStars >= 10 && !newBadges.includes('badge_master')) {
           newBadges.push('badge_master');
        }

        const newProgress = {
          unlockedLevelIds: newUnlocked,
          stars: newStars,
          badges: newBadges,
          totalScore: newTotalScore
        };

        localStorage.setItem(`signlingo_progress_${username}`, JSON.stringify(newProgress));
        return newProgress;
      });
    }
    setView(AppView.LEVEL_SELECT);
  };

  // --- Render Helpers ---

  const renderAuth = () => (
    <div className="flex flex-col items-center justify-center flex-1 p-6 animate-fade-in-up">
      <div className="w-full max-w-md bg-white p-8 rounded-[2rem] shadow-2xl border-b-8 border-gray-200">
        <div className="text-center mb-6">
          <span className="text-6xl">👋</span>
        </div>
        <h1 className="text-3xl font-black text-gray-800 mb-2 text-center">
          {isSignup ? "New Player?" : "Welcome Back!"}
        </h1>
        <p className="text-gray-500 text-center mb-6 font-bold">
          {isSignup ? "Create a profile to start winning." : "Log in to continue your streak."}
        </p>
        
        {error && (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 px-4 py-3 rounded-lg mb-4 font-bold text-center">
            {error}
          </div>
        )}
        
        <form onSubmit={handleAuth} className="flex flex-col gap-4">
          <div>
            <label className="block text-sm font-extrabold text-gray-700 mb-1 ml-1 uppercase">Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="e.g. SignMaster99"
              className="w-full px-5 py-4 bg-gray-50 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-0 focus:outline-none text-gray-900 font-bold text-lg placeholder-gray-400 transition-colors"
            />
          </div>
          <div>
            <label className="block text-sm font-extrabold text-gray-700 mb-1 ml-1 uppercase">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-5 py-4 bg-gray-50 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-0 focus:outline-none text-gray-900 font-bold text-lg placeholder-gray-400 transition-colors"
            />
          </div>

          <Button type="submit" fullWidth variant="primary" className="mt-2 text-lg">
            {isSignup ? "Sign Up" : "Let's Go!"}
          </Button>
        </form>

        <div className="mt-8 text-center">
          <button 
            onClick={() => {
              setIsSignup(!isSignup);
              setError('');
              setPassword('');
            }}
            className="text-purple-600 hover:text-purple-800 font-extrabold hover:underline focus:outline-none"
          >
            {isSignup ? "Wait, I have an account!" : "I need a new account!"}
          </button>
        </div>
      </div>
    </div>
  );

  const renderCategories = () => {
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
                <span className="block text-3xl font-black text-yellow-300 drop-shadow-sm">{Object.values(userProgress.stars).reduce((a: number, b: number) => a + b, 0)}</span>
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
                onClick={() => handleSelectCategory(cat)}
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
  };

  const renderLevelSelect = () => {
    if (!selectedCategory) return null;
    return (
      <div className="p-6 max-w-4xl mx-auto flex-1 w-full overflow-y-auto">
        <Button onClick={() => setView(AppView.CATEGORIES)} variant="secondary" className="mb-8">
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
                onClick={() => handleSelectLevel(level)}
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
  };

  return (
    <div className="h-full w-full flex flex-col bg-purple-600 relative overflow-hidden">
        {/* Background Patterns */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0 opacity-20">
            <div className="absolute top-10 left-10 w-64 h-64 bg-purple-400 rounded-full mix-blend-multiply filter blur-3xl animate-blob"></div>
            <div className="absolute top-10 right-10 w-64 h-64 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-2000"></div>
            <div className="absolute -bottom-32 left-20 w-80 h-80 bg-pink-400 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-4000"></div>
        </div>

      <Navbar 
        isLoggedIn={!!username} 
        username={username}
        onNavigate={handleNavigate}
        onLogout={handleLogout}
        currentView={view}
      />
      
      <main className="flex-1 overflow-hidden flex flex-col relative z-10">
        {view === AppView.HOME && <LandingPage onStart={handleStartFromLanding} isLoggedIn={!!username} />}
        {view === AppView.LOGIN && renderAuth()}
        {view === AppView.CATEGORIES && renderCategories()}
        {view === AppView.LEVEL_SELECT && renderLevelSelect()}
        {view === AppView.PRACTICE && selectedLevel && (
          <PracticeArena 
            level={selectedLevel} 
            onBack={() => setView(AppView.LEVEL_SELECT)}
            onComplete={handleLevelComplete}
          />
        )}
        {view === AppView.LEADERBOARD && (
          <Leaderboard currentUser={{
            id: username, 
            username: username, 
            score: userProgress.totalScore, 
            avatar: '😎' 
          }} />
        )}
        {view === AppView.ACHIEVEMENTS && (
          <Achievements unlockedBadgeIds={userProgress.badges || []} />
        )}
      </main>
    </div>
  );
}