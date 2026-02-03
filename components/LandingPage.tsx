import React from 'react';
import { Button } from './Button';

interface LandingPageProps {
  onStart: () => void;
  isLoggedIn: boolean;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onStart, isLoggedIn }) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-full p-6 text-center animate-fade-in-up">
      <div className="max-w-4xl space-y-8 mt-4">
        
        {/* Hero Title */}
        <div className="relative inline-block mb-4">
            <div className="absolute inset-0 bg-yellow-400 rotate-3 rounded-3xl blur-sm opacity-50"></div>
            <div className="relative bg-white text-purple-900 p-8 rounded-3xl border-b-8 border-gray-200 shadow-xl">
                 <span className="text-6xl md:text-8xl block mb-2">👋</span>
                 <h1 className="text-5xl md:text-7xl font-black tracking-tight leading-tight">
                  Learn to <br/>
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500">
                    Sign & Play
                  </span>
                </h1>
            </div>
        </div>
        
        <p className="text-xl md:text-2xl text-purple-100 font-bold max-w-2xl mx-auto drop-shadow-sm">
          The interactive AI game that teaches you American Sign Language in real-time!
        </p>
        
        <div className="flex flex-col sm:flex-row items-center justify-center gap-6 mt-10">
          <Button onClick={onStart} variant="warning" className="px-12 py-5 text-xl shadow-[0_6px_0_rgb(202,138,4)]">
            {isLoggedIn ? 'PLAY NOW ▶' : 'START GAME'}
          </Button>
        </div>

        {/* Feature Cards - Floating */}
        <div className="grid md:grid-cols-3 gap-6 mt-16 text-left">
          {/* Card 1 */}
          <div className="group p-6 bg-red-500 rounded-3xl border-b-8 border-red-700 text-white transform hover:-translate-y-2 transition-transform shadow-lg">
            <div className="bg-white/20 w-14 h-14 rounded-2xl flex items-center justify-center text-3xl mb-4 group-hover:rotate-12 transition-transform">📸</div>
            <h3 className="text-xl font-extrabold mb-2">Camera On</h3>
            <p className="font-semibold opacity-90">We use your webcam to see your hand movements instantly.</p>
          </div>

          {/* Card 2 */}
          <div className="group p-6 bg-blue-500 rounded-3xl border-b-8 border-blue-700 text-white transform hover:-translate-y-2 transition-transform shadow-lg md:-mt-8">
            <div className="bg-white/20 w-14 h-14 rounded-2xl flex items-center justify-center text-3xl mb-4 group-hover:-rotate-12 transition-transform">🤖</div>
            <h3 className="text-xl font-extrabold mb-2">AI Judge</h3>
            <p className="font-semibold opacity-90">Powered by Gemini 2.0 to grade your signs with magic accuracy.</p>
          </div>

          {/* Card 3 */}
          <div className="group p-6 bg-green-500 rounded-3xl border-b-8 border-green-700 text-white transform hover:-translate-y-2 transition-transform shadow-lg">
            <div className="bg-white/20 w-14 h-14 rounded-2xl flex items-center justify-center text-3xl mb-4 group-hover:rotate-12 transition-transform">🏆</div>
            <h3 className="text-xl font-extrabold mb-2">Score High</h3>
            <p className="font-semibold opacity-90">Earn 3 stars on every word to climb the leaderboard!</p>
          </div>
        </div>
      </div>
    </div>
  );
};