'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useTheme } from './ThemeContext';
import ThemeToggle from './ThemeToggle';
import OnaguiLogo from './OnaguiLogo';
import AuthButtons from './AuthButtons';

export default function Navigation() {
  const { isWhite, isDarker } = useTheme();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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
            <AuthButtons />
            
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