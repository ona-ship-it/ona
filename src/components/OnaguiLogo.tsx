import React from 'react';
import { useTheme } from './ThemeContext';

interface OnaguiLogoProps {
  className?: string;
}

export default function OnaguiLogo({ className = '' }: OnaguiLogoProps) {
  const { isWhite } = useTheme();
  
  return (
    <h1 className={`flex items-center ${className}`}>
      <span 
        className="text-2xl uppercase font-light dark:font-normal whitespace-nowrap transition-all duration-300 text-purple-900 dark:text-gray-100 hover:text-purple-700 dark:hover:text-purple-300"
        style={{ 
          textShadow: '0 2px 8px rgba(168, 85, 247, 0.3)',
          letterSpacing: '0.15em'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.textShadow = '0 4px 12px rgba(168, 85, 247, 0.6)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.textShadow = '0 2px 8px rgba(168, 85, 247, 0.3)';
        }}
      >
        ON<span style={{ display: 'inline-block', transform: 'rotate(180deg) scaleX(-1)', verticalAlign: 'text-top', marginTop: '-4px' }}>V</span>GUI
      </span>
    </h1>
  );
}