import React from 'react';
import { useNavigate } from 'react-router-dom';
import { LandingPage } from '../../components/LandingPage';
import { type User } from '../../services/firebase';

interface HomeProps {
  user: User | null;
}

export default function Home({ user }: HomeProps) {
  const navigate = useNavigate();

  const handleStart = () => {
    if (user) {
      navigate('/categories');
    } else {
      navigate('/login');
    }
  };

  return (
    <LandingPage onStart={handleStart} isLoggedIn={!!user} />
  );
}
