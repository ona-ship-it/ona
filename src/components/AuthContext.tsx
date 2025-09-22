"use client";

import React, { createContext, useState, useContext, useEffect } from 'react';
import WalletService from '../services/WalletService';

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  login: () => void;
  logout: () => void;
}

interface User {
  name: string;
  email: string;
  profilePicture?: string;
  wallet?: {
    crypto: {
      id: string;
      currency: string;
      symbol: string;
      amount: string;
      value: string;
      address: string;
    }[];
    fiat: {
      id: string;
      currency: string;
      symbol: string;
      amount: string;
    }[];
  };
}

const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  user: null,
  login: () => {},
  logout: () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  // Check if user is already logged in
  useEffect(() => {
    const storedUser = localStorage.getItem('onagui_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
      setIsAuthenticated(true);
    }
  }, []);

  const login = () => {
    // Mock login - in a real app, this would use Google Auth
    const userId = `user_${Math.random().toString(36).substring(2, 15)}`;
    
    // Check if user already has a wallet
    let userWallet = WalletService.getWallet(userId);
    
    // If no wallet exists, generate one
    if (!userWallet) {
      userWallet = WalletService.generateWallet(userId);
      WalletService.saveWallet(userWallet);
    }
    
    // Format wallet for display (removes private keys)
    const displayWallet = WalletService.formatWalletForDisplay(userWallet);
    
    const mockUser = {
      name: 'samira eddaoudi',
      email: 'samiraeddaoudi88@gmail.com',
      profilePicture: 'https://lh3.googleusercontent.com/a/default-user',
      wallet: displayWallet
    };
    
    setUser(mockUser);
    setIsAuthenticated(true);
    localStorage.setItem('onagui_user', JSON.stringify(mockUser));
  };

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('onagui_user');
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;