import React from 'react';
import { useTheme } from './ThemeContext';

interface OnaguiLogoProps {
  className?: string;
}

export default function OnaguiLogo({ className = '' }: OnaguiLogoProps) {
  const { theme } = useTheme();
  const isLight = theme === 'light';
  
  return (
    <h1 className={`flex items-center ${className}`}>
      <span 
        className={`text-2xl uppercase font-light ${isLight ? 'text-gray-800' : 'text-gray-100'} whitespace-nowrap transition-all duration-300 ${isLight ? 'hover:text-purple-700' : 'hover:text-purple-300'}`} 
        style={{ 
          textShadow: isLight ? '0 0 10px rgba(0, 0, 0, 0.2)' : '0 0 10px rgba(255, 255, 255, 0.3)',
          letterSpacing: '0.15em'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.textShadow = '0 0 15px rgba(168, 85, 247, 0.8)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.textShadow = isLight 
            ? '0 0 10px rgba(0, 0, 0, 0.2)' 
            : '0 0 10px rgba(255, 255, 255, 0.3)';
        }}
      >
        ON<span style={{ display: 'inline-block', transform: 'rotate(180deg) scaleX(-1)', verticalAlign: 'text-top', marginTop: '-4px' }}>V</span>GUI
      </span>
    </h1>
  );
}