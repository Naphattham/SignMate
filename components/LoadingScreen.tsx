import React from 'react';
import './LoadingScreen.css';
import logo from '/src/assets/images/LOGO_SignMate.png';

const LoadingScreen: React.FC = () => {
  return (
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
  );
};

export default LoadingScreen;
