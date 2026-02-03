import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'success' | 'warning';
  fullWidth?: boolean;
}

export const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'primary', 
  fullWidth = false, 
  className = '', 
  ...props 
}) => {
  // 3D Button Styles: Bold colors, hard bottom shadow, translates down on click
  const baseStyles = "px-6 py-3 rounded-2xl font-extrabold transition-all duration-150 transform active:translate-y-1 active:shadow-none border-b-4 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed disabled:active:translate-y-0";
  
  const variants = {
    // Blue
    primary: "bg-blue-500 border-blue-700 text-white shadow-[0_4px_0_rgb(29,78,216)] hover:bg-blue-400 hover:border-blue-600",
    // Purple/Dark
    secondary: "bg-purple-800 border-purple-950 text-white shadow-[0_4px_0_rgb(59,7,100)] hover:bg-purple-700 hover:border-purple-900",
    // Red
    danger: "bg-red-500 border-red-700 text-white shadow-[0_4px_0_rgb(185,28,28)] hover:bg-red-400 hover:border-red-600",
    // Green
    success: "bg-green-500 border-green-700 text-white shadow-[0_4px_0_rgb(21,128,61)] hover:bg-green-400 hover:border-green-600",
    // Yellow
    warning: "bg-yellow-400 border-yellow-600 text-yellow-900 shadow-[0_4px_0_rgb(202,138,4)] hover:bg-yellow-300 hover:border-yellow-500",
  };

  return (
    <button 
      className={`${baseStyles} ${variants[variant]} ${fullWidth ? 'w-full' : ''} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};