import React from 'react';
import { useNavigate } from 'react-router-dom';
import { LandingPage } from '../../components/LandingPage';
import { type User } from '../../services/firebase';

interface HomeProps {
  user: User | null;
  setIsPageLoading: (loading: boolean) => void;
}

export default function Home({ user, setIsPageLoading }: HomeProps) {
  const navigate = useNavigate();

  const handleStart = () => {
    // ถ้ายังไม่ได้ login ให้ไปหน้า login ทันที ไม่ต้องโหลด
    if (!user) {
      navigate('/login');
      return;
    }
    
    // ถ้า login แล้ว แสดง Loading 3 วินาที ตาม Animation
    setIsPageLoading(true);
    setTimeout(() => {
      navigate('/categories');
      setIsPageLoading(false);
    }, 3000);
  };

  return (
    <LandingPage onStart={handleStart} isLoggedIn={!!user} />
  );
}
