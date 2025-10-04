import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface ThemeContextType {
  isDarker: boolean;
  isWhite: boolean;
  toggleTheme: () => void;
  setDarkerTheme: () => void;
  setWhiteTheme: () => void;
  setDefaultTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType>({
  isDarker: false,
  isWhite: false,
  toggleTheme: () => {},
  setDarkerTheme: () => {},
  setWhiteTheme: () => {},
  setDefaultTheme: () => {},
});

export const useTheme = () => useContext(ThemeContext);

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [isDarker, setIsDarker] = useState(false);
  const [isWhite, setIsWhite] = useState(false);

  useEffect(() => {
    // Check for saved theme preference
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'darker') {
      setIsDarker(true);
      setIsWhite(false);
    } else if (savedTheme === 'white') {
      setIsDarker(false);
      setIsWhite(true);
    } else {
      setIsDarker(false);
      setIsWhite(false);
    }
  }, []);

  const toggleTheme = () => {
    if (isDarker) {
      // From darker to white
      setIsDarker(false);
      setIsWhite(true);
      localStorage.setItem('theme', 'white');
    } else if (isWhite) {
      // From white to default
      setIsDarker(false);
      setIsWhite(false);
      localStorage.setItem('theme', 'default');
    } else {
      // From default to darker
      setIsDarker(true);
      setIsWhite(false);
      localStorage.setItem('theme', 'darker');
    }
  };

  const setDarkerTheme = () => {
    setIsDarker(true);
    setIsWhite(false);
    localStorage.setItem('theme', 'darker');
  };

  const setWhiteTheme = () => {
    setIsDarker(false);
    setIsWhite(true);
    localStorage.setItem('theme', 'white');
  };

  const setDefaultTheme = () => {
    setIsDarker(false);
    setIsWhite(false);
    localStorage.setItem('theme', 'default');
  };

  return (
    <ThemeContext.Provider
      value={{
        isDarker,
        isWhite,
        toggleTheme,
        setDarkerTheme,
        setWhiteTheme,
        setDefaultTheme,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export default ThemeContext;