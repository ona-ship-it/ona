'use client';

import { useState } from 'react';
import { FaDiscord } from 'react-icons/fa6';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useRouter } from 'next/navigation';

export default function DiscordSignIn() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createClientComponentClient();

  const handleSignIn = async () => {
    try {
      setLoading(true);
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
    } catch (error: any) {
      setError(error.message || 'An error occurred during Discord sign-in');
      console.error('Discord sign-in error:', error);
    } finally {
      setLoading(false);
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
        disabled={loading}
        className="w-full flex items-center justify-center gap-2 py-2 px-4 bg-[#5865F2] hover:bg-[#4752C4] text-white rounded-md transition-colors"
      >
        <FaDiscord className="text-xl" />
        <span>{loading ? 'Connecting...' : 'Continue with Discord'}</span>
      </button>
    </div>
  );
}