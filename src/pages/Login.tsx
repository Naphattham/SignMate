import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/Button';
import { authHelpers, type User } from '../../services/firebase';

interface LoginProps {
  user: User | null;
}

export default function Login({ user }: LoginProps) {
  const navigate = useNavigate();
  const [isSignup, setIsSignup] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Redirect if already logged in
  React.useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

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
        // User state will be updated by onAuthStateChanged in App
        navigate('/');
      } else {
        setError(result.error || 'Failed to sign up');
      }
    } else {
      const result = await authHelpers.signInWithEmail(email, password);
      if (result.success) {
        navigate('/');
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
      navigate('/');
    } else {
      setError(result.error || 'Failed to sign in with Google');
    }

    setLoading(false);
  };

  return (
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
                <label className="block text-sm font-extrabold text-gray-700 mb-1 ml-1 uppercase">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  disabled={loading}
                  className="w-full px-5 py-4 bg-gray-50 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-0 focus:outline-none text-gray-900 font-bold text-lg placeholder-gray-400 transition-colors disabled:opacity-50"
                />
              </div>
              <div>
                <label className="block text-sm font-extrabold text-gray-700 mb-1 ml-1 uppercase">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  disabled={loading}
                  className="w-full px-5 py-4 bg-gray-50 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-0 focus:outline-none text-gray-900 font-bold text-lg placeholder-gray-400 transition-colors disabled:opacity-50"
                />
              </div>

              <Button type="submit" fullWidth variant="primary" className="mt-2 text-lg" disabled={loading}>
                {loading ? "Loading..." : (isSignup ? "Sign Up" : "Let's Go!")}
              </Button>
            </form>

            <div className="flex items-center gap-3 my-6">
              <div className="flex-1 h-px bg-gray-300"></div>
              <span className="text-gray-500 font-bold text-sm">OR</span>
              <div className="flex-1 h-px bg-gray-300"></div>
            </div>

            <button
              onClick={handleGoogleSignIn}
              disabled={loading}
              className="w-full flex items-center justify-center gap-3 px-5 py-4 bg-white border-2 border-gray-200 rounded-xl hover:border-purple-500 hover:bg-gray-50 transition-all font-bold text-gray-700 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg className="w-6 h-6" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              {loading ? "Loading..." : "Continue with Google"}
        </button>

        <div className="mt-8 text-center">
          <button 
            onClick={() => {
              setIsSignup(!isSignup);
              setError('');
              setPassword('');
            }}
            disabled={loading}
            className="text-purple-600 hover:text-purple-800 font-extrabold hover:underline focus:outline-none disabled:opacity-50"
          >
            {isSignup ? "Wait, I have an account!" : "I need a new account!"}
          </button>
        </div>
      </div>
    </div>
  );
}
