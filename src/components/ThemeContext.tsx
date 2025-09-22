'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

type Theme = 'light' | 'dark' | 'darker';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  isDarker: boolean;
  isLight: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>('light');
  const isDarker = theme === 'darker';
  const isLight = theme === 'light';

  const toggleTheme = () => {
    if (theme === 'light') {
      setTheme('dark');
    } else if (theme === 'dark') {
      setTheme('darker');
    } else {
      setTheme('light');
    }
  };

  useEffect(() => {
    if (theme === 'light') {
      document.documentElement.classList.remove('dark');
      document.documentElement.removeAttribute('data-theme');
      console.log('Switching to light theme');
    } else {
      document.documentElement.classList.add('dark');
      
      if (theme === 'darker') {
        document.documentElement.setAttribute('data-theme', 'darker');
        console.log('Switching to darker theme');
      } else {
        document.documentElement.removeAttribute('data-theme');
        console.log('Switching to dark theme');
      }
    }
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, isDarker, isLight }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}