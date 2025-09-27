'use client';

import { useState } from 'react';
import Link from 'next/link';
import ThemeToggle from './ThemeToggle';
import { useTheme } from './ThemeContext';
import OnaguiLogo from './OnaguiLogo';
import AuthButtons from './AuthButtons';

export default function Navigation() {
  const [isOpen, setIsOpen] = useState(false);
  const { isDarker, isWhite } = useTheme();
  
  return (
    <header className={`sticky top-0 z-50 w-full border-b backdrop-blur-sm ${isWhite ? 'bg-white/90 border-gray-200' : isDarker ? 'bg-[#0a0015]/75 border-gray-800' : 'bg-[#1a0033]/75 border-[#2a0044]'}`}>
      <nav className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Left section - Logo and main nav */}
        <div className="flex items-center">
          <Link href="/" className="flex items-center mr-6">
            <OnaguiLogo />
          </Link>
          <div className="hidden md:flex md:items-center md:space-x-6 whitespace-nowrap">
            <Link href="/fundraise" className={`flex items-center text-sm font-medium ${isWhite ? 'text-gray-700 hover:text-purple-800' : 'text-gray-200 hover:text-purple-400'} transition-colors duration-200`}>
              <span className="mr-1">🎯</span>
              Fundraise
            </Link>
            <Link href="/giveaways" className={`flex items-center text-sm font-medium ${isWhite ? 'text-gray-700 hover:text-green-700' : 'text-gray-200 hover:text-purple-400'} transition-colors duration-200`}>
              <span className="mr-1">🎁</span>
              Giveaways
            </Link>
            <Link href="/raffles" className={`flex items-center text-sm font-medium ${isWhite ? 'text-gray-700 hover:text-purple-800' : 'text-gray-200 hover:text-purple-400'} transition-colors duration-200`}>
              <span className="mr-1">🎲</span>
              Raffles
            </Link>
            <Link href="/marketplace" className={`flex items-center text-sm font-medium ${isWhite ? 'text-gray-700 hover:text-green-700' : 'text-gray-200 hover:text-purple-400'} transition-colors duration-200`}>
              <span className="mr-1">🛒</span>
              Marketplace
            </Link>
          </div>
        </div>
        {/* Right section - Search, Create, Sign in */}
        <div className="ml-auto flex items-center space-x-4">
          <div className="hidden md:block">
            <div className="relative group">
              <input
                type="text"
                placeholder="Search..."
                className="w-8 group-hover:w-64 rounded-full border border-gray-700 bg-gray-800 py-1.5 pl-8 pr-2 text-sm text-gray-300 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500 transition-all duration-300 ease-in-out"
              />
              <div className="absolute inset-y-0 left-0 flex items-center pl-2">
                <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>
          </div>
          <div className="flex items-center">
            <AuthButtons />
            <div className="ml-2">
              <ThemeToggle />
            </div>
          </div>
          <div className="flex md:hidden items-center">
            <div
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-white hover:bg-[#3a0066] focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white cursor-pointer"
              aria-expanded="false"
            >
              <span className="sr-only">Open main menu</span>
              {!isOpen ? (
                <svg className="block h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              ) : (
                <svg className="block h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile menu, show/hide based on menu state */}
      {isOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <Link href="/fundraise" className={`flex items-center block px-3 py-2 rounded-md text-base font-medium ${isWhite ? 'text-gray-700 hover:text-purple-800 hover:bg-gray-100' : 'text-gray-300 hover:text-white hover:bg-[#3a0066]'}`}>
              <span className="mr-2">🎯</span>
              Fundraise
            </Link>
            <Link href="/giveaways" className={`flex items-center block px-3 py-2 rounded-md text-base font-medium ${isWhite ? 'text-gray-700 hover:text-green-700 hover:bg-gray-100' : 'text-gray-300 hover:text-white hover:bg-[#3a0066]'}`}>
              <span className="mr-2">🎁</span>
              Giveaways
            </Link>
          <Link href="/raffles" className={`flex items-center block px-3 py-2 rounded-md text-base font-medium ${isWhite ? 'text-gray-700 hover:text-purple-800 hover:bg-gray-100' : 'text-gray-300 hover:text-white hover:bg-[#3a0066]'}`}>
            <span className="mr-2">🎲</span>
            Raffles
          </Link>
          <Link href="/marketplace" className={`flex items-center block px-3 py-2 rounded-md text-base font-medium ${isWhite ? 'text-gray-700 hover:text-green-700 hover:bg-gray-100' : 'text-gray-300 hover:text-white hover:bg-[#3a0066]'}`}>
            <span className="mr-2">🛒</span>
            Marketplace
          </Link>
        </div>
        <div className="pt-4 pb-3 border-t border-gray-700">
          <div className="flex items-center justify-between px-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-8 w-8 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z" />
                </svg>
              </div>
              <div className="ml-3">
                <div className="text-base font-medium text-white">Guest</div>
              </div>
            </div>
          </div>
          <div className="mt-3 px-2 space-y-1">
            <div className="px-3 py-2">
              <AuthButtons />
            </div>
          </div>
        </div>
      </div>
      )}
    </header>
  );
}