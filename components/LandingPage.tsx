import React, { useState } from 'react';
import { Play, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from './Button';
import { authHelpers } from '../services/firebase';
import logoSignMate from '/src/assets/images/LOGO_SignMate.png';

interface LandingPageProps {
  onStart: () => void;
  isLoggedIn: boolean;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onStart, isLoggedIn }) => {
  const navigate = useNavigate();
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [isSignup, setIsSignup] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email.trim() || !password.trim()) {
      setError('Please fill in all fields');
      return;
    }

    setLoading(true);

    if (isSignup) {
      const result = await authHelpers.signUpWithEmail(email, password);
      if (result.success) {
        setShowLoginModal(false);
        navigate('/categories');
      } else {
        setError(result.error || 'Failed to sign up');
      }
    } else {
      const result = await authHelpers.signInWithEmail(email, password);
      if (result.success) {
        setShowLoginModal(false);
        navigate('/categories');
      } else {
        setError(result.error || 'Invalid email or password');
      }
    }

    setLoading(false);
  };

  const handleGoogleSignIn = async () => {
    setError('');
    setLoading(true);

    const result = await authHelpers.signInWithGoogle();
    if (result.success) {
      setShowLoginModal(false);
      navigate('/categories');
    } else {
      setError(result.error || 'Failed to sign in with Google');
    }

    setLoading(false);
  };

  return (
    // Container หลัก (พื้นหลังสีแดง)
    <div className="min-h-screen bg-[#ef4848] flex items-center justify-center p-4 font-sans">

      {/* โหลด Font จาก Google Fonts */}
      <style>
        {`
          @import url('https://fonts.googleapis.com/css2?family=Kanit:wght@500;600&family=VT323&display=swap');
          
          .font-pixel {
            font-family: 'VT323', monospace;
          }
          .font-thai {
            font-family: 'Kanit', sans-serif;
          }
        `}
      </style>

      {/* การ์ดสีครีมตรงกลาง */}
      <div className="relative bg-[#FFF9F0] w-full max-w-7xl aspect-[16/10] md:aspect-video rounded-[3rem] border-2 border-black shadow-2xl flex flex-col items-center justify-center overflow-hidden">

        {/* ปุ่ม Login (มุมขวาบน) */}
        <button
          onClick={() => setShowLoginModal(true)}
          className="absolute top-6 right-8 md:top-10 md:right-12 bg-[#EECD56] hover:bg-[#FFE066] text-black border-b-4 border-r-4 border-[#C4A334] active:border-0 active:translate-y-1 transition-all rounded-xl px-6 py-2 font-pixel text-2xl tracking-wide z-20"
        >
          LOGIN
        </button>

        {/* ส่วนเนื้อหาตรงกลาง */}
        <div className={`flex flex-col items-center z-10 mt-8 transition-opacity duration-300 ${showLoginModal ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>

          {/* Logo Section */}
          <div className="relative mb-6 flex items-center justify-center font-pixel text-8xl md:text-9xl text-black tracking-widest drop-shadow-[4px_4px_0_rgba(0,0,0,0.2)]">
            {/* ส่วนแรกของคำว่า SignM */}
            SignM
            {/* ส่วนที่มีไอคอนอยู่บนตัว a */}
            <div className="relative inline-block">
              <span className="relative z-10">a</span>
              {/* Logo SignMate */}
              <div className="absolute -top-20 left-1/2 -translate-x-1/2 drop-shadow-md z-20 flex flex-col items-center">
                <img src={logoSignMate} alt="SignMate Logo" className="w-48 h-48 object-contain" />
              </div>
            </div>
            {/* ส่วนที่เหลือของคำว่า te */}
            te
          </div>

          {/* กล่องข้อความภาษาไทย */}
          <div className="bg-white rounded-[3rem] px-16 py-10 mb-10 shadow-lg text-center">
            <h2 className="font-thai text-[#4255A3] text-5xl md:text-7xl font-semibold leading-tight">
              ภาษามือ <br />
              ใครว่ายาก?
            </h2>
          </div>

          {/* ปุ่ม Start Game */}
          <button
            onClick={() => setShowLoginModal(true)}
            className="group relative bg-[#EECD56] hover:bg-[#FFE066] text-black border-b-[6px] border-r-[6px] border-[#C4A334] active:border-0 active:translate-y-1 transition-all rounded-2xl px-10 py-4 flex items-center gap-3"
          >
            <span className="font-pixel text-3xl tracking-wider">START GAME</span>
            <div className="bg-transparent border-2 border-black rounded-full p-1 group-hover:scale-110 transition-transform">
              <Play fill="black" size={20} />
            </div>
          </button>

        </div>

        {/* ตกแต่งพื้นหลังเล็กน้อย (Optional: เพื่อให้ดูไม่เรียบเกินไปตามสไตล์ Pixel) */}
        <div className="absolute inset-0 opacity-5 pointer-events-none bg-[radial-gradient(#000_1px,transparent_1px)] [background-size:16px_16px]"></div>

        {/* Login Modal */}
        {showLoginModal && (
          <div className="absolute inset-0 flex items-center justify-center p-4 z-30 animate-fade-in backdrop-blur-md bg-black bg-opacity-20 overflow-y-auto">
            {/* 1. เพิ่ม flex flex-col เพื่อให้จัดแนวตั้ง
       2. เพิ่ม justify-between เพื่อกระจายเนื้อหา บน-ล่าง ให้เต็ม min-h
    */}
            <div className="relative bg-white w-full max-w-md py-12 px-8 min-h-[600px] rounded-[2rem] shadow-2xl border-b-8 border-gray-200 animate-fade-in-up flex flex-col justify-between">

              {/* ปุ่มปิด: ปรับตำแหน่งให้ห่างขอบอีกนิดเพื่อให้เข้ากับความมน */}
              <button
                onClick={() => {
                  setShowLoginModal(false);
                  setError('');
                  setEmail('');
                  setPassword('');
                }}
                className="absolute top-5 right-5 text-gray-400 hover:text-gray-600 transition-colors z-10"
              >
                <X size={24} />
              </button>

              {/* --- ส่วนบน: Header + Form (ใส่ w-full เพื่อความชัวร์) --- */}
              <div className="w-full">
                <div className="text-center mb-4">
                  <span className="text-5xl">👋</span> {/* ขยาย Emoji หน่อย */}
                </div>
                <h1 className="text-3xl font-black text-gray-800 mb-2 text-center">
                  {isSignup ? "New Player?" : "Welcome Back!"}
                </h1>
                <p className="text-gray-500 text-center mb-6 font-bold text-sm">
                  {isSignup ? "Create a profile to start winning." : "Log in to continue your streak."}
                </p>

                {error && (
                  <div className="bg-red-100 border-l-4 border-red-500 text-red-700 px-3 py-2 rounded-lg mb-4 font-bold text-center text-sm">
                    {error}
                  </div>
                )}

                <form onSubmit={handleAuth} className="flex flex-col gap-4">
                  <div>
                    <label className="block text-xs font-extrabold text-gray-700 mb-1 ml-1 uppercase">Email</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="your@email.com"
                      disabled={loading}
                      className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-0 focus:outline-none text-gray-900 font-bold placeholder-gray-400 transition-colors disabled:opacity-50"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-extrabold text-gray-700 mb-1 ml-1 uppercase">Password</label>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      disabled={loading}
                      className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-0 focus:outline-none text-gray-900 font-bold placeholder-gray-400 transition-colors disabled:opacity-50"
                    />
                  </div>

                  <Button type="submit" fullWidth variant="primary" className="mt-2 py-3 text-lg shadow-lg" disabled={loading}>
                    {loading ? "Loading..." : (isSignup ? "Sign Up" : "Let's Go!")}
                  </Button>
                </form>
              </div>

              {/* --- ส่วนล่าง: Social + Toggle (จะถูกดันลงมาด้านล่างสุดเอง เพราะ justify-between) --- */}
              <div className="w-full mt-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex-1 h-px bg-gray-300"></div>
                  <span className="text-gray-400 font-bold text-xs uppercase">Or continue with</span>
                  <div className="flex-1 h-px bg-gray-300"></div>
                </div>

                <button
                  onClick={handleGoogleSignIn}
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-white border-2 border-gray-200 rounded-xl hover:border-purple-500 hover:bg-gray-50 transition-all font-bold text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed mb-4"
                >
                  {/* SVG Google */}
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                  </svg>
                  {loading ? "Loading..." : "Continue with Google"}
                </button>

                <div className="text-center">
                  <button
                    onClick={() => {
                      setIsSignup(!isSignup);
                      setError('');
                      setPassword('');
                    }}
                    disabled={loading}
                    className="text-purple-600 hover:text-purple-800 font-extrabold hover:underline focus:outline-none disabled:opacity-50 text-sm transition-all"
                  >
                    {isSignup ? "Wait, I have an account!" : "I need a new account!"}
                  </button>
                </div>
              </div>

            </div>
          </div>
        )}
      </div>
    </div>
  );
};