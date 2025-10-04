'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useTheme } from './ThemeContext';

export default function SideNavbar() {
  const { isDarker, isWhite } = useTheme();
  
  const navItems = [
    { name: 'Home', icon: '🏠', href: '/' },
    { name: 'My Account', icon: '👑', href: '/account' },
    { name: 'Wallet', icon: '💳', href: '/wallet' },
    { name: 'Notifications', icon: '🔔', href: '/notifications' },
    { name: 'Gifts', icon: '🎁', href: '/gifts' },
    { name: 'Raffles', icon: '🎟️', href: '/raffles' },
    { name: 'Marketplace', icon: '🛒', href: '/marketplace' },
    { name: 'Settings', icon: '⚙️', href: '/settings' },
  ];

  return (
    <aside className={`fixed left-0 top-0 z-40 h-screen w-16 pt-16 ${isWhite ? 'bg-gray-100/90 border-r border-gray-200' : 'bg-[#1a1a1a]/95 border-r border-[#2a2a2a]'}`}>
      <div className="flex h-full flex-col items-center space-y-4 py-6">
        {navItems.map((item) => (
          <Link
            key={item.name}
            href={item.href}
            className={`group flex w-12 h-12 flex-col items-center justify-center rounded-lg ${
              isWhite 
                ? 'bg-white/80 hover:bg-green-100 hover:shadow-[0_0_10px_rgba(0,231,1,0.3)]' 
                : 'bg-[#2a2a2a]/80 hover:bg-[#333333] hover:shadow-[0_0_10px_rgba(0,231,1,0.3)]'
            } transition-all duration-200`}
          >
            <span className="text-xl">{item.icon}</span>
            <span className={`absolute left-16 scale-0 rounded ${
              isWhite 
                ? 'bg-white text-[#00e701] shadow-md' 
                : 'bg-[#2a2a2a] text-white'
            } p-2 text-xs group-hover:scale-100 transition-all duration-200 origin-left`}>
              {item.name}
            </span>
          </Link>
        ))}
      </div>
    </aside>
  );
}