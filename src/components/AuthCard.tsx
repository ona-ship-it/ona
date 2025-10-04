'use client';

import React, { useState } from 'react';
import { FaGoogle } from 'react-icons/fa6';
import { FaPhone, FaTelegramPlane } from 'react-icons/fa';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { signInWithGoogle } from '@/utils/googleAuth';

// Dynamically import auth components to avoid SSR issues with Supabase client
const DiscordSignIn = dynamic(() => import('./DiscordSignIn'), { ssr: false });
const XSignIn = dynamic(() => import('./XSignIn'), { ssr: false });

interface AuthCardProps {
  title: string;
  isLogin?: boolean;
  onSelectMethod?: (method: 'google' | 'phone') => void;
}

export const AuthCard: React.FC<AuthCardProps> = ({ 
  title, 
  isLogin = false,
  onSelectMethod 
}) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    await signInWithGoogle();
    // No need to handle the response as the OAuth flow will redirect the user
    setIsLoading(false);
  };

  return (
    <div className="w-full max-w-md p-8 space-y-6 bg-gray-900 rounded-lg shadow-xl">
      <h2 className="text-3xl font-bold text-center text-pink-500">{title}</h2>
      
      <div className="space-y-4">
        <button 
          className="flex items-center justify-center w-full p-3 space-x-3 bg-white rounded-md hover:bg-gray-100 transition"
          onClick={handleGoogleSignIn}
          disabled={isLoading}
        >
          <FaGoogle className="text-xl text-red-500" />
          <span className="text-gray-800 font-medium">{isLoading ? 'Signing in...' : 'Continue with Google'}</span>
        </button>
        
        <button 
          className="flex items-center justify-center w-full p-3 space-x-3 bg-white rounded-md hover:bg-gray-100 transition"
          onClick={() => onSelectMethod && onSelectMethod('phone')}
        >
          <FaPhone className="text-xl text-blue-500" />
          <span className="text-gray-800 font-medium">Continue with Phone</span>
        </button>
        
        <div className="w-full">
          <XSignIn />
        </div>
        
        <div className="w-full">
          <DiscordSignIn />
        </div>
        
        <button className="flex items-center justify-center w-full p-3 space-x-3 bg-white rounded-md hover:bg-gray-100 transition">
          <FaTelegramPlane className="text-xl text-blue-500" />
          <span className="text-gray-800 font-medium">Continue with Telegram</span>
        </button>
      </div>
      
      <div className="text-center text-white">
        {isLogin ? (
          <p>
            Don't have an account?{' '}
            <Link href="/signup" className="text-pink-400 hover:underline">
              Sign Up
            </Link>
          </p>
        ) : (
          <p>
            Already have an account?{' '}
            <Link href="/login" className="text-pink-400 hover:underline">
              Sign In
            </Link>
          </p>
        )}
      </div>
    </div>
  );
};

export default AuthCard;