'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

interface WalletServicesContextType {
  isInitialized: boolean;
  isLoading: boolean;
  error: string | null;
  retryInitialization: () => void;
}

const WalletServicesContext = createContext<WalletServicesContextType | undefined>(undefined);

export function useWalletServices() {
  const context = useContext(WalletServicesContext);
  if (context === undefined) {
    throw new Error('useWalletServices must be used within a WalletServicesProvider');
  }
  return context;
}

interface WalletServicesProviderProps {
  children: React.ReactNode;
}

export function WalletServicesProvider({ children }: WalletServicesProviderProps) {
  const [isInitialized, setIsInitialized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const checkWalletServices = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Check if wallet services are running via health endpoint
      const response = await fetch('/api/system/health');
      
      if (response.ok) {
        const healthData = await response.json();
        
        // Consider services initialized if they're healthy or in warning state (starting up)
        const isHealthy = healthData.overall === 'healthy';
        const isStartingUp = healthData.overall === 'warning';
        
        setIsInitialized(isHealthy);
        
        if (isStartingUp) {
          setError(healthData.message || 'Wallet services are starting up...');
        } else if (healthData.overall === 'critical') {
          setError(healthData.error || 'Wallet services are experiencing critical issues');
        }
      } else {
        setIsInitialized(false);
        setError(`Wallet services are not responding (HTTP ${response.status})`);
      }
    } catch (err) {
      console.error('Error checking wallet services:', err);
      setIsInitialized(false);
      setError('Failed to connect to wallet services - check if the server is running');
    } finally {
      setIsLoading(false);
    }
  };

  const retryInitialization = () => {
    checkWalletServices();
  };

  useEffect(() => {
    // Only run on client side
    if (typeof window !== 'undefined') {
      checkWalletServices();
      
      // Check periodically
      const interval = setInterval(checkWalletServices, 30000);
      return () => clearInterval(interval);
    }
  }, []);

  const value: WalletServicesContextType = {
    isInitialized,
    isLoading,
    error,
    retryInitialization,
  };

  return (
    <WalletServicesContext.Provider value={value}>
      {children}
    </WalletServicesContext.Provider>
  );
}

export default WalletServicesProvider;