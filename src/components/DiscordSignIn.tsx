'use client';

import { useState } from 'react';
import { FaDiscord } from 'react-icons/fa6';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useRouter } from 'next/navigation';
import type { Database } from '@/types/supabase';

export default function DiscordSignIn() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createClientComponentClient<Database>({
    cookieOptions: {
      path: '/',
      domain: process.env.NODE_ENV === 'production' ? '.onagui.com' : undefined,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
    }
  });

  const handleSignIn = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'discord',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) {
        throw error;
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'An error occurred during Discord sign-in';
      setError(errorMessage);
      console.error('Discord sign-in error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      {error && (
        <div className="mb-4 p-3 bg-red-500/20 border border-red-500 rounded-md text-red-200">
          {error}
        </div>
      )}
      
      <button
        onClick={handleSignIn}
        disabled={isLoading}
        className="w-full flex items-center justify-center gap-2 py-2 px-4 bg-[#5865F2] hover:bg-[#4752C4] text-white rounded-md transition-colors"
      >
        <FaDiscord className="text-xl" />
        <span>{isLoading ? 'Connecting...' : 'Continue with Discord'}</span>
      </button>
    </div>
  );
}