'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useTheme } from './ThemeContext';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

interface ProfilePopupProps {
  isOpen: boolean;
  onClose: () => void;
}

type SupabaseUser = {
  id: string;
  email: string | null;
};

export default function ProfilePopup({ isOpen, onClose }: ProfilePopupProps) {
  const { isDarker, isWhite } = useTheme();
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const popupRef = useRef<HTMLDivElement>(null);
  const supabase = createClientComponentClient();

  useEffect(() => {
    // Fetch user data
    const getUser = async () => {
      const { data } = await supabase.auth.getUser();
      if (data?.user) {
        // Cast minimal fields used to avoid any
        setUser({ id: data.user.id, email: data.user.email ?? null });
        const meta = (data.user.user_metadata || {}) as Record<string, unknown>;
        const keys = ['avatar_url', 'picture', 'profile_image_url', 'image', 'image_url', 'photo'];
        for (const k of keys) {
          const v = (meta as any)[k];
          if (typeof v === 'string' && v.trim().length > 0) { setAvatarUrl(v as string); break; }
        }
      }
    };
    
    getUser();
  }, [supabase.auth]);

  useEffect(() => {
    // Close popup when clicking outside
    function handleClickOutside(event: MouseEvent) {
      if (popupRef.current && !popupRef.current.contains(event.target as Node)) {
        onClose();
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div 
      ref={popupRef}
      className={`absolute right-0 top-16 w-64 rounded-lg shadow-lg z-50 ${
        isWhite 
          ? 'bg-white border border-gray-200' 
          : isDarker 
            ? 'bg-[#0a0015] border border-gray-800' 
            : 'bg-[#1a0033] border border-[#2a0044]'
      }`}
    >
      <div className="p-4">
        <div className="flex items-center space-x-3 mb-4">
          {avatarUrl ? (
            <img src={avatarUrl} alt={user?.email || 'User avatar'} className="h-12 w-12 rounded-full object-cover border border-gray-700" />
          ) : (
            <div className="h-12 w-12 rounded-full bg-purple-100 flex items-center justify-center text-purple-500 text-xl font-bold">
              {user?.email?.charAt(0)?.toUpperCase() || '?'}
            </div>
          )}
          <div>
            <div className={`font-medium ${isWhite ? 'text-gray-900' : 'text-white'}`}>
              {user?.email || 'sa***@gmail.com'}
            </div>
            <div className={`text-sm ${isWhite ? 'text-gray-500' : 'text-gray-400'}`}>
              Regular User
            </div>
          </div>
        </div>

        <div className="flex mb-2">
          <div className={`mr-2 px-3 py-1 text-xs rounded-full ${
            isWhite 
              ? 'bg-green-100 text-green-800' 
              : 'bg-green-900 bg-opacity-30 text-green-400'
          }`}>
            Verified
          </div>
          <div className={`px-3 py-1 text-xs rounded-full ${
            isWhite 
              ? 'bg-gray-100 text-gray-800' 
              : 'bg-gray-800 text-gray-300'
          }`}>
            Link X
          </div>
        </div>
      </div>

      <div className="border-t border-gray-700">
        <nav>
          {[
            { name: 'Dashboard', icon: '⊞', href: '/dashboard' },
            { name: 'Assets', icon: '💳', href: '/assets' },
            { name: 'Orders', icon: '📋', href: '/orders' },
            { name: 'Account', icon: '👤', href: '/account' },
            { name: 'Referral', icon: '👥', href: '/referral' },
            { name: 'Rewards Hub', icon: '🎟️', href: '/rewards' },
            { name: 'Settings', icon: '⚙️', href: '/settings' },
          ].map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center px-4 py-3 ${
                isWhite 
                  ? 'hover:bg-gray-50 text-gray-700' 
                  : 'hover:bg-gray-800 text-gray-300'
              }`}
              onClick={onClose}
            >
              <span className="mr-3 text-xl">{item.icon}</span>
              <span>{item.name}</span>
            </Link>
          ))}
        </nav>
      </div>

      <div className={`p-4 border-t ${isWhite ? 'border-gray-200' : 'border-gray-700'}`}>
        <button
          onClick={async () => {
            await supabase.auth.signOut();
            onClose();
            window.location.href = '/';
          }}
          className={`w-full py-2 px-4 rounded ${
            isWhite 
              ? 'bg-red-100 text-red-700 hover:bg-red-200' 
              : 'bg-red-900 bg-opacity-20 text-red-400 hover:bg-opacity-30'
          } transition-colors`}
        >
          Sign Out
        </button>
      </div>
    </div>
  );
}