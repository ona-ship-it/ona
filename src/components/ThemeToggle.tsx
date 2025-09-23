'use client';

import React from 'react';
import { useTheme } from './ThemeContext';

export default function ThemeToggle() {
  const { theme, toggleTheme, isDarker } = useTheme();
  
  return (
    <div 
      onClick={toggleTheme}
      className="bg-purple-600 p-1.5 rounded-full shadow hover:shadow-purple-500/50 transition-all cursor-pointer"
      style={{ backgroundColor: isDarker ? '#3a0066' : '#9333ea' }}
      aria-label="Toggle dark mode"
    >
      {!isDarker ? (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-purple-100" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
        </svg>
      ) : (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-purple-100" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      )}
    </div>
  );
}