'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useTheme } from './ThemeContext';
import ThemeToggle from './ThemeToggle';
import OnaguiLogo from './OnaguiLogo';
// Removed AuthButtons; account actions move to sidebar/settings
import ProfilePopup from './ProfilePopup';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { Loader2 } from 'lucide-react';

export default function Navigation() {
  const { isWhite, isDarker } = useTheme();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const { user, loading, supabase } = useAuth();
  const router = useRouter();

  useEffect(() => {
    console.debug('[NAV] auth state changed:', {
      loading,
      user: user ? { id: user.id, email: user.email } : user,
    });
  }, [loading, user]);

  useEffect(() => {
    // derive avatar URL from user metadata when available
    const meta = (user?.user_metadata || {}) as Record<string, any>;
    const googleAvatar = meta.picture || meta.avatar_url || meta.picture_url;
    let providerAvatar = googleAvatar || null;
    if (providerAvatar && typeof providerAvatar === 'string' && providerAvatar.includes('googleusercontent.com')) {
      providerAvatar = `/api/proxy-image?url=${encodeURIComponent(providerAvatar)}`;
    }
    setAvatarUrl(user ? (providerAvatar || '/default-avatar.svg') : null);
  }, [user]);

  return (
    <nav className={`sticky top-0 z-50 ${
      isWhite 
        ? 'bg-white/80 backdrop-blur-md border-b border-gray-200' 
        : isDarker 
          ? 'bg-[#0a0015]/80 backdrop-blur-md border-b border-gray-800' 
          : 'bg-[#1a0033]/80 backdrop-blur-md border-b border-[#2a0044]'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/">
              <OnaguiLogo />
            </Link>
          </div>
          
          {/* Desktop Navigation */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-4">
              <Link href="/fundraise" prefetch={false} className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                isWhite ? 'text-gray-700 hover:text-purple-600' : 'text-gray-300 hover:text-purple-400'
              }`}>
                Fundraise
              </Link>
              <Link href="/giveaways" prefetch={false} className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                isWhite ? 'text-gray-700 hover:text-purple-600' : 'text-gray-300 hover:text-purple-400'
              }`}>
                Giveaways
              </Link>
              <Link href="/raffles" prefetch={false} className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                isWhite ? 'text-gray-700 hover:text-purple-600' : 'text-gray-300 hover:text-purple-400'
              }`}>
                Raffles
              </Link>
              <Link href="/marketplace" prefetch={false} className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                isWhite ? 'text-gray-700 hover:text-purple-600' : 'text-gray-300 hover:text-purple-400'
              }`}>
                Marketplace
              </Link>
              <Link 
                href="/profile"
                prefetch={false}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors relative ${
                  isWhite ? 'text-gray-700 hover:text-purple-600' : 'text-gray-300 hover:text-purple-400'
                }`}
              >
                Profile
              </Link>
            </div>
          </div>

          {/* Search Bar */}
          <div className="hidden md:block flex-1 max-w-md mx-8">
            <div className="relative">
              <input
                type="text"
                placeholder="Search..."
                className={`w-full px-4 py-2 rounded-lg border ${
                  isWhite 
                    ? 'bg-white border-gray-300 text-gray-900 placeholder-gray-500' 
                    : 'bg-gray-800 border-gray-600 text-white placeholder-gray-400'
                } focus:outline-none focus:ring-2 focus:ring-purple-500`}
              />
              <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>
          </div>

          {/* Right side controls */}
          <div className="flex items-center space-x-4">
            <ThemeToggle />
            {/* Loading spinner while session resolves */}
            {loading && (
              <Loader2 className={isWhite ? 'text-gray-700 animate-spin' : 'text-gray-300 animate-spin'} />
            )}
            {/* Sign In CTA when signed out */}
            {!loading && !user && (
              <Link
                href="/signin"
                className={`px-4 py-2 rounded-full text-sm font-semibold transition-all duration-200 shadow-sm ${
                  isWhite
                    ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:shadow-md hover:brightness-105'
                    : 'bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:shadow-md hover:brightness-110'
                }`}
                prefetch={false}
                aria-label="Sign in to your account"
                title="Sign In"
              >
                Sign In
              </Link>
            )}
            {/* Notifications bell placeholder to match target UI */}
            {!loading && !!user && (
              <button
                aria-label="Notifications"
                className={`p-2 rounded-full ${isWhite ? 'text-gray-700 hover:text-purple-600' : 'text-gray-300 hover:text-purple-400'}`}
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
              </button>
            )}
            {/* Avatar when signed in */}
            {!loading && !!user && (
              <button
                onClick={() => router.push('/profile')}
                className={`w-9 h-9 rounded-full overflow-hidden border transition-all duration-200 ${
                  isWhite
                    ? 'border-gray-300 ring-2 ring-purple-500/40 hover:ring-purple-500'
                    : 'border-[#2a0044] ring-2 ring-purple-400/40 hover:ring-purple-400'
                } focus:outline-none focus:ring-2 focus:ring-purple-500`}
                aria-label="Open profile"
                title="Profile"
              >
                <img src={avatarUrl || '/default-avatar.svg'} alt="avatar" className="w-full h-full object-cover" />
              </button>
            )}
            
            {/* Mobile menu button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 rounded-md text-gray-400 hover:text-white hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
            >
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
              <Link href="/fundraise" prefetch={false} className={`block px-3 py-2 rounded-md text-base font-medium ${
                isWhite ? 'text-gray-700 hover:text-purple-600' : 'text-gray-300 hover:text-purple-400'
              }`}>
                Fundraise
              </Link>
              <Link href="/giveaways" prefetch={false} className={`block px-3 py-2 rounded-md text-base font-medium ${
              isWhite ? 'text-gray-700 hover:text-purple-600' : 'text-gray-300 hover:text-purple-400'
            }`}>
              Giveaways
            </Link>
              <Link href="/raffles" prefetch={false} className={`block px-3 py-2 rounded-md text-base font-medium ${
                isWhite ? 'text-gray-700 hover:text-purple-600' : 'text-gray-300 hover:text-purple-400'
              }`}>
                Raffles
              </Link>
              <Link href="/marketplace" prefetch={false} className={`block px-3 py-2 rounded-md text-base font-medium ${
              isWhite ? 'text-gray-700 hover:text-purple-600' : 'text-gray-300 hover:text-purple-400'
            }`}>
              Marketplace
            </Link>
              <Link 
                href="/profile"
                prefetch={false}
                className={`block px-3 py-2 rounded-md text-base font-medium ${
                  isWhite ? 'text-gray-700 hover:text-purple-600' : 'text-gray-300 hover:text-purple-400'
                }`}
              >
                Profile
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}