import React from 'react';
import { useNavigate } from 'react-router-dom';
import { CATEGORIES } from '../../constants';
import { UserProgress } from '../../types';
import { type User as FirebaseUser } from '../../services/firebase';
import { Navbar } from '../../components/Navbar';

interface CategoriesProps {
  userProgress: UserProgress;
  user: FirebaseUser | null;
  onLogout?: () => void;
}

export default function Categories({ userProgress, user, onLogout }: CategoriesProps) {
  const navigate = useNavigate();

  const handleSelectCategory = (categoryId: string) => {
    navigate(`/category/${categoryId}`);
  };

  const totalStars = Object.values(userProgress.stars).reduce((a: number, b: number) => a + b, 0);

  return (
    // พื้นหลังสีแดงอมส้มเหมือนในรูป
    <div className="min-h-screen bg-[#ef4848] flex items-center justify-center p-4 font-sans">
      
      {/* การ์ดหลักสีครีม */}
      <div className="relative bg-[#FFF9F0] w-full max-w-7xl aspect-[16/10] md:aspect-video rounded-[3rem] border-2 border-black shadow-2xl p-8 md:p-12 overflow-hidden">
        
        <Navbar 
          totalStars={totalStars}
          user={user}
          onLogout={onLogout}
        />

        {/* Grid เมนู */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-10">
          
          {CATEGORIES.map((cat) => (
            <MenuCard
              key={cat.id}
              icon={cat.icon}
              title={cat.thaiTitle}
              onClick={() => handleSelectCategory(cat.id)}
            />
          ))}

        </div>
      </div>
    </div>
  );
}

// Component ย่อยสำหรับการ์ดเมนู
interface MenuCardProps {
  icon: string;
  title: string;
  onClick: () => void;
}

const MenuCard = ({ icon, title, onClick }: MenuCardProps) => {
  return (
    <button 
      onClick={onClick}
      className="
        relative w-full h-40 md:h-48 rounded-[2rem] 
        flex items-center justify-start px-8 gap-6
        bg-[#FACC15] shadow-[8px_5px_0_#F472B6]
        transition-all duration-150 ease-in-out
        active:translate-x-2 active:shadow-none
        hover:brightness-105 border-2 border-transparent hover:border-white/20
      "
    >
      {/* Icon วงกลมหรือรูปภาพ */}
      <div className="transform scale-150 md:scale-[2.0]">
        {icon}
      </div>
      
      {/* Text */}
      <span className="text-2xl md:text-3xl font-bold text-gray-800 tracking-wide text-left">
        {title}
      </span>
    </button>
  );
};
