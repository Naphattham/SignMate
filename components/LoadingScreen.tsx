import React from 'react';
import './LoadingScreen.css';
import logo from '/src/assets/images/LOGO_SignMate.png';

const LoadingScreen: React.FC = () => {
  return (
    // Container หลัก (พื้นหลังสีแดง)
    <div className="min-h-screen bg-[#ef4848] flex items-center justify-center p-4 font-sans">
      {/* การ์ดหลักสีครีม */}
      <div className="relative bg-[#FFF9F0] w-full max-w-7xl aspect-[16/10] md:aspect-video rounded-[3rem] border-2 border-black shadow-2xl p-8 md:p-12 overflow-hidden">
        <div className="loading-container">
          {/* 1. Logo Section */}
          <div className="logo-box">
            <img 
              src={logo} 
              alt="Sign Mate Logo" 
              className="logo-image" 
            />
          </div>

          {/* 2. Title: SignMate */}
          <div className="title-container">
            <div className="text-sign">Sign</div>
            <div className="text-mate">Mate</div>
          </div>

          {/* 3. Loading Text */}
          <div className="loading-text">loading...</div>

          {/* 4. Progress Bar */}
          <div className="progress-container">
            <div className="progress-fill"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoadingScreen;
