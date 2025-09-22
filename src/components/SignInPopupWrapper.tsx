"use client";

import React, { useState, useEffect } from 'react';
import GoogleSignInPopup from './GoogleSignInPopup';
import { useAuth } from './AuthContext';
import { usePathname } from 'next/navigation';

const SignInPopupWrapper: React.FC = () => {
  const [showPopup, setShowPopup] = useState(false);
  const { isAuthenticated, login } = useAuth();
  const pathname = usePathname();
  
  // Only show on landing page (root path)
  const isLandingPage = pathname === '/';

  useEffect(() => {
    // Show popup only on landing page when user is not authenticated
    if (!isAuthenticated && isLandingPage) {
      // Small delay to ensure the popup doesn't appear immediately on page load
      const timer = setTimeout(() => {
        setShowPopup(true);
      }, 500);
      
      return () => clearTimeout(timer);
    }
  }, [isAuthenticated, isLandingPage]);

  const handleClose = () => {
    setShowPopup(false);
  };

  const handleSignIn = () => {
    login();
    setShowPopup(false);
  };

  if (!showPopup || isAuthenticated || !isLandingPage) return null;

  return (
    <GoogleSignInPopup 
      onClose={handleClose} 
      onSignIn={handleSignIn} 
    />
  );
};

export default SignInPopupWrapper;