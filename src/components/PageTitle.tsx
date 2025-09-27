'use client'

import React, { useState } from 'react';

interface PageTitleProps {
  children: React.ReactNode;
  className?: string;
  gradient?: boolean;
}

const PageTitle: React.FC<PageTitleProps> = ({ 
  children, 
  className = '', 
  gradient = false 
}) => {
  const [textShadow, setTextShadow] = useState('0 0 10px rgba(255, 255, 255, 0.3)');

  const handleMouseEnter = () => {
    setTextShadow('0 0 15px rgba(168, 85, 247, 0.5)');
  };

  const handleMouseLeave = () => {
    setTextShadow('0 0 10px rgba(255, 255, 255, 0.3)');
  };

  return (
    <h1 
      className={`
        ${gradient 
          ? 'bg-clip-text text-transparent bg-gradient-to-r from-purple-500 to-blue-500' 
          : 'text-gray-100'
        }
        font-light tracking-wider uppercase
        ${className}
      `}
    >
      {children}
    </h1>
  );
};

export default PageTitle;