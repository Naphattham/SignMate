import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/Button';
import { dbHelpers, auth } from '../../services/firebase';
import type { UserProfile } from '../../types';

interface ProfileProps {
  username: string;
  onUpdateUsername: (newUsername: string) => void;
  onLogout: () => void;
}

export default function Profile({ username, onUpdateUsername, onLogout }: ProfileProps) {
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [newUsername, setNewUsername] = useState(username);
  const [selectedAvatar, setSelectedAvatar] = useState('👤');
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const avatarOptions = ['👤', '😀', '😎', '🤓', '🥳', '🤩', '😇', '🤠', '🦸', '🧙', '🐱', '🐶', '🦊', '🐼'];

  // Load user profile from Firebase
  useEffect(() => {
    const loadUserProfile = async () => {
      const currentUser = auth.currentUser;
      if (currentUser) {
        const result = await dbHelpers.readData(`users/${currentUser.uid}/profile`);
        if (result.success && result.data) {
          setUserProfile(result.data);
          setNewUsername(result.data.username || username);
          setSelectedAvatar(result.data.avatar || '👤');
        } else {
          // Initialize new profile
          const initialProfile: UserProfile = {
            username: username || 'Player',
            avatar: '👤',
            lastUpdated: new Date().toLocaleString(),
            rank: 0,
            totalScore: 0,
            totalStars: 0
          };
          await dbHelpers.writeData(`users/${currentUser.uid}/profile`, initialProfile);
          setUserProfile(initialProfile);
        }
      }
      setLoading(false);
    };

    loadUserProfile();
  }, [username]);

  const handleSave = async () => {
    if (newUsername.trim()) {
      const currentUser = auth.currentUser;
      if (currentUser) {
        const updatedProfile: UserProfile = {
          ...userProfile!,
          username: newUsername.trim(),
          avatar: selectedAvatar,
          lastUpdated: new Date().toLocaleString()
        };
        
        const result = await dbHelpers.updateData(`users/${currentUser.uid}/profile`, updatedProfile);
        if (result.success) {
          setUserProfile(updatedProfile);
          onUpdateUsername(newUsername.trim());
          setIsEditing(false);
        }
      }
    }
  };

  return (
    <div className="flex-1 overflow-y-auto no-scrollbar p-6 max-w-4xl mx-auto w-full">
      <Button onClick={() => navigate('/categories')} variant="secondary" className="mb-8">
        ← BACK
      </Button>

      <div className="bg-white rounded-[2rem] shadow-xl border-b-8 border-gray-200 p-8">
        <h1 className="text-4xl font-black text-gray-800 mb-8 text-center">EDIT PROFILE</h1>

        {/* Avatar Section */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-32 h-32 bg-purple-100 rounded-full flex items-center justify-center text-6xl mb-4 border-4 border-purple-300 shadow-lg">
            {selectedAvatar}
          </div>
          <h3 className="font-bold text-gray-600 mb-3 text-lg">Choose Avatar</h3>
          <div className="grid grid-cols-7 gap-3 max-w-md">
            {avatarOptions.map((avatar) => (
              <button
                key={avatar}
                onClick={() => setSelectedAvatar(avatar)}
                className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl transition-all border-4 ${
                  selectedAvatar === avatar
                    ? 'bg-purple-200 border-purple-500 scale-110 shadow-lg'
                    : 'bg-gray-100 border-gray-200 hover:scale-105 hover:border-purple-300'
                }`}
              >
                {avatar}
              </button>
            ))}
          </div>
        </div>

        {/* Username Section */}
        <div className="bg-gray-50 rounded-2xl p-6 mb-6">
          <h3 className="font-bold text-gray-600 mb-3 text-sm uppercase">Username</h3>
          {isEditing ? (
            <div className="space-y-3">
              <input
                type="text"
                value={newUsername}
                onChange={(e) => setNewUsername(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border-2 border-purple-300 font-bold text-lg focus:outline-none focus:border-purple-500"
                placeholder="Enter username"
                maxLength={20}
              />
              <div className="flex gap-2">
                <Button onClick={handleSave} variant="success" className="flex-1">
                  Save
                </Button>
                <Button
                  onClick={() => {
                    setNewUsername(username);
                    setIsEditing(false);
                  }}
                  variant="secondary"
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <span className="text-2xl font-black text-gray-800">{username}</span>
              <Button onClick={() => setIsEditing(true)} variant="primary" className="py-2 px-6">
                Edit
              </Button>
            </div>
          )}
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-purple-50 rounded-2xl p-6 text-center border-2 border-purple-100">
            <div className="text-4xl font-black text-purple-600 mb-2">{userProfile?.rank || 0}</div>
            <div className="text-sm font-bold text-gray-600 uppercase">Rank</div>
          </div>
          <div className="bg-yellow-50 rounded-2xl p-6 text-center border-2 border-yellow-100">
            <div className="text-4xl font-black text-yellow-600 mb-2">{userProfile?.totalStars || 0}</div>
            <div className="text-sm font-bold text-gray-600 uppercase">Total Stars</div>
          </div>
          <div className="bg-green-50 rounded-2xl p-6 text-center border-2 border-green-100">
            <div className="text-4xl font-black text-green-600 mb-2">{userProfile?.totalScore || 0}</div>
            <div className="text-sm font-bold text-gray-600 uppercase">Score</div>
          </div>
        </div>

        {/* Last Updated */}
        {userProfile?.lastUpdated && (
          <div className="text-center text-sm text-gray-500 mb-4">
            Last updated: {userProfile.lastUpdated}
          </div>
        )}

        {/* Logout Button */}
        <div className="flex justify-end">
          <Button onClick={onLogout} variant="danger" className="py-3 px-8">
            Logout
          </Button>
        </div>
      </div>
    </div>
  );
}
