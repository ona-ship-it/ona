'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

type Theme = 'white' | 'dark' | 'darker';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  isDarker: boolean;
  isWhite: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const THEME_STORAGE_KEY = 'onagui-theme-preference';

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  // Initialize theme from localStorage if available, otherwise default to 'dark'
  const [theme, setTheme] = useState<Theme>('dark');
  const isDarker = theme === 'darker';
  const isWhite = theme === 'white';

  // Load saved theme from localStorage on initial render
  useEffect(() => {
    const savedTheme = localStorage.getItem(THEME_STORAGE_KEY) as Theme;
    if (savedTheme && (savedTheme === 'white' || savedTheme === 'dark' || savedTheme === 'darker')) {
      setTheme(savedTheme);
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'darker' : theme === 'darker' ? 'white' : 'dark';
    setTheme(newTheme);
    // Save to localStorage
    localStorage.setItem(THEME_STORAGE_KEY, newTheme);
  };

  useEffect(() => {
    if (theme === 'white') {
      document.documentElement.classList.remove('dark');
      document.documentElement.removeAttribute('data-theme');
      console.log('Switching to white theme');
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
    <ThemeContext.Provider value={{ theme, toggleTheme, isDarker, isWhite }}>
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