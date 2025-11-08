'use client';

import { useState } from 'react';
import { FaXTwitter } from 'react-icons/fa6';
import { signInWithTwitter } from '@/lib/oauth-utils';

export default function XSignIn() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSignIn = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Get redirectTo parameter from URL if it exists
      const urlParams = new URLSearchParams(window.location.search);
      const redirectTo = urlParams.get('redirectTo');
      
      const result = await signInWithTwitter(redirectTo || '/');

      if (!result.success) {
        throw new Error(result.error || 'X sign-in failed');
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