'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

type Theme = 'dark' | 'darker';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  isDarker: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>('dark');
  const isDarker = theme === 'darker';

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'darker' : 'dark');
  };

  useEffect(() => {
    // Toggle between dark and darker themes
    document.documentElement.classList.add('dark');
    
    if (theme === 'darker') {
      document.documentElement.setAttribute('data-theme', 'darker');
      console.log('Switching to darker theme');
    } else {
      document.documentElement.removeAttribute('data-theme');
      console.log('Switching to dark theme');
    }
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, isDarker }}>
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