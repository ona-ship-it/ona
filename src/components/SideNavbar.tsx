'use client';

import Link from 'next/link';
import { useTheme } from './ThemeContext';
import { usePathname } from 'next/navigation';

export default function SideNavbar() {
  const { isDarker } = useTheme();
  const pathname = usePathname();
  
  return (
    <div className={`fixed left-0 top-0 h-full w-16 flex flex-col items-center py-4 z-50 bg-gray-950 border-r border-gray-800`}>
      {/* Logo at the top */}
      <Link href="/" className="mb-4">
        <div className="w-10 h-10 rounded-md bg-[#0f0f0f] flex items-center justify-center">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2L20 7V17L12 22L4 17V7L12 2Z" fill="url(#gradient)" stroke="url(#gradient)" strokeWidth="1" />
            <defs>
              <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#9333ea" />
                <stop offset="100%" stopColor="#2563eb" />
              </linearGradient>
            </defs>
          </svg>
        </div>
      </Link>
      
      {/* My Account Icon */}
      <Link href="/my-account" className="mb-4">
        <div className={`w-10 h-10 flex items-center justify-center rounded-md transition-all duration-200 ${
          pathname === '/my-account' 
            ? 'bg-[#0f0f0f]' 
            : 'text-gray-400 hover:bg-[#0f0f0f]'
        }`}
        style={{
          color: pathname === '/my-account' 
            ? 'white' 
            : undefined,
          backgroundImage: pathname === '/my-account' 
            ? 'linear-gradient(to right, #9333ea, #2563eb)' 
            : undefined,
          boxShadow: pathname === '/my-account' 
            ? '0 0 15px 2px rgba(147, 51, 234, 0.5)' 
            : undefined
        }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M20 21V19C20 17.9391 19.5786 16.9217 18.8284 16.1716C18.0783 15.4214 17.0609 15 16 15H8C6.93913 15 5.92172 15.4214 5.17157 16.1716C4.42143 16.9217 4 17.9391 4 19V21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <circle cx="12" cy="7" r="4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
      </Link>
      
      {/* Navigation Icons */}
      <div className="flex flex-col items-center space-y-6 mt-2">
        {/* Home/Dashboard */}
        <NavItem 
          href="/" 
          isActive={pathname === '/'} 
          icon={
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M3 9L12 2L21 9V20C21 20.5304 20.7893 21.0391 20.4142 21.4142C20.0391 21.7893 19.5304 22 19 22H5C4.46957 22 3.96086 21.7893 3.58579 21.4142C3.21071 21.0391 3 20.5304 3 20V9Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M9 22V12H15V22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          } 
        />
        
        {/* Cards/Games */}
        <NavItem 
          href="/raffles" 
          isActive={pathname === '/raffles'} 
          icon={
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="3" y="5" width="18" height="14" rx="2" stroke="currentColor" strokeWidth="2"/>
              <path d="M7 9H9" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              <path d="M15 15H17" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              <path d="M7 15H9" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              <path d="M15 9H17" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          } 
        />
        
        {/* Sports */}
        <NavItem 
          href="/giveaways" 
          isActive={pathname === '/giveaways'} 
          icon={
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2"/>
              <path d="M12 3C14.5 5.5 15 8.5 15 12C15 15.5 14.5 18.5 12 21" stroke="currentColor" strokeWidth="2"/>
              <path d="M12 3C9.5 5.5 9 8.5 9 12C9 15.5 9.5 18.5 12 21" stroke="currentColor" strokeWidth="2"/>
              <path d="M3 12H21" stroke="currentColor" strokeWidth="2"/>
            </svg>
          } 
        />
        
        {/* Tickets/Lottery */}
        <NavItem 
          href="/fundraise" 
          isActive={pathname === '/fundraise'} 
          icon={
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M4 4H20V16C20 16.5304 19.7893 17.0391 19.4142 17.4142C19.0391 17.7893 18.5304 18 18 18H6C5.46957 18 4.96086 17.7893 4.58579 17.4142C4.21071 17.0391 4 16.5304 4 16V4Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M4 8H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              <path d="M8 12H16" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              <path d="M8 15H13" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          } 
        />
        
        {/* Charts/Analytics */}
        <NavItem 
          href="/marketplace" 
          isActive={pathname === '/marketplace'} 
          icon={
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M3 3V21H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M7 14L11 10L15 14L21 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          } 
        />
      </div>
    </div>
  );
}

// Navigation Item Component
function NavItem({ href, icon, isActive }: { href: string; icon: React.ReactNode; isActive: boolean }) {
  return (
    <Link 
      href={href} 
      className={`w-10 h-10 flex items-center justify-center rounded-md transition-all duration-200 ${
        isActive 
          ? 'bg-[#0f0f0f]' 
          : 'text-gray-400 hover:bg-[#0f0f0f]'
      }`}
      style={{
        color: isActive 
          ? 'white' 
          : undefined,
        backgroundImage: isActive 
          ? 'linear-gradient(to right, #9333ea, #2563eb)' 
          : undefined,
        boxShadow: isActive 
          ? '0 0 15px 2px rgba(147, 51, 234, 0.5)' 
          : undefined
      }}
    >
      {icon}
    </Link>
  );
}