'use client';

import { useState } from 'react';
import { FaXTwitter } from 'react-icons/fa6';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useRouter } from 'next/navigation';

export default function XSignIn() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createClientComponentClient();

  const handleSignIn = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'twitter',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) {
        throw error;
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'An error occurred during X sign-in';
      setError(errorMessage);
      console.error('X sign-in error:', error);
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
        className="w-full flex items-center justify-center gap-2 py-2 px-4 bg-black hover:bg-gray-800 text-white rounded-md transition-colors"
      >
        <FaXTwitter className="text-xl" />
        <span>{loading ? 'Connecting...' : 'Continue with X'}</span>
      </button>
    </div>
  );
}