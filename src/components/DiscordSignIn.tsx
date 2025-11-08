'use client';

import { useState } from 'react';
import { FaDiscord } from 'react-icons/fa6';
import { signInWithDiscord } from '@/lib/oauth-utils';

export default function DiscordSignIn() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSignIn = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Get redirectTo parameter from URL if it exists
      const urlParams = new URLSearchParams(window.location.search);
      const redirectTo = urlParams.get('redirectTo');
      
      const result = await signInWithDiscord(redirectTo || '/');

      if (!result.success) {
        throw new Error(result.error || 'Discord sign-in failed');
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'An error occurred during Discord sign-in';
      setError(errorMessage);
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